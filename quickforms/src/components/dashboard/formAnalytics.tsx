"use client";

import React, { useState, useEffect, FC } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import DashboardLayout from '../layouts/DashBoardLayout';

interface IconProps { className?: string; }
interface Stat { name: string; value: string; icon: FC<IconProps>; }
interface Submission { id: string; submittedAt: string; data: Record<string, any>; }
interface ChartData { name: string; submissions: number; }
type ChartPeriod = 'today' | 'week' | 'month' | 'year' | 'custom';
type ChartType = 'bar' | 'line' | 'area' | 'pie';
interface AnalyticsData {
  title: string;
  stats: Stat[];
  recentSubmissions: Submission[];
  chartData: ChartData[];
}

const EyeIcon: FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const InboxIcon: FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>;
const PercentIcon: FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>;
const ChevronLeftIcon: FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 18-6-6 6-6"/></svg>;

const CHART_COLORS = {
  pie: ['#14B8A6', '#F97316', '#38BDF8', '#A855F7', '#FBBF24'],
  main: '#6366F1',
  fillOpacity: 0.2
};

const formatDisplayDate = (isoString: string) =>
  new Date(isoString).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
    
const formatXAxisTickUTC = (tickItem: string, period: ChartPeriod) => {
    const date = new Date(tickItem);
    if (isNaN(date.getTime())) return tickItem;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getUTCMonth()];
    switch (period) {
        case 'today':
            const hours = date.getUTCHours();
            const minutes = date.getUTCMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = hours % 12 || 12;
            return `${formattedHours}:${minutes} ${ampm}`;
        case 'year':
            return month;
        default:
            return `${month} ${date.getUTCDate()}`;
    }
};

const renderTableCell = (data: any): string => {
    if (data === null || data === undefined || data === '') {
        return '-';
    }
    if (typeof data === 'object') {
        if (Array.isArray(data) && data.length === 0) return '-';
        if (Object.keys(data).length === 0) return '-';
        return JSON.stringify(data);
    }
    return data.toString();
};

