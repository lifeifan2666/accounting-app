import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getTransactions } from '../api';
import type { Transaction } from '../api/types';
import { getCategoryIcon, NavButton } from '../components/Icons';
import QuickEntry from '../components/QuickEntry';
import TagDisplay from '../components/TagDisplay';

export default function TransactionList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [viewType, setViewType] = useState<'month' | 'year'>('month');
  const [currentDate, setCurrentDate] = useState(dayjs());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const transRes = await getTransactions();
      setTransactions(transRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 过滤当前选中时间段的交易
  const filteredTransactions = transactions.filter((t: Transaction) => {
    const transactionDate = dayjs(t.date);
    if (viewType === 'month') {
      return transactionDate.format('YYYY-MM') === currentDate.format('YYYY-MM');
    } else {
      return transactionDate.format('YYYY') === currentDate.format('YYYY');
    }
  });

  // 计算当前时间段的收支
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // 按日期分组交易（月视图按天，年视图按月）
  const groupedTransactions: Record<string, Transaction[]> = {};

  if (viewType === 'month') {
    // 月视图：按天分组
    filteredTransactions.forEach((t: Transaction) => {
      const dateKey = dayjs(t.date).format('YYYY-MM-DD');
      if (!groupedTransactions[dateKey]) {
        groupedTransactions[dateKey] = [];
      }
      groupedTransactions[dateKey].push(t);
    });
  } else {
    // 年视图：按月分组
    filteredTransactions.forEach((t: Transaction) => {
      const dateKey = dayjs(t.date).format('YYYY-MM');
      if (!groupedTransactions[dateKey]) {
        groupedTransactions[dateKey] = [];
      }
      groupedTransactions[dateKey].push(t);
    });
  }

  // 排序日期（降序）
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

  // 时间段切换
  const handlePrev = () => {
    if (viewType === 'month') {
      setCurrentDate(currentDate.subtract(1, 'month'));
    } else {
      setCurrentDate(currentDate.subtract(1, 'year'));
    }
  };

  const handleNext = () => {
    if (viewType === 'month') {
      setCurrentDate(currentDate.add(1, 'month'));
    } else {
      setCurrentDate(currentDate.add(1, 'year'));
    }
  };

  // 判断是否可以前进到下个月/年
  const canGoNext = viewType === 'month'
    ? currentDate.add(1, 'month').isBefore(dayjs(), 'month') || currentDate.isSame(dayjs(), 'month')
    : currentDate.add(1, 'year').isBefore(dayjs(), 'year') || currentDate.isSame(dayjs(), 'year');

  // 格式化显示的时间
  const displayDate = viewType === 'month'
    ? currentDate.format('YYYY年M月')
    : currentDate.format('YYYY年');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      paddingBottom: 70,
    }}>
      {/* Header - 时间选择器 */}
      <div style={{
        background: 'var(--color-bg-card)',
        padding: '16px 16px 12px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        borderBottom: '1px solid var(--color-border)',
      }}>
        {/* 视图切换 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 12,
        }}>
          <div style={{
            display: 'flex',
            background: 'var(--color-divider)',
            borderRadius: 10,
            padding: 3,
          }}>
            <div
              onClick={() => setViewType('month')}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                background: viewType === 'month' ? 'var(--color-bg-card)' : 'transparent',
                fontSize: 14,
                fontWeight: viewType === 'month' ? 600 : 500,
                color: viewType === 'month' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                boxShadow: viewType === 'month' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
            >
              月
            </div>
            <div
              onClick={() => setViewType('year')}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                background: viewType === 'year' ? 'var(--color-bg-card)' : 'transparent',
                fontSize: 14,
                fontWeight: viewType === 'year' ? 600 : 500,
                color: viewType === 'year' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                boxShadow: viewType === 'year' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
            >
              年
            </div>
          </div>
        </div>

        {/* 时间导航 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <NavButton direction="left" onClick={handlePrev} />
          <span style={{
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}>
            {displayDate}
          </span>
          <NavButton direction="right" onClick={canGoNext ? handleNext : undefined} disabled={!canGoNext} />
        </div>

        {/* 收支统计 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          marginTop: 16,
          paddingTop: 16,
          borderTop: '1px solid var(--color-divider)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              marginBottom: 4,
            }}>收入</div>
            <div style={{
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--color-income)',
            }}>¥{totalIncome.toFixed(2)}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              marginBottom: 4,
            }}>支出</div>
            <div style={{
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--color-expense)',
            }}>¥{totalExpense.toFixed(2)}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              marginBottom: 4,
            }}>结余</div>
            <div style={{
              fontSize: 18,
              fontWeight: 600,
              color: balance >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
            }}>¥{balance.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* 快捷记账入口 */}
      <QuickEntry />

      {/* 交易列表 */}
      <div style={{ padding: '12px 16px' }}>
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 0',
            color: 'var(--color-text-secondary)',
          }}>
            加载中...
          </div>
        ) : sortedDates.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 0',
            color: 'var(--color-text-tertiary)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
            <div>暂无记录</div>
          </div>
        ) : (
          sortedDates.map(date => {
            const items = groupedTransactions[date];
            // 计算该日期的收支
            const dayIncome = items.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const dayExpense = items.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

            return (
              <div key={date} style={{
                background: 'var(--color-bg-card)',
                borderRadius: 16,
                marginBottom: 12,
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
              }}>
                {/* 日期标题 */}
                <div style={{
                  padding: '12px 16px 8px',
                  borderBottom: '1px solid var(--color-divider)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{
                    fontSize: 13,
                    color: 'var(--color-text-secondary)',
                    fontWeight: 500,
                  }}>
                    {viewType === 'month'
                      ? dayjs(date).format('M月D日 dddd')
                      : dayjs(date + '-01').format('M月')}
                  </span>
                  <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                    {dayIncome > 0 && (
                      <span style={{ color: 'var(--color-income)', marginRight: 8 }}>
                        +{dayIncome.toFixed(0)}
                      </span>
                    )}
                    {dayExpense > 0 && (
                      <span style={{ color: 'var(--color-expense)' }}>
                        -{dayExpense.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>

                {/* 交易项 */}
                {items.map((item, index) => {
                  const config = getCategoryIcon(item.category_name || '');
                  const isExpense = item.type === 'expense';

                  return (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/transaction/${item.id}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '14px 16px',
                        borderBottom: index < items.length - 1 ? '1px solid var(--color-divider)' : 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {/* 图标 */}
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: config.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        marginRight: 12,
                        color: 'var(--color-text-primary)',
                      }}>
                        {config.icon}
                      </div>

                      {/* 分类和备注 */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 15,
                          fontWeight: 500,
                          color: 'var(--color-text-primary)',
                          marginBottom: 2,
                        }}>
                          {item.category_name || '未分类'}
                        </div>
                        {item.note && (
                          <div style={{
                            fontSize: 12,
                            color: 'var(--color-text-tertiary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {item.note}
                          </div>
                        )}
                        {item.tags && item.tags.length > 0 && (
                          <TagDisplay tags={item.tags} size="small" />
                        )}
                      </div>

                      {/* 金额 */}
                      <div style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: isExpense ? 'var(--color-expense)' : 'var(--color-income)',
                      }}>
                        {isExpense ? '-' : '+'}{item.amount.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>

      {/* 添加按钮 */}
      <div
        onClick={() => navigate('/add')}
        style={{
          position: 'fixed',
          right: 20,
          bottom: 90,
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'linear-gradient(135deg, var(--color-expense) 0%, #FF8A65 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(234, 84, 85, 0.4)',
          cursor: 'pointer',
          fontSize: 28,
          color: 'white',
        }}
      >
        +
      </div>
    </div>
  );
}
