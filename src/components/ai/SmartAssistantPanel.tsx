import React, { useState, useEffect, useCallback } from 'react';
import { AdvancedPromptTemplate, PromptVariable, FewShotExample } from '../../types/prompt-advanced';
import { SocialMediaPlatform, PlatformId, FormatRules } from '../../types/social-media';
import { EnhancedPromptTemplateService } from '../../services/prompt/EnhancedPromptTemplateService';
import { PromptModuleService } from '../../services/prompt/PromptModuleService';
import { ContentQualityEvaluator } from '../../services/content-quality-evaluator';
import { PlatformContentAnalyzer } from '../../services/prompt/PlatformContentAnalyzer';
import { AIService } from '../../services/AIService';
import { Message } from '../../types/message';

import { PromptTemplateManager } from '../prompt/PromptTemplateManager';
import { LayeredPromptEditor } from '../prompt/LayeredPromptEditor';

// --- Placeholder Components ---
interface GeneratedContentDisplayProps { 
  content: string; 
  platform: SocialMediaPlatform;
  isLoading: boolean;
  error?: string;
}
const GeneratedContentDisplay: React.FC<GeneratedContentDisplayProps> = ({ content, platform, isLoading, error }) => (
  <div className="generated-content-display" style={{ border: '1px solid #eee', padding: '10px', marginTop: '15px', minHeight: '150px', background: '#fdfdfd' }}>
    <h4>Generated Content for {platform.name}</h4>
    {isLoading && <p>Loading...</p>}
    {error && <p style={{color: 'red'}}>Error: {error}</p>}
    {!isLoading && !error && (
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{content || 'Content will appear here after generation.'}</pre>
    )}
  </div>
);

interface FeedbackCollectorProps { 
  generatedContentId: string | null; 
  onSubmit: (feedback: { rating: number; comments?: string; issues?: string[] }) => void;
}
const FeedbackCollector: React.FC<FeedbackCollectorProps> = ({ generatedContentId, onSubmit }) => {
  const [rating, setRating] = useState(0);
  if (!generatedContentId) return null;
  return (
    <div className="feedback-collector" style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
      <h5>Rate this content (ID: {generatedContentId}):</h5>
      <div>{[1,2,3,4,5].map(r => <button key={r} onClick={() => setRating(r)} style={{background: rating === r ? '#007bff' : '#eee', marginRight: '5px'}}>{r}</button>)}</div>
      {/* Add comment box and issue types if needed */}
      <button onClick={() => onSubmit({ rating })} style={{marginTop: '5px'}} disabled={rating === 0}>Submit Feedback</button>
    </div>
  );
};

interface HistoryItem {
  id: string;
  timestamp: Date;
  templateUsed: string;
  generatedContentSummary: string;
}
interface HistoryManagerProps { 
  history: HistoryItem[]; 
  onSelectItem: (item: HistoryItem) => void;
}
const HistoryManager: React.FC<HistoryManagerProps> = ({ history, onSelectItem }) => (
  <div className="history-manager" style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
    <h5>Generation History</h5>
    {history.length === 0 && <p>No history yet.</p>}
    <ul style={{ listStyle: 'none', padding: 0}}>
      {history.map(item => (
        <li key={item.id} onClick={() => onSelectItem(item)} style={{cursor: 'pointer', padding: '5px', borderBottom: '1px dashed #f0f0f0'}}>
          {item.timestamp.toLocaleTimeString()}: {item.templateUsed} - {item.generatedContentSummary.substring(0,30)}...
        </li>
      ))}
    </ul>
  </div>
);
// --- End Placeholder Components ---

export interface SmartAssistantPanelProps {
  templateService: EnhancedPromptTemplateService;
  promptModuleService: PromptModuleService;
  qualityEvaluator: ContentQualityEvaluator;
  platformAnalyzer: PlatformContentAnalyzer;
  aiGenerationService: AIService;
}

