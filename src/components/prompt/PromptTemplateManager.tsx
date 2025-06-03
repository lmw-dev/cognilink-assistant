import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AdvancedPromptTemplate, PromptCategory } from '../../types/prompt-advanced';
import { SocialMediaPlatform, PlatformId } from '../../types/social-media';
import { EnhancedPromptTemplateService } from '../../services/prompt/EnhancedPromptTemplateService';
import { PromptModuleService } from '../../services/prompt/PromptModuleService'; // Changed from PlatformTemplateManager
import { ContentQualityEvaluator } from '../../services/content-quality-evaluator';

import { TemplateCard } from './TemplateCard';
import { SearchInput } from './SearchInput';
import { FilterPanel } from './FilterPanel';
import { VirtualizedList } from './VirtualizedList';

// Placeholder for debounce, in a real app, you'd use lodash.debounce or a custom hook
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => ReturnType<F>; // Not perfectly typed but ok for placeholder
};

// --- Placeholder Components (to be implemented or imported) ---
interface ActionPanelProps { children: React.ReactNode; }
const ActionPanel: React.FC<ActionPanelProps> = ({ children }) => <div className="action-panel" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>{children}</div>;

interface CreateTemplateButtonProps { onClick: () => void; }
const CreateTemplateButton: React.FC<CreateTemplateButtonProps> = ({ onClick }) => <button onClick={onClick} style={{padding: '8px 12px'}}>+ Create New</button>;

interface ViewModeToggleProps { value: 'grid' | 'list'; onChange: (mode: 'grid' | 'list') => void; }
const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ value, onChange }) => (
  <div>
    <button onClick={() => onChange('grid')} disabled={value === 'grid'} style={{marginRight: '4px'}}>Grid</button>
    <button onClick={() => onChange('list')} disabled={value === 'list'}>List</button>
  </div>
);

interface BatchOperationMenuProps { selectedCount: number; onOperation: (operation: 'delete' | 'export' | 'duplicate') => void;}
const BatchOperationMenu: React.FC<BatchOperationMenuProps> = ({ selectedCount, onOperation }) => {
  if (selectedCount === 0) return null;
  return (
    <div className="batch-operations">
      <span>{selectedCount} selected: </span>
      <button onClick={() => onOperation('delete')} style={{marginLeft: '4px'}}>Delete</button>
      <button onClick={() => onOperation('export')} style={{marginLeft: '4px'}}>Export</button>
      <button onClick={() => onOperation('duplicate')} style={{marginLeft: '4px'}}>Duplicate</button>
    </div>
  );
};

const LoadingSpinner: React.FC = () => <div className="loading-spinner" style={{padding: '20px', textAlign: 'center'}}>Loading...</div>;

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}
const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => (
  <div className="empty-state" style={{ padding: '40px', textAlign: 'center', color: '#777' }}>
    <h3>{title}</h3>
    <p>{description}</p>
    {action && <div style={{marginTop: '16px'}}>{action}</div>}
  </div>
);
// --- End Placeholder Components ---


export interface PromptTemplateManagerProps {
  templateService: EnhancedPromptTemplateService;
  platformManager: PromptModuleService; // Changed from PlatformTemplateManager
  qualityEvaluator: ContentQualityEvaluator;

  onTemplateSelect?: (template: AdvancedPromptTemplate) => void;
  onTemplateEdit?: (template: AdvancedPromptTemplate) => void;
  // Added from task description (not in original file skeleton)
  onTemplateCreate?: () => void; // For handling create button action, might open a new view/modal
}

