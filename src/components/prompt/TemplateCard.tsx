import React, { useState, useEffect } from 'react';
import { AdvancedPromptTemplate, PromptCategory } from '../../types/prompt-advanced';
import { PlatformId, SocialMediaPlatform } from '../../types/social-media'; // Corrected import for SocialMediaPlatform and added PlatformId

// Placeholder types and functions - these would be defined elsewhere or imported
// from actual implementations or a utility/icon library.

// Updated getPlatformIcon to primarily use PlatformId (string), but can still handle SocialMediaPlatform obj for flexibility
const getPlatformIcon = (platformId: PlatformId | SocialMediaPlatform): JSX.Element | string => {
  if (typeof platformId === 'string') {
    return platformId.substring(0, 2).toUpperCase(); // Handle PlatformId (string)
  }
  // Handle SocialMediaPlatform object (e.g., if a richer object is passed in some contexts)
  return platformId.name.substring(0, 2).toUpperCase(); 
};

// Updated getCategoryColor to primarily use PromptCategory (string)
const getCategoryColor = (category: PromptCategory): string => {
  return `category-${category.toString().toLowerCase().replace(/\s+/g, '-')}`;
};

// Placeholder for a simplified quality score calculation
const calculateTemplateQualityScore = (template: AdvancedPromptTemplate): number => {
  // This is a mock. Real calculation would be more complex.
  let score = 75;
  if (template.description && template.description.length > 50) score += 5;
  if (template.examples && template.examples.length > 0) score += 5;
  if (template.variables && template.variables.length > 0) score += 5;
  score += (template.usageCount || 0) / 10;
  return Math.min(100, Math.max(0, Math.round(score)));
};

// Placeholder for QualityBadge component
interface QualityBadgeProps {
  score: number;
}
const QualityBadge: React.FC<QualityBadgeProps> = ({ score }) => {
  let color = 'gray';
  if (score >= 90) color = 'green';
  else if (score >= 75) color = 'blue';
  else if (score >= 60) color = 'orange';
  else color = 'red';
  return <span style={{ color, fontWeight: 'bold' }}>{score}/100</span>;
};

