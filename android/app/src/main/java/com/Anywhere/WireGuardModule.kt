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
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import java.nio.charset.StandardCharsets

class WireGuardModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var pendingPromise: Promise? = null
    private var pendingName: String? = null
    private var pendingConfig: String? = null

    companion object {
        private const val REQUEST_CODE_VPN_PERMISSION = 1001
        private var backend: GoBackend? = null // Singleton instance
        private val tunnels = HashMap<String, Tunnel>() // Cache tunnel instances
    }

    private val activityEventListener: ActivityEventListener = object : BaseActivityEventListener() {
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
            backend = GoBackend(reactContext.applicationContext)
            Log.d("WireGuardModule", "Backend initialized successfully (Singleton)")
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
        val backend = WireGuardModule.backend
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
            
            // Reuse existing tunnel object or create new one
            var tunnel = tunnels[name]
            if (tunnel == null) {
                tunnel = WgTunnel(name)
                tunnels[name] = tunnel
                Log.d("WireGuardModule", "Created new tunnel instance for: $name")
            } else {
                Log.d("WireGuardModule", "Reusing existing tunnel instance for: $name")
            }
            
            val finalTunnel = tunnel

            // Using a thread because setState might be blocking
            Thread {
                try {
                    backend.setState(finalTunnel, Tunnel.State.UP, config)
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
        Log.d("WireGuardModule", "Disconnecting tunnel: $name")
        initializeBackend()
         val backend = WireGuardModule.backend
        if (backend == null) {
            Log.e("WireGuardModule", "Backend is null during disconnect")
            promise.reject("BACKEND_ERROR", "WireGuard backend not initialized")
            return
        }
        
        try {
            // Retrieve existing tunnel instance
            var tunnel = tunnels[name]
            if (tunnel == null) {
                Log.w("WireGuardModule", "No cached tunnel found for $name. Creating temporary instance (May fail if backend requires identity).")
                tunnel = WgTunnel(name)
            } else {
                Log.d("WireGuardModule", "Found cached tunnel instance for: $name")
            }
            
            val finalTunnel = tunnel

             Thread {
                try {
                    Log.d("WireGuardModule", "Setting state to DOWN for $name")
                    backend.setState(finalTunnel, Tunnel.State.DOWN, null)
                    Log.d("WireGuardModule", "State set to DOWN successfully")
                    
                    try {
                        val intent = Intent(reactContext.applicationContext, GoBackend.VpnService::class.java)
                        val stopped = reactContext.applicationContext.stopService(intent)
                        Log.d("WireGuardModule", "Triggered stopService explicitly. Result: $stopped")
                    } catch (e: Exception) {
                        Log.e("WireGuardModule", "Failed to stop service explicitly", e)
                    }

                    promise.resolve("DISCONNECTED")
                } catch (e: Exception) {
                    Log.e("WireGuardModule", "Exception in disconnect thread", e)
                    promise.reject("DISCONNECT_FAIL", e)
                } catch (e: Throwable) {
                    Log.e("WireGuardModule", "Fatal error in disconnect thread", e)
                    promise.reject("DISCONNECT_FATAL", "Fatal error: ${e.message}")
                }
            }.start()
        } catch (e: Exception) {
            Log.e("WireGuardModule", "Error starting disconnect thread", e)
            promise.reject("ERROR", e)
        }
    }

    @ReactMethod
    fun getStatistics(name: String, promise: Promise) {
        initializeBackend()
        val backend = WireGuardModule.backend
        if (backend == null) {
            promise.reject("BACKEND_ERROR", "Backend not initialized")
            return
        }

        try {
            var tunnel = tunnels[name]
            if (tunnel == null) {
                // If checking stats for a running tunnel not in our cache (e.g. after restart),
                // we might need to recreate it. However, getStatistics might work with a new object 
                // if it's just reading DB/Kernel stats by name. But safer to assume identity matters.
                tunnel = WgTunnel(name)
            }

            val stats = backend.getStatistics(tunnel)
            val map = Arguments.createMap()
            map.putDouble("totalRx", stats.totalRx().toDouble())
            map.putDouble("totalTx", stats.totalTx().toDouble())
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("STATS_ERROR", e.message, e)
        }
    }
}
