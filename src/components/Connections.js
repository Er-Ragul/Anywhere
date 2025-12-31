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
  Contrast, 
  Power, 
  Plus, 
  LayoutGrid, 
  Building2, 
  Globe, 
  Router,
  ArrowDown,
  ArrowUp
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Connections() {

  let [profiles, setProfiles] = useState([])
  let [power, setPower] = useState(false)

  useEffect(() => {
    savedProfiles()
  }, [])

  const savedProfiles = async() => {
    let saved = await AsyncStorage.getItem('profiles');
    setProfiles(JSON.parse(saved))
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
          <Text className="text-white text-2xl font-bold tracking-tight">
            Anywhere
          </Text>
          <View className="flex-row gap-x-3">
            <TouchableOpacity className="w-10 h-10 bg-zinc-800 rounded-full items-center justify-center">
              <Contrast size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 bg-zinc-800 rounded-full items-center justify-center">
              <Settings size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Connection Card */}
          <View className="bg-zinc-800/80 rounded-[10px] p-8 mt-4">
            <View className="flex-row justify-between items-start">
              <View>
                {/* Status Badge */}
                <View className="flex-row items-center bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full self-start mb-4">
                  <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                  <Text className="text-emerald-500 text-[10px] font-bold tracking-widest uppercase">
                    Connected
                  </Text>
                </View>
                <Text className="text-white text-4xl font-bold">US-East-1</Text>
                <Text className="text-zinc-500 font-medium mt-1">Private Peer</Text>
              </View>

              {/* Large Toggle Switch */}
              <TouchableOpacity className={`bg-white w-20 h-12 rounded-full flex-row items-center px-1 ${power ? 'justify-end' : 'justify-start'}`} onPress={() => setPower(!power)}>
                <View className="bg-black w-10 h-10 rounded-full items-center justify-center">
                  <Power size={18} color="white" strokeWidth={3} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Info Grid */}
            <View className="flex-row flex-wrap mt-10 justify-between gap-y-4">
              {/* Public IP */}
              <View className="w-[48%] bg-zinc-700/50 rounded-[30px] p-4">
                <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1">Public IP</Text>
                <Text className="text-white font-bold">10.200.0.5</Text>
              </View>
              {/* Uptime */}
              <View className="w-[48%] bg-zinc-700/50 rounded-[30px] p-4">
                <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1">Uptime</Text>
                <Text className="text-white font-bold">02:14:55</Text>
              </View>
              {/* RX */}
              <View className="w-[48%] bg-zinc-700/50 rounded-[30px] p-4">
                <View className="flex-row items-center mb-1">
                  <ArrowDown size={12} color="#94a3b8" className="mr-1" />
                  <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">RX</Text>
                </View>
                <Text className="text-white font-bold">1.2 GB</Text>
              </View>
              {/* TX */}
              <View className="w-[48%] bg-zinc-700/50 rounded-[30px] p-4">
                <View className="flex-row items-center mb-1">
                  <ArrowUp size={12} color="#94a3b8" className="mr-1" />
                  <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">TX</Text>
                </View>
                <Text className="text-white font-bold">450 MB</Text>
              </View>
            </View>
          </View>

          {/* Section Header */}
          <View className="flex-row items-center justify-between mt-10 mb-6">
            <Text className="text-white text-xl font-bold">Saved Configurations</Text>
            <View className="bg-zinc-800 w-6 h-6 rounded-md items-center justify-center">
              <Text className="text-zinc-400 text-xs font-bold">4</Text>
            </View>
          </View>

          {/* Configuration List */}
          <View className="gap-y-4">
            {/* Item 1 */}
            <TouchableOpacity className="bg-zinc-900 border border-zinc-800 p-5 rounded-[10px] flex-row items-center" onPress={() => setPower(!power)}>
              <View className="w-12 h-12 bg-zinc-800 rounded-2xl items-center justify-center">
                <Router size={22} color="white" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-white font-bold text-lg">Gaming Private Net</Text>
                <Text className="text-zinc-500 text-xs font-mono">192.168.50.1</Text>
              </View>
              <View className={`w-12 h-7 bg-black rounded-full px-1 justify-center ${power ? 'items-end' : 'items-start'} border border-zinc-800`}>
                <View className="w-5 h-5 bg-white rounded-full" />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity 
          className="absolute bottom-10 right-8 w-16 h-16 bg-white rounded-full items-center justify-center shadow-xl shadow-white/20"
          style={{ elevation: 10 }}
        >
          <Plus size={32} color="black" strokeWidth={3} />
        </TouchableOpacity>

      </SafeAreaView>
    </View>
  );
}