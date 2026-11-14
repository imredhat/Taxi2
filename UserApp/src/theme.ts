import { Platform, type TextStyle, type ViewStyle } from 'react-native';

// React Native Web maps writingDirection to CSS direction; native layouts use direction.
export const ltrLayout: ViewStyle & TextStyle = Platform.OS === 'web'
  ? { writingDirection: 'ltr' }
  : { direction: 'ltr' };

export const rtlLayout: ViewStyle & TextStyle = Platform.OS === 'web'
  ? { writingDirection: 'rtl' }
  : { direction: 'rtl' };

// Android resolves left/right text alignment against the paragraph layout direction.
export const rightAlignedText: ViewStyle & TextStyle = {
  ...(Platform.OS === 'android' ? { direction: 'ltr' } : {}),
  writingDirection: 'rtl',
  textAlign: 'right',
};

export const colors = {
  background: '#f8faf9',
  surface: '#ffffff',
  surfaceDim: '#f4f7f5',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#ffffff',
  surfaceContainer: '#ffffff',
  surfaceContainerHigh: '#eef3f1',
  surfaceContainerHighest: '#e9efed',
  surfaceVariant: '#dfe8e4',
  surfaceBright: '#ffffff',
  asphaltSurface: '#ffffff',
  midnightRoad: '#f8faf9',

  primary: '#07846c',
  onPrimary: '#ffffff',
  primaryContainer: '#07846c',
  onPrimaryContainer: '#ffffff',
  primaryFixed: '#e1f6f0',
  primaryFixedDim: '#c6eade',
  inversePrimary: '#05a987',
  surfaceTint: '#07846c',

  onSurface: '#17212a',
  onSurfaceVariant: '#71817d',
  onBackground: '#14211f',

  secondary: '#07846c',
  secondaryContainer: '#eaf8f4',
  onSecondary: '#075b4b',

  tertiary: '#6e4b00',
  tertiaryContainer: '#fff1cf',

  safetyTeal: '#07846c',

  error: '#b42318',
  errorRed: '#b42318',
  errorContainer: '#fff1f0',
  onError: '#ffffff',
  onErrorContainer: '#b42318',

  outline: '#c6d4d0',
  outlineVariant: '#e1ebe7',

  white: '#ffffff',
  black: '#000000',
};

export const fonts = {
  regular: 'Estedad-Regular',
  medium: 'Estedad-Medium',
  semiBold: 'Estedad-SemiBold',
  bold: 'Estedad-Bold',
  extraBold: 'Estedad-ExtraBold',
  black: 'Estedad-Black',
};
