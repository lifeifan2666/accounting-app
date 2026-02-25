import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast, Popup } from 'antd-mobile';
import { getAccounts, createTransaction } from '../api';
import type { Account } from '../api/types';
import { BackButton } from '../components/Icons';

export default function Transfer() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [fromAccount, setFromAccount] = useState<number | null>(null);
  const [toAccount, setToAccount] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await getAccounts();
      setAccounts(res.data);
      if (res.data.length >= 1) {
        setFromAccount(res.data[0].id);
      }
      if (res.data.length >= 2) {
        setToAccount(res.data[1].id);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  const fromAccountObj = accounts.find(a => a.id === fromAccount);
  const toAccountObj = accounts.find(a => a.id === toAccount);

  const handleTransfer = async () => {
    if (!fromAccount || !toAccount) {
      Toast.show({ content: '请选择转出和转入账户', icon: 'fail' });
      return;
    }
    if (fromAccount === toAccount) {
      Toast.show({ content: '转出和转入账户不能相同', icon: 'fail' });
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Toast.show({ content: '请输入有效金额', icon: 'fail' });
      return;
    }

    try {
      const transferNote = note || `${fromAccountObj?.name} → ${toAccountObj?.name}`;

      // 创建转出记录
      await createTransaction({
        account_id: fromAccount,
        category_id: 12, // 其他支出
        amount: parseFloat(amount),
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        note: `转账至${toAccountObj?.name}: ${transferNote}`,
      });

      // 创建转入记录
      await createTransaction({
        account_id: toAccount,
        category_id: 4, // 其他收入
        amount: parseFloat(amount),
        type: 'income',
        date: new Date().toISOString().split('T')[0],
        note: `来自${fromAccountObj?.name}: ${transferNote}`,
      });

      Toast.show({ content: '转账成功', icon: 'success' });
      navigate(-1);
    } catch (error) {
      Toast.show({ content: '转账失败', icon: 'fail' });
    }
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
          账户转账
        </span>
        <div style={{ width: 32 }} />
      </div>

      {/* 转账卡片 */}
      <div style={{ padding: '16px' }}>
        <div style={{
          background: 'var(--color-bg-card)',
          borderRadius: 16,
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* 转出账户 */}
          <div
            onClick={() => setShowFromPicker(true)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              background: 'var(--color-expense-light)',
              borderRadius: 12,
              marginBottom: 16,
              cursor: 'pointer',
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                转出账户
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {fromAccountObj?.name || '选择账户'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>余额</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-expense)' }}>
                ¥{fromAccountObj?.balance.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>

          {/* 转换箭头 */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              background: 'var(--color-divider)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              color: 'var(--color-text-secondary)',
            }}>
              ↓
            </div>
          </div>

          {/* 转入账户 */}
          <div
            onClick={() => setShowToPicker(true)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              background: 'var(--color-income-light)',
              borderRadius: 12,
              marginBottom: 16,
              cursor: 'pointer',
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                转入账户
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {toAccountObj?.name || '选择账户'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>余额</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-income)' }}>
                ¥{toAccountObj?.balance.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>

          {/* 金额输入 */}
          <div style={{
            background: 'var(--color-bg)',
            borderRadius: 12,
            padding: '16px',
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
              转账金额
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
            }}>
              <span style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-text-primary)', marginRight: 4 }}>¥</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  flex: 1,
                  border: 'none',
                  fontSize: 32,
                  fontWeight: 700,
                  outline: 'none',
                  background: 'transparent',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
          </div>

          {/* 备注 */}
          <div style={{
            background: 'var(--color-bg)',
            borderRadius: 12,
            padding: '16px',
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
              备注
            </div>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="添加备注..."
              style={{
                width: '100%',
                border: 'none',
                fontSize: 15,
                outline: 'none',
                background: 'transparent',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* 确认按钮 */}
          <div
            onClick={handleTransfer}
            style={{
              background: 'linear-gradient(135deg, var(--color-accent) 0%, #6B4FE8 100%)',
              color: 'white',
              textAlign: 'center',
              padding: '16px',
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(123, 97, 255, 0.35)',
            }}
          >
            确认转账
          </div>
        </div>
      </div>

      {/* 转出账户选择 */}
      <Popup
        visible={showFromPicker}
        onMaskClick={() => setShowFromPicker(false)}
        bodyStyle={{
          height: '50vh',
          borderRadius: '20px 20px 0 0',
          background: 'var(--color-bg-card)',
        }}
      >
        <div style={{ padding: '20px 16px' }}>
          <div style={{
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: 16,
            textAlign: 'center',
          }}>
            选择转出账户
          </div>
          {accounts.map(acc => (
            <div
              key={acc.id}
              onClick={() => {
                setFromAccount(acc.id);
                setShowFromPicker(false);
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                borderRadius: 12,
                marginBottom: 8,
                background: fromAccount === acc.id ? 'var(--color-expense-light)' : 'var(--color-bg)',
                border: fromAccount === acc.id ? '2px solid var(--color-expense)' : '2px solid transparent',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {acc.name}
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                ¥{acc.balance.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </Popup>

      {/* 转入账户选择 */}
      <Popup
        visible={showToPicker}
        onMaskClick={() => setShowToPicker(false)}
        bodyStyle={{
          height: '50vh',
          borderRadius: '20px 20px 0 0',
          background: 'var(--color-bg-card)',
        }}
      >
        <div style={{ padding: '20px 16px' }}>
          <div style={{
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: 16,
            textAlign: 'center',
          }}>
            选择转入账户
          </div>
          {accounts.filter(a => a.id !== fromAccount).map(acc => (
            <div
              key={acc.id}
              onClick={() => {
                setToAccount(acc.id);
                setShowToPicker(false);
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                borderRadius: 12,
                marginBottom: 8,
                background: toAccount === acc.id ? 'var(--color-income-light)' : 'var(--color-bg)',
                border: toAccount === acc.id ? '2px solid var(--color-income)' : '2px solid transparent',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {acc.name}
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                ¥{acc.balance.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </Popup>
    </div>
  );
}
