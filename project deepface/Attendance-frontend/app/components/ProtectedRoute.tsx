import React, { useContext } from 'react';
import { ActivityIndicator } from 'react-native';
import { AuthContext } from '../contexts/authContext';
import { useRouter } from 'expo-router';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading]);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return user ? <>{children}</> : null;
};

export default ProtectedRoute;