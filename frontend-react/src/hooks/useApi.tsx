import { useState, useEffect } from 'react';
import { fetchFromApi, ApiParams } from '../services/apiNetlify';

// T is the type of the data you expect from the API
export function useApi<T = any>(
  endpoint: string,
  params: ApiParams = {},
  dependencies: any[] = []
) {
  const [responseData, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchFromApi<T>(endpoint, params)
      .then(result => {
        if (!cancelled) setData(result);
      })
      .catch(err => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [endpoint, JSON.stringify(params), ...dependencies]);

  return { responseData, loading, error };
}


/*
Example use with types:

import { useApi } from '../hooks/useApi';
import { API_ENDPOINTS } from '../constants';

// Define the expected data type from the API
interface RootData {
  id: number;
  name: string;
  // ...other fields
}

const { responseData, loading, error } = useApi<RootData>(API_ENDPOINTS.FETCH_ROOT, { id: 123 });

// If the API returns an array:
// const { responseData, loading, error } = useApi<RootData[]>(API_ENDPOINTS.FETCH_ROOT);
*/