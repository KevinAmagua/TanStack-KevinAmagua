import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const theme = scheme ?? 'dark';
  const colors = Colors[theme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={'#4f9deb'}
      labelStyle={{ selected: { color: '#4f9deb' } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Libros</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="books.vertical.fill" md="library_books" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="gestor">
        <NativeTabs.Trigger.Label>Libros guardados</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="square.stack.3d.up.fill" md="dashboard" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cache-demo">
        <NativeTabs.Trigger.Label>Cache</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="tray.full.fill" md="storage" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}