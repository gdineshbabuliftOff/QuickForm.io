import React, { FC, ReactNode } from 'react';
import { AnimatedShowcase } from '../videos/AuthLayoutVideo';

interface AuthLayoutProps {
    children: ReactNode;
}

export const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans flex items-center justify-center p-4">
            <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto shadow-2xl rounded-2xl overflow-hidden">
                <div className="w-full md:w-1/2 bg-gray-900 p-8 flex flex-col justify-center items-center relative">
                    <div className="absolute top-8 left-8 text-white font-bold text-2xl z-10">
                        quickform.io
                    </div>
                    
                    <AnimatedShowcase />

                    <p className="text-gray-400 mt-6 text-center text-lg">The future of forms is here. Build, analyze, and customize.</p>
                </div>

                <div className="w-full md:w-1/2 bg-white p-8 md:p-12 flex flex-col justify-center">
                    {children}
                </div>
            </div>
        </div>
    );
};