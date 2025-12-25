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
                PrivateKey = yAnz5TF+lXXJte14tji3zlMNq+hd2rYUIgJBgHB3sWM=
                Address = 10.0.0.2/24
                DNS = 8.8.8.8

                [Peer]
                PublicKey = bmXOC+pV1u3zDad9eTB+tKp384n/EwX0q+58HK4BDiA=
                AllowedIPs = 0.0.0.0/0
                Endpoint = 127.0.0.1:51820`;
                await WireGuardModule.connect("demo-tunnel", mockConfig);
                setIsConnected(true);
            }
        } catch (e) {
            console.error(e);
            alert("Connection Failed: " + e.message);
        }
    };

  return (
    <View style={styles.container}>
      <Button title={isConnected ? 'Disconnect' : 'Connect'} onPress={toggleConnection} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});