import React, { useEffect, useState } from 'react';

const Generator: React.FC = () => {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<{
    form_name: string;
    source_file: string;
    fields_total: number;
    fields: Array<{ name: string; label: string; datatype: string; required: boolean; placeholder: string }>;
  } | null>(null);
  const [history, setHistory] = useState<Array<{ _id: string; form_name: string; source_file: string; fields_total: number; created_at: string }>>([]);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/generator/forms`);
      const data = await response.json().catch(() => []);
      if (!response.ok) return;
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      // History is non-blocking for page interaction.
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleGenerate = async () => {
    if (!sourceFile || isGenerating) return;
    setIsGenerating(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', sourceFile);

      const response = await fetch(`${API_BASE}/api/generator/forms/from-file`, {
        method: 'POST',
        body: form,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || 'Impossible de générer le formulaire');
      }
      setFormData(data);
      fetchHistory();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de générer le formulaire';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[24px] font-heading font-bold text-deepBlue">Générateur de Formulaires (M3)</h2>
        <p className="text-[14px] text-text-2">Générez automatiquement des formulaires XBRL avec datatypes génériques.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red/30 bg-red/10 px-4 py-3 text-[13px] text-red font-semibold">
          {error}
        </div>
      )}

      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-[18px] font-bold text-deepBlue">Génération depuis taxonomie/fichier</h3>
            <p className="text-[13px] text-text-3">Charge un fichier, déduit les champs et produit un formulaire exploitable.</p>
          </div>
          <div className="flex items-center gap-3">
            <input type="file" onChange={e => setSourceFile(e.target.files?.[0] || null)} className="text-[12px]" />
            <button onClick={handleGenerate} disabled={!sourceFile || isGenerating} className="px-5 py-2.5 bg-amber text-white rounded-lg text-[13px] font-bold disabled:bg-amber/60 disabled:cursor-not-allowed">
              {isGenerating ? 'Génération...' : 'Générer'}
            </button>
          </div>
        </div>

        {formData && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border bg-bg">
                <div className="text-[12px] text-text-3">Nom formulaire</div>
                <div className="text-[14px] font-bold text-deepBlue">{formData.form_name}</div>
              </div>
              <div className="p-4 rounded-xl border border-border bg-bg">
                <div className="text-[12px] text-text-3">Source</div>
                <div className="text-[14px] font-bold text-deepBlue">{formData.source_file}</div>
              </div>
              <div className="p-4 rounded-xl border border-border bg-bg">
                <div className="text-[12px] text-text-3">Champs</div>
                <div className="text-[14px] font-bold text-deepBlue">{formData.fields_total}</div>
              </div>
            </div>

            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-bg border-b border-border text-text-3">
                  <tr>
                    <th className="px-4 py-3 uppercase text-[11px]">Nom</th>
                    <th className="px-4 py-3 uppercase text-[11px]">Label</th>
                    <th className="px-4 py-3 uppercase text-[11px]">Type</th>
                    <th className="px-4 py-3 uppercase text-[11px]">Requis</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.fields.slice(0, 40).map((field, idx) => (
                    <tr key={`${field.name}-${idx}`} className="border-b border-bg hover:bg-bg/60">
                      <td className="px-4 py-2 text-deepBlue">{field.name}</td>
                      <td className="px-4 py-2 text-text-2">{field.label}</td>
                      <td className="px-4 py-2 text-text-2">{field.datatype}</td>
                      <td className="px-4 py-2 text-text-2">{field.required ? 'Oui' : 'Non'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-[16px] font-bold text-deepBlue mb-4">Historique de génération</h3>
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-[13px] text-text-3">Aucune génération enregistrée.</div>
          ) : history.slice(0, 8).map(item => (
            <div key={item._id} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <div className="text-[13px] font-bold text-deepBlue">{item.form_name}</div>
                <div className="text-[11px] text-text-3">{item.source_file}</div>
              </div>
              <div className="text-right">
                <div className="text-[12px] font-bold text-deepBlue">{item.fields_total} champs</div>
                <div className="text-[11px] text-text-3">{item.created_at ? new Date(item.created_at).toLocaleString('fr-FR') : '-'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Generator;
