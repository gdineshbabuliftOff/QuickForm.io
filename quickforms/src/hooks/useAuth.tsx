"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import Cookies from 'js-cookie';
import { auth } from '@/lib/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        const token = Cookies.get('firebaseIdToken');
        if (!token) {
            user.getIdToken().then(newToken => {
                Cookies.set('firebaseIdToken', newToken, { expires: 1 });
            });
        }
      } else {
        setUser(null);
        Cookies.remove('firebaseIdToken');
        localStorage.removeItem('userDetails');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;
    const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password' || pathname === '/reset-password';
    
    if (!user && !isAuthPage) {
      router.push('/login');
    }

    if (user && isAuthPage) {
      router.push('/dashboard');
    }

  }, [user, loading, pathname, router]);

  return { user, loading };
};