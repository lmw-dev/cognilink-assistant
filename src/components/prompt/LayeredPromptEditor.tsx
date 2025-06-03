import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    AdvancedPromptTemplate, 
    PromptVariable, 
    FewShotExample,
    TemplateValidationResult
} from '../../types/prompt-advanced'; 
import { 
    EnhancedQualityReport, 
    AntiAIRecommendation,
    OptimizationPriority,
    // PlatformSuggestion // Not used directly in this component's props/state yet, but good to have if needed for report
} from '../../types/ai-detection';
import { ContentQualityEvaluator } from '../../services/content-quality-evaluator';
import { PlatformContentAnalyzer } from '../../services/prompt/PlatformContentAnalyzer';
import { SocialMediaPlatform, PlatformId, FormatRules } from '../../types/social-media'; // Added FormatRules

// Define ValidationError based on TemplateValidationResult structure
export type ValidationError = TemplateValidationResult['errors'][0];

// Placeholder for debounce
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
  return debounced as (...args: Parameters<F>) => ReturnType<F>; 
};

// --- Placeholder Components (to be implemented or imported) ---
interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  language?: string;
  height?: string;
  options?: Record<string, any>;
}
const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, placeholder, language = 'text', height = '200px', options }) => (
  <textarea 
    value={value} 
    onChange={e => onChange(e.target.value)} 
    placeholder={placeholder}
    style={{ width: '100%', height, border: '1px solid #ccc', fontFamily: 'monospace', fontSize: '14px', padding: '8px' }}
    data-language={language}
  />
);

interface VariableInserterProps { variables: PromptVariable[]; onInsert: (variable: PromptVariable) => void; }
const VariableInserter: React.FC<VariableInserterProps> = ({ variables, onInsert }) => (
  <div className="variable-inserter" style={{ marginBottom: '8px' }}>
    <strong>Variables: </strong>
    {variables.length === 0 && <span>No variables defined.</span>}
    {variables.map(v => <button key={v.name} onClick={() => onInsert(v)} style={{ marginRight: '4px' }}>{`{${v.name}}`}</button>)}
  </div>
);

interface ExampleSelectorProps { examples: FewShotExample[]; onSelect: (example: FewShotExample) => void; }
const ExampleSelector: React.FC<ExampleSelectorProps> = ({ examples, onSelect }) => (
  <div className="example-selector" style={{ marginBottom: '8px' }}>
    <strong>Examples: </strong>
    {examples.length === 0 && <span>No examples defined.</span>}
    {examples.map((ex, i) => <button key={i} onClick={() => onSelect(ex)} style={{ marginRight: '4px' }}>{`Example ${i+1}`}</button>)}
  </div>
);

interface MarkdownRendererProps { content: string; }
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => (
  <pre className="markdown-preview" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', padding: '10px', border: '1px solid #eee', background: '#f9f9f9', minHeight: '100px' }}>
    {content || 'Preview will appear here...'}
  </pre>
);

interface QualityScoreDisplayProps { report: EnhancedQualityReport; compact?: boolean; }
const QualityScoreDisplay: React.FC<QualityScoreDisplayProps> = ({ report, compact }) => (
  <div className="quality-score-display" style={{ padding: compact ? '5px' : '10px', border: '1px solid #ddd', marginBottom: '10px' }}>
    <h4>Quality Score: {report.overallScore?.toFixed(0) || 'N/A'}/100</h4>
    {!compact && report.optimizationPriority && report.optimizationPriority.length > 0 && (
        <div>
            <p>Optimization Priorities:</p>
            <ul>{report.optimizationPriority.map((p, idx) => <li key={`${p.category}-${idx}`}>{`${p.category} (${p.priority}): ${p.description}`}</li>)}</ul>
        </div>
    )}
  </div>
);

interface QualityImprovementSuggestionsProps { suggestions: AntiAIRecommendation[]; onApply: (suggestion: AntiAIRecommendation) => void; }
const QualityImprovementSuggestions: React.FC<QualityImprovementSuggestionsProps> = ({ suggestions, onApply }) => (
  <div className="quality-suggestions" style={{ marginBottom: '10px' }}>
    <strong>Suggestions:</strong>
    {(!suggestions || suggestions.length === 0) && <p>No specific suggestions at the moment.</p>}
    <ul>
      {suggestions?.map((s, i) => <li key={i}>{s.description} <button onClick={() => onApply(s)}>Apply</button></li>)}
    </ul>
  </div>
);

interface ValidationErrorDisplayProps { errors: ValidationError[]; }
const ValidationErrorDisplay: React.FC<ValidationErrorDisplayProps> = ({ errors }) => (
  <div className="validation-errors" style={{ color: 'red', marginBottom: '10px' }}>
    {errors.map((err, i) => <p key={i}><strong>{err.field}:</strong> {err.message}</p>)}
  </div>
);
// Helper function mentioned in the prompt, assuming it exists or we define a basic one
const combinePromptLayers = (template: AdvancedPromptTemplate): string => {
    return [
        template.systemPrompt,
        template.taskPrompt,
        template.contextPrompt,
        template.outputPrompt
    ].filter(Boolean).join('\n\n---\n\n');
};

