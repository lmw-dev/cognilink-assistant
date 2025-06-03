import React from 'react';
import { PromptCategory } from '../../types/prompt-advanced'; // Correct path

// This would ideally come from a shared constants or service/type definition
// For now, mirroring the structure from PromptCategory type if it were an enum/union of strings
const AVAILABLE_CATEGORIES: { id: PromptCategory | 'all'; name: string }[] = [
  { id: 'all', name: 'All Categories' },
  { id: 'product-review', name: 'Product Review' },
  { id: 'opinion-sharing', name: 'Opinion Sharing' },
  { id: 'analytical-article', name: 'Analytical Article' },
  { id: 'tutorial-guide', name: 'Tutorial/Guide' },
  { id: 'personal-story', name: 'Personal Story' },
  { id: 'news-commentary', name: 'News Commentary' },
  { id: 'lifestyle-sharing', name: 'Lifestyle Sharing' },
  { id: 'technical-blog', name: 'Technical Blog' },
  { id: 'marketing-copy', name: 'Marketing Copy' },
  { id: 'social-media-post', name: 'Social Media Post' },
  { id: 'custom', name: 'Custom' },
  // Add other categories as defined in your PromptCategory type
];

export interface CategoryFilterProps {
  value: PromptCategory | 'all';
  onChange: (value: PromptCategory | 'all') => void;
  className?: string;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  value,
  onChange,
  className = ''
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as PromptCategory | 'all')}
      className={`category-filter ${className}`.trim()}
      style={{ padding: '8px 12px', fontSize: '1em', border: '1px solid #ccc', borderRadius: '4px' }} // Basic styling
    >
      {AVAILABLE_CATEGORIES.map(category => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
};

export default CategoryFilter; 