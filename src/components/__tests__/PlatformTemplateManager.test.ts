import { PlatformId, AdvancedPromptTemplate, PromptCategory, PromptVariable, FewShotExample, QualityRule, AntiAIDetectionStrategy, LanguageNaturalizationSettings, PersonalizationSettings, ImperfectionSettings } from '../../types/prompt-advanced';
import { PluginSettings, UISettings, AISettings, EmbeddingSettings, Shortcuts, RAGSettings, PromptModuleSettings, AIProvider, Theme, MessageSpacing } from '../../types/settings';
import { EmbeddingProvider } from '../../constants/ai-models';
import { processImportedTemplates } from '../PlatformTemplateManager';
import { SocialMediaPlatform } from '../../types/social-media';
import { Modal, Notice, Setting, TextAreaComponent, TFile, ButtonComponent, TextComponent } from 'obsidian';
// import { AdvancedPromptBody, ADVANCED_PROMPT_CATEGORIES } from '../../types/prompt-advanced';
import { deepCopy as actualDeepCopy } from '../../utils/deep-copy'; // Import for use in test helpers

// Helper function, needs to be defined before jest.mock if used by inlined mock data
function createMockAntiAISettings(): AntiAIDetectionStrategy {
    return {
        languageNaturalization: { enabled: false, sentenceVariation: { enabled: false, level: 0, patterns: [] }, colloquialLevel: { enabled: false, intensity: 0, targetExpressions: [] }, emotionalNuance: { enabled: false, depth: 0, emotionalMarkers: [] } } as LanguageNaturalizationSettings,
        personalizationInjection: { enabled: false, userStyleMimicry: { enabled: false, styleProfile: {}, adaptationLevel: 0 }, personalExperience: { enabled: false, experienceLevel: 0, contextualRelevance: 0 }, uniquePerspective: { enabled: false, originalityLevel: 0, viewpointDiversity: 0 } } as PersonalizationSettings,
        moderateImperfection: { enabled: false, minorInconsistency: { enabled: false, frequency: 0, types: [] }, naturalPauses: { enabled: false, frequency: 0, pauseTypes: [] }, colloquialErrors: { enabled: false, frequency: 0, errorTypes: [] } } as ImperfectionSettings,
    };
}

// Mock dependencies
jest.mock('obsidian', () => ({
  Notice: jest.fn(),
  Modal: jest.fn().mockImplementation(() => ({
    open: jest.fn(),
    close: jest.fn(),
    contentEl: { empty: jest.fn(), createEl: jest.fn().mockReturnThis(), appendChild: jest.fn() }, // Basic mock for contentEl
  })),
  Setting: jest.fn().mockImplementation(() => ({
    setName: jest.fn().mockReturnThis(),
    setDesc: jest.fn().mockReturnThis(),
    addText: jest.fn().mockReturnThis(),
    addButton: jest.fn().mockReturnThis(),
    addDropdown: jest.fn().mockReturnThis(),
    setClass: jest.fn().mockReturnThis(),
    setTooltip: jest.fn().mockReturnThis(), // Mock setTooltip here
  })),
  TextAreaComponent: jest.fn().mockImplementation(() => ({
    setValue: jest.fn().mockReturnThis(),
    setDisabled: jest.fn().mockReturnThis(),
    setPlaceholder: jest.fn().mockReturnThis(),
    inputEl: { style: {} }
  })),
  TFile: jest.fn(),
  App: jest.fn(),
  PluginSettingTab: jest.fn(),
  DropdownComponent: jest.fn(),
  setIcon: jest.fn(),
  setTooltip: jest.fn(), // Also mock global setTooltip if used directly
}));

// Inline MOCKED_ADVANCED_PLATFORM_TEMPLATES directly into the mock
jest.mock('../../config/advanced-platform-templates', () => ({
  ADVANCED_PLATFORM_TEMPLATES: [
    { id: 'built-in-1', name: 'Built-in Template 1', platform: 'blog', category: 'general' as PromptCategory, systemPrompt: 'System1', taskPrompt:'', contextPrompt:'', outputPrompt:'', tags:[], variables:[], examples:[], qualityRules:[], antiAISettings: createMockAntiAISettings(), version:'1', createdAt: new Date(), updatedAt: new Date(), usageCount:0 },
  ],
}));

// Mock '../../utils/deep-copy'
jest.mock('../../utils/deep-copy', () => ({
  deepCopy: jest.fn(obj => JSON.parse(JSON.stringify(obj))),
}));

