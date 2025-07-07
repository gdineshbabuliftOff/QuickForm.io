"use client";

import React, { useState, useEffect, useMemo, FC, JSX } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Formik, Form as FormikForm, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import QuickFormLoader from '../loaders/quickFormloader';

// --- Type Definitions ---
interface IconProps {
  color?: string;
  size?: number | string;
  strokeWidth?: number | string;
  className?: string;
}
type IconPathTuple = [keyof JSX.IntrinsicElements, { [key: string]: any }];
interface Form {
    id: string;
    title: string;
    submissions: number;
    status: string;
    createdAt: string;
}

// --- Reusable Icon Creator ---
const createIcon = (path: IconPathTuple[]): (({ displayName }: { displayName: string; }) => FC<IconProps>) => ({ displayName }: { displayName: string; }) => {
  const Component = React.forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24, strokeWidth = 2, className, ...rest }, ref) => React.createElement('svg', { ref, width: size, height: size, stroke: color, strokeWidth, className: ['lucide', `lucide-${displayName.toLowerCase()}`, className].filter(Boolean).join(' '), xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round', ...rest }, path.map(([tag, attrs], i) => React.createElement(tag, { key: attrs.key || i, ...attrs }))));
  Component.displayName = `LucideIcon(${displayName})`;
  return Component;
};

// --- Icon Definitions ---
const LayoutDashboardIcon = createIcon([['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }], ['line', { x1: '3', x2: '21', y1: '9', y2: '9' }], ['line', { x1: '9', x2: '9', y1: '21', y2: '9' }]])({ displayName: 'LayoutDashboard' });
const FileTextIcon = createIcon([['path', { d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' }], ['path', { d: 'M14 2v4a2 2 0 0 0 2 2h4' }], ['path', { d: 'M10 9H8' }], ['path', { d: 'M16 13H8' }], ['path', { d: 'M16 17H8' }]])({ displayName: 'FileText' });
const SettingsIcon = createIcon([['path', { d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' }], ['circle', { cx: '12', cy: '12', r: '3' }]])({ displayName: 'Settings' });
const LogOutIcon = createIcon([['path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }], ['polyline', { points: '16 17 21 12 16 7' }], ['line', { x1: '21', x2: '9', y1: '12', y2: '12' }]])({ displayName: 'LogOut' });
const PlusCircleIcon = createIcon([['circle', { cx: '12', cy: '12', r: '10' }], ['line', { x1: '12', x2: '12', y1: '8', y2: '16' }], ['line', { x1: '8', x2: '16', y1: '12', y2: '12' }]])({ displayName: 'PlusCircle' });
const MoreVertical = createIcon([['circle', { cx: '12', cy: '12', r: '1' }], ['circle', { cx: '12', cy: '5', r: '1' }], ['circle', { cx: '12', cy: '19', r: '1' }]])({ displayName: 'MoreVertical' });
const Edit = createIcon([['path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }], ['path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' }]])({ displayName: 'Edit' });
const Trash2 = createIcon([['path', { d: 'M3 6h18' }], ['path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }], ['line', { x1: '10', y1: '11', x2: '10', y2: '17' }], ['line', { x1: '14', y1: '11', x2: '14', y2: '17' }]])({ displayName: 'Trash2' });
const Eye = createIcon([['path', { d: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' }], ['circle', { cx: '12', cy: '12', r: '3' }]])({ displayName: 'Eye' });
const Search = createIcon([['circle', { cx: '11', cy: '11', r: '8' }], ['path', { d: 'm21 21-4.3-4.3' }]])({ displayName: 'Search' });
const Share2 = createIcon([['circle', { cx: '18', cy: '5', r: '3' }], ['circle', { cx: '6', cy: '12', r: '3' }], ['circle', { cx: '18', cy: '19', r: '3' }], ['line', { x1: '8.59', y1: '13.51', x2: '15.42', y2: '17.49' }], ['line', { x1: '15.41', y1: '6.51', x2: '8.59', y2: '10.49' }]])({ displayName: 'Share2' });
const Users = createIcon([['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }], ['circle', { cx: '9', cy: '7', r: '4' }], ['path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87' }], ['path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' }]])({ displayName: 'Users' });

const NewFormSchema = Yup.object().shape({
    title: Yup.string().min(3, 'Title is too short').required('Form title is required'),
});

export default function MyFormsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [forms, setForms] = useState<Form[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchForms = async () => {
        if (!user) return;
        setDataLoading(true);
        const token = await user.getIdToken();
        const headers = { 'Authorization': `Bearer ${token}` };
        try {
            const res = await fetch('/api/forms', { headers });
            if (!res.ok) throw new Error('Failed to fetch forms');
            const data = await res.json();
            setForms(data);
        } catch (error) {
            console.error("Error fetching forms:", error);
        } finally {
            setDataLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchForms();
        }
    }, [user]);

    const filteredForms = useMemo(() => {
        return forms.filter(form =>
            form.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [forms, searchTerm]);

    const handleDeleteForm = (formId: string) => {
        console.log("Deleting form:", formId);
        setForms(forms.filter(form => form.id !== formId));
        setShowDeleteModal(null);
    };

    const handleCreateForm = async (values: { title: string }, { setSubmitting, setStatus }: FormikHelpers<{ title: string }>) => {
        if (!user) return;
        const token = await user.getIdToken();
        try {
            const res = await fetch('/api/forms', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: values.title }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create form');
            }
            const newForm = await res.json();
            setShowCreateModal(false);
            router.push(`/editor/${newForm.id}`);
        } catch (error: any) {
            setStatus({ error: error.message });
        } finally {
            setSubmitting(false);
        }
    };
    
    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    if (authLoading) {
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
                    <Link href="/dashboard" className="flex items-center px-4 py-2.5 text-gray-400 hover:bg-gray-800/60 rounded-lg transition-colors">
                        <LayoutDashboardIcon className="h-5 w-5 mr-3" /> Overview
                    </Link>
                    <Link href="/forms" className="flex items-center px-4 py-2.5 text-white bg-indigo-600/30 rounded-lg">
                        <FileTextIcon className="h-5 w-5 mr-3" /> My Forms
                    </Link>
                    <Link href="/integrations" className="flex items-center px-4 py-2.5 text-gray-400 hover:bg-gray-800/60 rounded-lg transition-colors">
                        <Share2 className="h-5 w-5 mr-3" /> Integrations
                    </Link>
                    <Link href="/team" className="flex items-center px-4 py-2.5 text-gray-400 hover:bg-gray-800/60 rounded-lg transition-colors">
                        <Users className="h-5 w-5 mr-3" /> Team
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
                    <h1 className="text-2xl font-bold text-white">My Forms</h1>
                    <button onClick={() => setShowCreateModal(true)} className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:bg-indigo-500 transition-all duration-300">
                        <PlusCircleIcon size={20} /> Create Form
                    </button>
                </header>

                <main className="flex-1 p-6 lg:p-8">
                    <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                            <div className="relative w-full sm:max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search forms..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-gray-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10 text-xs text-gray-400 uppercase">
                                        <th className="py-3 pr-3">Form Title</th>
                                        <th className="py-3 px-3">Submissions</th>
                                        <th className="py-3 px-3">Status</th>
                                        <th className="py-3 px-3">Created At</th>
                                        <th className="py-3 pl-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataLoading ? (
                                        <tr><td colSpan={5} className="text-center py-8"><QuickFormLoader /></td></tr>
                                    ) : filteredForms.length > 0 ? filteredForms.map((form) => (
                                        <tr key={form.id} className="border-b border-white/5 hover:bg-gray-800/40">
                                            <td className="py-4 pr-3 font-semibold text-white">{form.title}</td>
                                            <td className="py-4 px-3 text-gray-300">{form.submissions}</td>
                                            <td className="py-4 px-3">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${form.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-600/30 text-gray-400'}`}>
                                                    {form.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-3 text-gray-400">{form.createdAt}</td>
                                            <td className="py-4 pl-3 text-right">
                                                <div className="relative inline-block group">
                                                    <button className="p-2 rounded-md hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                                        <MoreVertical size={20} />
                                                    </button>
                                                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-white/10 rounded-lg shadow-lg z-50 hidden group-focus-within:block">
                                                        <Link href={`/editor/${form.id}`} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/80"><Edit size={16}/> Edit Form</Link>
                                                        <Link href={`/forms/${form.id}/submissions`} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/80"><Eye size={16}/> View Submissions</Link>
                                                        <button onClick={() => setShowDeleteModal(form.id)} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20"><Trash2 size={16}/> Delete Form</button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={5} className="text-center py-8 text-gray-400">No forms found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-2xl p-8 max-w-sm w-full border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-2">Create a New Form</h3>
                        <p className="text-gray-400 mb-6">Give your new form a title to get started.</p>
                        <Formik
                            initialValues={{ title: '' }}
                            validationSchema={NewFormSchema}
                            onSubmit={handleCreateForm}
                        >
                            {({ isSubmitting, status }) => (
                                <FormikForm>
                                    <Field
                                        type="text"
                                        name="title"
                                        placeholder="e.g., Customer Feedback Survey"
                                        className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <ErrorMessage name="title" component="p" className="text-red-500 text-sm mt-1" />
                                    {status && status.error && <p className="text-red-500 text-sm mt-1">{status.error}</p>}
                                    <div className="flex justify-end gap-4 mt-6">
                                        <button type="button" onClick={() => setShowCreateModal(false)} className="bg-gray-700/80 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600/80">Cancel</button>
                                        <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-500 disabled:bg-indigo-400">
                                            {isSubmitting ? 'Creating...' : 'Create Form'}
                                        </button>
                                    </div>
                                </FormikForm>
                            )}
                        </Formik>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-2xl p-8 max-w-sm w-full border border-white/10">
                        <h3 className="text-xl font-bold text-white">Delete Form</h3>
                        <p className="text-gray-400 mt-2 mb-6">Are you sure you want to delete this form? This action cannot be undone.</p>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setShowDeleteModal(null)} className="bg-gray-700/80 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600/80">Cancel</button>
                            <button onClick={() => handleDeleteForm(showDeleteModal!)} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-500">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
