import React, { useState, useRef, useEffect } from 'react';
import { useAnalysis } from '../contexts/AnalysisContext';

const AIAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'fr' | 'en'>('fr');
  
  const [messagesFr, setMessagesFr] = useState([
    { role: 'assistant', content: "Bonjour ! Je suis l'Expert IA ParamIQ. Je suis entraîné sur les règles métier EBA et les taxonomies. Posez-moi vos questions par exemple sur la conversion ESPF, ou une explication détaillée d'anomalie détectée au cours de la validation de vos fichiers." }
  ]);
  
  const [messagesEn, setMessagesEn] = useState([
    { role: 'assistant', content: "Hello! I am the ParamIQ AI Expert. I am trained on EBA business rules and taxonomies. Ask me your questions, for example, about ESPF conversion, or a detailed explanation of an anomaly detected during your file validation." }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { selectedAnomaly, currentAnalysis } = useAnalysis();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const messages = activeTab === 'fr' ? messagesFr : messagesEn;
  const setMessages = activeTab === 'fr' ? setMessagesFr : setMessagesEn;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesFr, messagesEn, isLoading, activeTab]);

  // Auto-prompt from selected anomaly
  useEffect(() => {
    if (selectedAnomaly) {
      const autoPromptFr = `Anomalie \u00e0 expliquer du fichier "${currentAnalysis?.fileName}":\n\n**Titre:** ${selectedAnomaly.title}\n**D\u00e9tail:** ${selectedAnomaly.detail}\n**Classe:** ${selectedAnomaly.classification}\n**R\u00e8gle:** ${selectedAnomaly.rule_label}\n\nPeux-tu:\n1. Expliquer ce qui est caus\u00e9 cette anomalie\n2. Donner les \u00e9tapes de correction pr\u00e9cises\n3. Indiquer les risks si non-corrig\u00e9`;
      const autoPromptEn = `Anomaly to explain from file "${currentAnalysis?.fileName}":\n\n**Title:** ${selectedAnomaly.title}\n**Detail:** ${selectedAnomaly.detail}\n**Classification:** ${selectedAnomaly.classification}\n**Rule:** ${selectedAnomaly.rule_label}\n\nPlease:\n1. Explain what caused this anomaly\n2. Provide precise correction steps\n3. Indicate risks if not corrected`;
      
      const prompt = activeTab === 'fr' ? autoPromptFr : autoPromptEn;
      setMessages(prev => [...prev, { role: 'assistant', content: `Anomalie charg\u00e9e. Voici mon analyse...` }]);
      setInput(prompt);
    }
  }, [selectedAnomaly, activeTab, currentAnalysis?.fileName]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: userMsg,
          lang: activeTab,
          context: 'ParamIQ assistant with XBRL anomaly detection enabled'
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur réseau');
      }

      // Initialiser le slot de message vide pour le streaming
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Aucun flux de réponse');
      
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let assistantMessage = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          assistantMessage += chunk;
          
          setMessages(prev => {
            const newArray = [...prev];
            newArray[newArray.length - 1] = { ...newArray[newArray.length - 1], content: assistantMessage };
            return newArray;
          });
        }
      }
      
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: activeTab === 'fr' ? "Désolé, une erreur technique est survenue." : "Sorry, an error occurred." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const setPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-[20px] font-heading font-bold text-deepBlue">
            {activeTab === 'fr' ? 'Assistant IA — Moteur PACK' : 'AI Assistant — PACK Engine'}
          </h2>
          <p className="text-[14px] text-text-2">
            {activeTab === 'fr' 
              ? "Explications EBA Rules + IsolationForest Statistical Detection pour anomalies XBRL."
              : "EBA Rules + IsolationForest explanations for XBRL anomalies."
            }
          </p>
        </div>
        
        {/* Language Tabs */}
        <div className="flex bg-[#f1f5f9] p-1 rounded-lg border border-border">
          <button 
            onClick={() => setActiveTab('fr')}
            className={`px-4 py-1.5 text-[13px] font-bold rounded-md transition-all ${activeTab === 'fr' ? 'bg-white shadow-sm text-blue' : 'text-text-2 hover:text-deepBlue'}`}
          >
            🇫🇷 Français
          </button>
          <button 
            onClick={() => setActiveTab('en')}
            className={`px-4 py-1.5 text-[13px] font-bold rounded-md transition-all ${activeTab === 'en' ? 'bg-white shadow-sm text-blue' : 'text-text-2 hover:text-deepBlue'}`}
          >
            🇺🇸 English
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 h-[500px]">
        {/* Prompts Sidebar */}
        <div className="w-[260px] bg-white border border-border rounded-xl p-5 flex flex-col gap-3 shrink-0 shadow-sm">
          <h3 className="text-[14px] font-bold text-deepBlue mb-2">
            {activeTab === 'fr' ? "Moteur PACK" : "PACK Engine"}
          </h3>
          
          {activeTab === 'fr' ? (
            <>
              <button onClick={() => setPrompt("Quelles sont les règles EBA/XBRL pour valider unitRef et contextRef ?")} className="w-full py-2.5 px-3 bg-[#eff6ff] border border-[#bfdbfe] text-[#1d4ed8] text-[13px] font-medium rounded-lg text-left hover:bg-[#dbeafe] transition-colors">
                Règles métier EBA
              </button>
              <button onClick={() => setPrompt("Comment IsolationForest détecte les anomalies statistiques dans mes données XBRL ?")} className="w-full py-2.5 px-3 bg-bg border border-border text-text-2 text-[13px] font-medium rounded-lg text-left hover:bg-border transition-colors">
                Détection statistique
              </button>
              <button onClick={() => setPrompt("Explique-moi les différentes classifications d'anomalies: BUSINESS_VIOLATION, VALID_RARE, VALID_NORMAL")} className="w-full py-2.5 px-3 bg-bg border border-border text-text-2 text-[13px] font-medium rounded-lg text-left hover:bg-border transition-colors">
                Classifications d'anomalies
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setPrompt("What are the EBA/XBRL rules for validating unitRef and contextRef?")} className="w-full py-2.5 px-3 bg-[#eff6ff] border border-[#bfdbfe] text-[#1d4ed8] text-[13px] font-medium rounded-lg text-left hover:bg-[#dbeafe] transition-colors">
                EBA Business Rules
              </button>
              <button onClick={() => setPrompt("How does IsolationForest detect statistical anomalies in my XBRL data?")} className="w-full py-2.5 px-3 bg-bg border border-border text-text-2 text-[13px] font-medium rounded-lg text-left hover:bg-border transition-colors">
                Statistical Detection
              </button>
              <button onClick={() => setPrompt("Explain the anomaly classifications: BUSINESS_VIOLATION, VALID_RARE, VALID_NORMAL")} className="w-full py-2.5 px-3 bg-bg border border-border text-text-2 text-[13px] font-medium rounded-lg text-left hover:bg-border transition-colors">
                Anomaly Classifications
              </button>
            </>
          )}
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-white border border-border rounded-xl flex flex-col shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-[#f8fafc]">
            <div className="flex items-center gap-3">
              <div className="w-[32px] h-[32px] bg-blue text-white rounded-lg flex items-center justify-center font-bold text-[12px] shadow-sm">
                AI
              </div>
              <span className="text-[15px] font-bold text-deepBlue">
                {activeTab === 'fr' ? 'Expert Modèle EBA' : 'EBA Model Expert'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#15803d]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse"></span>
              {activeTab === 'fr' ? 'En ligne (FastAPI)' : 'Online (FastAPI)'}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 pb-8 space-y-6 bg-white">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'assistant' ? (
                  <div className="w-[30px] h-[30px] bg-blue text-white rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 transform rotate-[-5deg]">
                    AI
                  </div>
                ) : (
                  <div className="w-[30px] h-[30px] bg-[#f1f5f9] text-[#475569] rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 border border-border">
                    YOU
                  </div>
                )}
                
                <div className={`p-4 rounded-2xl text-[14px] max-w-[85%] whitespace-pre-wrap leading-relaxed shadow-sm ${
                  msg.role === 'assistant' 
                    ? 'bg-[#f1f5f9] border border-[#e2e8f0] text-deepBlue rounded-tl-sm' 
                    : 'bg-blue text-white rounded-tr-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-[30px] h-[30px] bg-blue text-white rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0">
                  AI
                </div>
                <div className="p-4 rounded-2xl text-[14px] bg-[#f1f5f9] border border-[#e2e8f0] text-deepBlue rounded-tl-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-[#f8fafc] flex gap-3">
            <input 
              type="text" 
              placeholder={activeTab === 'fr' ? "Posez votre question ici..." : "Ask your question here..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              disabled={isLoading}
              className="flex-1 border border-[#e2e8f0] rounded-xl px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue bg-white transition-all disabled:bg-[#f1f5f9]"
            />
            <button 
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-blue text-white rounded-xl text-[14px] font-bold hover:bg-deepBlue transition-all shadow-md disabled:opacity-50 active:scale-95"
            >
              {activeTab === 'fr' ? 'Envoyer' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
