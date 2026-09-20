import { enablePictureInPicture, findActiveVideo, getPlayerHost } from '../disney/player';
import { exitPipIcon, pipIcon } from './icons';

const BUTTON_ID = 'disney-plus-pip-button';
const TOAST_ID = 'disney-plus-pip-toast';
const SCAN_INTERVAL_MS = 1_000;

export class PictureInPictureController {
  private button: HTMLButtonElement | null = null;
  private currentVideo: HTMLVideoElement | null = null;
  private toastTimer: number | null = null;
  private scanTimer: number | null = null;
  private scanInterval: number | null = null;

  private readonly observer = new MutationObserver(() => this.scheduleScan());
  private readonly updateButtonHandler = (): void => this.updateButton();
  private readonly fullscreenHandler = (): void => this.scheduleScan();

  start(): void {
    this.observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disablepictureinpicture', 'src'],
    });

    document.addEventListener('fullscreenchange', this.fullscreenHandler);
    this.scan();
    this.scanInterval = window.setInterval(() => this.scan(), SCAN_INTERVAL_MS);
  }

  stop(): void {
    this.observer.disconnect();
    document.removeEventListener('fullscreenchange', this.fullscreenHandler);
    this.bindVideo(null);
    this.button?.remove();
    document.getElementById(TOAST_ID)?.remove();

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
    if (!video) {
      this.bindVideo(null);
      this.button?.remove();
      return;
    }

    this.bindVideo(video);
    enablePictureInPicture(video);
    this.placeButton();
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
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      void this.toggle();
    });
    return button;
  }

  private placeButton(): void {
    this.button ??= this.createButton();
    const host = getPlayerHost();
    if (this.button.parentNode !== host) host.appendChild(this.button);
  }

  private updateButton(): void {
    if (!this.button) return;

    const isActive = Boolean(document.pictureInPictureElement);
    const state = isActive ? 'active' : 'inactive';
    if (this.button.dataset.state === state) return;

    const label = isActive ? 'Exit Picture in Picture' : 'Open Picture in Picture';
    this.button.dataset.state = state;
    this.button.innerHTML = isActive ? exitPipIcon : pipIcon;
    this.button.setAttribute('aria-label', label);
    this.button.title = label;
    this.button.classList.toggle('is-active', isActive);
  }

  private showToast(message: string): void {
    let toast = document.getElementById(TOAST_ID);
    if (!toast) {
      toast = document.createElement('div');
      toast.id = TOAST_ID;
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('is-visible');
    if (this.toastTimer !== null) window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => toast?.classList.remove('is-visible'), 3_500);
  }
}
