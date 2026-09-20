import { describe, expect, it } from 'vitest';
import {
  scoreVideoCandidate,
  selectBestCandidateIndex,
  type VideoCandidateMetrics,
} from '../src/disney/video-selection';

const hiddenVideo: VideoCandidateMetrics = {
  isPictureInPicture: false,
  isVisible: false,
  hasMetadata: true,
  width: 0,
  height: 0,
};

const visibleVideo: VideoCandidateMetrics = {
  isPictureInPicture: false,
  isVisible: true,
  hasMetadata: true,
  width: 1_920,
  height: 1_080,
};

describe('video selection', () => {
  it('prefers the active visible player over Disney preload videos', () => {
    expect(selectBestCandidateIndex([hiddenVideo, visibleVideo])).toBe(1);
  });

  it('always keeps the current Picture-in-Picture video selected', () => {
    const currentPip = { ...hiddenVideo, isPictureInPicture: true };
    expect(selectBestCandidateIndex([currentPip, visibleVideo])).toBe(0);
  });

  it('uses the most recent candidate when otherwise tied', () => {
    expect(selectBestCandidateIndex([hiddenVideo, hiddenVideo])).toBe(1);
  });

  it('gives visible videos a higher score', () => {
    expect(scoreVideoCandidate(visibleVideo)).toBeGreaterThan(scoreVideoCandidate(hiddenVideo));
  });

  it('returns -1 when no videos exist', () => {
    expect(selectBestCandidateIndex([])).toBe(-1);
  });
});
