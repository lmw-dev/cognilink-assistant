import { CogniLinkSettings } from '../types/settings';

export const DEFAULT_SETTINGS: CogniLinkSettings = {
  apiProvider: 'openai',
  apiKey: '',
  defaultSystemPrompt:
    'You are a helpful AI assistant that helps users manage and create knowledge in their Obsidian vault.',
  maxContextMessages: 10,
  similarityThreshold: 0.8,
  enableOriginalityCheck: true,
  embeddingModel: 'text-embedding-3-small',
  saveChatsToFolder: 'chats',
};
