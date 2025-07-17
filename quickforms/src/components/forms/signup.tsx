"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, User } from "firebase/auth";
import Cookies from 'js-cookie';
import { auth } from '@/lib/firebase';
import { updateUserDocument, getUserDocument } from '@/lib/db';
import { AuthLayout } from './AuthLayout';
import RedirectModal from '../modals/PricingModal';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

const LoginPage = () => {
    const router = useRouter();
    const [apiError, setApiError] = useState<string>('');
    const [showRedirectModal, setShowRedirectModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', buttonText: '', redirectPath: '' });

    const navigateTo = (path: string) => {
        router.push(path);
    };

    const handleSuccessfulSignIn = async (user: User) => {
        const token = await user.getIdToken();
        const userDetails = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
        };

        localStorage.setItem('userDetails', JSON.stringify(userDetails));
        Cookies.set('firebaseIdToken', token, { expires: 1 });

        // Fetch user document to check premium status
        const userDoc = await getUserDocument(user.uid);
        const isPremium = userDoc?.isPremium || false; // Default to false if not set

        if (isPremium) {
            setModalContent({
                title: 'Welcome Back!',
                message: 'You are a premium user. Redirecting to your dashboard.',
                buttonText: 'Go to Dashboard',
                redirectPath: '/dashboard'
            });
        } else {
            setModalContent({
                title: 'Welcome!',
                message: 'You are currently on the free plan. Upgrade to unlock more features!',
                buttonText: 'View Pricing Plans',
                redirectPath: '/pricing'
            });
        }
        setShowRedirectModal(true);
    };

    const handleModalRedirect = () => {
        router.push(modalContent.redirectPath);
    };

    const handleGoogleSignIn = async () => {
        setApiError('');
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Use the reusable function to update the user document
            await updateUserDocument(user); // This will fetch/create and update if necessary

            await handleSuccessfulSignIn(user);
        } catch (error: any) {
            console.error("Google Sign-In Error:", error);
            setApiError(error.message || 'Failed to sign in with Google.');
        }
    };

    return (
        <AuthLayout>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
            <p className="text-gray-600 mb-8">Log in to continue to your dashboard.</p>

            {apiError && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">{apiError}</p>}

            <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full cursor-pointer flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition duration-300"
            >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 9.81C34.553 5.822 29.553 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
                    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039L38.804 9.81C34.553 5.822 29.553 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.245 44 30.028 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
                </svg>
                Continue with Google
            </button>

            <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={LoginSchema}
                onSubmit={async (values, { setSubmitting }) => {
                    setApiError('');
                    try {
                        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
                        const user = userCredential.user;
                        
                        // Use the reusable function here as well
                        await updateUserDocument(user); // This will fetch/create and update if necessary
                        
                        await handleSuccessfulSignIn(user);

                    } catch (err: any) {
                        setApiError(err.message);
                    }
                    setSubmitting(false);
                }}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
                            <Field type="email" name="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            <ErrorMessage name="email" component="p" className="text-red-500 text-sm mt-1" />
                        </div>
                        <div>
                            <div className="flex justify-between items-center">
                                <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password</label>
                                <button type="button" onClick={() => navigateTo('/forgot-password')} className="text-sm text-indigo-600 hover:underline font-medium cursor-pointer">Forgot Password?</button>
                            </div>
                            <Field type="password" name="password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            <ErrorMessage name="password" component="p" className="text-red-500 text-sm mt-1" />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full cursor-pointer bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-300 mt-6">
                            {isSubmitting ? 'Logging in...' : 'Log In'}
                        </button>
                    </Form>
                )}
            </Formik>

            <p className="text-center text-gray-600 mt-6">
                Don&apos;t have an account? <button onClick={() => navigateTo('/signup')} className="text-indigo-600 hover:underline font-medium cursor-pointer">Sign Up</button>
            </p>

            <RedirectModal
                isOpen={showRedirectModal}
                onClose={() => setShowRedirectModal(false)}
                title={modalContent.title}
                message={modalContent.message}
                buttonText={modalContent.buttonText}
                onButtonClick={handleModalRedirect}
            />
        </AuthLayout>
    );
};

export default LoginPage;
