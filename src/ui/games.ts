import {
  BASE_PAIR_DECK,
  EFFECT_LABELS,
  ENZYME_PAIRS,
  cardsMatch,
  codonRound,
  detectiveCases,
  krebsOrder,
  moveItem,
  scoreBasePairs,
  scoreCodonRush,
  scoreDetective,
  scoreEnzymeMatch,
  scorePlacement,
  shuffledKrebs,
  shuffledPairs,
  type CodonRound,
  type DetectiveCase,
  type EnzymePair,
  type OrderItem,
  type PairCard,
} from '../lib/games';
import { bestGame, loadProgress, saveGameScore, type GameId } from '../lib/progress';
import { mulberry32 } from '../lib/random';
import { bases, el } from './dom';

type GameKey = 'rush' | 'pairs' | 'krebs' | 'enzyme' | 'detective';

const GAME_ID: Record<GameKey, GameId> = {
  rush: 'codon-rush',
  pairs: 'base-pair',
  krebs: 'krebs',
  enzyme: 'enzyme',
  detective: 'mutation',
};

export function mountGames(root: HTMLElement): () => void {
  root.append(
    el(
      'p',
      'explain',
      'Five short games on the same science as the bench. High scores stay in this browser with your other progress. A new best gets a small burst. Reduced motion keeps the games and skips the flourish.',
    ),
  );
  const highs = el('div', 'stats');
  const nav = el('div', 'segment');
  const stage = el('div');
  root.append(highs, nav, stage);

  let game: GameKey = 'rush';
  let stop = () => {};
  const buttons = new Map<GameKey, HTMLButtonElement>();

  const tabs: { id: GameKey; label: string }[] = [
    { id: 'rush', label: 'Codon rush' },
    { id: 'pairs', label: 'Base pairs' },
    { id: 'krebs', label: 'Krebs order' },
    { id: 'enzyme', label: 'Enzymes' },
    { id: 'detective', label: 'Mutations' },
  ];
  for (const tab of tabs) {
    const button = el('button', undefined, tab.label);
    button.type = 'button';
    button.addEventListener('click', () => {
      game = tab.id;
      show();
    });
    buttons.set(tab.id, button);
    nav.append(button);
  }

  function show() {
    stop();
    paintHighs();
    for (const [id, button] of buttons) button.classList.toggle('on', id === game);
    stage.replaceChildren();
    if (game === 'rush') stop = mountRush(stage, paintHighs);
    else if (game === 'pairs') stop = mountPairs(stage, paintHighs);
    else if (game === 'krebs') stop = mountKrebs(stage, paintHighs);
    else if (game === 'enzyme') stop = mountEnzyme(stage, paintHighs);
    else stop = mountDetective(stage, paintHighs);
  }

  function paintHighs() {
    let state: ReturnType<typeof loadProgress> | null = null;
    try {
      state = loadProgress(localStorage);
    } catch {
      state = null;
    }
    highs.replaceChildren();
    for (const tab of tabs) {
      const best = state ? bestGame(state, GAME_ID[tab.id]) : null;
      highs.append(chip(tab.label, best === null ? '—' : String(best)));
    }
  }

  show();
  return () => stop();
}

