import React from 'react';

interface AnomaliesProps {
  onNavigate?: (page: string) => void;
}

const Anomalies: React.FC<AnomaliesProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-[20px] font-heading font-bold text-navy">Détection d'anomalies — Intelligence Artificielle</h2>
        <p className="text-[14px] text-text-2">Le modèle ML analyse tes données et détecte les valeurs suspectes automatiquement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          <div className="card shadow-sm border border-border">
            <h3 className="text-[15px] font-bold text-navy mb-5">Comment ça marche ?</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-blue/10 text-blue flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5">1</div>
                <div className="text-[13px] text-navy font-medium">Le modèle est entraîné sur des millions de fichiers XBRL réels (SEC)</div>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-blue/10 text-blue flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5">2</div>
                <div className="text-[13px] text-navy font-medium">Il apprend ce qui est "normal" pour chaque concept financier</div>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-blue/10 text-blue flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5">3</div>
                <div className="text-[13px] text-navy font-medium">Sur ton fichier, il donne un score de risque à chaque ligne</div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border border-border">
            <h3 className="text-[15px] font-bold text-navy mb-5">Score de risque global</h3>
            <div className="flex items-center gap-6 mb-6">
              <div className="w-[72px] h-[72px] rounded-full border-[3px] border-red flex items-center justify-center text-[22px] font-heading font-bold text-red">
                23%
              </div>
              <div>
                <div className="text-[14px] font-bold text-navy">Risque modéré</div>
                <div className="text-[13px] text-text-2">8 anomalies sur 142 lignes</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#fef2f2] rounded p-3 text-center border border-[#fee2e2]">
                <div className="text-[18px] font-bold text-[#b91c1c]">3</div>
                <div className="text-[12px] text-[#b91c1c]">Critiques</div>
              </div>
              <div className="bg-[#fffbeb] rounded p-3 text-center border border-[#fef9c3]">
                <div className="text-[18px] font-bold text-[#a16207]">5</div>
                <div className="text-[12px] text-[#a16207]">Suspects</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border border-border">
          <h3 className="text-[15px] font-bold text-navy mb-5">Anomalies détectées</h3>
          
          <div className="space-y-3 mb-6">
            <div className="bg-[#fef2f2] border border-[#fca5a5] rounded-lg p-4">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[14px] font-bold text-navy">us-gaap:CashAndEquivalents</span>
                <span className="bg-[#ef4444] text-white text-[11px] font-bold px-2 py-0.5 rounded">Risque 91%</span>
              </div>
              <div className="text-[13px] text-[#7f1d1d]">Valeur 10× supérieure à la normale pour ce secteur. Ligne 42.</div>
            </div>

            <div className="bg-[#fef2f2] border border-[#fca5a5] rounded-lg p-4">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[14px] font-bold text-navy">ifrs:Equity — contexte manquant</span>
                <span className="bg-[#ef4444] text-white text-[11px] font-bold px-2 py-0.5 rounded">Risque 85%</span>
              </div>
              <div className="text-[13px] text-[#7f1d1d]">Valeur négative inhabituelle pour ce type de concept.</div>
            </div>

            <div className="bg-[#fffbeb] border border-[#fde047] rounded-lg p-4">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[14px] font-bold text-navy">us-gaap:Revenue — ligne 78</span>
                <span className="bg-[#d97706] text-white text-[11px] font-bold px-2 py-0.5 rounded">Risque 62%</span>
              </div>
              <div className="text-[13px] text-[#92400e]">Variation +340% vs période précédente. À vérifier.</div>
            </div>
          </div>

          <button onClick={() => onNavigate?.('assistant')} className="w-full py-3 bg-[#4f46e5] text-white rounded-lg text-[14px] font-bold hover:bg-[#4338ca] transition-colors flex items-center justify-center gap-2 shadow-sm">
            Demander une explication à l'IA →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Anomalies;
