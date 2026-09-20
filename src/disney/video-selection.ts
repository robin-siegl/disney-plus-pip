export interface VideoCandidateMetrics {
  isPictureInPicture: boolean;
  isVisible: boolean;
  hasMetadata: boolean;
  width: number;
  height: number;
}

export function scoreVideoCandidate(candidate: VideoCandidateMetrics): number {
  if (candidate.isPictureInPicture) return Number.MAX_SAFE_INTEGER;

  const visibleScore = candidate.isVisible ? 10_000 : 0;
  const metadataScore = candidate.hasMetadata ? 1_000 : 0;
  const areaScore = Math.min(candidate.width * candidate.height, 1_000_000) / 1_000;

  return visibleScore + metadataScore + areaScore;
}

export function selectBestCandidateIndex(candidates: VideoCandidateMetrics[]): number {
  let bestIndex = -1;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const [index, candidate] of candidates.entries()) {
    const score = scoreVideoCandidate(candidate);
    if (score >= bestScore) {
      bestIndex = index;
      bestScore = score;
    }
  }

  return bestIndex;
}
