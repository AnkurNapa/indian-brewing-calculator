import { TranslationDict } from './types';

/**
 * BJCP Style Check panel: style picker, deviation display comparing
 * OG/FG/IBU/SRM/ABV against style range, hop additions, gravity fields.
 */
export const styleCheckTranslations = {
  'styleCheck.title': { en: 'BJCP Style Check', de: 'BJCP-Stilprüfung', hi: 'BJCP स्टाइल जांच', mr: 'BJCP स्टाइल तपासणी' },
  'styleCheck.intro': {
    en: "Compare your recipe's OG, FG, IBU, color (SRM), and ABV against common BJCP-style numeric ranges. Reference numeric ranges only -- consult the official BJCP Style Guidelines (bjcp.org) for full style descriptions and the complete category list.",
    de: 'Vergleichen Sie die Werte Ihres Rezepts für OG, FG, IBU, Farbe (SRM) und ABV mit den üblichen numerischen Bereichen der BJCP-Stile. Es werden nur numerische Referenzbereiche angezeigt -- für vollständige Stilbeschreibungen und die komplette Kategorieliste konsultieren Sie die offiziellen BJCP Style Guidelines (bjcp.org).',
    hi: 'अपनी रेसिपी के OG, FG, IBU, रंग (SRM), और ABV की तुलना सामान्य BJCP-स्टाइल संख्यात्मक श्रेणियों से करें। यहाँ केवल संदर्भ संख्यात्मक श्रेणियाँ दी गई हैं -- पूर्ण स्टाइल विवरण और संपूर्ण श्रेणी सूची के लिए आधिकारिक BJCP Style Guidelines (bjcp.org) देखें।',
    mr: 'तुमच्या रेसिपीचे OG, FG, IBU, रंग (SRM), आणि ABV सामान्य BJCP-स्टाइल संख्यात्मक श्रेणींशी तुलना करा. येथे फक्त संदर्भासाठी संख्यात्मक श्रेणी दिल्या आहेत -- पूर्ण स्टाइल वर्णन आणि संपूर्ण श्रेणी यादीसाठी अधिकृत BJCP Style Guidelines (bjcp.org) पहा.',
  },
  'styleCheck.tutorial.title': {
    en: 'How to use BJCP Style Check',
    de: 'So verwenden Sie die BJCP-Stilprüfung',
    hi: 'BJCP स्टाइल जांच का उपयोग कैसे करें',
    mr: 'BJCP स्टाइल तपासणी कशी वापरावी',
  },
  'styleCheck.tutorial.step1.lead': {
    en: '1. Search and pick a target style.',
    de: '1. Zielstil suchen und auswählen.',
    hi: '1. लक्ष्य स्टाइल खोजें और चुनें।',
    mr: '1. लक्ष्य स्टाइल शोधा आणि निवडा.',
  },
  'styleCheck.tutorial.step1.body': {
    en: 'The selected style flashes teal briefly to confirm the pick, and stays visible in the "Selected" line below the list.',
    de: 'Der ausgewählte Stil blinkt kurz türkis, um die Auswahl zu bestätigen, und bleibt in der Zeile "Ausgewählt" unter der Liste sichtbar.',
    hi: 'चुनी गई स्टाइल चयन की पुष्टि के लिए संक्षेप में टील रंग में चमकती है, और सूची के नीचे "चयनित" पंक्ति में दिखाई देती रहती है।',
    mr: 'निवडलेली स्टाइल निवड निश्चित करण्यासाठी थोडक्यात टील रंगात चमकते, आणि यादीखालील "निवडलेले" ओळीत दिसत राहते.',
  },
  'styleCheck.tutorial.step2.lead': {
    en: '2. OG/FG and hops are shared, not separate.',
    de: '2. OG/FG und Hopfen werden geteilt, nicht getrennt geführt.',
    hi: '2. OG/FG और हॉप्स साझा हैं, अलग नहीं।',
    mr: '2. OG/FG आणि हॉप्स सामायिक आहेत, वेगळे नाहीत.',
  },
  'styleCheck.tutorial.step2.body': {
    en: 'Gravity and hop schedule here are the same values used in Brewhouse Calculators and shown on Home -- edit them on any of those screens and they stay in sync.',
    de: 'Stammwürze und Hopfenplan sind hier dieselben Werte wie in den Brauhaus-Rechnern und auf der Startseite -- bearbeiten Sie sie auf einem dieser Bildschirme, und sie bleiben synchron.',
    hi: 'यहाँ गुरुत्व और हॉप शेड्यूल वही मान हैं जो Brewhouse Calculators में उपयोग होते हैं और Home पर दिखाए जाते हैं -- इनमें से किसी भी स्क्रीन पर इन्हें संपादित करें, ये सिंक में रहेंगे।',
    mr: 'येथील गुरुत्व आणि हॉप वेळापत्रक हेच मूल्ये आहेत जी Brewhouse Calculators मध्ये वापरली जातात आणि Home वर दाखवली जातात -- यापैकी कोणत्याही स्क्रीनवर संपादित करा, ती सिंकमध्ये राहतील.',
  },
  'styleCheck.tutorial.step3.lead': {
    en: '3. Read the Style Match score.',
    de: '3. Style-Match-Wert lesen.',
    hi: '3. स्टाइल मैच स्कोर पढ़ें।',
    mr: '3. स्टाइल मॅच स्कोर वाचा.',
  },
  'styleCheck.tutorial.step3.body': {
    en: "Green/5-of-5 means every parameter (OG, FG, IBU, SRM, ABV) falls inside the style's published range; red rows below show exactly how far outside range you are and in which direction.",
    de: 'Grün/5-von-5 bedeutet, dass jeder Parameter (OG, FG, IBU, SRM, ABV) innerhalb des veröffentlichten Bereichs des Stils liegt; rote Zeilen darunter zeigen genau, wie weit und in welche Richtung Sie vom Bereich abweichen.',
    hi: 'हरा/5-में-से-5 का मतलब है कि हर पैरामीटर (OG, FG, IBU, SRM, ABV) स्टाइल की प्रकाशित सीमा के भीतर है; नीचे लाल पंक्तियाँ दिखाती हैं कि आप सीमा से कितनी दूर हैं और किस दिशा में।',
    mr: 'हिरवा/5-पैकी-5 म्हणजे प्रत्येक पॅरामीटर (OG, FG, IBU, SRM, ABV) स्टाइलच्या प्रकाशित श्रेणीत आहे; खालील लाल ओळी दाखवतात की तुम्ही श्रेणीबाहेर किती आणि कोणत्या दिशेने आहात.',
  },
  'styleCheck.targetStyle.label': { en: 'Target Style', de: 'Zielstil', hi: 'लक्ष्य स्टाइल', mr: 'लक्ष्य स्टाइल' },
  'styleCheck.targetStyle.searchPlaceholder': {
    en: 'Search {count} styles by name or category (e.g. "IPA", "sour", "lager")...',
    de: '{count} Stile nach Name oder Kategorie durchsuchen (z. B. "IPA", "Sauerbier", "Lager") ...',
    hi: '{count} स्टाइल्स को नाम या श्रेणी से खोजें (उदा. "IPA", "sour", "lager")...',
    mr: '{count} स्टाइल्स नाव किंवा श्रेणीनुसार शोधा (उदा. "IPA", "sour", "lager")...',
  },
  'styleCheck.noStylesMatch': {
    en: 'No styles match "{query}".',
    de: 'Keine Stile passen zu "{query}".',
    hi: '"{query}" से कोई स्टाइल मेल नहीं खाती।',
    mr: '"{query}" शी कोणतीही स्टाइल जुळत नाही.',
  },
  'styleCheck.selected': { en: 'Selected:', de: 'Ausgewählt:', hi: 'चयनित:', mr: 'निवडलेले:' },
  'styleCheck.gravityAbv.title': { en: 'Gravity & ABV', de: 'Stammwürze & ABV', hi: 'गुरुत्व और ABV', mr: 'गुरुत्व आणि ABV' },
  'styleCheck.gravityAbv.subtitle': {
    en: 'Batch volume ({volume} L) comes from Mash Adjustment; OG/FG are shared with Brewhouse Calculators.',
    de: 'Das Sudvolumen ({volume} L) stammt aus Maischewasser; OG/FG werden mit den Brauhaus-Rechnern geteilt.',
    hi: 'बैच वॉल्यूम ({volume} L) मैश समायोजन से आता है; OG/FG Brewhouse Calculators के साथ साझा हैं।',
    mr: 'बॅच व्हॉल्यूम ({volume} L) मॅश समायोजन मधून येतो; OG/FG Brewhouse Calculators सोबत सामायिक आहेत.',
  },
  'styleCheck.originalGravity': { en: 'Original Gravity', de: 'Stammwürze (OG)', hi: 'मूल गुरुत्व (OG)', mr: 'मूळ गुरुत्व (OG)' },
  'styleCheck.finalGravity': { en: 'Final Gravity', de: 'Endvergärungsgrad (FG)', hi: 'अंतिम गुरुत्व (FG)', mr: 'अंतिम गुरुत्व (FG)' },
  'styleCheck.hopsForIbu.title': { en: 'Hops (for IBU)', de: 'Hopfen (für IBU)', hi: 'हॉप्स (IBU के लिए)', mr: 'हॉप्स (IBU साठी)' },
  'styleCheck.wortGravity': { en: 'Wort Gravity (SG)', de: 'Würzedichte (SG)', hi: 'वोर्ट गुरुत्व (SG)', mr: 'वॉर्ट गुरुत्व (SG)' },
  'styleCheck.hop.label': { en: 'Hop', de: 'Hopfen', hi: 'हॉप', mr: 'हॉप' },
  'styleCheck.hop.pick': { en: 'Pick a hop (fills alpha)', de: 'Hopfen wählen (füllt Alpha)', hi: 'हॉप चुनें (अल्फा भरता है)', mr: 'हॉप निवडा (अल्फा भरते)' },
  'styleCheck.hop.pickPlaceholder': { en: 'Search 400+ hop varieties', de: '400+ Hopfensorten suchen', hi: '400+ हॉप किस्में खोजें', mr: '400+ हॉप प्रकार शोधा' },
  'styleCheck.hop.placeholder': {
    en: 'Type any hop name...',
    de: 'Beliebigen Hopfennamen eingeben...',
    hi: 'कोई भी हॉप नाम टाइप करें...',
    mr: 'कोणतेही हॉप नाव टाइप करा...',
  },
  'styleCheck.alphaAcid': { en: 'Alpha Acid', de: 'Alphasäure', hi: 'अल्फा एसिड', mr: 'अल्फा आम्ल' },
  'styleCheck.weight': { en: 'Weight', de: 'Menge', hi: 'वज़न', mr: 'वजन' },
  'styleCheck.boilTime': { en: 'Boil Time', de: 'Kochzeit', hi: 'उबालने का समय', mr: 'उकळण्याची वेळ' },
  'styleCheck.addHop': { en: '+ Add Hop', de: '+ Hopfen hinzufügen', hi: '+ हॉप जोड़ें', mr: '+ हॉप जोडा' },
  'styleCheck.styleMatch.title': { en: 'Style Match', de: 'Stil-Match', hi: 'स्टाइल मैच', mr: 'स्टाइल मॅच' },
  'styleCheck.styleMatch.summary': {
    en: 'Grain-bill color (SRM): {srm}. Total IBU: {ibu}.',
    de: 'Malzschüttung-Farbe (SRM): {srm}. Gesamt-IBU: {ibu}.',
    hi: 'ग्रेन-बिल रंग (SRM): {srm}। कुल IBU: {ibu}।',
    mr: 'ग्रेन-बिल रंग (SRM): {srm}. एकूण IBU: {ibu}.',
  },
  'styleCheck.param.ibu': { en: 'IBU', de: 'IBU', hi: 'IBU', mr: 'IBU' },
  'styleCheck.param.colorSrm': { en: 'Color (SRM)', de: 'Farbe (SRM)', hi: 'रंग (SRM)', mr: 'रंग (SRM)' },
  'styleCheck.param.abv': { en: 'ABV', de: 'ABV', hi: 'ABV', mr: 'ABV' },
  'styleCheck.param.target': {
    en: 'target {min}-{max}',
    de: 'Ziel {min}-{max}',
    hi: 'लक्ष्य {min}-{max}',
    mr: 'लक्ष्य {min}-{max}',
  },
} as const satisfies TranslationDict;
