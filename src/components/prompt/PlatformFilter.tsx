import React from 'react';
import { PlatformId, SocialMediaPlatform } from '../../types/social-media'; // Corrected path

// This would ideally come from a shared constants or service
const AVAILABLE_PLATFORMS: { id: PlatformId | 'all'; name: string }[] = [
  { id: 'all', name: 'All Platforms' }, // Special value for all
  { id: 'xiaohongshu', name: 'Xiaohongshu' },
  { id: 'twitter', name: 'Twitter' },
  { id: 'wechat', name: 'WeChat Official' },
  { id: 'blog', name: 'Blog' },
  { id: 'toutiao', name: 'Toutiao' },
  { id: 'zhihu', name: 'Zhihu' },
  { id: 'douyin', name: 'Douyin' },
  // Add other platforms as defined in your types/constants
];

export interface PlatformFilterProps {
  value: PlatformId | 'all';
  onChange: (value: PlatformId | 'all') => void;
  className?: string;
}

export const PlatformFilter: React.FC<PlatformFilterProps> = ({
  value,
  onChange,
  className = ''
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as PlatformId | 'all')}
      className={`platform-filter ${className}`.trim()}
      style={{ padding: '8px 12px', fontSize: '1em', border: '1px solid #ccc', borderRadius: '4px', marginRight: '8px' }} // Basic styling
    >
      {AVAILABLE_PLATFORMS.map(platform => (
        <option key={platform.id} value={platform.id}>
          {platform.name}
        </option>
      ))}
    </select>
  );
};

export default PlatformFilter; 