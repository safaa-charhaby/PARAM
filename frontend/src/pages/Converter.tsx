import React from 'react';

const Converter: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[24px] font-heading font-bold text-navy">Convertisseur ESPF → CSV (M4)</h2>
        <p className="text-[14px] text-text-2">Convertissez vos fichiers ESPF au format standard XBRL-CSV.</p>
      </div>
      
      <div className="bg-white border border-border rounded-2xl p-12 text-center shadow-sm">
        <div className="w-20 h-20 bg-orange/10 text-orange rounded-full flex items-center justify-center text-[32px] mx-auto mb-6">🔄</div>
        <h3 className="text-[18px] font-bold text-navy mb-2">Module en attente de fichiers</h3>
        <p className="text-[14px] text-text-3 max-w-[400px] mx-auto mb-8">
          Déposez vos fichiers ESPF pour lancer le mapping intelligent vers le format CSV compatible avec les taxonomies EBA.
        </p>
        <button className="px-6 py-2.5 bg-navy text-white rounded-lg text-[14px] font-bold flex items-center gap-2 mx-auto">
          📁 Sélectionner un fichier
        </button>
      </div>
    </div>
  );
};

export default Converter;
