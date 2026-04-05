import React from 'react';

const Generator: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[24px] font-heading font-bold text-navy">Générateur de Formulaires (M3)</h2>
        <p className="text-[14px] text-text-2">Générez automatiquement des formulaires XBRL avec datatypes génériques.</p>
      </div>
      
      <div className="bg-white border border-border rounded-2xl p-12 text-center shadow-sm">
        <div className="w-20 h-20 bg-amber/10 text-amber rounded-full flex items-center justify-center text-[32px] mx-auto mb-6">📝</div>
        <h3 className="text-[18px] font-bold text-navy mb-2">Module en cours de déploiement</h3>
        <p className="text-[14px] text-text-3 max-w-[400px] mx-auto mb-8">
          Ce module permettra de transformer vos taxonomies en formulaires de saisie web interactifs avec validation en temps réel.
        </p>
        <div className="flex justify-center gap-4">
          <div className="px-4 py-2 bg-bg border border-border rounded-lg text-[12px] font-bold text-text-2 uppercase tracking-wider">Status: Beta</div>
          <div className="px-4 py-2 bg-bg border border-border rounded-lg text-[12px] font-bold text-text-2 uppercase tracking-wider">Version: 0.8.2</div>
        </div>
      </div>
    </div>
  );
};

export default Generator;