function mountRush(stage: HTMLElement, refresh: () => void): () => void {
  const panel = el('div', 'panel');
  stage.append(panel);
  let round: CodonRound | null = null;
  let correct = 0;
  let wrong = 0;
  let streak = 0;
  let bestStreak = 0;
  let running = false;
  let saved = false;
  let timer = 0;
  let flipTimer = 0;
  const endsAt = { value: 0 };
  const rng = mulberry32((Date.now() ^ (Math.floor(Math.random() * 1_000_000))) >>> 0);

  function finish() {
    running = false;
    window.clearInterval(timer);
    const score = scoreCodonRush(correct, wrong, bestStreak);
    if (!saved) {
      saved = true;
      remember('codon-rush', score, refresh);
    }
    panel.replaceChildren();
    panel.append(resultCard('Codon rush', score, `${correct} correct, ${wrong} missed. Best streak ${bestStreak}.`, () => {
      correct = 0;
      wrong = 0;
      streak = 0;
      bestStreak = 0;
      saved = false;
      running = false;
      renderIdle();
    }));
  }

  function renderIdle() {
    panel.replaceChildren(
      el('h3', undefined, 'Codon rush'),
      el('p', undefined, 'You have 45 seconds. Each mRNA codon uses the standard genetic code. Stops are stops. A streak adds a small bonus, and a miss costs two points.'),
      startButton(() => {
        running = true;
        endsAt.value = Date.now() + 45_000;
        nextRound();
        timer = window.setInterval(tick, 200);
      }),
    );
  }

  function tick() {
    if (Date.now() >= endsAt.value) finish();
    else {
      const clock = panel.querySelector('[data-clock]');
      if (clock) clock.textContent = `${Math.max(0, Math.ceil((endsAt.value - Date.now()) / 1000))}s`;
    }
  }

  function nextRound() {
    round = codonRound(rng);
    const score = scoreCodonRush(correct, wrong, bestStreak);
    panel.replaceChildren();
    const head = el('div', 'stats');
    head.append(chip('Score', String(score)), chip('Streak', String(streak)));
    const clock = el('span', 'stat');
    clock.dataset.clock = '1';
    clock.append(el('span', 'stat-label', 'Time'), el('b', undefined, `${Math.max(0, Math.ceil((endsAt.value - Date.now()) / 1000))}s`));
    head.append(clock);
    const prompt = el('p', 'game-prompt');
    prompt.append(bases(round.codon, 'bases mrna'));
    const choices = el('div', 'choices');
    for (const choice of round.choices) {
      const button = el('button', 'choice', choice);
      button.type = 'button';
      button.addEventListener('click', () => answer(choice, button));
      choices.append(button);
    }
    panel.append(head, prompt, choices);
  }

  function answer(choice: string, button: HTMLButtonElement) {
    if (!running || !round || button.disabled) return;
    const hit = choice === round.answer;
    for (const choiceButton of panel.querySelectorAll<HTMLButtonElement>('.choice')) choiceButton.disabled = true;
    button.classList.add(hit ? 'is-correct' : 'is-wrong', hit ? 'pop' : 'shake');
    if (hit) {
      correct += 1;
      streak += 1;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      wrong += 1;
      streak = 0;
    }
    window.clearTimeout(flipTimer);
    flipTimer = window.setTimeout(() => {
      if (running) nextRound();
    }, 280);
  }

  renderIdle();
  return () => {
    window.clearInterval(timer);
    window.clearTimeout(flipTimer);
  };
}

function mountPairs(stage: HTMLElement, refresh: () => void): () => void {
  const panel = el('div', 'panel');
  stage.append(panel);
  let deck: PairCard[] = [];
  let open: number[] = [];
  let matched = new Set<string>();
  let mismatches = 0;
  let lock = false;
  let saved = false;
  let timer = 0;

  function render() {
    panel.replaceChildren(
      el('h3', undefined, 'Base-pair match'),
      el('p', undefined, 'DNA pairs A with T and G with C. RNA pairs A with U and G with C. A DNA adenine does not match a uracil in this deck.'),
      el('div', 'stats'),
    );
    const stats = panel.querySelector('.stats');
    stats?.append(chip('Pairs', `${matched.size} / 4`), chip('Misses', String(mismatches)));
    const grid = el('div', 'pair-board');
    deck.forEach((card, index) => {
      const shown = matched.has(card.pairId) || open.includes(index);
      const button = el('button', `memory-card${shown ? ' is-flipped' : ''}${matched.has(card.pairId) ? ' is-matched' : ''}`);
      button.type = 'button';
      button.append(el('span', 'memory-face', shown ? card.base : '?'));
      button.append(el('span', 'memory-context', shown ? card.context : 'Hidden'));
      button.disabled = matched.has(card.pairId);
      button.addEventListener('click', () => flip(index));
      grid.append(button);
    });
    panel.append(grid, ghost('Shuffle again', deal));
  }

  function flip(index: number) {
    if (lock || open.includes(index) || matched.has(deck[index]?.pairId ?? '')) return;
    open = [...open, index];
    if (open.length < 2) {
      render();
      return;
    }
    const [first, second] = open;
    const a = deck[first ?? -1];
    const b = deck[second ?? -1];
    if (a && b && cardsMatch(a, b)) {
      matched = new Set(matched).add(a.pairId);
      open = [];
      render();
      if (matched.size === 4 && !saved) {
        saved = true;
        const score = scoreBasePairs(4, mismatches);
        remember('base-pair', score, refresh);
        panel.append(el('p', 'banner good', `All four pairs. Score ${score}.`));
      }
      return;
    }
    mismatches += 1;
    lock = true;
    render();
    timer = window.setTimeout(() => {
      open = [];
      lock = false;
      render();
    }, 700);
  }

  function deal() {
    window.clearTimeout(timer);
    deck = shuffledPairs((Date.now() ^ BASE_PAIR_DECK.length) >>> 0);
    open = [];
    matched = new Set();
    mismatches = 0;
    lock = false;
    saved = false;
    render();
  }

  deal();
  return () => window.clearTimeout(timer);
}

