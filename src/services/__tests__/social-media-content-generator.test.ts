import { SocialMediaContentGenerator } from '../social-media-content-generator';

describe('SocialMediaContentGenerator', () => {
  it('should be defined', () => {
    expect(SocialMediaContentGenerator).toBeDefined();
  });

  it('should create instance successfully', () => {
    // Mock dependencies
    const mockAIService = {} as any;
    const mockEmbeddingService = {} as any;
    const mockTemplateManager = {} as any;
    const mockPostProcessor = {} as any;

    const generator = new SocialMediaContentGenerator(
      mockAIService,
      mockEmbeddingService,
      mockTemplateManager,
      mockPostProcessor
    );

    expect(generator).toBeDefined();
    expect(generator).toBeInstanceOf(SocialMediaContentGenerator);
  });

  it('should have required methods', () => {
    const mockAIService = {} as any;
    const mockEmbeddingService = {} as any;
    const mockTemplateManager = {} as any;
    const mockPostProcessor = {} as any;

    const generator = new SocialMediaContentGenerator(
      mockAIService,
      mockEmbeddingService,
      mockTemplateManager,
      mockPostProcessor
    );

    expect(typeof generator.generateContent).toBe('function');
    expect(typeof generator.generateMultiPlatform).toBe('function');
    expect(typeof generator.getGenerationStats).toBe('function');
    expect(typeof generator.clearCache).toBe('function');
    expect(typeof generator.validateGenerationCapability).toBe('function');
  });
}); 