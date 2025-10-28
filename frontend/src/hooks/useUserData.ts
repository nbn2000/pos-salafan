import { useEffect, useState } from 'react';
import { useLazyGetUserDataQuery } from '@/api/auth';
import { useAppSelector } from '@/store/hooks';
import { IUserData } from '@/api/auth/type';

const USER_DATA_KEY = 'pos_user_data';
const USER_DATA_TIMESTAMP_KEY = 'pos_user_data_timestamp';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export const useUserData = () => {
  const token = useAppSelector((state) => state.auth.token);
  const [userTrigger, { data: apiUserData, isLoading, error }] = useLazyGetUserDataQuery();
  const [userData, setUserData] = useState<IUserData | null>(null);

  // Function to get cached user data
  const getCachedUserData = (): IUserData | null => {
    try {
      const cachedData = localStorage.getItem(USER_DATA_KEY);
      const cachedTimestamp = localStorage.getItem(USER_DATA_TIMESTAMP_KEY);
      
      if (!cachedData || !cachedTimestamp) {
        return null;
      }

      const timestamp = parseInt(cachedTimestamp, 10);
      const now = Date.now();
      
      // Check if cache is still valid (within 30 minutes)
      if (now - timestamp > CACHE_DURATION) {
        // Cache expired, remove it
        localStorage.removeItem(USER_DATA_KEY);
        localStorage.removeItem(USER_DATA_TIMESTAMP_KEY);
        return null;
      }

      return JSON.parse(cachedData) as IUserData;
    } catch (error) {
      console.error('Error reading cached user data:', error);
      // Clear corrupted cache
      localStorage.removeItem(USER_DATA_KEY);
      localStorage.removeItem(USER_DATA_TIMESTAMP_KEY);
      return null;
    }
  };

  // Function to cache user data
  const cacheUserData = (data: IUserData) => {
    try {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
      localStorage.setItem(USER_DATA_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error caching user data:', error);
    }
  };

  // Function to clear cached user data
  const clearCachedUserData = () => {
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(USER_DATA_TIMESTAMP_KEY);
  };

  // Function to refresh user data (force API call)
  const refreshUserData = () => {
    if (token) {
      clearCachedUserData();
      userTrigger();
    }
  };

  useEffect(() => {
    if (!token) {
      // No token, clear cache and user data
      clearCachedUserData();
      setUserData(null);
      return;
    }

    // Check for cached data first
    const cachedData = getCachedUserData();
    
    if (cachedData) {
      // Use cached data
      setUserData(cachedData);
    } else {
      // No valid cache, fetch from API
      userTrigger();
    }
  }, [token, userTrigger]);

  // Update state and cache when API data is received
  useEffect(() => {
    if (apiUserData) {
      setUserData(apiUserData);
      cacheUserData(apiUserData);
    }
  }, [apiUserData]);

  // Clear cache when user logs out (token is removed)
  useEffect(() => {
    if (!token) {
      clearCachedUserData();
    }
  }, [token]);

  return {
    userData,
    isLoading,
    error,
    refreshUserData,
    clearCachedUserData,
  };
};
