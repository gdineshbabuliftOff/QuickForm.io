"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import Cookies from 'js-cookie';
import { auth } from '@/lib/firebase';
import { getUserDocument } from '@/lib/db';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  const router = useRouter();
  const currentPathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const token = Cookies.get('firebaseIdToken');
        if (!token) {
            firebaseUser.getIdToken().then(newToken => {
                Cookies.set('firebaseIdToken', newToken, { expires: 1 });
            });
        }
        const userDoc = await getUserDocument(firebaseUser.uid);
        setIsPremium(userDoc?.isPremium || false);
      } else {
        setUser(null);
        setIsPremium(null);
        Cookies.remove('firebaseIdToken');
        localStorage.removeItem('userDetails');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading || currentPathname === null) return;

    const publicRoutes = ['/', '/pricing', '/contact', '/about', '/solutions', '/resources', '/integrations', '/docs', '/privacy', '/terms'];
    const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];

    const isPublicRoute = publicRoutes.includes(currentPathname);
    const isAuthRoute = authRoutes.includes(currentPathname);

    if (!user) {
      if (!isPublicRoute && !isAuthRoute) {
        router.push('/login');
      }
    }
    else {
      if (isAuthRoute) {
        router.push('/dashboard');
      }
    }

  }, [user, loading, currentPathname, router]);

  return { user, loading, isPremium };
};
