'use client';

import ForgotPasswordPage from '@/components/forms/forgot-password'
import QuickFormLoader from '@/components/loaders/quickFormloader';
import { useAuth } from '@/hooks/useAuth';
import React from 'react'

const ForgotPassword = () => {
    const { loading } = useAuth();

  if (loading) {
    return <QuickFormLoader />;
  }
  
  return (
   <ForgotPasswordPage />
  )
}

export default ForgotPassword
