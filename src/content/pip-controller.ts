import { enablePictureInPicture, findActiveVideo, getOverlayParent } from '../disney/player';
import overlayStyles from './styles.css?inline';

const ROOT_ID = 'disney-plus-pip-root';
const BUTTON_ID = 'disney-plus-pip-button';
const TOAST_ID = 'disney-plus-pip-toast';
const SCAN_INTERVAL_MS = 1_000;
const PLAYER_EDGE_OFFSET = 20;
const BUTTON_SIZE = 44;

export class PictureInPictureController {
  private root: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private button: HTMLButtonElement | null = null;
  private currentVideo: HTMLVideoElement | null = null;
  private toastTimer: number | null = null;
  private scanTimer: number | null = null;
  private scanInterval: number | null = null;

  private readonly observer = new MutationObserver(() => this.scheduleScan());
  private readonly updateButtonHandler = (): void => this.updateButton();
  private readonly fullscreenHandler = (): void => this.scheduleScan();
  private readonly resizeHandler = (): void => this.scheduleScan();

  start(): void {
    // Disney+ creates and replaces the player asynchronously. The control must
    // not depend on player discovery or it can remain absent indefinitely.
    this.placeOverlay();
    this.updateButton();

    this.observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disablepictureinpicture', 'src'],
    });

    document.addEventListener('fullscreenchange', this.fullscreenHandler);
    window.addEventListener('resize', this.resizeHandler);
    this.scan();
    this.scanInterval = window.setInterval(() => this.scan(), SCAN_INTERVAL_MS);
  }

  stop(): void {
    this.observer.disconnect();
    document.removeEventListener('fullscreenchange', this.fullscreenHandler);
    window.removeEventListener('resize', this.resizeHandler);
    this.bindVideo(null);
    this.removeOverlay();

    if (this.scanTimer !== null) window.clearTimeout(this.scanTimer);
    if (this.scanInterval !== null) window.clearInterval(this.scanInterval);
    if (this.toastTimer !== null) window.clearTimeout(this.toastTimer);
  }

  async toggle(): Promise<void> {
    if (!document.pictureInPictureEnabled) {
      this.showToast('Picture in Picture is not supported by this browser.');
      return;
    }

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        return;
      }

      const video = findActiveVideo();
      if (!video) {
        this.showToast('Start a Disney+ video first.');
        return;
      }

      enablePictureInPicture(video);
      await video.requestPictureInPicture();
    } catch (error) {
      console.warn('Disney+ PiP:', error);
      this.showToast('PiP could not start. Click the player once, then try again.');
    }
  }

  private scan(): void {
    const video = findActiveVideo();

    this.bindVideo(video);
    if (video) enablePictureInPicture(video);
    this.placeOverlay();
    this.positionButton(video);
    this.updateButton();
  }

  private scheduleScan(): void {
    if (this.scanTimer !== null) window.clearTimeout(this.scanTimer);
    this.scanTimer = window.setTimeout(() => {
      this.scanTimer = null;
      this.scan();
    }, 100);
  }

  private bindVideo(video: HTMLVideoElement | null): void {
    if (video === this.currentVideo) return;

    this.currentVideo?.removeEventListener('enterpictureinpicture', this.updateButtonHandler);
    this.currentVideo?.removeEventListener('leavepictureinpicture', this.updateButtonHandler);
    this.currentVideo = video;
    this.currentVideo?.addEventListener('enterpictureinpicture', this.updateButtonHandler);
    this.currentVideo?.addEventListener('leavepictureinpicture', this.updateButtonHandler);
  }

  private createButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.id = BUTTON_ID;
    button.type = 'button';
    button.appendChild(this.createPipIcon());
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      void this.toggle();
    });
    return button;
  }

  private createPipIcon(): SVGSVGElement {
    const namespace = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(namespace, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');

    const path = document.createElementNS(namespace, 'path');
    path.setAttribute(
      'd',
      'M19 7H5v10h7v2H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v5h-2V7Zm-5 5h8v7h-8v-7Z',
    );
    svg.appendChild(path);
    return svg;
  }

  private positionButton(video: HTMLVideoElement | null): void {
    if (!this.button) return;

    if (!video) {
      this.button.style.setProperty('top', `${PLAYER_EDGE_OFFSET}px`, 'important');
      this.button.style.setProperty('right', `${PLAYER_EDGE_OFFSET}px`, 'important');
      this.button.style.removeProperty('left');
      return;
    }

    const rect = video.getBoundingClientRect();
    const top = Math.max(12, rect.top + PLAYER_EDGE_OFFSET);
    const left = Math.min(
      window.innerWidth - BUTTON_SIZE - 12,
      rect.right - BUTTON_SIZE - PLAYER_EDGE_OFFSET,
    );

    this.button.style.setProperty('top', `${top}px`, 'important');
    this.button.style.setProperty('left', `${Math.max(12, left)}px`, 'important');
    this.button.style.setProperty('right', 'auto', 'important');
  }

  private createOverlay(): void {
    const root = document.createElement('div');
    root.id = ROOT_ID;
    root.setAttribute('data-disney-plus-pip-root', '');
    root.style.cssText = [
      'all: initial !important',
      'position: fixed !important',
      'inset: 0 !important',
      'z-index: 2147483647 !important',
      'display: block !important',
      'visibility: visible !important',
      'pointer-events: none !important',
    ].join(';');

    const shadowRoot = root.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = overlayStyles;

    const button = this.createButton();
    shadowRoot.append(style, button);

    this.root = root;
    this.shadowRoot = shadowRoot;
    this.button = button;
  }

  private placeOverlay(): void {
    if (!this.root) this.createOverlay();

    const root = this.root;
    if (!root) return;

    const parent = getOverlayParent();
    if (root.parentNode !== parent) parent.appendChild(root);
  }

  private removeOverlay(): void {
    this.root?.remove();
    this.root = null;
    this.shadowRoot = null;
    this.button = null;
  }

  private updateButton(): void {
    if (!this.button) return;

    const isActive = Boolean(document.pictureInPictureElement);
    const state = isActive ? 'active' : 'inactive';
    if (this.button.dataset.state === state) return;

    const label = isActive ? 'Exit Picture in Picture' : 'Open Picture in Picture';
    this.button.dataset.state = state;
    this.button.setAttribute('aria-label', label);
    this.button.setAttribute('aria-pressed', String(isActive));
    this.button.title = label;
    this.button.classList.toggle('is-active', isActive);
  }

  private showToast(message: string): void {
    this.placeOverlay();

    let toast = this.shadowRoot?.getElementById(TOAST_ID);
    if (!toast) {
      toast = document.createElement('div');
      toast.id = TOAST_ID;
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      this.shadowRoot?.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('is-visible');
    if (this.toastTimer !== null) window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => toast?.classList.remove('is-visible'), 3_500);
  }
}
