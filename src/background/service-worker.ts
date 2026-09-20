import { isDisneyPlusUrl } from '../shared/url';

async function togglePictureInPictureInPage(): Promise<void> {
  function collectVideos(root: Document | ShadowRoot, videos: HTMLVideoElement[]): void {
    videos.push(...root.querySelectorAll('video'));
    for (const element of root.querySelectorAll('*')) {
      if (element.shadowRoot) collectVideos(element.shadowRoot, videos);
    }
  }

  if (document.pictureInPictureElement) {
    await document.exitPictureInPicture();
    return;
  }

  const videos: HTMLVideoElement[] = [];
  collectVideos(document, videos);
  const video =
    videos.find((candidate) => {
      const rect = candidate.getBoundingClientRect();
      const style = getComputedStyle(candidate);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        rect.width > 160 &&
        rect.height > 90
      );
    }) ?? videos.at(-1);

  if (!video) return;
  video.removeAttribute('disablepictureinpicture');
  video.disablePictureInPicture = false;
  await video.requestPictureInPicture();
}

chrome.action.onClicked.addListener((tab) => {
  if (!tab.id || !isDisneyPlusUrl(tab.url)) return;

  void chrome.scripting
    .executeScript({
      target: { tabId: tab.id },
      func: togglePictureInPictureInPage,
    })
    .catch((error: unknown) => {
      console.warn('Disney+ PiP toolbar action failed:', error);
    });
});
