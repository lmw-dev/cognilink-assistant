import { OpenAIProvider, OpenAIProviderOptions } from '../OpenAIProvider';
import { Message } from '../../types/message';
import { requestUrl } from 'obsidian';

jest.mock('obsidian', () => ({
  requestUrl: jest.fn(),
}));

describe('OpenAIProvider', () => {
  const options: OpenAIProviderOptions = {
    apiKey: 'test-key',
    endpoint: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo',
    maxTokens: 100,
    temperature: 0.5,
    systemPrompt: 'You are a helpful assistant.'
  };
  const provider = new OpenAIProvider(options);
  const userMessage: Message = {
    id: '1',
    role: 'user',
    content: 'Hello!',
    timestamp: Date.now(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return assistant message on success', async () => {
    (requestUrl as jest.Mock).mockResolvedValue({
      status: 200,
      json: {
        choices: [
          { message: { content: 'Hi there!' } }
        ]
      }
    });
    const res = await provider.sendMessage(userMessage);
    expect(res.role).toBe('assistant');
    expect(res.content).toBe('Hi there!');
  });

  it('should return error message on API error', async () => {
    (requestUrl as jest.Mock).mockResolvedValue({ status: 400, text: 'Bad Request', json: {} });
    const res = await provider.sendMessage(userMessage);
    expect(res.role).toBe('error');
    expect(res.content).toMatch(/OpenAI API 调用失败/);
  });

  it('should return embedding array on success', async () => {
    (requestUrl as jest.Mock).mockResolvedValue({
      status: 200,
      json: {
        data: [ { embedding: [0.1, 0.2, 0.3] } ]
      }
    });
    const embedding = await provider.generateEmbeddings('test');
    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding.length).toBe(3);
  });

  it('should return empty array on embedding API error', async () => {
    (requestUrl as jest.Mock).mockResolvedValue({ status: 400, text: 'Bad Request', json: {} });
    const embedding = await provider.generateEmbeddings('test');
    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding.length).toBe(0);
  });

  describe('validateApiKey', () => {
    it('should return valid=true when API key is valid (status 200)', async () => {
      (requestUrl as jest.Mock).mockResolvedValue({ status: 200 });
      const result = await provider.validateApiKey();
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid=false and error when status is 401', async () => {
      (requestUrl as jest.Mock).mockResolvedValue({ status: 401 });
      const result = await provider.validateApiKey();
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/无效/);
    });

    it('should return valid=false and error when status is 403', async () => {
      (requestUrl as jest.Mock).mockResolvedValue({ status: 403 });
      const result = await provider.validateApiKey();
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/无效/);
    });

    it('should return valid=false and error for other non-200 status', async () => {
      (requestUrl as jest.Mock).mockResolvedValue({ status: 500 });
      const result = await provider.validateApiKey();
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/OpenAI API 错误/);
    });

    it('should return valid=false and error on exception', async () => {
      (requestUrl as jest.Mock).mockRejectedValue(new Error('network error'));
      const result = await provider.validateApiKey();
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/network error/);
    });
  });
}); 