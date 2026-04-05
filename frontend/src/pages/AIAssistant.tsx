import React, { useState, useRef, useEffect } from 'react';

const AIAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'fr' | 'en'>('fr');
  
  const [messagesFr, setMessagesFr] = useState([
    { role: 'assistant', content: "Bonjour ! Je suis l'Expert IA ParamIQ. Je peux vous aider à comprendre vos données XBRL, expliquer des anomalies ou vous guider dans l'utilisation de la plateforme. Comment puis-je vous aider aujourd'hui ?" }
  ]);
  
  const [messagesEn, setMessagesEn] = useState([
    { role: 'assistant', content: "Hello! I am the ParamIQ AI Expert. I can help you understand your XBRL data, explain anomalies, or guide you through the platform's features. How can I assist you today?" }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = activeTab === 'fr' ? messagesFr : messagesEn;
  const setMessages = activeTab === 'fr' ? setMessagesFr : setMessagesEn;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesFr, messagesEn, isLoading, activeTab]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: userMsg,
          lang: activeTab 
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur réseau');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: activeTab === 'fr' ? "Désolé, une erreur est survenue." : "Sorry, an error occurred." }]);
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
          <h2 className="text-[20px] font-heading font-bold text-navy">
            {activeTab === 'fr' ? 'Assistant IA — Expert EBA' : 'AI Assistant — EBA Expert'}
          </h2>
          <p className="text-[14px] text-text-2">
            {activeTab === 'fr' 
              ? "Demandez l'explication d'une anomalie ou validez la cohérence d'un concept DPM."
              : "Ask for an anomaly explanation or validate DPM concept consistency."
            }
          </p>
        </div>
        
        {/* Language Tabs */}
        <div className="flex bg-[#f1f5f9] p-1 rounded-lg border border-border">
          <button 
            onClick={() => setActiveTab('fr')}
            className={`px-4 py-1.5 text-[13px] font-bold rounded-md transition-all ${activeTab === 'fr' ? 'bg-white shadow-sm text-blue' : 'text-text-2 hover:text-navy'}`}
          >
            🇫🇷 Français
          </button>
          <button 
            onClick={() => setActiveTab('en')}
            className={`px-4 py-1.5 text-[13px] font-bold rounded-md transition-all ${activeTab === 'en' ? 'bg-white shadow-sm text-blue' : 'text-text-2 hover:text-navy'}`}
          >
            🇺🇸 English
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 h-[500px]">
        {/* Prompts Sidebar */}
        <div className="w-[260px] bg-white border border-border rounded-xl p-5 flex flex-col gap-3 shrink-0 shadow-sm">
          <h3 className="text-[14px] font-bold text-navy mb-2">
            {activeTab === 'fr' ? "Prompts prêts à l'emploi" : "Ready-to-use Prompts"}
          </h3>
          
          {activeTab === 'fr' ? (
            <>
              <button onClick={() => setPrompt("Explique-moi comment corriger une erreur NULL VALUE sur unitRef.")} className="w-full py-2.5 px-3 bg-brand-cyan/5 border border-brand-cyan/20 text-brand-blue text-[13px] font-medium rounded-lg text-left hover:bg-brand-cyan/10 transition-colors">
                Expliquer une erreur de validation
              </button>
              <button onClick={() => setPrompt("Que signifie le concept us-gaap:Assets dans ce contexte ?")} className="w-full py-2.5 px-3 bg-bg border border-border text-text-2 text-[13px] font-medium rounded-lg text-left hover:bg-border transition-colors">
                Valider la cohérence d'un concept
              </button>
              <button onClick={() => setPrompt("Peux-tu m'aider à comprendre le mapping de l'actif net ?")} className="w-full py-2.5 px-3 bg-bg border border-border text-text-2 text-[13px] font-medium rounded-lg text-left hover:bg-border transition-colors">
                Aide au mapping ESPF
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setPrompt("How to fix a NULL VALUE error on unitRef?")} className="w-full py-2.5 px-3 bg-brand-cyan/5 border border-brand-cyan/20 text-brand-blue text-[13px] font-medium rounded-lg text-left hover:bg-brand-cyan/10 transition-colors">
                Explain a validation error
              </button>
              <button onClick={() => setPrompt("What does the us-gaap:Assets concept mean?")} className="w-full py-2.5 px-3 bg-bg border border-border text-text-2 text-[13px] font-medium rounded-lg text-left hover:bg-border transition-colors">
                Validate concept consistency
              </button>
              <button onClick={() => setPrompt("Analyze net asset mapping.")} className="w-full py-2.5 px-3 bg-bg border border-border text-text-2 text-[13px] font-medium rounded-lg text-left hover:bg-border transition-colors">
                Mapping assistance
              </button>
            </>
          )}
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-white border border-border rounded-xl flex flex-col shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-[#f8fafc]">
            <div className="flex items-center gap-3">
              <div className="w-[32px] h-[32px] bg-brand-blue text-white rounded-lg flex items-center justify-center font-bold text-[12px] shadow-sm">
                AI
              </div>
              <span className="text-[15px] font-bold text-navy">
                {activeTab === 'fr' ? 'Expert Modèle EBA' : 'EBA Model Expert'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-brand-cyan">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
              {activeTab === 'fr' ? 'En ligne (FastAPI)' : 'Online (FastAPI)'}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 pb-8 space-y-6 bg-white">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'assistant' ? (
                  <div className="w-[30px] h-[30px] bg-brand-blue text-white rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 transform rotate-[-5deg]">
                    AI
                  </div>
                ) : (
                  <div className="w-[30px] h-[30px] bg-[#f1f5f9] text-[#475569] rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 border border-border">
                    YOU
                  </div>
                )}
                
                <div className={`p-4 rounded-2xl text-[14px] max-w-[85%] whitespace-pre-wrap leading-relaxed shadow-sm ${
                  msg.role === 'assistant' 
                    ? 'bg-[#f1f5f9] border border-[#e2e8f0] text-navy rounded-tl-sm' 
                    : 'bg-brand-magenta text-white rounded-tr-sm shadow-md'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-[30px] h-[30px] bg-brand-blue text-white rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0">
                  AI
                </div>
                <div className="p-4 rounded-2xl text-[14px] bg-[#f1f5f9] border border-[#e2e8f0] text-navy rounded-tl-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
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
              className="flex-1 border border-[#e2e8f0] rounded-xl px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta bg-white transition-all disabled:bg-[#f1f5f9]"
            />
            <button 
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-brand-magenta text-white rounded-xl text-[14px] font-bold hover:bg-brand-magenta/90 transition-all shadow-md disabled:opacity-50 active:scale-95"
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
