import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Popup, Toast, Dialog, Switch } from 'antd-mobile';
import dayjs from 'dayjs';
import { getReminders, createReminder, updateReminder, deleteReminder, getCategories, getAccounts } from '../api';
import type { Reminder, Category } from '../api/types';
import { getCategoryIcon, BackButton } from '../components/Icons';

export default function Reminders() {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPopup, setShowAddPopup] = useState(false);

  // 新建表单状态
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [reminderDate, setReminderDate] = useState('');
  const [repeatType, setRepeatType] = useState<'none' | 'monthly' | 'yearly'>('none');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [remindersRes, catRes, accRes] = await Promise.all([
        getReminders(),
        getCategories(),
        getAccounts(),
      ]);
      setReminders(remindersRes.data);
      setCategories(catRes.data);
      if (accRes.data.length > 0) {
        setSelectedAccount(accRes.data[0].id);
      }
      // 默认提醒日期为明天
      setReminderDate(dayjs().add(1, 'day').format('YYYY-MM-DD'));
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
    if (!name.trim()) {
      Toast.show({ content: '请输入账单名称', icon: 'fail' });
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Toast.show({ content: '请输入金额', icon: 'fail' });
      return;
    }
    if (!reminderDate) {
      Toast.show({ content: '请选择提醒日期', icon: 'fail' });
      return;
    }

    try {
      await createReminder({
        name: name.trim(),
        amount: parseFloat(amount),
        type,
        category_id: selectedCategory,
        account_id: selectedAccount,
        reminder_date: reminderDate,
        repeat_type: repeatType,
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

  const handleToggleActive = async (reminder: Reminder) => {
    try {
      await updateReminder(reminder.id, { is_active: !reminder.is_active });
      fetchData();
    } catch (error) {
      Toast.show({ content: '操作失败', icon: 'fail' });
    }
  };

  const handleDelete = async (reminder: Reminder) => {
    const result = await Dialog.confirm({
      content: `确定要删除"${reminder.name}"吗？`,
      confirmText: '删除',
      cancelText: '取消',
    });

    if (result) {
      try {
        await deleteReminder(reminder.id);
        Toast.show({ content: '已删除', icon: 'success' });
        fetchData();
      } catch (error) {
        Toast.show({ content: '删除失败', icon: 'fail' });
      }
    }
  };

  const resetForm = () => {
    setName('');
    setAmount('');
    setType('expense');
    setSelectedCategory(null);
    setRepeatType('none');
  };

  // 计算距离提醒的天数
  const getDaysUntil = (dateStr: string) => {
    const target = dayjs(dateStr);
    const today = dayjs().startOf('day');
    return target.diff(today, 'day');
  };

  // 获取提醒状态
  const getReminderStatus = (reminder: Reminder) => {
    const days = getDaysUntil(reminder.reminder_date);
    if (days < 0) {
      return { text: '已过期', color: 'var(--color-text-tertiary)' };
    } else if (days === 0) {
      return { text: '今天', color: 'var(--color-expense)' };
    } else if (days === 1) {
      return { text: '明天', color: 'var(--color-expense)' };
    } else if (days <= 3) {
      return { text: `${days}天后`, color: '#FF9800' };
    } else if (days <= 7) {
      return { text: `${days}天后`, color: 'var(--color-income)' };
    } else {
      return { text: `${days}天后`, color: 'var(--color-text-secondary)' };
    }
  };

  // 排序提醒：按日期升序
  const sortedReminders = [...reminders].sort((a, b) =>
    dayjs(a.reminder_date).unix() - dayjs(b.reminder_date).unix()
  );

  const repeatLabels: Record<string, string> = {
    'none': '不重复',
    'monthly': '每月',
    'yearly': '每年',
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
          账单提醒
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
        🔔 设置账单提醒后，到期当天会在首页显示提醒通知。
      </div>

      {/* 列表 */}
      <div style={{ padding: '0 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>
            加载中...
          </div>
        ) : sortedReminders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 0',
            color: 'var(--color-text-tertiary)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
            <div>暂无账单提醒</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>点击右上角 + 添加</div>
          </div>
        ) : (
          sortedReminders.map(reminder => {
            const config = getCategoryIcon(reminder.category_name || '其他支出');
            const status = getReminderStatus(reminder);
            const isExpense = reminder.type === 'expense';
            const itemColor = isExpense ? 'var(--color-expense)' : 'var(--color-income)';

            return (
              <div
                key={reminder.id}
                style={{
                  background: 'var(--color-bg-card)',
                  borderRadius: 16,
                  marginBottom: 12,
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  opacity: reminder.is_active ? 1 : 0.6,
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
                    color: 'var(--color-text-primary)',
                  }}>
                    {config.icon}
                  </div>

                  {/* 信息 */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      marginBottom: 4,
                    }}>
                      {reminder.name}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: 'var(--color-text-tertiary)',
                    }}>
                      {dayjs(reminder.reminder_date).format('M月D日')}
                      {reminder.repeat_type !== 'none' && ` · ${repeatLabels[reminder.repeat_type]}`}
                    </div>
                  </div>

                  {/* 金额 */}
                  <div style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: itemColor,
                    marginRight: 12,
                  }}>
                    ¥{reminder.amount.toFixed(0)}
                  </div>

                  {/* 开关 */}
                  <Switch
                    checked={reminder.is_active}
                    onChange={() => handleToggleActive(reminder)}
                  />
                </div>

                {/* 状态栏 */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 16px',
                  background: 'var(--color-bg)',
                }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: status.color,
                  }}>
                    {status.text}
                  </span>
                  <span
                    onClick={() => handleDelete(reminder)}
                    style={{
                      fontSize: 12,
                      color: 'var(--color-expense)',
                      cursor: 'pointer',
                    }}
                  >
                    删除
                  </span>
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
          height: '80vh',
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
            添加账单提醒
          </div>

          {/* 名称 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
              账单名称
            </div>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="如：房租、信用卡还款"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 12,
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
                fontSize: 15,
                outline: 'none',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* 类型切换 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
              类型
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div
                onClick={() => { setType('expense'); setSelectedCategory(null); }}
                style={{
                  flex: 1,
                  padding: '12px',
                  textAlign: 'center',
                  borderRadius: 14,
                  background: type === 'expense' ? colorLight : 'var(--color-bg)',
                  border: type === 'expense' ? `2px solid ${color}` : '2px solid var(--color-border)',
                  cursor: 'pointer',
                }}
              >
                <span style={{
                  fontSize: 14,
                  fontWeight: type === 'expense' ? 600 : 500,
                  color: type === 'expense' ? color : 'var(--color-text-secondary)',
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
                  background: type === 'income' ? colorLight : 'var(--color-bg)',
                  border: type === 'income' ? `2px solid ${color}` : '2px solid var(--color-border)',
                  cursor: 'pointer',
                }}
              >
                <span style={{
                  fontSize: 14,
                  fontWeight: type === 'income' ? 600 : 500,
                  color: type === 'income' ? color : 'var(--color-text-secondary)',
                }}>
                  收入
                </span>
              </div>
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
                  fontSize: 18,
                  fontWeight: 600,
                  outline: 'none',
                  background: 'transparent',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
          </div>

          {/* 提醒日期 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
              提醒日期
            </div>
            <input
              type="date"
              value={reminderDate}
              onChange={e => setReminderDate(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 12,
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
                fontSize: 15,
                outline: 'none',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* 重复 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
              重复
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['none', 'monthly', 'yearly'] as const).map(r => (
                <div
                  key={r}
                  onClick={() => setRepeatType(r)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    textAlign: 'center',
                    borderRadius: 10,
                    background: repeatType === r ? colorLight : 'var(--color-bg)',
                    border: repeatType === r ? `2px solid ${color}` : '2px solid var(--color-border)',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: repeatType === r ? 600 : 500,
                    color: repeatType === r ? color : 'var(--color-text-secondary)',
                  }}
                >
                  {repeatLabels[r]}
                </div>
              ))}
            </div>
          </div>

          {/* 分类 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
              分类（可选）
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 10,
            }}>
              {filteredCategories.slice(0, 8).map(cat => {
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
                      color: 'var(--color-text-primary)',
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
            添加提醒
          </div>
        </div>
      </Popup>
    </div>
  );
}
