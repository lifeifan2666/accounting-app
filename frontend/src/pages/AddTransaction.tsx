import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Grid, NumberKeyboard, Popup, DatePickerView, Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { getCategories, getAccounts, createTransaction, getTags } from '../api';
import type { Category, Account, Tag } from '../api/types';
import { getCategoryIcon, BackButton } from '../components/Icons';
import TagSelector from '../components/TagSelector';

export default function AddTransaction() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Handle URL params for pre-selection
    const categoryId = searchParams.get('category_id');
    const typeParam = searchParams.get('type');
    if (typeParam === 'income' || typeParam === 'expense') {
      setType(typeParam);
    }
    if (categoryId) {
      setSelectedCategory(parseInt(categoryId, 10));
    }
  }, [searchParams]);

  useEffect(() => {
    // Only reset category if not coming from quick entry
    if (!searchParams.get('category_id')) {
      setSelectedCategory(null);
    }
  }, [type]);

  const fetchData = async () => {
    try {
      const [catRes, accRes, tagRes] = await Promise.all([
        getCategories(),
        getAccounts(),
        getTags(),
      ]);
      setCategories(catRes.data);
      setAccounts(accRes.data);
      setAllTags(tagRes.data);
      if (accRes.data.length > 0) {
        setSelectedAccount(accRes.data[0].id);
      }
    } catch {
      Toast.show({ content: '加载数据失败', icon: 'fail' });
    }
  };

  const filteredCategories = categories.filter(c => c.type === type);

  const handleInput = (key: string) => {
    if (key === 'backspace') {
      setAmount(amount.slice(0, -1));
    } else if (key === 'close') {
      setShowKeyboard(false);
    } else if (key === 'confirm') {
      handleSubmit();
    } else {
      if (key === '.' && amount.includes('.')) return;
      if (amount.includes('.') && amount.split('.')[1]?.length >= 2) return;
      setAmount(amount + key);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategory) {
      Toast.show({ content: '请选择分类', icon: 'fail' });
      return;
    }
    if (!selectedAccount) {
      Toast.show({ content: '请选择账户', icon: 'fail' });
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Toast.show({ content: '请输入金额', icon: 'fail' });
      return;
    }

    try {
      await createTransaction({
        account_id: selectedAccount,
        category_id: selectedCategory,
        amount: parseFloat(amount),
        type,
        date: dayjs(date).format('YYYY-MM-DD'),
        note,
        tag_ids: selectedTagIds,
      });
      Toast.show({ content: '记账成功 ✓', icon: 'success' });
      navigate('/');
    } catch {
      Toast.show({ content: '记账失败', icon: 'fail' });
    }
  };

  const selectedAccountObj = accounts.find(a => a.id === selectedAccount);
  const selectedTags = allTags.filter(t => selectedTagIds.includes(t.id));
  const color = type === 'expense' ? 'var(--color-expense)' : 'var(--color-income)';
  const colorLight = type === 'expense' ? 'var(--color-expense-light)' : 'var(--color-income-light)';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        background: 'var(--color-bg-card)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <BackButton onClick={() => navigate(-1)} />
        <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          记一笔
        </span>
        <div style={{ width: 32 }} />
      </div>

      {/* Type Switcher */}
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

      {/* Amount Display */}
      <div
        onClick={() => setShowKeyboard(true)}
        style={{
          padding: '24px 20px',
          background: colorLight,
          textAlign: 'center',
          cursor: 'pointer',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'center',
        }}>
          <span style={{
            fontSize: 28,
            fontWeight: 600,
            color,
            marginRight: 2,
          }}>¥</span>
          <span style={{
            fontSize: 52,
            fontWeight: 700,
            color,
            letterSpacing: '-2px',
          }}>
            {amount || '0.00'}
          </span>
        </div>
      </div>

      {/* Category Grid */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px 12px',
        background: 'var(--color-bg)',
      }}>
        <div style={{
          fontSize: 13,
          color: 'var(--color-text-secondary)',
          fontWeight: 500,
          marginBottom: 12,
          paddingLeft: 8,
        }}>
          选择分类
        </div>
        <Grid columns={4} gap={10}>
          {filteredCategories.map(cat => {
            const config = getCategoryIcon(cat.name);
            const isSelected = selectedCategory === cat.id;

            return (
              <Grid.Item key={cat.id}>
                <div
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '12px 6px',
                    borderRadius: 14,
                    background: isSelected ? colorLight : 'var(--color-bg-card)',
                    border: isSelected ? `2px solid ${color}` : '2px solid var(--color-border)',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: config.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    marginBottom: 6,
                    color: 'var(--color-text-primary)',
                  }}>
                    {config.icon}
                  </div>
                  <span style={{
                    fontSize: 12,
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected ? color : 'var(--color-text-secondary)',
                  }}>
                    {cat.name}
                  </span>
                </div>
              </Grid.Item>
            );
          })}
        </Grid>

        {/* Account & Date */}
        <div style={{
          marginTop: 20,
          marginLeft: 8,
          marginRight: 8,
          background: 'var(--color-bg-card)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Account */}
          <div
            onClick={() => setShowAccountPicker(true)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              borderBottom: '1px solid var(--color-divider)',
            }}
          >
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>账户</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                {selectedAccountObj?.name || '选择账户'}
              </span>
              <span style={{ color: 'var(--color-text-tertiary)', fontSize: 16 }}>›</span>
            </div>
          </div>

          {/* Date */}
          <div
            onClick={() => setShowDatePicker(true)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              borderBottom: '1px solid var(--color-divider)',
            }}
          >
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>日期</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                {dayjs(date).format('YYYY-MM-DD')}
              </span>
              <span style={{ color: 'var(--color-text-tertiary)', fontSize: 16 }}>›</span>
            </div>
          </div>

          {/* Tags */}
          <div
            onClick={() => setShowTagSelector(true)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              borderBottom: '1px solid var(--color-divider)',
            }}
          >
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>标签</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {selectedTags.length > 0 ? (
                <div style={{ display: 'flex', gap: 4 }}>
                  {selectedTags.slice(0, 2).map(tag => (
                    <span
                      key={tag.id}
                      style={{
                        padding: '2px 8px',
                        borderRadius: 10,
                        background: tag.color,
                        color: '#fff',
                        fontSize: 11,
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                  {selectedTags.length > 2 && (
                    <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                      +{selectedTags.length - 2}
                    </span>
                  )}
                </div>
              ) : (
                <span style={{ color: 'var(--color-text-tertiary)', fontSize: 14 }}>
                  添加标签
                </span>
              )}
              <span style={{ color: 'var(--color-text-tertiary)', fontSize: 16 }}>›</span>
            </div>
          </div>

          {/* Note */}
          <div style={{ padding: '16px' }}>
            <input
              placeholder="添加备注..."
              value={note}
              onChange={e => setNote(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                fontSize: 14,
                outline: 'none',
                background: 'transparent',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Number Keyboard */}
      <div style={{
        background: 'var(--color-bg-card)',
        borderTop: '1px solid var(--color-border)',
        padding: '8px 4px 12px',
      }}>
        <NumberKeyboard
          visible={showKeyboard}
          onClose={() => setShowKeyboard(false)}
          onInput={handleInput}
          onDelete={() => setAmount(amount.slice(0, -1))}
          onConfirm={handleSubmit}
          confirmText="保存"
          style={{
            '--confirm-text-color': color,
          } as React.CSSProperties}
        />
      </div>

      {/* Account Picker Popup */}
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
                setSelectedAccount(acc.id);
                setShowAccountPicker(false);
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                borderRadius: 12,
                marginBottom: 8,
                background: selectedAccount === acc.id ? colorLight : 'var(--color-bg)',
                border: selectedAccount === acc.id ? `2px solid ${color}` : '2px solid transparent',
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

      {/* Date Picker Popup */}
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
              style={{ color: 'var(--color-text-tertiary)', fontSize: 15 }}
              onClick={() => setShowDatePicker(false)}
            >
              取消
            </span>
            <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-text-primary)' }}>
              选择日期
            </span>
            <span
              style={{ color, fontSize: 15, fontWeight: 500 }}
              onClick={() => setShowDatePicker(false)}
            >
              确定
            </span>
          </div>
          <DatePickerView
            value={date}
            onChange={d => setDate(d)}
            max={new Date()}
            style={{ '--height': '300px' } as React.CSSProperties}
          />
        </div>
      </Popup>

      {/* Tag Selector Popup */}
      <TagSelector
        visible={showTagSelector}
        selectedTagIds={selectedTagIds}
        onClose={() => setShowTagSelector(false)}
        onChange={setSelectedTagIds}
      />
    </div>
  );
}
