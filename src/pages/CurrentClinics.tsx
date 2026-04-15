// src/pages/CurrentClinics.tsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useFetch from '../hooks/useFetch';
import PageWrapper from '../components/layout/PageWrapper';
import { Building2, Plus, Mail, Check, X } from 'lucide-react';
import BASEURL from '../hooks/BaseUrl';
import WorkspaceSetupModal from '../components/modal/WorkspaceSetupModal';
import { useLanguage } from '../hooks/useLanguage';
import BASE_IMAGE_URL from '../utils/URL';

interface MyWorkspace {
  workspaceId: string;
  name: string;
  slug: string;
  logo?: { url: string; key: string };
  role: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
}

interface PendingInvitation {
  invitationId: string;
  workspaceId: string;
  workspace: {
    name: string;
    slug: string;
    logo?: { url: string };
    plan: string;
  };
  role: string;
  invitedBy: {
    name: string;
    email: string;
    picture?: string;
  };
  phone?: { country: string; number: string; full?: string };
  createdAt: string;
  expiresAt?: string;
}

interface DisplayWorkspace {
  id: string;
  name: string;
  slug: string;
  role: string;
  logo?: { url: string; key: string };   // ← agregado aquí para solucionar el error
}

const CurrentClinics = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'clinics' | 'invitations'>('clinics');
  const [showModal, setShowModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Mis clínicas activas
  const { 
    data: rawWorkspaces = [], 
    loading: loadingClinics, 
    error: errorClinics,
  } = useFetch<MyWorkspace[]>(`${BASEURL}/api/workspaces/my-clinics`);

  // Invitaciones pendientes (usa la ruta que ya funcione en tu backend)
  const { 
    data: invitationsResponse, 
    loading: loadingInvites, 
    error: errorInvites,
  } = useFetch<{ invitations: PendingInvitation[]; count: number }>(`${BASEURL}/api/workspaces/invitations/pending`);

  const workspaces: DisplayWorkspace[] = (rawWorkspaces || []).map(w => ({
    id: w.workspaceId,
    name: w.name,
    slug: w.slug,
    role: w.role,
    logo: w.logo,
  }));

  const safeInvitations = invitationsResponse?.invitations || [];

  const handleAccept = async (invitationId: string) => {
    setProcessingId(invitationId);
    try {
      const res = await fetch(`${BASEURL}/api/workspaces/my-invitations/${invitationId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('[handleAccept] Error al aceptar invitación:', errData);
        return;
      }

      window.location.reload();
    } catch (err: unknown) {
      console.error('[handleAccept] Error inesperado:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (invitationId: string) => {
    setProcessingId(invitationId);
    try {
      const res = await fetch(`${BASEURL}/api/workspaces/my-invitations/${invitationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('[handleReject] Error al rechazar invitación:', errData);
        return;
      }

      window.location.reload();
    } catch (err: unknown) {
      console.error('[handleReject] Error inesperado:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleWorkspaceSuccess = () => {
    setShowModal(false);
    window.location.reload(); // recarga para ver la nueva clínica
  };

  const loading = loadingClinics || loadingInvites;
  const error = errorClinics || errorInvites;

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-screen">
          <div className="text-2xl text-emerald-600">{t('currentClinics:common.loading')}</div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="text-center text-red-600 text-xl">
          {t('currentClinics:common.error_loading')}: {error?.message || 'Error desconocido'}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="pt-20 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-700 mb-3">
            {t('currentClinics:my_workspaces')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('currentClinics:select_or_create')}
          </p>
        </div>

        {/* Pestañas */}
        <div className="flex justify-center mb-10 border-b">
          <button
            onClick={() => setActiveTab('clinics')}
            className={`px-8 py-4 font-medium text-lg transition-colors cursor-pointer ${
              activeTab === 'clinics'
                ? 'border-b-4 border-emerald-600 text-emerald-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building2 className="inline mr-2" size={20} />
            {t('currentClinics:tab_my_clinics')} ({workspaces.length})
          </button>

          <button
            onClick={() => setActiveTab('invitations')}
            className={`px-8 py-4 font-medium text-lg transition-colors cursor-pointer ${
              activeTab === 'invitations'
                ? 'border-b-4 border-emerald-600 text-emerald-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Mail className="inline mr-2" size={20} />
            {t('currentClinics:invitations.tab_pending')} ({safeInvitations.length})
          </button>
        </div>

        {activeTab === 'clinics' ? (
          <>
            {workspaces.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
                {workspaces.map(ws => (
                  <div
                    key={ws.id}
                    className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      {ws.logo?.key ? (
                        <img
                          src={`${BASE_IMAGE_URL}${ws.logo.key}`}
                          alt={ws.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <Building2 className="text-emerald-600" size={40} />
                      )}
                      <h3 className="text-xl font-bold text-gray-800">{ws.name}</h3>
                    </div>
                    <p className="text-gray-600 mb-5">
                      {t('currentClinics:role')}: <span className="font-medium">{t(`roles:${ws.role}`)}</span>
                    </p>
                    <button
                      onClick={() => navigate(`/clinic/${ws.slug}`)}
                      className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition cursor-pointer"
                    >
                      {t('currentClinics:enter')}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <p className="text-xl text-gray-700 mb-6">{t('currentClinics:no_clinics_yet')}</p>
              </div>
            )}
          </>
        ) : (
          <>
            {safeInvitations.length > 0 ? (
              <div className="space-y-6">
                {safeInvitations.map(inv => (
                  <div
                    key={inv.invitationId}
                    className="bg-white p-6 rounded-2xl shadow-md border border-emerald-100 hover:border-emerald-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {inv.workspace.name}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {t('currentClinics:invitations.invited_you_as')}{' '}
                          <strong>{t(`roles:${inv.role}`)}</strong>
                        </p>
                        <p className="text-sm text-gray-500">
                          {t('currentClinics:invitations.invited_by')} {inv.invitedBy.name} ({inv.invitedBy.email})
                        </p>
                        {inv.phone?.full && (
                          <p className="text-sm text-gray-500 mt-1">
                            {t('currentClinics:invitations.phone')}: {inv.phone.full}
                          </p>
                        )}
                        {inv.expiresAt && (
                          <p className="text-xs text-orange-600 mt-2">
                            {t('currentClinics:invitations.expires')}: {new Date(inv.expiresAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAccept(inv.invitationId)}
                          disabled={processingId === inv.invitationId}
                          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check size={18} />
                          {processingId === inv.invitationId ? '...' : t('common:accept')}
                        </button>
                        <button
                          onClick={() => handleReject(inv.invitationId)}
                          disabled={processingId === inv.invitationId}
                          className="flex items-center gap-2 bg-red-100 text-red-700 px-5 py-2.5 rounded-xl hover:bg-red-200 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X size={18} />
                          {t('common:reject')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <Mail className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-xl text-gray-700">{t('currentClinics:invitations.no_pending')}</p>
              </div>
            )}
          </>
        )}

        <div className="text-center mt-12">
          <button
            onClick={() => setShowModal(true)}
            className="bg-emerald-600 text-white text-xl font-bold px-10 py-6 rounded-3xl shadow-xl hover:shadow-2xl flex items-center gap-4 mx-auto transition-all hover:scale-105 cursor-pointer"
          >
            <Plus size={28} />
            {t('currentClinics:create_new')}
          </button>
          {workspaces.length > 0 && (
            <p className="text-sm text-gray-500 mt-3">
              {t('currentClinics:create_limit_note')}
            </p>
          )}
        </div>
      </div>

      {showModal && (
        <WorkspaceSetupModal
          onClose={() => setShowModal(false)}
          onSuccess={handleWorkspaceSuccess}
        />
      )}
    </PageWrapper>
  );
};

export default CurrentClinics;