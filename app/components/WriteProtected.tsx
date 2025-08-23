'use client';

import { useAuth } from './AuthProvider';

interface WriteProtectedProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const WriteProtected: React.FC<WriteProtectedProps> = ({ children, fallback = null }) => {
  const { hasWriteAccess } = useAuth();
  
  return hasWriteAccess ? <>{children}</> : <>{fallback}</>;
};

export default WriteProtected;
