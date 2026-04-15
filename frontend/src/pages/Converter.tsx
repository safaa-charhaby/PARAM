import React, { useEffect, useMemo, useState } from 'react';

const Converter: React.FC = () => {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    source_file: string;
    rows_total: number;
    columns: string[];
    preview_rows: Array<Record<string, string | number | null>>;
    csv_content: string;
  } | null>(null);
  const [history, setHistory] = useState<Array<{ _id: string; source_file: string; rows_total: number; created_at: string }>>([]);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/converter/runs`);
      const data = await response.json().catch(() => []);
      if (!response.ok) return;
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      // History is non-blocking.
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const previewColumns = useMemo(() => result?.columns || [], [result]);

  const handleConvert = async () => {
    if (!sourceFile || isConverting) return;
    setIsConverting(true);
    setError('');

    try {
      const form = new FormData();
      form.append('file', sourceFile);

      const response = await fetch(`${API_BASE}/api/converter/espf-to-csv`, {
        method: 'POST',
        body: form,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || 'Conversion impossible');
      }
      setResult(data);
      fetchHistory();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Conversion impossible';
      setError(message);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!result?.csv_content) return;
    const blob = new Blob([result.csv_content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const baseName = (result.source_file || 'conversion').replace(/\.[^.]+$/, '');
    link.download = `${baseName}_converted.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[24px] font-heading font-bold text-deepBlue">Convertisseur ESPF → CSV (M4)</h2>
        <p className="text-[14px] text-text-2">Convertissez vos fichiers ESPF au format standard XBRL-CSV.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red/30 bg-red/10 px-4 py-3 text-[13px] text-red font-semibold">
          {error}
        </div>
      )}

      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-[18px] font-bold text-deepBlue">Conversion fichier vers XBRL-CSV</h3>
            <p className="text-[13px] text-text-3">Importe un fichier source, normalise les colonnes et génère un CSV exportable.</p>
          </div>
          <div className="flex items-center gap-3">
            <input type="file" onChange={e => setSourceFile(e.target.files?.[0] || null)} className="text-[12px]" />
            <button onClick={handleConvert} disabled={!sourceFile || isConverting} className="px-5 py-2.5 bg-deepBlue text-white rounded-lg text-[13px] font-bold disabled:bg-deepBlue/60 disabled:cursor-not-allowed">
              {isConverting ? 'Conversion...' : 'Convertir'}
            </button>
            <button onClick={handleDownloadCsv} disabled={!result?.csv_content} className="px-5 py-2.5 bg-magenta text-white rounded-lg text-[13px] font-bold disabled:bg-magenta/60 disabled:cursor-not-allowed">
              Télécharger CSV
            </button>
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border bg-bg">
                <div className="text-[12px] text-text-3">Fichier source</div>
                <div className="text-[14px] font-bold text-deepBlue">{result.source_file}</div>
              </div>
              <div className="p-4 rounded-xl border border-border bg-bg">
                <div className="text-[12px] text-text-3">Lignes converties</div>
                <div className="text-[14px] font-bold text-deepBlue">{result.rows_total}</div>
              </div>
              <div className="p-4 rounded-xl border border-border bg-bg">
                <div className="text-[12px] text-text-3">Colonnes</div>
                <div className="text-[14px] font-bold text-deepBlue">{result.columns.length}</div>
              </div>
            </div>

            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-bg border-b border-border text-text-3">
                  <tr>
                    {previewColumns.map(col => (
                      <th key={col} className="px-4 py-3 uppercase text-[11px]">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.preview_rows.slice(0, 40).map((row, idx) => (
                    <tr key={idx} className="border-b border-bg hover:bg-bg/60">
                      {previewColumns.map(col => (
                        <td key={`${idx}-${col}`} className="px-4 py-2 text-text-2">{row[col] === null || row[col] === undefined ? '—' : String(row[col])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-[16px] font-bold text-deepBlue mb-4">Historique des conversions</h3>
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-[13px] text-text-3">Aucune conversion enregistrée.</div>
          ) : history.slice(0, 8).map(item => (
            <div key={item._id} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <div className="text-[13px] font-bold text-deepBlue">{item.source_file}</div>
                <div className="text-[11px] text-text-3">{item.created_at ? new Date(item.created_at).toLocaleString('fr-FR') : '-'}</div>
              </div>
              <div className="text-[12px] font-bold text-deepBlue">{item.rows_total} lignes</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Converter;
