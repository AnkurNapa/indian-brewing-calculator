import { TranslationDict } from './types';

export const brewhouseYieldTranslations = {
  'brewhouseYield.heading': { en: 'Brewhouse Yield', de: 'Sudhausausbeute', hi: 'ब्रूहाउस यील्ड', mr: 'ब्रूहाउस यील्ड' },

  'brewhouseYield.tutorial.title': {
    en: 'How to use Brewhouse Yield',
    de: 'So nutzen Sie die Sudhausausbeute',
    hi: 'ब्रूहाउस यील्ड का उपयोग कैसे करें',
    mr: 'ब्रूहाउस यील्ड कसे वापरावे',
  },
  'brewhouseYield.tutorial.step1.lead': { en: '1. Commercial-scale, extract-based.', de: '1. Kommerziell, extraktbasiert.', hi: '1. वाणिज्यिक, एक्सट्रैक्ट-आधारित।', mr: '1. व्यावसायिक, एक्स्ट्रॅक्ट-आधारित.' },
  'brewhouseYield.tutorial.step1.body': {
    en: 'This tool works in brewery units -- hL (hectoliters), dt (decitonnes = 100 kg grist), and malt extract as a mass %. It sizes the full brew-day water and mass balance for a professional brewhouse.',
    de: 'Dieses Werkzeug arbeitet in Brauereieinheiten -- hL, dt (Dezitonnen = 100 kg Schüttung) und Malzextrakt als Massen-%. Es dimensioniert die gesamte Wasser- und Massenbilanz eines professionellen Sudhauses.',
    hi: 'यह उपकरण ब्रुअरी इकाइयों में काम करता है -- hL, dt (= 100 kg ग्रिस्ट), और माल्ट एक्सट्रैक्ट द्रव्यमान % के रूप में। यह एक पेशेवर ब्रूहाउस का पूरा जल व द्रव्यमान संतुलन तय करता है।',
    mr: 'हे साधन ब्रुअरी युनिट्समध्ये काम करते -- hL, dt (= 100 kg ग्रिस्ट), आणि माल्ट एक्स्ट्रॅक्ट वस्तुमान % म्हणून. हे व्यावसायिक ब्रूहाउसचे संपूर्ण पाणी व वस्तुमान संतुलन ठरवते.',
  },
  'brewhouseYield.tutorial.step2.lead': { en: '2. Enter grist and extract figures.', de: '2. Schüttung und Extraktwerte eingeben.', hi: '2. ग्रिस्ट और एक्सट्रैक्ट मान दर्ज करें।', mr: '2. ग्रिस्ट व एक्स्ट्रॅक्ट मूल्ये टाका.' },
  'brewhouseYield.tutorial.step2.body': {
    en: 'Grist size, malt fine-meal extract (E_CM), desired first-wort strength (E_FW), and the fine-flour yield (Y_ffm) drive the whole chain. Defaults reproduce the textbook 50 dt example.',
    de: 'Schüttungsmenge, Feinmehlextrakt (E_CM), gewünschte Vorderwürze (E_FW) und Feinschrotausbeute (Y_ffm) treiben die gesamte Kette. Die Vorgaben reproduzieren das 50-dt-Lehrbuchbeispiel.',
    hi: 'ग्रिस्ट आकार, माल्ट फाइन-मील एक्सट्रैक्ट (E_CM), वांछित फर्स्ट-वॉर्ट (E_FW), और फाइन-फ्लोर यील्ड (Y_ffm) पूरी श्रृंखला चलाते हैं। डिफ़ॉल्ट 50 dt पाठ्यपुस्तक उदाहरण को दोहराते हैं।',
    mr: 'ग्रिस्ट आकार, माल्ट फाइन-मील एक्स्ट्रॅक्ट (E_CM), इच्छित फर्स्ट-वॉर्ट (E_FW), आणि फाइन-फ्लोर यील्ड (Y_ffm) संपूर्ण साखळी चालवतात. डिफॉल्ट 50 dt उदाहरणाची पुनरावृत्ती करतात.',
  },
  'brewhouseYield.tutorial.step3.lead': { en: '3. Read the mass balance.', de: '3. Massenbilanz ablesen.', hi: '3. द्रव्यमान संतुलन पढ़ें।', mr: '3. वस्तुमान संतुलन वाचा.' },
  'brewhouseYield.tutorial.step3.body': {
    en: 'You get strike and sparge volumes, mash-vessel sizing, kettle-full wort, projected brewhouse yield, evaporation, and spent-grain output -- the full picture for planning or verifying a brew.',
    de: 'Sie erhalten Haupt- und Nachgussmengen, Maischgefäß-Dimensionierung, Pfannevollwürze, prognostizierte Sudhausausbeute, Verdampfung und Trebermenge -- das vollständige Bild.',
    hi: 'आपको स्ट्राइक व स्पार्ज मात्रा, मैश-वेसल आकार, केटल-फुल वॉर्ट, अनुमानित ब्रूहाउस यील्ड, वाष्पीकरण, और स्पेंट-ग्रेन उत्पादन मिलता है -- पूरी तस्वीर।',
    mr: 'तुम्हाला स्ट्राइक व स्पार्ज प्रमाण, मॅश-व्हेसल आकार, केटल-फुल वॉर्ट, अंदाजित ब्रूहाउस यील्ड, बाष्पीभवन, आणि स्पेंट-ग्रेन उत्पादन मिळते -- संपूर्ण चित्र.',
  },

  // Input labels
  'brewhouseYield.input.mgr': { en: 'Grist weight', de: 'Schüttung', hi: 'ग्रिस्ट भार', mr: 'ग्रिस्ट वजन' },
  'brewhouseYield.input.eCm': { en: 'Malt extract (fine meal)', de: 'Malzextrakt (Feinmehl)', hi: 'माल्ट एक्सट्रैक्ट (फाइन मील)', mr: 'माल्ट एक्स्ट्रॅक्ट (फाइन मील)' },
  'brewhouseYield.input.eFw': { en: 'First wort concentration', de: 'Vorderwürzekonzentration', hi: 'फर्स्ट वॉर्ट सांद्रता', mr: 'फर्स्ट वॉर्ट एकाग्रता' },
  'brewhouseYield.input.yFfm': { en: 'Fine-flour yield (Y_ffm)', de: 'Feinschrotausbeute (Y_ffm)', hi: 'फाइन-फ्लोर यील्ड (Y_ffm)', mr: 'फाइन-फ्लोर यील्ड (Y_ffm)' },
  'brewhouseYield.input.eC': { en: 'Knockout wort extract', de: 'Ausschlagwürze-Extrakt', hi: 'नॉकआउट वॉर्ट एक्सट्रैक्ट', mr: 'नॉकआउट वॉर्ट एक्स्ट्रॅक्ट' },
  'brewhouseYield.input.rho': { en: 'Knockout wort density', de: 'Ausschlagwürze-Dichte', hi: 'नॉकआउट वॉर्ट घनत्व', mr: 'नॉकआउट वॉर्ट घनता' },
  'brewhouseYield.input.boilHours': { en: 'Boil time', de: 'Kochzeit', hi: 'उबाल समय', mr: 'उकळण्याचा वेळ' },
  'brewhouseYield.input.lauter': { en: 'Lauter system', de: 'Läutersystem', hi: 'लॉटर प्रणाली', mr: 'लॉटर प्रणाली' },
  'brewhouseYield.input.lauterTun': { en: 'Lauter tun', de: 'Läuterbottich', hi: 'लॉटर टन', mr: 'लॉटर टन' },
  'brewhouseYield.input.mashFilter': { en: 'Mash filter', de: 'Maischefilter', hi: 'मैश फिल्टर', mr: 'मॅश फिल्टर' },
  'brewhouseYield.input.stirring': { en: 'Mash vessel allowance', de: 'Maischgefäß-Zuschlag', hi: 'मैश वेसल भत्ता', mr: 'मॅश व्हेसल भत्ता' },
  'brewhouseYield.input.stirringModern': { en: 'Modern (+10%)', de: 'Modern (+10%)', hi: 'आधुनिक (+10%)', mr: 'आधुनिक (+10%)' },
  'brewhouseYield.input.stirringOlder': { en: 'Older (+40%)', de: 'Älter (+40%)', hi: 'पुराना (+40%)', mr: 'जुने (+40%)' },

  // Section headers
  'brewhouseYield.section.strikeMash': { en: 'Strike & Mash Volumes', de: 'Haupguss & Maischevolumen', hi: 'स्ट्राइक व मैश मात्रा', mr: 'स्ट्राइक व मॅश प्रमाण' },
  'brewhouseYield.section.spargeWort': { en: 'Sparge & Wort Volumes', de: 'Nachguss & Würzevolumen', hi: 'स्पार्ज व वॉर्ट मात्रा', mr: 'स्पार्ज व वॉर्ट प्रमाण' },
  'brewhouseYield.section.yieldEvap': { en: 'Yield & Evaporation', de: 'Ausbeute & Verdampfung', hi: 'यील्ड व वाष्पीकरण', mr: 'यील्ड व बाष्पीभवन' },
  'brewhouseYield.section.spentGrain': { en: 'Spent Grain & Total Water', de: 'Treber & Gesamtwasser', hi: 'स्पेंट ग्रेन व कुल जल', mr: 'स्पेंट ग्रेन व एकूण पाणी' },

  // Result labels
  'brewhouseYield.result.specificStrike': { en: 'Specific strike', de: 'Spezifischer Hauptguss', hi: 'विशिष्ट स्ट्राइक', mr: 'विशिष्ट स्ट्राइक' },
  'brewhouseYield.result.wSv': { en: 'Main strike volume', de: 'Hauptgussvolumen', hi: 'मुख्य स्ट्राइक मात्रा', mr: 'मुख्य स्ट्राइक प्रमाण' },
  'brewhouseYield.result.vMa': { en: 'Total mash volume', de: 'Gesamtmaischevolumen', hi: 'कुल मैश मात्रा', mr: 'एकूण मॅश प्रमाण' },
  'brewhouseYield.result.vCv': { en: 'Gross mash vessel', de: 'Brutto-Maischgefäß', hi: 'सकल मैश वेसल', mr: 'स्थूल मॅश व्हेसल' },
  'brewhouseYield.result.spargeRatio': { en: 'Sparge ratio (Table 30)', de: 'Nachgussverhältnis (Tab. 30)', hi: 'स्पार्ज अनुपात (तालिका 30)', mr: 'स्पार्ज गुणोत्तर (तक्ता 30)' },
  'brewhouseYield.result.wSpv': { en: 'Sparge volume', de: 'Nachgussvolumen', hi: 'स्पार्ज मात्रा', mr: 'स्पार्ज प्रमाण' },
  'brewhouseYield.result.wSg': { en: 'Wort retained in grains', de: 'In Treber gebundene Würze', hi: 'ग्रेन में रुका वॉर्ट', mr: 'ग्रेनमध्ये अडकलेला वॉर्ट' },
  'brewhouseYield.result.vFw': { en: 'Recoverable first wort', de: 'Gewinnbare Vorderwürze', hi: 'वसूली योग्य फर्स्ट वॉर्ट', mr: 'वसूलयोग्य फर्स्ट वॉर्ट' },
  'brewhouseYield.result.vKf': { en: 'Kettle-full wort', de: 'Pfannevollwürze', hi: 'केटल-फुल वॉर्ट', mr: 'केटल-फुल वॉर्ट' },
  'brewhouseYield.result.expectedYBh': { en: 'Expected brewhouse yield', de: 'Erwartete Sudhausausbeute', hi: 'अपेक्षित ब्रूहाउस यील्ड', mr: 'अपेक्षित ब्रूहाउस यील्ड' },
  'brewhouseYield.result.vHkw': { en: 'Projected hot knockout wort', de: 'Erwartete Ausschlagwürze', hi: 'अनुमानित हॉट नॉकआउट वॉर्ट', mr: 'अंदाजित हॉट नॉकआउट वॉर्ट' },
  'brewhouseYield.result.evapAbs': { en: 'Evaporation (absolute)', de: 'Verdampfung (absolut)', hi: 'वाष्पीकरण (निरपेक्ष)', mr: 'बाष्पीभवन (निरपेक्ष)' },
  'brewhouseYield.result.evapPercent': { en: 'Evaporation (of kettle-full)', de: 'Verdampfung (der Pfannevollwürze)', hi: 'वाष्पीकरण (केटल-फुल का)', mr: 'बाष्पीभवन (केटल-फुलचे)' },
  'brewhouseYield.result.evapPerHour': { en: 'Evaporation per hour', de: 'Verdampfung pro Stunde', hi: 'प्रति घंटा वाष्पीकरण', mr: 'प्रति तास बाष्पीभवन' },
  'brewhouseYield.result.spentDry': { en: 'Spent grain (dry)', de: 'Treber (Trockensubstanz)', hi: 'स्पेंट ग्रेन (सूखा)', mr: 'स्पेंट ग्रेन (कोरडे)' },
  'brewhouseYield.result.spentWet': { en: 'Spent grain (wet, 80% water)', de: 'Treber (nass, 80% Wasser)', hi: 'स्पेंट ग्रेन (गीला, 80% जल)', mr: 'स्पेंट ग्रेन (ओले, 80% पाणी)' },
  'brewhouseYield.result.wt': { en: 'Total water for wort', de: 'Gesamtwasser für Würze', hi: 'वॉर्ट के लिए कुल जल', mr: 'वॉर्टसाठी एकूण पाणी' },
  'brewhouseYield.warning.eFw': {
    en: 'First wort concentration must be a positive value below the malt extract.',
    de: 'Die Vorderwürzekonzentration muss positiv und kleiner als der Malzextrakt sein.',
    hi: 'फर्स्ट वॉर्ट सांद्रता एक धनात्मक मान होनी चाहिए, माल्ट एक्सट्रैक्ट से कम।',
    mr: 'फर्स्ट वॉर्ट एकाग्रता धनात्मक व माल्ट एक्स्ट्रॅक्टपेक्षा कमी असावी.',
  },
} as const satisfies TranslationDict;
