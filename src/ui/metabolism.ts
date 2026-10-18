import {
  GLYCOGEN_GLYCOLYSIS_ATP,
  GLYCOGEN_TISSUES,
  GLYCOLYSIS_NET,
  MAP_LINKS,
  METABOLISM_LESSONS,
  OXPHOS_AGENTS,
  PENTOSE_RECYCLE,
  PHOSPHATE_COMPOUNDS,
  PO_RATIO,
  PYRUVATE_FATES,
  ATP_TO_ADP_KJ,
  canPhosphorylateAdp,
  coupledFreeEnergy,
  gradeLesson,
  glycolysisYield,
  lessonFromHash,
  metabolismLesson,
  pentoseOxidativeYield,
  protonsPumped,
  type MetabolismLesson,
  type MetabolismLessonId,
  type PathStep,
} from '../lib/metabolism';
import { DIAGRAMS } from '../lib/diagrams';
import type { MotionId } from '../lib/motion';
import { bestLessonCheck, loadProgress, saveLessonCheck } from '../lib/progress';
import { mountCinema } from './cinema';
import { el } from './dom';
import { mountFigures } from './figure';

export function mountMetabolism(root: HTMLElement): () => void {
  const lessonId = lessonFromHash(location.hash);
  root.append(
    el(
      'p',
      'explain',
      'Six metabolism lessons: a pathway map, ATP and phosphoryl transfer, glycolysis, glycogen breakdown, the pentose phosphate pathway, and oxidative phosphorylation. The citric acid cycle and gluconeogenesis stay on the Biochemistry tab and are linked from the map.',
    ),
  );
  const nav = el('div', 'segment');
  nav.setAttribute('role', 'tablist');
  nav.setAttribute('aria-label', 'Metabolism lessons');
  const gallery = el('div');
  const body = el('div');
  root.append(nav, gallery, body);
  let galleryLesson: MetabolismLessonId | '' = '';

  let playing = false;
  let timer = 0;
  let stepIndex = 0;
  const picks = new Map<string, number>();

  for (const lesson of METABOLISM_LESSONS) {
    const button = el('button', undefined, shortLabel(lesson.id));
    button.type = 'button';
    button.dataset.lesson = lesson.id;
    button.setAttribute('role', 'tab');
    button.addEventListener('click', () => {
      if (lesson.id === lessonId) return;
      location.hash = `metabolism/${lesson.id}`;
    });
    nav.append(button);
  }

  function stop() {
    playing = false;
    window.clearInterval(timer);
  }

  function render() {
    for (const button of nav.querySelectorAll('button')) {
      const on = button.dataset.lesson === lessonId;
      button.classList.toggle('on', on);
      button.setAttribute('aria-selected', String(on));
    }
    const lesson = metabolismLesson(lessonId) ?? METABOLISM_LESSONS[0]!;
    if (galleryLesson !== lesson.id) {
      galleryLesson = lesson.id;
      gallery.replaceChildren(lessonGallery(lesson));
    }
    body.replaceChildren(lessonBody(lesson));
  }

  function lessonGallery(lesson: MetabolismLesson): HTMLElement {
    const wrap = el('div');
    wrap.append(el('p', 'eyebrow', lesson.kicker), el('h3', undefined, lesson.title), el('p', undefined, lesson.summary));
    wrap.append(mountFigures(DIAGRAMS[lesson.id]));
    for (const id of lessonMotion(lesson.id)) wrap.append(mountCinema(id));
    if (lesson.id === 'intro') wrap.append(pathwayMap());
    if (lesson.id === 'glycolysis') wrap.append(glycolysisSummary());
    if (lesson.id === 'pentose') wrap.append(pentoseSummary());
    if (lesson.id === 'oxphos') wrap.append(oxphosSummary());
    if (lesson.id === 'atp') wrap.append(donorBench(), couplingNote());
    if (lesson.id === 'glycolysis') wrap.append(fatePanel());
    if (lesson.id === 'glycogenolysis') wrap.append(tissuePanel());
    return wrap;
  }

  function lessonBody(lesson: MetabolismLesson): HTMLElement {
    const wrap = el('div');
    wrap.append(stepPlayer(lesson), quizPanel(lesson));
    return wrap;
  }

  function stepPlayer(lesson: MetabolismLesson): HTMLElement {
    const steps = lesson.steps;
    const index = Math.min(stepIndex, steps.length - 1);
    const step = steps[index] ?? steps[0]!;
    const wrap = el('div');
    wrap.append(el('p', 'motion-note', 'Animation is off because reduced motion is requested. Step still moves one stage at a time.'));
    if (lesson.id === 'oxphos') wrap.append(membraneSvg(step.id));
    else if (lesson.id === 'glycolysis') wrap.append(phaseTrack(steps, index));

    const controls = el('div', 'row');
    const prev = el('button', 'ghost', 'Previous');
    const next = el('button', 'ghost', 'Next');
    const play = el('button', 'primary', playing ? 'Pause' : 'Play');
    prev.type = 'button';
    next.type = 'button';
    play.type = 'button';
    play.setAttribute('aria-pressed', String(playing));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) play.disabled = true;
    prev.disabled = index <= 0;
    next.disabled = index >= steps.length - 1;
    prev.addEventListener('click', () => {
      stop();
      stepIndex = Math.max(0, index - 1);
      render();
    });
    next.addEventListener('click', () => {
      stop();
      stepIndex = Math.min(steps.length - 1, index + 1);
      render();
    });
    play.addEventListener('click', () => {
      if (reduced) return;
      if (playing) {
        stop();
        render();
        return;
      }
      playing = true;
      render();
      timer = window.setInterval(() => {
        stepIndex += 1;
        if (stepIndex >= steps.length) {
          stepIndex = steps.length - 1;
          stop();
        }
        render();
      }, 1400);
    });
    controls.append(prev, play, next);

    const list = el('div', 'path-list');
    steps.forEach((item, itemIndex) => {
      const button = el('button', `path-step${itemIndex === index ? ' on' : ''}${item.phase === 'Payoff' || item.phase === 'From NADH' ? ' bypass' : ''}`);
      button.type = 'button';
      button.append(el('span', 'path-index', String(item.step)), el('span', 'path-name', item.enzyme));
      button.append(el('span', 'badge', item.phase));
      button.addEventListener('click', () => {
        stop();
        stepIndex = itemIndex;
        render();
      });
      list.append(button);
    });

    const detail = el('article', 'panel step-detail');
    detail.append(
      el('p', 'eyebrow', `Step ${step.step} of ${steps.length} · ${step.phase}`),
      el('h3', undefined, step.title),
      el('p', 'caption', step.enzyme),
      fact('Conversion', step.conversion),
      fact('Energy', step.energy),
      fact('Regulation', step.regulation),
      el('p', undefined, step.detail),
    );
    const layout = el('div', 'path-layout');
    layout.append(list, detail);
    wrap.append(controls, layout);
    return wrap;
  }

  function quizPanel(lesson: MetabolismLesson): HTMLElement {
    const panel = el('section', 'panel');
    panel.append(el('h3', undefined, 'Quick quiz'));
    const saved = readBest(lesson.id);
    if (saved) panel.append(el('p', 'caption', `Best on this device: ${saved.score} / ${saved.total}`));
    const form = el('div');
    lesson.quiz.forEach((question, questionIndex) => {
      const block = el('fieldset', 'quiz-block');
      const legend = el('legend', undefined, `${questionIndex + 1}. ${question.prompt}`);
      block.append(legend);
      const choices = el('div', 'choices');
      question.choices.forEach((choice, choiceIndex) => {
        const button = el('button', 'choice', choice);
        button.type = 'button';
        const picked = picks.get(`${lesson.id}:${questionIndex}`);
        if (picked === choiceIndex) button.classList.add('on');
        button.addEventListener('click', () => {
          picks.set(`${lesson.id}:${questionIndex}`, choiceIndex);
          render();
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
      const answers = lesson.quiz.map((_, index) => picks.get(`${lesson.id}:${index}`) ?? -1);
      const graded = gradeLesson(lesson.id, answers);
      result.replaceChildren();
      if (!graded) {
        result.append(el('p', 'banner caution', 'Choose an answer for every question.'));
        return;
      }
      try {
        saveLessonCheck(localStorage, lesson.id, graded.score, graded.total);
      } catch {
        // The score still shows if storage is blocked.
      }
      result.append(el('p', 'banner good', `${graded.score} / ${graded.total}`));
      lesson.quiz.forEach((question, index) => {
        const right = answers[index] === question.answer;
        const line = el('p', right ? 'note good' : 'note poor', `${right ? 'Right' : 'Not quite'}. ${question.explanation}`);
        result.append(line);
      });
    });
    panel.append(form, check, result);
    return panel;
  }

  render();
  return () => stop();
}

function pathwayMap(): HTMLElement {
  const panel = el('section', 'panel');
  panel.append(
    el('h3', undefined, 'Pathway map'),
    el('p', undefined, 'Each card opens that lesson. The citric acid cycle and gluconeogenesis open on the Biochemistry tab.'),
  );
  const map = el('div', 'pathway-map');
  for (const link of MAP_LINKS) {
    const button = el('button', `map-node place-${link.place}`);
    button.type = 'button';
    button.append(el('strong', undefined, link.title), el('span', undefined, link.blurb));
    button.addEventListener('click', () => {
      location.hash = link.hash;
    });
    map.append(button);
  }
  panel.append(map);
  return panel;
}

function donorBench(): HTMLElement {
  const panel = el('section', 'panel');
  panel.append(el('h3', undefined, 'Can it phosphorylate ADP?'), el('p', undefined, 'Pick a compound. A more negative ΔG°′ of hydrolysis than −30.5 kJ/mol means the phosphate can move onto ADP.'));
  const row = el('div', 'segment');
  const detail = el('div');
  function paint(id: string) {
    for (const button of row.querySelectorAll('button')) button.classList.toggle('on', button.dataset.donor === id);
    const compound = PHOSPHATE_COMPOUNDS.find((item) => item.id === id) ?? PHOSPHATE_COMPOUNDS[0]!;
    const able = compound.kind !== 'atp' && canPhosphorylateAdp(compound.deltaG);
    detail.replaceChildren(
      el('p', 'eyebrow', `${compound.deltaG} kJ/mol`),
      el('h3', undefined, compound.name),
      el('p', undefined, compound.note),
      el(
        'p',
        able ? 'banner good' : 'banner caution',
        compound.kind === 'atp'
          ? 'This is the ATP reference, not a donor to itself.'
          : able
            ? 'Yes. This donor can phosphorylate ADP.'
            : 'No. This ester sits below ATP, so it does not phosphorylate ADP.',
      ),
    );
  }
  for (const compound of PHOSPHATE_COMPOUNDS) {
    const button = el('button', undefined, compound.name);
    button.type = 'button';
    button.dataset.donor = compound.id;
    button.addEventListener('click', () => paint(compound.id));
    row.append(button);
  }
  panel.append(row, detail);
  paint('pep');
  return panel;
}

function couplingNote(): HTMLElement {
  const panel = el('section', 'panel');
  const sum = coupledFreeEnergy(13.8, ATP_TO_ADP_KJ);
  panel.append(
    el('h3', undefined, 'Coupled hexokinase'),
    el('p', undefined, `Glucose + Pi → glucose 6-phosphate is +13.8 kJ/mol. ATP hydrolysis is ${ATP_TO_ADP_KJ} kJ/mol. The sum is ${trim(sum)} kJ/mol, so glucose + ATP → glucose 6-phosphate + ADP is favorable.`),
  );
  return panel;
}

function glycolysisSummary(): HTMLElement {
  const yield_ = glycolysisYield();
  const panel = el('section', 'panel');
  const chips = el('div', 'stats');
  chips.append(statChip('Net ATP', String(yield_.atp)), statChip('NADH', String(yield_.nadh)), statChip('Pyruvate', String(yield_.pyruvate)));
  panel.append(el('h3', undefined, 'Per glucose'), chips, el('p', undefined, GLYCOLYSIS_NET), el('p', undefined, 'Steps 1–5 are the investment. Steps 6–10 are the payoff, and each runs twice because both trioses continue.'));
  return panel;
}

function fatePanel(): HTMLElement {
  const panel = el('section', 'panel');
  panel.append(el('h3', undefined, 'Fates of pyruvate'));
  const grid = el('div', 'macro-grid');
  for (const fate of PYRUVATE_FATES) {
    const card = el('article', 'macro-card');
    card.append(el('h3', undefined, fate.title), el('p', 'caption', fate.when), el('p', undefined, fate.detail));
    grid.append(card);
  }
  panel.append(grid);
  return panel;
}

function tissuePanel(): HTMLElement {
  const panel = el('section', 'panel');
  panel.append(el('h3', undefined, 'Liver and muscle'));
  const grid = el('div', 'cori-grid');
  for (const tissue of GLYCOGEN_TISSUES) {
    const card = el('article', 'macro-card');
    card.append(
      el('h3', undefined, tissue.tissue),
      el('p', undefined, tissue.purpose),
      fact('Hormone', tissue.hormone),
      fact('Product', tissue.product),
    );
    grid.append(card);
  }
  panel.append(grid, el('p', undefined, `From a glycogen glucose unit, anaerobic glycolysis nets ${GLYCOGEN_GLYCOLYSIS_ATP} ATP because the hexokinase ATP was never spent. Free glucose nets 2 ATP.`));
  return panel;
}

function pentoseSummary(): HTMLElement {
  const oxidative = pentoseOxidativeYield();
  const panel = el('section', 'panel');
  const chips = el('div', 'stats');
  chips.append(statChip('NADPH', String(oxidative.nadph)), statChip('CO₂', String(oxidative.co2)), statChip('Recycled NADPH', String(PENTOSE_RECYCLE.nadph)));
  panel.append(
    el('h3', undefined, 'Counts'),
    chips,
    el('p', undefined, 'One oxidative pass: glucose 6-phosphate + 2 NADP⁺ + H₂O → ribulose 5-phosphate + 2 NADPH + CO₂.'),
    el(
      'p',
      undefined,
      `If the pentoses return to glycolysis, ${PENTOSE_RECYCLE.glucose6p} glucose 6-phosphate make ${PENTOSE_RECYCLE.nadph} NADPH, ${PENTOSE_RECYCLE.co2} CO₂, ${PENTOSE_RECYCLE.fructose6p} fructose 6-phosphate, and ${PENTOSE_RECYCLE.glyceraldehyde3p} glyceraldehyde 3-phosphate.`,
    ),
    el('p', undefined, 'Modes: both NADPH and ribose, stop after the oxidative phase. Ribose without NADPH, run the non-oxidative enzymes backward from fructose 6-phosphate and glyceraldehyde 3-phosphate. NADPH without ribose, recycle the pentoses.'),
  );
  return panel;
}

function oxphosSummary(): HTMLElement {
  const panel = el('section', 'panel');
  const chips = el('div', 'stats');
  chips.append(
    statChip('H⁺ / NADH', String(protonsPumped('nadh'))),
    statChip('H⁺ / succinate', String(protonsPumped('succinate'))),
    statChip('P/O NADH', String(PO_RATIO.nadh)),
    statChip('P/O succinate', String(PO_RATIO.succinate)),
  );
  const table = el('table', 'compare');
  const head = el('tr');
  head.append(el('th', undefined, 'Agent'), el('th', undefined, 'Target'), el('th', undefined, 'What it does'));
  table.append(head);
  for (const agent of OXPHOS_AGENTS) {
    const row = el('tr');
    row.append(el('td', undefined, agent.name), el('td', undefined, agent.target), el('td', undefined, agent.effect));
    table.append(row);
  }
  const scroll = el('div', 'table-scroll');
  scroll.append(table);
  panel.append(
    el('h3', undefined, 'Protons, P/O, and blockers'),
    chips,
    el('p', undefined, 'The proton counts are the pumped protons: 4 from Complex I, 4 from Complex III, and 2 from Complex IV per 2 electrons. Succinate skips the 4 from Complex I. These agents are classroom landmarks, not a procedure.'),
    scroll,
  );
  return panel;
}

function phaseTrack(steps: readonly PathStep[], index: number): HTMLElement {
  const track = el('div', 'phase-track');
  steps.forEach((step, stepIndex) => {
    const mark = el('span', `phase-mark${step.phase === 'Payoff' ? ' payoff' : ''}${stepIndex === index ? ' on' : ''}`, String(step.step));
    track.append(mark);
  });
  track.setAttribute('aria-hidden', 'true');
  return track;
}

function membraneSvg(activeId: string): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 640 220');
  svg.setAttribute('class', 'membrane');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Inner mitochondrial membrane with Complexes I to IV and ATP synthase');
  svg.append(rect(24, 78, 592, 64, 'membrane-band'));
  const blocks: { id: string; x: number; label: string }[] = [
    { id: 'complex-i', x: 48, label: 'I' },
    { id: 'complex-ii', x: 148, label: 'II' },
    { id: 'complex-iii', x: 268, label: 'III' },
    { id: 'complex-iv', x: 388, label: 'IV' },
    { id: 'synthase', x: 508, label: 'ATP' },
  ];
  for (const block of blocks) {
    const node = rect(block.x, 86, 72, 48, activeId === block.id ? 'complex on' : 'complex');
    svg.append(node);
    svg.append(text(block.x + 36, 116, block.label, activeId === block.id));
  }
  svg.append(text(70, 40, 'Intermembrane space', false));
  svg.append(text(70, 190, 'Matrix', false));
  const protons = activeId === 'complex-i' || activeId === 'complex-iii' || activeId === 'complex-iv' || activeId === 'gradient' || activeId === 'synthase';
  if (protons) {
    for (const x of [80, 300, 420]) svg.append(circle(x, 58));
  }
  return svg;
}

function rect(x: number, y: number, width: number, height: number, className: string): SVGRectElement {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  node.setAttribute('x', String(x));
  node.setAttribute('y', String(y));
  node.setAttribute('width', String(width));
  node.setAttribute('height', String(height));
  node.setAttribute('rx', '8');
  node.setAttribute('class', className);
  return node;
}

function text(x: number, y: number, value: string, strong: boolean): SVGTextElement {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  node.setAttribute('x', String(x));
  node.setAttribute('y', String(y));
  node.setAttribute('text-anchor', 'middle');
  node.setAttribute('class', strong ? 'membrane-label on' : 'membrane-label');
  node.textContent = value;
  return node;
}

function circle(cx: number, cy: number): SVGCircleElement {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  node.setAttribute('cx', String(cx));
  node.setAttribute('cy', String(cy));
  node.setAttribute('r', '7');
  node.setAttribute('class', 'proton');
  return node;
}

function fact(label: string, value: string): HTMLElement {
  const p = el('p', 'fact');
  p.append(el('span', undefined, label), document.createTextNode(` ${value}`));
  return p;
}

function statChip(label: string, value: string): HTMLElement {
  const node = el('span', 'stat');
  node.append(el('span', 'stat-label', label), el('b', undefined, value));
  return node;
}

function lessonMotion(id: MetabolismLessonId): MotionId[] {
  if (id === 'atp') return ['synthase'];
  if (id === 'glycolysis') return ['glycolysis'];
  if (id === 'glycogenolysis') return ['glycogen'];
  if (id === 'oxphos') return ['etc', 'synthase'];
  return [];
}

function shortLabel(id: MetabolismLessonId): string {
  const labels: Record<MetabolismLessonId, string> = {
    intro: 'Map',
    atp: 'ATP',
    glycolysis: 'Glycolysis',
    glycogenolysis: 'Glycogen',
    pentose: 'Pentose phosphate',
    oxphos: 'Oxphos',
  };
  return labels[id];
}

function readBest(id: MetabolismLessonId) {
  try {
    return bestLessonCheck(loadProgress(localStorage), id);
  } catch {
    return null;
  }
}

function trim(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return String(rounded);
}
