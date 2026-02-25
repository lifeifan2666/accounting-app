import { Switch } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const isDark = theme === 'dark';

  return (
    <div className="page-container" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div style={{
        background: isDark ? 'var(--color-bg-card)' : 'linear-gradient(145deg, #FFFFFF 0%, #FAF8F5 100%)',
        padding: '40px 24px 32px',
        borderRadius: '0 0 32px 32px',
        boxShadow: 'var(--shadow-md)',
        marginBottom: 16,
        textAlign: 'center',
      }}>
        {/* App Icon */}
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: 'linear-gradient(145deg, var(--color-expense) 0%, var(--color-expense-dark) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(232, 132, 107, 0.35)',
        }}>
          <span style={{ fontSize: 36 }}>📒</span>
        </div>

        <div style={{
          fontSize: 24,
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: 6,
        }}>
          记账本
        </div>
        <div style={{
          fontSize: 13,
          color: 'var(--color-text-tertiary)',
        }}>
          {user ? `欢迎，${user.username}` : 'Version 1.0.0'}
        </div>
      </div>

      {/* Settings Sections */}
      <div style={{ padding: '0 12px' }}>
        {/* Appearance Settings */}
        <div style={{
          background: 'var(--color-bg-card)',
          borderRadius: 18,
          marginBottom: 12,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            padding: '14px 16px 10px',
            fontSize: 12,
            color: 'var(--color-text-tertiary)',
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}>
            外观
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>{isDark ? '🌙' : '☀️'}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  深色模式
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                  {isDark ? '当前：深色' : '当前：浅色'}
                </div>
              </div>
            </div>
            <Switch checked={isDark} onChange={toggleTheme} />
          </div>
        </div>

        {/* General Settings */}
        <div style={{
          background: 'var(--color-bg-card)',
          borderRadius: 18,
          marginBottom: 12,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            padding: '14px 16px 10px',
            fontSize: 12,
            color: 'var(--color-text-tertiary)',
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}>
            通用设置
          </div>
          <div
            onClick={() => navigate('/budget')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              cursor: 'pointer',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                预算管理
              </div>
            </div>
            <span style={{ color: 'var(--color-text-tertiary)', fontSize: 16 }}>›</span>
          </div>
          <div
            onClick={() => navigate('/transfer')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              cursor: 'pointer',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                账户转账
              </div>
            </div>
            <span style={{ color: 'var(--color-text-tertiary)', fontSize: 16 }}>›</span>
          </div>
          <div
            onClick={() => navigate('/categories')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              cursor: 'pointer',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                分类管理
              </div>
            </div>
            <span style={{ color: 'var(--color-text-tertiary)', fontSize: 16 }}>›</span>
          </div>
          <div
            onClick={() => navigate('/reminders')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              cursor: 'pointer',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                账单提醒
              </div>
            </div>
            <span style={{ color: 'var(--color-text-tertiary)', fontSize: 16 }}>›</span>
          </div>
          <div
            onClick={() => navigate('/recurring')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              cursor: 'pointer',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                周期交易
              </div>
            </div>
            <span style={{ color: 'var(--color-text-tertiary)', fontSize: 16 }}>›</span>
          </div>
        </div>

        {/* Data Management */}
        <div style={{
          background: 'var(--color-bg-card)',
          borderRadius: 18,
          marginBottom: 12,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            padding: '14px 16px 10px',
            fontSize: 12,
            color: 'var(--color-text-tertiary)',
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}>
            数据管理
          </div>
          {['导出数据', '导入数据', '清除数据'].map((item, index) => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderBottom: index < 2 ? '1px solid var(--color-divider)' : 'none',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {item}
              </span>
              <span style={{ color: 'var(--color-text-tertiary)', fontSize: 16 }}>›</span>
            </div>
          ))}
        </div>

        {/* About */}
        <div style={{
          background: 'var(--color-bg-card)',
          borderRadius: 18,
          marginBottom: 12,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            padding: '14px 16px 10px',
            fontSize: 12,
            color: 'var(--color-text-tertiary)',
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}>
            关于
          </div>
          {['用户协议', '隐私政策', '意见反馈', '给个好评'].map((item, index) => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderBottom: index < 3 ? '1px solid var(--color-divider)' : 'none',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {item}
              </span>
              <span style={{ color: 'var(--color-text-tertiary)', fontSize: 16 }}>›</span>
            </div>
          ))}
        </div>

        {/* Logout */}
        <div
          onClick={logout}
          style={{
            background: 'var(--color-bg-card)',
            borderRadius: 18,
            marginBottom: 12,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            textAlign: 'center',
            padding: '16px',
            cursor: 'pointer',
          }}
        >
          <span style={{
            fontSize: 15,
            fontWeight: 500,
            color: 'var(--color-expense)',
          }}>
            退出登录
          </span>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '32px 20px',
          color: 'var(--color-text-tertiary)',
        }}>
          <div style={{ fontSize: 12, marginBottom: 4 }}>
            Made with ❤️ for you
          </div>
        </div>
      </div>
    </div>
  );
}
