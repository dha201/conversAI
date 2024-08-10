'use client'

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ComponentType } from 'react';

export function withAuth<P extends object>(Component: ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isSignedIn, isLoaded } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (isLoaded && !isSignedIn) {
        router.push('/sign-in');
      }
    }, [isSignedIn, isLoaded, router]);

    if (!isLoaded || !isSignedIn) {
      return null; // or a loading spinner
    }

    return <Component {...props} />;
  };
}
