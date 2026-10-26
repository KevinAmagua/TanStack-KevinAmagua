import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';
import { useColorScheme } from 'react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const theme = scheme ?? 'light';
  const colors = Colors[theme];

  return (
    <Tabs>
      <TabSlot />
      <TabList style={styles.tabList}>
        <TabTrigger name="index" href="/" asChild>
          <Pressable style={({ pressed }) => [styles.tabButton, { opacity: pressed ? 0.7 : 1 }]}>
            <Text accessibilityElementsHidden style={[styles.tabIcon, { color: colors.text }]}>⌂</Text>
            <Text style={[styles.tabLabel, { color: colors.text }]}>Libros</Text>
          </Pressable>
        </TabTrigger>
        <TabTrigger name="gestor" href="/gestor" asChild>
          <Pressable style={({ pressed }) => [styles.tabButton, { opacity: pressed ? 0.7 : 1 }]}>
            <Text accessibilityElementsHidden style={[styles.tabIcon, { color: colors.text }]}>♥</Text>
            <Text style={[styles.tabLabel, { color: colors.text }]}>Libros guardados</Text>
          </Pressable>
        </TabTrigger>
        <TabTrigger name="cache-demo" href="/(tabs)/cache-demo" asChild>
          <Pressable style={({ pressed }) => [styles.tabButton, { opacity: pressed ? 0.7 : 1 }]}>
            <Text accessibilityElementsHidden style={[styles.tabIcon, { color: colors.text }]}>⌕</Text>
            <Text style={[styles.tabLabel, { color: colors.text }]}>Caché</Text>
          </Pressable>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabList: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  tabIcon: {
    fontSize: 22,
    lineHeight: 24,
  },
});