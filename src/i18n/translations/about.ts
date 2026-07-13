import { TranslationDict } from './types';

/** About panel: app info, credits, FAQ, disclaimer, terms. */
export const aboutTranslations = {
  'about.heading': { en: 'About', de: 'Über', hi: 'परिचय', mr: 'परिचय' },

  'about.aboutMe.title': { en: 'About Me', de: 'Über mich', hi: 'मेरे बारे में', mr: 'माझ्याबद्दल' },
  'about.aboutMe.bio': {
    en: 'Ankur Napa, brewmaster exploring where AI meets brewing and distilling.',
    de: 'Ankur Napa, Braumeister, der erkundet, wo künstliche Intelligenz auf Brauen und Destillieren trifft.',
    hi: 'अंकुर नापा, ब्रूमास्टर, जो AI और ब्रूइंग-डिस्टिलिंग के मिलन को खोजते हैं।',
    mr: 'अंकुर नापा, ब्रूमास्टर, जे AI आणि ब्रूइंग-डिस्टिलिंगचा संगम शोधतात.',
  },
  'about.aboutMe.blog': { en: 'Blog', de: 'Blog', hi: 'ब्लॉग', mr: 'ब्लॉग' },
  'about.aboutMe.aiForBrewers': {
    en: 'AI for Brewers and Distillers',
    de: 'KI für Brauer und Destillateure',
    hi: 'ब्रूअर्स व डिस्टिलर्स के लिए AI',
    mr: 'ब्रूअर्स व डिस्टिलर्ससाठी AI',
  },
  'about.aboutMe.linkedin': { en: 'LinkedIn', de: 'LinkedIn', hi: 'लिंक्डइन', mr: 'लिंक्डइन' },

  'about.faq.title': { en: 'FAQ', de: 'Häufige Fragen', hi: 'सामान्य प्रश्न', mr: 'सामान्य प्रश्न' },
  'about.faq.q1.question': {
    en: 'Is my data uploaded anywhere?',
    de: 'Werden meine Daten irgendwo hochgeladen?',
    hi: 'क्या मेरा डेटा कहीं अपलोड होता है?',
    mr: 'माझा डेटा कुठे अपलोड होतो का?',
  },
  'about.faq.q1.answer': {
    en: 'By default, no -- everything you enter is saved only in your browser\'s local storage on this device, and there is no server or database behind this app. The Backup & Sync tab has an optional Google Sync you can opt into, which writes your data to a private spreadsheet in your own Google Drive; nothing is sent to any server the app author runs.',
    de: 'Standardmäßig nein - alles, was Sie eingeben, wird nur im lokalen Speicher Ihres Browsers auf diesem Gerät gespeichert, und hinter dieser App steht weder ein Server noch eine Datenbank. Im Tab "Sicherung & Sync" gibt es ein optionales Google Sync, dem Sie zustimmen können; dabei werden Ihre Daten in eine private Tabelle in Ihrem eigenen Google Drive geschrieben - nichts wird an einen vom App-Autor betriebenen Server gesendet.',
    hi: 'डिफ़ॉल्ट रूप से, नहीं -- आप जो कुछ भी दर्ज करते हैं वह केवल इस डिवाइस पर आपके ब्राउज़र के लोकल स्टोरेज में सहेजा जाता है, और इस ऐप के पीछे कोई सर्वर या डेटाबेस नहीं है। बैकअप व सिंक टैब में एक वैकल्पिक Google Sync है जिसे आप चुन सकते हैं, जो आपका डेटा आपके अपने Google Drive की एक निजी स्प्रेडशीट में लिखता है; ऐप लेखक द्वारा चलाए जा रहे किसी भी सर्वर को कुछ नहीं भेजा जाता।',
    mr: 'डीफॉल्टनुसार, नाही -- तुम्ही टाकलेली प्रत्येक गोष्ट फक्त या डिव्हाइसवरील तुमच्या ब्राउझरच्या लोकल स्टोरेजमध्ये जतन होते, आणि या अ‍ॅपमागे कोणताही सर्व्हर किंवा डेटाबेस नाही. बॅकअप व सिंक टॅबमध्ये एक ऐच्छिक Google Sync आहे जो तुम्ही निवडू शकता, जो तुमचा डेटा तुमच्या स्वतःच्या Google Drive मधील खासगी स्प्रेडशीटमध्ये लिहितो; अ‍ॅप लेखक चालवत असलेल्या कोणत्याही सर्व्हरला काहीही पाठवले जात नाही.',
  },
  'about.faq.q2.question': {
    en: 'How does Backup & Sync work?',
    de: 'Wie funktioniert Sicherung & Sync?',
    hi: 'बैकअप व सिंक कैसे काम करता है?',
    mr: 'बॅकअप व सिंक कसे काम करते?',
  },
  'about.faq.q2.answer': {
    en: 'Two independent options: a local Export/Import (download a .json backup or .csv tables, no account needed) and Google Sync (sign in with your own Google account; the app talks directly to the Sheets API from your browser to read/write a spreadsheet it creates in your Drive). Use either, both, or neither.',
    de: 'Zwei unabhängige Optionen: ein lokaler Export/Import (Download einer .json-Sicherung oder .csv-Tabellen, kein Konto nötig) und Google Sync (Anmeldung mit Ihrem eigenen Google-Konto; die App spricht direkt aus Ihrem Browser mit der Sheets API, um eine in Ihrem Drive erstellte Tabelle zu lesen/schreiben). Nutzen Sie beides, eines oder keines davon.',
    hi: 'दो स्वतंत्र विकल्प: एक लोकल एक्सपोर्ट/इम्पोर्ट (.json बैकअप या .csv टेबल डाउनलोड करें, किसी खाते की आवश्यकता नहीं) और Google Sync (अपने खुद के Google खाते से साइन इन करें; ऐप आपके ब्राउज़र से सीधे Sheets API से बात करके आपके Drive में बनाई गई स्प्रेडशीट को पढ़ता/लिखता है)। दोनों, एक, या किसी का भी उपयोग करें।',
    mr: 'दोन स्वतंत्र पर्याय: एक लोकल एक्सपोर्ट/इम्पोर्ट (.json बॅकअप किंवा .csv तक्ते डाउनलोड करा, खात्याची गरज नाही) आणि Google Sync (तुमच्या स्वतःच्या Google खात्याने साइन इन करा; अ‍ॅप तुमच्या ब्राउझरमधून थेट Sheets API शी बोलून तुमच्या Drive मध्ये तयार केलेली स्प्रेडशीट वाचते/लिहिते). दोन्ही, एक, किंवा कोणतेही वापरा.',
  },
  'about.faq.q3.question': {
    en: 'Where do the formulas come from?',
    de: 'Woher stammen die Formeln?',
    hi: 'सूत्र कहाँ से आते हैं?',
    mr: 'सूत्रे कुठून येतात?',
  },
  'about.faq.q3.answer': {
    en: 'Generally-published brewing science (residual alkalinity, Tinseth IBU, Morey SRM, standard ABV/attenuation formulas, etc.), implemented independently for this app -- not copied from any proprietary spreadsheet or tool.',
    de: 'Allgemein veröffentlichte Braukunde (Restalkalität, Tinseth-IBU, Morey-SRM, Standardformeln für ABV/Vergärungsgrad usw.), unabhängig für diese App implementiert - nicht aus einer proprietären Tabelle oder einem Tool übernommen.',
    hi: 'सामान्यतः प्रकाशित ब्रूइंग विज्ञान (अवशिष्ट क्षारीयता, Tinseth IBU, Morey SRM, मानक ABV/एटेन्युएशन सूत्र आदि), इस ऐप के लिए स्वतंत्र रूप से लागू किए गए -- किसी स्वामित्व वाली स्प्रेडशीट या टूल से कॉपी नहीं किए गए।',
    mr: 'सामान्यतः प्रकाशित ब्रूइंग विज्ञान (अवशिष्ट क्षारता, Tinseth IBU, Morey SRM, मानक ABV/अ‍ॅटेन्युएशन सूत्रे इ.), या अ‍ॅपसाठी स्वतंत्रपणे राबवली -- कोणत्याही मालकीच्या स्प्रेडशीट किंवा टूलमधून कॉपी केलेली नाहीत.',
  },
  'about.faq.q4.question': {
    en: 'How accurate are the predictions?',
    de: 'Wie genau sind die Vorhersagen?',
    hi: 'भविष्यवाणियाँ कितनी सटीक हैं?',
    mr: 'अंदाज किती अचूक आहेत?',
  },
  'about.faq.q4.answer': {
    en: 'Planning-grade estimates, not lab-precise measurements. Mash pH, force-carbonation pressure, and similar predictions are approximations -- always verify with a calibrated pH meter, hydrometer, or physical carbonation chart before relying on them for production.',
    de: 'Planungsgrade Schätzungen, keine laborgenauen Messungen. Maische-pH, Zwangskarbonisierungsdruck und ähnliche Vorhersagen sind Näherungswerte - vor der Produktion immer mit einem kalibrierten pH-Meter, Hydrometer oder einer physischen Karbonisierungstabelle überprüfen.',
    hi: 'योजना-स्तरीय अनुमान, प्रयोगशाला-सटीक माप नहीं। मैश pH, फोर्स-कार्बोनेशन दबाव, और इसी तरह की भविष्यवाणियाँ अनुमान मात्र हैं -- उत्पादन के लिए भरोसा करने से पहले हमेशा एक कैलिब्रेटेड pH मीटर, हाइड्रोमीटर, या फिजिकल कार्बोनेशन चार्ट से सत्यापित करें।',
    mr: 'नियोजन-स्तरीय अंदाज, प्रयोगशाळा-सुस्पष्ट मोजमापे नाहीत. मॅश pH, फोर्स-कार्बोनेशन दाब, आणि तत्सम अंदाज हे अंदाजे असतात -- उत्पादनासाठी विसंबण्याआधी नेहमी कॅलिब्रेटेड pH मीटर, हायड्रोमीटर, किंवा प्रत्यक्ष कार्बोनेशन तक्त्याने पडताळणी करा.',
  },
  'about.faq.q5.question': {
    en: 'Are the BJCP style ranges official?',
    de: 'Sind die BJCP-Stilbereiche offiziell?',
    hi: 'क्या BJCP शैली सीमाएँ आधिकारिक हैं?',
    mr: 'BJCP शैली मर्यादा अधिकृत आहेत का?',
  },
  'about.faq.q5.answer': {
    en: 'They are a numeric quick-reference reconstructed from general brewing knowledge, not copied from the official BJCP guidelines document. For competition or anything official, always check bjcp.org directly.',
    de: 'Sie sind eine numerische Kurzreferenz, rekonstruiert aus allgemeinem Brauwissen, nicht aus dem offiziellen BJCP-Richtliniendokument kopiert. Für Wettbewerbe oder alles Offizielle immer direkt bjcp.org konsultieren.',
    hi: 'ये सामान्य ब्रूइंग ज्ञान से पुनर्निर्मित एक संख्यात्मक त्वरित-संदर्भ हैं, आधिकारिक BJCP दिशानिर्देश दस्तावेज़ से कॉपी नहीं किए गए। प्रतियोगिता या किसी भी आधिकारिक कार्य के लिए, हमेशा सीधे bjcp.org देखें।',
    mr: 'ही सामान्य ब्रूइंग ज्ञानातून पुनर्रचित संख्यात्मक जलद-संदर्भ आहे, अधिकृत BJCP मार्गदर्शक दस्तऐवजातून कॉपी केलेली नाही. स्पर्धा किंवा कोणत्याही अधिकृत कामासाठी, नेहमी थेट bjcp.org पहा.',
  },
  'about.faq.q6.question': {
    en: 'Can I use this on my phone during a brew day?',
    de: 'Kann ich das am Brautag auf meinem Handy nutzen?',
    hi: 'क्या मैं ब्रू डे के दौरान इसे अपने फ़ोन पर उपयोग कर सकता हूँ?',
    mr: 'ब्रू डेच्या दिवशी मी हे माझ्या फोनवर वापरू शकतो का?',
  },
  'about.faq.q6.answer': {
    en: 'Yes -- it is built mobile-first and works fully offline once loaded, since there is no server dependency. Add it to your home screen for quick access.',
    de: 'Ja - die App ist mobile-first gebaut und funktioniert nach dem Laden vollständig offline, da keine Serverabhängigkeit besteht. Fügen Sie sie für schnellen Zugriff Ihrem Startbildschirm hinzu.',
    hi: 'हाँ -- यह मोबाइल-फर्स्ट बनाया गया है और लोड होने के बाद पूरी तरह ऑफ़लाइन काम करता है, क्योंकि इसमें कोई सर्वर निर्भरता नहीं है। त्वरित पहुँच के लिए इसे अपनी होम स्क्रीन में जोड़ें।',
    mr: 'हो -- हे मोबाइल-फर्स्ट बनवले आहे आणि लोड झाल्यावर पूर्णपणे ऑफलाइन काम करते, कारण त्यात कोणतेही सर्व्हर अवलंबित्व नाही. जलद प्रवेशासाठी ते तुमच्या होम स्क्रीनवर जोडा.',
  },

  'about.disclaimer.title': { en: 'Disclaimer', de: 'Haftungsausschluss', hi: 'अस्वीकरण', mr: 'अस्वीकरण' },
  'about.disclaimer.p1': {
    en: 'This app provides planning-grade brewing calculations for educational and informational purposes only. Formulas are approximations of published brewing science and are not guaranteed to be precise or error-free. Always verify critical values (mash pH, carbonation pressure, ABV, alcohol content for labeling/duty purposes, etc.) with calibrated instruments and, where relevant, consult applicable local regulations before commercial use.',
    de: 'Diese App bietet nur planungsgrade Brau-Berechnungen zu Bildungs- und Informationszwecken. Formeln sind Näherungen an veröffentlichte Braukunde und garantiert weder präzise noch fehlerfrei. Überprüfen Sie kritische Werte (Maische-pH, Karbonisierungsdruck, ABV, Alkoholgehalt für Kennzeichnungs-/Steuerzwecke usw.) immer mit kalibrierten Instrumenten und ziehen Sie vor kommerzieller Nutzung gegebenenfalls die geltenden örtlichen Vorschriften zu Rate.',
    hi: 'यह ऐप केवल शैक्षिक और सूचनात्मक उद्देश्यों के लिए योजना-स्तरीय ब्रूइंग गणना प्रदान करता है। सूत्र प्रकाशित ब्रूइंग विज्ञान के अनुमान हैं और इनकी सटीकता या त्रुटि-मुक्त होने की गारंटी नहीं है। व्यावसायिक उपयोग से पहले महत्वपूर्ण मानों (मैश pH, कार्बोनेशन दबाव, ABV, लेबलिंग/शुल्क प्रयोजनों के लिए अल्कोहल सामग्री आदि) को कैलिब्रेटेड उपकरणों से हमेशा सत्यापित करें, और जहाँ प्रासंगिक हो, लागू स्थानीय नियमों से परामर्श करें।',
    mr: 'हे अ‍ॅप केवळ शैक्षणिक व माहितीपर हेतूंसाठी नियोजन-स्तरीय ब्रूइंग गणना पुरवते. सूत्रे प्रकाशित ब्रूइंग विज्ञानाची अंदाजे आहेत आणि त्यांची अचूकता किंवा त्रुटीमुक्तता याची हमी नाही. व्यावसायिक वापरापूर्वी महत्त्वाची मूल्ये (मॅश pH, कार्बोनेशन दाब, ABV, लेबलिंग/शुल्क हेतूंसाठी अल्कोहल प्रमाण इ.) कॅलिब्रेटेड उपकरणांनी नेहमी पडताळा, आणि जिथे लागू असेल तिथे संबंधित स्थानिक नियमांचा सल्ला घ्या.',
  },
  'about.disclaimer.p2': {
    en: 'BJCP-style reference ranges are a quick numeric guide reconstructed from general knowledge, not sourced from or endorsed by the official BJCP Style Guidelines document. For competitions or formal style judging, always consult bjcp.org directly.',
    de: 'BJCP-Stil-Referenzbereiche sind ein aus allgemeinem Wissen rekonstruierter schneller numerischer Leitfaden, weder aus dem offiziellen BJCP Style Guidelines-Dokument stammend noch von diesem gebilligt. Für Wettbewerbe oder formale Stilbeurteilungen immer direkt bjcp.org konsultieren.',
    hi: 'BJCP-शैली संदर्भ सीमाएँ सामान्य ज्ञान से पुनर्निर्मित एक त्वरित संख्यात्मक मार्गदर्शिका हैं, जो आधिकारिक BJCP शैली दिशानिर्देश दस्तावेज़ से प्राप्त या समर्थित नहीं हैं। प्रतियोगिताओं या औपचारिक शैली निर्णय के लिए, हमेशा सीधे bjcp.org से परामर्श करें।',
    mr: 'BJCP-शैली संदर्भ मर्यादा सामान्य ज्ञानातून पुनर्रचित एक जलद संख्यात्मक मार्गदर्शक आहे, अधिकृत BJCP शैली मार्गदर्शक दस्तऐवजातून प्राप्त किंवा समर्थित नाही. स्पर्धांसाठी किंवा औपचारिक शैली परीक्षणासाठी, नेहमी थेट bjcp.org चा सल्ला घ्या.',
  },

  'about.terms.title': { en: 'Terms & Conditions', de: 'Nutzungsbedingungen', hi: 'नियम व शर्तें', mr: 'नियम व अटी' },
  'about.terms.p1': {
    en: 'This app is provided free, as-is, with no warranty of any kind, express or implied, including but not limited to accuracy, fitness for a particular purpose, or non-infringement. Use of any calculated value is entirely at your own risk and discretion.',
    de: 'Diese App wird kostenlos und wie besehen bereitgestellt, ohne jegliche ausdrückliche oder stillschweigende Gewährleistung, einschließlich, aber nicht beschränkt auf Genauigkeit, Eignung für einen bestimmten Zweck oder Nichtverletzung. Die Nutzung jedes berechneten Werts erfolgt ausschließlich auf eigenes Risiko und nach eigenem Ermessen.',
    hi: 'यह ऐप निःशुल्क, जैसा है वैसा प्रदान किया जाता है, बिना किसी भी प्रकार की व्यक्त या निहित वारंटी के, जिसमें सटीकता, किसी विशेष उद्देश्य के लिए उपयुक्तता, या गैर-उल्लंघन शामिल हैं परंतु इन्हीं तक सीमित नहीं। किसी भी परिकलित मान का उपयोग पूरी तरह से आपके अपने जोखिम और विवेक पर है।',
    mr: 'हे अ‍ॅप मोफत, जसे आहे तसे, कोणत्याही प्रकारच्या स्पष्ट किंवा गर्भित हमीशिवाय पुरवले जाते, ज्यात अचूकता, विशिष्ट उद्देशासाठी योग्यता, किंवा उल्लंघन नसणे यांचा समावेश आहे पण तेवढ्यापुरते मर्यादित नाही. कोणत्याही गणना केलेल्या मूल्याचा वापर संपूर्णपणे तुमच्या स्वतःच्या जोखमीवर व विवेकावर आहे.',
  },
  'about.terms.p2': {
    en: 'The author is not liable for any loss, damage, spoiled batch, regulatory issue, or other consequence arising from use of this app or reliance on its calculations.',
    de: 'Der Autor haftet nicht für Verluste, Schäden, verdorbene Sude, regulatorische Probleme oder andere Folgen, die sich aus der Nutzung dieser App oder dem Verlassen auf ihre Berechnungen ergeben.',
    hi: 'इस ऐप के उपयोग या इसकी गणनाओं पर भरोसा करने से उत्पन्न किसी भी हानि, क्षति, खराब बैच, नियामक समस्या, या अन्य परिणाम के लिए लेखक उत्तरदायी नहीं है।',
    mr: 'या अ‍ॅपच्या वापरामुळे किंवा त्याच्या गणनांवर विसंबल्यामुळे उद्भवणाऱ्या कोणत्याही हानी, नुकसान, खराब बॅच, नियामक समस्या, किंवा इतर परिणामासाठी लेखक जबाबदार नाही.',
  },
  'about.terms.p3': {
    en: "By default, all data you enter is stored only in your own browser's local storage on this device. If you opt in to Google Sync (Backup & Sync tab), your data is written to a spreadsheet in your own Google Drive using your own Google sign-in -- this app never has a server that stores, sees, or transmits your data anywhere else. Continued use of the app constitutes acceptance of these terms.",
    de: 'Standardmäßig werden alle von Ihnen eingegebenen Daten nur im lokalen Speicher Ihres eigenen Browsers auf diesem Gerät gespeichert. Wenn Sie sich für Google Sync entscheiden (Tab "Sicherung & Sync"), werden Ihre Daten mit Ihrer eigenen Google-Anmeldung in eine Tabelle in Ihrem eigenen Google Drive geschrieben - diese App hat niemals einen Server, der Ihre Daten anderswo speichert, einsieht oder überträgt. Die fortgesetzte Nutzung der App gilt als Annahme dieser Bedingungen.',
    hi: 'डिफ़ॉल्ट रूप से, आपके द्वारा दर्ज किया गया सारा डेटा केवल इस डिवाइस पर आपके अपने ब्राउज़र के लोकल स्टोरेज में संग्रहीत होता है। यदि आप Google Sync (बैकअप व सिंक टैब) का विकल्प चुनते हैं, तो आपका डेटा आपके अपने Google साइन-इन का उपयोग करके आपके अपने Google Drive की एक स्प्रेडशीट में लिखा जाता है -- इस ऐप के पास कभी भी ऐसा कोई सर्वर नहीं है जो आपका डेटा कहीं और संग्रहीत, देखे, या प्रसारित करे। ऐप का निरंतर उपयोग इन शर्तों की स्वीकृति माना जाएगा।',
    mr: 'डीफॉल्टनुसार, तुम्ही टाकलेला सर्व डेटा फक्त या डिव्हाइसवरील तुमच्या स्वतःच्या ब्राउझरच्या लोकल स्टोरेजमध्ये साठवला जातो. जर तुम्ही Google Sync (बॅकअप व सिंक टॅब) निवडले, तर तुमचा डेटा तुमच्या स्वतःच्या Google साइन-इनचा वापर करून तुमच्या स्वतःच्या Google Drive मधील स्प्रेडशीटमध्ये लिहिला जातो -- या अ‍ॅपकडे असा कोणताही सर्व्हर कधीच नसतो जो तुमचा डेटा इतरत्र साठवतो, पाहतो, किंवा प्रसारित करतो. अ‍ॅपचा सतत वापर या अटींची स्वीकृती दर्शवतो.',
  },
} as const satisfies TranslationDict;
