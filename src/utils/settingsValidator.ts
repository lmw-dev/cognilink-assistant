import { PluginSettings, AIProvider } from '../types/settings';

export function validateSettings(settings: PluginSettings): boolean {
  // Validate API key if AI provider requires it
  if (settings.ai.provider === 'anthropic' && !settings.ai.anthropicApiKey) {
    return false;
  }

  // Validate UI settings
  if (settings.ui) {
    const { fontSize, messageSpacing } = settings.ui;
    const fontSizeNum = typeof fontSize === 'string' ? parseInt(fontSize, 10) : fontSize;
    const spacingNum = typeof messageSpacing === 'string' ? parseInt(messageSpacing, 10) : messageSpacing;
    
    if (isNaN(fontSizeNum) || fontSizeNum < 12 || fontSizeNum > 24) return false;
    if (isNaN(spacingNum) || spacingNum < 4 || spacingNum > 24) return false;
  }

  // Validate shortcuts
  if (settings.shortcuts) {
    const shortcuts = Object.values(settings.shortcuts);
    const uniqueShortcuts = new Set(shortcuts);
    if (shortcuts.length !== uniqueShortcuts.size) {
      return false; // Duplicate shortcuts found
    }
  }

  return true;
} 