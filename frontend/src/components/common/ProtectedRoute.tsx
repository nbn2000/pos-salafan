import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '@/hooks/useUserData';
import { IUserData } from '@/api/auth/type';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresAdmin = false,
}) => {
  const navigate = useNavigate();
  const { userData, isLoading } = useUserData();

  useEffect(() => {
    if (
      !isLoading &&
      userData &&
      requiresAdmin &&
      userData.user.role !== 'ADMIN'
    ) {
      // Redirect to home if user is not admin and page requires admin access
      navigate('/', { replace: true });
    }
  }, [isLoading, userData, requiresAdmin, navigate]);

  // Show loading while checking user data
  if (isLoading || !userData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If requires admin and user is not admin, return null (redirect will happen in useEffect)
  if (requiresAdmin && userData.user.role !== 'ADMIN') {
    return null;
  }

  return <>{children}</>;
};
