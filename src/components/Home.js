import '../../global.css';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import WireGuardModule from '../wireguard/WireGuardModule';

export default function Home() {

    let [isConnected, setIsConnected] = useState(false)

    const toggleConnection = async () => {
        try {
            if (isConnected) {
                await WireGuardModule.disconnect("demo-tunnel");
                setIsConnected(false);
            } else {
                // Valid Mock Config
                const mockConfig = `[Interface]
                PrivateKey = cA7jK3rZNT9JDbo7/l5fHghWE1/ac3Cfvn7VI8cTgEY=
                Address = 10.0.0.2/24

                [Peer]
                PublicKey = RqdFmo32waIHq/xH4Bux6XoSePJxWnuz8skYIM2+kD0=
                AllowedIPs = 0.0.0.0/0
                Endpoint = 192.168.52.134:51820`;
                await WireGuardModule.connect("demo-tunnel", mockConfig);
                setIsConnected(true);
            }
        } catch (e) {
            console.error(e);
            alert("Connection Failed: " + e.message);
        }
    };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind!
      </Text>
      <Button title={isConnected ? 'Disconnect' : 'Connect'} onPress={toggleConnection} />
      <StatusBar style="auto" />
    </View>
  );
}