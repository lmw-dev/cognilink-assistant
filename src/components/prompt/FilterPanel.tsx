import React from 'react';
import { PlatformFilter, PlatformFilterProps } from './PlatformFilter';
import { CategoryFilter, CategoryFilterProps } from './CategoryFilter';

export interface FilterPanelProps {
  selectedPlatform: PlatformFilterProps['value'];
  onPlatformChange: PlatformFilterProps['onChange'];
  selectedCategory: CategoryFilterProps['value'];
  onCategoryChange: CategoryFilterProps['onChange'];
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedPlatform,
  onPlatformChange,
  selectedCategory,
  onCategoryChange,
  className = ''
}) => {
  return (
    <div className={`filter-panel ${className}`.trim()} style={{ display: 'flex', alignItems: 'center' }}>
      <PlatformFilter 
        value={selectedPlatform} 
        onChange={onPlatformChange} 
      />
      <CategoryFilter 
        value={selectedCategory} 
        onChange={onCategoryChange} 
      />
      {/* Add other filters here if needed, e.g., sort by, tags filter */}
    </div>
  );
};

export default FilterPanel; 