// Placeholder for time formatting
const formatRelativeTime = (date: Date | string): string => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  // Simplified relative time, a library like date-fns would be better
  const diff = Math.round((new Date().getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${diff} days ago`;
};

// Placeholder Icon components
const EditIcon: React.FC = () => <span>✏️</span>; // Replace with actual icon
const DuplicateIcon: React.FC = () => <span>📄</span>; // Replace with actual icon
const DeleteIcon: React.FC = () => <span>🗑️</span>; // Replace with actual icon

export interface TemplateCardProps {
  template: AdvancedPromptTemplate;
  selected?: boolean;
  viewMode?: 'grid' | 'list';
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onToggleSelection?: (selected: boolean) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  selected = false,
  viewMode = 'grid',
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleSelection
}) => {
  const [showActions, setShowActions] = useState(false);
  const [qualityScore, setQualityScore] = useState<number | null>(null);

  // Calculate quality score
  useEffect(() => {
    const calculateScore = () => { // Removed async as placeholder is sync
      try {
        const score = calculateTemplateQualityScore(template);
        setQualityScore(score);
      } catch (error) {
        console.error('Failed to calculate quality score:', error);
        setQualityScore(null); // Set to null or a default on error
      }
    };
    
    calculateScore();
  }, [template]);

  // Directly use template.platform (PlatformId) and template.category (PromptCategory)
  const platformIconValue = getPlatformIcon(template.platform); 
  const categoryString = template.category.toString(); // Ensure it's a string for display and class name
  const categoryColorClass = getCategoryColor(template.category);

  return (
    <div 
      className={`template-card view-${viewMode} ${selected ? 'selected' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={(e) => {
        // Prevent onSelect when clicking checkbox or action buttons
        if (e.target instanceof HTMLInputElement) return;
        const clickedButton = (e.target as HTMLElement).closest('button');
        if (clickedButton && (clickedButton.classList.contains('action-button') || clickedButton.closest('.card-actions'))) return;
        onSelect?.();
      }}
      style={{ border: '1px solid #ccc', margin: '8px', padding: '12px', borderRadius: '4px', cursor: onSelect ? 'pointer' : 'default', position: 'relative', display: 'flex', flexDirection: viewMode === 'list' ? 'row' : 'column' }} // Basic styling
    >
      {/* Checkbox for selection */}
      <div className="card-checkbox" style={{ marginRight: viewMode === 'list' ? '12px' : '0', marginBottom: viewMode === 'grid' ? '8px' : '0' }}>
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            // e.stopPropagation(); // Stop propagation if it causes issues with onSelect
            onToggleSelection?.(e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()} // Prevent card click when checkbox is clicked
          style={{ cursor: 'pointer' }}
        />
      </div>

      {/* Card content */}
      <div className="card-content" style={{ flexGrow: 1 }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center' }}>
            <span className="platform-icon" style={{ marginRight: '8px', fontSize: '1.2em' }}>{platformIconValue}</span>
            <span className="template-name" style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{template.name}</span>
          </div>
          
          <div className="card-meta" style={{ display: 'flex', alignItems: 'center' }}>
            {categoryString && (
              <span className={`category-tag ${categoryColorClass}`} style={{ backgroundColor: '#eee', padding: '2px 6px', borderRadius: '3px', marginRight: '8px', fontSize: '0.9em' }}>
                {categoryString}
              </span>
            )}
            {qualityScore !== null && (
              <span className="quality-score">
                <QualityBadge score={qualityScore} />
              </span>
            )}
          </div>
        </div>

        <div className="card-body">
          {template.description && (
            <p className="template-description" style={{ fontSize: '0.95em', color: '#555', margin: '0 0 8px 0', maxHeight: viewMode === 'grid' ? '60px' : '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {template.description}
            </p>
          )}
          
          {viewMode === 'grid' && ( // Show stats and tags only in grid view for brevity in list view
            <>
              <div className="template-stats" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85em', color: '#777', marginBottom: '8px' }}>
                <div className="stat-item">
                  <span className="stat-label">Used: </span>
                  <span className="stat-value">{template.usageCount || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Updated: </span>
                  <span className="stat-value">
                    {formatRelativeTime(template.updatedAt)}
                  </span>
                </div>
              </div>

              {template.tags && template.tags.length > 0 && (
                <div className="template-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {template.tags.slice(0, 3).map((tag) => ( // Limit tags shown
                    <span key={tag} className="tag" style={{ backgroundColor: '#f0f0f0', padding: '2px 5px', borderRadius: '3px', fontSize: '0.8em' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Action buttons - always visible on hover, or persist if an action menu is preferred */}
      <div 
        className={`card-actions ${showActions || selected ? 'visible' : ''}`} // Show actions if hovered or selected
        style={{ 
          position: viewMode === 'grid' ? 'absolute' : 'static', 
          top: viewMode === 'grid' ? '8px' : 'auto', 
          right: viewMode === 'grid' ? '8px' : 'auto', 
          display: 'flex', 
          flexDirection: viewMode === 'grid' ? 'column' : 'row', 
          gap: '4px',
          marginLeft: viewMode === 'list' ? '12px' : '0',
          alignItems: viewMode === 'list' ? 'center' : 'flex-end' // Align to right for grid, center for list next to content
        }}
      >
        <button className="action-button" onClick={(e) => { e.stopPropagation(); onEdit?.(); }} title="Edit" style={{ padding: '4px', cursor: 'pointer' }}>
          <EditIcon />
        </button>
        <button className="action-button" onClick={(e) => { e.stopPropagation(); onDuplicate?.(); }} title="Duplicate" style={{ padding: '4px', cursor: 'pointer' }}>
          <DuplicateIcon />
        </button>
        <button className="action-button danger" onClick={(e) => { e.stopPropagation(); onDelete?.(); }} title="Delete" style={{ padding: '4px', cursor: 'pointer', color: 'red' }}>
          <DeleteIcon />
        </button>
      </div>
    </div>
  );
};

// Basic CSS (can be moved to a .css file and imported)
// Add this to your styles.css or a relevant CSS module.
/*
.template-card {
  transition: box-shadow 0.2s ease-in-out;
}
.template-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
.template-card.selected {
  border-color: #007bff; // Example selection color
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}
.template-card .card-actions {
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}
.template-card .card-actions.visible {
  opacity: 1;
}

.template-card.view-list {
  // Styles for list view
}
.template-card.view-grid {
 // Styles for grid view
}

.category-tag { // Add more specific category colors as needed
  // Example: .category-product-review { background-color: #e6f7ff; color: #1890ff; }
}
*/

export default TemplateCard; 