import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Popup, Toast, Dialog } from 'antd-mobile';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api';
import type { Category } from '../api/types';
import { BackButton } from '../components/Icons';

// 分类图标配置
const categoryConfig: Record<string, { icon: string; bg: string }> = {
  '工资': { icon: '💰', bg: '#FFF4E6' },
  '奖金': { icon: '🎁', bg: '#FFE8F0' },
  '投资收益': { icon: '📈', bg: '#E8F5E9' },
  '其他收入': { icon: '💵', bg: '#E3F2FD' },
  '餐饮': { icon: '🍜', bg: '#FFF3E0' },
  '交通': { icon: '🚗', bg: '#E8EAF6' },
  '购物': { icon: '🛒', bg: '#FCE4EC' },
  '娱乐': { icon: '🎮', bg: '#F3E5F5' },
  '宠物': { icon: '🐾', bg: '#E0F7FA' },
  '教育': { icon: '📚', bg: '#FFF8E1' },
  '房租': { icon: '🏠', bg: '#EFEBE9' },
  '其他支出': { icon: '📦', bg: '#ECEFF1' },
};

// 常用图标
const commonIcons = ['💰', '🎁', '📈', '💵', '🍜', '🚗', '🛒', '🎮', '🐾', '📚', '🏠', '📦', '💊', '✈️', '📱', '💻', '🎬', '🎵', '⚽', '🎨'];

