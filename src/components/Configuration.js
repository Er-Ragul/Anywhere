import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Switch,
  Platform, 
  StatusBar,
  Modal,
  Alert,
  KeyboardAvoidingView,
  StyleSheet
} from 'react-native';
import { X, Eye, RefreshCw, Save, QrCode } from 'lucide-react-native';
import { useCameraPermissions, CameraView, CameraType } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';

export default function Configuration() {
  let navigation = useNavigation()
  let [scan, setScan] = useState(false)
  const [scannedData, setScannedData] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();

  let openQrScanner = () => {
    if(permission.granted){
      setScannedData(null);
      setScan(true)
    }
    else{
      requestPermission()
    }
  }

  const handleBarCodeScanned = ({ type, data }) => {
    setScannedData(data);
    console.log(data);
    setScan(false)
  };

  return (
    <ScrollView>
    <View className="flex-1 bg-slate-100">
      <StatusBar barStyle="dark-content" />
      
      {/* Header padding for Android */}
      <SafeAreaView 
        className="bg-white border-b border-slate-200"
        style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
      >
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()}>
            <X size={24} color="#000" />
          </TouchableOpacity>
          
          <Text className="text-slate-900 text-lg font-bold">
            Add Configuration
          </Text>

          <TouchableOpacity activeOpacity={0.7} onPress={openQrScanner}>
            <QrCode size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          
        {/* Interface Settings Section */}
        <View className="mt-4">
          <Text className="text-slate-900 text-xl font-bold mb-6">
            Interface
          </Text>

          <View className="mb-6">
            <Text className="text-slate-600 font-bold mb-2 ml-1">
              Interface Name
            </Text>
            <View className="bg-white px-5 py-1 rounded-2xl border border-slate-200 flex-row items-center">
              <TextInput
                placeholder='US Server'
                className="flex-1 text-slate-900 text-base"
                placeholderTextColor="#a9a9a9"
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-slate-600 font-bold mb-2 ml-1">
              Private Key
            </Text>
            <View className="bg-white px-5 py-1 rounded-2xl border border-slate-200 flex-row items-center">
              <TextInput 
                secureTextEntry
                value="1234567890123"
                className="flex-1 text-slate-900 text-base"
                placeholderTextColor="#a9a9a9"
              />
              <TouchableOpacity className="ml-3">
                <Eye size={20} color="#64748b" />
              </TouchableOpacity>
              <TouchableOpacity className="ml-4">
                <RefreshCw size={20} color="#1e293b" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-slate-600 font-bold mb-2 ml-1">
              Address
            </Text>
            <View className="bg-white px-5 py-1 rounded-2xl border border-slate-200 flex-row items-center">
              <TextInput
                placeholder='10.0.0.2/24'
                className="flex-1 text-slate-900 text-base"
                placeholderTextColor="#a9a9a9"
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-slate-600 font-bold mb-2 ml-1">
              DNS (Optional)
            </Text>
            <View className="bg-white px-5 py-1 rounded-2xl border border-slate-200 flex-row items-center">
              <TextInput
                placeholder='8.8.8.8, 1.1.1.1'
                className="flex-1 text-slate-900 text-base"
                placeholderTextColor="#a9a9a9"
              />
            </View>
          </View>
        </View>

        {/* Peer Settings Section */}
        <View className="mt-4">
          <Text className="text-slate-900 text-xl font-bold mb-6">
            Peer
          </Text>

          <View className="mb-6">
            <Text className="text-slate-600 font-bold mb-2 ml-1">
              Public Key
            </Text>
            <View className="bg-white px-5 py-1 rounded-2xl border border-slate-200 flex-row items-center">
              <TextInput 
                placeholder="bmXOC+pV1u3zDad9eTB+"
                className="flex-1 text-slate-900 text-base"
                placeholderTextColor="#a9a9a9"
                scrollEnabled
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-slate-600 font-bold mb-2 ml-1">
              Allowed IPs
            </Text>
            <View className="bg-white px-5 py-1 rounded-2xl border border-slate-200 flex-row items-center">
              <TextInput
                placeholder='0.0.0.0/0,::/0'
                className="flex-1 text-slate-900 text-base"
                placeholderTextColor="#a9a9a9"
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-slate-600 font-bold mb-2 ml-1">
              Endpoint
            </Text>
            <View className="bg-white px-5 py-1 rounded-2xl border border-slate-200 flex-row items-center">
              <TextInput
                placeholder='0.0.0.0:51820'
                className="flex-1 text-slate-900 text-base"
                placeholderTextColor="#a9a9a9"
              />
            </View>
          </View>
        </View>
        
        <View className="bg-slate-100/80 px-6 py-8">
          <TouchableOpacity 
            activeOpacity={0.9}
            className="bg-black rounded-2xl py-5 flex-row items-center justify-center shadow-lg shadow-black/20"
          >
            <Save size={20} color="white" strokeWidth={2.5} />
            <Text className="text-white font-bold text-lg ml-2">
              Save Configuration
            </Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Qrscanner Modal */}
      <Modal visible={scan} animationType="fade">
      <SafeAreaView 
        className="bg-white border-b border-slate-200"
        style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
      >
        <View className="flex-row items-center justify-between px-6 py-4">          
          <Text className="text-slate-900 text-lg font-bold">
            Profile Qr Scanner
          </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => setScan(false)}>
            <X size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      {/* <CameraView
        className="h-full"
        onBarcodeScanned={scannedData ? undefined : handleBarCodeScanned} 
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      /> */}
      <View className="flex-1 bg-black relative">
        {/* Camera MUST be absolute */}
        <CameraView
          facing="back"
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scannedData ? undefined : handleBarCodeScanned} 
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />

        {/* Overlay */}
        <View className="absolute inset-0">
          {/* Top overlay */}
          <View className="flex-1 bg-black/60" />

          {/* Middle row */}
          <View className="flex-row">
            <View className="flex-1 bg-black/60" />

            {/* Scan box */}
            <View className="w-64 h-64 relative">
              <View className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-white" />
              <View className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-white" />
              <View className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-white" />
              <View className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-white" />
            </View>

            <View className="flex-1 bg-black/60" />
          </View>

          {/* Bottom overlay */}
          <View className="flex-1 bg-black/60" />
        </View>

        {/* Helper text */}
        <View className="absolute bottom-16 w-full items-center">
          <Text className="text-white">
            Align QR within the frame
          </Text>
        </View>
      </View>
      </Modal>
    </View>
    </ScrollView>
  );
}