import React from 'react';

const Pipeline: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[24px] font-heading font-bold text-navy">Pipeline & Git Automatisé (M5-M6)</h2>
        <p className="text-[14px] text-text-2">Suivez l'état de vos déploiements et la synchronisation avec le dépôt Git SBS.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-navy">État du Dépôt</h3>
            <span className="px-3 py-1 bg-green/10 text-green rounded-full text-[11px] font-bold uppercase">Synchronisé</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-text-2">Dernier Commit</span>
              <code className="text-orange font-bold">#a8f2e91</code>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-text-2">Branche</span>
              <span className="font-medium text-navy">main / prod</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-text-2">Dernière MaJ</span>
              <span className="font-medium text-navy">Il y a 2 heures</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-navy mb-6">File d'attente Pipeline</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-bg rounded-lg border border-border opacity-50">
              <div className="w-8 h-8 bg-blue/10 text-blue rounded-full flex items-center justify-center text-[14px]">⚙️</div>
              <div className="flex-1">
                <div className="text-[13px] font-bold text-navy">Duplication Taxonomy EBA 3.2</div>
                <div className="text-[11px] text-text-3">En attente des fichiers source</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-bg rounded-lg border border-border opacity-50">
              <div className="w-8 h-8 bg-blue/10 text-blue rounded-full flex items-center justify-center text-[14px]">⚙️</div>
              <div className="flex-1">
                <div className="text-[13px] font-bold text-navy">Génération userTemplates EBA 4.0</div>
                <div className="text-[11px] text-text-3">En attente de validation M1</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-navy p-8 rounded-xl text-white flex items-center justify-between">
        <div>
          <h4 className="text-[18px] font-bold mb-2">Lancer une nouvelle instance</h4>
          <p className="text-white/60 text-[13px]">Initialise un nouveau dictionnaire pattern via PowerShell.</p>
        </div>
        <button className="px-6 py-3 bg-orange hover:bg-orange-h text-white rounded-lg text-[14px] font-bold transition-all shadow-lg">
          Démarrer le Pipeline →
        </button>
      </div>
    </div>
  );
};

export default Pipeline;
