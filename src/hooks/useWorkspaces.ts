// src/hooks/useWorkspaces.ts
import { useState, useEffect } from "react";
import BASEURL from './BaseUrl';

// Define el tipo de dato mínimo esperado del backend para una clínica
interface WorkspaceMinimal {
    _id: string; 
    slug: string;
    name: string;
}

type WorkspacesData = WorkspaceMinimal[] | null;
type ErrorType = Error | null;

const WORKSPACES_URL = `${BASEURL}/api/workspaceMembers/my-clinics`;

/**
 * Hook para obtener las clínicas del usuario logueado.
 */
export const useWorkspaces = (isAuthenticated: boolean) => {
  const [workspaces, setWorkspaces] = useState<WorkspacesData>(null);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [errorWorkspaces, setErrorWorkspaces] = useState<ErrorType>(null);

  useEffect(() => {
    // Si no está autenticado, no hay clínicas que buscar.
    if (!isAuthenticated) {
      setLoadingWorkspaces(false);
      setWorkspaces([]);
      return;
    }

    const controller = new AbortController();
    const fetchData = async () => {
      setLoadingWorkspaces(true);
      setErrorWorkspaces(null);
      
      try {
        const response = await fetch(WORKSPACES_URL, {
            signal: controller.signal,
            credentials: 'include', // Enviar cookie
        });

        if (!response.ok) {
          throw new Error(`Error al obtener clínicas: ${response.statusText}`);
        }
        
        const jsonData: WorkspaceMinimal[] = await response.json();
        setWorkspaces(jsonData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
             setErrorWorkspaces(err as Error);
        }
      } finally {
        setLoadingWorkspaces(false);
      }
    };

    fetchData();
    return () => { controller.abort(); };
  }, [isAuthenticated]);

  return { workspaces, loadingWorkspaces, errorWorkspaces };
};
