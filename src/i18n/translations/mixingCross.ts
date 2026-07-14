import { TranslationDict } from './types';

export const mixingCrossTranslations = {
  'mixingCross.heading': { en: 'Mixing Cross', de: 'Mischungskreuz', hi: 'मिश्रण क्रॉस', mr: 'मिश्रण क्रॉस' },

  'mixingCross.tutorial.title': {
    en: 'How to use the Mixing Cross',
    de: 'So nutzen Sie das Mischungskreuz',
    hi: 'मिश्रण क्रॉस का उपयोग कैसे करें',
    mr: 'मिश्रण क्रॉस कसे वापरावे',
  },
  'mixingCross.tutorial.step1.lead': {
    en: '1. Pick what you are blending.',
    de: '1. Wählen Sie, was Sie verschneiden.',
    hi: '1. चुनें कि आप क्या मिला रहे हैं।',
    mr: '1. तुम्ही काय मिसळत आहात ते निवडा.',
  },
  'mixingCross.tutorial.step1.body': {
    en: 'The cross works for any parameter that averages by mass/volume: extract (°P), ABV (%), temperature (°C), or a custom quantity. Component A and B are your two sources; water counts as 0 °P / 0 %.',
    de: 'Das Kreuz funktioniert für jede masse-/volumengemittelte Größe: Extrakt (°P), Alkohol (%), Temperatur (°C) oder eine eigene Größe. Komponente A und B sind Ihre beiden Quellen; Wasser zählt als 0 °P / 0 %.',
    hi: 'क्रॉस किसी भी ऐसे पैरामीटर के लिए काम करता है जो द्रव्यमान/आयतन के अनुसार औसत होता है: एक्सट्रैक्ट (°P), ABV (%), तापमान (°C), या कस्टम मात्रा। घटक A और B आपके दो स्रोत हैं; पानी 0 °P / 0 % गिना जाता है।',
    mr: 'क्रॉस वस्तुमान/आकारमानानुसार सरासरी होणाऱ्या कोणत्याही पॅरामीटरसाठी चालते: एक्स्ट्रॅक्ट (°P), ABV (%), तापमान (°C), किंवा कस्टम प्रमाण. घटक A आणि B हे तुमचे दोन स्रोत आहेत; पाणी 0 °P / 0 % मोजले जाते.',
  },
  'mixingCross.tutorial.step2.lead': {
    en: '2. Enter both parameters and your target.',
    de: '2. Geben Sie beide Parameter und Ihr Ziel ein.',
    hi: '2. दोनों पैरामीटर और अपना लक्ष्य दर्ज करें।',
    mr: '2. दोन्ही पॅरामीटर आणि तुमचे लक्ष्य टाका.',
  },
  'mixingCross.tutorial.step2.body': {
    en: 'The target must sit between the two component values -- a blend can be no stronger than the strongest source nor weaker than the weakest. The parts ratio updates live.',
    de: 'Das Ziel muss zwischen den beiden Komponentenwerten liegen -- ein Verschnitt kann nicht stärker als die stärkste und nicht schwächer als die schwächste Quelle sein. Das Teilverhältnis aktualisiert sich live.',
    hi: 'लक्ष्य दोनों घटक मानों के बीच होना चाहिए -- मिश्रण न तो सबसे मजबूत स्रोत से अधिक मजबूत हो सकता है और न ही सबसे कमजोर से कमजोर। भाग अनुपात लाइव अपडेट होता है।',
    mr: 'लक्ष्य दोन्ही घटक मूल्यांच्या दरम्यान असावे -- मिश्रण सर्वात मजबूत स्रोतापेक्षा जास्त मजबूत किंवा सर्वात कमकुवत स्रोतापेक्षा कमकुवत असू शकत नाही. भागांचे गुणोत्तर लाइव्ह अपडेट होते.',
  },
  'mixingCross.tutorial.step3.lead': {
    en: '3. Scale to real amounts.',
    de: '3. Auf reale Mengen skalieren.',
    hi: '3. वास्तविक मात्रा में स्केल करें।',
    mr: '3. प्रत्यक्ष प्रमाणात स्केल करा.',
  },
  'mixingCross.tutorial.step3.body': {
    en: 'Choose whether you know the total batch size, or how much of one component you have -- the cross fills in the rest. For strike-water temperature specifically, the Water Volumes tab has a dedicated tool.',
    de: 'Wählen Sie, ob Sie die Gesamtmenge kennen oder wie viel einer Komponente Sie haben -- das Kreuz füllt den Rest aus. Für die Einmaischwassertemperatur gibt es im Tab Wassermengen ein eigenes Werkzeug.',
    hi: 'चुनें कि आप कुल बैच आकार जानते हैं, या आपके पास एक घटक कितना है -- क्रॉस बाकी भर देता है। स्ट्राइक-वॉटर तापमान के लिए, जल मात्रा टैब में एक समर्पित उपकरण है।',
    mr: 'तुम्हाला एकूण बॅच आकार माहीत आहे की एका घटकाचे किती प्रमाण आहे ते निवडा -- क्रॉस बाकीचे भरतो. स्ट्राइक-वॉटर तापमानासाठी, पाणी प्रमाण टॅबमध्ये एक स्वतंत्र साधन आहे.',
  },

  'mixingCross.parameter.label': { en: 'Blending', de: 'Verschneiden von', hi: 'मिश्रण', mr: 'मिश्रण' },
  'mixingCross.parameter.gravityPlato': { en: 'Gravity (°P)', de: 'Stammwürze (°P)', hi: 'घनत्व (°P)', mr: 'घनता (°P)' },
  'mixingCross.parameter.abv': { en: 'ABV (%)', de: 'Alkohol (%)', hi: 'ABV (%)', mr: 'ABV (%)' },
  'mixingCross.parameter.temperature': { en: 'Temperature (°C)', de: 'Temperatur (°C)', hi: 'तापमान (°C)', mr: 'तापमान (°C)' },
  'mixingCross.parameter.custom': { en: 'Custom', de: 'Eigene', hi: 'कस्टम', mr: 'कस्टम' },

  'mixingCross.componentA.label': { en: 'Component A', de: 'Komponente A', hi: 'घटक A', mr: 'घटक A' },
  'mixingCross.componentB.label': { en: 'Component B', de: 'Komponente B', hi: 'घटक B', mr: 'घटक B' },
  'mixingCross.target.label': { en: 'Target Mixture', de: 'Zielmischung', hi: 'लक्ष्य मिश्रण', mr: 'लक्ष्य मिश्रण' },

  'mixingCross.ratio.title': { en: 'Blend Ratio', de: 'Mischverhältnis', hi: 'मिश्रण अनुपात', mr: 'मिश्रण गुणोत्तर' },
  'mixingCross.ratio.parts': {
    en: '{partsA} parts A : {partsB} parts B',
    de: '{partsA} Teile A : {partsB} Teile B',
    hi: '{partsA} भाग A : {partsB} भाग B',
    mr: '{partsA} भाग A : {partsB} भाग B',
  },
  'mixingCross.ratio.percent': {
    en: '{percentA}% A / {percentB}% B',
    de: '{percentA}% A / {percentB}% B',
    hi: '{percentA}% A / {percentB}% B',
    mr: '{percentA}% A / {percentB}% B',
  },

  'mixingCross.scaleMode.label': { en: 'Scale by', de: 'Skalieren nach', hi: 'स्केल करें', mr: 'स्केल करा' },
  'mixingCross.scaleMode.total': { en: 'Total batch', de: 'Gesamtmenge', hi: 'कुल बैच', mr: 'एकूण बॅच' },
  'mixingCross.scaleMode.componentA': { en: 'Amount of A', de: 'Menge von A', hi: 'A की मात्रा', mr: 'A चे प्रमाण' },
  'mixingCross.scaleMode.componentB': { en: 'Amount of B', de: 'Menge von B', hi: 'B की मात्रा', mr: 'B चे प्रमाण' },
  'mixingCross.amount.total': { en: 'Total batch size', de: 'Gesamtmenge', hi: 'कुल बैच आकार', mr: 'एकूण बॅच आकार' },
  'mixingCross.amount.known': { en: 'Amount you have', de: 'Vorhandene Menge', hi: 'आपके पास मात्रा', mr: 'तुमच्याकडील प्रमाण' },
  'mixingCross.amount.unit': { en: 'kg or L', de: 'kg oder L', hi: 'kg या L', mr: 'kg किंवा L' },

  'mixingCross.result.title': { en: 'Amounts to Combine', de: 'Zu kombinierende Mengen', hi: 'मिलाने की मात्रा', mr: 'एकत्र करण्याचे प्रमाण' },
  'mixingCross.result.componentA': { en: 'Component A', de: 'Komponente A', hi: 'घटक A', mr: 'घटक A' },
  'mixingCross.result.componentB': { en: 'Component B', de: 'Komponente B', hi: 'घटक B', mr: 'घटक B' },
  'mixingCross.result.total': { en: 'Total blend', de: 'Gesamtverschnitt', hi: 'कुल मिश्रण', mr: 'एकूण मिश्रण' },

  'mixingCross.warning.parametersEqual': {
    en: 'Both components have the same value -- there is nothing to blend toward a different target.',
    de: 'Beide Komponenten haben denselben Wert -- es gibt nichts, was zu einem anderen Ziel verschnitten werden könnte.',
    hi: 'दोनों घटकों का मान समान है -- किसी भिन्न लक्ष्य की ओर मिलाने के लिए कुछ नहीं है।',
    mr: 'दोन्ही घटकांचे मूल्य समान आहे -- वेगळ्या लक्ष्याकडे मिसळण्यासारखे काही नाही.',
  },
  'mixingCross.warning.targetOutOfRange': {
    en: 'Target must be between {min} and {max}. A blend cannot go beyond the two components.',
    de: 'Das Ziel muss zwischen {min} und {max} liegen. Ein Verschnitt kann nicht über die beiden Komponenten hinausgehen.',
    hi: 'लक्ष्य {min} और {max} के बीच होना चाहिए। मिश्रण दोनों घटकों से आगे नहीं जा सकता।',
    mr: 'लक्ष्य {min} आणि {max} दरम्यान असावे. मिश्रण दोन्ही घटकांच्या पलीकडे जाऊ शकत नाही.',
  },
} as const satisfies TranslationDict;
