import React, { useEffect, useMemo, useState } from 'react';

const Pipeline: React.FC = () => {
  const [runs, setRuns] = useState<Array<{
    _id: string;
    task_name: string;
    branch: string;
    status: string;
    commit: string;
    created_at: string;
    completed_at?: string;
    logs?: string[];
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const fetchRuns = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/pipeline/runs`);
      const data = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error(data.detail || 'Impossible de charger les pipelines');
      }
      setRuns(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de charger les pipelines';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const latestRun = runs[0];
  const queueRuns = runs.filter(r => r.status === 'queued' || r.status === 'running');

  const repoStatus = useMemo(() => {
    if (!latestRun) {
      return {
        stateLabel: 'Aucune exécution',
        stateClass: 'bg-magenta/10 text-magenta',
      };
    }
    if (latestRun.status === 'success') {
      return { stateLabel: 'Synchronisé', stateClass: 'bg-green/10 text-green' };
    }
    if (latestRun.status === 'failed') {
      return { stateLabel: 'Erreur', stateClass: 'bg-red/10 text-red' };
    }
    return { stateLabel: 'En cours', stateClass: 'bg-blue/10 text-blue' };
  }, [latestRun]);

  const handleStartPipeline = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/pipeline/runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_name: 'Instance ParamIQ SBS', branch: 'main' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || 'Impossible de lancer le pipeline');
      }
      await fetchRuns();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de lancer le pipeline';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[24px] font-heading font-bold text-deepBlue">Pipeline & Git Automatisé (M5-M6)</h2>
        <p className="text-[14px] text-text-2">Suivez l'état de vos déploiements et la synchronisation avec le dépôt Git SBS.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-deepBlue">État du Dépôt</h3>
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${repoStatus.stateClass}`}>{repoStatus.stateLabel}</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-text-2">Dernier Commit</span>
              <code className="text-magenta font-bold">#{latestRun?.commit || 'N/A'}</code>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-text-2">Branche</span>
              <span className="font-medium text-deepBlue">{latestRun?.branch || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-text-2">Dernière MaJ</span>
              <span className="font-medium text-deepBlue">{latestRun?.created_at ? new Date(latestRun.created_at).toLocaleString('fr-FR') : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-deepBlue mb-6">File d'attente Pipeline</h3>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-[13px] text-text-3">Chargement...</div>
            ) : queueRuns.length === 0 ? (
              <div className="text-[13px] text-text-3">Aucune tâche en attente.</div>
            ) : queueRuns.map(run => (
              <div key={run._id} className="flex items-center gap-3 p-3 bg-bg rounded-lg border border-border">
                <div className="w-8 h-8 bg-blue/10 text-blue rounded-full flex items-center justify-center text-[14px]">⚙️</div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-deepBlue">{run.task_name}</div>
                  <div className="text-[11px] text-text-3">Statut: {run.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red/30 bg-red/10 px-4 py-3 text-[13px] text-red font-semibold">
          {error}
        </div>
      )}

      <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-deepBlue mb-4">Historique des exécutions</h3>
        <div className="space-y-3">
          {runs.length === 0 ? (
            <div className="text-[13px] text-text-3">Aucune exécution enregistrée.</div>
          ) : runs.slice(0, 8).map(run => (
            <div key={run._id} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <div className="text-[13px] font-bold text-deepBlue">{run.task_name}</div>
                <div className="text-[11px] text-text-3">Commit #{run.commit} • {new Date(run.created_at).toLocaleString('fr-FR')}</div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${run.status === 'success' ? 'bg-green/10 text-green' : run.status === 'failed' ? 'bg-red/10 text-red' : 'bg-blue/10 text-blue'}`}>
                {run.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-deepBlue p-8 rounded-xl text-white flex items-center justify-between">
        <div>
          <h4 className="text-[18px] font-bold mb-2">Lancer une nouvelle instance</h4>
          <p className="text-white/60 text-[13px]">Initialise un nouveau dictionnaire pattern via PowerShell.</p>
        </div>
        <button onClick={handleStartPipeline} disabled={isSubmitting} className="px-6 py-3 bg-magenta hover:bg-magenta-h disabled:bg-magenta/60 text-white rounded-lg text-[14px] font-bold transition-all shadow-lg disabled:cursor-not-allowed">
          {isSubmitting ? 'Démarrage...' : 'Démarrer le Pipeline →'}
        </button>
      </div>
    </div>
  );
};

export default Pipeline;
