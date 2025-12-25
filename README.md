# WireGuardApp "Golden Path" Setup Guide

This guide provides a robust, error-proof walkthrough for setting up the WireGuardApp on a new machine. It incorporates fixes for common build errors (NDK versions, signature mismatches) encountered during development.

## 0. Prerequisites (Strict)
Ensure these are installed and configured **before** starting:
- **Node.js**: LTS version (e.g., v18+ or v20+).
- **JDK**: Version 17 or 21 (Required for modern Android Gradle plugins).
- **Android Studio**: Latest Stable.
- **Android SDK & NDK**: 
  - Install standard SDK platforms.
  - **IMPORTANT**: Install NDK version `27.1.12297006` (or matching the config below) via SDK Manager.

## 1. Project Initialization
```bash
npx create-expo-app WireGuardApp
cd WireGuardApp
```

## 2. Install Dependencies
```bash
npm install @react-navigation/native @react-navigation/stack react-native-safe-area-context react-native-reanimated
npm install nativewind tailwindcss
npx tailwindcss init
npm install expo-status-bar
```

## 3. Prebuild for Native Code
```bash
npx expo prebuild --platform android
```

## 4. Native Module Setup (Critical Step)
This step involves creating Kotlin files. **Copy the code exactly** to avoid signature mismatch errors that cause build failures.

### 4.1 Create `WireGuardModule.kt`
Path: `android/app/src/main/java/com/wireguardapp/WireGuardModule.kt`

> [!IMPORTANT]
> ensuring `onActivityResult` has the signature `activity: Activity` (not `Activity?`) is critical.

```kotlin
package com.wireguardapp

import android.app.Activity
import android.content.Intent
import android.net.VpnService
import android.util.Log
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.wireguard.android.backend.BackendException
import com.wireguard.android.backend.GoBackend
import com.wireguard.android.backend.Tunnel
import com.wireguard.config.Config
import java.io.ByteArrayInputStream
import java.nio.charset.StandardCharsets

class WireGuardModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var backend: GoBackend? = null
    private var pendingPromise: Promise? = null
    private var pendingName: String? = null
    private var pendingConfig: String? = null

    companion object {
        private const val REQUEST_CODE_VPN_PERMISSION = 1001
    }

    private val activityEventListener: ActivityEventListener = object : BaseActivityEventListener() {
        // ERROR PREVENTION: explicitly use 'Activity' (non-null), not 'Activity?'.
        override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
            if (requestCode == REQUEST_CODE_VPN_PERMISSION) {
                if (resultCode == Activity.RESULT_OK) {
                    val name = pendingName
                    val config = pendingConfig
                    val promise = pendingPromise
                    if (name != null && config != null && promise != null) {
                        Log.d("WireGuardModule", "VPN permission granted, retrying connection...")
                        connect(name, config, promise)
                    } else {
                         Log.e("WireGuardModule", "VPN permission granted but pending data is missing")
                        pendingPromise?.reject("ERROR", "Lost pending connection data")
                    }
                } else {
                    Log.e("WireGuardModule", "VPN permission denied")
                    pendingPromise?.reject("PERMISSION_DENIED", "VPN permission denied by user")
                }
                // Cleanup
                pendingPromise = null
                pendingName = null
                pendingConfig = null
            }
        }
    }

    init {
        reactContext.addActivityEventListener(activityEventListener)
        initializeBackend()
    }

    private fun initializeBackend() {
        if (backend != null) return
        try {
            backend = GoBackend(reactContext)
            Log.d("WireGuardModule", "Backend initialized successfully")
        } catch (e: Exception) {
            Log.e("WireGuardModule", "Error initializing backend", e)
        }
    }

    override fun getName(): String {
        return "WireGuardModule"
    }

    class WgTunnel(private val name: String) : Tunnel {
        override fun getName() = name
        override fun onStateChange(newState: Tunnel.State) {
            Log.d("WireGuardModule", "Tunnel $name state changed to $newState")
        }
    }

    @ReactMethod
    fun connect(name: String, configInterface: String, promise: Promise) {
        initializeBackend()
        val backend = this.backend
        if (backend == null) {
            promise.reject("BACKEND_ERROR", "WireGuard backend failed to initialize. Check logs.")
            return
        }

        // Check for VPN permission
        val intent = VpnService.prepare(reactContext)
        if (intent != null) {
            val activity = reactContext.currentActivity
            if (activity == null) {
                promise.reject("ACTIVITY_ERROR", "Current activity is null, cannot request permission")
                return
            }

            Log.d("WireGuardModule", "Requesting VPN permission")
            pendingName = name
            pendingConfig = configInterface
            pendingPromise = promise
            try {
                activity.startActivityForResult(intent, REQUEST_CODE_VPN_PERMISSION)
            } catch (e: Exception) {
                promise.reject("PERMISSION_ERROR", "Failed to start VPN permission activity: ${e.message}", e)
                pendingPromise = null
                pendingName = null
                pendingConfig = null
            }
            return
        }

        try {
            val inputStream = ByteArrayInputStream(configInterface.toByteArray(StandardCharsets.UTF_8))
            val config = Config.parse(inputStream)
            val tunnel = WgTunnel(name)
            
            // Using a thread because setState might be blocking
            Thread {
                try {
                    backend.setState(tunnel, Tunnel.State.UP, config)
                    promise.resolve("CONNECTED")
                } catch (e: BackendException) {
                    Log.e("WireGuardModule", "BackendException during connect", e)
                    promise.reject("CONNECT_FAIL_BACKEND", "Backend error: ${e.reason}", e)
                } catch (e: Exception) {
                    Log.e("WireGuardModule", "Exception during connect", e)
                    promise.reject("CONNECT_FAIL", "Generic error: ${e.message}", e)
                }
            }.start()
        } catch (e: Exception) {
            promise.reject("CONFIG_ERROR", "Config parse error: ${e.message}", e)
        }
    }

    @ReactMethod
    fun disconnect(name: String, promise: Promise) {
        initializeBackend()
         val backend = this.backend
        if (backend == null) {
            promise.reject("BACKEND_ERROR", "WireGuard backend not initialized")
            return
        }
        
        try {
            val tunnel = WgTunnel(name)
             Thread {
                try {
                    backend.setState(tunnel, Tunnel.State.DOWN, null)
                    promise.resolve("DISCONNECTED")
                } catch (e: Exception) {
                    promise.reject("DISCONNECT_FAIL", e)
                }
            }.start()
        } catch (e: Exception) {
            promise.reject("ERROR", e)
        }
    }
}
```

