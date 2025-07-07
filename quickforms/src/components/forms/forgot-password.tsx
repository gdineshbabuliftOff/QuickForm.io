"use client";

import React, { useState } from 'react';
import { AuthLayout } from './AuthLayout';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '@/lib/firebase';

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const ForgotPasswordPage = () => {
    const router = useRouter();
    const [apiError, setApiError] = useState<string>('');
    const [apiSuccess, setApiSuccess] = useState<string>('');

    const navigateTo = (path: string) => {
        router.push(path);
    };

    return (
        <AuthLayout>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Forgot Your Password?</h2>
            <p className="text-gray-600 mb-6">No problem. Enter your email address below and we&apos;ll send you a link to reset it.</p>

            {apiError && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">{apiError}</p>}
            {apiSuccess && <p className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-center">{apiSuccess}</p>}

            <Formik
                initialValues={{ email: '' }}
                validationSchema={ForgotPasswordSchema}
                onSubmit={async (values, { setSubmitting }) => {
                    setApiError('');
                    setApiSuccess('');
                    try {
                        await sendPasswordResetEmail(auth, values.email);
                        setApiSuccess('Password reset link sent! Please check your email.');
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
                        <button type="submit" disabled={isSubmitting} className="w-full cursor-pointer bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-300 mt-6">
                            {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
                        </button>
                    </Form>
                )}
            </Formik>

            <p className="text-center text-gray-600 mt-6">
                Remembered your password? <button onClick={() => navigateTo('/login')} className="text-indigo-600 hover:underline font-medium cursor-pointer">Log In</button>
            </p>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
