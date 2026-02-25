import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFrequentCategories } from '../api';
import type { FrequentCategory } from '../api/types';
import { getCategoryIcon } from './Icons';

export default function QuickEntry() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<FrequentCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFrequentCategories();
  }, []);

  const fetchFrequentCategories = async () => {
    try {
      const res = await getFrequentCategories({ limit: 5 });
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch frequent categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || categories.length === 0) {
    return null;
  }

  return (
    <div style={{
      background: 'var(--color-bg-card)',
      padding: '12px 0 16px',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div style={{
        fontSize: 13,
        color: 'var(--color-text-secondary)',
        fontWeight: 500,
        marginBottom: 12,
        paddingLeft: 16,
      }}>
        快捷记账
      </div>
      <div style={{
        display: 'flex',
        gap: 12,
        padding: '0 16px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
      }}>
        {categories.map(cat => {
          const config = getCategoryIcon(cat.name);
          return (
            <div
              key={cat.id}
              onClick={() => navigate(`/add?category_id=${cat.id}&type=${cat.type}`)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 60,
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: config.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                marginBottom: 6,
                boxShadow: 'var(--shadow-sm)',
                color: 'var(--color-text-primary)',
              }}>
                {config.icon}
              </div>
              <span style={{
                fontSize: 12,
                color: 'var(--color-text-secondary)',
                whiteSpace: 'nowrap',
              }}>
                {cat.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
