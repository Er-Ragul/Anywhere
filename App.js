import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';

import Home from "./src/components/Home";
import VPN from "./src/components/VPN";
import Connections from "./src/components/Connections";
import Configuration from "./src/components/Configuration";

const RootStack = createNativeStackNavigator({
  initialRouteName: 'VPN',
  screenOptions: {
    headerShown: false
  },
  screens: {
    VPN: VPN,
    Connection: Connections,
    Configuration: Configuration
  },
});

const Navigation = createStaticNavigation(RootStack);

export default function App() {
  return (
    <Provider store={store}>
      <Navigation />
    </Provider>
  );
}