export const SmartAssistantPanel: React.FC<SmartAssistantPanelProps> = ({
  templateService,
  promptModuleService,
  qualityEvaluator,
  platformAnalyzer,
  aiGenerationService,
}) => {
  const [activeView, setActiveView] = useState<'manager' | 'editor'>('manager');
  const [selectedTemplate, setSelectedTemplate] = useState<AdvancedPromptTemplate | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [targetPlatform, setTargetPlatform] = useState<SocialMediaPlatform | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | undefined>();
  const [generationHistory, setGenerationHistory] = useState<HistoryItem[]>([]);
  const [activeGeneratedContentId, setActiveGeneratedContentId] = useState<string | null>(null);

  const handleTemplateSelect = useCallback((template: AdvancedPromptTemplate) => {
    setSelectedTemplate(template);
    setActiveView('editor');
  }, []);

  const handleTemplateCreate = useCallback(() => {
    // For new template, ensure LayeredPromptEditor gets a null or a basic new template structure
    // It's important that `id` is not set for `createTemplate`.
    const newTemplateShell: Omit<AdvancedPromptTemplate, 'id' | 'createdAt' | 'updatedAt'> & { id?: string } = {
        name: 'New Prompt Template',
        platform: targetPlatform?.id || 'blog', // Default or last used platform
        category: 'custom', // Default category
        tags: [],
        systemPrompt: '',
        taskPrompt: '',
        contextPrompt: '',
        outputPrompt: '',
        variables: [],
        examples: [],
        qualityRules: [],
        antiAISettings: {} as any, // Provide default or empty object
        version: '1.0.0',
        usageCount: 0,
    };
    setSelectedTemplate(newTemplateShell as AdvancedPromptTemplate); // Cast for editor, but save logic will handle omit
    setActiveView('editor');
  }, [targetPlatform]);

  const handleTemplateChange = useCallback((updatedTemplate: AdvancedPromptTemplate) => {
    setSelectedTemplate(updatedTemplate);
  }, []);

  const handleSaveTemplate = useCallback(async (templateToSave: AdvancedPromptTemplate) => {
    try {
      if (templateToSave.id && templateToSave.createdAt) { // Simple check if it's an existing template
        await templateService.updateTemplate(templateToSave.id, templateToSave);
        setSelectedTemplate(templateToSave); // Assume update doesn't change the object reference drastically here
        console.log('Template updated:', templateToSave.id);
      } else {
        // For creation, omit id, createdAt, updatedAt as expected by createTemplate
        const { id, createdAt, updatedAt, ...creatableTemplate } = templateToSave;
        const newId = await templateService.createTemplate(creatableTemplate);
        const newTemplate = await templateService.getTemplate(newId);
        if (newTemplate) setSelectedTemplate(newTemplate);
        console.log('Template created:', newId);
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      throw error;
    }
  }, [templateService]);

  const getPlatformObject = (platformId: PlatformId): SocialMediaPlatform => {
    return {
        id: platformId,
        name: platformId.charAt(0).toUpperCase() + platformId.slice(1),
        maxLength: 10000,
        styleKeywords: [],
        requiredElements: [],
        formatRules: {} as FormatRules,
    };
  };

  useEffect(() => {
    if (selectedTemplate && selectedTemplate.platform) {
      setTargetPlatform(getPlatformObject(selectedTemplate.platform));
    } else if (!targetPlatform) {
      setTargetPlatform(getPlatformObject('blog'));
    }
  }, [selectedTemplate, targetPlatform]);

  const handleGenerateContent = useCallback(async () => {
    if (!selectedTemplate || !currentTopic || !targetPlatform) {
      setGenerationError('Template, topic, and target platform must be selected.');
      return;
    }
    setIsGenerating(true);
    setGenerationError(undefined);
    setGeneratedContent('');
    setActiveGeneratedContentId(null);

    try {
      let combinedPrompt = [
        selectedTemplate.systemPrompt,
        selectedTemplate.taskPrompt,
        selectedTemplate.contextPrompt,
        selectedTemplate.outputPrompt,
      ].filter(Boolean).join('\n\n---\n\n');

      // Simple topic injection if a placeholder like {{topic}} is in the prompt
      // More robust templating (like mustache.js) would be better in a real app.
      combinedPrompt = combinedPrompt.replace(/\{\{\s*topic\s*\}\}/gi, currentTopic);
      
      const platformSpecificFinalPrompt = await platformAnalyzer.generatePlatformSpecificPrompt(
        combinedPrompt, 
        targetPlatform 
        // Removed third argument: { topic: currentTopic }
      );

      // Use sendMessage instead of generateText
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: platformSpecificFinalPrompt,
        timestamp: Date.now(),
        //threadId: // Optional: manage threads if needed
      };

      const assistantResponse = await aiGenerationService.sendMessage(userMessage);
      const result = assistantResponse.content;

      setGeneratedContent(result);
      const newHistoryId = `gen_${Date.now()}`;
      setActiveGeneratedContentId(newHistoryId);
      setGenerationHistory(prev => [
        { id: newHistoryId, timestamp: new Date(), templateUsed: selectedTemplate.name, generatedContentSummary: result.substring(0,50) },
        ...prev
      ].slice(0,10));

    } catch (error) {
      console.error('Content generation failed:', error);
      setGenerationError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTemplate, currentTopic, targetPlatform, platformAnalyzer, aiGenerationService]);

  const handleFeedbackSubmit = useCallback((feedback: { rating: number; comments?: string; issues?: string[] }) => {
    console.log('Feedback submitted for content ID:', activeGeneratedContentId, feedback);
  }, [activeGeneratedContentId]);

  return (
    <div className="smart-assistant-panel" style={{ display: 'flex', height: 'calc(100vh - 40px)', margin: '20px', border: '1px solid #ccc' }}>
      {/* Left Panel: Template Manager or Editor */} 
      <div className="left-panel" style={{ flex: 1, borderRight: '1px solid #ccc', padding: '10px', overflowY: 'auto' }}>
        {activeView === 'manager' && (
          <PromptTemplateManager
            templateService={templateService}
            platformManager={promptModuleService}
            qualityEvaluator={qualityEvaluator}
            onTemplateSelect={handleTemplateSelect}
            onTemplateCreate={handleTemplateCreate}
          />
        )}
        {activeView === 'editor' && (
          <LayeredPromptEditor
            template={selectedTemplate} 
            onChange={handleTemplateChange}
            onSave={handleSaveTemplate} 
            qualityEvaluator={qualityEvaluator}
            platformAnalyzer={platformAnalyzer}
          />
        )}
        <button onClick={() => setActiveView(activeView === 'manager' ? 'editor' : 'manager')} style={{marginTop: '10px'}}>
          {activeView === 'manager' ? (selectedTemplate ? 'Edit Selected' : 'Create New') : 'Back to Manager'}
        </button>
      </div>

      {/* Right Panel: Content Generation & Interaction */} 
      <div className="right-panel" style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column' }}>
        <h3>Content Generation</h3>
        <div>
          <label htmlFor="topic-input" style={{marginRight: '5px'}}>Topic/Context:</label>
          <input 
            id="topic-input"
            type="text" 
            value={currentTopic} 
            onChange={(e) => setCurrentTopic(e.target.value)} 
            placeholder="Enter topic or user query"
            style={{width: 'calc(100% - 100px)', padding: '8px', marginBottom: '10px'}}
          />
        </div>
        {/* Platform Selector could be added here if not solely derived from template */}
        {targetPlatform && <p>Target Platform: <strong>{targetPlatform.name}</strong></p>}

        <button onClick={handleGenerateContent} disabled={isGenerating || !selectedTemplate || !currentTopic || !targetPlatform} style={{padding: '10px 15px', fontSize: '1em'}}>
          {isGenerating ? 'Generating...' : 'Generate Content'}
        </button>

        <GeneratedContentDisplay 
          content={generatedContent} 
          platform={targetPlatform || getPlatformObject('blog')} 
          isLoading={isGenerating}
          error={generationError}
        />
        
        {activeGeneratedContentId && 
          <FeedbackCollector 
            generatedContentId={activeGeneratedContentId} 
            onSubmit={handleFeedbackSubmit} 
          />
        }

        <HistoryManager history={generationHistory} onSelectItem={(item) => console.log('History item selected', item)} />
      </div>
    </div>
  );
};

export default SmartAssistantPanel; 