import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Dialog, Toast, DatePickerView, Popup } from 'antd-mobile';
import dayjs from 'dayjs';
import { getTransaction, updateTransaction, deleteTransaction, getCategories, getAccounts, getTags } from '../api';
import type { Transaction, Category, Account, Tag } from '../api/types';
import { getCategoryIcon, BackButton } from '../components/Icons';
import TagSelector from '../components/TagSelector';
import TagDisplay from '../components/TagDisplay';

export default function TransactionDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  // 编辑状态
  const [editing, setEditing] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editDate, setEditDate] = useState(new Date());
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  const [editAccountId, setEditAccountId] = useState<number | null>(null);
  const [editTagIds, setEditTagIds] = useState<number[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTagSelector, setShowTagSelector] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, catRes, accRes, tagRes] = await Promise.all([
        getTransaction(Number(id)),
        getCategories(),
        getAccounts(),
        getTags(),
      ]);
      setTransaction(transRes.data);
      setCategories(catRes.data);
      setAccounts(accRes.data);
      setAllTags(tagRes.data);

      // 初始化编辑状态
      setEditAmount(transRes.data.amount.toString());
      setEditNote(transRes.data.note || '');
      setEditDate(new Date(transRes.data.date));
      setEditCategoryId(transRes.data.category_id);
      setEditAccountId(transRes.data.account_id);
      setEditTagIds(transRes.data.tags?.map(t => t.id) || []);
    } catch (error) {
      console.error('Failed to fetch transaction:', error);
      Toast.show({ content: '加载失败', icon: 'fail' });
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!transaction) return;

    if (!editCategoryId) {
      Toast.show({ content: '请选择分类', icon: 'fail' });
      return;
    }
    if (!editAccountId) {
      Toast.show({ content: '请选择账户', icon: 'fail' });
      return;
    }
    if (!editAmount || parseFloat(editAmount) <= 0) {
      Toast.show({ content: '请输入有效金额', icon: 'fail' });
      return;
    }

    try {
      await updateTransaction(transaction.id, {
        account_id: editAccountId,
        category_id: editCategoryId,
        amount: parseFloat(editAmount),
        type: transaction.type,
        date: dayjs(editDate).format('YYYY-MM-DD'),
        note: editNote,
        tag_ids: editTagIds,
      });
      Toast.show({ content: '保存成功', icon: 'success' });
      setEditing(false);
      fetchData();
    } catch (error) {
      Toast.show({ content: '保存失败', icon: 'fail' });
    }
  };

  const handleDelete = async () => {
    const result = await Dialog.confirm({
      content: '确定要删除这条记录吗？',
      confirmText: '删除',
      cancelText: '取消',
    });

    if (result) {
      try {
        await deleteTransaction(Number(id));
        Toast.show({ content: '已删除', icon: 'success' });
        navigate(-1);
      } catch (error) {
        Toast.show({ content: '删除失败', icon: 'fail' });
      }
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text-secondary)',
      }}>
        加载中...
      </div>
    );
  }

  if (!transaction) {
    return null;
  }

  const config = getCategoryIcon(transaction.category_name || '');
  const isExpense = transaction.type === 'expense';
  const color = isExpense ? 'var(--color-expense)' : 'var(--color-income)';
  const colorLight = isExpense ? 'var(--color-expense-light)' : 'var(--color-income-light)';
  const filteredCategories = categories.filter(c => c.type === transaction.type);
  const selectedCategory = categories.find(c => c.id === editCategoryId);
  const selectedAccount = accounts.find(a => a.id === editAccountId);
  const selectedTags = allTags.filter(t => editTagIds.includes(t.id));

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      paddingBottom: 100,
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
          {editing ? '编辑记录' : '交易详情'}
        </span>
        <div
          onClick={() => editing ? handleSave() : setEditing(true)}
          style={{
            fontSize: 15,
            fontWeight: 500,
            color,
            cursor: 'pointer',
          }}
        >
          {editing ? '保存' : '编辑'}
        </div>
      </div>

      {/* 金额展示 */}
      <div style={{
        background: colorLight,
        padding: '32px 20px',
        textAlign: 'center',
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: config.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          margin: '0 auto 16px',
        }}>
          {config.icon}
        </div>
        {editing ? (
          <input
            type="number"
            value={editAmount}
            onChange={e => setEditAmount(e.target.value)}
            style={{
              fontSize: 36,
              fontWeight: 700,
              color,
              background: 'transparent',
              border: 'none',
              textAlign: 'center',
              width: '100%',
              outline: 'none',
            }}
          />
        ) : (
          <div style={{
            fontSize: 36,
            fontWeight: 700,
            color,
          }}>
            {isExpense ? '-' : '+'}¥{transaction.amount.toFixed(2)}
          </div>
        )}
        <div style={{
          fontSize: 14,
          color: 'var(--color-text-secondary)',
          marginTop: 8,
        }}>
          {transaction.category_name}
        </div>
      </div>

      {/* 详情信息 */}
      <div style={{ padding: '16px' }}>
        <div style={{
          background: 'var(--color-bg-card)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* 分类 */}
          <div
            onClick={() => editing && setShowCategoryPicker(true)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              borderBottom: '1px solid var(--color-divider)',
              cursor: editing ? 'pointer' : 'default',
            }}
          >
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>分类</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                {selectedCategory?.name || transaction.category_name}
              </span>
              {editing && <span style={{ color: 'var(--color-text-tertiary)', fontSize: 16 }}>›</span>}
            </div>
          </div>

          {/* 账户 */}
          <div
            onClick={() => editing && setShowAccountPicker(true)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              borderBottom: '1px solid var(--color-divider)',
              cursor: editing ? 'pointer' : 'default',
            }}
          >
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>账户</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                {selectedAccount?.name || transaction.account_name}
              </span>
              {editing && <span style={{ color: 'var(--color-text-tertiary)', fontSize: 16 }}>›</span>}
            </div>
          </div>

          {/* 日期 */}
          <div
            onClick={() => editing && setShowDatePicker(true)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              borderBottom: '1px solid var(--color-divider)',
              cursor: editing ? 'pointer' : 'default',
            }}
          >
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>日期</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                {editing ? dayjs(editDate).format('YYYY-MM-DD') : transaction.date}
              </span>
              {editing && <span style={{ color: 'var(--color-text-tertiary)', fontSize: 16 }}>›</span>}
            </div>
          </div>

          {/* 备注 */}
          <div style={{ padding: '16px', borderBottom: '1px solid var(--color-divider)' }}>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 8 }}>备注</div>
            {editing ? (
              <input
                value={editNote}
                onChange={e => setEditNote(e.target.value)}
                placeholder="添加备注..."
                style={{
                  width: '100%',
                  border: 'none',
                  fontSize: 15,
                  outline: 'none',
                  background: 'transparent',
                  color: 'var(--color-text-primary)',
                  padding: 0,
                }}
              />
            ) : (
              <div style={{ color: 'var(--color-text-primary)', fontSize: 15 }}>
                {transaction.note || '无'}
              </div>
            )}
          </div>

          {/* 标签 */}
          <div
            onClick={() => editing && setShowTagSelector(true)}
            style={{
              padding: '16px',
              cursor: editing ? 'pointer' : 'default',
            }}
          >
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 8 }}>标签</div>
            {editing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {selectedTags.length > 0 ? (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {selectedTags.map(tag => (
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
                    ))}
                  </div>
                ) : (
                  <span style={{ color: 'var(--color-text-tertiary)', fontSize: 15 }}>
                    点击添加标签
                  </span>
                )}
                <span style={{ color: 'var(--color-text-tertiary)', fontSize: 16, marginLeft: 'auto' }}>›</span>
              </div>
            ) : (
              <div>
                {transaction.tags && transaction.tags.length > 0 ? (
                  <TagDisplay tags={transaction.tags} />
                ) : (
                  <span style={{ color: 'var(--color-text-tertiary)', fontSize: 15 }}>无</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 删除按钮 */}
        <div
          onClick={handleDelete}
          style={{
            marginTop: 24,
            padding: '16px',
            background: 'var(--color-bg-card)',
            borderRadius: 16,
            textAlign: 'center',
            color: 'var(--color-expense)',
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          删除记录
        </div>
      </div>

      {/* 分类选择器 */}
      <Popup
        visible={showCategoryPicker}
        onMaskClick={() => setShowCategoryPicker(false)}
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
            选择分类
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
          }}>
            {filteredCategories.map(cat => {
              const catConfig = getCategoryIcon(cat.name);
              const isSelected = editCategoryId === cat.id;

              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setEditCategoryId(cat.id);
                    setShowCategoryPicker(false);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '12px 6px',
                    borderRadius: 14,
                    background: isSelected ? colorLight : 'var(--color-bg)',
                    border: isSelected ? `2px solid ${color}` : '2px solid transparent',
                  }}
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: catConfig.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    marginBottom: 6,
                  }}>
                    {catConfig.icon}
                  </div>
                  <span style={{
                    fontSize: 12,
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected ? color : 'var(--color-text-secondary)',
                  }}>
                    {cat.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Popup>

      {/* 账户选择器 */}
      <Popup
        visible={showAccountPicker}
        onMaskClick={() => setShowAccountPicker(false)}
        bodyStyle={{
          height: '45vh',
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
            选择账户
          </div>
          {accounts.map(acc => (
            <div
              key={acc.id}
              onClick={() => {
                setEditAccountId(acc.id);
                setShowAccountPicker(false);
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                borderRadius: 12,
                marginBottom: 8,
                background: editAccountId === acc.id ? colorLight : 'var(--color-bg)',
                border: editAccountId === acc.id ? `2px solid ${color}` : '2px solid transparent',
              }}
            >
              <span style={{
                fontSize: 15,
                fontWeight: 500,
                color: 'var(--color-text-primary)',
              }}>
                {acc.name}
              </span>
              <span style={{
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
              }}>
                ¥{acc.balance.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </Popup>

      {/* 日期选择器 */}
      <Popup
        visible={showDatePicker}
        onMaskClick={() => setShowDatePicker(false)}
        bodyStyle={{
          height: '55vh',
          borderRadius: '20px 20px 0 0',
          background: 'var(--color-bg-card)',
        }}
      >
        <div style={{ padding: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <span
              style={{ color: 'var(--color-text-tertiary)', fontSize: 15, cursor: 'pointer' }}
              onClick={() => setShowDatePicker(false)}
            >
              取消
            </span>
            <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-text-primary)' }}>
              选择日期
            </span>
            <span
              style={{ color, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
              onClick={() => setShowDatePicker(false)}
            >
              确定
            </span>
          </div>
          <DatePickerView
            value={editDate}
            onChange={d => setEditDate(d)}
            max={new Date()}
            style={{ '--height': '300px' } as React.CSSProperties}
          />
        </div>
      </Popup>

      {/* Tag Selector Popup */}
      <TagSelector
        visible={showTagSelector}
        selectedTagIds={editTagIds}
        onClose={() => setShowTagSelector(false)}
        onChange={setEditTagIds}
      />
    </div>
  );
}
