import {
  QUESTION_MS,
  RACE_LENGTH,
  challengeHash,
  decodeChallenge,
  passTurns,
  racePoints,
  rankBoard,
  sanitizeName,
  selectQuestions,
  type ChallengeLink,
} from '../lib/party';
import { saveGameScore } from '../lib/progress';
import type { QuizQuestion } from '../lib/quiz';
import { el } from './dom';

type Mode = 'pass' | 'challenge';

export function mountParty(root: HTMLElement): () => void {
  const route = readRoute();
  root.append(
    el(
      'p',
      'explain',
      'Study together on this page, with no account and no server. Pass one device around, or share a challenge link that carries a quiz seed and a score.',
    ),
  );
  const nav = el('div', 'segment');
  const stage = el('div');
  root.append(nav, stage);

  let mode: Mode = route.mode;
  let stop = () => {};
  const tabs: { id: Mode; label: string }[] = [
    { id: 'pass', label: 'Pass and play' },
    { id: 'challenge', label: 'Challenge link' },
  ];

  function show() {
    stop();
    nav.replaceChildren();
    for (const tab of tabs) {
      const button = el('button', tab.id === mode ? 'on' : undefined, tab.label);
      button.type = 'button';
      button.addEventListener('click', () => {
        mode = tab.id;
        if (mode === 'pass') history.replaceState(null, '', `${location.pathname}${location.search}#party`);
        show();
      });
      nav.append(button);
    }
    stage.replaceChildren();
    if (mode === 'pass') stop = mountPass(stage);
    else stop = mountChallenge(stage, route.challenge);
  }

  show();
  return () => stop();
}

function mountPass(stage: HTMLElement): () => void {
  const panel = el('div', 'panel');
  stage.append(panel);
  let names = ['Ada', 'Lin'];
  let questions: QuizQuestion[] = [];
  let turns: number[] = [];
  let scores: number[] = [];
  let turn = 0;
  let seed = 0;
  let askedAt = 0;
  let stageName: 'setup' | 'cover' | 'ask' | 'tell' | 'board' = 'setup';
  let picked: number | null = null;

  function render() {
    panel.replaceChildren(el('h3', undefined, 'Pass and play'));
    if (stageName === 'setup') {
      panel.append(el('p', undefined, 'Two to six players share this device. Each person gets two questions. Hand it over before the next question so the answer stays hidden.'));
      names.forEach((name, index) => {
        const field = textField(`Player ${index + 1}`, name);
        field.area.addEventListener('input', () => {
          names[index] = field.area.value;
        });
        panel.append(field.label);
      });
      const row = el('div', 'row');
      const add = el('button', 'ghost', 'Add player');
      const remove = el('button', 'ghost', 'Remove');
      const start = el('button', 'primary', 'Start');
      add.type = 'button';
      remove.type = 'button';
      start.type = 'button';
      add.disabled = names.length >= 6;
      remove.disabled = names.length <= 2;
      add.addEventListener('click', () => {
        names = [...names, `Player ${names.length + 1}`];
        render();
      });
      remove.addEventListener('click', () => {
        names = names.slice(0, -1);
        render();
      });
      start.addEventListener('click', () => {
        const clean = names.map((name) => sanitizeName(name));
        seed = Math.floor(Math.random() * 0xffffffff);
        turns = passTurns(clean.length, 2);
        questions = selectQuestions(seed, turns.length);
        scores = clean.map(() => 0);
        names = clean;
        turn = 0;
        picked = null;
        stageName = 'cover';
        render();
      });
      row.append(add, remove, start);
      panel.append(row);
      return;
    }
    const player = names[turns[turn] ?? 0] ?? 'Student';
    if (stageName === 'cover') {
      panel.append(el('p', 'game-prompt', `Pass the device to ${player}.`), el('p', undefined, 'The previous answer is hidden. Start only when they are looking.'));
      const ready = el('button', 'primary', `I'm ${player}`);
      ready.type = 'button';
      ready.addEventListener('click', () => {
        askedAt = Date.now();
        picked = null;
        stageName = 'ask';
        render();
      });
      panel.append(ready);
      return;
    }
    const question = questions[turn];
    if (!question) return;
    if (stageName === 'ask' || stageName === 'tell') {
      panel.append(el('p', 'caption', `${player} · turn ${turn + 1} of ${turns.length}`), el('h3', undefined, question.prompt));
      const choices = el('div', 'choices');
      question.choices.forEach((choice, choiceIndex) => {
        const button = el('button', 'choice', choice);
        button.type = 'button';
        if (stageName === 'tell') {
          button.disabled = true;
          if (choiceIndex === question.answer) button.classList.add('is-correct');
          if (choiceIndex === picked && choiceIndex !== question.answer) button.classList.add('is-wrong');
        }
        button.addEventListener('click', () => {
          if (stageName !== 'ask') return;
          picked = choiceIndex;
          const who = turns[turn] ?? 0;
          scores[who] = (scores[who] ?? 0) + racePoints(choiceIndex === question.answer, Date.now() - askedAt);
          stageName = 'tell';
          render();
        });
        choices.append(button);
      });
      panel.append(choices);
      if (stageName === 'tell') {
        panel.append(el('p', 'banner good', question.explanation));
        const next = el('button', 'primary', turn + 1 >= turns.length ? 'Show scores' : 'Hide and pass');
        next.type = 'button';
        next.addEventListener('click', () => {
          if (turn + 1 >= turns.length) {
            stageName = 'board';
            const winner = Math.max(...scores);
            try {
              saveGameScore(localStorage, 'party', winner);
            } catch {
              // The round still shows its board.
            }
          } else {
            turn += 1;
            stageName = 'cover';
          }
          render();
        });
        panel.append(next);
      }
      return;
    }
    const entries = names.map((name, id) => ({ id: String(id), name, score: scores[id] ?? 0, connected: true }));
    panel.append(el('p', undefined, 'Highest score on this device:'), board(entries));
    panel.append(el('p', 'caption', 'These turns use different questions, so this total is not a shared challenge. Use Challenge link when friends should face the same list.'));
  }

  render();
  return () => {};
}

