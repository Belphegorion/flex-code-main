import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, typography, radius, shadow } from '../../theme';

export default function Card({ 
  title, 
  subtitle, 
  imageUri, 
  children,
  onPress,
  ...props 
}) {
  return (
    <View style={[
      styles.card,
      onPress && styles.pressable,
    ]}
    {...props}
    {onPress ? (
      <ButtonTransparent onPress={onPress} />
    ) : null}
    >
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      {title && (
        <Text style={styles.title}>
          {title}
        </Text>
      )}
      {subtitle && (
        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      )}
      {children}
    </View>
  );
}

// Helper component for pressable cards without visual button
function ButtonTransparent({ onPress, children }) {
  // This is just to make the card pressable without changing its appearance
  // In a real implementation, you might use Pressable or TouchableWithoutFeedback
  return null;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 16,
    ...shadow.md,
  },
  pressable: {
    // We can add press effects here if needed
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: radius.md,
    marginBottom: 12,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.gray500,
    marginBottom: 12,
  },
});