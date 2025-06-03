import React from 'react';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  // Add any other props like onDebounce, delay, etc. if needed later
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = ''
}) => {
  return (
    <input
      type="search" // Using type="search" for better semantics and potential browser features
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`search-input ${className}`.trim()}
      style={{ padding: '8px 12px', fontSize: '1em', border: '1px solid #ccc', borderRadius: '4px' }} // Basic styling
    />
  );
};

export default SearchInput; 