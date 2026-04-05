import React, { useState } from 'react';

interface ValidationProps {
  onNavigate?: (page: string) => void;
}

const Validation: React.FC<ValidationProps> = ({ onNavigate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setShowResults(true);
    }, 1500);
  };
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-[20px] font-heading font-bold text-navy">Validation de fichier XBRL</h2>
        <p className="text-[14px] text-text-2">Dépose ton fichier pour obtenir un rapport de conformité instantané</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div onClick={handleUpload} className={`border-2 border-dashed ${showResults ? 'border-green bg-green/5' : 'border-border-2 bg-white hover:border-orange hover:bg-orange-l'} rounded-xl p-10 text-center transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[220px]`}>
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-orange border-t-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="text-[15px] font-bold text-navy">Analyse de la structure en cours...</h3>
              </div>
            ) : showResults ? (
              <div className="flex flex-col items-center">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-[15px] font-bold text-green mb-1">Fichier analysé avec succès !</h3>
                <p className="text-[13px] text-text-3">Rapport généré ci-contre.</p>
              </div>
            ) : (
              <>
                <div className="text-4xl mb-3">📁</div>
                <h3 className="text-[15px] font-bold text-navy mb-1">Glisse ton fichier ici</h3>
                <p className="text-[13px] text-text-3 mb-4">CSV, XLSX, XML, iXBRL acceptés</p>
                <button className="px-4 py-2 border border-border-2 bg-bg rounded-lg text-[13px] font-medium text-text-2 hover:bg-border transition-colors">
                  Parcourir...
                </button>
              </>
            )}
          </div>

          <div className="card shadow-sm">
            <h3 className="text-[14px] font-bold text-navy mb-4">Options</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-[14px] text-text-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue" />
                Vérifier la structure obligatoire
              </label>
              <label className="flex items-center gap-3 text-[14px] text-text-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue" />
                Détecter les doublons
              </label>
              <label className="flex items-center gap-3 text-[14px] text-text-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-blue" />
                Validation par taxonomie
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card shadow-sm pt-6 pb-5 px-6">
            <div className="flex justify-between items-end mb-3">
              <h3 className="text-[14px] font-bold text-navy">Score de conformité</h3>
              <span className="text-[28px] font-heading font-bold text-green leading-none">87%</span>
            </div>
            <div className="w-full h-3 bg-bg-2 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-green rounded-full" style={{ width: '87%' }}></div>
            </div>
            <div className="flex justify-between text-[13px] font-medium">
              <span className="text-text-2">1420 lignes analysées</span>
              <span className="text-red">3 erreurs critiques</span>
            </div>
          </div>

          <div className="card shadow-sm p-6">
            <h3 className="text-[14px] font-bold text-navy mb-4">Erreurs détectées</h3>
            <div className="space-y-3 mb-6">
              <div className="bg-[#fef2f2] border-l-[3px] border-red p-3 rounded-r-lg flex gap-3">
                <span className="bg-red text-white text-[10px] font-bold px-2 py-0.5 rounded h-fit mt-0.5">CRITIQUE</span>
                <div>
                  <div className="text-[13px] font-bold text-navy">Colonne 'unitRef' manquante</div>
                  <div className="text-[12px] text-red mt-0.5">Lignes 14, 27, 83</div>
                </div>
              </div>
              
              <div className="bg-[#fffbeb] border-l-[3px] border-amber p-3 rounded-r-lg flex gap-3">
                <span className="bg-amber text-white text-[10px] font-bold px-2 py-0.5 rounded h-fit mt-0.5">WARN</span>
                <div>
                  <div className="text-[13px] font-bold text-navy">Doublons de datapoints détectés</div>
                  <div className="text-[12px] text-amber mt-0.5">12 occurrences</div>
                </div>
              </div>

              <div className="bg-[#fffbeb] border-l-[3px] border-amber p-3 rounded-r-lg flex gap-3">
                <span className="bg-amber text-white text-[10px] font-bold px-2 py-0.5 rounded h-fit mt-0.5">WARN</span>
                <div>
                  <div className="text-[13px] font-bold text-navy">Format contextRef non standard</div>
                  <div className="text-[12px] text-amber mt-0.5">5 lignes concernées</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 py-2.5 bg-bg border border-border-2 rounded-lg text-[13px] font-bold text-text-2 hover:bg-border transition-colors">
                Exporter PDF
              </button>
              <button onClick={() => { if(onNavigate) onNavigate('assistant'); }} className="flex-1 py-2.5 bg-[#3b82f6] text-white rounded-lg text-[13px] font-bold hover:bg-blue transition-colors flex items-center justify-center gap-2 shadow-sm">
                Expliquer via IA →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Validation;
