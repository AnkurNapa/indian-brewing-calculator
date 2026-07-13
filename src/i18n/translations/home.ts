import { TranslationDict } from './types';

export const homeTranslations = {
  'home.edit': { en: 'Edit', de: 'Bearbeiten', hi: 'संपादित करें', mr: 'संपादित करा' },
  'home.title': { en: 'Brew Session Overview', de: 'Sudsitzung im Überblick', hi: 'ब्रू सेशन का सारांश', mr: 'ब्रू सत्राचा आढावा' },
  'home.subtitle': {
    en: 'Everything entered so far, in brew-day order. Tap Edit on any card to jump back and change it.',
    de: 'Alles, was bisher eingegeben wurde, in der Reihenfolge des Brautages. Tippen Sie auf Bearbeiten in einer Karte, um zurückzuspringen und etwas zu ändern.',
    hi: 'अब तक दर्ज सब कुछ, ब्रू-डे क्रम में। किसी भी कार्ड पर संपादित करें टैप करें और वापस जाकर उसे बदलें।',
    mr: 'आतापर्यंत नोंदवलेले सर्व काही, ब्रू-डे क्रमाने. कोणत्याही कार्डवर संपादित करा टॅप करून मागे जाऊन ते बदला.',
  },
  'home.processFlow.title': { en: 'Brew Day Flow', de: 'Brautag-Ablauf', hi: 'ब्रू डे प्रवाह', mr: 'ब्रू डे प्रवाह' },
  'home.processFlow.scrollHint': {
    en: 'Scroll for more',
    de: 'Für mehr scrollen',
    hi: 'अधिक के लिए स्क्रॉल करें',
    mr: 'अधिकसाठी स्क्रोल करा',
  },

  'home.waterSource.title': { en: 'Water Source', de: 'Wasserquelle', hi: 'जल स्रोत', mr: 'पाणी स्रोत' },
  'home.waterSource.summary': {
    en: 'Calcium {calcium} · Magnesium {magnesium} · Sulfate {sulfate} · Chloride {chloride} mg/L',
    de: 'Calcium {calcium} · Magnesium {magnesium} · Sulfat {sulfate} · Chlorid {chloride} mg/L',
    hi: 'कैल्शियम {calcium} · मैग्नीशियम {magnesium} · सल्फेट {sulfate} · क्लोराइड {chloride} mg/L',
    mr: 'कॅल्शियम {calcium} · मॅग्नेशियम {magnesium} · सल्फेट {sulfate} · क्लोराइड {chloride} mg/L',
  },

  'home.grainBill.title': { en: 'Grain Bill', de: 'Schüttung', hi: 'ग्रेन बिल', mr: 'ग्रेन बिल' },
  'home.grainBill.empty': {
    en: 'No grains added yet.',
    de: 'Noch keine Malze hinzugefügt.',
    hi: 'अभी तक कोई अनाज नहीं जोड़ा गया।',
    mr: 'अद्याप कोणतेही धान्य जोडलेले नाही.',
  },
  'home.grainBill.unnamedGrain': {
    en: 'Unnamed grain',
    de: 'Unbenanntes Malz',
    hi: 'अनाम अनाज',
    mr: 'अनामिक धान्य',
  },
  'home.grainBill.potentialSuffix': {
    en: ', {potential} SG potential',
    de: ', {potential} SG Potenzial',
    hi: ', {potential} SG संभावित',
    mr: ', {potential} SG संभाव्य',
  },
  'home.grainBill.total': {
    en: 'Total: {total} kg {srm}',
    de: 'Gesamt: {total} kg {srm}',
    hi: 'कुल: {total} kg {srm}',
    mr: 'एकूण: {total} kg {srm}',
  },
  'home.grainBill.srmSuffix': {
    en: '-- ~{srm} SRM',
    de: '-- ~{srm} SRM',
    hi: '-- ~{srm} SRM',
    mr: '-- ~{srm} SRM',
  },
  'home.grainBill.estimatedOg': {
    en: 'Estimated OG: {og} SG (at {efficiency}% assumed efficiency)',
    de: 'Geschätzte SG: {og} SG (bei angenommener Ausbeute von {efficiency}%)',
    hi: 'अनुमानित OG: {og} SG ({efficiency}% अनुमानित दक्षता पर)',
    mr: 'अंदाजित OG: {og} SG ({efficiency}% गृहीत कार्यक्षमतेवर)',
  },

  'home.mashSparge.title': { en: 'Mash & Sparge', de: 'Maischen & Läutern', hi: 'मैश और स्पार्ज', mr: 'मॅश आणि स्पार्ज' },
  'home.mashSparge.batchVolume': {
    en: 'Batch Volume: {volume} L',
    de: 'Sudvolumen: {volume} L',
    hi: 'बैच मात्रा: {volume} L',
    mr: 'बॅच प्रमाण: {volume} L',
  },
  'home.mashSparge.targetStyleProfile': {
    en: 'Target Style Profile: {style}',
    de: 'Ziel-Wasserprofil: {style}',
    hi: 'लक्ष्य शैली प्रोफ़ाइल: {style}',
    mr: 'लक्ष्य शैली प्रोफाइल: {style}',
  },
  'home.mashSparge.spargeVolume': {
    en: 'Sparge Volume: {volume} L',
    de: 'Läuterwassermenge: {volume} L',
    hi: 'स्पार्ज मात्रा: {volume} L',
    mr: 'स्पार्ज प्रमाण: {volume} L',
  },

  'home.recipeGravity.title': { en: 'Recipe Gravity', de: 'Rezeptdichte', hi: 'रेसिपी घनत्व', mr: 'रेसिपी घनता' },
  'home.recipeGravity.abvSimple': {
    en: 'ABV (simple): {abv}%',
    de: 'ABV (einfach): {abv}%',
    hi: 'ABV (सरल): {abv}%',
    mr: 'ABV (साधे): {abv}%',
  },

  'home.hopsIbu.title': { en: 'Hops & IBU', de: 'Hopfen & IBU', hi: 'हॉप्स और IBU', mr: 'हॉप्स आणि IBU' },
  'home.hopsIbu.empty': {
    en: 'No hop additions logged yet.',
    de: 'Noch keine Hopfengaben erfasst.',
    hi: 'अभी तक कोई हॉप्स जोड़ नहीं दर्ज की गई।',
    mr: 'अद्याप कोणतीही हॉप्स भर नोंदवलेली नाही.',
  },
  'home.hopsIbu.unnamedHop': {
    en: 'Unnamed hop',
    de: 'Unbenannter Hopfen',
    hi: 'अनाम हॉप',
    mr: 'अनामिक हॉप',
  },
  'home.hopsIbu.additionDetail': {
    en: '{weight} g @ {aa}% AA, {time} min',
    de: '{weight} g bei {aa}% Alpha, {time} min',
    hi: '{weight} g @ {aa}% AA, {time} मिनट',
    mr: '{weight} g @ {aa}% AA, {time} मिनिट',
  },
  'home.hopsIbu.totalIbu': {
    en: 'Total IBU: {ibu} ({formula})',
    de: 'Gesamt-IBU: {ibu} ({formula})',
    hi: 'कुल IBU: {ibu} ({formula})',
    mr: 'एकूण IBU: {ibu} ({formula})',
  },

  'home.deviation.title': {
    en: 'Deviation vs {style}',
    de: 'Abweichung von {style}',
    hi: '{style} की तुलना में विचलन',
    mr: '{style} च्या तुलनेत विचलन',
  },
  'home.deviation.changeStyle': {
    en: 'Change Style',
    de: 'Stil ändern',
    hi: 'शैली बदलें',
    mr: 'शैली बदला',
  },
  'home.deviation.matchSummary': {
    en: 'Matches {count}/5 parameters -- built from Grain Bill, Hops, and Recipe Gravity above.',
    de: 'Trifft {count}/5 Parameter -- basiert auf Schüttung, Hopfen und Rezeptdichte oben.',
    hi: '{count}/5 मापदंड मेल खाते हैं -- ऊपर दिए गए ग्रेन बिल, हॉप्स और रेसिपी घनत्व से बना।',
    mr: '{count}/5 मापदंड जुळतात -- वरील ग्रेन बिल, हॉप्स आणि रेसिपी घनतेवरून तयार.',
  },
  'home.deviation.inRange': {
    en: 'in range',
    de: 'im Bereich',
    hi: 'सीमा में',
    mr: 'मर्यादेत',
  },
  'home.deviation.under': {
    en: 'under',
    de: 'unter',
    hi: 'कम',
    mr: 'कमी',
  },
  'home.deviation.over': {
    en: 'over',
    de: 'über',
    hi: 'अधिक',
    mr: 'जास्त',
  },
  'home.deviation.rangeSuffix': {
    en: '{direction} range',
    de: 'dem Bereich {direction}',
    hi: 'सीमा से {direction}',
    mr: 'मर्यादेपेक्षा {direction}',
  },
  'home.deviation.originalGravity': { en: 'Original Gravity', de: 'Stammwürze', hi: 'प्रारंभिक घनत्व', mr: 'प्रारंभिक घनता' },
  'home.deviation.finalGravity': { en: 'Final Gravity', de: 'Endvergärungsgrad', hi: 'अंतिम घनत्व', mr: 'अंतिम घनता' },
  'home.deviation.ibu': { en: 'IBU', de: 'IBU', hi: 'IBU', mr: 'IBU' },
  'home.deviation.colorSrm': { en: 'Color (SRM)', de: 'Farbe (SRM)', hi: 'रंग (SRM)', mr: 'रंग (SRM)' },
  'home.deviation.abv': { en: 'ABV', de: 'ABV', hi: 'ABV', mr: 'ABV' },

  'home.fermentation.title': {
    en: 'Fermentation Batches',
    de: 'Gärchargen',
    hi: 'किण्वन बैच',
    mr: 'किण्वन बॅचेस',
  },
  'home.fermentation.empty': {
    en: 'No batches logged yet.',
    de: 'Noch keine Chargen erfasst.',
    hi: 'अभी तक कोई बैच दर्ज नहीं किया गया।',
    mr: 'अद्याप कोणतेही बॅच नोंदवलेले नाही.',
  },
  'home.fermentation.readingCount': {
    en: '{count} reading{plural}',
    de: '{count} Messwert{plural}',
    hi: '{count} रीडिंग{plural}',
    mr: '{count} रीडिंग{plural}',
  },
  'home.fermentation.attenuationSuffix': {
    en: ', {attenuation}% attenuation',
    de: ', {attenuation}% Vergärungsgrad',
    hi: ', {attenuation}% अपचयन',
    mr: ', {attenuation}% अपचयन',
  },
  'home.fermentation.likelyFinished': {
    en: '-- likely finished',
    de: '-- vermutlich fertig',
    hi: '-- संभवतः पूर्ण',
    mr: '-- बहुधा पूर्ण',
  },

  'home.share.button': {
    en: 'Share / Export Recipe',
    de: 'Rezept teilen / exportieren',
    hi: 'रेसिपी साझा करें / निर्यात करें',
    mr: 'रेसिपी शेअर करा / एक्सपोर्ट करा',
  },
  'home.share.shared': { en: 'Shared.', de: 'Geteilt.', hi: 'साझा किया गया।', mr: 'शेअर केले.' },
  'home.share.copied': {
    en: 'Copied to clipboard -- paste into any app.',
    de: 'In die Zwischenablage kopiert -- in eine beliebige App einfügen.',
    hi: 'क्लिपबोर्ड पर कॉपी किया गया -- किसी भी ऐप में पेस्ट करें।',
    mr: 'क्लिपबोर्डवर कॉपी केले -- कोणत्याही अ‍ॅपमध्ये पेस्ट करा.',
  },
  'home.share.error': {
    en: 'Sharing not supported on this browser -- try the Print/Save as PDF option in your browser menu.',
    de: 'Teilen wird in diesem Browser nicht unterstützt -- versuchen Sie die Option Drucken/Als PDF speichern im Browsermenü.',
    hi: 'इस ब्राउज़र पर साझा करना समर्थित नहीं है -- अपने ब्राउज़र मेनू में प्रिंट/PDF के रूप में सहेजें विकल्प आज़माएँ।',
    mr: 'या ब्राउझरवर शेअरिंग समर्थित नाही -- तुमच्या ब्राउझर मेनूमधील प्रिंट/PDF म्हणून सेव्ह करा हा पर्याय वापरून पहा.',
  },
  'home.share.idle': {
    en: "Opens your device's share sheet (WhatsApp, Email, etc.), or copies a text summary if sharing isn't available. For a PDF, use your browser's Print -> Save as PDF.",
    de: 'Öffnet die Freigabeoptionen Ihres Geräts (WhatsApp, E-Mail usw.) oder kopiert eine Textzusammenfassung, falls Teilen nicht verfügbar ist. Für ein PDF verwenden Sie Drucken -> Als PDF speichern in Ihrem Browser.',
    hi: 'आपके डिवाइस की शेयर शीट (WhatsApp, ईमेल, आदि) खोलता है, या यदि शेयरिंग उपलब्ध नहीं है तो एक टेक्स्ट सारांश कॉपी करता है। PDF के लिए, अपने ब्राउज़र के प्रिंट -> PDF के रूप में सहेजें का उपयोग करें।',
    mr: 'तुमच्या डिव्हाइसची शेअर शीट (WhatsApp, ईमेल, इ.) उघडते, किंवा शेअरिंग उपलब्ध नसल्यास मजकूर सारांश कॉपी करते. PDF साठी, तुमच्या ब्राउझरचा प्रिंट -> PDF म्हणून सेव्ह करा वापरा.',
  },
  'home.lockRecipe': {
    en: 'Lock This Recipe',
    de: 'Dieses Rezept sperren',
    hi: 'यह रेसिपी लॉक करें',
    mr: 'ही रेसिपी लॉक करा',
  },
} as const satisfies TranslationDict;
