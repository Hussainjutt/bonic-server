export function isImageUrl(inputString) {
  const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|tiff|svg|webp)$/i;
  const urlPattern = /^https?:\/\//i;
  return imageExtensions.test(inputString) && urlPattern.test(inputString);
}
export function generatePin(userPin) {
  const min = 1000;
  const max = 9999;
  let pin = Math.floor(Math.random() * (max - min + 1)) + min;
  if (userPin) {
    const existingPins = new Set([userPin]);
    do {
      pin = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (existingPins.has(pin));
  }
  return pin;
}
