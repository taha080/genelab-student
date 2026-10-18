import { describe, expect, it } from 'vitest';
import {
  VOICE_LIMIT,
  clampVolume,
  micErrorMessage,
  peersToCall,
  rmsSpeaking,
  roomHasVoiceSlot,
  voiceStatus,
} from '../src/lib/voice';

describe('voice mesh rules', () => {
  it('lets the lower peer id place each call once', () => {
    expect(peersToCall('a', ['a', 'c', 'b'], new Set())).toEqual(['b', 'c']);
    expect(peersToCall('m', ['a', 'm', 'z'], new Set())).toEqual(['z']);
    expect(peersToCall('m', ['a', 'm', 'z'], new Set(['z']))).toEqual([]);
  });

  it('keeps the mesh to six people, and lets someone already inside stay', () => {
    expect(roomHasVoiceSlot(VOICE_LIMIT, false)).toBe(false);
    expect(roomHasVoiceSlot(VOICE_LIMIT - 1, false)).toBe(true);
    expect(roomHasVoiceSlot(VOICE_LIMIT, true)).toBe(true);
  });

  it('names voice states without affecting a quiz score', () => {
    expect(voiceStatus({ inVoice: false, muted: false, speaking: false, unreachable: false })).toBe('Voice off');
    expect(voiceStatus({ inVoice: true, muted: true, speaking: true, unreachable: false })).toBe('Muted');
    expect(voiceStatus({ inVoice: true, muted: false, speaking: true, unreachable: false })).toBe('Speaking');
    expect(voiceStatus({ inVoice: true, muted: false, speaking: false, unreachable: true })).toBe("Can't hear");
    expect(voiceStatus({ inVoice: true, muted: false, speaking: false, unreachable: false })).toBe('In voice');
  });

  it('hears a real signal and ignores silence', () => {
    expect(rmsSpeaking(new Uint8Array(32).fill(128))).toBe(false);
    expect(rmsSpeaking(new Uint8Array(32).fill(0))).toBe(true);
  });

  it('clamps a per-person volume and explains a denied microphone', () => {
    expect(clampVolume(2)).toBe(1);
    expect(clampVolume(-1)).toBe(0);
    expect(clampVolume(Number.NaN)).toBe(1);
    expect(micErrorMessage('NotAllowedError')).toMatch(/denied/);
    expect(micErrorMessage('NotAllowedError')).toMatch(/quiz still works/);
    expect(micErrorMessage('NotFoundError')).toMatch(/No microphone/);
  });
});