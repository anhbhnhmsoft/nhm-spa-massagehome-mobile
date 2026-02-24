import { ReactNode } from 'react';
import { useHydrateAuth } from '@/features/auth/hooks';


export const AuthBootstrapProvider = ({ children }: { children: ReactNode }) => {

  // Hydrate auth khi mount component
  useHydrateAuth();

  return (
    <>
      {children}
    </>
  );
};
