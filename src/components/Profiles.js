import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  TouchableOpacity, 
  KeyboardAvoidingView,
  SafeAreaView, 
  ScrollView, 
  Platform, 
  StatusBar,
  Modal,
  Alert
} from 'react-native';
import { 
  GlobeLock, 
  Plus,  
  Router,
  QrCode,
  Trash2,
  Server, 
  LayersPlus,
  Power,
  PowerOff,
  LogOut
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import axios from 'axios';

export default function Profiles() {

  let navigation = useNavigation()
  let serverRef = useRef(null)
  let nameRef = useRef(null)
  let [running, setRunning] = useState(false)
  let [clients, setClients] = useState([])
  let [modal, setModal] = useState(false)
  let [showQr, setShowQr] = useState({template: null, show: false})

  useEffect(() => {
    retriveCreds()
  }, [])

  let retriveCreds = async() => {
    let anywhere = await AsyncStorage.getItem('anywhere-hub')
    serverRef.current = {
      endpoint: JSON.parse(anywhere)['endpoint'],
      token: JSON.parse(anywhere)['token']
    }

    serverStatus()
    getClients()
  }

  const serverStatus = async() => {
    try{
      let result = await axios.get(`http://${serverRef.current.endpoint}/webhook/status`,{
        headers: {
          'Authorization': `Bearer ${serverRef.current.token}`,
          'Content-Type': 'application/json'
        }
      })

      if(result.data.status == 'success'){
        setRunning(true)
        getClients()
      }
      else if(result.data.status == 'failed'){
        setRunning(false)
      }
      else{
        Alert.alert('Something went wrong')
      }
    }
    catch(err){
      console.log(err);
    }
  }

  let getClients = async() => {
    try {
      let result = await axios.get(`http://${serverRef.current.endpoint}/webhook/peers`,{
        headers: {
          'Authorization': `Bearer ${serverRef.current.token}`,
          'Content-Type': 'application/json'
        }
      })

      if(result.data.status == 'success'){
        console.log(result.data);
        setClients(result.data.peers)
      }
    }
    catch(err){
      console.log(err);
    }
  }

  let makeTheServer = async() => {
    if(running){
      try {
        let result = await axios.get(`http://${serverRef.current.endpoint}/webhook/stop`,{
          headers: {
            'Authorization': `Bearer ${serverRef.current.token}`,
            'Content-Type': 'application/json'
          }
        })

        if(result.data.status == 'success'){
          setRunning(false)
          getClients()
        }
      }
      catch(err){
        console.log(err);
      }
    }
    else{
      try {
        let result = await axios.get(`http://${serverRef.current.endpoint}/webhook/start`,{
          headers: {
            'Authorization': `Bearer ${serverRef.current.token}`,
            'Content-Type': 'application/json'
          }
        })

        if(result.data.status == 'success'){
          setRunning(true)
          getClients()
        }
        else{
          serverStatus()
          console.log('Something went wrong');
        }
      }
      catch(err){
        console.log(err);
      }
    }
  }

  let addClient = async() => {
    console.log(nameRef.current)
    if(nameRef.current != null){
      try {
        let result = await axios.post(`http://${serverRef.current.endpoint}/webhook/add`, {name: nameRef.current}, {
          headers: {
            'Authorization': `Bearer ${serverRef.current.token}`,
            'Content-Type': 'application/json'
          }
        })

        if(result.data.status == 'success'){
          setModal(!modal)
          nameRef.current = null
          getClients()
        }
        else if(result.data.status == 'failed'){
          Alert.alert(result.data.result)
          setModal(!modal)
          nameRef.current = null
        }
        else{
          Alert.alert('Something went wrong')
        }
      }
      catch(err){
        console.log(err);
      }
    }
    else{
      Alert.alert('Client name should not be empty')
    }
  }

  let removeClient = async(client) => {
    let info = {
      id: client._id,
      ip: client.ip,
      name: client.name,
      public_key: client.public_key
    }

    try {
      let result = await axios.post(`http://${serverRef.current.endpoint}/webhook/remove`, info, {
        headers: {
          'Authorization': `Bearer ${serverRef.current.token}`,
          'Content-Type': 'application/json'
        }
      })

      if(result.data.status == 'success'){
        getClients()
      }
    }
    catch(err){
      console.log(err);
    }
  }

  let makeTheConnection = async(client) => {
    if(!client.connection){
      console.log('Requesting to make active');
      let info = {
        id: client._id,
        ip: client.ip,
        public_key: client.public_key,
        connection: true
      }

      try {
        let result = await axios.post(`http://${serverRef.current.endpoint}/webhook/unblock`, info, {
          headers: {
            'Authorization': `Bearer ${serverRef.current.token}`,
            'Content-Type': 'application/json'
          }
        })

        if(result.data.status == 'success'){
          getClients()
        }
      }
      catch(err){
        console.log(err);
      }
    }
    else{
      console.log('Requesting to make inactive');
      let info = {
        id: client._id,
        ip: client.ip,
        public_key: client.public_key,
        connection: false
      }

      try {
        let result = await axios.post(`http://${serverRef.current.endpoint}/webhook/block`, info, {
          headers: {
            'Authorization': `Bearer ${serverRef.current.token}`,
            'Content-Type': 'application/json'
          }
        })

        if(result.data.status == 'success'){
          getClients()
        }
      }
      catch(err){
        console.log(err);
      }
    }
  }

  let logOut = async() => {
    let hub = await AsyncStorage.getItem('anywhere-hub')
    hub = JSON.parse(hub)
    hub['login'] = false
    await AsyncStorage.setItem('anywhere-hub', JSON.stringify(hub))
    navigation.navigate('Authentication')    
  }

  let factoryReset = async() => {
    try {
      await AsyncStorage.removeItem('anywhere-hub')
      let result = await axios.get(`http://${serverRef.current.endpoint}/webhook/factory-reset`, {
        headers: {
          'Authorization': `Bearer ${serverRef.current.token}`,
          'Content-Type': 'application/json'
        }
      })

      if(result.data.status == 'success'){
        getClients()
        Alert.alert('Factory reset done')
        navigation.navigate('Authentication')
      }
    }
    catch(err){
      console.log(err);
    }
  }

  let generateQr = async(client) => {
    let payload = await AsyncStorage.getItem('anywhere-hub')
    payload = JSON.parse(payload)
    
    let template = `[Interface]
    PrivateKey = ${client.private_key}
    Address = 10.0.0.${client.ip}/24
    DNS = 8.8.8.8

    [Peer]
    PublicKey = ${payload.key}
    AllowedIPs = 0.0.0.0/0,::/0
    Endpoint = ${payload.endpoint}
    PersistentKeepalive = 25`

    setShowQr({template: template, show: !showQr.show})
  }

  let ModalForClient = () => {
    return(
    <Modal visible={modal}>
        <View className="flex-1 bg-[#0a0a0b]">
        {/* 
            Ensure Status bar is translucent on Android 
            to allow KeyboardAvoidingView to calculate offsets correctly 
        */}
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        
        <LinearGradient
            colors={['#1f2128', '#0a0a0b']}
            className="absolute inset-0"
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.4 }}
        />

        <SafeAreaView className="flex-1">
            <KeyboardAvoidingView 
            // behavior "padding" is generally most reliable for iOS
            // behavior "height" or undefined is often better for Android
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            // keyboardVerticalOffset should roughly match the status bar height on Android
            keyboardVerticalOffset={Platform.OS === 'android' ? StatusBar.currentHeight : 0}
            >
            <ScrollView 
                // flexGrow: 1 is required for the inner View to expand
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* 
                Inner View with flex-1 and justify-center handles the 
                vertical centering while allowing the ScrollView to move 
                correctly when the KeyboardAvoidingView squeezes the space.
                */}
                <View className="flex-1 justify-center px-7 py-10">
                
                {/* Logo Section */}
                <View className="items-center mb-10">
                    <Text className="text-white text-4xl font-bold mt-10 tracking-tight">
                    Client Spot
                    </Text>
                    <Text className="text-zinc-500 text-lg mt-2 text-center font-medium">
                    Create your client profile
                    </Text>
                </View>

                {/* Form Section */}
                <View className="gap-y-6">
                    {/* Server Input */}
                    <View>
                    <Text className="text-zinc-500 text-[10px] font-bold tracking-[2px] uppercase mb-3 ml-1">
                        CLIENT NAME
                    </Text>
                    <View className="flex-row items-center bg-[#131418] border border-zinc-800/60 rounded-2xl px-5">
                        <Server size={20} color="#52525b" />
                        <TextInput
                          placeholder="Ex: Delhi"
                          placeholderTextColor="#3f3f46"
                          className="flex-1 text-white h-16 ml-3 text-base"
                          autoCapitalize="none"
                          underlineColorAndroid="transparent"
                          onChangeText={(value) => nameRef.current = value}
                        />
                    </View>
                    </View>

                    {/* Connect Button */}
                    <TouchableOpacity 
                      activeOpacity={0.9}
                      className="bg-white h-[56px] rounded-[24px] flex-row items-center justify-center mt-4 shadow-lg shadow-white/10"
                      onPress={addClient}
                      >
                      <Text className="text-black text-xl font-black mr-2">Add</Text>
                      <LayersPlus size={22} color="black" strokeWidth={3} />
                    </TouchableOpacity>
                    <TouchableOpacity className="self-center" onPress={() => setModal(!modal)}>
                        <Text className="text-red-500 font-bold text-sm">Cancel</Text>
                    </TouchableOpacity>
                </View>
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
        </View>
    </Modal>
    )
  }

  let ModalForQr = () => {
    return(
      <Modal visible={showQr.show}>
        <View className="flex-1 bg-[#0a0a0b]">
        {/* 
            Ensure Status bar is translucent on Android 
            to allow KeyboardAvoidingView to calculate offsets correctly 
        */}
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        
        <LinearGradient
            colors={['#1f2128', '#0a0a0b']}
            className="absolute inset-0"
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.4 }}
        />

        <SafeAreaView className="flex-1">
           <View className="flex-1 justify-center px-10 py-10">
                {/* Logo Section */}
                <View className="items-center mb-10">
                    <Text className="text-zinc-500 text-lg mt-2 text-center font-medium">
                      Scan QR
                    </Text>
                </View>
                {/* Qr display */}
                <View className="items-center mb-10 bg-white p-5">
                  <QRCode
                    value={showQr.template}
                    size={300}
                    color='black'
                    backgroundColor='white'
                  />
                </View>
                {/* Form Section */}
                <View className="gap-y-6">
                  <TouchableOpacity className="self-center" onPress={() => setShowQr((prev) => ({...prev, show: !showQr.show}))}>
                      <Text className="text-pink-500 font-bold text-lg">Close</Text>
                  </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
        </View>
      </Modal>
    )
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
      <SafeAreaView 
        className="flex-1"
        style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 py-4">
          {/*
          <View className="flex-row gap-x-3">
            <TouchableOpacity className="w-12 h-12 bg-zinc-800/40 rounded-sm items-center justify-center border border-zinc-700/50" onPress={() => navigation.navigate('VPN')}>
              <GlobeLock size={24} color="white" />
            </TouchableOpacity>
          </View>
          */}
          <Text className="text-white text-2xl font-bold tracking-tight">
            Anywhere Hub
          </Text>
          <View className="flex-row gap-x-3">
            <TouchableOpacity className="w-12 h-12 bg-zinc-800/40 rounded-sm items-center justify-center border border-zinc-700/50" onPress={() => navigation.navigate('VPN')}>
              <GlobeLock size={24} color="white" />
            </TouchableOpacity>
            {
              running ?
              <TouchableOpacity className="w-12 h-12 bg-zinc-800/40 rounded-sm items-center justify-center border border-zinc-700/50" onPress={makeTheServer}>
                <Power size={24} color="green" />
              </TouchableOpacity>:
              <TouchableOpacity className="w-12 h-12 bg-zinc-800/40 rounded-sm items-center justify-center border border-zinc-700/50" onPress={makeTheServer} onLongPress={factoryReset}>
                <PowerOff size={24} color="red" />
              </TouchableOpacity>
            }
            <TouchableOpacity className="w-12 h-12 bg-zinc-800/40 rounded-sm items-center justify-center border border-zinc-700/50" onPress={logOut}>
              <LogOut size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >

          {/* Section Header */}
          <View className="flex-row items-center justify-between mt-10 mb-6">
            <Text className="text-white text-xl font-bold">Clients</Text>
            <View className="bg-zinc-800 w-6 h-6 rounded-md items-center justify-center">
              <Text className="text-zinc-400 text-xs font-bold">{clients.length}</Text>
            </View>
          </View>

          {/* Configuration List */}
          <View className="gap-y-4">
            {
              clients.length > 0 ? clients.map((client) => (
                <View className="bg-zinc-900 border border-zinc-800 p-5 rounded-[10px] flex-row items-center" key={client._id}>
                  <View className="w-12 h-12 bg-zinc-800 rounded-2xl items-center justify-center">
                    <Router size={22} color="white" />
                  </View>
                  <View className="flex-1 ml-4">
                    <Text className="text-white font-bold my-1">{client.name}</Text>
                    <Text className="text-zinc-500 text-xs font-mono my-1">10.0.0.{client.ip}</Text>
                  </View>
                  <TouchableOpacity className="mx-2" onPress={() => removeClient(client)}>
                    <Trash2 size={22} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity className="mx-2" onPress={() => generateQr(client) }>
                    <QrCode size={22} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity className={`ml-2 w-12 h-7 bg-black rounded-full px-1 justify-center ${client.connection ? 'items-end' : 'items-start'} border border-zinc-800`} onPress={() => makeTheConnection(client)}>
                    <View className="w-5 h-5 bg-white rounded-full" />
                  </TouchableOpacity>
                </View>
              )):null
            }
          </View>
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity 
          className="absolute bottom-10 right-8 w-16 h-16 bg-white rounded-full items-center justify-center shadow-xl shadow-white/20"
          style={{ elevation: 10 }}
          onPress={() => setModal(!modal)}
        >
          <Plus size={32} color="black" strokeWidth={3} />
        </TouchableOpacity>

      </SafeAreaView>
      <ModalForClient />
      <ModalForQr />
    </View>
  );
}