/*
 * Web Worker de processamento de imagem: decodifica e codifica com
 * OffscreenCanvas fora da thread principal, para a tela não travar.
 * Nada sai daqui além do resultado para a própria página.
 */
import { encodeImage, ImageProcessingError } from "@/lib/image/encode-image";
import type {
  ImageWorkerRequest,
  ImageWorkerResponse,
} from "@/lib/image/process-image";

type WorkerScope = {
  onmessage: ((event: MessageEvent<ImageWorkerRequest>) => void) | null;
  postMessage(message: ImageWorkerResponse): void;
};

const scope = self as unknown as WorkerScope;

scope.onmessage = async ({ data: { id, file, options } }) => {
  try {
    const result = await encodeImage(file, options);
    scope.postMessage({ id, ok: true, result });
  } catch (error) {
    scope.postMessage({
      id,
      ok: false,
      code:
        error instanceof ImageProcessingError ? error.code : "encode-failed",
    });
  }
};
