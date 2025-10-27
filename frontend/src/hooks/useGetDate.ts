import { useMemo } from 'react';

export function useGetDate() {
  const { daily, yearly, monthly } = useMemo(() => {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    return { daily: day, yearly: year, monthly: month };
  }, []);

  return { daily, yearly, monthly };
}
