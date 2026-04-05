import React from 'react';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-[20px] font-heading font-bold text-navy">Bonjour Oumaima 👋 — Voici l'état de la plateforme</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card shadow-sm border border-border">
          <div className="text-[13px] font-medium text-text-2 mb-1">Fichiers validés</div>
          <div className="text-[34px] font-heading font-bold text-navy mb-1">142</div>
          <div className="text-[12px] text-green font-medium">+12 ce mois</div>
        </div>
        <div className="card shadow-sm border border-border">
          <div className="text-[13px] font-medium text-text-2 mb-1">Taux de conformité</div>
          <div className="text-[34px] font-heading font-bold text-navy mb-1">87%</div>
          <div className="text-[12px] text-brand-magenta font-medium">-3% vs mois dernier</div>
        </div>
        <div className="card shadow-sm border border-border">
          <div className="text-[13px] font-medium text-text-2 mb-1">Erreurs détectées</div>
          <div className="text-[34px] font-heading font-bold text-navy mb-1">38</div>
          <div className="text-[12px] text-red font-medium">8 critiques</div>
        </div>
        {/* <div className="card shadow-sm border border-border">
          <div className="text-[13px] font-medium text-text-2 mb-1">Pipelines lancés</div>
          <div className="text-[34px] font-heading font-bold text-navy mb-1">21</div>
          <div className="text-[12px] text-green font-medium">Tous réussis</div>
        </div> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card shadow-sm border border-border lg:col-span-2">
          <div className="text-[14px] font-bold text-navy mb-6">Validations par semaine</div>
          {/* Simple CSS Bar chart matching screenshot */}
          <div className="flex items-end gap-2 h-[140px] px-2">
            {[
              { label: 'S1', h: '40%', bg: 'bg-brand-blue/40' },
              { label: 'S2', h: '55%', bg: 'bg-brand-blue/50' },
              { label: 'S3', h: '90%', bg: 'bg-brand-blue' },
              { label: 'S4', h: '44%', bg: 'bg-brand-blue/40' },
              { label: 'S5', h: '66%', bg: 'bg-brand-blue/60' },
              { label: 'S6', h: '100%', bg: 'bg-brand-blue' },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className={`w-full ${bar.bg} rounded-t-sm`} style={{ height: bar.h }}></div>
                <div className="text-[11px] text-text-3 font-medium">{bar.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card shadow-sm border border-border">
          <div className="text-[14px] font-bold text-navy mb-4">Activité récente</div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-2 hover:bg-bg rounded-lg cursor-pointer transition-colors" onClick={() => onNavigate?.('validation')}>
              <span className="badge badge-ok w-[40px] justify-center text-[10px]">OK</span>
              <span className="text-[13px] text-text-2">banque_mars.csv validé</span>
            </div>
            <div className="flex items-center gap-3 p-2 hover:bg-bg rounded-lg cursor-pointer transition-colors" onClick={() => onNavigate?.('validation')}>
              <span className="badge badge-err w-[40px] justify-center text-[10px]">ERR</span>
              <span className="text-[13px] text-text-2">assurance_v2.csv — 3 erreurs</span>
            </div>
            <div className="flex items-center gap-3 p-2 hover:bg-bg rounded-lg cursor-pointer transition-colors" onClick={() => onNavigate?.('comparateur')}>
              <span className="badge badge-info w-[40px] justify-center text-[10px]">DIFF</span>
              <span className="text-[13px] text-text-2">Comparaison v1 vs v2</span>
            </div>
            <div className="flex items-center gap-3 p-2 hover:bg-bg rounded-lg cursor-pointer transition-colors" onClick={() => onNavigate?.('assistant')}>
              <span className="badge w-[40px] justify-center text-[10px] bg-brand-magenta/10 text-brand-magenta">IA</span>
              <span className="text-[13px] text-text-2">5 anomalies ML détectées</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
