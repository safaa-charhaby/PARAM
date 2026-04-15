import React, { useState } from 'react';
import { useAnalysis } from '../contexts/AnalysisContext';

interface AnomaliesProps {
  onNavigate?: (page: string) => void;
}

const Anomalies: React.FC<AnomaliesProps> = ({ onNavigate }) => {
  const { currentAnalysis, setSelectedAnomaly } = useAnalysis();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITIQUE' | 'WARN'>('ALL');

  if (!currentAnalysis) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-[20px] font-heading font-bold text-deepBlue">Détection d'anomalies — Moteur PACK</h2>
          <p className="text-[14px] text-text-2">Analyse EBA Rules Engine + IsolationForest Statistical Detection</p>
        </div>
        <div className="card shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-[18px] font-bold text-deepBlue mb-2">Aucune analyse en cours</h3>
          <p className="text-[14px] text-text-2 mb-6">Lance une analyse depuis la page Validation pour voir les anomalies détectées.</p>
          <button
            onClick={() => onNavigate?.('validation')}
            className="px-6 py-3 bg-blue text-white rounded-lg text-[14px] font-bold hover:bg-[#2563eb] transition-colors"
          >
            Aller à Validation →
          </button>
        </div>
      </div>
    );
  }

  const filteredIssues = filterSeverity === 'ALL' 
    ? currentAnalysis.issues 
    : currentAnalysis.issues.filter(i => i.severity === filterSeverity);

  const handleAnomalyClick = (anomaly: any, index: number) => {
    setSelectedAnomaly(anomaly);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleExplain = (anomaly: any) => {
    const payload = {
      title: anomaly.title,
      detail: anomaly.detail,
      ai_summary: anomaly.ai_summary,
      ai_recommended_action: anomaly.ai_recommended_action,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('paramiq_last_issue', JSON.stringify(payload));
    if (onNavigate) onNavigate('assistant');
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-[20px] font-heading font-bold text-deepBlue">Détection d'anomalies — Moteur PACK</h2>
        <p className="text-[14px] text-text-2">Fichier: <span className="font-bold">{currentAnalysis.fileName}</span> • {currentAnalysis.analysisDate}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card shadow-sm p-4 text-center">
          <div className="text-[12px] text-text-2 mb-2">Score global</div>
          <div className="text-4xl font-heading font-bold text-blue">{currentAnalysis.score}%</div>
        </div>
        <div className="card shadow-sm p-4 text-center">
          <div className="text-[12px] text-text-2 mb-2">Erreurs critiques</div>
          <div className="text-4xl font-heading font-bold text-red">{currentAnalysis.critique_cnt}</div>
        </div>
        <div className="card shadow-sm p-4 text-center">
          <div className="text-[12px] text-text-2 mb-2">Warnings</div>
          <div className="text-4xl font-heading font-bold text-amber">{currentAnalysis.warn_cnt}</div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <h3 className="text-[15px] font-bold text-deepBlue">Anomalies détectées ({filteredIssues.length})</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterSeverity('ALL')}
              className={`px-3 py-1.5 text-[12px] font-bold rounded ${filterSeverity === 'ALL' ? 'bg-blue text-white' : 'bg-bg text-text-2 border border-border'}`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterSeverity('CRITIQUE')}
              className={`px-3 py-1.5 text-[12px] font-bold rounded ${filterSeverity === 'CRITIQUE' ? 'bg-red text-white' : 'bg-bg text-text-2 border border-border'}`}
            >
              Critiques
            </button>
            <button
              onClick={() => setFilterSeverity('WARN')}
              className={`px-3 py-1.5 text-[12px] font-bold rounded ${filterSeverity === 'WARN' ? 'bg-amber text-white' : 'bg-bg text-text-2 border border-border'}`}
            >
              Warnings
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredIssues.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-[14px] text-text-2">Aucune anomalie de ce type détectée !</p>
            </div>
          ) : (
            filteredIssues.slice(0, 20).map((issue, idx) => (
              <div
                key={idx}
                className={`border rounded-lg transition-all cursor-pointer ${
                  issue.severity === 'CRITIQUE' 
                    ? 'bg-[#fef2f2] border-red/30' 
                    : 'bg-[#fffbeb] border-amber/30'
                }`}
              >
                <button
                  onClick={() => handleAnomalyClick(issue, idx)}
                  className="w-full p-4 text-left hover:opacity-80 transition-opacity"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded text-white ${
                        issue.severity === 'CRITIQUE' ? 'bg-red' : 'bg-amber'
                      }`}>
                        {issue.severity}
                      </span>
                      <span className="text-[14px] font-bold text-deepBlue">{issue.title}</span>
                    </div>
                    <span className="text-[12px]">{expandedIndex === idx ? '▼' : '▶'}</span>
                  </div>
                  <p className="text-[13px] text-text-2">{issue.detail}</p>
                </button>

                {expandedIndex === idx && (
                  <div className="px-4 pb-4 border-t border-border/30 pt-4 space-y-3">
                    {issue.ai_summary && (
                      <div>
                        <div className="text-[12px] font-bold text-deepBlue mb-1">Résumé IA:</div>
                        <div className="text-[13px] text-text-2 bg-white/50 p-2 rounded">{issue.ai_summary}</div>
                      </div>
                    )}
                    {issue.ai_impact && (
                      <div>
                        <div className="text-[12px] font-bold text-deepBlue mb-1">Impact:</div>
                        <div className="text-[13px] text-text-2 bg-white/50 p-2 rounded">{issue.ai_impact}</div>
                      </div>
                    )}
                    {issue.ai_recommended_action && (
                      <div>
                        <div className="text-[12px] font-bold text-deepBlue mb-1">Action recommandée:</div>
                        <div className="text-[13px] text-text-2 bg-white/50 p-2 rounded">{issue.ai_recommended_action}</div>
                      </div>
                    )}
                    <button
                      onClick={() => handleExplain(issue)}
                      className="mt-3 w-full py-2 bg-blue text-white text-[12px] font-bold rounded hover:bg-[#2563eb] transition-colors"
                    >
                      Demander une explication IA détaillée →
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Anomalies;

