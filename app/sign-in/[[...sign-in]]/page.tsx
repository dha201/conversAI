'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import CustomSignIn from '@/components/signIn';

export default function Page(): JSX.Element | null {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard');
    }
  }, [isSignedIn, router]);

  if (isSignedIn) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex min-h-screen items-center justify-center gap-12">
      <CustomSignIn />
    </div>
  );
}