function mountKrebs(stage: HTMLElement, refresh: () => void): () => void {
  const panel = el('div', 'panel');
  stage.append(panel);
  let items: OrderItem[] = [];
  let dragFrom = -1;
  let savedScore = -1;

  function render(note = '') {
    panel.replaceChildren(
      el('h3', undefined, 'Krebs cycle puzzle'),
      el('p', undefined, 'Put the eight enzymes in cycle order, starting at citrate synthase. Drag a row, or use the arrows. This is the order of the reactions, not a picture of the enzymes.'),
    );
    const list = el('ol', 'order-list');
    items.forEach((item, index) => {
      const row = el('li', 'order-row');
      row.draggable = true;
      row.addEventListener('dragstart', () => {
        dragFrom = index;
      });
      row.addEventListener('dragover', (event) => event.preventDefault());
      row.addEventListener('drop', () => {
        items = moveItem(items, dragFrom, index);
        render();
      });
      const label = el('span', 'order-label', `${index + 1}. ${item.label}`);
      const up = el('button', 'ghost tiny', 'Up');
      const down = el('button', 'ghost tiny', 'Down');
      up.type = 'button';
      down.type = 'button';
      up.disabled = index === 0;
      down.disabled = index === items.length - 1;
      up.addEventListener('click', () => {
        items = moveItem(items, index, index - 1);
        render();
      });
      down.addEventListener('click', () => {
        items = moveItem(items, index, index + 1);
        render();
      });
      row.append(label, up, down);
      list.append(row);
    });
    const check = el('button', 'primary', 'Check order');
    check.type = 'button';
    check.addEventListener('click', () => {
      const answer = krebsOrder().map((item) => item.id);
      const result = scorePlacement(items.map((item) => item.id), answer);
      if (result.score > savedScore) {
        savedScore = result.score;
        remember('krebs', result.score, refresh);
      }
      const perfect = result.correct === answer.length;
      render(perfect ? `Perfect cycle. Score ${result.score}.` : `${result.correct} of 8 are in the right place. Score ${result.score}. Keep moving them and check again.`);
    });
    const again = ghost('Shuffle', () => {
      items = shuffledKrebs((Date.now() ^ 8) >>> 0);
      render();
    });
    panel.append(list, el('div', 'row'));
    panel.querySelector('.row')?.append(check, again);
    if (note) panel.append(el('p', note.startsWith('Perfect') ? 'banner good' : 'banner caution', note));
  }

  items = shuffledKrebs((Date.now() ^ 17) >>> 0);
  render();
  return () => {};
}

function mountEnzyme(stage: HTMLElement, refresh: () => void): () => void {
  const panel = el('div', 'panel');
  stage.append(panel);
  const rng = mulberry32((Date.now() ^ 99) >>> 0);
  let enzymes = shuffleCopy(ENZYME_PAIRS, rng);
  let reactions = shuffleCopy(ENZYME_PAIRS, rng);
  let pickedEnzyme = '';
  let found = new Set<string>();
  let mistakes = 0;
  let saved = false;

  function render() {
    const score = scoreEnzymeMatch(found.size, mistakes);
    panel.replaceChildren(
      el('h3', undefined, 'Enzyme match'),
      el('p', undefined, 'Choose an enzyme, then the reaction it catalyzes. The set mixes the citric acid cycle with two gluconeogenesis bypasses.'),
      el('div', 'stats'),
    );
    panel.querySelector('.stats')?.append(chip('Matched', `${found.size} / ${ENZYME_PAIRS.length}`), chip('Score', String(score)));
    const columns = el('div', 'match-columns');
    columns.append(column('Enzymes', enzymes, 'enzyme', pickedEnzyme, found, (id) => {
      pickedEnzyme = pickedEnzyme === id ? '' : id;
      render();
    }));
    columns.append(column('Reactions', reactions, 'reaction', '', found, (id) => {
      if (!pickedEnzyme) return;
      if (pickedEnzyme === id) {
        found = new Set(found).add(id);
        pickedEnzyme = '';
        if (found.size === ENZYME_PAIRS.length && !saved) {
          saved = true;
          remember('enzyme', scoreEnzymeMatch(found.size, mistakes), refresh);
        }
      } else {
        mistakes += 1;
        pickedEnzyme = '';
      }
      render();
    }));
    panel.append(columns);
    if (found.size === ENZYME_PAIRS.length) {
      panel.append(el('p', 'banner good pop', `All matched. Score ${scoreEnzymeMatch(found.size, mistakes)}.`));
    }
  }

  render();
  return () => {};
}

