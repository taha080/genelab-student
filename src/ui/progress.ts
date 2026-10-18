import { badges, bestGame, bestQuiz, GAME_IDS, LESSONS, loadProgress, resetProgress, TRACKED_TOOLS, toolsUsed } from '../lib/progress';
import { el } from './dom';

const HASH: Record<(typeof TRACKED_TOOLS)[number], string> = {
  dogma: 'central-dogma',
  crispr: 'crispr',
  primers: 'primers',
  mutations: 'mutations',
  codon: 'codon-table',
  animation: 'animation',
  sequences: 'sequences',
  biochem: 'biochem',
  quiz: 'quiz',
  games: 'games',
  party: 'party',
};

const GAME_LABELS: Record<(typeof GAME_IDS)[number], string> = {
  'codon-rush': 'Codon rush',
  'base-pair': 'Base pairs',
  krebs: 'Krebs order',
  enzyme: 'Enzymes',
  mutation: 'Mutations',
  party: 'Study room',
};

export function mountProgress(root: HTMLElement): () => void {
  root.append(
    el(
      'p',
      'explain',
      'This dashboard stays in this browser. It remembers which tools you have opened, your quiz scores, game high scores, and completion badges. Nothing is sent to a server.',
    ),
  );
  const panel = el('div', 'panel');
  root.append(panel);
  let confirmReset = false;

  function render() {
    const state = loadProgress(localStorage);
    const best = bestQuiz(state);
    const earned = badges(state).filter((badge) => badge.earned).length;
    panel.replaceChildren();

    const stats = el('div', 'stats');
    stats.append(
      pill('Tools opened', `${toolsUsed(state)} / ${TRACKED_TOOLS.length}`),
      pill('Badges', `${earned} / ${badges(state).length}`),
      pill('Quiz tries', String(state.quizzes.length)),
      pill('Best score', best ? `${best.score} / ${best.total}` : '—'),
    );

    const lessons = el('div', 'lesson-list');
    for (const lesson of LESSONS) {
      const done = lesson.tool === 'quiz' ? state.quizzes.length > 0 : Boolean(state.used[lesson.tool]);
      const card = el('article', `lesson ${done ? 'done' : ''}`);
      card.append(el('h3', undefined, lesson.title), el('p', undefined, lesson.detail), el('p', 'caption', done ? 'Opened' : 'Not yet'));
      const open = el('button', 'ghost tiny', 'Open');
      open.type = 'button';
      open.addEventListener('click', () => {
        location.hash = HASH[lesson.tool];
      });
      card.append(open);
      lessons.append(card);
    }

    const badgeRow = el('div', 'badge-row');
    for (const badge of badges(state)) {
      const item = el('div', `badge ${badge.earned ? 'earned' : ''}`);
      item.append(el('strong', undefined, badge.title), el('span', undefined, badge.detail));
      badgeRow.append(item);
    }

    const gameRow = el('div', 'stats');
    for (const game of GAME_IDS) {
      const best = bestGame(state, game);
      gameRow.append(pill(GAME_LABELS[game], best === null ? '—' : String(best)));
    }

    const attempts = el('ol', 'review');
    const recent = state.quizzes.slice(-5).reverse();
    if (recent.length === 0) {
      attempts.append(el('li', undefined, 'No quiz score yet.'));
    } else {
      for (const attempt of recent) {
        const when = new Date(attempt.at);
        const label = Number.isNaN(when.getTime()) ? attempt.at : when.toLocaleString();
        attempts.append(el('li', undefined, `${attempt.score} / ${attempt.total} · ${label}`));
      }
    }

    const reset = el('button', 'ghost', confirmReset ? 'Confirm reset' : 'Reset progress');
    reset.type = 'button';
    reset.addEventListener('click', () => {
      if (!confirmReset) {
        confirmReset = true;
        render();
        return;
      }
      resetProgress(localStorage);
      confirmReset = false;
      render();
    });

    panel.append(
      stats,
      el('h3', undefined, 'Lessons'),
      lessons,
      el('h3', undefined, 'Badges'),
      badgeRow,
      el('h3', undefined, 'Game high scores'),
      gameRow,
      el('h3', undefined, 'Recent quiz scores'),
      attempts,
      reset,
      confirmReset ? el('p', 'caption', 'This clears tools, badges, and scores stored in this browser.') : el('span'),
    );
  }

  render();
  return () => {};
}

function pill(label: string, value: string): HTMLElement {
  const node = el('span', 'stat');
  node.append(el('span', 'stat-label', label), el('b', undefined, value));
  return node;
}
