import React, { createContext, useContext, useState } from 'react';

export interface Anomaly {
  severity: 'CRITIQUE' | 'WARN';
  title: string;
  detail: string;
  classification: string;
  rule_code: string;
  rule_label: string;
  ai_summary: string;
  ai_impact: string;
  ai_recommended_action: string;
  ai_formula_expected: string;
  ai_formula_detail: string;
  ai_explanation: string;
}

export interface AnalysisResult {
  fileName: string;
  analysisDate: string;
  score: number;
  total_lines: number;
  critique_cnt: number;
  warn_cnt: number;
  issues_total: number;
  issues: Anomaly[];
  analysis_summary: any;
}

interface AnalysisContextType {
  currentAnalysis: AnalysisResult | null;
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  analysisHistory: AnalysisResult[];
  addToHistory: (analysis: AnalysisResult) => void;
  clearAnalysis: () => void;
  selectedAnomaly: Anomaly | null;
  setSelectedAnomaly: (anomaly: Anomaly | null) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);

  const addToHistory = (analysis: AnalysisResult) => {
    setAnalysisHistory(prev => [analysis, ...prev].slice(0, 20)); // 20 derniers dans l'historique
  };

  const clearAnalysis = () => {
    setCurrentAnalysis(null);
    setSelectedAnomaly(null);
  };

  return (
    <AnalysisContext.Provider 
      value={{
        currentAnalysis,
        setCurrentAnalysis,
        analysisHistory,
        addToHistory,
        clearAnalysis,
        selectedAnomaly,
        setSelectedAnomaly,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within AnalysisProvider');
  }
  return context;
};
