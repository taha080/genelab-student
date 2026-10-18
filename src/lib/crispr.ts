/**
 * Classroom SpCas9 guide finder.
 * Streptococcus pyogenes Cas9 reads a 5′-NGG-3′ PAM. The spacer is the 20 nt
 * immediately on the 5′ side of that PAM, written 5′→3′ on the PAM strand.
 * This does not search a genome for off-targets and it is not an efficiency score.
 */
import { cleanDna, gcContent, reverseComplement } from './sequence';

export type FlagLevel = 'good' | 'caution' | 'poor';

export interface GuideFlag {
  level: FlagLevel;
  text: string;
}

export interface GuideSite {
  strand: '+' | '-';
  /**
   * 0-based index, on the pasted sequence, of the first (leftmost) base of the
   * 20 bp site. On the + strand this is also the 5′ end of the spacer. On the
   * − strand the spacer reads toward this end, and the PAM sits just upstream.
   */
  start: number;
  guide: string;
  pam: string;
  gc: number;
  flags: GuideFlag[];
}

export function worstLevel(flags: GuideFlag[]): FlagLevel {
  if (flags.some((flag) => flag.level === 'poor')) return 'poor';
  if (flags.some((flag) => flag.level === 'caution')) return 'caution';
  return 'good';
}

/** GC window, homopolymers, and a U6 poly-T terminator check. */
export function guideFlags(guide: string): GuideFlag[] {
  const flags: GuideFlag[] = [];
  const gc = gcContent(guide);
  const gcText = `GC content is ${gc.toFixed(0)}%.`;
  if (gc >= 40 && gc <= 60) {
    flags.push({
      level: 'good',
      text: `${gcText} That sits in the 40–60% range often used in class.`,
    });
  } else if (gc >= 30 && gc <= 70) {
    flags.push({
      level: 'caution',
      text: `${gcText} Many class protocols aim for 40–60%.`,
    });
  } else {
    flags.push({
      level: 'poor',
      text: `${gcText} Very low or very high GC is a difficult guide.`,
    });
  }

  const runs = guide.match(/A{4,}|C{4,}|G{4,}|T{4,}/g) ?? [];
  const thymineRun = runs.find((run) => run.startsWith('T'));
  const otherRun = runs.find((run) => !run.startsWith('T'));
  if (thymineRun) {
    flags.push({
      level: 'poor',
      text: `Contains ${thymineRun}. Four or more thymines can terminate a U6 promoter, which some labs use to make the guide RNA.`,
    });
  }
  if (otherRun) {
    flags.push({
      level: 'caution',
      text: `Contains ${otherRun}. A long run of one base is harder to synthesize and can be unstable.`,
    });
  }
  return flags;
}

function site(strand: '+' | '-', start: number, guide: string, pam: string): GuideSite {
  return { strand, start, guide, pam, gc: gcContent(guide), flags: guideFlags(guide) };
}

export function findGuides(raw: string): GuideSite[] {
  const seq = cleanDna(raw).seq;
  const hits: GuideSite[] = [];

  for (let i = 0; i <= seq.length - 23; i += 1) {
    const pam = seq.slice(i + 20, i + 23);
    if (pam[1] === 'G' && pam[2] === 'G') {
      hits.push(site('+', i, seq.slice(i, i + 20), pam));
    }
  }

  const rc = reverseComplement(seq);
  for (let j = 0; j <= rc.length - 23; j += 1) {
    const pam = rc.slice(j + 20, j + 23);
    if (pam[1] === 'G' && pam[2] === 'G') {
      // rc index j maps to forward index (length - 1 - j). The 20 bp site
      // therefore begins at length - 20 - j on the pasted sequence.
      const start = seq.length - 20 - j;
      hits.push(site('-', start, rc.slice(j, j + 20), pam));
    }
  }

  hits.sort((a, b) => a.start - b.start || (a.strand === b.strand ? 0 : a.strand === '+' ? -1 : 1));
  return hits;
}
