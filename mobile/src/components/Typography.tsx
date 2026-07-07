import React, { PropsWithChildren } from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { colors } from '../theme/colors';

export function Title({ children, style, ...props }: PropsWithChildren<TextProps>) {
  return (
    <Text {...props} style={[styles.title, style]}>
      {children}
    </Text>
  );
}

export function Body({ children, style, ...props }: PropsWithChildren<TextProps>) {
  return (
    <Text {...props} style={[styles.body, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  body: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
});