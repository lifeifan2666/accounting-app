import { useEffect, useState } from 'react';
import { Dialog, Toast, Input, Button, Popup } from 'antd-mobile';
import { getAccounts, createAccount, deleteAccount } from '../api';
import type { Account } from '../api/types';
import { useTheme } from '../contexts/ThemeContext';

const accountTypeConfig: Record<string, { icon: string; bg: string; name: string }> = {
  cash: { icon: '💵', bg: '#E8F5E9', name: '现金' },
  bank: { icon: '🏦', bg: '#E3F2FD', name: '银行卡' },
  alipay: { icon: '📱', bg: '#E0F7FA', name: '支付宝' },
  wechat: { icon: '💬', bg: '#E8F5E9', name: '微信' },
  other: { icon: '💳', bg: '#F5F5F5', name: '其他' },
};

export default function Accounts() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('cash');
  const [newBalance, setNewBalance] = useState('0');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await getAccounts();
      setAccounts(res.data);
    } catch {
      // ignore
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      Toast.show({ content: '请输入账户名称', icon: 'fail' });
      return;
    }
    try {
      await createAccount({
        name: newName,
        type: newType,
        balance: parseFloat(newBalance) || 0,
      });
      Toast.show({ content: '添加成功 ✓', icon: 'success' });
      setShowAdd(false);
      setNewName('');
      setNewType('cash');
      setNewBalance('0');
      fetchAccounts();
    } catch {
      Toast.show({ content: '添加失败', icon: 'fail' });
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Dialog.confirm({
      content: '确定删除此账户？',
      confirmText: '删除',
      cancelText: '取消',
    });
    if (result) {
      try {
        await deleteAccount(id);
        Toast.show({ content: '删除成功', icon: 'success' });
        fetchAccounts();
      } catch {
        Toast.show({ content: '删除失败', icon: 'fail' });
      }
    }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="page-container" style={{ background: 'var(--color-bg)' }}>
      {/* Header Stats */}
      <div style={{
        background: isDark ? 'var(--color-bg-card)' : 'linear-gradient(145deg, #FFFFFF 0%, #FAF8F5 100%)',
        padding: '32px 24px',
        borderRadius: '0 0 32px 32px',
        boxShadow: 'var(--shadow-md)',
        marginBottom: 16,
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 13,
          color: 'var(--color-text-secondary)',
          fontWeight: 500,
          marginBottom: 8,
          letterSpacing: '0.5px',
        }}>
          总资产
        </div>
        <div style={{
          fontSize: 44,
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          letterSpacing: '-2px',
          marginBottom: 8,
        }}>
          <span style={{ fontSize: 24, fontWeight: 600 }}>¥</span>
          {totalBalance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
        </div>
        <div style={{
          fontSize: 13,
          color: 'var(--color-text-tertiary)',
        }}>
          共 {accounts.length} 个账户
        </div>
      </div>

      {/* Account List */}
      <div style={{ padding: '0 12px' }}>
        <div style={{
          fontSize: 13,
          color: 'var(--color-text-secondary)',
          fontWeight: 600,
          marginBottom: 12,
          paddingLeft: 8,
        }}>
          账户列表
        </div>

        {accounts.map((acc, index) => {
          const config = accountTypeConfig[acc.type] || accountTypeConfig.other;
          return (
            <div
              key={acc.id}
              className="fade-in"
              style={{
                animationDelay: `${index * 0.05}s`,
                display: 'flex',
                alignItems: 'center',
                padding: '18px 16px',
                background: 'var(--color-bg-card)',
                borderRadius: 18,
                marginBottom: 10,
                boxShadow: 'var(--shadow-sm)',
              }}
              onClick={() => handleDelete(acc.id)}
            >
              {/* Icon */}
              <div style={{
                width: 50,
                height: 50,
                borderRadius: 16,
                background: config.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                marginRight: 16,
                flexShrink: 0,
              }}>
                {config.icon}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: 4,
                }}>
                  {acc.name}
                </div>
                <div style={{
                  fontSize: 12,
                  color: 'var(--color-text-tertiary)',
                }}>
                  {config.name}
                </div>
              </div>

              {/* Balance */}
              <div style={{
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--color-text-primary)',
              }}>
                ¥{acc.balance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          );
        })}

        {/* Add Account Button */}
        <div
          onClick={() => setShowAdd(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'var(--color-bg-card)',
            borderRadius: 18,
            border: '2px dashed var(--color-border)',
            marginTop: accounts.length > 0 ? 0 : 0,
          }}
        >
          <span style={{
            fontSize: 15,
            color: 'var(--color-expense)',
            fontWeight: 500,
          }}>
            + 添加账户
          </span>
        </div>
      </div>

      {/* Add Account Popup */}
      <Popup
        visible={showAdd}
        onMaskClick={() => setShowAdd(false)}
        bodyStyle={{
          height: '55vh',
          borderRadius: '24px 24px 0 0',
          background: 'var(--color-bg-card)',
        }}
      >
        <div style={{ padding: '24px 20px' }}>
          <div style={{
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: 28,
            textAlign: 'center',
          }}>
            添加账户
          </div>

          {/* Account Name */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 13,
              color: 'var(--color-text-secondary)',
              fontWeight: 500,
              marginBottom: 10,
            }}>
              账户名称
            </div>
            <Input
              placeholder="如：现金、招商银行"
              value={newName}
              onChange={setNewName}
              style={{
                '--font-size': '16px',
                '--placeholder-color': 'var(--color-text-tertiary)',
                '--color': 'var(--color-text-primary)',
                '--text-align': 'left',
              } as React.CSSProperties}
            />
          </div>

          {/* Account Type */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 13,
              color: 'var(--color-text-secondary)',
              fontWeight: 500,
              marginBottom: 10,
            }}>
              账户类型
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {Object.entries(accountTypeConfig).map(([key, config]) => (
                <div
                  key={key}
                  onClick={() => setNewType(key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 16px',
                    borderRadius: 14,
                    background: newType === key ? config.bg : 'var(--color-bg)',
                    border: newType === key ? '2px solid var(--color-expense)' : '2px solid var(--color-border)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{config.icon}</span>
                  <span style={{
                    fontSize: 14,
                    fontWeight: newType === key ? 600 : 500,
                    color: newType === key ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  }}>
                    {config.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Initial Balance */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontSize: 13,
              color: 'var(--color-text-secondary)',
              fontWeight: 500,
              marginBottom: 10,
            }}>
              初始余额
            </div>
            <Input
              type="number"
              placeholder="0.00"
              value={newBalance}
              onChange={setNewBalance}
              style={{
                '--font-size': '16px',
                '--placeholder-color': 'var(--color-text-tertiary)',
                '--color': 'var(--color-text-primary)',
                '--text-align': 'left',
              } as React.CSSProperties}
            />
          </div>

          {/* Submit Button */}
          <Button
            block
            size="large"
            onClick={handleAdd}
            style={{
              '--background-color': 'var(--color-expense)',
              '--border-radius': '16px',
              '--text-color': '#FFFFFF',
              fontWeight: 600,
            } as React.CSSProperties}
          >
            添加
          </Button>
        </div>
      </Popup>
    </div>
  );
}
