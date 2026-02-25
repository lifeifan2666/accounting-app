import { useEffect, useState } from 'react';
import { Popup, Toast } from 'antd-mobile';
import { getTags, createTag } from '../api';
import type { Tag } from '../api/types';

interface TagSelectorProps {
  visible: boolean;
  selectedTagIds: number[];
  onClose: () => void;
  onChange: (tagIds: number[]) => void;
}

const PRESET_COLORS = [
  '#5B8DEF', '#52C41A', '#7B61FF', '#F5A623',
  '#B890C1', '#5CB8A8', '#E8A87C', '#8E9AAF',
  '#EA5455', '#00CFE8', '#FF6B6B', '#4ECDC4',
];

export default function TagSelector({ visible, selectedTagIds, onClose, onChange }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    if (visible) {
      fetchTags();
    }
  }, [visible]);

  const fetchTags = async () => {
    try {
      const res = await getTags();
      setTags(res.data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const handleTagToggle = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      Toast.show({ content: '请输入标签名称', icon: 'fail' });
      return;
    }

    try {
      const res = await createTag({ name: newTagName.trim(), color: newTagColor });
      setTags([...tags, res.data]);
      onChange([...selectedTagIds, res.data.id]);
      setNewTagName('');
      setShowCreate(false);
      Toast.show({ content: '标签创建成功', icon: 'success' });
    } catch {
      Toast.show({ content: '创建失败，标签可能已存在', icon: 'fail' });
    }
  };

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      bodyStyle={{
        height: '60vh',
        borderRadius: '20px 20px 0 0',
        background: 'var(--color-bg-card)',
      }}
    >
      <div style={{ padding: '20px 16px' }}>
        {!showCreate ? (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                选择标签
              </span>
              <span
                onClick={onClose}
                style={{ color: 'var(--color-text-tertiary)', fontSize: 15 }}
              >
                完成
              </span>
            </div>

            {/* Existing Tags */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 20,
            }}>
              {tags.map(tag => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <div
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 16,
                      background: isSelected ? tag.color : 'var(--color-divider)',
                      color: isSelected ? '#fff' : 'var(--color-text-primary)',
                      fontSize: 14,
                      fontWeight: isSelected ? 600 : 500,
                      border: isSelected ? 'none' : '1px solid var(--color-border)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {tag.name}
                  </div>
                );
              })}

              {/* Create New Tag Button */}
              <div
                onClick={() => setShowCreate(true)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 16,
                  background: 'var(--color-divider)',
                  color: 'var(--color-text-secondary)',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  border: '1px dashed var(--color-border)',
                }}
              >
                <span style={{ fontSize: 16 }}>+</span>
                <span>新建标签</span>
              </div>
            </div>

            {/* Selected Tags Preview */}
            {selectedTagIds.length > 0 && (
              <div style={{
                padding: '12px 16px',
                background: 'var(--color-bg)',
                borderRadius: 12,
              }}>
                <div style={{
                  fontSize: 12,
                  color: 'var(--color-text-tertiary)',
                  marginBottom: 8,
                }}>
                  已选择 {selectedTagIds.length} 个标签
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedTagIds.map(id => {
                    const tag = tags.find(t => t.id === id);
                    if (!tag) return null;
                    return (
                      <span
                        key={tag.id}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 10,
                          background: tag.color,
                          color: '#fff',
                          fontSize: 12,
                        }}
                      >
                        {tag.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <span
                onClick={() => setShowCreate(false)}
                style={{ color: 'var(--color-text-tertiary)', fontSize: 15 }}
              >
                取消
              </span>
              <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                新建标签
              </span>
              <span
                onClick={handleCreateTag}
                style={{ color: 'var(--color-expense)', fontSize: 15, fontWeight: 500 }}
              >
                创建
              </span>
            </div>

            {/* Tag Name Input */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 13,
                color: 'var(--color-text-secondary)',
                marginBottom: 8,
              }}>
                标签名称
              </div>
              <input
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                placeholder="输入标签名称"
                maxLength={10}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text-primary)',
                  fontSize: 15,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Color Selection */}
            <div>
              <div style={{
                fontSize: 13,
                color: 'var(--color-text-secondary)',
                marginBottom: 12,
              }}>
                选择颜色
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
              }}>
                {PRESET_COLORS.map(color => (
                  <div
                    key={color}
                    onClick={() => setNewTagColor(color)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: color,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: newTagColor === color ? `0 0 0 3px ${color}40` : 'none',
                      border: newTagColor === color ? '2px solid #fff' : 'none',
                    }}
                  >
                    {newTagColor === color && (
                      <span style={{ color: '#fff', fontSize: 18 }}>✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Popup>
  );
}
