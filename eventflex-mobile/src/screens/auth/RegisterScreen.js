import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, radius } from '../../theme';

const ROLES = [
  { key: 'worker', label: '👷 Worker', desc: 'Find and apply to event jobs' },
  { key: 'organizer', label: '🎯 Organizer', desc: 'Create events and hire workers' },
  { key: 'sponsor', label: '💼 Sponsor', desc: 'Sponsor events and connect' },
];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: '' });
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.phone || !form.password || !form.role) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      Alert.alert('Error', 'Password must contain uppercase, lowercase and a number');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await register(data);
    } catch (err) {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>⚡ EventFlex</Text>
          <Text style={styles.title}>Create account</Text>
        </View>

        <View style={styles.form}>
          {[
            { key: 'name', label: 'Full Name', placeholder: 'John Doe' },
            { key: 'email', label: 'Email', placeholder: 'you@example.com', keyboard: 'email-address', lower: true },
            { key: 'phone', label: 'Phone', placeholder: '+1 234 567 8900', keyboard: 'phone-pad' },
            { key: 'password', label: 'Password', placeholder: '••••••••', secure: true },
            { key: 'confirmPassword', label: 'Confirm Password', placeholder: '••••••••', secure: true },
          ].map(({ key, label, placeholder, keyboard, lower, secure }) => (
            <View key={key}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                value={form[key]}
                onChangeText={set(key)}
                placeholder={placeholder}
                placeholderTextColor={colors.gray400}
                keyboardType={keyboard || 'default'}
                autoCapitalize={lower ? 'none' : 'words'}
                autoCorrect={false}
                secureTextEntry={!!secure}
              />
            </View>
          ))}

          <Text style={[styles.label, { marginTop: 16 }]}>Select Role</Text>
          <View style={styles.roles}>
            {ROLES.map(r => (
              <TouchableOpacity
                key={r.key}
                style={[styles.roleCard, form.role === r.key && styles.roleCardActive]}
                onPress={() => set('role')(r.key)}
              >
                <Text style={[styles.roleLabel, form.role === r.key && styles.roleLabelActive]}>{r.label}</Text>
                <Text style={[styles.roleDesc, form.role === r.key && styles.roleDescActive]}>{r.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.hint}>Min 8 chars with uppercase, lowercase and number</Text>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
            <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Sign in</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 28, fontWeight: '800', color: colors.primary, marginBottom: 8 },
  title: { fontSize: typography['2xl'], fontWeight: '700', color: colors.gray900 },
  form: { gap: 2 },
  label: { fontSize: typography.sm, fontWeight: '600', color: colors.gray700, marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.md,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: typography.base,
    color: colors.gray900, backgroundColor: colors.gray50,
  },
  roles: { gap: 10, marginTop: 4 },
  roleCard: {
    borderWidth: 1.5, borderColor: colors.gray200, borderRadius: radius.md,
    padding: 14, backgroundColor: colors.gray50,
  },
  roleCardActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  roleLabel: { fontSize: typography.base, fontWeight: '700', color: colors.gray700, marginBottom: 2 },
  roleLabelActive: { color: colors.primary },
  roleDesc: { fontSize: typography.xs, color: colors.gray500 },
  roleDescActive: { color: colors.primaryDark },
  hint: { fontSize: typography.xs, color: colors.gray400, marginTop: 8 },
  btn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 14, alignItems: 'center', marginTop: 24,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.white, fontSize: typography.base, fontWeight: '700' },
  link: { alignItems: 'center', marginTop: 20, marginBottom: 40 },
  linkText: { fontSize: typography.sm, color: colors.gray500 },
  linkBold: { color: colors.primary, fontWeight: '700' },
});
