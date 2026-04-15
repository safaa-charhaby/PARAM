import React, { useState, useRef } from 'react';
import { useAnalysis } from '../contexts/AnalysisContext';

interface ValidationProps {
  onNavigate?: (page: string) => void;
}

const Validation: React.FC<ValidationProps> = ({ onNavigate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setCurrentAnalysis, addToHistory, currentAnalysis } = useAnalysis();

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/xml',
      'application/zip',
      'text/xml',
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls|xml|xbrl|ixbrl|zip)$/i)) {
      setError('Format de fichier non supporté. Acceptés: CSV, XLSX, XML, XBRL, iXBRL, ZIP');
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      const response = await new Promise<Response>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(new Response(xhr.responseText, { status: xhr.status }));
          } else {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Erreur réseau'));
        xhr.open('POST', `${API_BASE}/api/xbrl/analyze`);
        xhr.send(formData);
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: 'Erreur d\'analyse' }));
        throw new Error(errData.detail || 'Erreur lors de l\'analyse');
      }

      const data = await response.json();

      const analysisResult = {
        fileName: selectedFile.name,
        analysisDate: new Date().toLocaleString('fr-FR'),
        score: data.score || 0,
        total_lines: data.total_lines || 0,
        critique_cnt: data.critique_cnt || 0,
        warn_cnt: data.warn_cnt || 0,
        issues_total: data.issues_total || 0,
        issues: data.issues || [],
        analysis_summary: data.analysis_summary || {},
      };

      setCurrentAnalysis(analysisResult);
      addToHistory(analysisResult);

      // Auto-navigate to anomalies if there are issues
      if ((data.critique_cnt > 0 || data.warn_cnt > 0) && onNavigate) {
        setTimeout(() => onNavigate('anomalies'), 500);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'analyse';
      setError(message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-[20px] font-heading font-bold text-deepBlue">Validation de fichier XBRL</h2>
        <p className="text-[14px] text-text-2">Dépose ton fichier pour obtenir un rapport de conformité instantané</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[220px] ${
              selectedFile ? 'border-green bg-green/5' : 'border-border-2 bg-white hover:border-magenta hover:bg-magenta/5'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center w-full">
                <div className="w-8 h-8 border-4 border-magenta border-t-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="text-[15px] font-bold text-deepBlue mb-2">Analyse PACK en cours...</h3>
                <div className="w-full h-2 bg-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-magenta transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-[12px] text-text-2 mt-2">{uploadProgress}%</p>
              </div>
            ) : selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-[15px] font-bold text-green mb-1">Prêt à analyser</h3>
                <p className="text-[13px] text-text-2">{selectedFile.name}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpload();
                  }}
                  className="mt-4 px-6 py-2 bg-green text-white rounded-lg text-[13px] font-bold hover:bg-green/90 transition-colors"
                >
                  Lancer l'analyse PACK
                </button>
              </div>
            ) : (
              <>
                <div className="text-4xl mb-3">📁</div>
                <h3 className="text-[15px] font-bold text-deepBlue mb-1">Glisse ton fichier ici</h3>
                <p className="text-[13px] text-text-3 mb-4">ou clique pour parcourir</p>
                <p className="text-[12px] text-text-3 mb-4">CSV, XLSX, XML, iXBRL, ZIP acceptés</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.xml,.xbrl,.ixbrl,.zip"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {error && (
            <div className="card shadow-sm border border-red/30 bg-[#fff7f7] text-[13px] text-red p-4">
              {error}
            </div>
          )}

          <div className="card shadow-sm">
            <h3 className="text-[14px] font-bold text-deepBlue mb-4">Moteur d'analyse</h3>
            <div className="space-y-3 text-[13px]">
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded border border-blue bg-blue text-white flex items-center justify-center text-[10px] mt-0.5">✓</div>
                <div>
                  <div className="font-bold text-deepBlue">Règles métier EBA/XBRL</div>
                  <div className="text-text-2">Validation unitRef, contextRef, decimals, cohérence tag/valeur</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded border border-blue bg-blue text-white flex items-center justify-center text-[10px] mt-0.5">✓</div>
                <div>
                  <div className="font-bold text-deepBlue">Détection statistique (IsolationForest)</div>
                  <div className="text-text-2">Identification de valeurs aberrantes en contexte</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded border border-blue bg-blue text-white flex items-center justify-center text-[10px] mt-0.5">✓</div>
                <div>
                  <div className="font-bold text-deepBlue">Classification intelligente</div>
                  <div className="text-text-2">BUSINESS_VIOLATION / VALID_RARE / VALID_NORMAL</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded border border-blue bg-blue text-white flex items-center justify-center text-[10px] mt-0.5">✓</div>
                <div>
                  <div className="font-bold text-deepBlue">Explications IA contextualisées</div>
                  <div className="text-text-2">Chaque anomalie expliquée avec actions de correction</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card shadow-sm pt-8 pb-6 px-6 text-center">
            <p className="text-[14px] text-text-2 mb-4">Score de conformité</p>
            <div className="text-6xl font-heading font-bold text-blue mb-2">{currentAnalysis ? `${currentAnalysis.score}%` : '--'}</div>
            <p className="text-[13px] text-text-3">{currentAnalysis ? 'Analyse complétée' : 'En attente d\'analyse'}</p>
          </div>

          <div className="card shadow-sm p-6 space-y-4">
            <h3 className="text-[14px] font-bold text-deepBlue">Informations d'analyse</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue/5 rounded p-3 border border-blue/10">
                <div className="text-[12px] text-text-2">Lignes</div>
                <div className="text-2xl font-bold text-blue">{currentAnalysis?.total_lines || '--'}</div>
              </div>
              <div className="bg-red/5 rounded p-3 border border-red/10">
                <div className="text-[12px] text-text-2">Critiques</div>
                <div className="text-2xl font-bold text-red">{currentAnalysis?.critique_cnt || '0'}</div>
              </div>
              <div className="bg-amber/5 rounded p-3 border border-amber/10">
                <div className="text-[12px] text-text-2">Warnings</div>
                <div className="text-2xl font-bold text-amber">{currentAnalysis?.warn_cnt || '0'}</div>
              </div>
              <div className="bg-green/5 rounded p-3 border border-green/10">
                <div className="text-[12px] text-text-2">Fiables</div>
                <div className="text-2xl font-bold text-green">{currentAnalysis ? currentAnalysis.total_lines - (currentAnalysis.critique_cnt + currentAnalysis.warn_cnt) : '--'}</div>
              </div>
            </div>

            {currentAnalysis && (
              <button
                onClick={() => onNavigate?.('anomalies')}
                className="w-full mt-4 py-2 bg-blue text-white rounded-lg text-[13px] font-bold hover:bg-[#2563eb] transition-colors"
              >
                Voir tous les détails →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Validation;
