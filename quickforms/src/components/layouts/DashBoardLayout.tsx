"use client";

import React, { useState, FC, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import QuickFormLoader from '../loaders/quickFormloader';
import Sidebar from './SideBar';

interface DashboardLayoutProps {
    children: ReactNode;
    headerContent?: ReactNode;
}

const DashboardLayout: FC<DashboardLayoutProps> = ({ children, headerContent }) => {
    const { user, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (loading) {
        return <QuickFormLoader />;
    }

    return (
        <div className="h-screen bg-gray-900 text-gray-200 font-sans flex overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-gray-900/70 backdrop-blur-lg border-b border-white/10 h-20 flex items-center justify-between px-6 flex-shrink-0">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    </button>
                    
                    {headerContent}

                    <div className="flex items-center space-x-4 ml-auto">
                        <img src={user?.photoURL || `https://i.pravatar.cc/150?u=${user?.uid}`} alt="User avatar" width={40} height={40} className="rounded-full" />
                    </div>
                </header>
                
                <main className="flex-1 overflow-y-auto bg-gray-900/95 animated-aurora-bg">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
