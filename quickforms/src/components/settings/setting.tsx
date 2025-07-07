"use client";

import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { auth, db, storage } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileTextIcon, LayoutDashboardIcon, SettingsIcon } from '../dashboard/dashboard';
import QuickFormLoader from '../loaders/quickFormloader';

const ProfileSchema = Yup.object().shape({
    displayName: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Name is required'),
});

const SettingsPage =() => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [apiError, setApiError] = useState('');
    const [apiSuccess, setApiSuccess] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);
        setApiError('');
        setApiSuccess('');

        const storageRef = ref(storage, `avatars/${user.uid}`);
        
        try {
            await uploadBytes(storageRef, file);
            const photoURL = await getDownloadURL(storageRef);

            // Update Firebase Auth profile
            await updateProfile(user, { photoURL });

            // Update Firestore document
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { photoURL });
            
            setApiSuccess('Profile image updated successfully!');
            // Force a reload of the user to get the latest photoURL
            await user.reload(); 
        } catch (error: any) {
            setApiError(error.message);
        } finally {
            setIsUploading(false);
        }
    };

    if (loading) {
        return <QuickFormLoader />;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex">
            {/* Sidebar (reused from dashboard) */}
            <aside className="bg-gray-900/70 backdrop-blur-lg border-r border-white/10 w-64 hidden md:block">
                 <div className="flex items-center justify-center h-20 border-b border-white/10">
                    <Link href="/" className="text-2xl font-bold text-white">
                        QuickForm<span className="text-indigo-500">.io</span>
                    </Link>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <Link href="/dashboard" className="flex items-center px-4 py-2.5 text-gray-400 hover:bg-gray-800/60 rounded-lg transition-colors">
                        <LayoutDashboardIcon className="h-5 w-5 mr-3" /> Overview
                    </Link>
                    <Link href="/forms" className="flex items-center px-4 py-2.5 text-gray-400 hover:bg-gray-800/60 rounded-lg transition-colors">
                        <FileTextIcon className="h-5 w-5 mr-3" /> My Forms
                    </Link>
                    <Link href="/settings" className="flex items-center px-4 py-2.5 text-white bg-indigo-600/30 rounded-lg">
                        <SettingsIcon className="h-5 w-5 mr-3" /> Settings
                    </Link>
                </nav>
            </aside>

            <div className="flex-1 flex flex-col">
                 <header className="bg-gray-900/70 backdrop-blur-lg border-b border-white/10 h-20 flex items-center justify-between px-6 sticky top-0 z-30">
                    <h1 className="text-2xl font-bold text-white">Account Settings</h1>
                 </header>
                 <main className="flex-1 p-6 lg:p-8">
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-8">
                            <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>

                            {apiError && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">{apiError}</p>}
                            {apiSuccess && <p className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-center">{apiSuccess}</p>}
                            
                            <div className="flex items-center space-x-6 mb-8">
                                <img src={user?.photoURL || `https://i.pravatar.cc/150?u=${user?.uid}`} alt="User avatar" width={80} height={80} className="rounded-full" />
                                <div>
                                    <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-500 transition disabled:bg-indigo-400">
                                        {isUploading ? 'Uploading...' : 'Change Photo'}
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleProfileImageUpload} className="hidden" accept="image/png, image/jpeg" />
                                    <p className="text-xs text-gray-400 mt-2">JPG or PNG. 1MB max.</p>
                                </div>
                            </div>

                            <Formik
                                initialValues={{ displayName: user?.displayName || '' }}
                                validationSchema={ProfileSchema}
                                enableReinitialize
                                onSubmit={async (values, { setSubmitting }) => {
                                    if (!user) return;
                                    setApiError('');
                                    setApiSuccess('');
                                    try {
                                        // Update Firebase Auth profile
                                        await updateProfile(user, { displayName: values.displayName });
                                        
                                        // Update Firestore document
                                        const userDocRef = doc(db, 'users', user.uid);
                                        await updateDoc(userDocRef, { name: values.displayName });

                                        setApiSuccess('Profile updated successfully!');
                                    } catch (err: any) {
                                        setApiError(err.message);
                                    }
                                    setSubmitting(false);
                                }}
                            >
                                {({ isSubmitting }) => (
                                    <Form className="space-y-4">
                                        <div>
                                            <label htmlFor="displayName" className="block text-gray-400 font-medium mb-2">Full Name</label>
                                            <Field type="text" name="displayName" className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                            <ErrorMessage name="displayName" component="p" className="text-red-500 text-sm mt-1" />
                                        </div>
                                        <div className="text-right">
                                            <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-400">
                                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                 </main>
            </div>
        </div>
    );
}

export default SettingsPage;