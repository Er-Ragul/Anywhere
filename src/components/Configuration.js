import React, { useState, useEffect } from 'react';
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
import { X, Eye, EyeOff, Save, QrCode } from 'lucide-react-native';
import { useCameraPermissions, CameraView, CameraType } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Configuration() {
  let navigation = useNavigation()
  let [scan, setScan] = useState(false)
  const [scannedData, setScannedData] = useState(null);
  let [config, setConfig] = useState({
    name: null,
    private_key: null,
    address: null,
    dns: '8.8.8.8',
    public_key: null,
    allowed: '0.0.0.0/0,::/0',
    endpoint: null
  })
  let [visible, setVisible] = useState(false)
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
    let scanned = data.split("\n")

    setConfig({
      name: null,
      private_key: scanned[1].trimStart().split(" ")[2],
      address: scanned[2].trimStart().split(" ")[2],
      dns: scanned[3].trimStart().split(" ")[2],
      public_key: scanned[6].trimStart().split(" ")[2],
      allowed: scanned[7].trimStart().split(" ")[2],
      endpoint: scanned[8].trimStart().split(" ")[2]
    })
    setScan(false)
  };

  let saveConfiguration = async() => {
    try {
      let template = `[Interface]
      PrivateKey = ${config.private_key}
      Address = ${config.address}
      DNS = ${config.dns}

      [Peer]
      PublicKey = ${config.public_key}
      AllowedIPs = ${config.allowed}
      Endpoint = ${config.endpoint}
      PersistentKeepalive = 25`

      let profileList = await AsyncStorage.getItem('profiles')

      if(profileList != null){
        profileList = JSON.parse(profileList)
        profileList.push({
          name: config['name'],
          address: config.address,
          config: template
        })
        const profiles = JSON.stringify(profileList);
        await AsyncStorage.setItem('profiles', profiles);
      }
      else{
        const profiles = JSON.stringify([
          {
            name: config['name'],
            address: config.address,
            config: template
          }
        ]);
        await AsyncStorage.setItem('profiles', profiles); 
      }

      setConfig({
        name: null,
        private_key: null,
        address: null,
        dns: '8.8.8.8',
        public_key: null,
        allowed: null,
        endpoint: null
      })

      Alert.alert('Profile added successfully 👍🏻')
      
    } catch (e) {
      Alert.alert('Something went wrong 😞')
    }
  }

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
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Connection')}>
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
                value={config.name}
                onChangeText={(value) => setConfig({...config, name: value})}
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-slate-600 font-bold mb-2 ml-1">
              Private Key
            </Text>
            <View className="bg-white px-5 py-1 rounded-2xl border border-slate-200 flex-row items-center">
              <TextInput 
                secureTextEntry={!visible}
                value={config.private_key}
                className="flex-1 text-slate-900 text-base"
                placeholder='bmXOC+pV1u3zDad9eTB+'
                placeholderTextColor="#a9a9a9"
                onChangeText={(value) => setConfig({...config, private_key: value})}
              />
              <TouchableOpacity className="ml-3" onPress={() => setVisible(!visible)}>
                { visible ? <Eye size={20} color="#64748b" /> : <EyeOff size={20} color="#64748b" /> }
              </TouchableOpacity>
              {/* <TouchableOpacity className="ml-4">
                <RefreshCw size={20} color="#1e293b" />
              </TouchableOpacity> */}
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-slate-600 font-bold mb-2 ml-1">
              Address
            </Text>
            <View className="bg-white px-5 py-1 rounded-2xl border border-slate-200 flex-row items-center">
              <TextInput
                placeholder='10.0.0.2'
                value={config.address}
                className="flex-1 text-slate-900 text-base"
                placeholderTextColor="#a9a9a9"
                onChangeText={(value) => setConfig({...config, address: value})}
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
                value={config.dns}
                className="flex-1 text-slate-900 text-base"
                placeholderTextColor="#a9a9a9"
                onChangeText={(value) => setConfig({...config, dns: value})}
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
                value={config.public_key}
                className="flex-1 text-slate-900 text-base"
                placeholderTextColor="#a9a9a9"
                scrollEnabled
                onChangeText={(value) => setConfig({...config, public_key: value})}
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
                value={config.allowed}
                className="flex-1 text-slate-900 text-base"
                placeholderTextColor="#a9a9a9"
                onChangeText={(value) => setConfig({...config, allowed: value})}
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-slate-600 font-bold mb-2 ml-1">
              Endpoint
            </Text>
            <View className="bg-white px-5 py-1 rounded-2xl border border-slate-200 flex-row items-center">
              <TextInput
                placeholder='0.0.0.0'
                value={config.endpoint}
                className="flex-1 text-slate-900 text-base"
                placeholderTextColor="#a9a9a9"
                onChangeText={(value) => setConfig({...config, endpoint: value})}
              />
            </View>
          </View>
        </View>
        
        <View className="bg-slate-100/80 px-6 py-8">
          <TouchableOpacity 
            activeOpacity={0.9}
            className="bg-black rounded-2xl py-5 flex-row items-center justify-center shadow-lg shadow-black/20"
            onPress={saveConfiguration}
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
          onBarcodeScanned={scannedData ? null : handleBarCodeScanned} 
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