import type { Tag } from '../api/types';

interface TagDisplayProps {
  tags: Tag[];
  size?: 'small' | 'normal';
}

export default function TagDisplay({ tags, size = 'normal' }: TagDisplayProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  const fontSize = size === 'small' ? 10 : 11;
  const padding = size === 'small' ? '2px 6px' : '3px 8px';

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 4,
      marginTop: 4,
    }}>
      {tags.map(tag => (
        <span
          key={tag.id}
          style={{
            fontSize,
            padding,
            borderRadius: 10,
            background: tag.color || '#5B8DEF',
            color: '#fff',
            whiteSpace: 'nowrap',
          }}
        >
          {tag.name}
        </span>
      ))}
    </div>
  );
}