export const PromptTemplateManager: React.FC<PromptTemplateManagerProps> = ({
  templateService,
  platformManager, // This prop might need to be broken down if PlatformTemplateManager doesn't exist as a single service
  qualityEvaluator,
  onTemplateSelect,
  onTemplateEdit,
  onTemplateCreate // Added prop
}) => {
  const [templates, setTemplates] = useState<AdvancedPromptTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<AdvancedPromptTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());

  // Load initial templates
  useEffect(() => {
    setLoading(true);
    templateService.getTemplates()
      .then(fetchedTemplates => {
        setTemplates(fetchedTemplates);
        setFilteredTemplates(fetchedTemplates);
      })
      .catch(error => {
        console.error("Failed to fetch templates:", error);
        // Handle error display to user
      })
      .finally(() => setLoading(false));
  }, [templateService]);

  // Filtering logic
  useEffect(() => {
    let currentFiltered = templates;

    if (searchQuery) {
      currentFiltered = currentFiltered.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }

    if (selectedPlatform !== 'all') {
      currentFiltered = currentFiltered.filter(t => t.platform === selectedPlatform);
    }

    if (selectedCategory !== 'all') {
      currentFiltered = currentFiltered.filter(t => t.category === selectedCategory);
    }
    setFilteredTemplates(currentFiltered);
  }, [searchQuery, selectedPlatform, selectedCategory, templates]);


  const handleSearch = useMemo(() => debounce((query: string) => {
    setSearchQuery(query); // The actual filtering is handled by the useEffect above
  }, 300), []);

  // Actual search query for input, debounced version updates the filter state
  const [immediateSearchQuery, setImmediateSearchQuery] = useState('');
  const handleImmediateSearchChange = (query: string) => {
    setImmediateSearchQuery(query);
    handleSearch(query);
  }

  const handleBatchOperation = useCallback(async (operation: 'delete' | 'export' | 'duplicate') => {
    if (selectedTemplates.size === 0) return;
    console.log(`Batch operation: ${operation} on templates:`, Array.from(selectedTemplates));
    // Implement actual batch operations using templateService
    // Example for delete:
    if (operation === 'delete') {
      try {
        setLoading(true);
        await Promise.all(Array.from(selectedTemplates).map(id => templateService.deleteTemplate(id)));
        // Refresh templates list
        const updatedTemplates = await templateService.getTemplates();
        setTemplates(updatedTemplates);
        setSelectedTemplates(new Set()); // Clear selection
      } catch (error) {
        console.error("Batch delete failed:", error);
        // Show error to user
      } finally {
        setLoading(false);
      }
    }
    // TODO: Implement export and duplicate
  }, [selectedTemplates, templateService]);

  const handleTemplateCreateInternal = useCallback(() => {
    if (onTemplateCreate) {
        onTemplateCreate();
    } else {
        // Fallback or default behavior if no handler is passed (e.g., navigate, open modal)
        console.log('Create new template clicked - no external handler provided');
        // Potentially call onTemplateEdit with a new/empty template object or a special ID
        // For now, let's assume onTemplateEdit would handle a null/undefined template as "create new"
        // or a separate view is invoked by the parent.
        // This example follows the `tom-120-user-interface-optimization.md` where `onTemplateEdit` is for editing existing.
    }
  }, [onTemplateCreate]);

  const handleToggleSelection = useCallback((templateId: string, isSelected: boolean) => {
    setSelectedTemplates(prevSelected => {
      const newSelection = new Set(prevSelected);
      if (isSelected) {
        newSelection.add(templateId);
      } else {
        newSelection.delete(templateId);
      }
      return newSelection;
    });
  }, []);

  return (
    <div className="prompt-template-manager" style={{ padding: '16px', fontFamily: 'sans-serif' }}>
      {/* Toolbar */}
      <div className="template-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <SearchInput
          value={immediateSearchQuery}
          onChange={handleImmediateSearchChange}
          placeholder="Search templates..."
          className="template-search"
        />
        
        <FilterPanel
          selectedPlatform={selectedPlatform}
          onPlatformChange={setSelectedPlatform}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        
        <ActionPanel>
          <CreateTemplateButton onClick={handleTemplateCreateInternal} />
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
          <BatchOperationMenu
            selectedCount={selectedTemplates.size}
            onOperation={handleBatchOperation}
          />
        </ActionPanel>
      </div>

      {/* Template List */}
      {loading && <LoadingSpinner />}
      {!loading && filteredTemplates.length === 0 && (
        <EmptyState
          title="No Templates Found"
          description="Try adjusting your search or filter criteria, or create a new template."
          action={<CreateTemplateButton onClick={handleTemplateCreateInternal} />}
        />
      )}
      {!loading && filteredTemplates.length > 0 && (
        <div className={`template-list template-list-${viewMode}`} style={viewMode === 'grid' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' } : {}}>
          <VirtualizedList
            items={filteredTemplates}
            renderItem={(template) => (
              <TemplateCard
                key={template.id} // Key should ideally be here, VirtualizedList might handle it internally too
                template={template}
                selected={selectedTemplates.has(template.id)}
                viewMode={viewMode}
                onSelect={() => onTemplateSelect?.(template)}
                onEdit={() => onTemplateEdit?.(template)}
                onToggleSelection={(isSelected) => handleToggleSelection(template.id, isSelected)}
                // onDelete, onDuplicate could be added here if TemplateCard handles them directly
                // or via a context menu within TemplateCard for non-batch operations.
              />
            )}
            itemHeight={viewMode === 'grid' ? 220 : 80} // Approximate height, adjust as needed
            containerHeight={500} // Example height, adjust based on layout
          />
        </div>
      )}
    </div>
  );
};

export default PromptTemplateManager; 