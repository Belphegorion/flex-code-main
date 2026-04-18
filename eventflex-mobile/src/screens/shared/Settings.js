import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../hooks/useTheme"; // We'll need to create this hook
import { colors, typography, radius } from "../../theme";
import Button from "../../components/ui/Button";

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme(); // This would come from a theme context
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => logout() },
    ]);
  };

  // Since we don't have a theme context yet, we'll implement a simple one
  // For now, we'll just toggle a state variable
  const [themeToggle, setThemeToggle] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.settingsContainer}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={styles.settingItem}
            // onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.settingText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            // onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.settingText}>Notifications</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Dark Mode</Text>
            <Switch
              value={themeToggle}
              onValueChange={setThemeToggle}
              thumbColor={isDark ? colors.primary : colors.gray300}
              trackColor={{ false: colors.gray200, true: colors.primaryLight }}
            />
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            // onPress={() => navigation.navigate('Privacy')}
          >
            <Text style={styles.settingText}>Privacy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            // onPress={() => navigation.navigate('Terms')}
          >
            <Text style={styles.settingText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Version 1.0.0</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>EventFlex © 2026</Text>
          </TouchableOpacity>
        </View>

        {/* Action Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.settingItem, styles.dangerItem]}
            onPress={handleLogout}
          >
            <Text style={styles.settingTextDanger}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  title: {
    fontSize: typography["2xl"],
    fontWeight: "700",
    color: colors.gray900,
  },
  settingsContainer: {
    // We can adjust if needed
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: typography.base,
    fontWeight: "600",
    color: colors.gray700,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  settingItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingText: {
    fontSize: typography.base,
    color: colors.gray900,
  },
  settingTextDanger: {
    fontSize: typography.base,
    color: colors.danger,
  },
  dangerItem: {
    // We can adjust if needed
  },
});
