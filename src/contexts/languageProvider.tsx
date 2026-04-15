import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { LanguageContext } from '../contexts/Language';
import BASEURL from '../hooks/BaseUrl';

const LANGUAGE_STORAGE_KEY = 'preferredLanguage';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n, ready } = useTranslation();
  const { user, loading: authLoading, refetch: refetchUser } = useAuth();
  
  // Estado local para la UI inmediata
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'es'>(
    (i18n.language?.startsWith('es') ? 'es' : 'en')
  );

  // Semáforo para evitar race conditions en peticiones al backend
  const isUpdatingBackend = useRef(false);
  // Flag para saber si ya hicimos la sincronización inicial al cargar la app
  const isInitialSyncDone = useRef(false);

  const changeLanguage = useCallback(async (lng: 'en' | 'es') => {
    // 1. Evitar trabajo si el idioma i18n ya es el correcto (Optimización UI)
    if (i18n.language.startsWith(lng) && currentLanguage === lng) {
        // Aún así, podríamos necesitar sincronizar backend si difieren, 
        // pero validaremos eso abajo.
    }

    setCurrentLanguage(lng);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    
    // Cambiamos i18next si es necesario
    if (!i18n.language.startsWith(lng)) {
      await i18n.changeLanguage(lng);
    }

    if (user && !authLoading) {
      if (user.language === lng) return;

      // Bloqueo de peticiones concurrentes
      if (isUpdatingBackend.current) return;
      
      try {
        isUpdatingBackend.current = true;
        
        const res = await fetch(`${BASEURL}/api/users/language`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: lng }),
        });

        if (res.ok) {
          refetchUser(); // Actualizamos el usuario localmente
        }
      } catch (err) {
        console.error('Error sincronizando idioma con backend:', err);
      } finally {
        isUpdatingBackend.current = false;
      }
    }
  }, [i18n, user, authLoading, refetchUser, currentLanguage]);

  useEffect(() => {
    if (!ready || authLoading) return;

    const savedLng = localStorage.getItem(LANGUAGE_STORAGE_KEY) as 'en' | 'es' | null;
    const browserLng = i18n.language?.startsWith('es') ? 'es' : 'en';
    
    let targetLng: 'en' | 'es' = browserLng;

    if (user?.language && ['en', 'es'].includes(user.language)) {
      // Prioridad 1: Perfil de usuario (Backend)
      targetLng = user.language as 'en' | 'es';
    } else if (savedLng && ['en', 'es'].includes(savedLng)) {
      // Prioridad 2: Preferencia local guardada (para no logueados)
      targetLng = savedLng;
    }

    // Ejecutar sincronización solo si hay discrepancia
    const currentI18n = i18n.language?.startsWith('es') ? 'es' : 'en';
    
    if (currentI18n !== targetLng) {
      changeLanguage(targetLng);
    } else {
        // Si coinciden visualmente, aseguramos que el estado interno también
        if (currentLanguage !== targetLng) setCurrentLanguage(targetLng);
    }

    isInitialSyncDone.current = true;
    
  // NOTA: Dependemos de `user?.language` para reaccionar al Login de Google
  }, [user?.language, authLoading, ready, changeLanguage]);

  return (
    <LanguageContext.Provider
      value={{ 
        user, 
        loading: authLoading, 
        currentLanguage, 
        changeLanguage, 
        t, 
        i18n, 
        ready 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};