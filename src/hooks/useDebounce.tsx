import { useEffect, useState } from 'react';

function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
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
}

export default useDebounce;
