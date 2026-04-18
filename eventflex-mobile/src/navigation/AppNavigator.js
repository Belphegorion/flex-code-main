import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";

// Import screens (we'll create these later)
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import WorkerDashboard from "../screens/worker/Dashboard";
import OrganizerDashboard from "../screens/organizer/Dashboard";
import SponsorDashboard from "../screens/sponsor/Dashboard";
import ProfileScreen from "../screens/shared/Profile";
import GroupsScreen from "../screens/shared/Groups";
import NotificationScreen from "../screens/shared/Notifications";
import LeaderboardScreen from "../screens/shared/Leaderboard";
import SettingsScreen from "../screens/shared/Settings";
import QRScannerScreen from "../screens/worker/QRScanner";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Worker Tab Navigator
function WorkerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Dashboard") {
            iconName = focused ? "home-outline" : "home-outline";
          } else if (route.name === "Jobs") {
            iconName = focused ? "briefcase-outline" : "briefcase-outline";
          } else if (route.name === "QR Scanner") {
            iconName = focused ? "qrcode-scan" : "qrcode-scan";
          } else if (route.name === "Groups") {
            iconName = focused ? "chat-outline" : "chat-outline";
          } else if (route.name === "Notifications") {
            iconName = focused ? "bell-outline" : "bell-outline";
          } else if (route.name === "Leaderboard") {
            iconName = focused ? "trophy-outline" : "trophy-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "account-outline" : "account-outline";
          }

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: "#4F46E5",
        tabBarInactiveTintColor: "#6B7280",
      })}
    >
      <Tab.Screen name="Dashboard" component={WorkerDashboard} />
      <Tab.Screen name="Jobs" component={() => <div>Jobs Screen</div>} />
      <Tab.Screen name="QR Scanner" component={QRScannerScreen} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
      <Tab.Screen name="Notifications" component={NotificationScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Organizer Tab Navigator
function OrganizerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Dashboard") {
            iconName = focused ? "home-outline" : "home-outline";
          } else if (route.name === "Events") {
            iconName = focused ? "calendar-outline" : "calendar-outline";
          } else if (route.name === "Jobs") {
            iconName = focused ? "briefcase-outline" : "briefcase-outline";
          } else if (route.name === "Groups") {
            iconName = focused ? "chat-outline" : "chat-outline";
          } else if (route.name === "Notifications") {
            iconName = focused ? "bell-outline" : "bell-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "account-outline" : "account-outline";
          }

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: "#4F46E5",
        tabBarInactiveTintColor: "#6B7280",
      })}
    >
      <Tab.Screen name="Dashboard" component={OrganizerDashboard} />
      <Tab.Screen name="Events" component={() => <div>Events Screen</div>} />
      <Tab.Screen name="Jobs" component={() => <div>Jobs Screen</div>} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
      <Tab.Screen name="Notifications" component={NotificationScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Sponsor Tab Navigator
function SponsorTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Dashboard") {
            iconName = focused ? "home-outline" : "home-outline";
          } else if (route.name === "Events") {
            iconName = focused ? "calendar-outline" : "calendar-outline";
          } else if (route.name === "Groups") {
            iconName = focused ? "chat-outline" : "chat-outline";
          } else if (route.name === "Notifications") {
            iconName = focused ? "bell-outline" : "bell-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "account-outline" : "account-outline";
          }

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: "#4F46E5",
        tabBarInactiveTintColor: "#6B7280",
      })}
    >
      <Tab.Screen name="Dashboard" component={SponsorDashboard} />
      <Tab.Screen name="Events" component={() => <div>Events Screen</div>} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
      <Tab.Screen name="Notifications" component={NotificationScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Show loading screen or splash screen
  }

  if (!user) {
    return <AuthStack />;
  }

  // Role-based navigation
  if (user.role === "worker") {
    return <WorkerTabNavigator />;
  } else if (user.role === "organizer") {
    return <OrganizerTabNavigator />;
  } else if (user.role === "sponsor") {
    return <SponsorTabNavigator />;
  } else {
    // Default to worker dashboard for unknown roles
    return <WorkerTabNavigator />;
  }
}
