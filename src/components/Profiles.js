import React, { useEffect, useState } from 'react';
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
  Modal
} from 'react-native';
import { 
  ArrowLeft, 
  Plus,  
  Router,
  QrCode,
  Trash2,
  Server, 
  LayersPlus
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Profiles() {

  let navigation = useNavigation()
  let [profiles, setProfiles] = useState([])
  let [power, setPower] = useState(false)
  let [modal, setModal] = useState(false)

  useEffect(() => {
    savedProfiles()
  }, [])

  const savedProfiles = async() => {
    let saved = await AsyncStorage.getItem('profiles');
    setProfiles(JSON.parse(saved))
  }

  let ModalViewer = () => {
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
                        // Avoids the view jumping on Android
                        underlineColorAndroid="transparent"
                        />
                    </View>
                    </View>

                    {/* Connect Button */}
                    <TouchableOpacity 
                    activeOpacity={0.9}
                    className="bg-white h-[56px] rounded-[24px] flex-row items-center justify-center mt-4 shadow-lg shadow-white/10"
                    onPress={() => setModal(!modal)}
                    >
                    <Text className="text-black text-xl font-black mr-2">Add</Text>
                    <LayersPlus size={22} color="black" strokeWidth={3} />
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

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
      <SafeAreaView 
        className="flex-1"
        style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 py-4">
          <View className="flex-row gap-x-3">
            {/* <TouchableOpacity className="w-10 h-10 bg-zinc-800 rounded-full items-center justify-center">
              <Contrast size={20} color="white" />
            </TouchableOpacity> */}
            <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center" onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-white text-2xl font-bold tracking-tight">
            Anywhere Hub
          </Text>
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
              <Text className="text-zinc-400 text-xs font-bold">4</Text>
            </View>
          </View>

          {/* Configuration List */}
          <View className="gap-y-4">
            {/* Item 1 */}
            <View className="bg-zinc-900 border border-zinc-800 p-5 rounded-[10px] flex-row items-center">
              <View className="w-12 h-12 bg-zinc-800 rounded-2xl items-center justify-center">
                <Router size={22} color="white" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-white font-bold my-1">Gaming Private Net</Text>
                <Text className="text-zinc-500 text-xs font-mono my-1">192.168.50.1</Text>
              </View>
              <TouchableOpacity className="mx-2">
                <Trash2 size={22} color="white" />
              </TouchableOpacity>
              <TouchableOpacity className="mx-2">
                <QrCode size={22} color="white" />
              </TouchableOpacity>
              <TouchableOpacity className={`ml-2 w-12 h-7 bg-black rounded-full px-1 justify-center ${power ? 'items-end' : 'items-start'} border border-zinc-800`} onPress={() => setPower(!power)}>
                <View className="w-5 h-5 bg-white rounded-full" />
              </TouchableOpacity>
            </View>
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
      <ModalViewer />
    </View>
  );
}