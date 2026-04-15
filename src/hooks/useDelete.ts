// src/hooks/useDelete.ts

import { useState } from 'react';

// Tipos basados en useFetch.tsx
// T: Tipo esperado en la respuesta (a menudo vacío o un mensaje de éxito)
type Data<T> = T | null;
type ErrorType = Error | null;

/**
 * Hook personalizado para realizar peticiones DELETE.
 *
 * @template T El tipo de dato esperado en la respuesta JSON (ej: { message: string } o void).
 * @param {string} url La URL base a la que se realizará la petición DELETE.
 * @returns {{ data: Data<T>, loading: boolean, error: ErrorType, deleteData: (idOrSuffix: string) => Promise<T | null> }}
 */
function useDelete<T>(baseUrl: string) {
  const [data, setData] = useState<Data<T>>(null);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<ErrorType>(null);

  /**
   * Función para ejecutar la petición DELETE.
   *
   * @param {string} idOrSuffix Generalmente el ID del recurso o un sufijo para la URL.
   * @returns {Promise<T | null>} La promesa de los datos de respuesta o null si hay un error.
   */
  const deleteData = async (idOrSuffix: string): Promise<T | null> => {
    setLoading(true);
    setError(null);
    setData(null);

    // Construir la URL final (ej: /api/recursos/123)
    const finalUrl = `${baseUrl}/${idOrSuffix}`;

    try {
      // Opciones de la petición
      const options: RequestInit = {
        method: 'DELETE', // ¡Cambiamos el método a DELETE!
        credentials: 'include', // Para incluir cookies de sesión si es necesario
      };
      
      // Nota: No se añade body ni Content-Type, ya que DELETE no suele llevar cuerpo.

      const response = await fetch(finalUrl, options);

      if (!response.ok) {
        let errorDetail = await response.text();
        try {
            // Intenta parsear el texto de error si el servidor lo devuelve como JSON
            const errorJson = JSON.parse(errorDetail);
            errorDetail = errorJson.message || errorJson.error || response.statusText;
        } catch (e) {
          console.log(e)
        }
        
        throw new Error(`Error ${response.status} al eliminar el recurso: ${errorDetail}`);
      }
      
      // Manejo de respuesta: DELETE a menudo devuelve 204 (No Content) o 200/202 con cuerpo.
      // Si la respuesta es 204, intentar response.json() causará un error.
      if (response.status === 204 || response.headers.get('content-length') === '0') {
          // No hay contenido (204 No Content), devolvemos un objeto vacío o null, 
          // dependiendo de cómo definas T. Aquí devolvemos un objeto vacío para setData.
          const successResult = {} as T;
          setData(successResult);
          return successResult;
      }
      
      // Si hay contenido, lo parseamos
      const jsonData: T = await response.json();
      setData(jsonData);
      return jsonData;
      
    } catch (err) {
      setError(err as Error);
      console.error('Error al realizar DELETE:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, deleteData };
}

export default useDelete;