import React from 'react';

interface ComparateurProps {
  onNavigate?: (page: string) => void;
}

const Comparateur: React.FC<ComparateurProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-[20px] font-heading font-bold text-navy">Comparateur cellule par cellule</h2>
        <p className="text-[14px] text-text-2">Compare deux versions d'un même fichier XBRL</p>
      </div>

      <div className="flex items-center justify-between gap-6 mb-8">
        <div className="flex-1 card py-6 px-4 text-center border-border shadow-sm">
          <div className="text-[13px] text-text-2 mb-2">Fichier A (version ancienne)</div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-text-3">📄</span>
            <span className="text-[14px] font-bold text-navy">rapport_v1.csv</span>
          </div>
        </div>
        <div className="text-[20px] text-text-3 font-heading font-bold">VS</div>
        <div className="flex-1 card py-6 px-4 text-center border-border shadow-sm">
          <div className="text-[13px] text-text-2 mb-2">Fichier B (nouvelle version)</div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-text-3">📄</span>
            <span className="text-[14px] font-bold text-navy">rapport_v2.csv</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#f0fdf4] rounded-lg p-4 text-center flex flex-col items-center justify-center border border-[#dcfce7]">
          <div className="text-[28px] font-heading font-bold text-[#15803d]">94%</div>
          <div className="text-[12px] text-[#15803d] font-medium mt-1">Similarité</div>
        </div>
        <div className="bg-[#eff6ff] rounded-lg p-4 text-center flex flex-col items-center justify-center border border-[#dbeafe]">
          <div className="text-[28px] font-heading font-bold text-[#1d4ed8]">+12</div>
          <div className="text-[12px] text-[#1d4ed8] font-medium mt-1">Lignes ajoutées</div>
        </div>
        <div className="bg-[#fef2f2] rounded-lg p-4 text-center flex flex-col items-center justify-center border border-[#fee2e2]">
          <div className="text-[28px] font-heading font-bold text-[#b91c1c]">-5</div>
          <div className="text-[12px] text-[#b91c1c] font-medium mt-1">Lignes supprimées</div>
        </div>
        <div className="bg-[#fffbeb] rounded-lg p-4 text-center flex flex-col items-center justify-center border border-[#fef9c3]">
          <div className="text-[28px] font-heading font-bold text-[#a16207]">23</div>
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
          <tbody className="text-navy divide-y divide-bg-2">
            <tr className="bg-[#fffbeb] hover:bg-[#fef9c3]/50 transition-colors">
              <td className="px-5 py-3">us-gaap:Assets</td>
              <td className="px-5 py-3">1 250 000</td>
              <td className="px-5 py-3 font-bold text-[#a16207]">1 380 000</td>
              <td className="px-5 py-3 font-bold text-[#a16207]">+10.4%</td>
            </tr>
            <tr className="bg-[#fef2f2] hover:bg-[#fee2e2]/50 transition-colors">
              <td className="px-5 py-3">us-gaap:Liabilities</td>
              <td className="px-5 py-3">890 000</td>
              <td className="px-5 py-3 font-bold text-[#b91c1c]">740 000</td>
              <td className="px-5 py-3 font-bold text-[#b91c1c]">-16.9%</td>
            </tr>
            <tr className="hover:bg-bg transition-colors">
              <td className="px-5 py-3">us-gaap:NetIncome</td>
              <td className="px-5 py-3">125 000</td>
              <td className="px-5 py-3">125 000</td>
              <td className="px-5 py-3 text-[#15803d]">Identique</td>
            </tr>
            <tr className="bg-[#f0fdf4] hover:bg-[#dcfce7]/50 transition-colors">
              <td className="px-5 py-3">ifrs:Revenue</td>
              <td className="px-5 py-3">—</td>
              <td className="px-5 py-3 font-bold text-[#15803d]">430 000</td>
              <td className="px-5 py-3 font-bold text-[#15803d]">Nouveau</td>
            </tr>
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
