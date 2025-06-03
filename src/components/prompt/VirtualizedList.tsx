import React, { CSSProperties } from 'react';

export interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number | ((index: number) => number); // Can be a fixed number or a function returning height for dynamic heights
  containerHeight: number | string; // e.g., 500 (for px) or '100%'
  className?: string;
  style?: CSSProperties;
  // Other props like overscanCount, keyExtractor, etc. could be added for a full implementation
}

/**
 * Placeholder for a VirtualizedList component.
 * This is NOT a true virtualized list. It simply renders all items.
 * For actual virtualization, consider using libraries like react-window or react-virtualized,
 * or implement a proper windowing algorithm.
 */
export const VirtualizedList = <T,>({
  items,
  renderItem,
  // itemHeight, // Not used in this placeholder
  containerHeight,
  className = '',
  style = {},
}: VirtualizedListProps<T>): React.ReactElement => {
  return (
    <div
      className={`virtualized-list-placeholder ${className}`.trim()}
      style={{
        height: containerHeight,
        overflowY: 'auto',
        border: '1px dashed #ccc', // Indication that it's a placeholder/scrollable area
        padding: '4px',
        ...style,
      }}
    >
      {items.map((item, index) => (
        // In a real virtualized list, you would calculate which items are visible
        // and only render those, absolutely positioned.
        // The key should be unique and stable.
        <div key={index}> {/* Consider a more stable key if available, e.g., item.id */}
          {renderItem(item, index)}
        </div>
      ))}
      {items.length === 0 && (
        <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
          No items to display.
        </div>
      )}
    </div>
  );
};

export default VirtualizedList; 