import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, type AppTheme } from '../themes';
import { LocationsScreen } from '../screens/LocationsScreen';
import { LegalityScreen } from '../screens/LegalityScreen';

const Tab = createBottomTabNavigator();

// Per-theme tab bar renderers for maximum differentiation

function DispensaryTabBar({ state, descriptors, navigation }: any) {
  const { theme } = useTheme();
  return (
    <View style={[styles.dispensaryBar, { backgroundColor: theme.tabBg, borderTopColor: theme.tabBorder }]}>
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;
        const icon = route.name === 'Locations' ? 'location' : 'shield';
        return (
          <TouchableOpacity
            key={route.key}
            style={styles.dispensaryTab}
            onPress={() => navigation.navigate(route.name)}
          >
            <Ionicons name={(focused ? icon : `${icon}-outline`) as any} size={20} color={focused ? theme.tabActive : theme.tabInactive} />
            <Text style={{ color: focused ? theme.tabActive : theme.tabInactive, fontSize: 10, fontWeight: '600', marginTop: 3 }}>
              {route.name}
            </Text>
            {focused && <View style={[styles.dispensaryDot, { backgroundColor: theme.tabActive }]} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function UndergroundTabBar({ state, descriptors, navigation }: any) {
  const { theme } = useTheme();
  return (
    <View style={[styles.undergroundBar, { backgroundColor: theme.tabBg, borderTopColor: theme.tabBorder }]}>
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;
        return (
          <TouchableOpacity
            key={route.key}
            style={[styles.undergroundTab, focused && { borderColor: theme.tabActive }]}
            onPress={() => navigation.navigate(route.name)}
          >
            <Text style={{
              color: focused ? theme.tabActive : theme.tabInactive,
              fontFamily: 'Courier New',
              fontSize: 13,
              fontWeight: '700',
              letterSpacing: 2,
            }}>
              {route.name === 'Locations' ? '[ LOC ]' : '[ LAW ]'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function NatureTabBar({ state, descriptors, navigation }: any) {
  const { theme } = useTheme();
  return (
    <View style={[styles.natureBar, { backgroundColor: theme.tabBg }]}>
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;
        const emoji = route.name === 'Locations' ? '🌱' : '📜';
        return (
          <TouchableOpacity
            key={route.key}
            style={[styles.natureTab, focused && { backgroundColor: theme.tabActive + '33' }]}
            onPress={() => navigation.navigate(route.name)}
          >
            <Text style={{ fontSize: 20 }}>{emoji}</Text>
            <Text style={{ color: focused ? theme.tabActive : theme.tabInactive, fontSize: 11, marginTop: 3 }}>
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function NeonTabBar({ state, descriptors, navigation }: any) {
  const { theme } = useTheme();
  return (
    <View style={[styles.neonBar, { backgroundColor: theme.tabBg, borderTopColor: theme.tabBorder }]}>
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;
        return (
          <TouchableOpacity
            key={route.key}
            style={[styles.neonTab, focused && { borderColor: theme.tabActive, shadowColor: theme.tabActive }]}
            onPress={() => navigation.navigate(route.name)}
          >
            <Text style={{
              color: focused ? theme.tabActive : theme.tabInactive,
              fontFamily: 'Courier New',
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 1.5,
              textShadowColor: focused ? theme.tabActive : 'transparent',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: focused ? 8 : 0,
            }}>
              {route.name === 'Locations' ? 'LOCATE' : 'LAWS'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function RetroTabBar({ state, descriptors, navigation }: any) {
  const { theme } = useTheme();
  return (
    <View style={[styles.retroBar, { backgroundColor: theme.tabBg, borderTopColor: '#110801' }]}>
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;
        return (
          <TouchableOpacity
            key={route.key}
            style={[
              styles.retroTab,
              { borderColor: '#110801' },
              focused && { backgroundColor: theme.tabActive },
            ]}
            onPress={() => navigation.navigate(route.name)}
          >
            <Text style={{
              color: focused ? theme.tabBg : theme.tabInactive,
              fontFamily: 'Georgia',
              fontSize: 12,
              fontWeight: '700',
            }}>
              {route.name === 'Locations' ? '✦ FIND' : '✦ LAWS'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const TAB_BARS: Record<string, React.ComponentType<any>> = {
  dispensary: DispensaryTabBar,
  underground: UndergroundTabBar,
  nature: NatureTabBar,
  neon: NeonTabBar,
  retro: RetroTabBar,
};

export function TabNavigator() {
  const { theme } = useTheme();
  const CustomTabBar = TAB_BARS[theme.id] ?? DispensaryTabBar;

  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Locations" component={LocationsScreen} />
      <Tab.Screen name="Legality" component={LegalityScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  // Dispensary: subtle indicator dot
  dispensaryBar: { flexDirection: 'row', borderTopWidth: 1, paddingBottom: 20, paddingTop: 8 },
  dispensaryTab: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  dispensaryDot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },

  // Underground: border outline buttons
  undergroundBar: { flexDirection: 'row', borderTopWidth: 2, padding: 10, gap: 10 },
  undergroundTab: { flex: 1, borderWidth: 1, borderColor: '#252525', paddingVertical: 10, alignItems: 'center' },

  // Nature: rounded pill tabs
  natureBar: { flexDirection: 'row', paddingBottom: 20, paddingTop: 8, paddingHorizontal: 20, gap: 12 },
  natureTab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 20 },

  // Neon: glowing border tabs
  neonBar: { flexDirection: 'row', borderTopWidth: 1, padding: 12, gap: 8 },
  neonTab: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    borderWidth: 1, borderColor: 'transparent',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 6, elevation: 3,
  },

  // Retro: chunky offset button
  retroBar: { flexDirection: 'row', borderTopWidth: 4, padding: 12, gap: 8 },
  retroTab: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    borderWidth: 3, borderBottomWidth: 5, borderRightWidth: 5,
  },
});
