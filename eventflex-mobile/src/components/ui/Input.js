import React from "react";
import { TextInput, View, Text, StyleSheet } from "react-native";
import { colors, typography, radius } from "../../theme";

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  autoCorrect = false,
  error = null,
  ...props
}) {
  return (
    <View style={styles.inputContainer}>
      {label && (
        <Text style={[styles.label, error && styles.labelError]}>{label}</Text>
      )}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor={colors.gray400}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: typography.sm,
    fontWeight: "600",
    color: colors.gray700,
    marginBottom: 6,
  },
  labelError: {
    color: colors.danger,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: typography.base,
    color: colors.gray900,
    backgroundColor: colors.gray50,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    fontSize: typography.xs,
    color: colors.danger,
    marginTop: 4,
  },
});
