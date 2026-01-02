import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Platform, 
  StatusBar 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ShieldX, 
  Server, 
  Power, 
  PowerOff,
  ChevronRight, 
  ArrowUp, 
  ArrowDown, 
  Clock,
  ShieldPlus, 
  ShieldCheck
} from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import WireGuardModule from '../wireguard/WireGuardModule';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VPN() {

  let [isConnected, setIsConnected] = useState(false)
  let [config, setConfig] = useState(null)
  const lastStatsRef = useRef({ rx: 0, tx: 0, timestamp: Date.now() });
  const timerRef = useRef(null);
  const statsIntervalRef = useRef(null);
  let [transfer, setTransfer] = useState({Rx: [0, 'B'], Tx: [0, 'B']})
  let [duration, setDuration] = useState('0')
  let speedRef = useRef(null)
  const navigation = useNavigation()

  useEffect(() => {
    loadConfig()

    if(!isConnected) return

    const setTime = async() => {
      let time = await AsyncStorage.getItem("startTime");
      if(time !== null){
        timerRef.current = setInterval(() => {
          const diff = Math.floor((Date.now() - Number(time)) / 1000);
          const m = Math.floor(diff / 60).toString().padStart(2, '0');
          const s = (diff % 60).toString().padStart(2, '0');
          setDuration(`${m}:${s}`);
        }, 1000);
      } 
      else{
        const now = Date.now();
        await AsyncStorage.setItem("startTime", now.toString());
        timerRef.current = setInterval(() => {
          const diff = Math.floor((Date.now() - now) / 1000);
          const m = Math.floor(diff / 60).toString().padStart(2, '0');
          const s = (diff % 60).toString().padStart(2, '0');
          setDuration(`${m}:${s}`);
        }, 1000);
      }
    }

    setTime()

    // Poll stats
    statsIntervalRef.current = setInterval(async () => {
        try {
            const currentStats = await WireGuardModule.getStatistics(config.name);
            // getStatistics returns { totalRx: number, totalTx: number }

            const now = Date.now();
            const timeDelta = (now - lastStatsRef.current.timestamp) / 1000;

            if (timeDelta > 0 && currentStats) {
                const rxDiff = currentStats.totalRx - lastStatsRef.current.rx;
                const txDiff = currentStats.totalTx - lastStatsRef.current.tx;

                // Avoid negative spikes on restart or reset
                const rxSpeed = rxDiff > 0 ? rxDiff / timeDelta : 0;
                const txSpeed = txDiff > 0 ? txDiff / timeDelta : 0;

                setTransfer({
                  Rx: [formatSpeed(rxSpeed), getSpeedUnit(rxSpeed)],
                  Tx: [formatSpeed(txSpeed), getSpeedUnit(rxSpeed)]
                })
                // Note: We could save the unit in state too if we want dynamic units

                lastStatsRef.current = {
                    rx: currentStats.totalRx,
                    tx: currentStats.totalTx,
                    timestamp: now
                };
            }
        } catch (e) {
            console.log("Stats error", e);
        }
    }, 1000);

    return () => {
        clearInterval(timerRef.current);
        clearInterval(statsIntervalRef.current);
    };

  }, [isConnected])

  let loadConfig = async() => {
    let profile = await AsyncStorage.getItem('config')
    if (profile != null){
      setConfig(JSON.parse(profile))
      setIsConnected(JSON.parse(profile)['connected'])
    }
    else{
      console.log('No connection profile loaded');
    }
  }

  // Formatted speed
  const formatSpeed = (bytesPerSec) => {
      // Logic below keeps typical "MB/s" format.
      if (bytesPerSec === 0) return '0';
      const k = 1024;
      const i = Math.floor(Math.log(bytesPerSec) / Math.log(k));
      return parseFloat((bytesPerSec / Math.pow(k, i)).toFixed(2));
  };

  // Fromatted Unit
  const getSpeedUnit = (bytesPerSec) => {
    if (bytesPerSec === 0) return 'KB/s';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s'];
    const i = Math.floor(Math.log(bytesPerSec) / Math.log(k));
    return sizes[i];
  };

  const toggleConnection = async () => {
    try {
      if(config != null && config.connected){
        console.log('Disconnecting');
        await WireGuardModule.disconnect(config.name);
        let configCopy = config
        configCopy['connected'] = false
        await AsyncStorage.setItem('config', JSON.stringify(configCopy))
        await AsyncStorage.removeItem('startTime')
        setIsConnected(false)
      }
      else{
        console.log('Connecting');
        await WireGuardModule.connect(config.name, config.config);
        let configCopy = config
        configCopy['connected'] = true
        await AsyncStorage.setItem('config', JSON.stringify(configCopy))
        setIsConnected(true)
      }
    } catch (e) {
        console.error(e);
        alert("Connection Failed: " + e.message);
    }
  };

  return (
    <LinearGradient
      colors={['#1a1d24', '#0a0b0d']}
      className="flex-1"
    >
      {/* Set status bar to light and transparent so the gradient shows behind it */}
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <SafeAreaView 
        className="flex-1"
        // This style fix ensures Android devices respect the status bar height
        style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 py-4">
          <TouchableOpacity className="w-12 h-12 bg-zinc-800/40 rounded-sm items-center justify-center border border-zinc-700/50"
          onPress={() => navigation.navigate('Configuration')}>
            <ShieldPlus size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <Text className="text-zinc-400 font-bold tracking-[3px] text-xs uppercase">
            Anywhere
          </Text>

          <TouchableOpacity className="w-12 h-12 bg-zinc-800/40 rounded-sm items-center justify-center border border-zinc-700/50" onPress={() => navigation.navigate('Authentication')}>
            <Server size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          
          {/* Status Section */}
          <View className="items-center mt-6">
            <View className="flex-row items-center bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-full mb-6">
              <View className="w-2 h-2 rounded-full bg-emerald-400 mr-2" />
              <Text className="text-emerald-400 text-[10px] font-bold tracking-widest uppercase">
                Encrypted
              </Text>
            </View>
            
            <Text className="text-white text-5xl font-bold tracking-tight">
              { config != null && config.connected == true ? 'Connected' : 'Disconnected' }
            </Text>
            {/* <Text className="text-zinc-400 text-lg mt-1">
              Germany - DE1
            </Text> */}
          </View>

          {/* Power Button */}
          <View className="items-center justify-center my-10">
            <View className="w-72 h-72 rounded-full border border-emerald-500/5 items-center justify-center">
              <View className="w-60 h-60 rounded-full border border-emerald-500/10 items-center justify-center">
                <TouchableOpacity 
                  activeOpacity={0.8}
                  className={`w-44 h-44 rounded-full ${config != null && config.connected == true ? 'bg-emerald-500' : 'bg-red-500'} items-center justify-center`}
                  style={{
                    shadowColor: `${ config != null && config.connected ? '#10b981' : '#ef4444' }`,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.6,
                    shadowRadius: 30,
                    elevation: 15,
                  }}
                  onPress={toggleConnection}
                >
                  { 
                    config != null && config.connected == true ? 
                    <Power size={60} color="white" strokeWidth={2.5} /> : <PowerOff size={60} color="white" strokeWidth={2.5} />
                  }
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Current Server Card */}
          <View className="px-6 mb-6">
            <TouchableOpacity className="bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-[16px] flex-row items-center" onPress={() => navigation.navigate('Connection')}>
              {
                config != null ? <ShieldCheck size={32} color="#ffffff" /> : <ShieldX size={32} color="#ffffff" />
              }
              <View className="flex-1 ml-4">
                <Text className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mb-0.5">
                  Connection Profile
                </Text>
                <Text className="text-white text-lg font-bold">
                  { config != null ? config.name : 'Not Found' }
                </Text>
              </View>

              <View className="bg-zinc-800/80 p-2.5 rounded-full">
                <ChevronRight size={20} color="#64748b" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View className="flex-row px-5 justify-between">
            <View className="flex-1 bg-zinc-900/60 border border-zinc-800/80 rounded-[16px] p-5 items-center mx-1">
              <View className="bg-zinc-800/50 p-2 rounded-full mb-3">
                <ArrowUp size={18} color="#94a3b8" />
              </View>
              <Text className="text-white text-2xl font-bold">{transfer.Tx[0]}</Text>
              <Text className="text-zinc-500 text-[10px] font-bold mt-1 tracking-widest uppercase">{transfer.Tx[1]}</Text>
            </View>

            <View className="flex-1 bg-zinc-900/60 border border-zinc-800/80 rounded-[16px] p-5 items-center mx-1">
              <View className="bg-zinc-800/50 p-2 rounded-full mb-3">
                <ArrowDown size={18} color="#94a3b8" />
              </View>
              <Text className="text-white text-2xl font-bold">{transfer.Rx[0]}</Text>
              <Text className="text-zinc-500 text-[10px] font-bold mt-1 tracking-widest uppercase">{transfer.Rx[1]}</Text>
            </View>

            <View className="flex-1 bg-zinc-900/60 border border-zinc-800/80 rounded-[16px] p-5 items-center mx-1">
              <View className="bg-zinc-800/50 p-2 rounded-full mb-3">
                <Clock size={18} color="#94a3b8" />
              </View>
              <Text className="text-white text-2xl font-bold">{duration}</Text>
              <Text className="text-zinc-500 text-[10px] font-bold mt-1 tracking-widest uppercase">Time</Text>
            </View>
          </View>

        </ScrollView>

        {/* Bottom Home Indicator Bar */}
        <View className="items-center pb-4">
          <View className="w-32 h-1.5 bg-zinc-800 rounded-full" />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}