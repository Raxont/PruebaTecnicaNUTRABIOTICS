'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getAccessToken, clearAuthState } from '@/lib/auth';
import type { UserRole } from '@/lib/types';

interface ProtectedPageProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedPage({ children, allowedRoles }: ProtectedPageProps) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    const user = getCurrentUser();

    if (!token || !user) {
      clearAuthState();
      router.replace('/login');
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
      clearAuthState();
      router.replace('/login');
      return;
    }

    setChecked(true);
  }, [allowedRoles, router]);

  if (!checked) {
    return <div className="main-shell">Cargando ...</div>;
  }

  return <>{children}</>;
}
