import { NativeModules, Platform } from 'react-native';

const { WireGuardModule } = NativeModules;

if (!WireGuardModule && Platform.OS === 'android') {
    console.warn("WireGuardModule is not available. Ensure you are running on a device/emulator with the native build.");
}

export default WireGuardModule || {
    // Mock for development in Expo Go or if module missing
    connect: async () => console.log("Mock Connect"),
    disconnect: async () => console.log("Mock Disconnect"),
    getStatus: async () => "DISCONNECTED",
    getStatistics: async () => ({ totalRx: 0, totalTx: 0 })
};
