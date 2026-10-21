import { bestLessonCheck, loadProgress, saveLessonCheck } from '../lib/progress';
import { gradeStudy, studyDiagram, studyFromHash, STUDY_SOURCES, STUDY_TOPICS, type StudyTopic } from '../lib/study';
import { el } from './dom';
import { mountFigures } from './figure';

const ALREADY: readonly { label: string; hash: string; detail: string }[] = [
  { label: 'Central dogma', hash: 'central-dogma', detail: 'Coding and template strands, transcription, translation, GC content, and open reading frames.' },
  { label: 'CRISPR guides', hash: 'crispr', detail: 'SpCas9 NGG sites and the 20 nucleotides beside them. Not a therapy.' },
  { label: 'PCR primers', hash: 'primers', detail: 'Wallace and nearest-neighbour Tm, GC, and simple primer warnings. The PCR process is a study topic.' },
  { label: 'Mutations', hash: 'mutations', detail: 'Silent, missense, nonsense, stop-loss, frameshift, and in-frame indels.' },
  { label: 'Codon table', hash: 'codon-table', detail: 'The standard genetic code, including start and stop.' },
  { label: 'Animation', hash: 'animation', detail: 'Helix, replication fork, transcription, and a ribosome with tRNA.' },
  { label: 'Sequence tools', hash: 'sequences', detail: 'FASTA, reverse complement, restriction sites, six-frame ORFs, and a short global alignment.' },
  { label: 'Biochemistry', hash: 'biochem', detail: 'The 20 amino acids, Michaelis–Menten kinetics, macromolecule cards, the citric acid cycle, and gluconeogenesis.' },
  { label: 'Metabolism', hash: 'metabolism', detail: 'ATP, glycolysis, glycogen breakdown, the pentose phosphate pathway, and oxidative phosphorylation.' },
];

