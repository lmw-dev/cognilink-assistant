import React from 'react';
import ReactDOM from 'react-dom';
import { ItemView, WorkspaceLeaf } from 'obsidian';
import { SmartAssistantPanel } from '../components/ai/SmartAssistantPanel';
import { EnhancedPromptTemplateService } from '../services/prompt/EnhancedPromptTemplateService';
import { PromptModuleService } from '../services/prompt/PromptModuleService';
import { ContentQualityEvaluator } from '../services/content-quality-evaluator';
import { PlatformContentAnalyzer } from '../services/prompt/PlatformContentAnalyzer';
import { AIService } from '../services/AIService';
import { SettingsManager } from '../services/SettingsManager';
import { SettingsStorage } from '../services/SettingsStorage';
import CogniLinkPlugin from '../main'; // To access plugin instance for settings/services
import { PluginSettings } from '../types/settings'; // Import PluginSettings

export const SMART_ASSISTANT_VIEW_TYPE = 'smart-assistant-view';

export class SmartAssistantView extends ItemView {
  private plugin: CogniLinkPlugin;
  // Services - to be assigned from plugin instance
  private settingsManager!: SettingsManager;
  private settingsStorage!: SettingsStorage;
  private enhancedPromptTemplateService!: EnhancedPromptTemplateService;
  private contentQualityEvaluator!: ContentQualityEvaluator;
  private aiService!: AIService;
  private platformAnalyzer!: PlatformContentAnalyzer;
  private promptModuleService!: PromptModuleService;

  constructor(leaf: WorkspaceLeaf, plugin: CogniLinkPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.initializeServices();
  }

  private initializeServices() {
    // Assign services directly from the plugin instance
    this.settingsStorage = this.plugin.settingsStorage;
    this.settingsManager = this.plugin.settingsManager;
    // The SettingsManager in plugin is already initialized with:
    // new SettingsManager(this.app, this, this.settingsStorage)
    // So, the callback for plugin.settings update is already handled there.

    this.aiService = this.plugin.aiService;
    this.contentQualityEvaluator = this.plugin.contentQualityEvaluator;
    this.enhancedPromptTemplateService = this.plugin.enhancedPromptTemplateService;
    this.platformAnalyzer = this.plugin.platformAnalyzer;
    this.promptModuleService = this.plugin.promptModuleService;
  }

  getViewType() {
    return SMART_ASSISTANT_VIEW_TYPE;
  }

  getDisplayText() {
    return 'Smart Assistant';
  }

  getIcon() {
    return 'brain-circuit'; // Example icon
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass('smart-assistant-view-container');

    ReactDOM.render(
      <React.StrictMode>
        <SmartAssistantPanel 
          templateService={this.enhancedPromptTemplateService}
          promptModuleService={this.promptModuleService}
          qualityEvaluator={this.contentQualityEvaluator}
          platformAnalyzer={this.platformAnalyzer}
          aiGenerationService={this.aiService}
        />
      </React.StrictMode>,
      container
    );
  }

  async onClose() {
    const container = this.containerEl.children[1];
    ReactDOM.unmountComponentAtNode(container);
  }
} 