// Mock '../../utils/confirm-modal'
jest.mock('../../utils/confirm-modal', () => ({
  showConfirmModal: jest.fn().mockResolvedValue(true),
}));

// After all jest.mock calls, acquire the mock functions for assertions
const { deepCopy: acquiredMockDeepCopy } = require('../../utils/deep-copy');
const { showConfirmModal: acquiredMockShowConfirmModal } = require('../../utils/confirm-modal');

// Re-declare or import necessary types and constants for the test file scope
const ALL_DEFINED_PLATFORMS_FOR_MANAGER: PlatformId[] = [
    'xiaohongshu', 'twitter', 'wechat', 'blog', 'toutiao', 'zhihu', 'douyin', 'linkedin'
];

// Simulate module-level state and functions for testing purposes
// In a real scenario, you might need to export these or use a special test build
// or use @ts-ignore if directly importing and testing non-exported module internals (not ideal)
let testCustomTemplates: AdvancedPromptTemplate[] = [];
let testDefaultTemplatesByPlatform: Record<PlatformId, string | null> = {} as Record<PlatformId, string | null>;
let testCurrentProps: { settings: PluginSettings, onSettingsChange: jest.Mock } | null = null;

function initializeManagerState_forTest(props: any) {
    testCurrentProps = props;
    testCustomTemplates = JSON.parse(JSON.stringify(props.settings.customAdvancedTemplates || []));
    const loadedDefaults = props.settings.defaultAdvancedTemplates || {};
    testDefaultTemplatesByPlatform = ALL_DEFINED_PLATFORMS_FOR_MANAGER.reduce((acc, platformId) => {
        acc[platformId] = loadedDefaults[platformId] || null;
        return acc;
    }, {} as Record<PlatformId, string | null>);
}

async function saveChanges_forTest() {
  if (!testCurrentProps) throw new Error("Props not initialized");
  testCurrentProps.settings.customAdvancedTemplates = actualDeepCopy(testCustomTemplates);
  testCurrentProps.settings.defaultAdvancedTemplates = actualDeepCopy(testDefaultTemplatesByPlatform);
  await testCurrentProps.onSettingsChange(testCurrentProps.settings);
}

function getAllTemplates_forTest(): AdvancedPromptTemplate[] {
  // The mock for ../../config/advanced-platform-templates will provide the mocked built-in templates
  const mockedBuiltIn = require('../../config/advanced-platform-templates').ADVANCED_PLATFORM_TEMPLATES;
  return [...mockedBuiltIn, ...testCustomTemplates];
}

