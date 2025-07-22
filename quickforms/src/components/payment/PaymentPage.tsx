"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@/hooks/useAuth';
import { getUserDocument } from '@/lib/db';
import { useModal } from '@/context/ModalContext';
import QuickFormLoader from '../loaders/quickFormloader';

type PaymentDetails = {
    cardBrand: string;
    cardLast4: string;
};

const PaymentSchema = Yup.object().shape({
    cardName: Yup.string().min(2, 'Name is too short').required('Cardholder name is required'),
    cardNumber: Yup.string().matches(/^[0-9\s]{19}$/, 'Card number must be 16 digits').required('Card number is required'),
    expiryDate: Yup.string().matches(/^(0[1-9]|1[0-2])\s\/\s\d{2}$/, 'Expiry date must be in MM / YY format').required('Expiry date is required'),
    cvc: Yup.string().matches(/^[0-9]{3,4}$/, 'CVC must be 3 or 4 digits').required('CVC is required'),
});

const CancelSchema = Yup.object().shape({
    reason: Yup.string().min(10, 'Please provide a more detailed reason.').required('A reason is required.'),
});

const PaymentPage = () => {
    const router = useRouter();
    const { user, loading } = useAuth();
    const { showModal } = useModal();
    const [apiError, setApiError] = useState('');
    const [existingPayment, setExistingPayment] = useState<PaymentDetails | null>(null);
    const [showNewCardForm, setShowNewCardForm] = useState(false);
    const [isCancelModalOpen, setCancelModalOpen] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                const userDoc = await getUserDocument(user.uid);
                if (userDoc?.paymentDetails) {
                    setExistingPayment(userDoc.paymentDetails);
                } else {
                    setShowNewCardForm(true);
                }
            }
        };
        fetchUserData();
    }, [user]);

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);
    const formattedTrialEndDate = trialEndDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    if (loading) return <QuickFormLoader />;
    if (!user) {
        router.push('/login');
        return null;
    }

    const callApi = async (endpoint: string, body: object) => {
        const token = await user.getIdToken();
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'An unknown error occurred.');
        }
        return response.json();
    };

    const handleUseExistingCard = async () => {
        if (!existingPayment) {
            setApiError("No existing payment method found.");
            return;
        }
        setApiError('');
        try {
            await callApi('/api/upgrade-to-pro', {
                cardLast4: existingPayment.cardLast4,
                cardBrand: existingPayment.cardBrand,
            });
            showModal({ title: 'Payment Successful! 🎉', message: 'Welcome to QuickForm Pro! Your trial has started.', onCloseRedirectPath: '/dashboard' });
        } catch (error: any) {
            setApiError(error.message);
        }
    };

    const formatCardNumber = (value: string) => {
        return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
    };

    const formatExpiryDate = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length > 2) {
            return `${cleaned.slice(0, 2)} / ${cleaned.slice(2, 4)}`;
        }
        return cleaned;
    };

    return (
        <>
            <div className="min-h-screen bg-gray-900 font-sans text-gray-200">
                <header className="bg-black/50 backdrop-blur-lg">
                    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                        <Link href="/" className="text-2xl font-bold text-white transition-opacity hover:opacity-80">
                            QuickForm<span className="text-indigo-500">.io</span>
                        </Link>
                    </div>
                </header>

                <main className="container mx-auto px-6 py-12 md:py-20">
                    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start">
                        <div className="bg-gray-800/50 p-8 rounded-2xl">
                            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                    <p className="text-gray-300">QuickForm Pro Trial</p>
                                    <p className="font-semibold text-white">$0.00</p>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2">
                                    <p className="text-white">Due Today</p>
                                    <p className="text-white">$0.00</p>
                                </div>
                            </div>
                            <div className="mt-8 p-4 bg-indigo-900/30 rounded-lg text-indigo-200 text-sm">
                                <p>You will be charged <span className="font-bold text-white">$19.00/month</span> after your trial ends on <span className="font-bold text-white">{formattedTrialEndDate}</span>.</p>
                                <button onClick={() => setCancelModalOpen(true)} className="text-indigo-300 hover:text-white font-semibold mt-2 text-sm cursor-pointer">Request to cancel before trial ends?</button>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 p-8 rounded-2xl">
                            <h2 className="text-2xl font-bold text-white mb-6">Payment Details</h2>
                            {apiError && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">{apiError}</p>}

                            {existingPayment && !showNewCardForm ? (
                                <div className="space-y-4">
                                    <div className="p-4 border border-gray-700 rounded-lg">
                                        <p className="font-semibold text-white">{existingPayment.cardBrand} ending in {existingPayment.cardLast4}</p>
                                        <p className="text-sm text-gray-400">Use your saved card for a faster checkout.</p>
                                    </div>
                                    <button onClick={handleUseExistingCard} className="w-full cursor-pointer bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700">Use This Card</button>
                                    <button onClick={() => setShowNewCardForm(true)} className="w-full text-center text-indigo-400 hover:underline">Use a Different Card</button>
                                </div>
                            ) : (
                                <Formik
                                    initialValues={{ cardName: '', cardNumber: '', expiryDate: '', cvc: '' }}
                                    validationSchema={PaymentSchema}
                                    onSubmit={async (values, { setSubmitting }) => {
                                        setApiError('');
                                        try {
                                            await callApi('/api/upgrade-to-pro', {
                                                cardLast4: values.cardNumber.replace(/\s/g, '').slice(-4),
                                                cardBrand: 'Card',
                                            });
                                            showModal({ title: 'Payment Successful! 🎉', message: 'Welcome to QuickForm Pro! Your trial has started.', onCloseRedirectPath: '/dashboard' });
                                        } catch (error: any) {
                                            setApiError(error.message);
                                        }
                                        setSubmitting(false);
                                    }}
                                >
                                    {({ isSubmitting, setFieldValue }) => (
                                        <Form className="space-y-5">
                                            <div>
                                                <label htmlFor="cardName" className="block text-sm font-medium text-gray-300 mb-2">Cardholder Name</label>
                                                <Field id="cardName" type="text" name="cardName" autoComplete="cc-name" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white" />
                                                <ErrorMessage name="cardName" component="p" className="text-red-400 text-sm mt-1" />
                                            </div>
                                            <div>
                                                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-300 mb-2">Card Number</label>
                                                <Field
                                                    id="cardNumber"
                                                    type="text"
                                                    name="cardNumber"
                                                    autoComplete="cc-number"
                                                    maxLength="19"
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        const formatted = formatCardNumber(e.target.value);
                                                        setFieldValue('cardNumber', formatted);
                                                    }}
                                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                                                />
                                                <ErrorMessage name="cardNumber" component="p" className="text-red-400 text-sm mt-1" />
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-300 mb-2">Expiry Date</label>
                                                    <Field
                                                        id="expiryDate"
                                                        type="text"
                                                        name="expiryDate"
                                                        autoComplete="cc-exp"
                                                        maxLength="7"
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                            const formatted = formatExpiryDate(e.target.value);
                                                            setFieldValue('expiryDate', formatted);
                                                        }}
                                                        placeholder="MM / YY"
                                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                                                    />
                                                    <ErrorMessage name="expiryDate" component="p" className="text-red-400 text-sm mt-1" />
                                                </div>
                                                <div className="flex-1">
                                                    <label htmlFor="cvc" className="block text-sm font-medium text-gray-300 mb-2">CVC</label>
                                                    <Field id="cvc" type="text" name="cvc" autoComplete="cc-csc" maxLength="4" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white" />
                                                    <ErrorMessage name="cvc" component="p" className="text-red-400 text-sm mt-1" />
                                                </div>
                                            </div>
                                            <div className="pt-4 space-y-3">
                                                <button type="submit" disabled={isSubmitting} className="w-full cursor-pointer bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-400">
                                                    {isSubmitting ? 'Processing...' : 'Start My 14-Day Free Trial'}
                                                </button>
                                                <button type="button" onClick={() => router.push('/dashboard')} disabled={isSubmitting} className="w-full cursor-pointer bg-transparent border border-gray-600 text-gray-300 font-medium py-3 px-4 rounded-lg hover:bg-gray-700 transition">
                                                    Cancel and Continue as Free
                                                </button>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {isCancelModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md m-4">
                        <h2 className="text-2xl font-bold text-white mb-4">Request Cancellation</h2>
                        <p className="text-gray-400 mb-6">Please let us know why you&apos;re canceling. Your feedback is valuable. An admin will review your request within 24 hours.</p>
                        <Formik
                            initialValues={{ reason: '' }}
                            validationSchema={CancelSchema}
                            onSubmit={async (values, { setSubmitting, resetForm }) => {
                                try {
                                    await callApi('/api/request-cancellation', { reason: values.reason });
                                    resetForm();
                                    setCancelModalOpen(false);
                                    showModal({ title: 'Request Submitted', message: 'Your cancellation request has been sent for review.' });
                                } catch (error: any) {
                                    alert(error.message);
                                }
                                setSubmitting(false);
                            }}
                        >
                            {({ isSubmitting }) => (
                                <Form>
                                    <Field as="textarea" name="reason" rows="4" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white" placeholder="Reason for cancellation..." />
                                    <ErrorMessage name="reason" component="p" className="text-red-400 text-sm mt-1" />
                                    <div className="flex justify-end gap-4 mt-6">
                                        <button type="button" onClick={() => setCancelModalOpen(false)} disabled={isSubmitting} className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold">Close</button>
                                        <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:bg-indigo-400">{isSubmitting ? 'Submitting...' : 'Submit Request'}</button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            )}
        </>
    );
};

export default PaymentPage;
