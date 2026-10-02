import { useState, useEffect, useCallback, useRef } from 'react';
import { publicApi } from '../utils/publicApi';

export function useCmsData(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(false);

  const load = useCallback(async () => {
    abortRef.current = false;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (!abortRef.current) setData(result);
    } catch (err) {
      if (!abortRef.current) {
        setError(err);
        console.error('CMS data fetch error:', err);
      }
    } finally {
      if (!abortRef.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
    return () => {
      abortRef.current = true;
    };
  }, [load]);

  return { data, loading, error, refetch: load };
}

export function useHomepage() {
  return useCmsData(() => publicApi.homepage(), []);
}

export function useProducts() {
  return useCmsData(() => publicApi.products(), []);
}

export function useStory() {
  return useCmsData(() => publicApi.story(), []);
}

export function useInnovations() {
  return useCmsData(() => publicApi.innovations(), []);
}

export function useGallery() {
  return useCmsData(() => publicApi.gallery(), []);
}

export function useSettings() {
  return useCmsData(() => publicApi.settings(), []);
}

export function useContact() {
  return useCmsData(() => publicApi.contact(), []);
}
