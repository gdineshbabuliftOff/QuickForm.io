'use client';

import LoginPage from '@/components/forms/login';
import QuickFormLoader from '@/components/loaders/quickFormloader';
import { useAuth } from '@/hooks/useAuth';
import React from 'react'

const SignUp = () => {

  const { loading } = useAuth();

  if (loading) {
    return <QuickFormLoader />;
  }
  
  return (
    <LoginPage />
  )
}

export default SignUp
