import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getWeeklyReport } from '../api';
import type { WeeklyReport } from '../api/types';
import { getCategoryIcon, BackButton, NavButton } from '../components/Icons';

export default function WeeklyReport() {
  const navigate = useNavigate();
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(dayjs().startOf('week').add(1, 'day')); // Monday

  useEffect(() => {
    fetchReport();
  }, [startDate]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await getWeeklyReport({
        start_date: startDate.format('YYYY-MM-DD'),
      });
      setReport(res.data);
    } catch (error) {
      console.error('Failed to fetch weekly report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevWeek = () => {
    setStartDate(startDate.subtract(7, 'day'));
  };

  const handleNextWeek = () => {
    const nextWeek = startDate.add(7, 'day');
    if (nextWeek.isBefore(dayjs(), 'day') || nextWeek.isSame(dayjs(), 'day')) {
      setStartDate(nextWeek);
    }
  };

  const canGoNext = startDate.add(7, 'day').isBefore(dayjs(), 'day') ||
    startDate.add(7, 'day').isSame(dayjs(), 'day');

  const endDate = startDate.add(6, 'day');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ color: 'var(--color-text-secondary)' }}>加载中...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ color: 'var(--color-text-secondary)' }}>无法加载报表</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      paddingBottom: 40,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        background: 'var(--color-bg-card)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <BackButton onClick={() => navigate(-1)} />
        <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          周报表
        </span>
        <div style={{ width: 32 }} />
      </div>

      {/* Week Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        background: 'var(--color-bg-card)',
        marginBottom: 12,
      }}>
        <NavButton direction="left" onClick={handlePrevWeek} />
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}>
            {startDate.format('YYYY.MM.DD')} - {endDate.format('YYYY.MM.DD')}
          </div>
          <div style={{
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            marginTop: 2,
          }}>
            {startDate.format('YYYY年')} 第{startDate.format('w')}周
          </div>
        </div>
        <NavButton direction="right" onClick={canGoNext ? handleNextWeek : undefined} disabled={!canGoNext} />
      </div>

      {/* Invoice-style Report Card */}
      <div style={{
        margin: '0 16px',
        background: 'var(--color-bg-card)',
        borderRadius: 16,
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
      }}>
        {/* Invoice Header */}
        <div style={{
          background: 'linear-gradient(135deg, #2D3436 0%, #4A5568 100%)',
          padding: '24px 20px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#fff',
            letterSpacing: 4,
            marginBottom: 8,
          }}>
            周 报 表
          </div>
          <div style={{
            fontSize: 13,
            color: 'rgba(255, 255, 255, 0.7)',
            letterSpacing: 2,
          }}>
            WEEKLY REPORT
          </div>
        </div>

        {/* Date Range */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px dashed var(--color-divider)',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>统计周期</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
            {startDate.format('YYYY.MM.DD')} - {endDate.format('YYYY.MM.DD')}
          </span>
        </div>

        {/* Summary Section */}
        <div style={{
          padding: '20px',
          background: 'linear-gradient(to bottom, #FAFBFC, #fff)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: '1px solid var(--color-divider)',
          }}>
            <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>收入总计</span>
            <span style={{
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--color-income)',
              fontFamily: 'monospace',
            }}>
              ¥ {report.total_income.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: '1px solid var(--color-divider)',
          }}>
            <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>支出总计</span>
            <span style={{
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--color-expense)',
              fontFamily: 'monospace',
            }}>
              ¥ {report.total_expense.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 0 4px',
          }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>本周结余</span>
            <span style={{
              fontSize: 22,
              fontWeight: 700,
              color: report.balance >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
              fontFamily: 'monospace',
            }}>
              ¥ {report.balance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Divider with dots */}
        <div style={{
          height: 2,
          background: 'repeating-linear-gradient(90deg, var(--color-divider), var(--color-divider) 4px, transparent 4px, transparent 8px)',
        }} />

        {/* Category Breakdown */}
        {report.category_breakdown.length > 0 && (
          <div style={{ padding: '20px' }}>
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{
                width: 4,
                height: 16,
                background: 'var(--color-expense)',
                borderRadius: 2,
              }} />
              分类明细
            </div>

            {report.category_breakdown.map((cat, index) => {
              const config = getCategoryIcon(cat.category_name);
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: index < report.category_breakdown.length - 1 ? '1px solid var(--color-divider)' : 'none',
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: config.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    marginRight: 12,
                  }}>
                    {config.icon}
                  </div>
                  <span style={{
                    flex: 1,
                    fontSize: 14,
                    color: 'var(--color-text-primary)',
                  }}>
                    {cat.category_name}
                  </span>
                  <span style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    marginRight: 12,
                    fontFamily: 'monospace',
                  }}>
                    ¥ {cat.amount.toFixed(0)}
                  </span>
                  <span style={{
                    fontSize: 12,
                    color: '#fff',
                    background: 'var(--color-expense)',
                    padding: '2px 8px',
                    borderRadius: 10,
                    minWidth: 50,
                    textAlign: 'center',
                  }}>
                    {cat.percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Divider */}
        {report.category_breakdown.length > 0 && (
          <div style={{
            height: 2,
            background: 'repeating-linear-gradient(90deg, var(--color-divider), var(--color-divider) 4px, transparent 4px, transparent 8px)',
          }} />
        )}

        {/* Daily Breakdown */}
        <div style={{ padding: '20px' }}>
          <div style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{
              width: 4,
              height: 16,
              background: 'var(--color-income)',
              borderRadius: 2,
            }} />
            每日收支
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 4,
          }}>
            {report.daily_breakdown.map((day, index) => {
              const isToday = dayjs(day.date).isSame(dayjs(), 'day');
              return (
                <div
                  key={index}
                  style={{
                    textAlign: 'center',
                    padding: '8px 4px',
                    borderRadius: 8,
                    background: isToday ? 'var(--color-divider)' : 'transparent',
                  }}
                >
                  <div style={{
                    fontSize: 11,
                    color: 'var(--color-text-secondary)',
                    marginBottom: 4,
                  }}>
                    {day.weekday}
                  </div>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: day.income > 0 ? 'var(--color-income)' : 'var(--color-text-tertiary)',
                    marginBottom: 2,
                  }}>
                    {day.income > 0 ? `+${day.income.toFixed(0)}` : '-'}
                  </div>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: day.expense > 0 ? 'var(--color-expense)' : 'var(--color-text-tertiary)',
                  }}>
                    {day.expense > 0 ? `-${day.expense.toFixed(0)}` : '-'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: '#FAFBFC',
          padding: '16px 20px',
          borderTop: '1px solid var(--color-divider)',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            letterSpacing: 1,
          }}>
            Generated by Accounting App
          </div>
          <div style={{
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            marginTop: 4,
          }}>
            {dayjs().format('YYYY-MM-DD HH:mm')}
          </div>
        </div>
      </div>
    </div>
  );
}