// --- End Placeholder Components ---

export interface LayeredPromptEditorProps {
  template: AdvancedPromptTemplate | null; // Allow null for creation mode
  onChange: (template: AdvancedPromptTemplate) => void;
  onSave: (template: AdvancedPromptTemplate) => Promise<void>;
  qualityEvaluator: ContentQualityEvaluator; // Using the actual class name
  platformAnalyzer: PlatformContentAnalyzer; // Using the actual class name
}

export const LayeredPromptEditor: React.FC<LayeredPromptEditorProps> = ({
  template,
  onChange,
  onSave,
  qualityEvaluator,
  platformAnalyzer
}) => {
  const [activeLayer, setActiveLayer] = useState<'system' | 'task' | 'context' | 'output'>('system');
  const [previewContent, setPreviewContent] = useState('');
  const [qualityReport, setQualityReport] = useState<EnhancedQualityReport | null>(null);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Internal template state to manage edits before passing to onChange prop
  // This avoids prop-drilling issues if parent doesn't update template prop immediately
  const [editableTemplate, setEditableTemplate] = useState<AdvancedPromptTemplate | null>(template);

  useEffect(() => {
    setEditableTemplate(template); // Sync with prop
  }, [template]);

  const handleLayerChange = (layerKey: keyof Pick<AdvancedPromptTemplate, 'systemPrompt' | 'taskPrompt' | 'contextPrompt' | 'outputPrompt'>, value: string) => {
    if (!editableTemplate) return; // Should not happen if template is not null for editing
    const updatedTemplate = { ...editableTemplate, [layerKey]: value };
    setEditableTemplate(updatedTemplate);
    onChange(updatedTemplate); // Propagate change up immediately
  };

  const layerConfigs = [
    {
      key: 'system' as const, title: 'System Layer', description: 'Role definition and basic rules',
      placeholder: 'Define AI role, background, and basic behavior...',
      value: editableTemplate?.systemPrompt || '',
      onChange: (value: string) => handleLayerChange('systemPrompt', value)
    },
    {
      key: 'task' as const, title: 'Task Layer', description: 'Specific tasks and objectives',
      placeholder: 'Describe the specific task and expected goals...',
      value: editableTemplate?.taskPrompt || '',
      onChange: (value: string) => handleLayerChange('taskPrompt', value)
    },
    {
      key: 'context' as const, title: 'Context Layer', description: 'User input and background info processing',
      placeholder: 'Describe how to handle user input and context...',
      value: editableTemplate?.contextPrompt || '',
      onChange: (value: string) => handleLayerChange('contextPrompt', value)
    },
    {
      key: 'output' as const, title: 'Output Layer', description: 'Format requirements and quality standards',
      placeholder: 'Define output format, style, and quality standards...',
      value: editableTemplate?.outputPrompt || '',
      onChange: (value: string) => handleLayerChange('outputPrompt', value)
    }
  ];

  const handlePreview = useCallback(async () => {
    if (!editableTemplate) return;
    try {
      const platformId = editableTemplate.platform;
      const mockPlatform: SocialMediaPlatform = {
        id: platformId,
        name: platformId.charAt(0).toUpperCase() + platformId.slice(1),
        maxLength: 10000, 
        styleKeywords: [], 
        requiredElements: [], 
        formatRules: {} as FormatRules, 
      };
      
      const combined = combinePromptLayers(editableTemplate);
      const platformSpecificPreview = await platformAnalyzer.generatePlatformSpecificPrompt(combined, mockPlatform);
      setPreviewContent(platformSpecificPreview);
      
      const qualityEvalResult = await qualityEvaluator.quickEvaluate(combined, mockPlatform);
      
      const antiAIRecommendations: AntiAIRecommendation[] = (qualityEvalResult.recommendations || []).map(rec => ({
        description: rec,
        strategy: 'naturalization', 
        technique: 'general', 
        example: '', 
        expectedReduction: 0, 
        difficulty: 'easy' 
      }));

      const optimizationPriority: OptimizationPriority[] = (qualityEvalResult.keyIssues || []).map((issue, index) => ({
        category: 'readability',
        priority: index === 0 ? 'high' : 'medium', 
        description: issue,
        expectedImpact: 50, 
        effort: 'medium', 
        timeline: 'short-term' 
      })); 

      const report: EnhancedQualityReport = {
        overallScore: qualityEvalResult.overallScore,
        originalityScore: 0, 
        platformComplianceScore: 0, 
        readabilityScore: 0, 
        aiDetectionReport: {} as any, 
        naturalnessScore: 0, 
        humanLikenessScore: 0, 
        platformAnalysis: {} as any, 
        audienceAlignment: 0, 
        viralPotential: 0, 
        optimizationPriority,
        antiAIRecommendations,
        platformSpecificSuggestions: [],
        processingTime: qualityEvalResult.processingTime || 0,
        confidence: qualityEvalResult.confidence || 0,
        timestamp: new Date()
      };
      setQualityReport(report);

    } catch (error) {
      console.error('Preview generation or quality check failed:', error);
      setPreviewContent('Error generating preview.');
      setQualityReport(null);
    }
  }, [editableTemplate, platformAnalyzer, qualityEvaluator]);

  const handleSaveInternal = async () => {
    if (!editableTemplate) return;
    setSaving(true);
    try {
        const errors: ValidationError[] = [];
        if (!editableTemplate.name || editableTemplate.name.trim() === '') {
            errors.push({ field: 'name', message: 'Template name is required.', severity: 'error' });
        }
        setValidationErrors(errors);

        if (errors.length === 0) {
            await onSave(editableTemplate);
        }
    } catch (error) {
        console.error('Save failed:', error);
        setValidationErrors([{ field: 'general', message: 'Save operation failed.', severity: 'error' }]);
    } finally {
        setSaving(false);
    }
  };

  // Auto-save logic from the original prompt (debounced)
  const debouncedSave = useMemo(
    () => debounce(async (templateToSave: AdvancedPromptTemplate) => {
      // Auto-save should perhaps not show validation errors aggressively or be more subtle.
      // For now, it just calls onSave.
      try {
        await onSave(templateToSave);
        console.log('Auto-saved template');
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 2000),
    [onSave]
  );

  useEffect(() => {
    if (editableTemplate) {
      // Trigger debouncedSave when editableTemplate changes significantly (e.g., content layers)
      // This simple version triggers on any change to editableTemplate. More sophisticated logic might be needed.
      debouncedSave(editableTemplate);
    }
  }, [editableTemplate, debouncedSave]);

  if (!editableTemplate) {
    return <div style={{padding: '20px'}}>No template selected or being created.</div>; // Or a creation UI
  }

  return (
    <div className="layered-prompt-editor" style={{ padding: '16px', fontFamily: 'sans-serif' }}>
      {/* Layer Tabs */}
      <div className="layer-tabs" style={{ marginBottom: '16px', display: 'flex', borderBottom: '1px solid #ccc' }}>
        {layerConfigs.map((layer) => (
          <button
            key={layer.key}
            className={`layer-tab ${activeLayer === layer.key ? 'active' : ''}`}
            onClick={() => setActiveLayer(layer.key)}
            style={{
              padding: '10px 15px',
              border: 'none',
              background: activeLayer === layer.key ? '#eee' : 'transparent',
              cursor: 'pointer',
              fontWeight: activeLayer === layer.key ? 'bold' : 'normal'
            }}
          >
            {layer.title} <span style={{ color: layer.value.length > 0 ? 'green' : '#aaa'}}>●</span>
          </button>
        ))}
      </div>

      {/* Editor Content Area */}
      <div className="editor-content" style={{ display: 'flex', gap: '16px' }}>
        <div className="editor-main" style={{ flex: 2 }}>
          {layerConfigs.map((layer) => (
            <div
              key={layer.key}
              className={`layer-editor ${activeLayer === layer.key ? 'active' : ''}`}
              style={{ display: activeLayer === layer.key ? 'block' : 'none' }}
            >
              <div className="layer-header" style={{ marginBottom: '10px' }}>
                <h3>{layer.title}</h3>
                <p style={{ fontSize: '0.9em', color: '#555' }}>{layer.description}</p>
              </div>
              <CodeEditor
                value={layer.value}
                onChange={layer.onChange}
                placeholder={layer.placeholder}
                language="markdown"
                height="250px"
              />
              <div className="layer-tools" style={{ marginTop: '10px' }}>
                <VariableInserter variables={editableTemplate.variables || []} onInsert={(v) => {/* Implement insertion */}} />
                <ExampleSelector examples={editableTemplate.examples || []} onSelect={(e) => {/* Implement selection */}} />
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar: Preview & Quality */}
        <div className="editor-sidebar" style={{ flex: 1, borderLeft: '1px solid #eee', paddingLeft: '16px' }}>
          <div className="preview-panel" style={{ marginBottom: '20px' }}>
            <div className="preview-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4>Live Preview</h4>
              <button onClick={handlePreview} style={{padding: '5px 10px'}}>Refresh</button>
            </div>
            <MarkdownRenderer content={previewContent} />
          </div>

          {qualityReport && (
            <div className="quality-panel">
              <h4>Quality Assessment</h4>
              <QualityScoreDisplay report={qualityReport} compact={false} />
              <QualityImprovementSuggestions 
                suggestions={qualityReport.antiAIRecommendations || []} 
                onApply={(suggestion) => {/* Implement apply suggestion */}}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer with Validation & Actions */}
      <div className="editor-footer" style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="validation-status">
          {validationErrors.length > 0 && (
            <ValidationErrorDisplay errors={validationErrors} />
          )}
        </div>
        <div className="editor-actions">
          <button onClick={handlePreview} style={{ padding: '8px 12px', marginRight: '8px' }}>Preview</button>
          <button 
            onClick={handleSaveInternal} 
            disabled={!editableTemplate || saving}
            style={{ padding: '8px 12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LayeredPromptEditor; 