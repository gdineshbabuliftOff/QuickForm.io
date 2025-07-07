"use client";

import React, { useState, useEffect, FC, JSX } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import QuickFormLoader from '../loaders/quickFormloader';

// --- Type Definitions ---
interface IconProps {
  color?: string;
  size?: number | string;
  strokeWidth?: number | string;
  className?: string;
}
type IconPathTuple = [keyof JSX.IntrinsicElements, { [key: string]: any }];
interface Stat {
    name: string;
    value: string;
    icon: FC<IconProps>;
}
interface Form {
    id: string;
    title: string;
    submissions: number;
    status: string;
    createdAt: string;
}
interface ChartData {
    name: string;
    submissions: number;
}

// --- Reusable Icon Components (Exported for use in other pages) ---
const createIcon = (path: IconPathTuple[]): (({ displayName }: { displayName: string; }) => FC<IconProps>) => ({ displayName }: { displayName: string; }) => {
  const Component = React.forwardRef<SVGSVGElement, IconProps>(
    ({ color = 'currentColor', size = 24, strokeWidth = 2, className, ...rest }, ref) => (
      React.createElement('svg', {
        ref, width: size, height: size, stroke: color, strokeWidth,
        className: ['lucide', `lucide-${displayName.toLowerCase()}`, className].filter(Boolean).join(' '),
        xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24',
        fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round', ...rest,
      }, path.map(([tag, attrs], index) => React.createElement(tag, { key: attrs.key || index, ...attrs })))
    )
  );
  Component.displayName = `LucideIcon(${displayName})`;
  return Component;
};

