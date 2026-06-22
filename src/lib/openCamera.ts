/**
 * Starts the camera and returns the MediaStream.
 */
export const openCameraStream = async (): Promise<MediaStream> => {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Camera is not supported in this browser.");
  }
  return await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: { ideal: "environment" },
    },
  });
};

/**
 * Captures an image from a HTMLVideoElement using a HTMLCanvasElement
 * and returns it as a JPEG File object.
 */
export const captureImageFromFile = (
  video: HTMLVideoElement | null,
  canvas: HTMLCanvasElement | null
): Promise<File | null> => {
  return new Promise((resolve) => {
    if (!video || !canvas) {
      resolve(null);
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      resolve(null);
      return;
    }

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      resolve(null);
      return;
    }

    context.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(blob);
          return;
        }
        const file = new File([blob], `proof-${Date.now()}.jpg`, { type: "image/jpeg" });
        resolve(file);
      },
      "image/jpeg",
      0.95
    );
  });
};
