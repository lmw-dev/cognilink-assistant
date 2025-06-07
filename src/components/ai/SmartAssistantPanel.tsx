import React, { useState, useEffect, useCallback } from 'react';
import { PromptTemplateManager } from '../prompt/PromptTemplateManager';
import { LayeredPromptEditor } from '../prompt/LayeredPromptEditor';
import { AIService } from '../../services/AIService';
import { 
  AdvancedPromptTemplate, 
  FeedbackData,
  HistoryItem,
  PlatformId,
  GenerationOptions,
  AntiAIDetectionStrategy
} from '../../types/prompt-advanced';
import { EnhancedPromptTemplateService } from '../../services/prompt/EnhancedPromptTemplateService';
import { ContentQualityEvaluator } from '../../services/content-quality-evaluator';
import { PlatformContentAnalyzer } from '../../services/prompt/PlatformContentAnalyzer';
import { PromptModuleService } from '../../services/prompt/PromptModuleService';
import { Message } from '../../types/message';

// --- Minimal Inline Type Definitions (Temporary for UI fix) ---
// These should ideally be imported from '../../types/prompt-advanced.ts'
// If that file is broken or missing exports, these are placeholders.
// (REMOVED: type PlatformId, interface FeedbackData, interface HistoryItem, interface GenerationOptions)
// --- End Minimal Inline Type Definitions ---

interface PanelDisplayPlatform {
  id: PlatformId;
  name: string;
}

const MOCK_PLATFORMS: PanelDisplayPlatform[] = [
  { id: 'blog', name: 'Blog' },
  { id: 'twitter', name: 'Twitter' },
  { id: 'linkedin', name: 'LinkedIn' },
];

const getPlatformObject = (platformId: PlatformId | undefined): PanelDisplayPlatform => {
  const found = MOCK_PLATFORMS.find(p => p.id === platformId);
  return found || MOCK_PLATFORMS[0]; // Default to blog if undefined or not found
};

const GeneratedContentDisplay: React.FC<{ content: string | null; platform: PanelDisplayPlatform; isLoading: boolean; error: string | null }> = 
  ({ content, platform, isLoading, error }) => {
    if (isLoading) return <div style={{padding: '10px', color: 'var(--text-muted)'}}>Loading content...</div>;
  if (error) return <div style={{padding: '10px', color: 'var(--text-error)'}}>Error: {error}</div>;
    if (!content) return <div style={{padding: '10px', color: 'var(--text-faint)'}}>Content will appear here after generation.</div>;
    return <div style={{padding: '10px', border: '1px solid var(--background-modifier-border)', borderRadius: 'var(--radius-m)', whiteSpace: 'pre-wrap', backgroundColor: 'var(--background-secondary)'}}><h4>Generated Content for {platform.name}</h4><p>{content}</p></div>;
};

const FeedbackCollector: React.FC<{ generatedContentId: string; onSubmit: (data: FeedbackData) => void }> = 
  ({ generatedContentId, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comments, setComments] = useState('');
    return (
      <div style={{padding: '10px', borderTop: '1px solid var(--background-modifier-border)', marginTop: '10px'}}>
        <h5>Feedback for {generatedContentId.substring(0,10)}...</h5>
        <input type="number" value={rating} onChange={(e) => setRating(parseInt(e.target.value,10))} placeholder="Rating (0-5)" style={{marginRight: '5px'}} />
        <input type="text" value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Comments" style={{marginRight: '5px'}} />
        <button onClick={() => onSubmit({ contentId: generatedContentId, rating, comments, issues: [] })} >Submit Feedback</button>
      </div>
    );
};

