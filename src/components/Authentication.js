import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  StatusBar,
  Modal,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Eye,
  Shield, 
  Server, 
  Lock, 
  EyeOff, 
  ArrowRight 
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';

export default function Authentication(){

  const navigation = useNavigation()
  let [loader, setLoader] = useState(true)
  let [fqdn, setFqdn] = useState(null)
  let [password, setPassword] = useState(null)
  let [relogin, setRelogin] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    checkForHub()
  }, [])


  let checkForHub = async() => {
    let hub = await AsyncStorage.getItem('anywhere-hub')

    if(hub != null){
      let login = JSON.parse(hub)['login']
      if(login){
        navigation.replace('Profile')
      }
      else{
        setRelogin(true)
        setFqdn(JSON.parse(hub)['endpoint'])
        setLoader(false)
      }
    }
    else{
      setLoader(false)
    }
  }

  let register = async() => {
    if(fqdn != null){
      if(password != null){
        let hub = await AsyncStorage.getItem('anywhere-hub')

        if(hub != null){
          try{
            let response = await axios.post(`http://${fqdn}/webhook/register`, {
              uid: JSON.parse(hub)['uid'],
              password: password,
            })
            
            if(response.data.status == 'success'){
              hub = JSON.parse(hub)
              hub['login'] = true
              hub['token'] = response.data.result.token
              await AsyncStorage.setItem('anywhere-hub', JSON.stringify(hub))
              navigation.replace('Profile')
            }
            else if(response.data.status == 'failed'){
              Alert.alert('Invalid Password')
            }
          }
          catch(err){
            console.log(err);
          }
        }
        else{
          try{
            let response = await axios.post(`http://${fqdn}/webhook/register`, {
              interface: "wg0",
              endpoint: fqdn,
              password: password,
              uid: 'noid'
            })
            
            if(response.data.status == 'success'){
              await AsyncStorage.setItem('anywhere-hub', JSON.stringify({
                uid: response.data.result.uid,
                id: response.data.result.id,
                endpoint: fqdn,
                token: response.data.result.token,
                key: response.data.result.key,
                login: true
              }))
              console.log({
                uid: response.data.result.uid,
                id: response.data.result.id,
                endpoint: fqdn,
                token: response.data.result.token,
                key: response.data.result.key,
                login: true
              });
              navigation.navigate('Profile')
            }
          }
          catch(err){
            console.log(err);
          }
        }
      }
      else{
        Alert.alert('Password field should not be empty')
      }
    }
    else{
      Alert.alert('Server field should not be empty')
    }
  }

  if(loader){
    return(
      <View className="flex-1 bg-[#0a0a0b">
        <LinearGradient
          colors={['#1f2128', '#0a0a0b']}
          className="absolute inset-0"
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.4 }}
        />
        <SafeAreaView className="flex-1 max-w-3xl self-center">
          <View className="flex-1 justify-center px-10 py-10">
                {/* Logo Section */}
                <View className="items-center">
                  <LottieView
                    autoPlay={true}
                    style={{
                      width: 400,
                      height: 400,
                    }}
                    source={require('../../assets/loading.json')}
                  />
                </View>
            </View>
        </SafeAreaView>
      </View>
    )
  }
  else{
    return (
      <View className="flex-1 bg-[#0a0a0b]">
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        
        <LinearGradient
          colors={['#1f2128', '#0a0a0b']}
          className="absolute inset-0"
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.4 }}
        />

        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'android' ? StatusBar.currentHeight : 0}
          >
            <ScrollView 
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* 
                UPDATED CONTAINER: 
                1. w-full: Ensures it takes full width on phones.
                2. max-w-md: Limits width on tablets (approx 448px). 
                3. self-center: Centers the container horizontally in the ScrollView.
              */}
              <View className="flex-1 justify-center px-7 py-10 w-full max-w-md self-center">
                
                {/* Logo Section */}
                <View className="items-center mb-10">
                  <View className="w-28 h-28 bg-[#1a1b21] rounded-[32px] border border-zinc-800/50 items-center justify-center shadow-2xl">
                    <View className="relative">
                      <Shield size={44} color="#f4f4f5" strokeWidth={1.5} />
                      <View className="absolute inset-0 items-center justify-center pt-1">
                        <Lock size={18} color="#f4f4f5" strokeWidth={2.5} />
                      </View>
                    </View>
                  </View>
                  
                  <Text className="text-white text-4xl font-bold mt-10 tracking-tight text-center">
                    Anywhere Hub
                  </Text>
                  <Text className="text-zinc-500 text-lg mt-2 text-center font-medium">
                    Secure connection to your private network
                  </Text>
                </View>

                {/* Form Section */}
                <View className="gap-y-6">
                  {/* Server Input */}
                  <View>
                    <Text className="text-zinc-500 text-[10px] font-bold tracking-[2px] uppercase mb-3 ml-1">
                      SERVER FQDN / IP
                    </Text>
                    <View className="flex-row items-center bg-[#131418] border border-zinc-800/60 rounded-2xl px-5">
                      <Server size={20} color="#52525b" />
                      <TextInput
                        value={fqdn}
                        placeholder="Ex: vpn.anywhere.in"
                        placeholderTextColor="#3f3f46"
                        className="flex-1 text-white h-16 ml-3 text-base"
                        autoCapitalize="none"
                        underlineColorAndroid="transparent"
                        onChangeText={(value) => setFqdn(value)}
                        editable={!relogin}
                      />
                    </View>
                  </View>

                  {/* Password Input */}
                  <View>
                    <Text className="text-zinc-500 text-[10px] font-bold tracking-[2px] uppercase mb-3 ml-1">
                      Password
                    </Text>
                    <View className="flex-row items-center bg-[#131418] border border-zinc-800/60 rounded-2xl px-5">
                      <Lock size={20} color="#52525b" />
                      <TextInput
                        value={password}
                        placeholder="Enter password"
                        placeholderTextColor="#3f3f46"
                        secureTextEntry={!passwordVisible}
                        className="flex-1 text-white h-16 ml-3 text-base"
                        underlineColorAndroid="transparent"
                        onChangeText={(value) => setPassword(value)}
                      />
                      <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                        { passwordVisible ? <Eye size={20} color="#52525b" /> : <EyeOff size={20} color="#52525b" /> }
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Connect Button */}
                  <TouchableOpacity 
                    activeOpacity={0.9}
                    className="bg-white h-[56px] rounded-[24px] flex-row items-center justify-center mt-4 shadow-lg shadow-white/10"
                    onPress={register}
                  >
                    <Text className="text-black text-xl font-black mr-2">{ relogin ? 'Login' : 'Register' }</Text>
                    <ArrowRight size={22} color="black" strokeWidth={3} />
                  </TouchableOpacity>
                </View>
          
                  {/* Divider */}
                  <View className="flex-row items-center my-10 px-4">
                      <View className="flex-1 h-[1px] bg-zinc-800/50" />
                      <Text className="text-zinc-600 mx-4 font-bold text-[10px] tracking-widest">OR</Text>
                      <View className="flex-1 h-[1px] bg-zinc-800/50" />
                  </View>

                  {/* Import Button */}
                  <TouchableOpacity 
                      activeOpacity={0.7}
                      className="bg-transparent border border-zinc-800/80 h-16 rounded-[20px] flex-row items-center justify-center"
                      onPress={() => navigation.navigate('VPN')}
                      >
                      <Text className="text-zinc-300 font-bold text-base">
                          VPN Client
                      </Text>
                  </TouchableOpacity>

                {/* Version Info */}
                <View className="mt-12 items-center">
                  <Text className="text-zinc-700 text-xs font-semibold">
                    Version 1.0.0
                  </Text>
                </View>

              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    );
  }
}