function mountChallenge(stage: HTMLElement, incoming: ChallengeLink | null): () => void {
  const panel = el('div', 'panel');
  stage.append(panel);
  let link = incoming;
  let questions: QuizQuestion[] = [];
  let index = 0;
  let score = 0;
  let picked: number | null = null;
  let askedAt = 0;
  let phase: 'intro' | 'ask' | 'tell' | 'done' = 'intro';
  let saved = false;
  let timer = 0;

  function render() {
    window.clearTimeout(timer);
    panel.replaceChildren(el('h3', undefined, 'Challenge link'));
    if (phase === 'intro') {
      if (link) {
        panel.append(el('p', undefined, `A friend scored ${link.score} on ${link.total} shared questions. You get the same list. A correct answer is worth 60, plus up to 40 if you are quick.`));
      } else {
        panel.append(el('p', undefined, 'Play eight questions, then copy a link with your seed and score. A friend who opens it gets the same questions and tries to beat that number. Nothing is stored on a server.'));
      }
      const start = el('button', 'primary', link ? 'Try to beat it' : 'Play a challenge');
      start.type = 'button';
      start.addEventListener('click', () => {
        if (!link) link = { seed: Math.floor(Math.random() * 0xffffffff), score: 0, total: RACE_LENGTH };
        questions = selectQuestions(link.seed, link.total);
        index = 0;
        score = 0;
        picked = null;
        askedAt = Date.now();
        phase = 'ask';
        render();
      });
      panel.append(start);
      return;
    }
    const question = questions[index];
    if (!question || phase === 'done') {
      const target = incoming?.score ?? 0;
      const beat = incoming ? score > target : false;
      const tied = incoming ? score === target : false;
      if (!saved) {
        saved = true;
        try {
          saveGameScore(localStorage, 'party', score);
        } catch {
          // The result is still on screen.
        }
      }
      const detail = incoming
        ? beat
          ? `You scored ${score} and beat ${target}.`
          : tied
            ? `You tied at ${score}.`
            : `You scored ${score}. The link to beat was ${target}.`
        : `You scored ${score}. Copy the link and send it to a friend.`;
      panel.append(el('p', 'score', String(score)), el('p', undefined, detail));
      if (link) panel.append(challengeButton(link.seed, score, questions.length || link.total));
      return;
    }
    panel.append(el('p', 'caption', `Question ${index + 1} of ${questions.length} · score ${score}`), el('h3', undefined, question.prompt));
    const choices = el('div', 'choices');
    question.choices.forEach((choice, choiceIndex) => {
      const button = el('button', 'choice', choice);
      button.type = 'button';
      if (phase === 'tell') {
        button.disabled = true;
        if (choiceIndex === question.answer) button.classList.add('is-correct');
        if (choiceIndex === picked && choiceIndex !== question.answer) button.classList.add('is-wrong');
      }
      button.addEventListener('click', () => choose(choiceIndex));
      choices.append(button);
    });
    panel.append(choices);
    if (phase === 'ask') {
      timer = window.setTimeout(() => choose(-1), Math.max(0, QUESTION_MS - (Date.now() - askedAt)));
    } else {
      panel.append(el('p', 'banner good', question.explanation));
      const next = el('button', 'primary', index + 1 >= questions.length ? 'See the result' : 'Next');
      next.type = 'button';
      next.addEventListener('click', () => {
        if (index + 1 >= questions.length) phase = 'done';
        else {
          index += 1;
          picked = null;
          askedAt = Date.now();
          phase = 'ask';
        }
        render();
      });
      panel.append(next);
    }
  }

  function choose(choice: number) {
    if (phase !== 'ask') return;
    const question = questions[index];
    if (!question) return;
    picked = choice;
    score += racePoints(choice === question.answer, Date.now() - askedAt);
    phase = 'tell';
    render();
  }

  render();
  return () => window.clearTimeout(timer);
}


function board(players: { id: string; name: string; score: number }[]): HTMLElement {
  const list = el('ul', 'roster');
  for (const player of rankBoard(players.map((item) => ({ ...item, connected: true })))) {
    const row = el('li');
    row.append(el('strong', undefined, player.name), el('span', undefined, String(player.score)));
    list.append(row);
  }
  return list;
}

function challengeButton(seed: number, score: number, total: number): HTMLElement {
  const hash = challengeHash({ seed, score, total });
  const button = el('button', 'ghost', 'Copy challenge link');
  button.type = 'button';
  if (!hash) {
    button.disabled = true;
    return button;
  }
  button.addEventListener('click', () => {
    const url = new URL(location.href);
    url.hash = hash.slice(1);
    void navigator.clipboard?.writeText(url.toString());
    button.textContent = 'Link copied';
  });
  return button;
}

function textField(labelText: string, value: string): { label: HTMLLabelElement; area: HTMLInputElement } {
  const area = el('input');
  area.type = 'text';
  area.value = value;
  area.maxLength = 16;
  const label = el('label', 'field');
  const caption = el('span', 'field-label', labelText);
  label.append(caption, area);
  return { label, area };
}

function readRoute(): { mode: Mode; challenge: ChallengeLink | null } {
  const hash = location.hash.replace(/^#/, '');
  if (hash.startsWith('challenge/')) {
    return { mode: 'challenge', challenge: decodeChallenge(hash.slice('challenge/'.length)) };
  }
  return { mode: 'pass', challenge: null };
}
