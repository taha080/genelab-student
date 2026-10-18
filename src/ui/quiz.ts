import { saveQuizScore } from '../lib/progress';
import { QUESTIONS, type QuizQuestion } from '../lib/quiz';
import { el } from './dom';

interface Dealt {
  id: string;
  prompt: string;
  explanation: string;
  choices: { text: string; correct: boolean }[];
}

export function mountQuiz(root: HTMLElement): () => void {
  root.append(
    el(
      'p',
      'explain',
      `${QUESTIONS.length} questions on the same ideas as the tools, including amino acids, the citric acid cycle, and gluconeogenesis. You get a short explanation as soon as you answer.`,
    ),
  );
  const panel = el('div', 'panel quiz-panel');
  root.append(panel);

  let deck: Dealt[] = [];
  let index = 0;
  let picked: number | null = null;
  let correct = 0;
  let saved = false;

  function deal(): void {
    deck = QUESTIONS.map(shuffle);
    index = 0;
    picked = null;
    correct = 0;
    saved = false;
  }

  function render(): void {
    panel.replaceChildren();
    if (index >= deck.length) {
      panel.append(results());
      return;
    }
    const question = deck[index];
    if (!question) return;
    const progress = el('div', 'progress');
    progress.append(el('span'));
    const fill = progress.firstElementChild as HTMLElement;
    const done = index + (picked === null ? 0 : 1);
    fill.style.width = `${(100 * done) / deck.length}%`;
    const meta = el('div', 'quiz-meta');
    meta.append(el('span', undefined, `Question ${index + 1} of ${deck.length}`), el('span', undefined, `Score ${correct}`));
    const prompt = el('h2', 'prompt', question.prompt);
    const choices = el('div', 'choices');
    question.choices.forEach((choice, choiceIndex) => {
      const button = el('button', 'choice', choice.text);
      button.type = 'button';
      if (picked !== null) {
        button.disabled = true;
        if (choice.correct) button.classList.add('is-correct');
        if (choiceIndex === picked && !choice.correct) button.classList.add('is-wrong');
      }
      button.addEventListener('click', () => {
        if (picked !== null) return;
        picked = choiceIndex;
        if (choice.correct) correct += 1;
        render();
      });
      choices.append(button);
    });
    panel.append(progress, meta, prompt, choices);
    if (picked !== null) {
      const feedback = el('div', `banner ${question.choices[picked]?.correct ? 'good' : 'poor'}`);
      feedback.append(
        el('strong', undefined, question.choices[picked]?.correct ? 'Correct' : 'Not quite'),
        el('p', undefined, question.explanation),
      );
      const next = el('button', 'primary', index === deck.length - 1 ? 'See score' : 'Next question');
      next.type = 'button';
      next.addEventListener('click', () => {
        index += 1;
        picked = null;
        render();
      });
      panel.append(feedback, next);
    }
  }

  function results(): HTMLElement {
    if (!saved) {
      saved = true;
      try {
        saveQuizScore(localStorage, correct, deck.length);
      } catch {
        // Progress is optional if the browser blocks storage.
      }
    }
    const wrap = el('div', 'score-wrap');
    const ratio = correct / deck.length;
    const remark =
      ratio >= 0.9
        ? 'You can teach this bench.'
        : ratio >= 0.7
          ? 'Solid. The explanations are there if you want another pass.'
          : ratio >= 0.4
            ? 'A good start. Use the tools, then run the quiz again.'
            : 'Start with the central dogma tab, then come back.';
    wrap.append(el('p', 'eyebrow', 'Score'), el('p', 'score', `${correct} / ${deck.length}`), el('p', 'caption', remark));
    const again = el('button', 'primary', 'Try again');
    again.type = 'button';
    again.addEventListener('click', () => {
      deal();
      render();
    });
    wrap.append(again);
    const review = el('ol', 'review');
    deck.forEach((question, questionIndex) => {
      const item = el('li');
      const answer = question.choices.find((choice) => choice.correct)?.text ?? '';
      item.append(el('p', undefined, question.prompt), el('p', 'caption', `Answer: ${answer}`));
      item.dataset.q = String(questionIndex);
      review.append(item);
    });
    wrap.append(el('h3', undefined, 'Answer key'), review);
    return wrap;
  }

  deal();
  render();
  return () => {};
}

function shuffle(question: QuizQuestion): Dealt {
  const choices = question.choices.map((text, choiceIndex) => ({
    text,
    correct: choiceIndex === question.answer,
  }));
  for (let i = choices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = choices[i];
    const other = choices[j];
    if (swap && other) {
      choices[i] = other;
      choices[j] = swap;
    }
  }
  return { id: question.id, prompt: question.prompt, explanation: question.explanation, choices };
}