function mountDetective(stage: HTMLElement, refresh: () => void): () => void {
  const panel = el('div', 'panel');
  stage.append(panel);
  const cases = detectiveCases();
  let index = 0;
  let correct = 0;
  let picked: number | null = null;
  let saved = false;

  function render() {
    const item = cases[index];
    panel.replaceChildren(el('h3', undefined, 'Mutation detective'));
    if (!item) {
      const score = scoreDetective(correct, cases.length);
      if (!saved) {
        saved = true;
        remember('mutation', score, refresh);
      }
      panel.append(resultCard('Case closed', score, `${correct} of ${cases.length} mutations named correctly.`, () => {
        index = 0;
        correct = 0;
        picked = null;
        saved = false;
        render();
      }));
      return;
    }
    panel.append(el('p', 'caption', `Case ${index + 1} of ${cases.length}`), el('p', undefined, item.prompt), proteins(item));
    const choices = el('div', 'choices');
    item.choices.forEach((effect, choiceIndex) => {
      const button = el('button', 'choice', EFFECT_LABELS[effect]);
      button.type = 'button';
      if (picked !== null) {
        button.disabled = true;
        if (effect === item.effect) button.classList.add('is-correct');
        if (choiceIndex === picked && effect !== item.effect) button.classList.add('is-wrong');
      }
      button.addEventListener('click', () => {
        if (picked !== null) return;
        picked = choiceIndex;
        if (effect === item.effect) correct += 1;
        render();
      });
      choices.append(button);
    });
    panel.append(choices);
    if (picked !== null) {
      const next = el('button', 'primary', index === cases.length - 1 ? 'See score' : 'Next case');
      next.type = 'button';
      next.addEventListener('click', () => {
        index += 1;
        picked = null;
        render();
      });
      panel.append(next);
    }
  }

  render();
  return () => {};
}

function proteins(item: DetectiveCase): HTMLElement {
  const wrap = el('div', 'stats');
  wrap.append(chip('Before', item.proteinBefore), chip('After', item.proteinAfter));
  return wrap;
}

function column(
  title: string,
  pairs: EnzymePair[],
  field: 'enzyme' | 'reaction',
  picked: string,
  found: Set<string>,
  onPick: (id: string) => void,
): HTMLElement {
  const wrap = el('div', 'choices');
  wrap.append(el('h3', undefined, title));
  for (const pair of pairs) {
    const button = el('button', `choice${pair.id === picked ? ' on' : ''}${found.has(pair.id) ? ' is-correct' : ''}`, pair[field]);
    button.type = 'button';
    button.disabled = found.has(pair.id);
    button.addEventListener('click', () => onPick(pair.id));
    wrap.append(button);
  }
  return wrap;
}

function shuffleCopy<T>(items: readonly T[], rng: () => number): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const swap = next[i];
    next[i] = next[j] as T;
    next[j] = swap as T;
  }
  return next;
}

function remember(game: GameId, score: number, refresh: () => void) {
  try {
    const previous = bestGame(loadProgress(localStorage), game);
    saveGameScore(localStorage, game, score);
    if (previous === null || score > previous) refresh();
  } catch {
    // Progress is optional if storage is blocked.
  }
}

function resultCard(title: string, score: number, detail: string, again: () => void): HTMLElement {
  const wrap = el('div', 'score-wrap pop');
  wrap.append(el('p', 'eyebrow', title), el('p', 'score', String(score)), el('p', 'caption', detail));
  const button = el('button', 'primary', 'Play again');
  button.type = 'button';
  button.addEventListener('click', again);
  wrap.append(button);
  return wrap;
}

function startButton(onClick: () => void): HTMLButtonElement {
  const button = el('button', 'primary', 'Start');
  button.type = 'button';
  button.addEventListener('click', onClick);
  return button;
}

function ghost(label: string, onClick: () => void): HTMLButtonElement {
  const button = el('button', 'ghost', label);
  button.type = 'button';
  button.addEventListener('click', onClick);
  return button;
}

function chip(label: string, value: string): HTMLElement {
  const node = el('span', 'stat');
  node.append(el('span', 'stat-label', label), el('b', undefined, value));
  return node;
}