export default function CategoryManage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('📝');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => c.type === type);

  const handleAddCategory = async () => {
    if (!newName.trim()) {
      Toast.show({ content: '请输入分类名称', icon: 'fail' });
      return;
    }

    try {
      await createCategory({ name: newName.trim(), type });
      Toast.show({ content: '添加成功', icon: 'success' });
      setShowAddPopup(false);
      setNewName('');
      setNewIcon('📝');
      fetchCategories();
    } catch (error) {
      Toast.show({ content: '添加失败', icon: 'fail' });
    }
  };

  const handleEditCategory = async () => {
    if (!editCategory || !newName.trim()) {
      Toast.show({ content: '请输入分类名称', icon: 'fail' });
      return;
    }

    try {
      await updateCategory(editCategory.id, { name: newName.trim(), type: editCategory.type });
      Toast.show({ content: '更新成功', icon: 'success' });
      setShowEditPopup(false);
      setEditCategory(null);
      setNewName('');
      fetchCategories();
    } catch (error) {
      Toast.show({ content: '更新失败', icon: 'fail' });
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    const result = await Dialog.confirm({
      content: `确定要删除"${category.name}"分类吗？`,
      confirmText: '删除',
      cancelText: '取消',
    });

    if (result) {
      try {
        await deleteCategory(category.id);
        Toast.show({ content: '已删除', icon: 'success' });
        fetchCategories();
      } catch (error) {
        Toast.show({ content: '删除失败，该分类可能正在使用中', icon: 'fail' });
      }
    }
  };

  const openEditPopup = (category: Category) => {
    setEditCategory(category);
    setNewName(category.name);
    const config = categoryConfig[category.name];
    setNewIcon(config?.icon || '📝');
    setShowEditPopup(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      paddingBottom: 20,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        background: 'var(--color-bg-card)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <BackButton onClick={() => navigate(-1)} />
        <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          分类管理
        </span>
        <div
          onClick={() => {
            setNewName('');
            setNewIcon('📝');
            setShowAddPopup(true);
          }}
          style={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
            background: 'var(--color-divider)',
            fontSize: 20,
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
          }}
        >
          +
        </div>
      </div>

      {/* Type Tabs */}
      <div style={{
        display: 'flex',
        padding: '16px 20px',
        gap: 12,
        background: 'var(--color-bg-card)',
      }}>
        <div
          onClick={() => setType('expense')}
          style={{
            flex: 1,
            padding: '12px',
            textAlign: 'center',
            borderRadius: 14,
            background: type === 'expense' ? 'var(--color-expense-light)' : 'var(--color-divider)',
            border: type === 'expense' ? '2px solid var(--color-expense)' : '2px solid transparent',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
        >
          <span style={{
            fontSize: 15,
            fontWeight: type === 'expense' ? 600 : 500,
            color: type === 'expense' ? 'var(--color-expense-dark)' : 'var(--color-text-secondary)',
          }}>
            支出
          </span>
        </div>
        <div
          onClick={() => setType('income')}
          style={{
            flex: 1,
            padding: '12px',
            textAlign: 'center',
            borderRadius: 14,
            background: type === 'income' ? 'var(--color-income-light)' : 'var(--color-divider)',
            border: type === 'income' ? '2px solid var(--color-income)' : '2px solid transparent',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
        >
          <span style={{
            fontSize: 15,
            fontWeight: type === 'income' ? 600 : 500,
            color: type === 'income' ? 'var(--color-income-dark)' : 'var(--color-text-secondary)',
          }}>
            收入
          </span>
        </div>
      </div>

      {/* Category List */}
      <div style={{ padding: '12px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>
            加载中...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
          }}>
            {filteredCategories.map(cat => {
              const config = categoryConfig[cat.name] || { icon: '📝', bg: '#F5F5F5' };

              return (
                <div
                  key={cat.id}
                  onClick={() => openEditPopup(cat)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '14px 6px',
                    borderRadius: 14,
                    background: 'var(--color-bg-card)',
                    boxShadow: 'var(--shadow-sm)',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: config.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    marginBottom: 8,
                  }}>
                    {config.icon}
                  </div>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--color-text-primary)',
                    textAlign: 'center',
                  }}>
                    {cat.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Category Popup */}
      <Popup
        visible={showAddPopup}
        onMaskClick={() => setShowAddPopup(false)}
        bodyStyle={{
          height: '60vh',
          borderRadius: '20px 20px 0 0',
          background: 'var(--color-bg-card)',
        }}
      >
        <div style={{ padding: '20px 16px' }}>
          <div style={{
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: 20,
            textAlign: 'center',
          }}>
            添加{type === 'expense' ? '支出' : '收入'}分类
          </div>

          {/* Icon Preview */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: 'var(--color-divider)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
            }}>
              {newIcon}
            </div>
          </div>

          {/* Name Input */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 14,
              color: 'var(--color-text-secondary)',
              marginBottom: 8,
            }}>
              分类名称
            </div>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="输入分类名称"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 12,
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
                fontSize: 15,
                color: 'var(--color-text-primary)',
                outline: 'none',
              }}
            />
          </div>

          {/* Icon Selection */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 14,
              color: 'var(--color-text-secondary)',
              marginBottom: 8,
            }}>
              选择图标
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
              gap: 8,
            }}>
              {commonIcons.map(icon => (
                <div
                  key={icon}
                  onClick={() => setNewIcon(icon)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: newIcon === icon ? 'var(--color-expense-light)' : 'var(--color-divider)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    cursor: 'pointer',
                    border: newIcon === icon ? '2px solid var(--color-expense)' : '2px solid transparent',
                  }}
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div
            onClick={handleAddCategory}
            style={{
              background: 'linear-gradient(135deg, var(--color-expense) 0%, var(--color-expense-dark) 100%)',
              color: 'white',
              textAlign: 'center',
              padding: '16px',
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            添加分类
          </div>
        </div>
      </Popup>

      {/* Edit Category Popup */}
      <Popup
        visible={showEditPopup}
        onMaskClick={() => setShowEditPopup(false)}
        bodyStyle={{
          height: '55vh',
          borderRadius: '20px 20px 0 0',
          background: 'var(--color-bg-card)',
        }}
      >
        <div style={{ padding: '20px 16px' }}>
          <div style={{
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: 20,
            textAlign: 'center',
          }}>
            编辑分类
          </div>

          {/* Icon Preview */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: 'var(--color-divider)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
            }}>
              {newIcon}
            </div>
          </div>

          {/* Name Input */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 14,
              color: 'var(--color-text-secondary)',
              marginBottom: 8,
            }}>
              分类名称
            </div>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="输入分类名称"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 12,
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
                fontSize: 15,
                color: 'var(--color-text-primary)',
                outline: 'none',
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div
              onClick={() => editCategory && handleDeleteCategory(editCategory)}
              style={{
                flex: 1,
                background: 'var(--color-divider)',
                color: 'var(--color-expense)',
                textAlign: 'center',
                padding: '16px',
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              删除
            </div>
            <div
              onClick={handleEditCategory}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, var(--color-expense) 0%, var(--color-expense-dark) 100%)',
                color: 'white',
                textAlign: 'center',
                padding: '16px',
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              保存
            </div>
          </div>
        </div>
      </Popup>
    </div>
  );
}
