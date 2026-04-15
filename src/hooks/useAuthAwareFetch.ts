// src/hooks/useAuthAwareFetch.ts
import { useState, useEffect, useCallback, useRef } from 'react';

interface FetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface FetchOptions {
  skipInitialFetch?: boolean;
  onUnauthorized?: () => void;
}

export function useAuthAwareFetch<T>(
  url: string,
  dependencies: ReadonlyArray<unknown> = [],
  options: FetchOptions = {}
): FetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options.skipInitialFetch);
  const [error, setError] = useState<Error | null>(null);
  
  // Usamos useRef para el abort controller actual
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (abortSignal?: AbortSignal): Promise<void> => {
    // Si ya hay una petición en curso, la abortamos
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Creamos un nuevo controller para esta petición
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    // Usamos el signal proporcionado o el del controller
    const signal = abortSignal || controller.signal;
    
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, {
        signal,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          // Llamar al callback personalizado o redirigir por defecto
          if (options.onUnauthorized) {
            options.onUnauthorized();
          } else {
            window.location.href = '/login';
          }
          return;
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json: T = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      // Solo manejamos errores que no sean de aborto
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setLoading(false);
      // Limpiar la referencia si es nuestro controller
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, [url, options.onUnauthorized, ...dependencies]);

  // Fetch inicial
  useEffect(() => {
    if (!options.skipInitialFetch) {
      fetchData();
    }

    return () => {
      // Abortar la petición al desmontar
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, options.skipInitialFetch]);

  // Función de refetch simple
  const refetch = useCallback(async (): Promise<void> => {
    await fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Ejemplo de uso:
/*
function MyComponent() {
  const { data, loading, error, refetch } = useAuthAwareFetch<User[]>(
    '/api/users',
    [],
    {
      skipInitialFetch: false,
      onUnauthorized: () => {
        // Redirigir a login personalizado
        router.push('/login?expired=true');
      }
    }
  );

  // ...
}
*/