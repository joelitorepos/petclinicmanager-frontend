import { useState, useEffect } from "react";

type Data<T> = T | null;
type ErrorType = Error | null;

interface Params<T> {
  data: Data<T>;
  loading: boolean;
  error: ErrorType;
}

function useFetch<T>(url: string): Params<T> {
  const [data, setData] = useState<Data<T>>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorType>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          credentials: 'include',
        });

        if (!response.ok) {
          // Si el servidor devuelve un 401 o 403, esto lanzará un error.
          throw new Error(`Error al obtener los datos: ${response.statusText}`);
        }
        const jsonData: T = await response.json();
        setData(jsonData);
        setError(null);
      } catch (err) {
        // La solicitud es abortada o hay un error de red/respuesta.
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Fetch aborted');
        } else {
          setError(err as Error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      controller.abort(); // Abort the fetch request if the component unmounts
    };
  }, [url]);

  return { data, loading, error };
}

export default useFetch;