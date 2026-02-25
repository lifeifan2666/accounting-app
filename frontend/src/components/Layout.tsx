import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { TabBar } from 'antd-mobile';
import {
  AppOutline,
  UnorderedListOutline,
  UserOutline,
  PieOutline,
} from 'antd-mobile-icons';

const tabs = [
  { key: '/', title: '明细', icon: <UnorderedListOutline /> },
  { key: '/chart', title: '图表', icon: <PieOutline /> },
  { key: '/add', title: '记账', icon: <span style={{ fontSize: 26, fontWeight: 600 }}>+</span> },
  { key: '/accounts', title: '账户', icon: <UserOutline /> },
  { key: '/settings', title: '设置', icon: <AppOutline /> },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const showTabBar = !['/add', '/categories', '/recurring', '/budget', '/transfer', '/reminders', '/weekly-report'].includes(location.pathname) && !location.pathname.startsWith('/transaction');

  return (
    <div style={{ minHeight: '100vh' }}>
      <Outlet />
      {showTabBar && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 450,
          background: 'var(--color-bg-card)',
          borderTop: '1px solid var(--color-border)',
          zIndex: 1000,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          <TabBar
            activeKey={location.pathname}
            onChange={value => navigate(value)}
            style={{
              '--active-title-color': 'var(--color-expense)',
              '--title-color-active': 'var(--color-expense)',
            } as React.CSSProperties}
          >
            {tabs.map(item => (
              <TabBar.Item
                key={item.key}
                icon={item.icon}
                title={item.title}
                style={{
                  '--title-font-size': '11px',
                } as React.CSSProperties}
              />
            ))}
          </TabBar>
        </div>
      )}
    </div>
  );
}
