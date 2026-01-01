import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Platform, 
  StatusBar 
} from 'react-native';
import { 
  Settings, 
  Trash2, 
  Power, 
  Plus, 
  ArrowLeft, 
  SquarePen, 
  PlugZap, 
  Router,
  ArrowDown,
  ArrowUp,
  RefreshCcw
} from 'lucide-react-native';
import WireGuardModule from '../wireguard/WireGuardModule';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
// import { loadConfig } from '../redux/variableSlice';

export default function Connections() {
  let navigation = useNavigation()
  let dispatch = useDispatch()
  let [profiles, setProfiles] = useState([])
  let [power, setPower] = useState(false)
  let [config, setConfig] = useState(null)

  useEffect(() => {
    searchConfig()
    savedProfiles()
  }, [])

  let searchConfig = async() => {
    let profile = await AsyncStorage.getItem('config')
    if (profile != null){
      setConfig(JSON.parse(profile))
      setPower(profile.connected)
    }
    else{
      console.log('No connection profile loaded');
    }
  }

  let savedProfiles = async() => {
    let saved = await AsyncStorage.getItem('profiles');
    if(saved != null){
      setProfiles(JSON.parse(saved))
    }
  }

  let deleteProfile = async(index) => {
    let profilesCopy = profiles
    profilesCopy.splice(index, 1)
    await AsyncStorage.setItem('profiles', JSON.stringify(profilesCopy))
    savedProfiles()
  }

  let loadConfig = async(name, address, config) => {
    await AsyncStorage.setItem('config', JSON.stringify({
      name: name,
      config: config,
      address: address,
      connected: false
    }))
    setConfig({
      name: name,
      config: config,
      address: address,
      connected: false
    })
    //navigation.navigate('VPN')
  }

  const toggleConnection = async () => {
    try {
      if(config != null && config.connected){
        console.log('Disconnecting');
        await WireGuardModule.disconnect(config.name);
        let profileCopy = config
        profileCopy['connected'] = false
        await AsyncStorage.setItem('config', JSON.stringify(profileCopy))
        setPower(false)
      }
      else{
        console.log('Connecting');
        console.log(config.config)
        await WireGuardModule.connect(config.name, config.config);
        let profileCopy = config
        profileCopy['connected'] = true
        await AsyncStorage.setItem('config', JSON.stringify(profileCopy))
        setPower(true)
      }
    } catch (e) {
        console.error(e);
        alert("Connection Failed: " + e.message);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
      <SafeAreaView 
        className="flex-1"
        style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 py-4">
          <TouchableOpacity className="w-10 h-10 bg-zinc-800 rounded-full items-center justify-center" onPress={() => navigation.navigate('VPN')}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold tracking-tight">
            Anywhere
          </Text>
          <TouchableOpacity className="w-10 h-10 bg-zinc-800 rounded-full items-center justify-center" onPress={savedProfiles}>
            <RefreshCcw size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Connection Card */}
          {
            config != null ?
            <View className="bg-zinc-800/80 rounded-[10px] p-8 mt-4">
              <View className="flex-row justify-between items-start">
                <View>
                  {/* Status Badge */}
                  {
                    config.connected ?
                      <View className="flex-row items-center bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full self-start mb-4">
                        <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                        <Text className="text-emerald-500 text-[10px] font-bold tracking-widest uppercase">
                          Connected
                        </Text>
                      </View>:
                      <View className="flex-row items-center bg-red-500/20 border border-red-500/30 px-3 py-1 rounded-full self-start mb-4">
                        <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                        <Text className="text-red-500 text-[10px] font-bold tracking-widest uppercase">
                          Disconnected
                        </Text>
                      </View>
                  }
                  <Text className="text-white text-4xl font-bold">{config.name}</Text>
                  <Text className="text-zinc-500 font-medium mt-1">Connection Profile</Text>
                </View>

                {/* Large Toggle Switch */}
                <TouchableOpacity className={`bg-white w-20 h-12 rounded-full flex-row items-center px-1 ${config.connected ? 'justify-end' : 'justify-start'}`} onPress={toggleConnection}>
                  <View className="bg-black w-10 h-10 rounded-full items-center justify-center">
                    <Power size={18} color="white" strokeWidth={3} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Info Grid */}
              <View className="flex-row flex-wrap mt-10 justify-between gap-y-4">
                  {/* Public IP */}
                  <View className="w-[48%] bg-zinc-700/50 rounded-[10px] p-4">
                    <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1">INTERNAL IP</Text>
                    <Text className="text-white font-bold">{config.address}</Text>
                  </View>
                  {/* Uptime */}
                  <View className="w-[48%] bg-zinc-700/50 rounded-[10px] p-4">
                    <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1">Uptime</Text>
                    <Text className="text-white font-bold">02:14:55</Text>
                  </View>
                  {/* RX */}
                  <View className="w-[48%] bg-zinc-700/50 rounded-[10px] p-4">
                    <View className="flex-row items-center mb-1">
                      <ArrowDown size={12} color="#94a3b8" className="mr-1" />
                      <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">RX</Text>
                    </View>
                    <Text className="text-white font-bold">1.2 GB</Text>
                  </View>
                  {/* TX */}
                  <View className="w-[48%] bg-zinc-700/50 rounded-[10px] p-4">
                    <View className="flex-row items-center mb-1">
                      <ArrowUp size={12} color="#94a3b8" className="mr-1" />
                      <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">TX</Text>
                    </View>
                    <Text className="text-white font-bold">450 MB</Text>
                  </View>
                </View>
            </View>:null
          }

          {/* Section Header */}
          <View className="flex-row items-center justify-between mt-10 mb-6">
            <Text className="text-white text-xl font-bold">Saved Configurations</Text>
            <View className="bg-zinc-800 w-6 h-6 rounded-md items-center justify-center">
              <Text className="text-zinc-400 text-xs font-bold">{profiles.length}</Text>
            </View>
          </View>

          {/* Configuration List */}
          {
            profiles.length > 0 ? profiles.map((profile, index) => (
              <View className="gap-y-4 mb-4" key={index}>
                <View className="bg-zinc-900 border border-zinc-800 p-5 rounded-[10px] flex-row items-center">
                  <View className="w-12 h-12 bg-zinc-800 rounded-2xl items-center justify-center">
                    <Router size={22} color="white" />
                  </View>
                  <View className="flex-1 ml-4">
                    <Text className="text-white font-bold text-lg">{profile.name}</Text>
                    <Text className="text-zinc-500 text-xs font-mono">{profile.address}</Text>
                  </View>
                  {/* <View className={`w-12 h-7 bg-black rounded-full px-1 justify-center ${power ? 'items-end' : 'items-start'} border border-zinc-800`}>
                    <View className="w-5 h-5 bg-white rounded-full" />
                  </View> */}
                  <TouchableOpacity className="mx-2 bg-zinc-900 border border-zinc-800 p-2 rounded-[10px] flex-row items-center" onPress={() => deleteProfile(index)}>
                    <Trash2 size={22} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity className="mx-2 bg-zinc-900 border border-zinc-800 p-2 rounded-[10px] flex-row items-center">
                    <SquarePen size={22} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity className="mx-2 bg-zinc-900 border border-zinc-800 p-2 rounded-[10px] flex-row items-center" onPress={() => loadConfig(profile.name, profile.address, profile.config)}>
                    <PlugZap size={22} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            )):null
          }
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity 
          className="absolute bottom-10 right-8 w-16 h-16 bg-white rounded-full items-center justify-center shadow-xl shadow-white/20"
          style={{ elevation: 10 }}
          onPress={() => navigation.navigate('Configuration')}
        >
          <Plus size={32} color="black" strokeWidth={3} />
        </TouchableOpacity>

      </SafeAreaView>
    </View>
  );
}