import { AnthropicProvider, AnthropicProviderOptions } from '../AnthropicProvider';
import { Message } from '../../types/message';
import { requestUrl } from 'obsidian';

jest.mock('obsidian', () => ({
  requestUrl: jest.fn(),
}));

describe('AnthropicProvider', () => {
  const options: AnthropicProviderOptions = {
    apiKey: 'test-anthropic-key',
    model: 'claude-2',
    maxTokens: 100,
    temperature: 0.5,
    systemPrompt: 'You are a helpful assistant.'
  };
  const provider = new AnthropicProvider(options);
  const userMessage: Message = {
    id: '1',
    role: 'user',
    content: 'Hello Claude!',
    timestamp: Date.now(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return assistant message on success', async () => {
    (requestUrl as jest.Mock).mockResolvedValue({
      status: 200,
      json: {
        content: [ { text: 'Hi, I am Claude.' } ]
      }
    });
    const res = await provider.sendMessage(userMessage);
    expect(res.role).toBe('assistant');
    expect(res.content).toBe('Hi, I am Claude.');
  });

  it('should return error message on API error', async () => {
    (requestUrl as jest.Mock).mockResolvedValue({ status: 400, text: 'Bad Request', json: {} });
    const res = await provider.sendMessage(userMessage);
    expect(res.role).toBe('error');
    expect(res.content).toMatch(/Anthropic API 调用失败/);
  });

  it('should return mock embedding array', async () => {
    const embedding = await provider.generateEmbeddings('test');
    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding.length).toBe(1536);
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
      expect(result.error).toMatch(/Anthropic API 错误/);
    });

    it('should return valid=false and error on exception', async () => {
      (requestUrl as jest.Mock).mockRejectedValue(new Error('network error'));
      const result = await provider.validateApiKey();
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/network error/);
    });
  });
}); 