import { useEffect, useState } from 'react';

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState<string | null>(value);
  const [debounceLoading, setDebounceLoading] = useState<boolean>(false);

  useEffect(() => {
    setDebounceLoading(true);
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setDebounceLoading(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return { debouncedValue, debounceLoading };
};

export default useDebounce