export const LayoutDashboardIcon = createIcon([['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', key: 'afitv7' }], ['line', { x1: '3', x2: '21', y1: '9', y2: '9', key: '1p2jc2' }], ['line', { x1: '9', x2: '9', y1: '21', y2: '9', key: '19O89v' }]])({ displayName: 'LayoutDashboard' });
export const FileTextIcon = createIcon([['path', { d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z', key: '1c84w5' }], ['path', { d: 'M14 2v4a2 2 0 0 0 2 2h4', key: 'tnqrlb' }], ['path', { d: 'M10 9H8', key: '1pudvb' }], ['path', { d: 'M16 13H8', key: '12xwt5' }], ['path', { d: 'M16 17H8', key: '1s50d7' }]])({ displayName: 'FileText' });
export const SettingsIcon = createIcon([['path', { d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z', key: '15hpa' }], ['circle', { cx: '12', cy: '12', r: '3', key: '1vcmzo' }]])({ displayName: 'Settings' });
export const LogOutIcon = createIcon([['path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', key: '1uf2ve' }], ['polyline', { points: '16 17 21 12 16 7', key: '1gabdz' }], ['line', { x1: '21', x2: '9', y1: '12', y2: '12', key: '1uyosf' }]])({ displayName: 'LogOut' });
const PlusCircleIcon = createIcon([['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }], ['line', { x1: '12', x2: '12', y1: '8', y2: '16', key: '1v31s3' }], ['line', { x1: '8', x2: '16', y1: '12', y2: '12', key: '1jonct' }]])({ displayName: 'PlusCircle' });
const ChevronRightIcon = createIcon([['path', { d: 'm9 18 6-6-6-6', key: '15o5w2' }]])({ displayName: 'ChevronRight' });
const InboxIcon = createIcon([['polyline', { points: '22 12 16 12 14 15 10 15 8 12 2 12', key: '11n2da' }], ['path', { d: 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z', key: 'zerga' }]])({ displayName: 'Inbox' });
const PercentIcon = createIcon([['line', { x1: '19', x2: '5', y1: '5', y2: '19', key: '1x9ddd' }], ['circle', { cx: '6.5', cy: '6.5', r: '2.5', key: '1L893f' }], ['circle', { cx: '17.5', cy: '17.5', r: '2.5', key: '19k29l' }]])({ displayName: 'Percent' });

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState<Stat[]>([]);
    const [recentForms, setRecentForms] = useState<Form[]>([]);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                setDataLoading(true);
                const token = await user.getIdToken();
                const headers = { 'Authorization': `Bearer ${token}` };

                try {
                    const [statsRes, formsRes, chartRes] = await Promise.all([
                        fetch('/api/stats', { headers }),
                        fetch('/api/forms', { headers }),
                        fetch('/api/submissions/chart', { headers })
                    ]);

                    if (!statsRes.ok || !formsRes.ok || !chartRes.ok) {
                        throw new Error('Failed to fetch dashboard data');
                    }

                    const statsData = await statsRes.json();
                    const formsData = await formsRes.json();
                    const chartData = await chartRes.json();

                    setStats([
                        { name: 'Total Forms', value: statsData.totalForms, icon: FileTextIcon },
                        { name: 'Total Submissions', value: statsData.totalSubmissions, icon: InboxIcon },
                        { name: 'Conversion Rate', value: statsData.conversionRate, icon: PercentIcon },
                    ]);
                    setRecentForms(formsData.slice(0, 5));
                    setChartData(chartData);

                } catch (error) {
                    console.error("Failed to fetch dashboard data:", error);
                } finally {
                    setDataLoading(false);
                }
            };
            fetchData();
        }
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    if (authLoading || dataLoading) {
        return <QuickFormLoader />;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex">
            <aside className={`bg-gray-900/70 backdrop-blur-lg border-r border-white/10 w-64 fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-40`}>
                <div className="flex items-center justify-center h-20 border-b border-white/10">
                    <Link href="/" className="text-2xl font-bold text-white">
                        QuickForm<span className="text-indigo-500">.io</span>
                    </Link>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <Link href="/dashboard" className="flex items-center px-4 py-2.5 text-white bg-indigo-600/30 rounded-lg">
                        <LayoutDashboardIcon className="h-5 w-5 mr-3" /> Overview
                    </Link>
                    <Link href="/forms" className="flex items-center px-4 py-2.5 text-gray-400 hover:bg-gray-800/60 rounded-lg transition-colors">
                        <FileTextIcon className="h-5 w-5 mr-3" /> My Forms
                    </Link>
                    <Link href="/settings" className="flex items-center px-4 py-2.5 text-gray-400 hover:bg-gray-800/60 rounded-lg transition-colors">
                        <SettingsIcon className="h-5 w-5 mr-3" /> Settings
                    </Link>
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
                    <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-gray-400 hover:bg-red-600/20 hover:text-red-400 rounded-lg transition-colors">
                        <LogOutIcon className="h-5 w-5 mr-3" /> Log Out
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col">
                <header className="bg-gray-900/70 backdrop-blur-lg border-b border-white/10 h-20 flex items-center justify-between px-6 sticky top-0 z-30">
                     <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    </button>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-2xl font-bold text-white">Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!</h1>
                        <p className="text-gray-400 text-sm">Here&apos;s what&apos;s happening with your forms today.</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link href="/forms/new" className="hidden sm:flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:bg-indigo-500 transition-all duration-300">
                            <PlusCircleIcon size={20} /> Create Form
                        </Link>
                        <img src={user?.photoURL || `https://i.pravatar.cc/150?u=${user?.uid}`} alt="User avatar" width={40} height={40} className="rounded-full" />
                    </div>
                </header>

                <main className="flex-1 p-6 lg:p-8 bg-gray-900/95 animated-aurora-bg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {stats.map((stat) => (
                            <div key={stat.name} className="bg-gray-800/50 border border-white/10 rounded-2xl p-6 flex items-center">
                                <div className="p-3 bg-indigo-600/20 rounded-lg mr-4">
                                    <stat.icon className="h-7 w-7 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">{stat.name}</p>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2 bg-gray-800/50 border border-white/10 rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-white">Recent Forms</h2>
                                <Link href="/forms" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold">View all</Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/10 text-xs text-gray-400 uppercase">
                                            <th className="py-3 pr-3">Form Title</th>
                                            <th className="py-3 px-3">Submissions</th>
                                            <th className="py-3 px-3">Status</th>
                                            <th className="py-3 pl-3 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentForms.length > 0 ? recentForms.map((form) => (
                                            <tr key={form.id} className="border-b border-white/5 hover:bg-gray-800/40">
                                                <td className="py-4 pr-3">
                                                    <p className="font-semibold text-white">{form.title}</p>
                                                    <p className="text-xs text-gray-500">Created: {form.createdAt}</p>
                                                </td>
                                                <td className="py-4 px-3 text-gray-300">{form.submissions}</td>
                                                <td className="py-4 px-3">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${form.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-600/30 text-gray-400'}`}>
                                                        {form.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 pl-3 text-right">
                                                    <Link href={`/forms/${form.id}/analytics`} className="text-indigo-400 hover:text-indigo-300">
                                                        <ChevronRightIcon />
                                                    </Link>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={4} className="text-center py-8 text-gray-400">
                                                    You haven&apos;t created any forms yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Submissions this week</h2>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                        <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} fontSize={12} />
                                        <YAxis tick={{ fill: '#9CA3AF' }} fontSize={12} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255, 255, 255, 0.1)' }} />
                                        <Bar dataKey="submissions" fill="#6366F1" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