const HistoryManager: React.FC<{ history: HistoryItem[]; onSelectItem: (item: HistoryItem) => void }> = 
  ({ history, onSelectItem }) => {
    if (!history.length) return <div style={{padding: '10px', color: 'var(--text-faint)'}}>No history yet.</div>;
    return (
      <div style={{padding: '10px', borderTop: '1px solid var(--background-modifier-border)', marginTop: '10px'}}>
        <h5>Generation History</h5>
        <ul style={{listStyle: 'none', padding: 0}}>
          {history.map(item => (
            <li key={item.id} onClick={() => onSelectItem(item)} style={{padding: '5px', borderBottom: '1px solid var(--background-modifier-border-hover)', cursor: 'pointer'}}>
              {item.templateId} - {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : 'Invalid Date'}
            </li>
          ))}
        </ul>
      </div>
    );
};

interface SmartAssistantPanelProps {
  templateService: EnhancedPromptTemplateService;
  promptModuleService: PromptModuleService;
  qualityEvaluator: ContentQualityEvaluator;
  platformAnalyzer: PlatformContentAnalyzer;
  aiGenerationService: AIService; 
}

// --- 内联样式优化 for Obsidian 右侧栏 ---
const panelStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 320,
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
  padding: '8px 6px',
  gap: 8,
  background: 'var(--background-secondary-alt)'
};
const sectionStyles: React.CSSProperties = {
  background: 'var(--background-primary)',
  borderRadius: 6,
  padding: '6px 4px',
  marginBottom: 6,
  boxShadow: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: 6
};
const tabBarStyles: React.CSSProperties = {
  display: 'flex',
  gap: 2,
  marginBottom: 4
};
const tabBtnStyles: React.CSSProperties = {
  fontSize: 13,
  padding: '4px 10px',
  minWidth: 0,
  border: 'none',
  borderRadius: 4,
  background: 'var(--background-secondary)',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  marginRight: 2
};
const tabBtnActive: React.CSSProperties = {
  ...tabBtnStyles,
  background: 'var(--interactive-accent)',
  color: 'var(--text-on-accent)',
  fontWeight: 600
};
const inputStyles: React.CSSProperties = {
  fontSize: 13,
  padding: '4px 6px',
  minHeight: 32,
  width: '100%',
  borderRadius: 4,
  border: '1px solid var(--background-modifier-border)',
  background: 'var(--background-secondary)'
};
const btnStyles: React.CSSProperties = {
  fontSize: 13,
  padding: '4px 10px',
  borderRadius: 4,
  border: 'none',
  marginRight: 4,
  cursor: 'pointer',
  background: 'var(--interactive-accent)',
  color: 'var(--text-on-accent)'
};
const btnSecondary: React.CSSProperties = {
  ...btnStyles,
  background: 'var(--background-modifier-border)',
  color: 'var(--text-muted)'
};
const metaText: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-faint)',
  margin: '2px 0 6px 0'
};
const previewBox: React.CSSProperties = {
  fontSize: 12,
  background: 'var(--background-secondary)',
  border: '1px solid var(--background-modifier-border)',
  borderRadius: 4,
  padding: 6,
  minHeight: 24,
  marginTop: 4,
  color: 'var(--text-error)'
};

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
  const [targetPlatform, setTargetPlatform] = useState<PanelDisplayPlatform>(getPlatformObject('blog'));
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeGeneratedContentId, setActiveGeneratedContentId] = useState<string | null>(null);
  const [generationHistory, setGenerationHistory] = useState<HistoryItem[]>([]);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<'system' | 'task' | 'context'>('system');
  const [systemContent, setSystemContent] = useState('Define AI role, background, and basic behavior...');
  const [taskContent, setTaskContent] = useState('Define the specific task and goals...');
  const [contextContent, setContextContent] = useState('Describe user input and context handling...');

  const handleTemplateSelect = useCallback((template: AdvancedPromptTemplate) => {
    setSelectedTemplate(template);
    setTargetPlatform(getPlatformObject(template.platform));
  }, []);

  const handleTemplateCreate = useCallback((newTemplateInitial?: AdvancedPromptTemplate) => {
    if (newTemplateInitial) {
        setSelectedTemplate(newTemplateInitial); 
    } else {
        const freshTemplate: AdvancedPromptTemplate = {
            id: `new-${Date.now()}`,
            name: 'New Untitled Template',
            version: '1.0',
            description: '',
            platform: targetPlatform?.id || 'blog', 
            category: 'custom',
            tags: [],
            systemPrompt: '',
            taskPrompt: '',
            contextPrompt: '',
            outputPrompt: '',
            variables: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            examples: [],
            qualityRules: [],
            usageCount: 0,
            antiAISettings: { strategy: 'none' } as any,
        };
        setSelectedTemplate(freshTemplate);
    }
    setActiveView('editor');
  }, [targetPlatform]);

  const handleTemplateChange = useCallback((updatedTemplate: AdvancedPromptTemplate) => {
    setSelectedTemplate(updatedTemplate);
  }, []);

  const handleSaveTemplate = async (templateToSave: AdvancedPromptTemplate) => {
    if (!templateToSave) return;
    try {
      let finalTemplate: AdvancedPromptTemplate | undefined;
      if (templateToSave.id && !templateToSave.id.startsWith('new-') && templateToSave.createdAt) {
        await templateService.updateTemplate(templateToSave.id, templateToSave);
        const fetched = await templateService.getTemplate(templateToSave.id);
        if (fetched != null) {
          finalTemplate = fetched;
        } else {
          finalTemplate = templateToSave;
        }
        console.log('Template updated');
      } else {
        const { id, createdAt, updatedAt, ...creatablePart } = templateToSave;
        const newId = await templateService.createTemplate(creatablePart as Omit<AdvancedPromptTemplate, 'id' | 'createdAt' | 'updatedAt'>);
        const fetched = await templateService.getTemplate(newId);
        if (fetched != null) {
          finalTemplate = fetched;
        } else {
          finalTemplate = templateToSave;
        }
        console.log('Template created');
      }
      if (finalTemplate) {
        setSelectedTemplate(finalTemplate);
      }
      alert('Template saved successfully!');
      setActiveView('manager');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. See console for details.');
    }
  };

  const handleGenerateContent = async () => {
    if (!selectedTemplate || !currentTopic || !targetPlatform) {
      setGenerationError('Missing template, topic, or target platform.');
      return;
    }
    setIsGenerating(true);
    setGeneratedContent(null);
    setGenerationError(null);
    setActiveGeneratedContentId(null);

    try {
      const generationOptions: GenerationOptions = {
        topic: currentTopic,
        platformId: targetPlatform.id,
      };
      
      const substituteTopic = (promptText: string) => promptText.replace(/\{topic\}/g, currentTopic);
      const systemP = substituteTopic(selectedTemplate.systemPrompt || '');
      const taskP = substituteTopic(selectedTemplate.taskPrompt || '');
      const contextP = substituteTopic(selectedTemplate.contextPrompt || '');
      const outputP = substituteTopic(selectedTemplate.outputPrompt || '');

      let fullContent = '';
      if (systemP) fullContent += `System Hint: ${systemP}\n\n`;
      fullContent += `Task: ${taskP}`;
      if (contextP) fullContent += `\n\nContext: ${contextP}`;
      if (outputP) fullContent += `\n\nOutput Instructions: ${outputP}`;

      const userMessage: Message = {
        id: `msg-user-${Date.now()}`,
        role: 'user',
        content: fullContent,
        timestamp: Date.now(),
      };
      
      const assistantResponse = await aiGenerationService.sendMessage(userMessage);
      const generatedText = assistantResponse.content;
      setGeneratedContent(generatedText);

      const newHistoryItem: HistoryItem = {
        id: `gen-${Date.now()}`,
        templateId: selectedTemplate.id,
        timestamp: new Date().toISOString(),
        request: { topic: currentTopic, platform: targetPlatform.name, options: generationOptions },
        response: generatedText,
      };
      setGenerationHistory(prev => [newHistoryItem, ...prev.slice(0, 19)]);
      setActiveGeneratedContentId(newHistoryItem.id);

    } catch (error) {
      console.error('Error generating content:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setGenerationError(`Failed to generate content: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFeedbackSubmit = async (feedback: FeedbackData) => {
    console.log('Feedback submitted:', feedback);
    alert('Feedback submitted! (Logged to console)');
  };
  
  const layerTabs = [
    { key: 'system', label: 'System Layer' },
    { key: 'task', label: 'Task Layer' },
    { key: 'context', label: 'Context Layer' }
  ];

  const renderLayerContent = () => {
    if (activeLayer === 'system') {
      return (
        <>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>System Layer</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Role definition and basic rules</div>
          <textarea
            style={{ ...inputStyles, minHeight: 48, marginBottom: 4 }}
            value={systemContent}
            onChange={e => setSystemContent(e.target.value)}
            placeholder="Define AI role, background, and basic behavior..."
          />
          <div style={metaText}><b>Variables:</b> No variables defined.</div>
          <div style={metaText}><b>Examples:</b> No examples defined.</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            <button style={btnSecondary}>Preview</button>
            <button style={btnStyles}>Save Template</button>
          </div>
          <div className="live-preview small" style={previewBox}>Error generating preview.</div>
        </>
      );
    }
    if (activeLayer === 'task') {
      return (
        <>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Task Layer</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Specific task and goals</div>
          <textarea
            style={{ ...inputStyles, minHeight: 48, marginBottom: 4 }}
            value={taskContent}
            onChange={e => setTaskContent(e.target.value)}
            placeholder="Define the specific task and goals..."
          />
          <div style={metaText}><b>Variables:</b> No variables defined.</div>
          <div style={metaText}><b>Examples:</b> No examples defined.</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            <button style={btnSecondary}>Preview</button>
            <button style={btnStyles}>Save Template</button>
          </div>
          <div className="live-preview small" style={previewBox}>Error generating preview.</div>
        </>
      );
    }
    if (activeLayer === 'context') {
      return (
        <>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Context Layer</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>User input and context handling</div>
          <textarea
            style={{ ...inputStyles, minHeight: 48, marginBottom: 4 }}
            value={contextContent}
            onChange={e => setContextContent(e.target.value)}
            placeholder="Describe user input and context handling..."
          />
          <div style={metaText}><b>Variables:</b> No variables defined.</div>
          <div style={metaText}><b>Examples:</b> No examples defined.</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            <button style={btnSecondary}>Preview</button>
            <button style={btnStyles}>Save Template</button>
          </div>
          <div className="live-preview small" style={previewBox}>Error generating preview.</div>
        </>
      );
    }
    return null;
  };

  return (
    <div className="smart-assistant-panel vertical" style={panelStyles}>
      {/* 分层编辑区（Tab切换） */}
      <div className="layer-editor compact" style={sectionStyles}>
        <div className="layer-tabs small" style={tabBarStyles}>
          {layerTabs.map(tab => (
            <button
              key={tab.key}
              style={activeLayer === tab.key ? tabBtnActive : tabBtnStyles}
              onClick={() => setActiveLayer(tab.key as any)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="layer-content">
          {renderLayerContent()}
        </div>
        <button style={{ ...btnStyles, width: '100%', marginTop: 8 }}>Back to Template Manager</button>
      </div>
      {/* 内容生成区 */}
      <div className="content-generation compact" style={sectionStyles}>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Content Generation</div>
        <label htmlFor="topic-input" style={{ fontSize: 12, marginBottom: 2 }}>Topic/Context:</label>
        <input id="topic-input" type="text" style={inputStyles} placeholder="Enter topic or user query" />
        <div className="platform-info small" style={metaText}>Target Platform: <b>Blog</b></div>
        <button style={{ ...btnStyles, width: '100%', margin: '8px 0' }}>Generate Content</button>
        <div className="generated-content small" style={previewBox}>Content will appear here after generation.</div>
        <div className="history small" style={metaText}>No history yet.</div>
      </div>
    </div>
  );
};

export default SmartAssistantPanel; 