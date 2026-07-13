import { TranslationDict } from './types';

export const spargeAdjustmentTranslations = {
  'spargeAdjustment.heading': {
    en: 'Sparge Water Adjustment',
    de: 'Läuterwasser-Anpassung',
    hi: 'स्पार्ज वाटर समायोजन',
    mr: 'स्पार्ज वॉटर समायोजन',
  },
  'spargeAdjustment.tutorial.title': {
    en: 'How to use Sparge Water Adjustment',
    de: 'So verwenden Sie die Läuterwasser-Anpassung',
    hi: 'स्पार्ज वाटर समायोजन का उपयोग कैसे करें',
    mr: 'स्पार्ज वॉटर समायोजन कसे वापरावे',
  },
  'spargeAdjustment.tutorial.step1.lead': {
    en: '1. Enter your sparge volume.',
    de: '1. Geben Sie Ihre Läuterwassermenge ein.',
    hi: '1. अपना स्पार्ज वॉल्यूम दर्ज करें।',
    mr: '1. तुमचा स्पार्ज व्हॉल्यूम टाका.',
  },
  'spargeAdjustment.tutorial.step1.body': {
    en: 'Use 0 for brew-in-a-bag or no-sparge brewing -- the recommendation adapts automatically.',
    de: 'Verwenden Sie 0 bei Brew-in-a-Bag oder No-Sparge -- die Empfehlung passt sich automatisch an.',
    hi: 'ब्रू-इन-अ-बैग या नो-स्पार्ज ब्रूइंग के लिए 0 दर्ज करें -- सुझाव अपने आप समायोजित हो जाएगा।',
    mr: 'ब्रू-इन-अ-बॅग किंवा नो-स्पार्ज ब्रूइंगसाठी 0 वापरा -- शिफारस आपोआप जुळवून घेते.',
  },
  'spargeAdjustment.tutorial.step2.lead': {
    en: '2. Pick an acid type.',
    de: '2. Wählen Sie eine Säureart.',
    hi: '2. एक एसिड प्रकार चुनें।',
    mr: '2. एक आम्ल प्रकार निवडा.',
  },
  'spargeAdjustment.tutorial.step2.body': {
    en: 'High-alkalinity sparge water can extract tannins from the grain husk late in lautering; acidifying it prevents that.',
    de: 'Läuterwasser mit hoher Alkalität kann gegen Ende des Läuterns Tannine aus der Malzspelze lösen; Ansäuern verhindert das.',
    hi: 'उच्च क्षारीयता वाला स्पार्ज वाटर छनाई के अंतिम चरण में अनाज के छिलके से टैनिन निकाल सकता है; इसे अम्लीय बनाने से यह रुकता है।',
    mr: 'जास्त क्षारता असलेले स्पार्ज वॉटर गाळणीच्या शेवटच्या टप्प्यात धान्याच्या टरफलातून टॅनिन काढू शकते; ते आम्लीय केल्यास हे टळते.',
  },
  'spargeAdjustment.tutorial.step3.lead': {
    en: '3. Follow the Recommendation card.',
    de: '3. Beachten Sie die Empfehlungskarte.',
    hi: '3. सुझाव कार्ड का पालन करें।',
    mr: '3. शिफारस कार्ड पाहा.',
  },
  'spargeAdjustment.tutorial.step3.body': {
    en: 'Green means your sparge water is already safe as-is; amber means it flags how much acid to add before you sparge.',
    de: 'Grün bedeutet, Ihr Läuterwasser ist bereits unbedenklich; Bernstein zeigt an, wie viel Säure Sie vor dem Läutern zugeben sollten.',
    hi: 'हरा रंग बताता है कि आपका स्पार्ज वाटर पहले से ही सुरक्षित है; एम्बर बताता है कि स्पार्ज करने से पहले कितना एसिड डालना है।',
    mr: 'हिरवा रंग म्हणजे तुमचे स्पार्ज वॉटर आधीच सुरक्षित आहे; अंबर रंग स्पार्ज करण्यापूर्वी किती आम्ल घालायचे ते दर्शवतो.',
  },
  'spargeAdjustment.spargeVolume.label': {
    en: 'Sparge Volume',
    de: 'Läuterwassermenge',
    hi: 'स्पार्ज वॉल्यूम',
    mr: 'स्पार्ज व्हॉल्यूम',
  },
  'spargeAdjustment.spargeVolume.helperText': {
    en: 'Enter 0 for brew-in-a-bag / no-sparge brewing.',
    de: 'Geben Sie 0 für Brew-in-a-Bag / No-Sparge ein.',
    hi: 'ब्रू-इन-अ-बैग / नो-स्पार्ज ब्रूइंग के लिए 0 दर्ज करें।',
    mr: 'ब्रू-इन-अ-बॅग / नो-स्पार्ज ब्रूइंगसाठी 0 टाका.',
  },
  'spargeAdjustment.acidType.label': {
    en: 'Acid Type',
    de: 'Säureart',
    hi: 'एसिड प्रकार',
    mr: 'आम्ल प्रकार',
  },
  'spargeAdjustment.recommendation.title': {
    en: 'Recommendation',
    de: 'Empfehlung',
    hi: 'सुझाव',
    mr: 'शिफारस',
  },
} as const satisfies TranslationDict;
