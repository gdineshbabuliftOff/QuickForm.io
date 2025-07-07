import ResetPasswordPage from '@/components/forms/reset-password'
import QuickFormLoader from '@/components/loaders/quickFormloader';
import { useAuth } from '@/hooks/useAuth';
import React from 'react'

const ResetPassword = () => {
    const { loading } = useAuth();

  if (loading) {
    return <QuickFormLoader />;
  }
  
  return (
    <ResetPasswordPage />
  )
}

export default ResetPassword
