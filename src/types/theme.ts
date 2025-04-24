export type Theme = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

export interface ThemeConfig {
  name: Theme;
  colors: ThemeColors;
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
    fontWeight: {
      normal: number;
      bold: number;
    };
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
  borderRadius: {
    small: string;
    medium: string;
    large: string;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface ThemeContextType {
  theme: Theme;
  themeConfig: ThemeConfig;
  toggleTheme: () => void;
} 