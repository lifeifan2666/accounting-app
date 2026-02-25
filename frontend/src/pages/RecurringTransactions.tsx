import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Popup, Toast, Dialog, Switch } from 'antd-mobile';
import { getRecurringTransactions, createRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction, getCategories, getAccounts } from '../api';
import type { RecurringTransaction, Category, Account } from '../api/types';
import { getCategoryIcon, BackButton } from '../components/Icons';

const frequencyLabels: Record<string, string> = {
  'daily': '每天',
  'weekly': '每周',
  'monthly': '每月',
  'yearly': '每年',
};

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export default function RecurringTransactionsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recurringList, setRecurringList] = useState<RecurringTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showAddPopup, setShowAddPopup] = useState(false);

  // 新建表单状态
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [dayOfMonth, setDayOfMonth] = useState('1');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recurringRes, catRes, accRes] = await Promise.all([
        getRecurringTransactions(),
        getCategories(),
        getAccounts(),
      ]);
      setRecurringList(recurringRes.data);
      setCategories(catRes.data);
      setAccounts(accRes.data);
      if (accRes.data.length > 0) {
        setSelectedAccount(accRes.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => c.type === type);
  const color = type === 'expense' ? 'var(--color-expense)' : 'var(--color-income)';
  const colorLight = type === 'expense' ? 'var(--color-expense-light)' : 'var(--color-income-light)';

  const handleAdd = async () => {
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
      await createRecurringTransaction({
        account_id: selectedAccount,
        category_id: selectedCategory,
        amount: parseFloat(amount),
        type,
        note,
        frequency,
        day_of_month: frequency === 'monthly' || frequency === 'yearly' ? parseInt(dayOfMonth) : undefined,
        day_of_week: frequency === 'weekly' ? 0 : undefined,
        is_active: true,
      });
      Toast.show({ content: '添加成功', icon: 'success' });
      setShowAddPopup(false);
      resetForm();
      fetchData();
    } catch (error) {
      Toast.show({ content: '添加失败', icon: 'fail' });
    }
  };

  const handleToggleActive = async (item: RecurringTransaction) => {
    try {
      await updateRecurringTransaction(item.id, { is_active: !item.is_active });
      fetchData();
    } catch (error) {
      Toast.show({ content: '操作失败', icon: 'fail' });
    }
  };

  const handleDelete = async (item: RecurringTransaction) => {
    const result = await Dialog.confirm({
      content: `确定要删除这个周期交易吗？`,
      confirmText: '删除',
      cancelText: '取消',
    });

    if (result) {
      try {
        await deleteRecurringTransaction(item.id);
        Toast.show({ content: '已删除', icon: 'success' });
        fetchData();
      } catch (error) {
        Toast.show({ content: '删除失败', icon: 'fail' });
      }
    }
  };

  const resetForm = () => {
    setType('expense');
    setSelectedCategory(null);
    setAmount('');
    setNote('');
    setFrequency('monthly');
    setDayOfMonth('1');
  };

  const getFrequencyText = (item: RecurringTransaction) => {
    if (item.frequency === 'monthly' && item.day_of_month) {
      return `每月${item.day_of_month}号`;
    }
    if (item.frequency === 'weekly' && item.day_of_week !== null) {
      return `每${weekDays[item.day_of_week]}`;
    }
    if (item.frequency === 'yearly' && item.day_of_month) {
      return `每年${item.day_of_month}号`;
    }
    return frequencyLabels[item.frequency] || item.frequency;
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
          周期交易
        </span>
        <div
          onClick={() => {
            resetForm();
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

      {/* 说明 */}
      <div style={{
        margin: '16px',
        padding: '14px 16px',
        background: 'var(--color-accent-light)',
        borderRadius: 12,
        fontSize: 13,
        color: 'var(--color-text-secondary)',
        lineHeight: 1.6,
      }}>
        💡 设置周期交易后，系统会在指定日期自动创建交易记录，适合房租、工资等固定收支。
      </div>

      {/* 列表 */}
      <div style={{ padding: '0 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>
            加载中...
          </div>
        ) : recurringList.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 0',
            color: 'var(--color-text-tertiary)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔄</div>
            <div>暂无周期交易</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>点击右上角 + 添加</div>
          </div>
        ) : (
          recurringList.map(item => {
            const config = getCategoryIcon(item.category_name || '');
            const isExpense = item.type === 'expense';
            const itemColor = isExpense ? 'var(--color-expense)' : 'var(--color-income)';

            return (
              <div
                key={item.id}
                style={{
                  background: 'var(--color-bg-card)',
                  borderRadius: 16,
                  marginBottom: 12,
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  opacity: item.is_active ? 1 : 0.6,
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                }}>
                  {/* 图标 */}
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: config.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    marginRight: 12,
                  }}>
                    {config.icon}
                  </div>

                  {/* 信息 */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: 'var(--color-text-primary)',
                      marginBottom: 2,
                    }}>
                      {item.category_name}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: 'var(--color-text-tertiary)',
                    }}>
                      {getFrequencyText(item)} · {item.account_name}
                    </div>
                    {item.note && (
                      <div style={{
                        fontSize: 12,
                        color: 'var(--color-text-tertiary)',
                        marginTop: 2,
                      }}>
                        {item.note}
                      </div>
                    )}
                  </div>

                  {/* 金额 */}
                  <div style={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: itemColor,
                    marginRight: 12,
                  }}>
                    {isExpense ? '-' : '+'}{item.amount.toFixed(0)}
                  </div>

                  {/* 开关 */}
                  <Switch
                    checked={item.is_active}
                    onChange={() => handleToggleActive(item)}
                  />
                </div>

                {/* 删除按钮 */}
                <div
                  onClick={() => handleDelete(item)}
                  style={{
                    padding: '10px 16px',
                    borderTop: '1px solid var(--color-divider)',
                    textAlign: 'center',
                    color: 'var(--color-expense)',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  删除
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 添加弹窗 */}
      <Popup
        visible={showAddPopup}
        onMaskClick={() => setShowAddPopup(false)}
        bodyStyle={{
          height: '85vh',
          borderRadius: '20px 20px 0 0',
          background: 'var(--color-bg-card)',
        }}
      >
        <div style={{ padding: '20px 16px', overflow: 'auto', height: '100%' }}>
          <div style={{
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: 20,
            textAlign: 'center',
          }}>
            添加周期交易
          </div>

          {/* 类型切换 */}
          <div style={{
            display: 'flex',
            gap: 12,
            marginBottom: 16,
          }}>
            <div
              onClick={() => { setType('expense'); setSelectedCategory(null); }}
              style={{
                flex: 1,
                padding: '12px',
                textAlign: 'center',
                borderRadius: 14,
                background: type === 'expense' ? 'var(--color-expense-light)' : 'var(--color-divider)',
                border: type === 'expense' ? '2px solid var(--color-expense)' : '2px solid transparent',
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
              onClick={() => { setType('income'); setSelectedCategory(null); }}
              style={{
                flex: 1,
                padding: '12px',
                textAlign: 'center',
                borderRadius: 14,
                background: type === 'income' ? 'var(--color-income-light)' : 'var(--color-divider)',
                border: type === 'income' ? '2px solid var(--color-income)' : '2px solid transparent',
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

          {/* 金额 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
              金额
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--color-bg)',
              borderRadius: 12,
              padding: '14px 16px',
              border: '1px solid var(--color-border)',
            }}>
              <span style={{ fontSize: 18, color: 'var(--color-text-secondary)', marginRight: 8 }}>¥</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  flex: 1,
                  border: 'none',
                  fontSize: 20,
                  fontWeight: 600,
                  outline: 'none',
                  background: 'transparent',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
          </div>

          {/* 频率 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
              重复频率
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['monthly', 'weekly', 'yearly'].map(f => (
                <div
                  key={f}
                  onClick={() => setFrequency(f)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    textAlign: 'center',
                    borderRadius: 10,
                    background: frequency === f ? colorLight : 'var(--color-bg)',
                    border: frequency === f ? `2px solid ${color}` : '2px solid var(--color-border)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: frequency === f ? 600 : 500,
                    color: frequency === f ? color : 'var(--color-text-secondary)',
                  }}
                >
                  {frequencyLabels[f]}
                </div>
              ))}
            </div>
          </div>

          {/* 日期选择 */}
          {(frequency === 'monthly' || frequency === 'yearly') && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                {frequency === 'monthly' ? '每月几号' : '每年几号'}
              </div>
              <input
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={e => setDayOfMonth(e.target.value)}
                placeholder="1-31"
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
          )}

          {/* 分类 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
              分类
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 10,
            }}>
              {filteredCategories.map(cat => {
                const catConfig = getCategoryIcon(cat.name);
                const isSelected = selectedCategory === cat.id;

                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '10px 4px',
                      borderRadius: 12,
                      background: isSelected ? colorLight : 'var(--color-bg)',
                      border: isSelected ? `2px solid ${color}` : '2px solid transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: catConfig.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      marginBottom: 4,
                    }}>
                      {catConfig.icon}
                    </div>
                    <span style={{
                      fontSize: 11,
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

          {/* 账户 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
              账户
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {accounts.map(acc => (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccount(acc.id)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 10,
                    background: selectedAccount === acc.id ? colorLight : 'var(--color-bg)',
                    border: selectedAccount === acc.id ? `2px solid ${color}` : '2px solid var(--color-border)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: selectedAccount === acc.id ? 600 : 500,
                    color: selectedAccount === acc.id ? color : 'var(--color-text-secondary)',
                  }}
                >
                  {acc.name}
                </div>
              ))}
            </div>
          </div>

          {/* 备注 */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
              备注
            </div>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="添加备注..."
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

          {/* 提交按钮 */}
          <div
            onClick={handleAdd}
            style={{
              background: `linear-gradient(135deg, ${color} 0%, ${type === 'expense' ? 'var(--color-expense-dark)' : 'var(--color-income-dark)'} 100%)`,
              color: 'white',
              textAlign: 'center',
              padding: '16px',
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            添加周期交易
          </div>
        </div>
      </Popup>
    </div>
  );
}
