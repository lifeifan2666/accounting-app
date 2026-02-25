import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getTransactions } from '../api';
import type { Transaction } from '../api/types';
import dayjs from 'dayjs';
import { getCategoryIcon } from '../components/Icons';

// 柔和的配色
const COLORS = [
  '#5B8DEF', '#52C41A', '#7B61FF', '#F5A623',
  '#B890C1', '#5CB8A8', '#E8A87C', '#8E9AAF',
];

export default function Chart() {
  const navigate = useNavigate();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTrends, setShowTrends] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const transRes = await getTransactions();
      setTransactions(transRes.data);
    } finally {
      setLoading(false);
    }
  };

  const thisMonthTransactions = transactions.filter(t =>
    dayjs(t.date).format('YYYY-MM') === dayjs().format('YYYY-MM') &&
    t.type === type
  );

  const categoryData = thisMonthTransactions.reduce((acc: Record<string, number>, t) => {
    const catName = t.category_name || '其他';
    acc[catName] = (acc[catName] || 0) + t.amount;
    return acc;
  }, {});

  const chartData = Object.entries(categoryData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // 计算近6个月的趋势数据
  const getTrendsData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = dayjs().subtract(i, 'month');
      const monthStr = monthDate.format('YYYY-MM');
      const monthTransactions = transactions.filter(t =>
        dayjs(t.date).format('YYYY-MM') === monthStr
      );

      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      months.push({
        month: monthDate.format('M月'),
        expense,
        income,
      });
    }
    return months;
  };

  const trendsData = getTrendsData();

  const color = type === 'expense' ? 'var(--color-expense)' : 'var(--color-income)';
  const colorLight = type === 'expense' ? 'var(--color-expense-light)' : 'var(--color-income-light)';
  const colorDark = type === 'expense' ? 'var(--color-expense-dark)' : 'var(--color-income-dark)';

  // Loading skeleton
  if (loading) {
    return (
      <div className="page-container" style={{ background: 'var(--color-bg)' }}>
        <div style={{ padding: '24px 20px', background: 'var(--color-bg-card)' }}>
          <div className="skeleton" style={{ width: 120, height: 20, marginBottom: 16 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="skeleton" style={{ width: 80, height: 36, borderRadius: 18 }} />
            <div className="skeleton" style={{ width: 80, height: 36, borderRadius: 18 }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ background: 'var(--color-bg)', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(145deg, #FFFFFF 0%, #F7F8FA 100%)',
        padding: '24px 20px',
        borderRadius: '0 0 28px 28px',
        boxShadow: '0 4px 20px rgba(45, 45, 45, 0.04)',
        marginBottom: 16,
      }}>
        <div style={{
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: 16,
        }}>
          {dayjs().format('YYYY年MM月')}
        </div>

        {/* Type Switcher */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div
            onClick={() => setType('expense')}
            style={{
              padding: '10px 24px',
              borderRadius: 20,
              background: type === 'expense' ? colorLight : 'var(--color-divider)',
              border: type === 'expense' ? `2px solid ${color}` : '2px solid transparent',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
          >
            <span style={{
              fontSize: 14,
              fontWeight: type === 'expense' ? 600 : 500,
              color: type === 'expense' ? colorDark : 'var(--color-text-secondary)',
            }}>
              支出
            </span>
          </div>
          <div
            onClick={() => setType('income')}
            style={{
              padding: '10px 24px',
              borderRadius: 20,
              background: type === 'income' ? colorLight : 'var(--color-divider)',
              border: type === 'income' ? `2px solid ${color}` : '2px solid transparent',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
          >
            <span style={{
              fontSize: 14,
              fontWeight: type === 'income' ? 600 : 500,
              color: type === 'income' ? colorDark : 'var(--color-text-secondary)',
            }}>
              收入
            </span>
          </div>
        </div>
      </div>

      {/* Weekly Report Entry */}
      <div style={{
        margin: '0 12px 16px',
        background: 'var(--color-bg-card)',
        borderRadius: 20,
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}>
        <div
          onClick={() => navigate('/weekly-report')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            周报表
          </span>
          <span style={{
            fontSize: 12,
            color: 'var(--color-text-secondary)',
          }}>▼</span>
        </div>
      </div>

      {/* Trends Card */}
      <div style={{
        margin: '0 12px 16px',
        background: 'var(--color-bg-card)',
        borderRadius: 20,
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}>
        <div
          onClick={() => setShowTrends(!showTrends)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            收支趋势
          </span>
          <span style={{
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            transform: showTrends ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
          }}>▼</span>
        </div>

        {showTrends && (
          <div style={{ padding: '0 16px 20px' }}>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }}
                    axisLine={{ stroke: 'var(--color-divider)' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }}
                    axisLine={{ stroke: 'var(--color-divider)' }}
                    tickFormatter={(value) => `¥${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-bg-card)',
                      border: 'none',
                      borderRadius: 12,
                      boxShadow: 'var(--shadow-md)',
                      padding: '8px 12px',
                    }}
                    formatter={(value: number | string | undefined) => value !== undefined ? `¥${Number(value).toFixed(2)}` : ''}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="var(--color-expense)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--color-expense)', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="支出"
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="var(--color-income)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--color-income)', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="收入"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 24,
              marginTop: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 12,
                  height: 3,
                  borderRadius: 2,
                  background: 'var(--color-expense)',
                }} />
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>支出</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 12,
                  height: 3,
                  borderRadius: 2,
                  background: 'var(--color-income)',
                }} />
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>收入</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Card */}
      <div style={{
        margin: '0 12px 16px',
        background: 'var(--color-bg-card)',
        borderRadius: 20,
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}>
        {chartData.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            color: 'var(--color-text-tertiary)',
          }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'var(--color-divider)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 36 }}>📊</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>暂无数据</div>
            <div style={{ fontSize: 13 }}>本月还没有{type === 'expense' ? '支出' : '收入'}记录</div>
          </div>
        ) : (
          <>
            {/* Pie Chart */}
            <div style={{ padding: '24px 16px' }}>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-bg-card)',
                        border: 'none',
                        borderRadius: 12,
                        boxShadow: 'var(--shadow-md)',
                        padding: '8px 12px',
                      }}
                      formatter={(value: number | string | undefined) => value !== undefined ? `¥${Number(value).toFixed(2)}` : ''}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Total */}
              <div style={{
                textAlign: 'center',
                padding: '16px 0',
                borderTop: '1px solid var(--color-divider)',
              }}>
                <div style={{
                  fontSize: 12,
                  color: 'var(--color-text-tertiary)',
                  marginBottom: 4,
                }}>
                  {type === 'expense' ? '本月总支出' : '本月总收入'}
                </div>
                <div style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color,
                }}>
                  ¥{total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Category List */}
            <div style={{ padding: '0 16px 16px' }}>
              {chartData.map((item, index) => {
                const config = getCategoryIcon(item.name);
                const percentage = (item.value / total * 100).toFixed(1);

                return (
                  <div
                    key={item.name}
                    className="fade-in"
                    style={{
                      animationDelay: `${index * 0.05}s`,
                      display: 'flex',
                      alignItems: 'center',
                      padding: '14px 0',
                      borderBottom: index < chartData.length - 1 ? '1px solid var(--color-divider)' : 'none',
                    }}
                  >
                    {/* Color dot */}
                    <div style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: COLORS[index % COLORS.length],
                      marginRight: 12,
                      flexShrink: 0,
                    }} />

                    {/* Icon */}
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: config.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      marginRight: 12,
                      flexShrink: 0,
                      color: 'var(--color-text-primary)',
                    }}>
                      {config.icon}
                    </div>

                    {/* Name */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 15,
                        fontWeight: 500,
                        color: 'var(--color-text-primary)',
                      }}>
                        {item.name}
                      </div>
                    </div>

                    {/* Amount */}
                    <div style={{ textAlign: 'right', marginRight: 12 }}>
                      <div style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                      }}>
                        ¥{item.value.toFixed(0)}
                      </div>
                    </div>

                    {/* Percentage */}
                    <div style={{
                      minWidth: 48,
                      padding: '4px 10px',
                      borderRadius: 12,
                      background: colorLight,
                      textAlign: 'center',
                    }}>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color,
                      }}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
