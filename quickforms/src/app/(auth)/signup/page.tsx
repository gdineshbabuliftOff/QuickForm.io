'use client';

import SignupPage from '@/components/forms/signup';
import QuickFormLoader from '@/components/loaders/quickFormloader';
import { useAuth } from '@/hooks/useAuth';
import React from 'react';

const SignUp = () => {
  const { loading } = useAuth();

  if (loading) {
    return <QuickFormLoader />;
  }
  return <SignupPage />;
}

export default SignUp;