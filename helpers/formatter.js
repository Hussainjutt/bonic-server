export function isImageUrl(inputString) {
  const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|tiff|svg|webp)$/i;
  const urlPattern = /^https?:\/\//i;
  return imageExtensions.test(inputString) && urlPattern.test(inputString);
}
