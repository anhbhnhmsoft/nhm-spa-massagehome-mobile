import { ReactNode, useEffect } from 'react';
import { Href, Redirect, useRouter } from 'expo-router';
import useAuthStore from '@/features/auth/store';
import { _AuthStatus, _UserRole } from '@/features/auth/utils';

type GateCase =
  | 'public'
  | 'for_customer'
  | 'for_agency'
  | 'for_technical'
  | 'initial_app';

type Props = {
  children: ReactNode;
  redirectTo: Href;
  mode?: 'redirect' | 'push' | 'replace';
  gateCases: GateCase[];
};

export const AuthGate = ({ children, redirectTo, mode = 'redirect', gateCases }: Props) => {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  // 1. Kiểm tra quyền truy cập
  const allow = gateCases.some((gate) => {
    switch (gate) {
      case 'public':
        return true;
      case 'initial_app':
        return [_AuthStatus.HYDRATED, _AuthStatus.INIT].includes(status);
      case 'for_customer':
        return status === _AuthStatus.AUTHORIZED && user?.role === _UserRole.CUSTOMER;
      case 'for_agency':
        return status === _AuthStatus.AUTHORIZED && user?.role === _UserRole.AGENCY;
      case 'for_technical':
        return status === _AuthStatus.AUTHORIZED && user?.role === _UserRole.KTV;
      default:
        return false;
    }
  });
  // 2. Xử lý logic chuyển trang dùng Hook (nếu không dùng Redirect)
  useEffect(() => {
    if (!allow) {
      if (mode === 'push') {
        router.push(redirectTo);
      } else if (mode === 'replace') {
        router.replace(redirectTo);
      }
    }
  }, [allow, mode, redirectTo, router]);

  if (!allow) {
    if (mode === 'redirect') {
      return <Redirect href={redirectTo} />;
    }
    return null;
  }
  return <>{children}</>;
};