export function mountStudy(root: HTMLElement): () => void {
  const topicId = studyFromHash(location.hash);
  root.append(
    el(
      'p',
      'explain',
      'Study notes for the FSc and BS biotechnology topics this bench did not already cover. Each page has the explanation, a labelled figure, a worked example, a Pakistan example, key points, multiple-choice questions, and short questions with model answers. Scores stay in this browser.',
    ),
  );
  root.append(alreadyPanel());

  const nav = el('div', 'segment');
  nav.setAttribute('role', 'tablist');
  nav.setAttribute('aria-label', 'Study topics');
  const gallery = el('div');
  const body = el('div');
  root.append(nav, gallery, body);

  for (const topic of STUDY_TOPICS) {
    const button = el('button', undefined, topic.short);
    button.type = 'button';
    button.dataset.topic = topic.id;
    button.setAttribute('role', 'tab');
    button.addEventListener('click', () => {
      if (topic.id === topicId) return;
      location.hash = `study/${topic.id}`;
    });
    nav.append(button);
  }

  const picks = new Map<string, number>();
  paint(topicId);

  function paint(id: string) {
    const topic = STUDY_TOPICS.find((item) => item.id === id) ?? STUDY_TOPICS[0]!;
    for (const button of nav.querySelectorAll('button')) {
      const on = button.dataset.topic === topic.id;
      button.classList.toggle('on', on);
      button.setAttribute('aria-selected', String(on));
    }
    gallery.replaceChildren(intro(topic));
    body.replaceChildren(article(topic), quizPanel(topic), shorts(topic), sources());
  }

  function intro(topic: StudyTopic): HTMLElement {
    const wrap = el('div');
    wrap.append(
      el('p', 'eyebrow', topic.kicker),
      el('h3', undefined, topic.title),
      el('p', 'caption', topic.level),
      el('p', undefined, topic.summary),
      mountFigures([studyDiagram(topic.id)]),
    );
    return wrap;
  }

  function article(topic: StudyTopic): HTMLElement {
    const wrap = el('div');
    for (const section of topic.sections) {
      const panel = el('section', 'panel');
      panel.append(el('h3', undefined, section.heading));
      for (const paragraph of section.paragraphs) panel.append(el('p', undefined, paragraph));
      wrap.append(panel);
    }

    const defs = el('section', 'panel');
    defs.append(el('h3', undefined, 'Key definitions'));
    const list = el('dl', 'def-list');
    for (const item of topic.definitions) {
      const row = el('div');
      row.append(el('dt', undefined, item.term), el('dd', undefined, item.meaning));
      list.append(row);
    }
    defs.append(list);
    wrap.append(defs);

    const worked = el('section', 'panel');
    worked.append(el('h3', undefined, topic.worked.title), el('p', undefined, topic.worked.prompt));
    const steps = el('ol', 'key-points');
    for (const step of topic.worked.steps) steps.append(el('li', undefined, step));
    worked.append(steps, el('p', 'note good', topic.worked.result));
    wrap.append(worked);

    const local = el('section', 'panel');
    local.append(el('p', 'eyebrow', 'Pakistan'), el('h3', undefined, topic.pakistan.title), el('p', undefined, topic.pakistan.body));
    wrap.append(local);

    const keys = el('section', 'panel');
    keys.append(el('h3', undefined, 'Key points'));
    const bullets = el('ul', 'key-points');
    for (const point of topic.keyPoints) bullets.append(el('li', undefined, point));
    keys.append(bullets);
    wrap.append(keys);

    if (topic.related.length > 0) {
      const related = el('div', 'row');
      related.append(el('span', 'chip-label', 'Related'));
      for (const link of topic.related) {
        const button = el('button', 'ghost tiny', link.label);
        button.type = 'button';
        button.addEventListener('click', () => {
          location.hash = link.hash;
        });
        related.append(button);
      }
      wrap.append(related);
    }
    return wrap;
  }

  function quizPanel(topic: StudyTopic): HTMLElement {
    const panel = el('section', 'panel');
    panel.append(el('h3', undefined, 'Multiple choice'));
    const saved = readBest(topic.id);
    if (saved) panel.append(el('p', 'caption', `Best on this device: ${saved.score} / ${saved.total}`));
    const form = el('div');
    topic.quiz.forEach((question, questionIndex) => {
      const block = el('fieldset', 'quiz-block');
      block.append(el('legend', undefined, `${questionIndex + 1}. ${question.prompt}`));
      const choices = el('div', 'choices');
      question.choices.forEach((choice, choiceIndex) => {
        const button = el('button', 'choice', choice);
        button.type = 'button';
        if (picks.get(`${topic.id}:${questionIndex}`) === choiceIndex) button.classList.add('on');
        button.addEventListener('click', () => {
          picks.set(`${topic.id}:${questionIndex}`, choiceIndex);
          paint(topic.id);
        });
        choices.append(button);
      });
      block.append(choices);
      form.append(block);
    });
    const check = el('button', 'primary', 'Check answers');
    check.type = 'button';
    const result = el('div');
    check.addEventListener('click', () => {
      const answers = topic.quiz.map((_, index) => picks.get(`${topic.id}:${index}`) ?? -1);
      const graded = gradeStudy(topic.id, answers);
      result.replaceChildren();
      if (!graded) {
        result.append(el('p', 'banner caution', 'Choose an answer for every question.'));
        return;
      }
      try {
        saveLessonCheck(localStorage, topic.id, graded.score, graded.total);
      } catch {
        // The score still shows if storage is blocked.
      }
      result.append(el('p', 'banner good', `${graded.score} / ${graded.total}`));
      topic.quiz.forEach((question, index) => {
        const right = answers[index] === question.answer;
        result.append(el('p', right ? 'note good' : 'note poor', `${right ? 'Right' : 'Not quite'}. ${question.explanation}`));
      });
    });
    panel.append(form, check, result);
    return panel;
  }

  function shorts(topic: StudyTopic): HTMLElement {
    const panel = el('section', 'panel');
    panel.append(
      el('h3', undefined, 'Short questions'),
      el('p', 'caption', 'Board style. Write your own answer, then open the model.'),
    );
    topic.shorts.forEach((item, index) => {
      const block = el('div', 'short-q');
      block.append(el('p', undefined, `${index + 1}. ${item.prompt}`));
      const answer = el('p', 'note good short-answer', item.answer);
      answer.hidden = true;
      const toggle = el('button', 'ghost tiny', 'Show model answer');
      toggle.type = 'button';
      toggle.addEventListener('click', () => {
        answer.hidden = !answer.hidden;
        toggle.textContent = answer.hidden ? 'Show model answer' : 'Hide model answer';
      });
      block.append(toggle, answer);
      panel.append(block);
    });
    return panel;
  }

  return () => {};
}

function readBest(id: StudyTopic['id']) {
  try {
    return bestLessonCheck(loadProgress(localStorage), id);
  } catch {
    return null;
  }
}

function alreadyPanel(): HTMLElement {
  const details = el('details', 'panel already-panel');
  const summary = el('summary', undefined, 'Already on this bench');
  details.append(summary, el('p', undefined, 'These tools stay as they are. The study topics above them do not repeat those lessons.'));
  const list = el('div', 'lesson-list');
  for (const item of ALREADY) {
    const card = el('article', 'lesson');
    card.append(el('h3', undefined, item.label), el('p', undefined, item.detail));
    const open = el('button', 'ghost tiny', 'Open');
    open.type = 'button';
    open.addEventListener('click', () => {
      location.hash = item.hash;
    });
    card.append(open);
    list.append(card);
  }
  details.append(list);
  return details;
}

function sources(): HTMLElement {
  const panel = el('section', 'panel');
  panel.append(el('h3', undefined, 'Sources'), el('p', undefined, 'The notes follow these curricula and the standard textbook mechanisms they point to. They are not a lab protocol.'));
  const list = el('ul', 'key-points');
  for (const source of STUDY_SOURCES) {
    const item = el('li');
    const anchor = el('a', undefined, source.label);
    anchor.href = source.href;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    item.append(anchor);
    list.append(item);
  }
  panel.append(list);
  return panel;
}
