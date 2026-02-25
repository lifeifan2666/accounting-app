import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Popup, Toast, Dialog } from 'antd-mobile';
import dayjs from 'dayjs';
import { getBudgetStatus, getCategories, createBudget, updateBudget, deleteBudget } from '../api';
import type { BudgetStatus, Category } from '../api/types';
import { getCategoryIcon, BackButton } from '../components/Icons';

export default function Budget() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [budgetAmount, setBudgetAmount] = useState('');

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statusRes, catRes] = await Promise.all([
        getBudgetStatus({
          year: currentDate.year(),
          month: currentDate.month() + 1,
        }),
        getCategories('expense'),
      ]);
      setBudgetStatus(statusRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error('Failed to fetch budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(currentDate.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    if (currentDate.add(1, 'month').isBefore(dayjs(), 'month') || currentDate.isSame(dayjs(), 'month')) {
      setCurrentDate(currentDate.add(1, 'month'));
    }
  };

  const canGoNext = currentDate.add(1, 'month').isBefore(dayjs(), 'month') || currentDate.isSame(dayjs(), 'month');

  const handleAddBudget = async () => {
    if (!budgetAmount || parseFloat(budgetAmount) <= 0) {
      Toast.show({ content: '请输入有效金额', icon: 'fail' });
      return;
    }

    try {
      await createBudget({
        category_id: selectedCategory,
        amount: parseFloat(budgetAmount),
        period: 'month',
        year: currentDate.year(),
        month: currentDate.month() + 1,
      });
      Toast.show({ content: '预算设置成功', icon: 'success' });
      setShowAddBudget(false);
      setBudgetAmount('');
      setSelectedCategory(null);
      fetchData();
    } catch (error: any) {
      if (error.response?.data?.detail) {
        // 预算已存在，询问是否更新
        const result = await Dialog.confirm({
          content: '该预算已存在，是否更新金额？',
          confirmText: '更新',
          cancelText: '取消',
        });
        if (result) {
          // 找到现有预算并更新
          const existing = budgetStatus.find(b => b.category_id === selectedCategory);
          if (existing?.id) {
            await updateBudget(existing.id, { amount: parseFloat(budgetAmount) });
            Toast.show({ content: '预算更新成功', icon: 'success' });
            setShowAddBudget(false);
            setBudgetAmount('');
            setSelectedCategory(null);
            fetchData();
          }
        }
      } else {
        Toast.show({ content: '设置失败', icon: 'fail' });
      }
    }
  };

  const handleDeleteBudget = async (id: number) => {
    const result = await Dialog.confirm({
      content: '确定要删除这个预算吗？',
      confirmText: '删除',
      cancelText: '取消',
    });

    if (result) {
      try {
        await deleteBudget(id);
        Toast.show({ content: '已删除', icon: 'success' });
        fetchData();
      } catch (error) {
        Toast.show({ content: '删除失败', icon: 'fail' });
      }
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'var(--color-expense)';
    if (percentage >= 80) return '#FF9800';
    return 'var(--color-income)';
  };

  const totalBudget = budgetStatus.find(b => b.category_id === null);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      paddingBottom: 70,
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--color-bg-card)',
        padding: '16px 16px 12px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        borderBottom: '1px solid var(--color-border)',
      }}>
        {/* Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <BackButton onClick={() => navigate(-1)} />
          <span style={{
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}>
            预算管理
          </span>
          <div
            onClick={() => setShowAddBudget(true)}
            style={{
              width: 36,
              height: 36,
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

        {/* Month Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div onClick={handlePrevMonth} style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
            background: 'var(--color-divider)',
            fontSize: 18,
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
          }}>‹</div>
          <span style={{
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}>
            {currentDate.format('YYYY年M月')}
          </span>
          <div
            onClick={canGoNext ? handleNextMonth : undefined}
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 10,
              background: 'var(--color-divider)',
              fontSize: 18,
              color: canGoNext ? 'var(--color-text-secondary)' : 'var(--color-text-tertiary)',
              cursor: canGoNext ? 'pointer' : 'default',
              opacity: canGoNext ? 1 : 0.4,
            }}
          >›</div>
        </div>
      </div>

      {/* Total Budget Card */}
      {totalBudget && (
        <div style={{
          margin: '16px',
          padding: '20px',
          background: 'var(--color-bg-card)',
          borderRadius: 16,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: getCategoryIcon('总预算').bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
              }}>
                {getCategoryIcon('总预算').icon}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  总预算
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                  本月支出
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                ¥{totalBudget.used_amount.toFixed(0)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                / ¥{totalBudget.budget_amount.toFixed(0) || '未设置'}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{
            height: 8,
            background: 'var(--color-divider)',
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(totalBudget.percentage, 100)}%`,
              background: getProgressColor(totalBudget.percentage),
              borderRadius: 4,
              transition: 'width 0.3s ease',
            }} />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 8,
            fontSize: 12,
            color: 'var(--color-text-tertiary)',
          }}>
            <span>已用 {totalBudget.percentage.toFixed(0)}%</span>
            <span style={{ color: totalBudget.remaining_amount >= 0 ? 'var(--color-income)' : 'var(--color-expense)' }}>
              {totalBudget.remaining_amount >= 0 ? '剩余' : '超支'} ¥{Math.abs(totalBudget.remaining_amount).toFixed(0)}
            </span>
          </div>
        </div>
      )}

      {/* Category Budgets */}
      <div style={{ padding: '0 16px' }}>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
          marginBottom: 12,
        }}>
          分类预算
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>
            加载中...
          </div>
        ) : budgetStatus.filter(b => b.category_id !== null).length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 0',
            color: 'var(--color-text-tertiary)',
            background: 'var(--color-bg-card)',
            borderRadius: 16,
          }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📊</div>
            <div>暂无分类预算</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>点击右上角 + 添加预算</div>
          </div>
        ) : (
          budgetStatus
            .filter(b => b.category_id !== null)
            .map(budget => {
              const config = getCategoryIcon(budget.category_name || '');

              return (
                <div
                  key={budget.id || budget.category_id}
                  style={{
                    background: 'var(--color-bg-card)',
                    borderRadius: 14,
                    marginBottom: 10,
                    padding: '14px 16px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: config.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                      }}>
                        {config.icon}
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                        {budget.category_name}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        ¥{budget.used_amount.toFixed(0)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                        / ¥{budget.budget_amount.toFixed(0)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    height: 6,
                    background: 'var(--color-divider)',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(budget.percentage, 100)}%`,
                      background: getProgressColor(budget.percentage),
                      borderRadius: 3,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 8,
                  }}>
                    <span style={{
                      fontSize: 11,
                      color: budget.percentage >= 80 ? 'var(--color-expense)' : 'var(--color-text-tertiary)',
                    }}>
                      {budget.percentage >= 100 ? '已超支' : budget.percentage >= 80 ? '即将超支' : `已用 ${budget.percentage.toFixed(0)}%`}
                    </span>
                    {budget.id && (
                      <span
                        onClick={() => handleDeleteBudget(budget.id!)}
                        style={{
                          fontSize: 11,
                          color: 'var(--color-text-tertiary)',
                          cursor: 'pointer',
                        }}
                      >
                        删除
                      </span>
                    )}
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Add Budget Popup */}
      <Popup
        visible={showAddBudget}
        onMaskClick={() => setShowAddBudget(false)}
        bodyStyle={{
          height: '70vh',
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
            设置预算
          </div>

          {/* Category Selection */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 14,
              color: 'var(--color-text-secondary)',
              marginBottom: 12,
            }}>
              选择分类
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 10,
            }}>
              {/* Total Budget Option */}
              <div
                onClick={() => setSelectedCategory(null)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '10px 4px',
                  borderRadius: 12,
                  background: selectedCategory === null ? 'var(--color-expense-light)' : 'var(--color-bg)',
                  border: selectedCategory === null ? '2px solid var(--color-expense)' : '2px solid transparent',
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: getCategoryIcon('总预算').bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  marginBottom: 4,
                }}>
                  {getCategoryIcon('总预算').icon}
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: selectedCategory === null ? 600 : 500,
                  color: selectedCategory === null ? 'var(--color-expense)' : 'var(--color-text-secondary)',
                }}>
                  总预算
                </span>
              </div>

              {/* Category Options */}
              {categories.map(cat => {
                const config = getCategoryIcon(cat.name);
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
                      background: isSelected ? 'var(--color-expense-light)' : 'var(--color-bg)',
                      border: isSelected ? '2px solid var(--color-expense)' : '2px solid transparent',
                    }}
                  >
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: config.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      marginBottom: 4,
                    }}>
                      {config.icon}
                    </div>
                    <span style={{
                      fontSize: 11,
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? 'var(--color-expense)' : 'var(--color-text-secondary)',
                    }}>
                      {cat.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 14,
              color: 'var(--color-text-secondary)',
              marginBottom: 12,
            }}>
              预算金额
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
                value={budgetAmount}
                onChange={e => setBudgetAmount(e.target.value)}
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

          {/* Submit Button */}
          <div
            onClick={handleAddBudget}
            style={{
              background: 'linear-gradient(135deg, var(--color-expense) 0%, var(--color-expense-dark) 100%)',
              color: 'white',
              textAlign: 'center',
              padding: '16px',
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(232, 132, 107, 0.35)',
            }}
          >
            确认设置
          </div>
        </div>
      </Popup>
    </div>
  );
}
