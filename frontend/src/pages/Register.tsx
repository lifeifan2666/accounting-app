import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'antd-mobile';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim()) {
      Toast.show({ content: '请输入用户名', icon: 'fail' });
      return;
    }
    if (username.trim().length < 2) {
      Toast.show({ content: '用户名至少2个字符', icon: 'fail' });
      return;
    }
    if (!password) {
      Toast.show({ content: '请输入密码', icon: 'fail' });
      return;
    }
    if (password.length < 6) {
      Toast.show({ content: '密码至少6个字符', icon: 'fail' });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({ content: '两次密码不一致', icon: 'fail' });
      return;
    }

    setLoading(true);
    try {
      await registerUser({ username: username.trim(), password });
      Toast.show({ content: '注册成功', icon: 'success' });
      navigate('/');
    } catch (error: any) {
      Toast.show({
        content: error.response?.data?.detail || '注册失败',
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
        background: 'linear-gradient(135deg, var(--color-income) 0%, #66BB6A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        boxShadow: '0 4px 16px rgba(82, 196, 26, 0.3)',
      }}>
        <span style={{ fontSize: 40 }}>📝</span>
      </div>

      <h1 style={{
        fontSize: 28,
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        marginBottom: 8,
      }}>
        创建账户
      </h1>

      <p style={{
        fontSize: 14,
        color: 'var(--color-text-secondary)',
        marginBottom: 40,
      }}>
        注册开始记账
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
          <div style={{ marginBottom: 16 }}>
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
              placeholder="至少6个字符"
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

          {/* Confirm Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              color: 'var(--color-text-secondary)',
              marginBottom: 8,
            }}>
              确认密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="再次输入密码"
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

          {/* Register Button */}
          <button
            onClick={handleRegister}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 12,
              border: 'none',
              background: loading
                ? 'var(--color-divider)'
                : 'linear-gradient(135deg, var(--color-income) 0%, #66BB6A 100%)',
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? 'default' : 'pointer',
              marginBottom: 16,
            }}
          >
            {loading ? '注册中...' : '注册'}
          </button>

          {/* Login Link */}
          <div style={{
            textAlign: 'center',
            fontSize: 14,
            color: 'var(--color-text-secondary)',
          }}>
            已有账户？
            <span
              onClick={() => navigate('/login')}
              style={{
                color: 'var(--color-income)',
                fontWeight: 500,
                cursor: 'pointer',
                marginLeft: 4,
              }}
            >
              立即登录
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
