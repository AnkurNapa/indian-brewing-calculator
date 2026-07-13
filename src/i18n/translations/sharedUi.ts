import { TranslationDict } from './types';

/** Shared UI atoms: SearchableSelect, Tabs, SessionSummary. */
export const sharedUiTranslations = {
  'sharedUi.searchableSelect.searchPlaceholder': {
    en: 'Search...',
    de: 'Suchen...',
    hi: 'खोजें...',
    mr: 'शोधा...',
  },
  'sharedUi.searchableSelect.selectPlaceholder': {
    en: 'Select...',
    de: 'Auswählen...',
    hi: 'चुनें...',
    mr: 'निवडा...',
  },
  'sharedUi.searchableSelect.noMatches': {
    en: 'No matches.',
    de: 'Keine Treffer.',
    hi: 'कोई मेल नहीं मिला।',
    mr: 'कोणतीही जुळणी नाही.',
  },
  'sharedUi.tabs.ariaLabel': {
    en: 'Brewing calculator sections',
    de: 'Bereiche des Braurechners',
    hi: 'ब्रूइंग कैलकुलेटर अनुभाग',
    mr: 'ब्रूइंग कॅल्क्युलेटर विभाग',
  },
  'sharedUi.sessionSummary.ariaLabel': {
    en: 'Current brew session selections',
    de: 'Aktuelle Auswahl der Brausitzung',
    hi: 'वर्तमान ब्रू सत्र चयन',
    mr: 'सध्याच्या ब्रू सत्राची निवड',
  },
} as const satisfies TranslationDict;
