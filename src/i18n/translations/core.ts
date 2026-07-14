import { TranslationDict } from './types';

/**
 * App chrome shared across every tab: header, nav, footer, session summary
 * strip, plus the Water Report tutorial callout (translated first as the
 * pilot slice). Keys are prefixed by area to stay collision-free against
 * the per-panel fragment files.
 */
export const coreTranslations = {
  'app.title': {
    en: "Indian Brewer's Calculator",
    de: 'Indischer Braurechner',
    hi: 'इंडियन ब्रूअर्स कैलकुलेटर',
    mr: 'इंडियन ब्रूअर्स कॅल्क्युलेटर',
  },
  'app.tagline': {
    en: 'A metric (L / HL / mg / g / °C) brewing water chemistry lab notebook.',
    de: 'Ein metrisches (L / HL / mg / g / °C) Laborbuch für Brauwasserchemie.',
    hi: 'ब्रूइंग वाटर केमिस्ट्री की मेट्रिक (L / HL / mg / g / °C) लैब नोटबुक।',
    mr: 'ब्रूइंग वॉटर केमिस्ट्रीची मेट्रिक (L / HL / mg / g / °C) लॅब नोटबुक.',
  },
  'app.goHome': { en: 'Go to Home overview', de: 'Zur Startseite', hi: 'होम पर जाएँ', mr: 'होमवर जा' },
  'app.stepOf': {
    en: 'Step {current} of {total}',
    de: 'Schritt {current} von {total}',
    hi: 'चरण {current} / {total}',
    mr: 'पायरी {current} / {total}',
  },
  'app.nextStep': { en: 'Next Step', de: 'Nächster Schritt', hi: 'अगला चरण', mr: 'पुढील पायरी' },
  'app.footer.builtBy': {
    en: 'Built by Ankur Napa',
    de: 'Erstellt von Ankur Napa',
    hi: 'अंकुर नापा द्वारा निर्मित',
    mr: 'अंकुर नापा यांनी तयार केले',
  },
  'app.footer.units': {
    en: 'All units metric: Liters, Hectoliters, milligrams, grams, °Celsius, °Lovibond for grain color.',
    de: 'Alle Einheiten metrisch: Liter, Hektoliter, Milligramm, Gramm, °Celsius, °Lovibond für Malzfarbe.',
    hi: 'सभी इकाइयाँ मेट्रिक हैं: लीटर, हेक्टोलीटर, मिलीग्राम, ग्राम, °सेल्सियस, तथा माल्ट रंग के लिए °लोविबॉन्ड।',
    mr: 'सर्व एकके मेट्रिक आहेत: लिटर, हेक्टोलिटर, मिलिग्रॅम, ग्रॅम, °सेल्सिअस, आणि माल्ट रंगासाठी °लोविबॉन्ड.',
  },
  'app.footer.privacy': {
    en: 'By default, this app does not collect or transmit your data anywhere -- all entries are saved only in your own browser’s local storage on this device, and clearing your browser data will erase it. If you choose to use Google Sync (Backup & Sync tab), your data is written to a private spreadsheet in your own Google Drive -- never to any server we run. We take no responsibility for the confidentiality or backup of data stored either way.',
    de: 'Standardmäßig sammelt oder überträgt diese App Ihre Daten nirgendwohin – alle Eingaben werden nur im lokalen Speicher Ihres eigenen Browsers auf diesem Gerät gespeichert, und das Löschen Ihrer Browserdaten löscht sie ebenfalls. Wenn Sie Google Sync (Tab „Backup & Sync“) nutzen, werden Ihre Daten in eine private Tabelle in Ihrem eigenen Google Drive geschrieben – niemals auf einen von uns betriebenen Server. Wir übernehmen keine Verantwortung für die Vertraulichkeit oder Sicherung der auf beide Arten gespeicherten Daten.',
    hi: 'डिफ़ॉल्ट रूप से, यह ऐप आपका डेटा कहीं भी एकत्र या प्रसारित नहीं करता -- सभी प्रविष्टियाँ केवल इस डिवाइस पर आपके अपने ब्राउज़र के लोकल स्टोरेज में सहेजी जाती हैं, और ब्राउज़र डेटा साफ़ करने पर यह मिट जाएगा। यदि आप Google Sync (बैकअप और सिंक टैब) का उपयोग करना चुनते हैं, तो आपका डेटा आपके अपने Google Drive की एक निजी स्प्रेडशीट में लिखा जाता है -- हमारे द्वारा संचालित किसी सर्वर पर कभी नहीं। दोनों ही तरीकों से संग्रहीत डेटा की गोपनीयता या बैकअप की हम कोई ज़िम्मेदारी नहीं लेते।',
    mr: 'डीफॉल्टनुसार, हे अ‍ॅप तुमचा डेटा कुठेही गोळा किंवा प्रसारित करत नाही -- सर्व नोंदी फक्त या डिव्हाइसवरील तुमच्या ब्राउझरच्या लोकल स्टोरेजमध्ये जतन होतात, आणि ब्राउझर डेटा साफ केल्यास तो नष्ट होईल. जर तुम्ही Google Sync (बॅकअप व सिंक टॅब) वापरायचे ठरवले, तर तुमचा डेटा तुमच्या स्वतःच्या Google Drive मधील खासगी स्प्रेडशीटमध्ये लिहिला जातो -- आम्ही चालवत असलेल्या कोणत्याही सर्व्हरवर कधीही नाही. दोन्ही प्रकारे साठवलेल्या डेटाच्या गोपनीयतेची किंवा बॅकअपची जबाबदारी आम्ही घेत नाही.',
  },
  'app.language.label': { en: 'Language', de: 'Sprache', hi: 'भाषा', mr: 'भाषा' },

  'tab.home.label': { en: 'Home', de: 'Start', hi: 'होम', mr: 'होम' },
  'tab.home.short': { en: 'Home', de: 'Start', hi: 'होम', mr: 'होम' },
  'tab.waterReport.label': { en: 'Water Report', de: 'Wasseranalyse', hi: 'जल रिपोर्ट', mr: 'पाणी अहवाल' },
  'tab.waterReport.short': { en: 'Water', de: 'Wasser', hi: 'जल', mr: 'पाणी' },
  'tab.mashAdjustment.label': { en: 'Mash Adjustment', de: 'Maischewasser', hi: 'मैश समायोजन', mr: 'मॅश समायोजन' },
  'tab.mashAdjustment.short': { en: 'Mash', de: 'Maische', hi: 'मैश', mr: 'मॅश' },
  'tab.spargeAdjustment.label': { en: 'Sparge Adjustment', de: 'Läuterwasser', hi: 'स्पार्ज समायोजन', mr: 'स्पार्ज समायोजन' },
  'tab.spargeAdjustment.short': { en: 'Sparge', de: 'Läutern', hi: 'स्पार्ज', mr: 'स्पार्ज' },
  'tab.waterVolumes.label': { en: 'Water Volumes', de: 'Wassermengen', hi: 'जल मात्रा', mr: 'पाण्याचे प्रमाण' },
  'tab.waterVolumes.short': { en: 'Volumes', de: 'Mengen', hi: 'मात्रा', mr: 'प्रमाण' },
  'tab.transferLautering.label': {
    en: 'Transfer & Lautering',
    de: 'Überführen & Läutern',
    hi: 'स्थानांतरण व छनाई',
    mr: 'स्थानांतर व गाळणी',
  },
  'tab.transferLautering.short': { en: 'Transfer', de: 'Überführen', hi: 'स्थानांतरण', mr: 'स्थानांतर' },
  'tab.brewhouse.label': { en: 'Brewhouse Calculators', de: 'Sudhaus-Rechner', hi: 'ब्रूहाउस कैलकुलेटर', mr: 'ब्रूहाऊस कॅल्क्युलेटर' },
  'tab.brewhouse.short': { en: 'Calcs', de: 'Rechner', hi: 'कैलकुलेटर', mr: 'कॅल्क्युलेटर' },
  'tab.fermentationTracker.label': {
    en: 'Fermentation Tracker',
    de: 'Gärprotokoll',
    hi: 'किण्वन ट्रैकर',
    mr: 'किण्वन ट्रॅकर',
  },
  'tab.fermentationTracker.short': { en: 'Ferment', de: 'Gärung', hi: 'किण्वन', mr: 'किण्वन' },
  'tab.styleCheck.label': { en: 'BJCP Style Check', de: 'BJCP-Stilprüfung', hi: 'BJCP शैली जाँच', mr: 'BJCP शैली तपासणी' },
  'tab.styleCheck.short': { en: 'Style', de: 'Stil', hi: 'शैली', mr: 'शैली' },
  'tab.blending.label': { en: 'Blending', de: 'Verschneiden', hi: 'मिश्रण', mr: 'मिश्रण' },
  'tab.blending.short': { en: 'Blend', de: 'Mischen', hi: 'मिश्रण', mr: 'मिश्रण' },
  'tab.mixingCross.label': { en: 'Mixing Cross', de: 'Mischungskreuz', hi: 'मिश्रण क्रॉस', mr: 'मिश्रण क्रॉस' },
  'tab.mixingCross.short': { en: 'Cross', de: 'Kreuz', hi: 'क्रॉस', mr: 'क्रॉस' },
  'tab.recipes.label': { en: 'Recipes', de: 'Rezepte', hi: 'रेसिपी', mr: 'पाककृती' },
  'tab.recipes.short': { en: 'Recipes', de: 'Rezepte', hi: 'रेसिपी', mr: 'पाककृती' },
  'tab.backup.label': { en: 'Backup & Sync', de: 'Sicherung & Sync', hi: 'बैकअप व सिंक', mr: 'बॅकअप व सिंक' },
  'tab.backup.short': { en: 'Backup', de: 'Sicherung', hi: 'बैकअप', mr: 'बॅकअप' },
  'tab.about.label': { en: 'About', de: 'Über', hi: 'परिचय', mr: 'परिचय' },
  'tab.about.short': { en: 'About', de: 'Über', hi: 'परिचय', mr: 'परिचय' },

  'summary.targetStyle': { en: 'Target Style', de: 'Zielstil', hi: 'लक्ष्य शैली', mr: 'लक्ष्य शैली' },
  'summary.grainBill': { en: 'Grain Bill', de: 'Schüttung', hi: 'ग्रेन बिल', mr: 'ग्रेन बिल' },
  'summary.batchVolume': { en: 'Batch Volume', de: 'Sudvolumen', hi: 'बैच मात्रा', mr: 'बॅच प्रमाण' },
  'summary.spargeVolume': { en: 'Sparge Volume', de: 'Läuterwassermenge', hi: 'स्पार्ज मात्रा', mr: 'स्पार्ज प्रमाण' },
  'summary.og': { en: 'OG', de: 'SG (Stammwürze)', hi: 'OG (प्रारंभिक घनत्व)', mr: 'OG (प्रारंभिक घनता)' },
  'summary.fg': { en: 'FG', de: 'EG (Restextrakt)', hi: 'FG (अंतिम घनत्व)', mr: 'FG (अंतिम घनता)' },

  'waterReport.tutorial.title': {
    en: 'How to use Water Report',
    de: 'So nutzen Sie die Wasseranalyse',
    hi: 'जल रिपोर्ट का उपयोग कैसे करें',
    mr: 'पाणी अहवाल कसा वापरावा',
  },
  'waterReport.tutorial.step1.lead': {
    en: '1. Pick which style you’re brewing.',
    de: '1. Wählen Sie den Bierstil, den Sie brauen.',
    hi: '1. वह शैली चुनें जिसे आप बना रहे हैं।',
    mr: '1. तुम्ही कोणती शैली तयार करत आहात ते निवडा.',
  },
  'waterReport.tutorial.step1.body': {
    en: 'This shows a matching target water profile right away, and sets the same target Mash Adjustment uses for salt additions.',
    de: 'Damit wird sofort ein passendes Zielwasserprofil angezeigt, das auch bei der Maischewasser-Anpassung für Salzgaben verwendet wird.',
    hi: 'इससे तुरंत एक मिलता-जुलता लक्ष्य जल प्रोफ़ाइल दिखता है, और यही लक्ष्य मैश समायोजन में नमक मिलाने के लिए भी उपयोग होता है।',
    mr: 'यामुळे लगेच एक जुळणारे लक्ष्य पाणी प्रोफाइल दिसते, आणि मॅश समायोजनमध्ये मीठ मिसळण्यासाठीही तेच लक्ष्य वापरले जाते.',
  },
  'waterReport.tutorial.step2.lead': {
    en: '2. Quick-fill or enter your source water.',
    de: '2. Wählen Sie eine Vorlage oder geben Sie Ihr Ausgangswasser ein.',
    hi: '2. त्वरित भरण करें या अपने स्रोत जल का विवरण दर्ज करें।',
    mr: '2. जलद भरा किंवा तुमच्या स्रोत पाण्याचा तपशील टाका.',
  },
  'waterReport.tutorial.step2.body': {
    en: 'Pick a known water type from the preset, or type your own ion values (Ca, Mg, Na, SO4, Cl, HCO3, alkalinity) from a water report/COA.',
    de: 'Wählen Sie einen bekannten Wassertyp aus der Vorlage, oder geben Sie eigene Ionenwerte (Ca, Mg, Na, SO4, Cl, HCO3, Alkalität) aus einer Wasseranalyse ein.',
    hi: 'प्रीसेट से एक ज्ञात जल प्रकार चुनें, या जल रिपोर्ट/COA से अपने आयन मान (Ca, Mg, Na, SO4, Cl, HCO3, क्षारीयता) दर्ज करें।',
    mr: 'प्रीसेटमधून एक ज्ञात पाणी प्रकार निवडा, किंवा पाणी अहवाल/COA मधून तुमची आयन मूल्ये (Ca, Mg, Na, SO4, Cl, HCO3, क्षारता) टाका.',
  },
  'waterReport.tutorial.step3.lead': {
    en: '3. Check Residual Alkalinity.',
    de: '3. Prüfen Sie die Restalkalität.',
    hi: '3. अवशिष्ट क्षारीयता जाँचें।',
    mr: '3. अवशिष्ट क्षारता तपासा.',
  },
  'waterReport.tutorial.step3.body': {
    en: 'Higher RA pushes mash pH up; very low or negative RA (like RO water) lets dark malt acidity dominate -- this feeds directly into Mash Adjustment.',
    de: 'Höhere Restalkalität treibt den Maische-pH nach oben; sehr niedrige oder negative Werte (wie bei Umkehrosmosewasser) lassen die Säure dunkler Malze dominieren – das fließt direkt in die Maischewasser-Anpassung ein.',
    hi: 'अधिक RA मैश pH को बढ़ाता है; बहुत कम या नकारात्मक RA (जैसे RO जल में) गहरे माल्ट की अम्लता को हावी होने देता है -- यह सीधे मैश समायोजन में जाता है।',
    mr: 'जास्त RA मुळे मॅश pH वाढतो; खूप कमी किंवा ऋण RA (जसे RO पाण्यात) गडद माल्टची आम्लता वरचढ ठरू देतो -- हे थेट मॅश समायोजनमध्ये जाते.',
  },
  'waterReport.tutorial.step4.lead': {
    en: '4. Build your Grain Bill on Mash Adjustment.',
    de: '4. Erstellen Sie Ihre Schüttung unter Maischewasser.',
    hi: '4. मैश समायोजन में अपना ग्रेन बिल बनाएँ।',
    mr: '4. मॅश समायोजनमध्ये तुमचे ग्रेन बिल तयार करा.',
  },
  'waterReport.tutorial.step4.body': {
    en: 'The Grain Bill editor lives on the Mash Adjustment tab, right next to Predicted Mash pH, since grist is what actually drives that number.',
    de: 'Der Schüttungs-Editor befindet sich im Tab Maischewasser, direkt neben dem vorhergesagten Maische-pH, da die Schüttung diesen Wert maßgeblich bestimmt.',
    hi: 'ग्रेन बिल संपादक मैश समायोजन टैब में, अनुमानित मैश pH के ठीक बगल में है, क्योंकि ग्रिस्ट ही असल में उस संख्या को तय करता है।',
    mr: 'ग्रेन बिल एडिटर मॅश समायोजन टॅबमध्ये, अंदाजित मॅश pH च्या अगदी शेजारी आहे, कारण ग्रिस्टच खरे तर तो आकडा ठरवते.',
  },
} as const satisfies TranslationDict;
