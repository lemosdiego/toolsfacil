import {
  encodeImage,
  ImageProcessingError,
  type EncodedImage,
  type EncodeOptions,
} from "./encode-image";

export type ImageWorkerRequest = {
  id: number;
  file: Blob;
  options: EncodeOptions;
};

export type ImageWorkerResponse =
  | { id: number; ok: true; result: EncodedImage }
  | { id: number; ok: false; code: ImageProcessingError["code"] };

/** O worker não carregou (ou foi encerrado): usar a thread principal. */
class WorkerUnavailableError extends Error {}

type Pending = {
  resolve: (result: EncodedImage) => void;
  reject: (error: Error) => void;
};

let worker: Worker | undefined;
let workerBroken = false;
let nextId = 0;
const pending = new Map<number, Pending>();

function rejectAll(error: Error) {
  for (const { reject } of pending.values()) reject(error);
  pending.clear();
}

/** Worker com OffscreenCanvas: Chrome, Edge, Firefox e Safari recentes. */
function supportsWorker(): boolean {
  return (
    !workerBroken &&
    typeof Worker !== "undefined" &&
    typeof OffscreenCanvas !== "undefined" &&
    typeof OffscreenCanvas.prototype.convertToBlob === "function" &&
    typeof createImageBitmap === "function"
  );
}

function getWorker(): Worker {
  if (worker) return worker;

  const created = new Worker(
    new URL("../../workers/image.worker.ts", import.meta.url),
    { type: "module", name: "processamento-de-imagem" },
  );
  created.onmessage = ({ data }: MessageEvent<ImageWorkerResponse>) => {
    const request = pending.get(data.id);
    if (!request) return;
    pending.delete(data.id);
    if (data.ok) request.resolve(data.result);
    else request.reject(new ImageProcessingError(data.code));
  };
  created.onerror = (event) => {
    event.preventDefault();
    workerBroken = true;
    disposeImageWorker();
  };

  worker = created;
  return created;
}

function runInWorker(
  file: Blob,
  options: EncodeOptions,
): Promise<EncodedImage> {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    getWorker().postMessage({ id, file, options } satisfies ImageWorkerRequest);
  });
}

/**
 * Processa a imagem no Web Worker quando o navegador suporta e, senão (ou se
 * o worker falhar ao carregar), na thread principal. Erros de decodificação
 * e codificação chegam como `ImageProcessingError`.
 */
export async function processImage(
  file: Blob,
  options: EncodeOptions,
): Promise<EncodedImage> {
  if (supportsWorker()) {
    try {
      return await runInWorker(file, options);
    } catch (error) {
      if (!(error instanceof WorkerUnavailableError)) throw error;
    }
  }
  return encodeImage(file, options);
}

/** Encerra o worker (ao sair da página da ferramenta) e libera a memória. */
export function disposeImageWorker(): void {
  worker?.terminate();
  worker = undefined;
  rejectAll(new WorkerUnavailableError("worker encerrado"));
}
