"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminAnalytics({ data }: { data: any[] }) {
  // If no data, provide a placeholder curve so the chart looks professional
  const chartData = data.length > 0 ? data : [
    { name: '1', revenue: 0 },
    { name: '2', revenue: 0 },
    { name: '3', revenue: 0 },
  ];

  return (
    <div className="w-full h-full min-h-75">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C8900A" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#C8900A" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="rgba(255,255,255,0.5)" 
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis 
            stroke="rgba(255,255,255,0.5)" 
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={(value) => `৳${value}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1A1F0F', borderColor: 'rgba(200,144,10,0.3)', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#C8900A', fontWeight: 'bold' }}
            formatter={(value: any) => [`৳${Number(value).toLocaleString()}`, 'Revenue']}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#C8900A" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
            activeDot={{ r: 6, fill: '#C8900A', stroke: '#1A1F0F', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
