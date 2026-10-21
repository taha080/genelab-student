/** Shared shape for the syllabus study pages. */

export const STUDY_TOPIC_IDS = [
  'biomolecules',
  'enzymes',
  'cell',
  'photosynthesis',
  'inheritance',
  'evolution',
  'microbiology',
  'immunology',
  'regulation',
  'pcr',
  'electrophoresis',
  'cloning',
  'bioinformatics',
  'biosafety',
  'fermentation',
  'agri',
  'tissue',
  'health',
] as const;

export type StudyTopicId = (typeof STUDY_TOPIC_IDS)[number];

export interface StudyQuiz {
  prompt: string;
  choices: readonly [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface StudySection {
  heading: string;
  paragraphs: readonly string[];
}

export interface StudyTopic {
  id: StudyTopicId;
  title: string;
  short: string;
  kicker: string;
  level: string;
  summary: string;
  sections: readonly StudySection[];
  definitions: readonly { term: string; meaning: string }[];
  worked: { title: string; prompt: string; steps: readonly string[]; result: string };
  pakistan: { title: string; body: string };
  keyPoints: readonly string[];
  quiz: readonly StudyQuiz[];
  shorts: readonly { prompt: string; answer: string }[];
  related: readonly { label: string; hash: string }[];
}

export function isStudyTopic(id: string): id is StudyTopicId {
  return (STUDY_TOPIC_IDS as readonly string[]).includes(id);
}
