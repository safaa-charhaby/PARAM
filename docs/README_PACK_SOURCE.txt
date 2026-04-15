Package: Assistant Validation XBRL + Detection Anomalies

Contenu:
- app.py
- pages/02_validation_xbrl.py
- xbrl_anomaly_explainer_v2.py
- eba_xbrl_rules_engine.py

Execution:
1) pip install streamlit pandas numpy scikit-learn openpyxl
2) streamlit run app.py

Note:
- Le moteur charge la base KB depuis INPUT/data si disponible.
- Les explications IA de formule EBA sont actives dans xbrl_anomaly_explainer_v2.py.
