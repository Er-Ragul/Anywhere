import React from 'react';
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
  Menu, 
  Settings, 
  Power, 
  ChevronRight, 
  ArrowUp, 
  ArrowDown, 
  Clock,
  ShieldPlus 
} from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux'
import { add } from '../redux/variableSlice';
import { useNavigation } from '@react-navigation/native';

export default function VPN() {

  const value = useSelector((state) => state.variable.value)
  const navigation = useNavigation()
  const dispatch = useDispatch()
  console.log('Redux value: ', value);

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
          <TouchableOpacity className="w-12 h-12 bg-zinc-800/40 rounded-2xl items-center justify-center border border-zinc-700/50"
          onPress={() => navigation.navigate('Configuration')}>
            <ShieldPlus size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <Text className="text-zinc-400 font-bold tracking-[3px] text-xs uppercase">
            Anywhere
          </Text>

          <TouchableOpacity className="w-12 h-12 bg-zinc-800/40 rounded-2xl items-center justify-center border border-zinc-700/50">
            <Settings size={24} color="#ffffff" />
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
              Connected
            </Text>
            <Text className="text-zinc-400 text-lg mt-1">
              Germany - DE1
            </Text>
          </View>

          {/* Power Button */}
          <View className="items-center justify-center my-10">
            <View className="w-72 h-72 rounded-full border border-emerald-500/5 items-center justify-center">
              <View className="w-60 h-60 rounded-full border border-emerald-500/10 items-center justify-center">
                <TouchableOpacity 
                  activeOpacity={0.8}
                  className="w-44 h-44 rounded-full bg-emerald-500 items-center justify-center"
                  style={{
                    shadowColor: '#10b981',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.6,
                    shadowRadius: 30,
                    elevation: 15,
                  }}
                  onPress={() => dispatch(add('Value from screen'))}
                >
                  <Power size={60} color="white" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Current Server Card */}
          <View className="px-6 mb-6">
            <TouchableOpacity className="bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-[36px] flex-row items-center">
              <View className="w-14 h-11 bg-zinc-800 rounded-xl overflow-hidden">
                <View className="h-1/3 bg-black" />
                <View className="h-1/3 bg-red-600" />
                <View className="h-1/3 bg-yellow-400" />
              </View>
              
              <View className="flex-1 ml-4">
                <Text className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mb-0.5">
                  Current Server
                </Text>
                <Text className="text-white text-lg font-bold">
                  Germany - DE1
                </Text>
              </View>

              <View className="bg-zinc-800/80 p-2.5 rounded-full">
                <ChevronRight size={20} color="#64748b" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View className="flex-row px-5 justify-between">
            <View className="flex-1 bg-zinc-900/60 border border-zinc-800/80 rounded-[32px] p-5 items-center mx-1">
              <View className="bg-zinc-800/50 p-2 rounded-full mb-3">
                <ArrowUp size={18} color="#94a3b8" />
              </View>
              <Text className="text-white text-2xl font-bold">24</Text>
              <Text className="text-zinc-500 text-[10px] font-bold mt-1 tracking-widest uppercase">MB/S</Text>
            </View>

            <View className="flex-1 bg-zinc-900/60 border border-zinc-800/80 rounded-[32px] p-5 items-center mx-1">
              <View className="bg-zinc-800/50 p-2 rounded-full mb-3">
                <ArrowDown size={18} color="#94a3b8" />
              </View>
              <Text className="text-white text-2xl font-bold">102</Text>
              <Text className="text-zinc-500 text-[10px] font-bold mt-1 tracking-widest uppercase">MB/S</Text>
            </View>

            <View className="flex-1 bg-zinc-900/60 border border-zinc-800/80 rounded-[32px] p-5 items-center mx-1">
              <View className="bg-zinc-800/50 p-2 rounded-full mb-3">
                <Clock size={18} color="#94a3b8" />
              </View>
              <Text className="text-white text-2xl font-bold">42:15</Text>
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