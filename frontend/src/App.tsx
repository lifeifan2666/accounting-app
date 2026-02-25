import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './components/Layout';
import TransactionList from './pages/TransactionList';
import TransactionDetail from './pages/TransactionDetail';
import AddTransaction from './pages/AddTransaction';
import Chart from './pages/Chart';
import Budget from './pages/Budget';
import CategoryManage from './pages/CategoryManage';
import RecurringTransactions from './pages/RecurringTransactions';
import Transfer from './pages/Transfer';
import Accounts from './pages/Accounts';
import Settings from './pages/Settings';
import Reminders from './pages/Reminders';
import WeeklyReport from './pages/WeeklyReport';
import Login from './pages/Login';
import Register from './pages/Register';

// 受保护的路由组件
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
      }}>
        加载中...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
      }}>
        加载中...
      </div>
    );
  }

  return (
    <Routes>
      {/* 公开路由 */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />

      {/* 受保护的路由 */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<TransactionList />} />
        <Route path="transaction/:id" element={<TransactionDetail />} />
        <Route path="chart" element={<Chart />} />
        <Route path="budget" element={<Budget />} />
        <Route path="add" element={<AddTransaction />} />
        <Route path="categories" element={<CategoryManage />} />
        <Route path="recurring" element={<RecurringTransactions />} />
        <Route path="transfer" element={<Transfer />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="settings" element={<Settings />} />
        <Route path="reminders" element={<Reminders />} />
        <Route path="weekly-report" element={<WeeklyReport />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
