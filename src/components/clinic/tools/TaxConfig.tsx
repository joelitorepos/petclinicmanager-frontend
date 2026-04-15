// src/components/clinic/tools/TaxConfig.tsx

import { useState } from 'react';
import { useLanguage } from '../../../hooks/useLanguage';
import BASEURL from '../../../hooks/BaseUrl';
import { useAuthAwareFetch } from '../../../hooks/useAuthAwareFetch';
import Button from '../../ui/Button';
import TaxConfigCard from '../../common/TaxConfigCard';
import TaxConfigModal from '../../modal/TaxConfigModal';
import type { ITaxConfig } from '../../../interfaces/TaxConfig';
import useFetch from '../../../hooks/useFetch';
import type { CurrentWorkspaceResponse } from '../../../interfaces/Workspace';

const TaxConfig = () => {
  const { t } = useLanguage();

  const { data: currentWorkspaceData } = useFetch<CurrentWorkspaceResponse>(`${BASEURL}/api/workspaces/current`);
  const workspaceId = currentWorkspaceData?.workspace?._id || null;

  const {
    data: config = [],
    loading,
    error,
    refetch,
  } = useAuthAwareFetch<ITaxConfig[]>(
    workspaceId ? `${BASEURL}/api/workspaces/${workspaceId}/tax-configs` : '',
    [workspaceId],
    { skipInitialFetch: !workspaceId }
  );

  const configs = config ?? [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ITaxConfig | null>(null);

  const openCreate = () => {
    setEditingConfig(null);
    setIsModalOpen(true);
  };

  const openEdit = (config: ITaxConfig) => {
    setEditingConfig(config);
    setIsModalOpen(true);
  };

  const handleToggle = async (configId: string, makeActive: boolean) => {
    if (!makeActive) {
      // Solo desactivar esta
      await fetch(`${BASEURL}/api/workspaces/${workspaceId}/tax-configs/${configId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      });
    } else {
      // Desactivar todas las demás primero
      const promises = configs
        .filter(c => c._id !== configId && c.isActive)
        .map(c =>
          fetch(`${BASEURL}/api/workspaces/${workspaceId}/tax-configs/${c._id}/toggle`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: false }),
          })
        );

      await Promise.all(promises);

      // Activar la seleccionada
      await fetch(`${BASEURL}/api/workspaces/${workspaceId}/tax-configs/${configId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      });
    }

    refetch();
  };

  if (loading) return <div className="p-8 text-center">{t('billing:taxConfig.messages.loading')}</div>;
  if (error) return <div className="p-8 text-red-600">{t('billing:taxConfig.messages.errorLoad')}</div>;

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[rgb(var(--text))]">{t('billing:taxConfig.title')}</h1>
        <Button onClick={openCreate} variant="primary">
          {t('billing:taxConfig.buttons.new')}
        </Button>
      </div>

      {configs.length === 0 ? (
        <div className="text-center py-12 text-[rgb(var(--text-secondary))]">
          {t('billing:taxConfig.messages.noConfigs')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {configs.map((config) => (
            <TaxConfigCard
              key={config._id}
              config={config}
              onEdit={() => openEdit(config)}
              onToggle={(makeActive) => handleToggle(config._id, makeActive)}
            />
          ))}
        </div>
      )}

      <TaxConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingConfig={editingConfig}
        onSuccess={() => {
          setIsModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
};

export default TaxConfig;