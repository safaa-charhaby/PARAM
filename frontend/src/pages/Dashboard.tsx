import React, { useEffect, useMemo, useState } from 'react';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState({
    validated_files: 0,
    compliance_rate: 0,
    errors_total: 0,
    critique_total: 0,
  });
  const [weekly, setWeekly] = useState<Array<{ label: string; count: number }>>([]);
  const [recentActivity, setRecentActivity] = useState<Array<{ _id: string; type: string; title: string }>>([]);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE}/api/dashboard/summary`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.detail || 'Impossible de charger le dashboard');
        }

        setMetrics(data.metrics || {
          validated_files: 0,
          compliance_rate: 0,
          errors_total: 0,
          critique_total: 0,
        });
        setWeekly(data.weekly_validations || []);
        setRecentActivity(data.recent_activity || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Impossible de charger le dashboard';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [API_BASE]);

  const weeklyMax = useMemo(() => {
    if (weekly.length === 0) return 1;
    return Math.max(...weekly.map(item => item.count), 1);
  }, [weekly]);

  const activityToBadge = (type: string) => {
    if (type.includes('validation')) return { label: 'OK', className: 'badge badge-ok w-[40px] justify-center text-[10px]' };
    if (type.includes('comparison')) return { label: 'DIFF', className: 'badge badge-info w-[40px] justify-center text-[10px]' };
    if (type.includes('pipeline')) return { label: 'RUN', className: 'badge badge-diff w-[40px] justify-center text-[10px]' };
    return { label: 'IA', className: 'badge badge-diff w-[40px] justify-center text-[10px]' };
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-[20px] font-heading font-bold text-deepBlue">Bonjour Oumaima 👋 — Voici l'état de la plateforme</h2>
      </div>

      {error && (
        <div className="rounded-lg border border-red/30 bg-red/10 px-4 py-3 text-[13px] text-red font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card shadow-sm border border-border">
          <div className="text-[13px] font-medium text-text-2 mb-1">Fichiers validés</div>
          <div className="text-[34px] font-heading font-bold text-deepBlue mb-1">{loading ? '...' : metrics.validated_files}</div>
          <div className="text-[12px] text-green font-medium">Historique MongoDB</div>
        </div>
        <div className="card shadow-sm border border-border">
          <div className="text-[13px] font-medium text-text-2 mb-1">Taux de conformité</div>
          <div className="text-[34px] font-heading font-bold text-deepBlue mb-1">{loading ? '...' : `${metrics.compliance_rate}%`}</div>
          <div className="text-[12px] text-magenta font-medium">Score moyen global</div>
        </div>
        <div className="card shadow-sm border border-border">
          <div className="text-[13px] font-medium text-text-2 mb-1">Erreurs détectées</div>
          <div className="text-[34px] font-heading font-bold text-deepBlue mb-1">{loading ? '...' : metrics.errors_total}</div>
          <div className="text-[12px] text-red font-medium">{loading ? '...' : `${metrics.critique_total} critiques`}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card shadow-sm border border-border lg:col-span-2">
          <div className="text-[14px] font-bold text-deepBlue mb-6">Validations par semaine</div>
          <div className="flex items-end gap-2 h-[140px] px-2">
            {(weekly.length > 0 ? weekly : [{ label: 'S1', count: 0 }]).map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className={`w-full rounded-t-sm ${bar.count === weeklyMax ? 'bg-blue' : 'bg-blue/50'}`}
                  style={{ height: `${Math.max(8, (bar.count / weeklyMax) * 100)}%` }}
                  title={`${bar.label}: ${bar.count}`}
                ></div>
                <div className="text-[11px] text-text-3 font-medium">{bar.label.replace(/^\d{4}-/, '')}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card shadow-sm border border-border">
          <div className="text-[14px] font-bold text-deepBlue mb-4">Activité récente</div>
          <div className="flex flex-col gap-4">
            {recentActivity.length === 0 ? (
              <div className="text-[13px] text-text-3">Aucune activité pour le moment.</div>
            ) : recentActivity.map(item => {
              const badge = activityToBadge(item.type);
              return (
                <div key={item._id} className="flex items-center gap-3 p-2 hover:bg-bg rounded-lg cursor-pointer transition-colors" onClick={() => onNavigate?.('validation')}>
                  <span className={badge.className}>{badge.label}</span>
                  <span className="text-[13px] text-text-2">{item.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
