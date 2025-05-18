
"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setInitialCheckDone(true);
      if (isAuthenticated && user) {
        router.replace('/chat');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !initialCheckDone) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="space-y-4 p-8 rounded-lg bg-card">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-10 w-full mt-4" />
        </div>
      </div>
    );
  }

  return null; 
}
