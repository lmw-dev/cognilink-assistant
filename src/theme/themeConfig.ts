import { ThemeConfig } from '../types/theme';

export const lightTheme: ThemeConfig = {
  name: 'light',
  colors: {
    primary: '#1677ff',
    secondary: '#69b1ff',
    background: '#ffffff',
    text: '#000000',
    border: '#d9d9d9',
    error: '#ff4d4f',
    warning: '#faad14',
    success: '#52c41a',
    info: '#1677ff',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      small: '12px',
      medium: '14px',
      large: '16px',
    },
    fontWeight: {
      normal: 400,
      bold: 600,
    },
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
  borderRadius: {
    small: '2px',
    medium: '4px',
    large: '8px',
  },
  shadows: {
    small: '0 1px 2px rgba(0, 0, 0, 0.05)',
    medium: '0 2px 4px rgba(0, 0, 0, 0.1)',
    large: '0 4px 8px rgba(0, 0, 0, 0.15)',
  },
};

export const darkTheme: ThemeConfig = {
  name: 'dark',
  colors: {
    primary: '#1668dc',
    secondary: '#4096ff',
    background: '#141414',
    text: '#ffffff',
    border: '#424242',
    error: '#a61d24',
    warning: '#d89614',
    success: '#49aa19',
    info: '#1668dc',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      small: '12px',
      medium: '14px',
      large: '16px',
    },
    fontWeight: {
      normal: 400,
      bold: 600,
    },
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
  borderRadius: {
    small: '2px',
    medium: '4px',
    large: '8px',
  },
  shadows: {
    small: '0 1px 2px rgba(255, 255, 255, 0.05)',
    medium: '0 2px 4px rgba(255, 255, 255, 0.1)',
    large: '0 4px 8px rgba(255, 255, 255, 0.15)',
  },
}; 