// src/components/clinic/tools/AuditLogView.tsx

import { useState, useMemo } from 'react';
import { useLanguage } from '../../../hooks/useLanguage';
import BASEURL from '../../../hooks/BaseUrl';
import { useAuthAwareFetch } from '../../../hooks/useAuthAwareFetch';
import useFetch from '../../../hooks/useFetch';
import Button from '../../ui/Button';
import Select from '../../ui/Select';
import DateInput from '../../ui/DateInput';
import InfoNote from '../../ui/InfoNote';
import type { CurrentWorkspaceResponse } from '../../../interfaces/Workspace';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface IChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

interface IAuditLog {
  _id: string;
  workspaceId?: string;
  userId: string;
  userEmail: string;
  userName?: string;
  role: string;
  action: string;
  collectionName: string;
  documentId: string;
  changes?: IChange[];
  description?: string;
  ip?: string;
  timestamp: string | Date;
}

interface AuditLogsResponse {
  logs: IAuditLog[];
  total: number;
  page: number;
  totalPages: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<string, { labelKey: string; classes: string }> = {
  create:        { labelKey: 'auditLog:actions.create',        classes: 'bg-green-100 text-green-700' },
  update:        { labelKey: 'auditLog:actions.update',        classes: 'bg-blue-100 text-blue-700' },
  delete:        { labelKey: 'auditLog:actions.delete',        classes: 'bg-red-100 text-red-700' },
  login:         { labelKey: 'auditLog:actions.login',         classes: 'bg-gray-100 text-gray-600' },
  invite:        { labelKey: 'auditLog:actions.invite',        classes: 'bg-purple-100 text-purple-700' },
  remove_member: { labelKey: 'auditLog:actions.remove_member', classes: 'bg-orange-100 text-orange-700' },
  change_role:   { labelKey: 'auditLog:actions.change_role',   classes: 'bg-yellow-100 text-yellow-700' },
  payment:       { labelKey: 'auditLog:actions.payment',       classes: 'bg-teal-100 text-teal-700' },
};

const getActionLabel = (t: (key: string) => string, action: string) => {
  const config = ACTION_CONFIG[action];
  return config ? t(config.labelKey) : action;
};

const getActionClasses = (action: string) => {
  return ACTION_CONFIG[action]?.classes ?? 'bg-gray-100 text-gray-600';
};

const formatDate = (ts: string | Date, locale = 'es-GT') => {
  const d = new Date(ts);
  return d.toLocaleString(locale, {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const formatValue = (val: unknown): string => {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

// ─── Sub-componente: tarjeta de un log ────────────────────────────────────────

interface LogCardProps {
  log: IAuditLog;
  t: (key: string) => string;
}

const LogCard = ({ log, t }: LogCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const label = getActionLabel(t, log.action);
  const classes = getActionClasses(log.action);
  const hasChanges = log.changes && log.changes.length > 0;

  return (
    <div className="border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--surface))] overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center gap-3 p-4">

        <div className="min-w-[130px]">
          <p className="text-xs text-[rgb(var(--text-secondary))]">{t('auditLog:card.timestamp')}</p>
          <p className="text-sm font-mono">{formatDate(log.timestamp)}</p>
        </div>

        <div className="min-w-[110px]">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${classes}`}>
            {label}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-[rgb(var(--text-secondary))]">{t('auditLog:card.user')}</p>
          <p className="text-sm font-medium truncate">
            {log.userName ?? log.userEmail}
          </p>
          <p className="text-xs text-[rgb(var(--text-secondary))] truncate">{log.userEmail}</p>
        </div>

        <div className="min-w-[80px]">
          <p className="text-xs text-[rgb(var(--text-secondary))]">{t('auditLog:card.role')}</p>
          <p className="text-sm capitalize">{log.role}</p>
        </div>

        <div className="min-w-[110px]">
          <p className="text-xs text-[rgb(var(--text-secondary))]">{t('auditLog:card.module')}</p>
          <p className="text-sm font-mono text-[rgb(var(--primary))]">{log.collectionName}</p>
        </div>

        {log.description && (
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[rgb(var(--text-secondary))]">{t('auditLog:card.description')}</p>
            <p className="text-sm truncate">{log.description}</p>
          </div>
        )}

        {log.ip && (
          <div className="min-w-[100px]">
            <p className="text-xs text-[rgb(var(--text-secondary))]">{t('auditLog:card.ip')}</p>
            <p className="text-xs font-mono text-[rgb(var(--text-secondary))]">{log.ip}</p>
          </div>
        )}

        {hasChanges && (
          <div className="flex-shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setExpanded(prev => !prev)}
            >
              {expanded
                ? t('auditLog:buttons.hideChanges')
                : `${t('auditLog:buttons.viewChanges')} (${log.changes!.length})`}
            </Button>
          </div>
        )}
      </div>

      {expanded && hasChanges && (
        <div className="border-t border-[rgb(var(--border))] bg-[rgb(var(--background-secondary))] px-4 py-3">
          <p className="text-xs font-semibold text-[rgb(var(--text-secondary))] uppercase mb-2">
            {t('auditLog:card.changesTitle')}
          </p>
          <div className="space-y-2">
            {log.changes!.map((change, idx) => (
              <div
                key={idx}
                className="grid grid-cols-3 gap-4 text-sm bg-[rgb(var(--surface))] rounded p-2 border border-[rgb(var(--border))]"
              >
                <div>
                  <p className="text-xs text-[rgb(var(--text-secondary))]">{t('auditLog:card.changeField')}</p>
                  <p className="font-mono font-medium">{change.field}</p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--text-secondary))]">{t('auditLog:card.changeOldValue')}</p>
                  <p className="font-mono text-red-600 break-all">{formatValue(change.oldValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--text-secondary))]">{t('auditLog:card.changeNewValue')}</p>
                  <p className="font-mono text-green-700 break-all">{formatValue(change.newValue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Vista principal ───────────────────────────────────────────────────────────

const AuditLogView = () => {
  const { t } = useLanguage();

  const { data: currentWorkspaceData } = useFetch<CurrentWorkspaceResponse>(
    `${BASEURL}/api/workspaces/current`
  );
  const workspaceId = currentWorkspaceData?.workspace?._id ?? null;

  const [action, setAction] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '30');
    if (action) params.set('action', action);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return params.toString();
  }, [action, startDate, endDate, page]);

  const {
    data: logsResponse,
    loading,
    error,
    refetch,
  } = useAuthAwareFetch<AuditLogsResponse>(
    workspaceId ? `${BASEURL}/api/workspaces/${workspaceId}/audit?${queryString}` : '',
    [workspaceId, queryString],
    { skipInitialFetch: !workspaceId }
  );

  const logs: IAuditLog[] = useMemo(() => {
    if (!logsResponse) return [];
    return Array.isArray(logsResponse)
      ? logsResponse
      : (logsResponse as AuditLogsResponse).logs ?? [];
  }, [logsResponse]);

  const totalPages = (logsResponse as AuditLogsResponse)?.totalPages ?? 1;
  const total = (logsResponse as AuditLogsResponse)?.total ?? logs.length;

  const handleClearFilters = () => {
    setAction('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasFilters = action || startDate || endDate;

  return (
    <div className="space-y-6 p-6">

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[rgb(var(--text))]">
          {t('auditLog:title')}
        </h1>
        <Button variant="primary" onClick={() => refetch()}>
          {t('auditLog:buttons.refresh')}
        </Button>
      </div>

      <InfoNote variant="info">
        {t('auditLog:message')}
      </InfoNote>

      <div className="border border-[rgb(var(--border))] rounded-xl p-4 bg-[rgb(var(--surface))] space-y-4">
        <h2 className="font-semibold text-[rgb(var(--text))]">{t('auditLog:filters.title')}</h2>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-48">
            <Select
              label={t('auditLog:filters.actionLabel')}
              value={action}
              onChange={(v) => { setAction(v); setPage(1); }}
              options={[
                { value: '',              label: t('auditLog:filters.allActions') },
                { value: 'create',        label: t('auditLog:actions.create') },
                { value: 'update',        label: t('auditLog:actions.update') },
                { value: 'delete',        label: t('auditLog:actions.delete') },
                { value: 'login',         label: t('auditLog:actions.login') },
                { value: 'invite',        label: t('auditLog:actions.invite') },
                { value: 'remove_member', label: t('auditLog:actions.remove_member') },
                { value: 'change_role',   label: t('auditLog:actions.change_role') },
                // { value: 'payment',    label: t('auditLog:actions.payment') },
              ]}
            />
          </div>
          <div className="w-full md:w-44">
            <DateInput
              label={t('auditLog:filters.dateFrom')}
              value={startDate}
              onChange={(v) => { setStartDate(v); setPage(1); }}
            />
          </div>
          <div className="w-full md:w-44">
            <DateInput
              label={t('auditLog:filters.dateTo')}
              value={endDate}
              onChange={(v) => { setEndDate(v); setPage(1); }}
            />
          </div>
          {hasFilters && (
            <Button variant="secondary" onClick={handleClearFilters}>
              {t('auditLog:buttons.clearFilters')}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {!loading && !error && (
          <p className="text-sm text-[rgb(var(--text-secondary))]">
            {total > 0
              ? `${t('auditLog:count.showing')} ${logs.length} ${t('auditLog:count.of')} ${total} ${t('auditLog:count.records')}`
              : t('auditLog:count.empty')}
            {hasFilters && ` ${t('auditLog:count.withFilters')}`}
          </p>
        )}

        {loading && (
          <div className="text-center py-12 text-[rgb(var(--text-secondary))]">
            {t('auditLog:states.loading')}
          </div>
        )}

        {error && (
          <InfoNote variant="warning">
            {`${t('auditLog:states.errorLoad')} ${error.message}`}
          </InfoNote>
        )}

        {!loading && !error && logs.length === 0 && (
          <div className="text-center py-16 text-[rgb(var(--text-secondary))]">
            <p className="text-lg font-medium mb-1">{t('auditLog:states.noRecordsTitle')}</p>
            <p className="text-sm">
              {hasFilters
                ? t('auditLog:states.noRecordsFiltered')
                : t('auditLog:states.noRecordsEmpty')}
            </p>
          </div>
        )}

        {!loading && !error && logs.map(log => (
          <LogCard key={log._id} log={log} t={t} />
        ))}
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="secondary"
            disabled={page === 1}
            onClick={() => setPage(prev => prev - 1)}
          >
            {t('auditLog:pagination.previous')}
          </Button>
          <span className="text-sm text-[rgb(var(--text-secondary))]">
            {`${t('auditLog:pagination.page')} ${page} ${t('auditLog:pagination.of')} ${totalPages}`}
          </span>
          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage(prev => prev + 1)}
          >
            {t('auditLog:pagination.next')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AuditLogView;