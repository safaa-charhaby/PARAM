import React, { useMemo, useState } from 'react';

interface ComparateurProps {
  onNavigate?: (page: string) => void;
}

const Comparateur: React.FC<ComparateurProps> = ({ onNavigate }) => {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    file_a_name: string;
    file_b_name: string;
    summary: {
      similarity: number;
      added_count: number;
      removed_count: number;
      changed_count: number;
      same_count: number;
      total_rows: number;
    };
    rows: Array<{
      concept: string;
      value_a: number | null;
      value_b: number | null;
      status: 'same' | 'changed' | 'added' | 'removed';
      delta: number | null;
      delta_pct: number | null;
    }>;
  } | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const summary = result?.summary;

  const topRows = useMemo(() => {
    if (!result) return [];
    return result.rows.slice(0, 40);
  }, [result]);

  const handleCompare = async () => {
    if (!fileA || !fileB || isComparing) return;

    setIsComparing(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file_a', fileA);
      formData.append('file_b', fileB);

      const response = await fetch(`${API_BASE}/api/compare/files`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || 'Erreur lors de la comparaison');
      }
      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la comparaison';
      setError(message);
    } finally {
      setIsComparing(false);
    }
  };

  const renderValue = (value: number | null) => {
    if (value === null || Number.isNaN(value)) return '—';
    return value.toLocaleString('fr-FR', { maximumFractionDigits: 4 });
  };

  const variationLabel = (row: { status: string; delta: number | null; delta_pct: number | null }) => {
    if (row.status === 'added') return 'Nouveau';
    if (row.status === 'removed') return 'Supprimé';
    if (row.status === 'same') return 'Identique';
    if (row.delta_pct === null || Number.isNaN(row.delta_pct)) return 'Modifié';
    const sign = row.delta_pct >= 0 ? '+' : '';
    return `${sign}${row.delta_pct.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-[20px] font-heading font-bold text-deepBlue">Comparateur cellule par cellule</h2>
        <p className="text-[14px] text-text-2">Compare deux versions d'un même fichier XBRL</p>
      </div>

      <div className="flex items-center justify-between gap-6 mb-8">
        <div className="flex-1 card py-6 px-4 text-center border-border shadow-sm">
          <div className="text-[13px] text-text-2 mb-2">Fichier A (version ancienne)</div>
          <input type="file" onChange={e => setFileA(e.target.files?.[0] || null)} className="text-[12px]" />
          <div className="text-[13px] font-bold text-deepBlue mt-3">{fileA?.name || result?.file_a_name || 'Aucun fichier'}</div>
        </div>
        <div className="text-[20px] text-text-3 font-heading font-bold">VS</div>
        <div className="flex-1 card py-6 px-4 text-center border-border shadow-sm">
          <div className="text-[13px] text-text-2 mb-2">Fichier B (nouvelle version)</div>
          <input type="file" onChange={e => setFileB(e.target.files?.[0] || null)} className="text-[12px]" />
          <div className="text-[13px] font-bold text-deepBlue mt-3">{fileB?.name || result?.file_b_name || 'Aucun fichier'}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleCompare} disabled={!fileA || !fileB || isComparing} className="px-5 py-2.5 bg-blue text-white rounded-lg text-[13px] font-bold disabled:bg-blue/50 disabled:cursor-not-allowed">
          {isComparing ? 'Comparaison...' : 'Comparer les fichiers'}
        </button>
        {error && <span className="text-[13px] text-red font-semibold">{error}</span>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#f0fdf4] rounded-lg p-4 text-center flex flex-col items-center justify-center border border-[#dcfce7]">
          <div className="text-[28px] font-heading font-bold text-[#15803d]">{summary ? `${summary.similarity}%` : '0%'}</div>
          <div className="text-[12px] text-[#15803d] font-medium mt-1">Similarité</div>
        </div>
        <div className="bg-[#eff6ff] rounded-lg p-4 text-center flex flex-col items-center justify-center border border-[#dbeafe]">
          <div className="text-[28px] font-heading font-bold text-[#1d4ed8]">+{summary?.added_count || 0}</div>
          <div className="text-[12px] text-[#1d4ed8] font-medium mt-1">Lignes ajoutées</div>
        </div>
        <div className="bg-[#fef2f2] rounded-lg p-4 text-center flex flex-col items-center justify-center border border-[#fee2e2]">
          <div className="text-[28px] font-heading font-bold text-[#b91c1c]">-{summary?.removed_count || 0}</div>
          <div className="text-[12px] text-[#b91c1c] font-medium mt-1">Lignes supprimées</div>
        </div>
        <div className="bg-[#fffbeb] rounded-lg p-4 text-center flex flex-col items-center justify-center border border-[#fef9c3]">
          <div className="text-[28px] font-heading font-bold text-[#a16207]">{summary?.changed_count || 0}</div>
          <div className="text-[12px] text-[#a16207] font-medium mt-1">Cellules modifiées</div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden border border-border">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-bg text-text-3 border-b-2 border-border">
            <tr>
              <th className="px-5 py-3 font-bold uppercase tracking-widest text-[11px]">Concept</th>
              <th className="px-5 py-3 font-bold uppercase tracking-widest text-[11px]">Valeur A</th>
              <th className="px-5 py-3 font-bold uppercase tracking-widest text-[11px]">Valeur B</th>
              <th className="px-5 py-3 font-bold uppercase tracking-widest text-[11px]">Variation</th>
            </tr>
          </thead>
          <tbody className="text-deepBlue divide-y divide-bg-2">
            {topRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-text-3">Aucune donnée de comparaison.</td>
              </tr>
            ) : topRows.map((row, idx) => (
              <tr key={`${row.concept}-${idx}`} className={`${row.status === 'changed' ? 'bg-[#fffbeb] hover:bg-[#fef9c3]/50' : row.status === 'removed' ? 'bg-[#fef2f2] hover:bg-[#fee2e2]/50' : row.status === 'added' ? 'bg-[#f0fdf4] hover:bg-[#dcfce7]/50' : 'hover:bg-bg'} transition-colors`}>
                <td className="px-5 py-3">{row.concept}</td>
                <td className="px-5 py-3">{renderValue(row.value_a)}</td>
                <td className="px-5 py-3">{renderValue(row.value_b)}</td>
                <td className="px-5 py-3 font-bold">{variationLabel(row)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-4 bg-bg border-t border-border flex justify-end">
          <button onClick={() => onNavigate?.('assistant')} className="px-5 py-2.5 bg-[#3b82f6] text-white rounded-lg text-[13px] font-bold hover:bg-blue transition-colors flex items-center justify-center gap-2 shadow-sm">
            Analyser les changements via IA →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Comparateur;
