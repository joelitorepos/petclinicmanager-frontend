// src/hooks/usePost.ts

import { useState } from 'react';

// Tipos basados en useFetch.tsx
type Data<T> = T | null;
type ErrorType = Error | null;

// Extender RequestInit para tipar correctamente la función fetch
interface FetchOptions extends RequestInit {
    credentials?: 'include' | 'omit' | 'same-origin';
    headers?: HeadersInit;
    body?: BodyInit;
}

function usePost<T, V>(url: string) {
  const [data, setData] = useState<Data<T>>(null);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<ErrorType>(null);

  const post = async (payload: V): Promise<T | null> => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      // Determinar el tipo de payload
      const isFormData = payload instanceof FormData;

      // Construir las opciones de la petición
      const options: FetchOptions = {
        method: 'POST',
        credentials: 'include', // Necesario para enviar la cookie de sesión (e.g., Google)
      };

      if (isFormData) {
        // Si es FormData (para carga de archivos), NO se añade el header Content-Type.
        // El navegador lo genera automáticamente como multipart/form-data.
        options.body = payload as unknown as BodyInit;
      } else {
        // Si es JSON, se añade el Content-Type y se serializa el cuerpo.
        options.headers = {
          'Content-Type': 'application/json',
        };
        options.body = JSON.stringify(payload);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        let errorDetail = await response.text();
        try {
            const errorJson = JSON.parse(errorDetail);
            errorDetail = errorJson.message || response.statusText;
        } catch (e) {
            console.error(e)
        }
        
        throw new Error(`Error ${response.status}: ${errorDetail}`);
      }

      const jsonData: T = await response.json();
      setData(jsonData);
      return jsonData;
      
    } catch (err) {
      setError(err as Error);
      console.error('Error al realizar POST:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, post };
}

export default usePost;