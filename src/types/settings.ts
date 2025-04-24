export interface CogniLinkSettings {
  apiProvider: 'openai' | 'anthropic' | 'local';
  apiKey: string;
  defaultSystemPrompt: string;
  maxContextMessages: number;
  similarityThreshold: number;
  enableOriginalityCheck: boolean;
  localModelEndpoint?: string;
  embeddingModel: string;
  saveChatsToFolder: string;
}