const StatCardSkeleton = () => ( <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-6 flex items-center animate-pulse"><div className="p-3 bg-gray-700/50 rounded-lg mr-4"><div className="h-7 w-7 bg-gray-600/50 rounded"></div></div><div className="flex-1"><div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div><div className="h-7 bg-gray-600 rounded w-1/2"></div></div></div>);
const ChartSkeleton = () => ( <div className="absolute inset-0 flex items-center justify-center bg-gray-800/30 rounded-lg"><div className="text-center"><p className="text-gray-400">Loading chart data...</p></div></div>);
const TableSkeleton = () => ( <div className="overflow-x-auto animate-pulse"><div className="min-w-full text-sm text-left text-gray-400"><div className="flex bg-gray-800/50 rounded-t-lg"><div className="px-4 py-3 w-1/4"><div className="h-4 bg-gray-700 rounded"></div></div><div className="px-4 py-3 w-1/4"><div className="h-4 bg-gray-700 rounded"></div></div><div className="px-4 py-3 w-1/2"><div className="h-4 bg-gray-700 rounded"></div></div></div><div>{[...Array(3)].map((_, i) => ( <div key={i} className="flex border-b border-gray-700/50"><div className="px-4 py-4 w-1/4"><div className="h-4 bg-gray-700/80 rounded"></div></div><div className="px-4 py-4 w-1/4"><div className="h-4 bg-gray-700/80 rounded"></div></div><div className="px-4 py-4 w-1/2"><div className="h-4 bg-gray-700/80 rounded"></div></div></div>))}</div></div></div>);

export default function FormAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const formId = params?.formId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('week');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [customDateRange, setCustomDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }
    const fetchData = async () => {
      if (!user || !formId) return;
      setIsLoading(true);
      let url = `/api/forms/${formId}/analytics?period=${chartPeriod}`;
      if (chartPeriod === 'custom') {
        url += `&startDate=${customDateRange.start}&endDate=${customDateRange.end}`;
      }
      try {
        const token = await user.getIdToken();
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) {
          if (res.status === 404) router.push('/forms');
          throw new Error('Failed to fetch analytics data');
        }
        const data = await res.json();
        setAnalyticsData({
          title: data.title,
          stats: [
            { name: 'Total Views', value: data.stats.totalViews.toLocaleString(), icon: EyeIcon },
            { name: 'Total Submissions', value: data.stats.totalSubmissions.toLocaleString(), icon: InboxIcon },
            { name: 'Conversion Rate', value: data.stats.conversionRate, icon: PercentIcon },
          ],
          recentSubmissions: data.recentSubmissions,
          chartData: data.chartData
        });
      } catch (error) {
        setAnalyticsData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, authLoading, formId, chartPeriod, customDateRange.start, customDateRange.end, router]);
  
  if (!isLoading && !analyticsData) {
    return (
      <DashboardLayout headerContent={<div className="text-white">Error</div>}>
        <div className="p-8 text-center text-gray-400">Could not load analytics data. Please try again later.</div>
      </DashboardLayout>
    );
  }

  const submissionTableHeaders = analyticsData?.recentSubmissions?.[0]?.data 
    ? Object.keys(analyticsData.recentSubmissions[0].data) 
    : [];

  const ChartRenderer = () => {
    const data = analyticsData?.chartData ?? [];
    const commonProps = { data, margin: { top: 5, right: 20, left: -10, bottom: 5 } };
    
    const cartesianComponents = [
      <CartesianGrid key="grid" strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />,
      <XAxis 
        key="xaxis" 
        dataKey="name" 
        tick={{ fill: '#9CA3AF' }} 
        fontSize={12}
        interval="preserveStartEnd"
        tickFormatter={(value) => formatXAxisTickUTC(value, chartPeriod)}
      />,
      <YAxis key="yaxis" tick={{ fill: '#9CA3AF' }} fontSize={12} />,
      <Tooltip key="tooltip" contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255, 255, 255, 0.1)' }} />,
      <Legend key="legend" />
    ];

    if (chartType === 'pie') {
      return (
        <div className="flex justify-center">
          <PieChart width={300} height={300}>
            <Pie data={data} dataKey="submissions" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS.pie[index % CHART_COLORS.pie.length]} />)}
            </Pie>
            <Tooltip /><Legend />
          </PieChart>
        </div>
      );
    }

    const ChartComponent = chartType === 'line' ? LineChart : chartType === 'area' ? AreaChart : BarChart;

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent {...commonProps}>
          {chartType === 'bar' && <Bar dataKey="submissions" fill={CHART_COLORS.main} radius={[4, 4, 0, 0]} />}
          {chartType === 'line' && <Line type="monotone" dataKey="submissions" stroke={CHART_COLORS.main} strokeWidth={2} />}
          {chartType === 'area' && <Area type="monotone" dataKey="submissions" stroke={CHART_COLORS.main} fill={CHART_COLORS.main} fillOpacity={CHART_COLORS.fillOpacity} />}
          {cartesianComponents}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <DashboardLayout headerContent={
      <div className="flex items-center gap-4">
        <Link href="/forms" className="text-gray-400 hover:text-white transition-colors"><ChevronLeftIcon className="h-6 w-6" /></Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white truncate">{analyticsData?.title ?? 'Loading...'}</h1>
          <p className="text-gray-400 text-sm">Analytics Overview</p>
        </div>
      </div>
    }>
      <div className="p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            [...Array(3)].map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            analyticsData?.stats.map(stat => (
              <div key={stat.name} className="bg-gray-800/50 border border-white/10 rounded-2xl p-6 flex items-center">
                <div className="p-3 bg-indigo-600/20 rounded-lg mr-4"><stat.icon className="h-7 w-7 text-indigo-400" /></div>
                <div><p className="text-sm text-gray-400">{stat.name}</p><p className="text-2xl font-bold text-white">{stat.value}</p></div>
              </div>
            ))
          )}
        </div>

        <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex flex-col xl:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="text-xl font-bold text-white">Submissions Trend</h2>
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex space-x-1 bg-gray-700/50 p-1 rounded-lg">
                    {(['bar', 'line', 'area', 'pie'] as ChartType[]).map(type => (
                    <button key={type} onClick={() => setChartType(type)} className={`px-3 py-1 text-sm font-semibold rounded-md ${chartType === type ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-600/50'}`}>{type}</button>
                    ))}
                </div>
                <div className="flex items-center space-x-1 bg-gray-700/50 p-1 rounded-lg">
                    {(['today', 'week', 'month', 'year', 'custom'] as ChartPeriod[]).map(period => (
                    <button key={period} onClick={() => setChartPeriod(period)} className={`px-3 py-1 text-sm font-semibold rounded-md ${chartPeriod === period ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-600/50'}`}>{period}</button>
                    ))}
                </div>
                {chartPeriod === 'custom' && (
                  <div className="flex items-center gap-2">
                    <input className="bg-gray-700/50 text-white rounded-md p-1 border border-gray-600" type="date" value={customDateRange.start} onChange={e => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))} />
                    <span className="text-gray-400">to</span>
                    <input className="bg-gray-700/50 text-white rounded-md p-1 border border-gray-600" type="date" value={customDateRange.end} onChange={e => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))} />
                  </div>
                )}
            </div>
          </div>
          <div className="h-96 relative">
            {isLoading ? <ChartSkeleton /> : <ChartRenderer />}
          </div>
        </div>
        
        <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Submissions</h2>
          {isLoading ? (
            <TableSkeleton />
          ) : (analyticsData?.recentSubmissions?.length ?? 0) === 0 ? (
            <p className="text-gray-400">No submissions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-400 table-fixed">
                <thead className="bg-gray-700/30">
                  <tr>
                    <th className="px-4 py-3 font-semibold border-b border-gray-700 w-52">Submitted At</th>
                    {submissionTableHeaders.map(header => (
                      <th key={header} className="px-4 py-3 font-semibold border-b border-gray-700 capitalize">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analyticsData?.recentSubmissions.map(submission => (
                    <tr key={submission.id} className="hover:bg-gray-700/30">
                      <td className="px-4 py-3 border-b border-gray-700/50 align-middle">
                        <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                            {formatDisplayDate(submission.submittedAt)}
                        </div>
                      </td>
                      {submissionTableHeaders.map(header => (
                        <td key={header} className="px-4 py-3 border-b border-gray-700/50 align-middle">
                          <div 
                            className="max-w-sm overflow-hidden text-ellipsis whitespace-nowrap"
                            title={renderTableCell(submission.data[header])}
                          >
                            {renderTableCell(submission.data[header])}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}