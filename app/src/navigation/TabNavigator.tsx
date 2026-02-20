import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { NearMeScreen } from '../screens/NearMeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { StateLawsScreen } from '../screens/StateLawsScreen';
import { Colors, FontSize } from '../constants/theme';

const Tab = createBottomTabNavigator();

type IoniconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<string, { active: IoniconName; inactive: IoniconName }> = {
  NearMe: { active: 'location', inactive: 'location-outline' },
  Search: { active: 'search', inactive: 'search-outline' },
  StateLaws: { active: 'shield', inactive: 'shield-outline' },
};

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.tabBackground,
          borderTopColor: Colors.divider,
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 6,
          height: 60,
        },
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarLabelStyle: {
          fontSize: FontSize.xs,
          marginTop: -2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.active : icons.inactive;
          return <Ionicons name={iconName} size={size - 2} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="NearMe"
        component={NearMeScreen}
        options={{ tabBarLabel: 'Near Me' }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ tabBarLabel: 'Search' }}
      />
      <Tab.Screen
        name="StateLaws"
        component={StateLawsScreen}
        options={{ tabBarLabel: 'State Laws' }}
      />
    </Tab.Navigator>
  );
}
