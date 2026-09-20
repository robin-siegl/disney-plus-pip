import { selectBestCandidateIndex, type VideoCandidateMetrics } from './video-selection';

export const PLAYER_SELECTOR = "[data-testid='disney-web-player-wrapper']";

type DeepRoot = Document | ShadowRoot;

function collectOpenRoots(root: DeepRoot = document, roots: DeepRoot[] = []): DeepRoot[] {
  roots.push(root);

  for (const element of root.querySelectorAll('*')) {
    if (element.shadowRoot) collectOpenRoots(element.shadowRoot, roots);
  }

  return roots;
}

export function findVideos(): HTMLVideoElement[] {
  return collectOpenRoots().flatMap((root) => [...root.querySelectorAll('video')]);
}

function getMetrics(video: HTMLVideoElement): VideoCandidateMetrics {
  const rect = video.getBoundingClientRect();
  const style = getComputedStyle(video);

  return {
    isPictureInPicture: video === document.pictureInPictureElement,
    isVisible:
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      rect.width > 160 &&
      rect.height > 90,
    hasMetadata: video.readyState >= HTMLMediaElement.HAVE_METADATA,
    width: rect.width,
    height: rect.height,
  };
}

export function findActiveVideo(): HTMLVideoElement | null {
  const videos = findVideos();
  const index = selectBestCandidateIndex(videos.map(getMetrics));
  return index === -1 ? null : videos[index];
}

export function enablePictureInPicture(video: HTMLVideoElement): void {
  video.removeAttribute('disablepictureinpicture');
  video.disablePictureInPicture = false;
}

export function getPlayerHost(): HTMLElement {
  const fullscreenElement = document.fullscreenElement;
  if (fullscreenElement instanceof HTMLElement) return fullscreenElement;

  const player = document.querySelector<HTMLElement>(PLAYER_SELECTOR);
  return player ?? document.body;
}
