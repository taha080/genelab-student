import { describe, expect, it } from 'vitest';
import { textsOf } from '../src/lib/diagrams';
import { gradeStudy, STUDY_SOURCES, STUDY_TOPICS, studyDiagram, studyFromHash, studyTopic } from '../src/lib/study';
import { STUDY_TOPIC_IDS } from '../src/lib/studyTypes';
import { emptyProgress, recordLessonCheck, saveLessonCheck, type KeyValueStore } from '../src/lib/progress';

function memory(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

describe('study topics', () => {
  it('lists every syllabus page once, in nav order', () => {
    expect(STUDY_TOPICS.map((topic) => topic.id)).toEqual([...STUDY_TOPIC_IDS]);
  });

  it('gives each page a full set of study material and a figure', () => {
    const seen = new Set<string>();
    for (const topic of STUDY_TOPICS) {
      expect(seen.has(topic.id), topic.id).toBe(false);
      seen.add(topic.id);
      expect(topic.sections.length).toBeGreaterThanOrEqual(4);
      for (const section of topic.sections) {
        expect(section.heading.trim().length).toBeGreaterThan(3);
        expect(section.paragraphs.length).toBeGreaterThanOrEqual(1);
        for (const paragraph of section.paragraphs) expect(paragraph.trim().length).toBeGreaterThan(80);
      }
      expect(topic.definitions.length).toBeGreaterThanOrEqual(5);
      expect(topic.keyPoints.length).toBeGreaterThanOrEqual(5);
      expect(topic.worked.steps.length).toBeGreaterThanOrEqual(3);
      expect(topic.worked.result.trim().length).toBeGreaterThan(40);
      expect(topic.pakistan.body.trim().length).toBeGreaterThan(80);
      expect(topic.quiz.length).toBe(4);
      expect(topic.shorts.length).toBeGreaterThanOrEqual(2);
      for (const question of topic.quiz) {
        expect(new Set(question.choices).size).toBe(4);
        expect(question.explanation.trim().length).toBeGreaterThan(20);
      }
      for (const item of topic.shorts) expect(item.answer.trim().length).toBeGreaterThan(80);
      const diagram = studyDiagram(topic.id);
      expect(diagram.alt.trim().length).toBeGreaterThan(20);
      expect(diagram.caption.trim().length).toBeGreaterThan(20);
      expect(textsOf(diagram).length).toBeGreaterThan(0);
      expect(seen.has(diagram.id)).toBe(false);
      seen.add(diagram.id);
    }
  });

  it('stays in English', () => {
    const blob = JSON.stringify(STUDY_TOPICS);
    expect(blob).not.toMatch(/[\u0600-\u06FF\u0900-\u097F\u0750-\u077F]/);
  });

  it('keeps the textbook counts used in the worked examples', () => {
    const photo = JSON.stringify(studyTopic('photosynthesis'));
    expect(photo).toContain('18 ATP');
    expect(photo).toContain('12 NADPH');
    const enzymes = JSON.stringify(studyTopic('enzymes'));
    expect(enzymes).toContain('33.3');
    expect(enzymes).toContain('apparent Km');
    const pcr = JSON.stringify(studyTopic('pcr'));
    expect(pcr).toContain('1024');
    expect(pcr).toContain('1,073,741,824');
  });

  it('grades a perfect round and rejects a blank', () => {
    const topic = studyTopic('photosynthesis');
    expect(topic).not.toBeNull();
    const perfect = topic!.quiz.map((question) => question.answer);
    expect(gradeStudy('photosynthesis', perfect)).toEqual({ score: 4, total: 4 });
    const missed: number[] = [...perfect];
    missed[0] = ((missed[0] ?? 0) + 1) % 4;
    expect(gradeStudy('photosynthesis', missed)?.score).toBe(3);
    expect(gradeStudy('photosynthesis', [-1, 0, 0, 0])).toBeNull();
    expect(gradeStudy('photosynthesis', [0, 0, 0])).toBeNull();
    expect(studyFromHash('#study/pcr')).toBe('pcr');
    expect(studyFromHash('#study/nope')).toBe('biomolecules');
  });

  it('saves a study quiz without pretending it is a metabolism lesson', () => {
    const store = memory();
    const state = saveLessonCheck(store, 'enzymes', 3, 4, '2026-04-01T00:00:00.000Z');
    expect(state.used.study).toBe('2026-04-01T00:00:00.000Z');
    expect(state.used.metabolism).toBeUndefined();
    expect(state.checks).toEqual([{ id: 'enzymes', score: 3, total: 4, at: '2026-04-01T00:00:00.000Z' }]);
    expect(recordLessonCheck(emptyProgress(), 'not-a-topic', 1, 4, '2026-04-01T00:00:00.000Z').checks).toEqual([]);
  });

  it('names the curricula the notes follow', () => {
    const labels = STUDY_SOURCES.map((source) => source.label).join('\n');
    expect(labels).toContain('2022-23');
    expect(labels).toContain('HEC');
    expect(labels).toContain('Biosafety');
    for (const source of STUDY_SOURCES) expect(source.href.startsWith('https://')).toBe(true);
  });
});
