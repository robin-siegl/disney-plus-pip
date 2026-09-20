export function isDisneyPlusUrl(value: string | undefined): boolean {
  if (!value) return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'disneyplus.com' || url.hostname.endsWith('.disneyplus.com'))
    );
  } catch {
    return false;
  }
}
