import React, { useEffect } from 'react';

interface LandingProps {
  onNavigate: (page: string) => void;
}

const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-bg font-sans text-text overflow-x-hidden">
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full h-[70px] bg-brand-dark flex items-center justify-between px-6 md:px-12 z-50 shadow-md">
        <div className="flex items-center gap-3 font-heading font-bold text-[18px] text-white cursor-pointer" onClick={() => onNavigate('home')}>
          <div className="relative w-[32px] h-[32px] flex items-center justify-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-brand-yellow rotate-45 rounded-sm"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-brand-magenta rotate-45 rounded-sm"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-brand-magenta rotate-45 rounded-sm"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-brand-cyan rotate-45 rounded-sm"></div>
            <div className="absolute w-2 h-2 bg-brand-blue rotate-45 rounded-xs z-10"></div>
          </div>
          ParamIQ Platform
        </div>
        
        <nav className="hidden lg:flex items-center gap-8 text-[13px] font-medium text-white/80">
          <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
          <a href="#steps" className="hover:text-white transition-colors">Fonctionnement</a>
          <a href="#roles" className="hover:text-white transition-colors">Accès</a>
          <a href="#about" className="hover:text-white transition-colors">À propos</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </nav>

        <div className="flex items-center gap-4">
          <button className="hidden md:block px-5 py-2 rounded-lg text-[13px] font-bold text-white border border-white/20 hover:bg-white/10 transition-colors" onClick={() => onNavigate('login')}>
            Connexion
          </button>
          <button className="px-5 py-2 rounded-lg text-[13px] font-bold text-white bg-orange hover:bg-orange-h transition-all shadow-lg hover:-translate-y-0.5" onClick={() => onNavigate('login')}>
            Accéder à la plateforme →
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-[140px] pb-20 px-6 md:px-12 bg-gradient-to-br from-brand-dark to-navy-3 min-h-screen flex items-center relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] bg-brand-magenta/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-brand-blue/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange/30 bg-orange/10 text-[12px] text-orange-l mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse"></span>
              Plateforme Intelligente de Paramétrage & Mapping
            </div>
            
            <h1 className="text-[46px] md:text-[64px] font-heading font-extrabold text-white leading-[1.05] tracking-tight mb-6">
              Automatisez <br /> 
              votre <br />
              <span className="text-orange whitespace-nowrap">paramétrage</span> <br />
              avec l'IA
            </h1>
            
            <p className="text-[16px] text-white/70 leading-relaxed max-w-[500px] mb-10 font-light">
              Plateforme intelligente de validation, comparaison et analyse des fichiers de reporting financier. Conçue pour les équipes SBS, propulsée par l'Intelligence Artificielle.
            </p>

            <div className="flex flex-wrap gap-4 mb-16">
              <button className="px-8 py-3.5 rounded-xl text-[15px] font-bold text-white bg-orange hover:bg-orange-h transition-all shadow-xl hover:shadow-orange/30 hover:-translate-y-0.5" onClick={() => onNavigate('login')}>
                Démarrer maintenant →
              </button>
              <a href="#features" className="px-8 py-3.5 rounded-xl text-[15px] font-bold text-white border border-white/20 bg-white/5 hover:bg-white/10 transition-colors">
                Voir les fonctionnalités
              </a>
            </div>

            <div className="flex gap-10 pt-8 border-t border-white/10">
              <div>
                <div className="text-[28px] font-heading font-bold text-white">7</div>
                <div className="text-[13px] text-white/50">Modules intégrés</div>
              </div>
              <div>
                <div className="text-[28px] font-heading font-bold text-white">IA</div>
                <div className="text-[13px] text-white/50">Modèles sémantiques</div>
              </div>
              <div>
                <div className="text-[28px] font-heading font-bold text-white">100%</div>
                <div className="text-[13px] text-white/50">Web & Instantané</div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            {/* Fake Dashboard Mockup matching screenshot exactly */}
            <div className="bg-[#1e293b]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl relative z-10">
              <div className="flex items-center gap-2 mb-6 bg-[#0f172a]/50 p-2 rounded-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-red"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green"></div>
                <span className="text-[11px] text-white/30 ml-2">dashboard.paramiq.app</span>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                  <div className="text-[20px] font-heading font-bold text-green">142</div>
                  <div className="text-[10px] text-white/40">Fichiers validés</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                  <div className="text-[20px] font-heading font-bold text-orange">87%</div>
                  <div className="text-[10px] text-white/40">Conformité</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                  <div className="text-[20px] font-heading font-bold text-red">3</div>
                  <div className="text-[10px] text-white/40">Erreurs crit.</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[11px] text-white/50">
                  <span className="w-20">Validation</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange to-orange-h w-[87%] rounded-full"></div>
                  </div>
                  <span>87%</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-white/50">
                  <span className="w-20">Comparaison</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange to-orange-h w-[94%] rounded-full"></div>
                  </div>
                  <span>94%</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-white/50">
                  <span className="w-20">Pipeline</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange to-orange-h w-[100%] rounded-full"></div>
                  </div>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-green/10 border border-green/30 text-green px-4 py-2 rounded-lg text-[12px] font-bold backdrop-blur-md z-20 animate-[bounce_3s_ease-in-out_infinite]">
              ✓ 142 fichiers validés
            </div>
            <div className="absolute -bottom-6 -left-8 bg-brand-magenta/10 border border-brand-magenta/30 text-brand-magenta px-4 py-2 rounded-lg text-[12px] font-bold backdrop-blur-md z-20 animate-[bounce_4s_ease-in-out_infinite]">
              🤖 8 anomalies IA détectées
            </div>
          </div>
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <div className="text-[11px] font-bold tracking-widest text-orange uppercase mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-[2px] bg-orange"></span>
            Fonctionnalités
          </div>
          <h2 className="text-[42px] font-heading font-extrabold text-navy mb-4">Tout ce dont vous avez besoin pour le reporting XBRL</h2>
          <p className="text-[16px] text-text-2 mb-16 max-w-[700px] mx-auto">9 modules couvrant l'ensemble du cycle de vie du paramétrage, de la validation à la livraison finale.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {[
              { t: 'Validation XBRL-CSV', d: 'Contrôle automatique de la structure, colonnes obligatoires, formats contextRef et doublons. Génération de templates userTemplates.', b: 'Module M1', c: 'bg-blue/10 text-blue', i: '✅' },
              { t: 'Comparaison cellule par cellule', d: 'Diff précis entre deux versions d\'un même rapport. Détection des ajouts, suppressions et modifications avec calcul des deltas.', b: 'Module M2', c: 'bg-green/10 text-green', i: '🔍' },
              { t: 'Détection d\'anomalies IA', d: 'Modèle ML entraîné sur les données XBRL SEC réelles. Score de risque par ligne, détection des valeurs hors-norme, explication automatique.', b: 'IA / M1', c: 'bg-purple/10 text-purple', i: '🤖' },
              { t: 'Générateur de formulaires', d: 'Génération automatique de formulaires XBRL avec datatypes génériques. Support des types monétaires, numériques, booléens et dates.', b: 'Module M3', c: 'bg-amber/10 text-amber', i: '📝' },
              { t: 'Conversion ESPF → CSV', d: 'Convertisseur automatique du format ESPF vers XBRL-CSV standard. Mapping intelligent avec assistance IA pour les cas ambigus.', b: 'Module M4', c: 'bg-orange/10 text-orange', i: '🔄' },
              { t: 'Pipeline & Git automatisé', d: 'Initialisation Git avec dictionnaire pattern. Pipeline de duplication, scénarios e2e et lancement automatique via PowerShell.', b: 'M5 - M6', c: 'bg-slate/10 text-slate', i: '⚙️' },
              { t: 'Assistant IA expert XBRL', d: 'Chatbot spécialisé proposé par Claude (Anthropic). 7 prompts réutilisables. Explications en français, corrections suggérées.', b: 'IA / M7', c: 'bg-indigo/10 text-indigo', i: '💬' },
              { t: 'Rapports PDF automatiques', d: 'Génération de rapports qualité professionnels. Résumé des validations, statistiques, erreurs classées par sévérité.', b: 'RAG / M8', c: 'bg-cyan/10 text-cyan', i: '📊' },
              { t: 'Authentification & rôles JWT', d: 'Sécurité JWT avec bcrypt. Deux rôles distincts : Admin (gestion complète) et Analyste XBRL (accès aux modules de traitement).', b: 'Sécurité', c: 'bg-rose/10 text-rose', i: '🔐' },
            ].map((f, i) => (
              <div key={i} className="card bg-white border border-border hover:shadow-xl transition-all p-8 group">
                <div className="w-12 h-12 rounded-xl bg-bg flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                  {f.i}
                </div>
                <h3 className="text-[18px] font-bold text-navy mb-3">{f.t}</h3>
                <p className="text-[14px] text-text-2 leading-relaxed mb-6">{f.d}</p>
                <span className={`inline-block px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${f.c}`}>
                  {f.b}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FONCTIONNEMENT */}
      <section id="steps" className="py-24 bg-bg relative">
        <div className="max-w-[1000px] mx-auto text-center px-6">
          <div className="text-[11px] font-bold tracking-widest text-orange uppercase mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-[2px] bg-orange"></span>
            Fonctionnement
          </div>
          <h2 className="text-[36px] font-heading font-extrabold text-navy mb-4">De l'upload à la livraison en 4 étapes</h2>
          <p className="text-[15px] text-text-2 mb-16">Un workflow guidé qui automatise les tâches répétitives de votre équipe SBS.</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative items-start">
            <div className="hidden md:block absolute top-[28px] left-[15%] w-[70%] h-[2px] bg-gradient-to-r from-transparent via-border-2 to-transparent z-0"></div>
            
            {[
              { n: '1', t: 'Déposez votre fichier', d: 'CSV, XLSX ou XML. Jusqu\'à 50 Mo acceptés directement.' },
              { n: '2', t: 'Validation automatique', d: 'Le moteur analyse structure, datatypes, doublons en secondes.' },
              { n: '3', t: 'Analyse IA', d: 'L\'IA détecte les anomalies, compare les versions et explique chaque erreur.' },
              { n: '4', t: 'Rapport & livraison', d: 'Export des tableaux comparatifs, lancement du pipeline et archivage.' }
            ].map((s, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center">
                <div className="w-[58px] h-[58px] bg-white border-2 border-orange rounded-full flex items-center justify-center text-[22px] font-heading font-bold text-orange mb-5 shadow-[0_0_0_8px_#f8fafc]">
                  {s.n}
                </div>
                <h3 className="text-[15px] font-bold text-navy mb-2">{s.t}</h3>
                <p className="text-[13px] text-text-2">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="py-24 bg-white border-t border-border">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="text-[11px] font-bold tracking-widest text-orange uppercase mb-4 flex items-center gap-3">
            <span className="w-8 h-[2px] bg-orange"></span>
            Accès & rôles
          </div>
          <h2 className="text-[36px] font-heading font-extrabold text-navy mb-4">Deux profils utilisateurs</h2>
          <p className="text-[15px] text-text-2 mb-12 max-w-[600px]">Chaque rôle a accès aux outils dont il a besoin, avec les permissions appropriées pour garantir la sécurité des données.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-[#101b2d] to-navy-3 p-10 rounded-2xl shadow-xl">
              <div className="inline-block px-4 py-1.5 rounded-full bg-orange/20 border border-orange/30 text-orange-l text-[12px] font-bold mb-6">
                👑 Administrateur
              </div>
              <h3 className="text-[24px] font-bold text-white mb-3">Admin SBS</h3>
              <p className="text-[14px] text-white/70 mb-8">
                Accès complet à la plateforme. Gère les utilisateurs, consulte tous les historiques, configure les paramètres et génère les rapports globaux.
              </p>
              <ul className="space-y-3 text-[14px] text-white/80">
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-orange rounded-full"></span>Gestion des utilisateurs et des rôles</li>
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-orange rounded-full"></span>Accès à tous les fichiers et historiques</li>
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-orange rounded-full"></span>Configuration du pipeline et paramètres</li>
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-orange rounded-full"></span>Export rapports globaux PDF</li>
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-orange rounded-full"></span>Supervision des anomalies IA</li>
              </ul>
            </div>

            <div className="bg-bg border border-border p-10 rounded-2xl shadow-sm">
              <div className="inline-block px-4 py-1.5 rounded-full bg-blue/10 border border-blue/20 text-blue text-[12px] font-bold mb-6">
                👤 Analyste
              </div>
              <h3 className="text-[24px] font-bold text-navy mb-3">Consultant SBS</h3>
              <p className="text-[14px] text-text-2 mb-8">
                Accès aux modules de traitement quotidien. Valide les fichiers, compare les versions, utilise l'assistant IA et suit l'état du pipeline.
              </p>
              <ul className="space-y-3 text-[14px] text-text-2">
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-blue rounded-full"></span>Validation et upload de fichiers</li>
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-blue rounded-full"></span>Comparaison cellule par cellule</li>
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-blue rounded-full"></span>Accès à l'assistant IA et aux prompts</li>
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-blue rounded-full"></span>Traitement des formules de calcul</li>
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-blue rounded-full"></span>Consultation de son historique personnel</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* À PROPOS */}
      <section id="about" className="py-24 bg-white border-t border-border">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-bg rounded-2xl border border-border">
                <div className="text-[32px] font-bold text-orange mb-1">99%</div>
                <div className="text-[13px] text-navy font-bold">Précision IA</div>
                <p className="text-[12px] text-text-3 mt-2">Algorithmes de détection d'anomalies avancés.</p>
              </div>
              <div className="p-6 bg-bg rounded-2xl border border-border">
                <div className="text-[32px] font-bold text-orange mb-1">+60%</div>
                <div className="text-[13px] text-navy font-bold">Productivité</div>
                <p className="text-[12px] text-text-3 mt-2">Réduction du temps de paramétrage manuel.</p>
              </div>
              <div className="p-6 bg-bg rounded-2xl border border-border">
                <div className="text-[32px] font-bold text-orange mb-1">RAG</div>
                <div className="text-[13px] text-navy font-bold">Expertise</div>
                <p className="text-[12px] text-text-3 mt-2">Base de connaissances EBA 4.0 intégrée.</p>
              </div>
              <div className="p-6 bg-bg rounded-2xl border border-border">
                <div className="text-[32px] font-bold text-orange mb-1">E2E</div>
                <div className="text-[13px] text-navy font-bold">Automation</div>
                <p className="text-[12px] text-text-3 mt-2">Pipeline complet de l'upload au Git.</p>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="text-[11px] font-bold tracking-widest text-orange uppercase mb-4 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-orange"></span>
              À propos
            </div>
            <h2 className="text-[42px] font-heading font-extrabold text-navy mb-6">L'expertise métier alliée à l'intelligence artificielle</h2>
            <p className="text-[16px] text-text-2 leading-relaxed mb-6">
              ParamIQ est une plateforme innovante conçue spécifiquement pour automatiser les flux de reporting réglementaire XBRL. 
              En combinant des règles métier strictes et des modèles de langage avancés, nous permettons aux analystes de se concentrer sur l'essentiel.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[14px] text-navy font-medium">
                <span className="text-orange">✔</span> Analyse sémantique ultra-rapide
              </div>
              <div className="flex items-center gap-3 text-[14px] text-navy font-medium">
                <span className="text-orange">✔</span> Conformité EBA garantie à 100%
              </div>
              <div className="flex items-center gap-3 text-[14px] text-navy font-medium">
                <span className="text-orange">✔</span> Interface intuitive sans code
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 bg-bg relative">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="text-[11px] font-bold tracking-widest text-orange uppercase mb-4 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-orange"></span>
              Contact
            </div>
            <h2 className="text-[48px] font-heading font-extrabold text-navy mb-6 leading-tight">Une question ?</h2>
            <p className="text-[16px] text-text-2 mb-12 max-w-[500px] leading-relaxed">
              N'hésitez pas à me contacter pour toute question sur le projet, une démonstration ou une collaboration.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-5 p-4 bg-white rounded-xl border border-border shadow-sm group hover:border-orange transition-colors">
                <div className="w-10 h-10 bg-orange/10 text-orange rounded-lg flex items-center justify-center text-[18px]">📧</div>
                <div>
                  <div className="text-[11px] text-text-3 font-bold uppercase tracking-wider">Email</div>
                  <div className="text-[14px] font-bold text-navy">oumas.oumaima2b@gmail.com</div>
                </div>
              </div>
              <div className="flex items-center gap-5 p-4 bg-white rounded-xl border border-border shadow-sm group hover:border-orange transition-colors">
                <div className="w-10 h-10 bg-orange/10 text-orange rounded-lg flex items-center justify-center text-[18px]">🎓</div>
                <div>
                  <div className="text-[11px] text-text-3 font-bold uppercase tracking-wider">Institution</div>
                  <div className="text-[14px] font-bold text-navy">EMSI Casablanca — Cycle Ingénieur</div>
                </div>
              </div>
              <div className="flex items-center gap-5 p-4 bg-white rounded-xl border border-border shadow-sm group hover:border-orange transition-colors">
                <div className="w-10 h-10 bg-orange/10 text-orange rounded-lg flex items-center justify-center text-[18px]">🐙</div>
                <div>
                  <div className="text-[11px] text-text-3 font-bold uppercase tracking-wider">GitHub</div>
                  <div className="text-[14px] font-bold text-navy">github.com/oumaoumaima</div>
                </div>
              </div>
              <div className="flex items-center gap-5 p-4 bg-white rounded-xl border border-border shadow-sm group hover:border-orange transition-colors">
                <div className="w-10 h-10 bg-orange/10 text-orange rounded-lg flex items-center justify-center text-[18px]">📍</div>
                <div>
                  <div className="text-[11px] text-text-3 font-bold uppercase tracking-wider">Localisation</div>
                  <div className="text-[14px] font-bold text-navy">Casablanca, Maroc</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-xl border border-border">
            <form className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-text-2 mb-2 uppercase tracking-wide">Votre nom</label>
                <input type="text" className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-[14px] text-navy outline-none focus:border-orange transition-colors" placeholder="Ahmed Benali" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-text-2 mb-2 uppercase tracking-wide">Email</label>
                <input type="email" className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-[14px] text-navy outline-none focus:border-orange transition-colors" placeholder="vous@entreprise.com" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-text-2 mb-2 uppercase tracking-wide">Sujet</label>
                <select className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-[14px] text-navy outline-none focus:border-orange transition-colors appearance-none cursor-pointer">
                  <option>Démonstration</option>
                  <option>Support technique</option>
                  <option>Partenariat</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-text-2 mb-2 uppercase tracking-wide">Message</label>
                <textarea className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-[14px] text-navy outline-none focus:border-orange transition-colors min-h-[120px]" placeholder="Votre message..."></textarea>
              </div>
              <button className="w-full py-4 bg-orange hover:bg-orange-h text-white rounded-xl text-[14px] font-bold shadow-lg shadow-orange/20 transition-all hover:-translate-y-0.5">
                Envoyer →
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#101b2d] pt-20 pb-10 text-white">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3 font-heading font-bold text-[18px] text-white">
              <div className="relative w-[32px] h-[32px] flex items-center justify-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-brand-yellow rotate-45 rounded-sm"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-brand-magenta rotate-45 rounded-sm"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-brand-magenta rotate-45 rounded-sm"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-brand-cyan rotate-45 rounded-sm"></div>
                <div className="absolute w-2 h-2 bg-brand-blue rotate-45 rounded-xs z-10"></div>
              </div>
              ParamIQ Platform
            </div>
            <p className="text-[14px] text-white/50 leading-relaxed">
              Plateforme intelligente d'automatisation du paramétrage XBRL. 
              Optimisez vos flux de reporting réglementaire avec l'assistance IA et la validation sémantique.
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-orange transition-colors cursor-pointer">in</div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-orange transition-colors cursor-pointer">tw</div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-orange transition-colors cursor-pointer">gh</div>
            </div>
          </div>

          <div>
            <h4 className="text-[13px] font-bold uppercase tracking-widest text-white mb-6">Plateforme</h4>
            <ul className="space-y-4 text-[14px] text-white/50">
              <li><button onClick={() => {document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}} className="hover:text-orange transition-colors">Fonctionnalités</button></li>
              <li><button onClick={() => {document.getElementById('steps')?.scrollIntoView({behavior:'smooth'})}} className="hover:text-orange transition-colors">Fonctionnement</button></li>
              <li><button onClick={() => {document.getElementById('roles')?.scrollIntoView({behavior:'smooth'})}} className="hover:text-orange transition-colors">Accès & Rôles</button></li>
              <li><button onClick={() => {document.getElementById('about')?.scrollIntoView({behavior:'smooth'})}} className="hover:text-orange transition-colors">À propos</button></li>
              <li><button onClick={() => onNavigate('login')} className="hover:text-orange transition-colors">Se connecter</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-bold uppercase tracking-widest text-white mb-6">Modules</h4>
            <ul className="space-y-4 text-[14px] text-white/50">
              <li><button onClick={() => onNavigate('login')} className="hover:text-orange transition-colors">Validation XBRL</button></li>
              <li><button onClick={() => onNavigate('login')} className="hover:text-orange transition-colors">Comparateur</button></li>
              <li><button onClick={() => onNavigate('login')} className="hover:text-orange transition-colors">Détection IA</button></li>
              <li><button onClick={() => onNavigate('login')} className="hover:text-orange transition-colors">Pipeline</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-bold uppercase tracking-widest text-white mb-6">Ressources</h4>
            <ul className="space-y-4 text-[14px] text-white/50">
              <li><button className="hover:text-orange transition-colors">Documentation</button></li>
              <li><button onClick={() => {document.getElementById('contact')?.scrollIntoView({behavior:'smooth'})}} className="hover:text-orange transition-colors">Contact</button></li>
              <li><button className="hover:text-orange transition-colors">GitHub</button></li>
              <li><button className="hover:text-orange transition-colors">API Docs</button></li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-white/30 text-[12px] gap-4">
          <div>© 2026 ParamIQ Platform — Solution de Paramétrage Intelligent</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
