import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors, typography, radius } from "../../theme";

export default function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary", // primary, outline, danger
  ...props
}) {
  const buttonStyles = {
    primary: {
      backgroundColor: colors.primary,
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.primary,
    },
    danger: {
      backgroundColor: colors.danger,
    },
  }[variant];

  const textStyles = {
    primary: { color: colors.white },
    outline: { color: colors.primary },
    danger: { color: colors.white },
  }[variant];

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.button,
        buttonStyles,
        disabled && styles.buttonDisabled,
        loading && styles.buttonLoading,
      ]}
      {...props}
    >
      {loading ? (
        <Text style={{ color: colors.white, fontSize: typography.base }}>
          Loading...
        </Text>
      ) : (
        <Text
          style={[
            styles.buttonText,
            textStyles,
            disabled && styles.buttonTextDisabled,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonLoading: {
    // We can add a loading overlay if needed, but for now we just change the text
  },
  buttonText: {
    fontSize: typography.base,
    fontWeight: "600",
  },
  buttonTextDisabled: {
    // Already handled by opacity on the button, but we can adjust text color if needed
  },
});
