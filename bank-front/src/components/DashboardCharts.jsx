import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const ChartCard = ({ title, children, isDarkMode, colors }) => (
  <div
    style={{
      background: isDarkMode ? '#1F2937' : colors.card,
      boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
      padding: '28px',
      borderRadius: '16px',
      border: isDarkMode ? '1px solid #374151' : 'none',
    }}
  >
    <h5 className="fw-bold mb-4" style={{ color: isDarkMode ? '#F3F4F6' : colors.darkText }}>
      {title}
    </h5>
    {children}
  </div>
);

const DashboardCharts = ({ weeklyData, expenseData, isDarkMode, colors, chartColors }) => {
  return (
    <>
      <div className="col-lg-8">
        <ChartCard title="Weekly Activity" isDarkMode={isDarkMode} colors={colors}>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? '#374151' : '#E5E7EB'}
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  style={{ fontSize: '0.875rem' }}
                />
                <YAxis
                  stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  style={{ fontSize: '0.875rem' }}
                />
                <Tooltip
                  contentStyle={{
                    background: isDarkMode ? '#374151' : colors.card,
                    borderRadius: '12px',
                    border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                    color: isDarkMode ? '#F3F4F6' : colors.darkText,
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                <Bar dataKey="Deposit" fill={colors.primary} radius={[8, 8, 0, 0]} />
                <Bar dataKey="Withdraw" fill={colors.success} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
            </div>
          )}
        </ChartCard>
      </div>

      <div className="col-lg-4">
        <ChartCard title="Expense Statistics" isDarkMode={isDarkMode} colors={colors}>
          {expenseData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4">
                {expenseData.map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: chartColors[idx % chartColors.length],
                        }}
                      />
                      <span style={{ color: isDarkMode ? '#D1D5DB' : colors.lightText, fontSize: '0.875rem' }}>
                        {item.name}
                      </span>
                    </div>
                    <span
                      className="fw-semibold"
                      style={{ color: isDarkMode ? '#F3F4F6' : colors.darkText, fontSize: '0.875rem' }}
                    >
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
            </div>
          )}
        </ChartCard>
      </div>
    </>
  );
};

export default DashboardCharts;
