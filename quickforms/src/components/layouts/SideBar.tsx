"use client";

import React, { FC, JSX } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

// --- Type Definitions ---
interface IconProps {
  color?: string;
  size?: number | string;
  strokeWidth?: number | string;
  className?: string;
}
type IconPathTuple = [keyof JSX.IntrinsicElements, { [key: string]: any }];

// --- Reusable Icon Creator ---
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

// --- Icon Definitions ---
const LayoutDashboardIcon = createIcon([['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }], ['line', { x1: '3', x2: '21', y1: '9', y2: '9' }], ['line', { x1: '9', x2: '9', y1: '21', y2: '9' }]])({ displayName: 'LayoutDashboard' });
const FileTextIcon = createIcon([['path', { d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' }], ['path', { d: 'M14 2v4a2 2 0 0 0 2 2h4' }], ['path', { d: 'M10 9H8' }], ['path', { d: 'M16 13H8' }], ['path', { d: 'M16 17H8' }]])({ displayName: 'FileText' });
const SettingsIcon = createIcon([['path', { d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' }], ['circle', { cx: '12', cy: '12', r: '3' }]])({ displayName: 'Settings' });
const LogOutIcon = createIcon([['path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }], ['polyline', { points: '16 17 21 12 16 7' }], ['line', { x1: '21', x2: '9', y1: '12', y2: '12' }]])({ displayName: 'LogOut' });
const CopyIcon = createIcon([['rect', { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }], ['path', { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }]])({ displayName: 'Copy' });
const PlugZapIcon = createIcon([['path', { d: "M12 22v-3" }], ['path', { d: "M9 17v-3" }], ['path', { d: "M15 17v-3" }], ['path', { d: "M14 8.5V6a4 4 0 0 0-8 0v2.5" }], ['path', { d: "M18 10.5V6a4 4 0 0 0-8 0v4.5" }], ['path', { d: "m 8 14 1.5 2.5 3 0 1.5-2.5-1.5-2.5-3 0 z" }]])({ displayName: 'PlugZap' });
const UserCircle2Icon = createIcon([['circle', { cx: "12", cy: "12", r: "10" }], ['circle', { cx: "12", cy: "10", r: "3" }], ['path', { d: "M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" }]])({ displayName: 'UserCircle2' });

interface NavLinkProps {
    href: string;
    icon: FC<IconProps>;
    children: React.ReactNode;
}

const NavLink: FC<NavLinkProps> = ({ href, icon: Icon, children }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={`flex items-center px-4 py-2.5 rounded-lg transition-colors ${
                isActive
                    ? 'text-white bg-indigo-600/30'
                    : 'text-gray-400 hover:bg-gray-800/60'
            }`}
        >
            <Icon className="h-5 w-5 mr-3" />
            {children}
        </Link>
    );
};

interface SidebarProps {
    sidebarOpen: boolean;
}

const Sidebar: FC<SidebarProps> = ({ sidebarOpen }) => {
    const router = useRouter();
    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    return (
        <aside className={`bg-gray-900/70 backdrop-blur-lg border-r border-white/10 w-64 flex-shrink-0 fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-40 flex flex-col`}>
            <div className="flex items-center justify-center h-20 border-b border-white/10 flex-shrink-0">
                <Link href="/" className="text-2xl font-bold text-white">
                    QuickForm<span className="text-indigo-500">.io</span>
                </Link>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                <NavLink href="/dashboard" icon={LayoutDashboardIcon}>Overview</NavLink>
                <NavLink href="/forms" icon={FileTextIcon}>My Forms</NavLink>
                <NavLink href="/templates" icon={CopyIcon}>Templates</NavLink>
                <NavLink href="/integrations" icon={PlugZapIcon}>Integrations</NavLink>
                <NavLink href="/account" icon={UserCircle2Icon}>Account</NavLink>
                <NavLink href="/settings" icon={SettingsIcon}>Settings</NavLink>
            </nav>
            <div className="p-4 border-t border-white/10 flex-shrink-0">
                <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-gray-400 hover:bg-red-600/20 hover:text-red-400 rounded-lg transition-colors">
                    <LogOutIcon className="h-5 w-5 mr-3" /> Log Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
