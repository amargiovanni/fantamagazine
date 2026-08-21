/**
 * The newsroom behind each rubrica: who signs it and what it is for.
 *
 * This DUPLICATES `editorial/style-guide.md` §6 and §7 on purpose — the same
 * contract boundary the rest of `src/lib` works under. The style guide is the
 * source of truth for the editorial rules; this file is the reader-facing copy
 * of the desk assignments, and the two change in the same commit.
 */
import { COLUMNS, type Column } from './columns';

export interface Desk {
  /** The bylines the style guide assigns to this rubrica (§7). */
  signatures: string[];
  /** How the masthead describes those signatures. */
  role: string;
  /** One line on what the rubrica is, in the paper's voice. */
  blurb: string;
}

export const DESKS: Record<Column, Desk> = {
  'cronaca-pagelle': {
    signatures: ['Gianni Sfotta'],
    role: 'inviato di pessima volontà',
    blurb:
      'La giornata raccontata come un fatto di cronaca nera, con le pagelle di tutte le squadre. Il voto non si spiega: si commina.',
  },
  editoriale: {
    signatures: ['Corrado Fantidiani'],
    role: 'direttore responsabile, per quanto la parola sia forte',
    blurb:
      'Un solo fatto della giornata, trattato come una questione morale nazionale. Si chiude sempre allo stesso modo: «Noi non ci fermeremo.»',
  },
  'rubrica-fissa': {
    signatures: ['Zia Fantina', 'Madame Panchinska'],
    role: 'consulente sentimentale della rosa e astrologa di provata inattendibilità',
    blurb:
      'Lo Sconfitto della Settimana, l’Oroscopo del Fantallenatore, la Posta del Cuore: due o tre appuntamenti fissi per numero, tutti a carico di qualcuno.',
  },
  classifiche: {
    signatures: ['Aldo Catenaccio'],
    role: 'analista tattico, ex nulla',
    blurb:
      'La classifica commentata riga per riga e le statistiche della vergogna: inutili, ma vere, e ognuna dichiara come è stata calcolata.',
  },
  mercato: {
    signatures: ['Ornella Malaparte'],
    role: 'caposervizio mercato e inchieste',
    blurb:
      'Probabili formazioni, voci di corridoio attribuite a fonti che non esistono e consigli deliberatamente pessimi. Ornella non dice mai «forse»: dice «risulta».',
  },
  approfondimento: {
    signatures: ['Ornella Malaparte', 'Aldo Catenaccio'],
    role: 'caposervizio inchieste e analista tattico, secondo il taglio',
    blurb:
      'L’inchiesta del mercoledì. Si nutre solo di storia già agli atti: dati passati, dossier, numeri precedenti.',
  },
  bombe: {
    signatures: ['Tancredi Soffiata'],
    role: 'inviato di mercato, fonti a sua insaputa',
    blurb:
      'Scambi che nessuno ha proposto, garantiti da fonti che nessuno ha incontrato. Ogni bomba è confermata al cento per cento; il bilancio di carriera è in testa al pezzo.',
  },
};

/** `/rubriche/mercato/` — the canonical URL of a rubrica. */
export function rubricaPath(column: Column): string {
  return `/rubriche/${column}/`;
}

/** The rubriche, in the order the style guide lists them (§6). */
export const RUBRICHE: readonly Column[] = COLUMNS;