describe('PlatformTemplateManager Logic', () => {
  let mockPluginSettings: PluginSettings;
  let mockOnSettingsChange: jest.Mock;
  let MOCKED_BUILT_IN_TEMPLATES_FOR_TEST_SCOPE: AdvancedPromptTemplate[]; // To access the inlined mock value in tests

  beforeAll(() => {
    // Capture the inlined mock value for use in tests
    MOCKED_BUILT_IN_TEMPLATES_FOR_TEST_SCOPE = require('../../config/advanced-platform-templates').ADVANCED_PLATFORM_TEMPLATES;
  });

  beforeEach(() => {
    // Reset mocks and state before each test
    jest.clearAllMocks();
    acquiredMockDeepCopy.mockClear(); 
    acquiredMockShowConfirmModal.mockClear();
    testCustomTemplates = [];
    testDefaultTemplatesByPlatform = ALL_DEFINED_PLATFORMS_FOR_MANAGER.reduce((acc, p) => {
        acc[p] = null;
        return acc;
    }, {} as Record<PlatformId, string | null>); 
    mockOnSettingsChange = jest.fn().mockResolvedValue(undefined);
    testCurrentProps = null; 

    const defaultShortcut = { key: '', modifiers: [] };
    const defaultUISettings: UISettings = { theme: 'system' as Theme, fontSize: 16, fontFamily:'Arial', messageSpacing: 'comfortable' as MessageSpacing, showTimestamp: true, enableAnimations: true };
    const defaultAISettings: AISettings = { provider: 'openai' as AIProvider, model: 'claude-2' as any, anthropicApiKey:'', openAIApiKey: '', geminiApiKey:'', deepseekApiKey:'', temperature: 0.7, maxTokens: 2000, defaultSystemPrompt: '' };
    const defaultEmbeddingSettings: EmbeddingSettings = {
      embeddingProvider: 'openai',
      openai: {
        apiKey: '',
        model: 'text-embedding-ada-002',
        endpoint: 'https://api.openai.com/v1',
      },
      gemini: {
        apiKey: '',
        model: 'gemini-embedding-exp-03-07',
        endpoint: 'https://generativelanguage.googleapis.com',
      },
    };
    const defaultShortcuts: Shortcuts = { toggleChat: defaultShortcut, sendMessage: defaultShortcut, newChat: defaultShortcut, clearChat: defaultShortcut };
    const defaultRAGSettings: RAGSettings = { topK: 5, threshold: 0.7, dedupThreshold: 0.9, originality: { threshold: 0.8, granularity: 'paragraph'} };
    const defaultPromptModuleSettings: PromptModuleSettings = { 
        enabled: true, templates: [], enableValidation: true, enablePerformanceTracking: false, enableCache: true, cacheSize: 100, cacheTTL: 3600000, 
        maxTemplates: 100, autoBackup: false, backupInterval: 24,
        defaultAntiAISettings: { languageNaturalization: {enabled: false, sentenceVariation: 0, colloquialLevel: 0, emotionalNuance: 0}, personalizationInjection: {enabled: false, userStyleMimicry: false, personalExperience: false, uniquePerspective: false}, moderateImperfection: {enabled: false, minorInconsistency: 0, naturalPauses: false, colloquialErrors: false} }
    };
    const initialDefaultAdvancedTemplates = ALL_DEFINED_PLATFORMS_FOR_MANAGER.reduce((acc, platformId) => {
        acc[platformId] = null;
        return acc;
    }, {} as Record<PlatformId, string | null>);
    mockPluginSettings = {
      customAdvancedTemplates: [], defaultAdvancedTemplates: { ...initialDefaultAdvancedTemplates }, 
      showConversationsInRibbon: true, defaultModel: 'gpt-3.5-turbo', defaultTemperature: 0.7, defaultMaxTokens: 2000, promptTemplates: {}, currentConversationId: null, conversations: [], enableMemory: true, maxMemoryTokens: 4000, autoSaveConversations: true, debugMode: false, 
      aiProvider: 'openai' as AIProvider, apiKey: '', embeddingProvider: 'openai' as EmbeddingProvider, showProviderInStatusBar: true,
      ui: defaultUISettings, ai: defaultAISettings, embedding: defaultEmbeddingSettings, shortcuts: defaultShortcuts, rag: defaultRAGSettings, promptModule: defaultPromptModuleSettings,
      openAIBaseUrl: undefined, googleCloudApiKey: undefined, anthropicApiKey: undefined, groqApiKey: undefined, cohereApiKey: undefined, deepSeekApiKey: undefined, 
      geminiModelName: undefined, openAIModelName: undefined, anthropicModelName: undefined, groqModelName: undefined, cohereModelName: undefined, deepSeekModelName: undefined, embeddingModelName: undefined,
    };
    testCurrentProps = { settings: mockPluginSettings, onSettingsChange: mockOnSettingsChange }; 
  });

  describe('initializeManagerState_forTest', () => {
    it('should initialize customTemplates from settings', () => {
      const sampleTemplate: AdvancedPromptTemplate = { 
        id: 'custom-1', name: 'Test Custom', platform: 'blog', category: 'custom' as PromptCategory, 
        systemPrompt: 'Sys', taskPrompt: 'Task', contextPrompt: 'Context', outputPrompt: 'Output',
        tags: [], variables: [] as PromptVariable[], examples: [] as FewShotExample[], qualityRules: [] as QualityRule[], 
        antiAISettings: createMockAntiAISettings(),
        createdAt: new Date(), updatedAt: new Date(), version: '1', usageCount: 0
      };
      testCurrentProps!.settings.customAdvancedTemplates = [sampleTemplate];
      initializeManagerState_forTest(testCurrentProps);
      expect(testCustomTemplates).toEqual(JSON.parse(JSON.stringify([sampleTemplate])));
      expect(testCustomTemplates[0]).not.toBe(sampleTemplate);
    });

    it('should initialize defaultTemplatesByPlatform from settings, falling back to null', () => {
      testCurrentProps!.settings.defaultAdvancedTemplates = {
        ...ALL_DEFINED_PLATFORMS_FOR_MANAGER.reduce((acc, p) => { acc[p] = null; return acc; }, {} as Record<PlatformId, string | null>),
        'blog': 'built-in-1', 
        'twitter': null 
      }; 
      initializeManagerState_forTest(testCurrentProps);
      expect(testDefaultTemplatesByPlatform['blog']).toBe('built-in-1');
      expect(testDefaultTemplatesByPlatform['twitter']).toBeNull();
      expect(testDefaultTemplatesByPlatform['xiaohongshu']).toBeNull(); 
      ALL_DEFINED_PLATFORMS_FOR_MANAGER.forEach(platform => {
        expect(testDefaultTemplatesByPlatform).toHaveProperty(platform);
      });
    });

    it('should handle settings where customAdvancedTemplates or defaultAdvancedTemplates are undefined', () => {
      const settingsForThisTest = { ...mockPluginSettings }; // Start with a fresh copy of the base mock settings
      delete (settingsForThisTest as Partial<PluginSettings>).customAdvancedTemplates;
      delete (settingsForThisTest as Partial<PluginSettings>).defaultAdvancedTemplates;
      
      const propsForThisTest = { settings: settingsForThisTest, onSettingsChange: mockOnSettingsChange };
      initializeManagerState_forTest(propsForThisTest);
      expect(testCustomTemplates).toEqual([]);
      ALL_DEFINED_PLATFORMS_FOR_MANAGER.forEach(platform => {
        expect(testDefaultTemplatesByPlatform[platform]).toBeNull();
      });
    });
  });

  describe('saveChanges_forTest', () => {
    it('should update settings with custom and default templates and call onSettingsChange', async () => {
      const customTemplate: AdvancedPromptTemplate = { id: 'custom-save', name: 'Save Test', platform: 'wechat', category:'custom' as PromptCategory, systemPrompt:'SP', taskPrompt:'TP', contextPrompt:'CP', outputPrompt:'OP', tags:[], variables:[], examples:[], qualityRules:[], antiAISettings: createMockAntiAISettings(), version:'1', createdAt:new Date(), updatedAt:new Date(), usageCount:0 };
      testCustomTemplates = [customTemplate];
      testDefaultTemplatesByPlatform['wechat'] = 'custom-save';

      await saveChanges_forTest();

      expect(acquiredMockDeepCopy).toHaveBeenCalledTimes(2);
      expect(testCurrentProps!.settings.customAdvancedTemplates).toEqual(JSON.parse(JSON.stringify([customTemplate])));
      expect(testCurrentProps!.settings.defaultAdvancedTemplates['wechat']).toBe('custom-save');
      expect(mockOnSettingsChange).toHaveBeenCalledWith(testCurrentProps!.settings);
    });

    it('should throw error if props are not initialized', async () => {
      testCurrentProps = null; 
      await expect(saveChanges_forTest()).rejects.toThrow('Props not initialized');
    });
  });

  describe('getAllTemplates_forTest', () => {
    it('should return only mocked built-in templates when custom templates are empty', () => {
      testCustomTemplates = [];
      const result = getAllTemplates_forTest();
      expect(result).toEqual(MOCKED_BUILT_IN_TEMPLATES_FOR_TEST_SCOPE);
      expect(result.length).toBe(MOCKED_BUILT_IN_TEMPLATES_FOR_TEST_SCOPE.length);
    });

    it('should return combined built-in and custom templates when custom templates exist', () => {
      const customTemplate1: AdvancedPromptTemplate = { id: 'custom-get-1', name: 'Get Test 1', platform: 'blog', category: 'custom' as PromptCategory, systemPrompt:'S1', taskPrompt:'T1', contextPrompt:'C1', outputPrompt:'O1', tags:[], variables:[], examples:[], qualityRules:[], antiAISettings: createMockAntiAISettings(), version:'1', createdAt:new Date(), updatedAt:new Date(), usageCount:0 };
      const customTemplate2: AdvancedPromptTemplate = { id: 'custom-get-2', name: 'Get Test 2', platform: 'twitter', category: 'custom' as PromptCategory, systemPrompt:'S2', taskPrompt:'T2', contextPrompt:'C2', outputPrompt:'O2', tags:[], variables:[], examples:[], qualityRules:[], antiAISettings: createMockAntiAISettings(), version:'1', createdAt:new Date(), updatedAt:new Date(), usageCount:0 };
      testCustomTemplates = [customTemplate1, customTemplate2];
      
      const result = getAllTemplates_forTest();
      const expected = [...MOCKED_BUILT_IN_TEMPLATES_FOR_TEST_SCOPE, customTemplate1, customTemplate2];
      
      expect(result).toEqual(expected);
      expect(result.length).toBe(MOCKED_BUILT_IN_TEMPLATES_FOR_TEST_SCOPE.length + 2);
    });

    it('should return a new array instance (immutability)', () => {
      testCustomTemplates = [{ id: 'custom-immut', name:'Immut Test', platform:'blog', category:'custom' as PromptCategory, systemPrompt:'S', taskPrompt:'T', contextPrompt:'C', outputPrompt:'O', tags:[], variables:[], examples:[], qualityRules:[], antiAISettings: createMockAntiAISettings(), version:'1', createdAt:new Date(), updatedAt:new Date(), usageCount:0 }];
      const result1 = getAllTemplates_forTest();
      const result2 = getAllTemplates_forTest();

      expect(result1).not.toBe(MOCKED_BUILT_IN_TEMPLATES_FOR_TEST_SCOPE); // Not the same array instance as the mock
      expect(result1).not.toBe(testCustomTemplates); // Not the same array instance as custom templates
      expect(result1).toEqual(result2); // Content should be the same if state hasn't changed
      expect(result1).not.toBe(result2); // Should be new arrays each time for immutability if spread operator is used correctly
    });

    it('should not modify the original MOCKED_BUILT_IN_TEMPLATES or testCustomTemplates', () => {
      // This test needs to access the *actual* inlined array from the mock to check its original state.
      // We captured it in MOCKED_BUILT_IN_TEMPLATES_FOR_TEST_SCOPE in beforeAll.
      const originalMockedBuiltInSnapshot = JSON.parse(JSON.stringify(MOCKED_BUILT_IN_TEMPLATES_FOR_TEST_SCOPE));
      const customTemplate: AdvancedPromptTemplate = { id: 'custom-orig', name:'Orig Test', platform:'blog', category:'custom' as PromptCategory, systemPrompt:'S', taskPrompt:'T', contextPrompt:'C', outputPrompt:'O', tags:[], variables:[], examples:[], qualityRules:[], antiAISettings: createMockAntiAISettings(), version:'1', createdAt:new Date(), updatedAt:new Date(), usageCount:0 };
      testCustomTemplates = [customTemplate];
      const originalCustom = [...testCustomTemplates];

      getAllTemplates_forTest(); // Call the function

      expect(JSON.parse(JSON.stringify(MOCKED_BUILT_IN_TEMPLATES_FOR_TEST_SCOPE))).toEqual(originalMockedBuiltInSnapshot);
      expect(testCustomTemplates).toEqual(originalCustom);
    });
  });

  describe('processImportedTemplates', () => {
    let mockExistingTemplatesGetter: jest.Mock;
    let baseTime: number;

    beforeEach(() => {
      // Reset date mock for consistent IDs if Date.now() is used in conflict resolution
      baseTime = Date.now();
      jest.spyOn(Date, 'now').mockImplementation(() => baseTime);
      
      // Each test can set up its own return value for existing templates
      mockExistingTemplatesGetter = jest.fn(); 
    });

    afterEach(() => {
        jest.restoreAllMocks(); // Restore Date.now() and other mocks
    });

    const basicValidTemplateItem = {
      id: 'import-1', name: 'Imported Template 1', platform: 'blog' as PlatformId, category: 'custom' as PromptCategory,
      systemPrompt: 'Sys', taskPrompt: 'Task', contextPrompt: 'Context', outputPrompt: 'Output',
      tags: [], variables: [], examples: [], qualityRules: [], 
      antiAISettings: createMockAntiAISettings(), // Use helper from existing tests
      version: '1.0', createdAt: new Date().toISOString(), usageCount: 0
    };

    it('should import valid templates with no conflicts', () => {
      mockExistingTemplatesGetter.mockReturnValue([]); // No existing templates
      const jsonData = JSON.stringify([basicValidTemplateItem]);
      const result = processImportedTemplates(jsonData, mockExistingTemplatesGetter);

      expect(result.successCount).toBe(1);
      expect(result.processedTemplates.length).toBe(1);
      expect(result.processedTemplates[0].id).toBe('import-1');
      expect(result.processedTemplates[0].name).toBe('Imported Template 1');
      expect(result.errorMessages.length).toBe(0);
      expect(result.warningMessages.length).toBe(0);
    });

    it('should handle ID conflicts by renaming and generating new IDs', () => {
      const existingTemplate = { ...basicValidTemplateItem, id: 'import-1', name: 'Existing Version' };
      mockExistingTemplatesGetter.mockReturnValue([existingTemplate]);
      const jsonData = JSON.stringify([{ ...basicValidTemplateItem, id: 'import-1' }]); // Conflicting ID
      const result = processImportedTemplates(jsonData, mockExistingTemplatesGetter);

      expect(result.successCount).toBe(1);
      expect(result.processedTemplates.length).toBe(1);
      expect(result.processedTemplates[0].id).toBe(`import-1-imported-${baseTime}`);
      expect(result.processedTemplates[0].name).toBe(`Imported Template 1 (导入)`);
      expect(result.warningMessages.length).toBe(1);
      expect(result.warningMessages[0]).toContain('已存在，已重命名为');
      expect(result.errorMessages.length).toBe(0);
    });

    it('should return error for invalid JSON (not an array)', () => {
      mockExistingTemplatesGetter.mockReturnValue([]);
      const jsonData = JSON.stringify({ id: 'not-an-array' }); // Object instead of array
      const result = processImportedTemplates(jsonData, mockExistingTemplatesGetter);

      expect(result.successCount).toBe(0);
      expect(result.processedTemplates.length).toBe(0);
      expect(result.errorMessages.length).toBe(1);
      expect(result.errorMessages[0]).toContain('JSON 数据必须是一个数组');
    });

    it('should return error for JSON syntax error', () => {
      mockExistingTemplatesGetter.mockReturnValue([]);
      const jsonData = '[{\"id\": \"broken\"'; // Invalid JSON syntax
      const result = processImportedTemplates(jsonData, mockExistingTemplatesGetter);
      
      expect(result.successCount).toBe(0);
      expect(result.processedTemplates.length).toBe(0);
      expect(result.errorMessages.length).toBe(1);
      expect(result.errorMessages[0]).toContain('JSON 解析错误');
    });

    it('should skip items missing required fields and add a warning', () => {
      mockExistingTemplatesGetter.mockReturnValue([]);
      const invalidItem = { name: 'Incomplete Template', platform: 'blog' }; // Missing id and systemPrompt
      const jsonData = JSON.stringify([invalidItem, basicValidTemplateItem]);
      const result = processImportedTemplates(jsonData, mockExistingTemplatesGetter);

      expect(result.successCount).toBe(1); // Only the valid one is processed
      expect(result.processedTemplates.length).toBe(1);
      expect(result.processedTemplates[0].id).toBe('import-1');
      expect(result.warningMessages.length).toBe(1);
      expect(result.warningMessages[0]).toContain('跳过无效的模板数据项');
      expect(result.errorMessages.length).toBe(0);
    });
    
    it('should default missing optional fields', () => {
      mockExistingTemplatesGetter.mockReturnValue([]);
      const partialItem = {
        id: 'partial-1', name: 'Partial Template', platform: 'wechat' as PlatformId,
        systemPrompt: 'SysPartial' // Missing many optional fields
      };
      const jsonData = JSON.stringify([partialItem]);
      const result = processImportedTemplates(jsonData, mockExistingTemplatesGetter);

      expect(result.successCount).toBe(1);
      expect(result.processedTemplates.length).toBe(1);
      const imported = result.processedTemplates[0];
      expect(imported.id).toBe('partial-1');
      expect(imported.taskPrompt).toBe(''); // Defaulted
      expect(imported.tags).toEqual([]); // Defaulted
      expect(imported.category).toBe('custom'); // Defaulted
      expect(imported.version).toBe('1.0.0'); // Defaulted
      expect(imported.antiAISettings).toBeDefined(); // Defaulted object
      expect(result.errorMessages.length).toBe(0);
      expect(result.warningMessages.length).toBe(0);
    });

    it('should return error for empty JSON string', () => {
        mockExistingTemplatesGetter.mockReturnValue([]);
        const jsonData = '   '; // Empty/whitespace string
        const result = processImportedTemplates(jsonData, mockExistingTemplatesGetter);
        expect(result.successCount).toBe(0);
        expect(result.processedTemplates.length).toBe(0);
        expect(result.errorMessages.length).toBe(1);
        expect(result.errorMessages[0]).toContain('请输入 JSON 数据');
    });

    it('should handle JSON array with no valid template items', () => {
        mockExistingTemplatesGetter.mockReturnValue([]);
        const jsonData = JSON.stringify([{foo: 'bar'}, {id_is_wrong_type: 123}]);
        const result = processImportedTemplates(jsonData, mockExistingTemplatesGetter);
        expect(result.successCount).toBe(0);
        expect(result.processedTemplates.length).toBe(0);
        expect(result.warningMessages.length).toBe(2); // Both items skipped
        expect(result.warningMessages[0]).toContain('跳过无效的模板数据项');
        expect(result.errorMessages.length).toBe(0);
    });

  });
}); 