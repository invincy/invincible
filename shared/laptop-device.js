export function isPhoneOrTablet(device = globalThis.navigator) {
  return Boolean(device?.userAgentData?.mobile
    || /Android|iPhone|iPad|iPod/i.test(device?.userAgent || '')
    || (/Macintosh/.test(device?.userAgent || '') && device?.maxTouchPoints > 1));
}
