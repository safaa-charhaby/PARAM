# ParamIQ Expert XBRL Knowledge Base / Base de Connaissance Expert XBRL

## [FR] Erreur NULL VALUE sur unitRef
Une erreur "NULL VALUE sur unitRef" indique généralement qu'une unité monétaire ou numérique est absente pour un fait rapporté qui l'exige. Pour corriger cela, assurez-vous que chaque élément numérique (comme les montants monétaires) est associé à un attribut `unitRef` valide pointant vers une définition d'unité (ex: `u-monetary-EUR`).

## [EN] NULL VALUE error on unitRef
A "NULL VALUE on unitRef" error typically indicates that a monetary or numeric unit is missing for a reported fact that requires it. To fix this, ensure that every numeric element (such as monetary amounts) is associated with a valid `unitRef` attribute pointing to a unit definition (e.g., `u-monetary-EUR`).

## [FR] Concept us-gaap:Assets
Le concept `us-gaap:Assets` représente la somme totale des actifs (ressources contrôlées par l'entité) figurant au bilan. Cela inclut les actifs courants (trésorerie, créances) et non courants (immobilisations). Dans le cadre d'un mapping XBRL, c'est l'un des éléments fondamentaux de l'état de situation financière.

## [EN] us-gaap:Assets concept
The `us-gaap:Assets` concept represents the total sum of assets (resources controlled by the entity) appearing on the balance sheet. This includes current assets (cash, receivables) and non-current assets (fixed assets). In an XBRL mapping context, it is one of the fundamental elements of the statement of financial position.

## [FR] Actif Net (Net Assets)
L'Actif Net correspond à la différence entre le total des actifs et le total des passifs. C'est synonyme des capitaux propres (Equity). Le mapping de l'actif net nécessite souvent de réconcilier plusieurs concepts du plan comptable avec les tags XBRL appropriés comme `us-gaap:NetAssets`.

## [EN] Net Assets
Net Assets corresponds to the difference between total assets and total liabilities. It is synonymous with Equity. Mapping net assets often requires reconciling several accounting chart concepts with appropriate XBRL tags like `us-gaap:NetAssets`.

## [FR] Validation XBRL-CSV
La validation XBRL-CSV vérifie que les fichiers CSV respectent la structure JSON/XBRL définie par les autorités financières (EBA, EIOPA). Elle contrôle les types de données, les périodes de rapport et les unités utilisées.

## [EN] XBRL-CSV Validation
XBRL-CSV validation ensures that CSV files comply with the JSON/XBRL structure defined by financial authorities (EBA, EIOPA). It checks data types, reporting periods, and units used.
