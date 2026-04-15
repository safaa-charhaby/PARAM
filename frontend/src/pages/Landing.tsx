import React, { useEffect } from 'react';

interface LandingProps {
  onNavigate: (page: string) => void;
}

const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen font-sans text-text overflow-x-hidden bg-bg">
      {/* HEADER B2B Style */}
      <header className="fixed top-0 left-0 w-full h-[80px] bg-white border-b border-border flex items-center justify-between px-6 md:px-12 z-50">
        <div className="flex items-center gap-3 font-heading font-extrabold text-[22px] text-deepBlue cursor-pointer" onClick={() => onNavigate('home')}>
          <div className="w-[36px] h-[36px] bg-magenta text-white flex items-center justify-center font-bold text-[18px]">
            P
          </div>
          ParamIQ
        </div>
        
        <nav className="hidden lg:flex items-center gap-10 text-[14px] font-bold text-text-2">
          <a href="#features" className="hover:text-magenta transition-colors">Solutions</a>
          <a href="#steps" className="hover:text-magenta transition-colors">Notre Approche</a>
          <a href="#roles" className="hover:text-magenta transition-colors">Plateforme</a>
          <a href="#about" className="hover:text-magenta transition-colors">À propos</a>
        </nav>

        <div className="flex items-center gap-4">
          <button className="hidden md:block px-6 py-2.5 text-[14px] font-bold text-deepBlue hover:text-magenta transition-colors" onClick={() => onNavigate('login')}>
            Connexion client
          </button>
          <button className="px-6 py-2.5 text-[14px] font-bold text-white bg-deepBlue hover:bg-magenta transition-all" onClick={() => onNavigate('login')}>
            Espace Paramétrique →
          </button>
        </div>
      </header>

      {/* HERO SECTION - SBS Corporate Look */}
      <section className="pt-[160px] pb-24 px-6 md:px-12 bg-bg relative overflow-hidden">
        {/* Geometric Accents */}
        <div className="absolute top-0 right-0 w-[50vw] h-full bg-[#f1f5f9] -skew-x-12 transform origin-top-right z-0"></div>
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-magenta/5 rounded-full z-0"></div>

        <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 mb-6 font-bold text-[12px] tracking-widest text-deepBlue uppercase border-l-4 border-magenta pl-3">
              Logiciel réglementaire
            </div>
            
            <h1 className="text-[52px] md:text-[68px] font-heading font-extrabold text-[#0f172a] leading-[1.05] tracking-tight mb-8">
              Sécurisez <br /> 
              votre <span className="text-deepBlue">reporting</span> <br />
              financier
            </h1>
            
            <p className="text-[18px] text-text-2 leading-relaxed max-w-[500px] mb-12">
              Une plateforme dédiée aux établissements financiers. Automatisez, validez et comparez vos formulaires réglementaires avec l'aide de l'Intelligence Artificielle.
            </p>

            <div className="flex flex-wrap gap-4 border-l-4 border-cyan pl-6 my-10 bg-white p-6 shadow-sm">
               <p className="text-[14px] text-text leading-relaxed font-medium">"L'assurance d'une conformité totale EBA, de la donnée source à la soumission."</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 text-[15px] font-bold text-white bg-magenta hover:bg-deepBlue transition-all shadow-md" onClick={() => onNavigate('login')}>
                Accéder à la plateforme
              </button>
              <a href="#features" className="px-8 py-4 text-[15px] font-bold text-deepBlue border border-border bg-white hover:bg-bg transition-colors">
                Découvrir les solutions
              </a>
            </div>
          </div>

          <div className="relative hidden lg:block">
            {/* Clean Professional Dashboard Mockup */}
            <div className="bg-white border-t-4 border-magenta p-8 shadow-2xl relative z-10">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <div className="font-heading font-bold text-deepBlue">Rapport XBRL-CSV</div>
                <div className="text-[12px] bg-green/10 text-green px-3 py-1 font-bold">Conforme EBA</div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[12px] text-text-2 font-bold uppercase">Validation structure</div>
                    <div className="text-[24px] font-heading font-bold text-deepBlue">100%</div>
                  </div>
                  <div className="w-[120px] h-[4px] bg-bg"><div className="w-full h-full bg-deepBlue"></div></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[12px] text-text-2 font-bold uppercase">Anomalies détectées</div>
                    <div className="text-[24px] font-heading font-bold text-magenta">2</div>
                  </div>
                  <div className="w-[120px] h-[4px] bg-bg"><div className="w-[30%] h-full bg-magenta"></div></div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[12px] text-text-2 font-bold uppercase">Comparaison version</div>
                    <div className="text-[24px] font-heading font-bold text-cyan">+14</div>
                  </div>
                  <div className="w-[120px] h-[4px] bg-bg"><div className="w-[85%] h-full bg-cyan"></div></div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border grid grid-cols-2 gap-4">
                 <div className="bg-bg p-4 flex items-center gap-3">
                   <div className="text-magenta text-xl">✓</div>
                   <div className="text-[12px] font-bold text-deepBlue">Tests passés</div>
                 </div>
                 <div className="bg-bg p-4 flex items-center gap-3">
                   <div className="text-magenta text-xl">⚡</div>
                   <div className="text-[12px] font-bold text-deepBlue">Exécution IA</div>
                 </div>
              </div>
            </div>
            {/* Geometric decoration */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-cyan/10 z-0"></div>
            <div className="absolute -top-6 -right-6 w-24 h-24 border-4 border-yellowVibrant/20 z-0 text-yellowVibrant text-[80px] leading-none text-center font-serif">"</div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="bg-deepBlue py-16 text-white text-center border-b-8 border-magenta">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-[48px] font-heading font-extrabold mb-2 text-cyan">99%</div>
            <div className="text-[14px] font-bold uppercase tracking-wider text-white/70">Fiabilité des données</div>
          </div>
          <div>
            <div className="text-[48px] font-heading font-extrabold mb-2 text-cyan">7</div>
            <div className="text-[14px] font-bold uppercase tracking-wider text-white/70">Modules intégrés</div>
          </div>
          <div>
            <div className="text-[48px] font-heading font-extrabold mb-2 text-cyan">AI</div>
            <div className="text-[14px] font-bold uppercase tracking-wider text-white/70">Moteur d'analyse</div>
          </div>
          <div>
            <div className="text-[48px] font-heading font-extrabold mb-2 text-cyan">24h</div>
            <div className="text-[14px] font-bold uppercase tracking-wider text-white/70">De gain de temps</div>
          </div>
        </div>
      </section>

      {/* NOTRE APPROCHE (STEPS) */}
      <section id="steps" className="py-24 bg-bg border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4 font-bold text-[12px] tracking-widest text-magenta uppercase">
              Workflow Automatisé
            </div>
            <h2 className="text-[42px] font-heading font-extrabold text-deepBlue mb-6">Notre Approche en 4 étapes</h2>
            <p className="text-[18px] text-text-2 max-w-[700px] mx-auto">De l'intégration des données brutes jusqu'à la livraison du rapport conforme.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-8 left-[10%] w-[80%] h-0.5 bg-border z-0"></div>
            {[
              { n: '1', t: 'Intégration', d: 'Dépôt sécurisé de vos maquettes XL/CSV/XML.' },
              { n: '2', t: 'Validation EBA', d: 'Vérification syntaxique et sémantique.' },
              { n: '3', t: 'Analyse IA', d: 'Détection statistique des erreurs cachées.' },
              { n: '4', t: 'Livraison', d: 'Génération du rapport XBRL-CSV finalisé.' }
            ].map((s, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center p-6 bg-white border border-border shadow-sm group hover:border-deepBlue transition-colors">
                <div className="w-16 h-16 bg-white border-2 border-magenta rounded-none flex items-center justify-center text-[24px] font-heading font-bold text-magenta mb-6 transform group-hover:-translate-y-2 transition-transform">
                  {s.n}
                </div>
                <h3 className="text-[18px] font-bold text-deepBlue mb-3">{s.t}</h3>
                <p className="text-[14px] text-text-2">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A PROPOS */}
      <section id="about" className="py-24 bg-white border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 mb-4 font-bold text-[12px] tracking-widest text-magenta uppercase">
              À propos de ParamIQ
            </div>
            <h2 className="text-[42px] font-heading font-extrabold text-deepBlue mb-6">La fusion de l'expertise métier et de l'intelligence artificielle</h2>
            <p className="text-[16px] text-text-2 leading-relaxed mb-6">
              ParamIQ est née d'un besoin croissant de sécuriser et d'accélérer les processus de reporting imposés par l'Autorité Bancaire Européenne (EBA).
            </p>
            <p className="text-[16px] text-text-2 leading-relaxed mb-8">
              En couplant des moteurs de validation heuristiques à des modèles de Machine Learning (IsolationForest) et des LLM (Agentic RAG), nous transformons un centre de coût en un centre de qualité stratégique.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-bg border border-border text-center hover:bg-magenta/5 transition-colors">
                <div className="text-[28px] font-bold text-deepBlue mb-1">+60%</div>
                <div className="text-[13px] text-text-2">Gains de productivité</div>
              </div>
              <div className="p-4 bg-bg border border-border text-center hover:bg-magenta/5 transition-colors">
                <div className="text-[28px] font-bold text-deepBlue mb-1">0 defect</div>
                <div className="text-[13px] text-text-2">Qualité garantie</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="w-full h-full bg-[#f1f5f9] -skew-y-3 transform absolute inset-0 z-0 border border-border"></div>
            <div className="bg-deepBlue p-10 text-white relative z-10 shadow-xl">
              <div className="text-cyan text-4xl mb-6">"</div>
              <p className="text-[20px] font-light leading-relaxed mb-8 italic">
                Notre mission est d'éliminer les frictions techniques du paramétrage XBRL pour permettre aux analystes de se concentrer sur l'analyse réglementaire pure.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold text-lg">O</div>
                <div>
                  <div className="font-bold text-[15px]">Oumaima O.</div>
                  <div className="text-[13px] text-cyan">Créatrice - ParamIQ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTIONS B2B */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 mb-4 font-bold text-[12px] tracking-widest text-magenta uppercase">
              Nos Solutions
            </div>
            <h2 className="text-[42px] font-heading font-extrabold text-deepBlue mb-6">Expertise réglementaire & technologique</h2>
            <p className="text-[18px] text-text-2 max-w-[700px] mx-auto">Couvrez l'ensemble de votre chaîne de valeur reporting grâce à nos modules spécialisés.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="border border-border bg-bg p-10 hover:border-deepBlue transition-colors group">
              <div className="w-16 h-16 bg-white border border-border flex items-center justify-center text-3xl mb-8 group-hover:bg-deepBlue group-hover:text-white transition-colors text-deepBlue">
                1
              </div>
              <h3 className="text-[20px] font-heading font-bold text-deepBlue mb-4">Core Validation</h3>
              <p className="text-[15px] text-text-2 leading-relaxed mb-6">Moteur de contrôle qualité des fichiers XBRL. Vérification exhaustive des datatypes, contextes et structures obligatoires des instances.</p>
              <ul className="space-y-3 text-[14px] font-medium text-text">
                <li className="flex items-center gap-2"><span className="text-cyan font-bold">✓</span> Support XBRL-CSV & XML</li>
                <li className="flex items-center gap-2"><span className="text-cyan font-bold">✓</span> Rendu des erreurs immédiat</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="border border-border bg-bg p-10 hover:border-deepBlue transition-colors group">
              <div className="w-16 h-16 bg-white border border-border flex items-center justify-center text-3xl mb-8 group-hover:bg-deepBlue group-hover:text-white transition-colors text-deepBlue">
                2
              </div>
              <h3 className="text-[20px] font-heading font-bold text-deepBlue mb-4">IA & Anomalies</h3>
              <p className="text-[15px] text-text-2 leading-relaxed mb-6">Algorithme d'intelligence artificielle détectant les incohérences métier et les variances inexpliquées dans vos reportings.</p>
              <ul className="space-y-3 text-[14px] font-medium text-text">
                <li className="flex items-center gap-2"><span className="text-magenta font-bold">✓</span> Modèles prédictifs entraînés</li>
                <li className="flex items-center gap-2"><span className="text-magenta font-bold">✓</span> Base RAG sur taxonomie EBA</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="border border-border bg-bg p-10 hover:border-deepBlue transition-colors group">
              <div className="w-16 h-16 bg-white border border-border flex items-center justify-center text-3xl mb-8 group-hover:bg-deepBlue group-hover:text-white transition-colors text-deepBlue">
                3
              </div>
              <h3 className="text-[20px] font-heading font-bold text-deepBlue mb-4">Automatisation (CI/CD)</h3>
              <p className="text-[15px] text-text-2 leading-relaxed mb-6">Orchestration complète du flux de travail : du dépôt fichier jusqu'au versionnage Git automatisé via des pipelines PowerShell sécurisés.</p>
              <ul className="space-y-3 text-[14px] font-medium text-text">
                <li className="flex items-center gap-2"><span className="text-yellowVibrant font-bold">✓</span> Scripts PowerShell natifs</li>
                <li className="flex items-center gap-2"><span className="text-yellowVibrant font-bold">✓</span> Intégration Git transparente</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* RÔLES */}
      <section id="roles" className="py-24 bg-bg border-t border-border">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 mb-4 font-bold text-[12px] tracking-widest text-magenta uppercase">
              Gestion des accès
            </div>
            <h2 className="text-[36px] font-heading font-extrabold text-deepBlue mb-6">Une plateforme, deux niveaux d'expertise</h2>
            <p className="text-[16px] text-text-2 mb-8 leading-relaxed">
              ParamIQ sépare strictement les habilitations pour répondre aux exigences des environnements bancaires, assurant confidentialité et intégrité.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4 p-6 bg-white border border-border shadow-sm">
                <div className="w-12 h-12 bg-deepBlue text-white flex items-center justify-center text-xl font-bold shrink-0">AD</div>
                <div>
                  <h4 className="text-[18px] font-bold text-deepBlue mb-2">Pôle Administration</h4>
                  <p className="text-[14px] text-text-2">Direction et supervision technique. Accès total aux historiques, lancement des pipelines et gestion globale des droits.</p>
                </div>
              </div>
              <div className="flex gap-4 p-6 bg-white border border-border shadow-sm">
                <div className="w-12 h-12 border-2 border-deepBlue text-deepBlue flex items-center justify-center text-xl font-bold shrink-0">AN</div>
                <div>
                  <h4 className="text-[18px] font-bold text-deepBlue mb-2">Pôle Analyste Métier</h4>
                  <p className="text-[14px] text-text-2">Consultants réglementaires de terrain. Valident les données, interagissent avec l'IA et génèrent les rapports de conformité.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-12 shadow-xl border-t-8 border-deepBlue text-center relative">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-magenta/10 z-0 hidden md:block"></div>
            <h3 className="text-[24px] font-heading font-bold text-deepBlue mb-6 relative z-10">Prêt à moderniser votre chaîne de reporting ?</h3>
            <p className="text-[15px] text-text-2 mb-8 relative z-10">Accédez dès maintenant à votre espace sécurisé.</p>
            <button className="w-full py-4 text-[15px] font-bold text-white bg-magenta hover:bg-deepBlue transition-colors relative z-10" onClick={() => onNavigate('login')}>
              Connexion à la plateforme
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER CORP */}
      <footer className="bg-[#0f172a] text-white border-t border-border">
        <div className="max-w-[1200px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 text-white/50 space-y-6">
            <div className="flex items-center gap-3 font-heading font-extrabold text-[20px] text-white">
              <div className="w-[32px] h-[32px] bg-magenta text-white flex items-center justify-center font-bold text-[15px]">P</div>
              ParamIQ
            </div>
            <p className="text-[14px] leading-relaxed max-w-[400px]">
              La solution logicielle choisie par les institutions financières pour la maîtrise et l'automatisation de leur paramétrage réglementaire.
            </p>
            <div className="text-[14px]">
              <span className="text-magenta font-bold">Email : </span> oumas.oumaima2b@gmail.com<br/>
              <span className="text-cyan font-bold">Institution : </span> EMSI Casablanca
            </div>
          </div>
          <div>
            <h4 className="text-[14px] font-bold text-white mb-6 uppercase tracking-widest">Solutions</h4>
            <ul className="space-y-3 text-[14px] text-white/50">
              <li><a href="#" className="hover:text-white transition-colors">Validation XBRL</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Détection IA</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Comparateur</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Automatisation Git</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[14px] font-bold text-white mb-6 uppercase tracking-widest">Société</h4>
            <ul className="space-y-3 text-[14px] text-white/50">
              <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="bg-[#0b1120] py-6 text-center text-[12px] text-white/30">
          © 2026 ParamIQ. Tous droits réservés. Une solution sécurisée pour le reporting financier.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