### 4.2 Create `WireGuardPackage.kt`
Path: `android/app/src/main/java/com/wireguardapp/WireGuardPackage.kt`

```kotlin
package com.wireguardapp

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class WireGuardPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(WireGuardModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
```

### 4.3 Register Package in `MainApplication.kt`
Path: `android/app/src/main/java/com/wireguardapp/MainApplication.kt`

Add the package to the list.

```kotlin
// ... imports
import com.wireguardapp.WireGuardPackage

// ... in MainApplication class
    override fun getPackages(): List<ReactPackage> =
        PackageList(this).packages.apply {
            add(WireGuardPackage()) // <--- ADD THIS
        }
```

## 5. Build Configuration (Avoids NDK/Version Errors)

### 5.1 `android/build.gradle`
**Crucial:** Explicitly set versions to avoid compile errors.

```gradle
ext {
    buildToolsVersion = "35.0.0"
    minSdkVersion = 24           // WireGuard requires a higher min SDK than default
    compileSdkVersion = 35
    targetSdkVersion = 35
    ndkVersion = "27.1.12297006" // MUST match your installed NDK version exactly
}
```

### 5.2 `android/app/build.gradle`
Add the WireGuard implementation dependency.

```gradle
dependencies {
    implementation("com.facebook.react:react-android")
    // ...
    implementation 'com.wireguard.android:tunnel:1.+' // <--- ADD THIS
}
```

## 6. Android Manifest
Path: `android/app/src/main/AndroidManifest.xml`

Add the VPN service entry **inside the `<application>` tag**.

```xml
<service android:name="com.wireguard.android.backend.GoBackend$VpnService"
     android:permission="android.permission.BIND_VPN_SERVICE"
     android:exported="false"
     tools:replace="android:exported">
    <intent-filter>
        <action android:name="android.net.VpnService"/>
    </intent-filter>
</service>
```

Also ensure permissions are present:
```xml
<uses-permission android:name="android.permission.INTERNET"/>
```

## 7. Build and Run
```bash
npm run android
```

If you follow these steps exactly, you will bypass the common pitfalls of NDK mismatches and Kotlin signature errors.
