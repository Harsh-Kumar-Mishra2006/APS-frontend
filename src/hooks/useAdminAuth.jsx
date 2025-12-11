// src/hooks/useAdminAuth.js
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const useAdminAuth = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      setHasAccess(true);
    } else {
      setHasAccess(false);
    }
    setLoading(false);
  }, [isAuthenticated, isAdmin]);

  return { hasAccess, loading, user };
};