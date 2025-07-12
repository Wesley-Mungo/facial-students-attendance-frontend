export const captureFrameToBase64 = (videoElement: HTMLVideoElement): string | null => {
  if (!videoElement || videoElement.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA) {
    return null
  }

  const canvas = document.createElement('canvas')
  canvas.width = videoElement.videoWidth
  canvas.height = videoElement.videoHeight
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return null
  
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.8)
}
