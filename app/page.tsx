'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function Home() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
    }
  }, [isSignedIn, router]);

  if (!isSignedIn) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex min-h-screen items-center justify-center gap-12">
      If you are seeing this page rendered, THERE IS SOMETHING WRONG!
    </div>
  );
}
