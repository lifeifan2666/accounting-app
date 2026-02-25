import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'antd-mobile';
import { login } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim()) {
      Toast.show({ content: '请输入用户名', icon: 'fail' });
      return;
    }
    if (!password) {
      Toast.show({ content: '请输入密码', icon: 'fail' });
      return;
    }

    setLoading(true);
    try {
      await setAuth({ username: username.trim(), password });
      Toast.show({ content: '登录成功', icon: 'success' });
      navigate('/');
    } catch (error: any) {
      Toast.show({
        content: error.response?.data?.detail || '登录失败',
        icon: 'fail'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      {/* Logo */}
      <div style={{
        width: 80,
        height: 80,
        borderRadius: 20,
        background: 'linear-gradient(135deg, var(--color-expense) 0%, #FF8A65 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        boxShadow: '0 4px 16px rgba(234, 84, 85, 0.3)',
      }}>
        <span style={{ fontSize: 40 }}>💰</span>
      </div>

      <h1 style={{
        fontSize: 28,
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        marginBottom: 8,
      }}>
        记账本
      </h1>

      <p style={{
        fontSize: 14,
        color: 'var(--color-text-secondary)',
        marginBottom: 40,
      }}>
        登录您的账户
      </p>

      {/* Form */}
      <div style={{
        width: '100%',
        maxWidth: 320,
      }}>
        <div style={{
          background: 'var(--color-bg-card)',
          borderRadius: 16,
          padding: 24,
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Username */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              color: 'var(--color-text-secondary)',
              marginBottom: 8,
            }}>
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="请输入用户名"
              style={{
                width: '100%',
                padding: '14px 16px',
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

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              color: 'var(--color-text-secondary)',
              marginBottom: 8,
            }}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="请输入密码"
              style={{
                width: '100%',
                padding: '14px 16px',
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

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 12,
              border: 'none',
              background: loading
                ? 'var(--color-divider)'
                : 'linear-gradient(135deg, var(--color-expense) 0%, #FF8A65 100%)',
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? 'default' : 'pointer',
              marginBottom: 16,
            }}
          >
            {loading ? '登录中...' : '登录'}
          </button>

          {/* Register Link */}
          <div style={{
            textAlign: 'center',
            fontSize: 14,
            color: 'var(--color-text-secondary)',
          }}>
            还没有账户？
            <span
              onClick={() => navigate('/register')}
              style={{
                color: 'var(--color-expense)',
                fontWeight: 500,
                cursor: 'pointer',
                marginLeft: 4,
              }}
            >
              立即注册
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
