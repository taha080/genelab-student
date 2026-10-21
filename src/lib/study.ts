/**
 * Syllabus study pages for topics the bench did not already teach.
 * Counts and mechanisms follow standard textbooks. They are for study,
 * not a laboratory protocol.
 */

import type { Diagram } from './diagrams';
import { STUDY_DIAGRAMS } from './studyDiagrams';
import { STUDY_PART_1 } from './studyPart1';
import { STUDY_PART_2 } from './studyPart2';
import { STUDY_PART_3 } from './studyPart3';
import { isStudyTopic, STUDY_TOPIC_IDS, type StudyTopic, type StudyTopicId } from './studyTypes';

export { isStudyTopic, STUDY_TOPIC_IDS, type StudyTopic, type StudyTopicId };

export const STUDY_TOPICS: readonly StudyTopic[] = [...STUDY_PART_1, ...STUDY_PART_2, ...STUDY_PART_3];

const DIAGRAMS: Record<StudyTopicId, Diagram> = STUDY_DIAGRAMS;

export function studyDiagram(id: StudyTopicId): Diagram {
  return DIAGRAMS[id];
}

export function studyTopic(id: string): StudyTopic | null {
  return STUDY_TOPICS.find((topic) => topic.id === id) ?? null;
}

export function studyFromHash(hash: string): StudyTopicId {
  const cleaned = hash.replace(/^#/, '');
  if (cleaned === 'study') return 'biomolecules';
  if (!cleaned.startsWith('study/')) return 'biomolecules';
  const id = cleaned.slice('study/'.length);
  return isStudyTopic(id) ? id : 'biomolecules';
}

export function gradeStudy(id: string, choices: readonly number[]): { score: number; total: number } | null {
  const topic = studyTopic(id);
  if (!topic || choices.length !== topic.quiz.length) return null;
  if (choices.some((choice) => !Number.isInteger(choice) || choice < 0 || choice > 3)) return null;
  const score = topic.quiz.reduce((sum, question, index) => sum + (choices[index] === question.answer ? 1 : 0), 0);
  return { score, total: topic.quiz.length };
}

export const STUDY_SOURCES: readonly { label: string; href: string }[] = [
  {
    label: 'National Curriculum of Pakistan 2022-23, Biology grades 9–12 (FBISE)',
    href: 'https://fbise.edu.pk/Curriculum/22-23/13_NCP%20Biology%20PG%209-%2012.pdf',
  },
  {
    label: 'FBISE assessment framework, Biology HSSC-I, curriculum 2022-23',
    href: 'https://www.fbise.edu.pk/ModelPaper/2024New/bio/Final_Assessment_Framework_Model_Question_Paper_Biology_HSSC-I.pdf',
  },
  {
    label: 'FBISE model papers and assessment frameworks',
    href: 'https://fbise.edu.pk/curriculum_model_paper.php',
  },
  {
    label: 'HEC BS Biotechnology curriculum 2024',
    href: 'https://www.hec.gov.pk/english/services/universities/RevisedCurricula/Documents/2023-2024/Biotechnology-2024.pdf',
  },
  {
    label: 'Pakistan Biosafety Clearing-House (Biosafety Rules, 2005)',
    href: 'https://bch.environment.gov.pk/',
  },
];
