// src/hooks/usePatch.ts

import { useState } from 'react';

// Tipos basados en useFetch.tsx
type Data<T> = T | null;
type ErrorType = Error | null;

// Extender RequestInit para tipar correctamente la función fetch
// Incluye las opciones que manejan body, headers y credenciales
interface FetchOptions extends RequestInit {
    credentials?: 'include' | 'omit' | 'same-origin';
    headers?: HeadersInit;
    body?: BodyInit;
}

/**
 * Hook personalizado para realizar peticiones PATCH.
 *
 * @template T El tipo de dato esperado en la respuesta JSON.
 * @template V El tipo de dato del payload a enviar (el cuerpo de la petición).
 * @param {string} url La URL a la que se realizará la petición PATCH.
 * @returns {{ data: Data<T>, loading: boolean, error: ErrorType, patch: (payload: V) => Promise<T | null> }}
 */
function usePatch<T, V>(url: string) {
  const [data, setData] = useState<Data<T>>(null);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<ErrorType>(null);

  /**
   * Función para ejecutar la petición PATCH.
   *
   * @param {V} payload El cuerpo de la petición (datos a actualizar).
   * @returns {Promise<T | null>} La promesa de los datos de respuesta o null si hay un error.
   */
  const patch = async (payload: V): Promise<T | null> => {
    setLoading(true);
    setError(null);
    setData(null); // Opcional: limpiar datos anteriores al iniciar la nueva petición

    try {
      // Nota: Al igual que POST, PATCH puede manejar FormData para subida parcial de archivos,
      // pero es menos común. Si no lo necesitas, puedes omitir el manejo de FormData y
      // asumir solo JSON, simplificando el código.
      const isFormData = payload instanceof FormData;

      // Construir las opciones de la petición
      const options: FetchOptions = {
        method: 'PATCH', // ¡Cambiamos el método a PATCH!
        credentials: 'include', // Necesario para enviar la cookie de sesión (e.g., Google)
      };

      if (isFormData) {
        // Para FormData, el navegador establece automáticamente 'multipart/form-data'.
        options.body = payload as unknown as BodyInit;
      } else {
        // Para JSON (el caso más común en PATCH)
        options.headers = {
          'Content-Type': 'application/json',
          // Puedes añadir otros headers aquí si son necesarios, como Authorization, etc.
        };
        options.body = JSON.stringify(payload);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        let errorDetail = await response.text();
        try {
            // Intenta parsear el texto de error como JSON si el servidor lo devuelve así
            const errorJson = JSON.parse(errorDetail);
            // Prioriza un campo 'message' o 'error', sino usa el statusText
            errorDetail = errorJson.message || errorJson.error || response.statusText;
        } catch (e) {
          console.log(e)
        }
        
        // Lanzar un Error con un mensaje descriptivo para ser capturado en el `catch`
        throw new Error(`Error ${response.status} en la petición PATCH: ${errorDetail}`);
      }

      // Si la respuesta fue exitosa
      const jsonData: T = await response.json();
      setData(jsonData);
      return jsonData;
      
    } catch (err) {
      setError(err as Error);
      console.error('Error al realizar PATCH:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // El hook devuelve el estado actual y la función para ejecutar la petición
  return { data, loading, error, patch };
}

export default usePatch;