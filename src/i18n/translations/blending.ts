import { TranslationDict } from './types';

export const blendingTranslations = {
  'blending.heading': { en: 'Water Blending', de: 'Wasserverschnitt', hi: 'जल मिश्रण', mr: 'पाणी मिश्रण' },
  'blending.tutorial.title': {
    en: 'How to use Water Blending',
    de: 'So nutzen Sie den Wasserverschnitt',
    hi: 'जल मिश्रण का उपयोग कैसे करें',
    mr: 'पाणी मिश्रण कसे वापरावे',
  },
  'blending.tutorial.step1.lead': {
    en: '1. Enter both source waters.',
    de: '1. Geben Sie beide Ausgangswasser ein.',
    hi: '1. दोनों स्रोत जल दर्ज करें।',
    mr: '1. दोन्ही स्रोत पाणी टाका.',
  },
  'blending.tutorial.step1.body': {
    en: "Source A and B are independent ion profiles -- e.g. your tap water and RO/distilled water, or two different wells/sources you're mixing.",
    de: 'Quelle A und B sind unabhängige Ionenprofile -- z. B. Ihr Leitungswasser und Umkehrosmose-/destilliertes Wasser, oder zwei verschiedene Brunnen/Quellen, die Sie mischen.',
    hi: 'स्रोत A और B स्वतंत्र आयन प्रोफ़ाइल हैं -- जैसे आपका नल का पानी और RO/डिस्टिल्ड जल, या दो अलग-अलग कुएँ/स्रोत जिन्हें आप मिला रहे हैं।',
    mr: 'स्रोत A आणि B स्वतंत्र आयन प्रोफाइल आहेत -- उदा. तुमचे नळाचे पाणी आणि RO/डिस्टिल्ड पाणी, किंवा तुम्ही मिसळत असलेले दोन वेगळे विहीर/स्रोत.',
  },
  'blending.tutorial.step2.lead': {
    en: '2. Drag the ratio slider.',
    de: '2. Verschieben Sie den Verhältnis-Regler.',
    hi: '2. अनुपात स्लाइडर खींचें।',
    mr: '2. गुणोत्तर स्लायडर सरकवा.',
  },
  'blending.tutorial.step2.body': {
    en: 'Moves the blend percentage between 100% Source A and 100% Source B -- watch the Blended Result table update live.',
    de: 'Verschiebt den Mischanteil zwischen 100% Quelle A und 100% Quelle B -- die Tabelle mit dem Mischergebnis aktualisiert sich dabei live.',
    hi: 'यह मिश्रण प्रतिशत को 100% स्रोत A और 100% स्रोत B के बीच खिसकाता है -- मिश्रित परिणाम तालिका को लाइव अपडेट होते देखें।',
    mr: 'हे मिश्रण टक्केवारी 100% स्रोत A आणि 100% स्रोत B दरम्यान सरकवते -- मिश्रित निकाल तक्ता लाइव्ह अपडेट होताना पहा.',
  },
  'blending.tutorial.step3.lead': {
    en: '3. Use the blended profile elsewhere.',
    de: '3. Verwenden Sie das Mischprofil anderswo.',
    hi: '3. मिश्रित प्रोफ़ाइल का उपयोग कहीं और करें।',
    mr: '3. मिश्रित प्रोफाइल इतरत्र वापरा.',
  },
  'blending.tutorial.step3.body': {
    en: 'Once you find a ratio you like, copy those blended ion values into the Water Report tab as your actual brewing water.',
    de: 'Sobald Sie ein Verhältnis gefunden haben, das Ihnen zusagt, übertragen Sie diese gemischten Ionenwerte als Ihr tatsächliches Brauwasser in den Tab Wasseranalyse.',
    hi: 'जब आपको पसंदीदा अनुपात मिल जाए, तो उन मिश्रित आयन मानों को अपने वास्तविक ब्रूइंग जल के रूप में जल रिपोर्ट टैब में कॉपी करें।',
    mr: 'तुम्हाला आवडणारे गुणोत्तर सापडल्यावर, ती मिश्रित आयन मूल्ये तुमचे प्रत्यक्ष ब्रूइंग पाणी म्हणून पाणी अहवाल टॅबमध्ये कॉपी करा.',
  },
  'blending.ratio.label': {
    en: 'Blend Ratio: {percentA}% Source A / {percentB}% Source B',
    de: 'Mischverhältnis: {percentA}% Quelle A / {percentB}% Quelle B',
    hi: 'मिश्रण अनुपात: {percentA}% स्रोत A / {percentB}% स्रोत B',
    mr: 'मिश्रण गुणोत्तर: {percentA}% स्रोत A / {percentB}% स्रोत B',
  },
  'blending.sourceA.title': { en: 'Source A', de: 'Quelle A', hi: 'स्रोत A', mr: 'स्रोत A' },
  'blending.sourceB.title': { en: 'Source B', de: 'Quelle B', hi: 'स्रोत B', mr: 'स्रोत B' },
  'blending.result.title': { en: 'Blended Result', de: 'Mischergebnis', hi: 'मिश्रित परिणाम', mr: 'मिश्रित निकाल' },
  'blending.result.ion': { en: 'Ion', de: 'Ion', hi: 'आयन', mr: 'आयन' },
  'blending.ion.calcium': { en: 'Calcium', de: 'Calcium', hi: 'कैल्शियम', mr: 'कॅल्शियम' },
  'blending.ion.magnesium': { en: 'Magnesium', de: 'Magnesium', hi: 'मैग्नीशियम', mr: 'मॅग्नेशियम' },
  'blending.ion.sodium': { en: 'Sodium', de: 'Natrium', hi: 'सोडियम', mr: 'सोडियम' },
  'blending.ion.sulfate': { en: 'Sulfate', de: 'Sulfat', hi: 'सल्फेट', mr: 'सल्फेट' },
  'blending.ion.chloride': { en: 'Chloride', de: 'Chlorid', hi: 'क्लोराइड', mr: 'क्लोराइड' },
  'blending.ion.bicarbonate': { en: 'Bicarbonate', de: 'Bicarbonat', hi: 'बाइकार्बोनेट', mr: 'बायकार्बोनेट' },
  'blending.ion.alkalinity': { en: 'Alkalinity', de: 'Alkalität', hi: 'क्षारीयता', mr: 'क्षारता' },
} as const satisfies TranslationDict;
