"use client";

import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { auth, db, storage } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import QuickFormLoader from '../loaders/quickFormloader';
import DashboardLayout from '../layouts/DashBoardLayout';

const ProfileSchema = Yup.object().shape({
    displayName: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Name is required'),
});

const SettingsPage = () => {
    const { user, loading } = useAuth();
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

            await updateProfile(user, { photoURL });

            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { photoURL });
            
            setApiSuccess('Profile image updated successfully!');
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

    const headerContent = (
        <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        </div>
    );

    return (
        <DashboardLayout headerContent={headerContent}>
            <div className="p-6 lg:p-8">
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
                                    await updateProfile(user, { displayName: values.displayName });
                                    
                                    const userDocRef = doc(db, 'users', user.uid);
                                    await updateDoc(userDocRef, { name: values.displayName, displayName: values.displayName });

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
            </div>
        </DashboardLayout>
    );
}

export default SettingsPage;
