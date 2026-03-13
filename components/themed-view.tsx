import { ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  safe?: boolean;
};

export function ThemedView({ style, lightColor, darkColor, safe = true, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  if (safe) {
    return <SafeAreaView style={[{ backgroundColor, flex: 1 }, style]} {...otherProps} />;
  }

  return <ThemedViewContainer style={[{ backgroundColor }, style]} {...otherProps} />;
}

// Internal helper to avoid recursion if safe=false
function ThemedViewContainer({ style, ...otherProps }: ViewProps) {
  return <View style={style} {...otherProps} />;
}

import { View } from 'react-native';
