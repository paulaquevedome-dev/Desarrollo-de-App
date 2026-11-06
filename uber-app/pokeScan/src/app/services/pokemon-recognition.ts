import { Injectable } from '@angular/core';

type PokemonLabel = {
  id: number;
  name: string;
};

type ModelBundle = {
  ort: typeof import('onnxruntime-web');
  session: import('onnxruntime-web').InferenceSession;
  labels: PokemonLabel[];
};

type Prediction = PokemonLabel;

type ImageRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const MODEL_REVISION = '3bf528cf0f6ab8464ea3bac0f70d84886e8dab25';
const MODEL_URL =
  `https://huggingface.co/BiernyVR/pokemon-classifier-mobilenetv3/resolve/${MODEL_REVISION}`;
const MODEL_DOWNLOAD_TIMEOUT_MS = 180_000;
const ONNX_IMPORT_TIMEOUT_MS = 30_000;
const MODEL_SIZE_MB = 29;
const LABEL_COUNT = 151;

@Injectable({ providedIn: 'root' })
export class PokemonRecognitionService {
  private modelPromise: Promise<ModelBundle> | null = null;

  async recognize(
    imageUrl: string,
    onStatus: (message: string) => void
  ): Promise<Prediction> {
    const model = await this.getModel(onStatus);

    const response = await fetch(imageUrl, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) {
      throw new Error('No se pudo abrir la foto tomada.');
    }

    const image = await createImageBitmap(await response.blob());
    try {
      const regions = this.getCandidateRegions(image.width, image.height);
      let bestPrediction: { index: number; logit: number } | null = null;

      for (let regionIndex = 0; regionIndex < regions.length; regionIndex++) {
        const input = this.preprocessImage(image, regions[regionIndex]);
        const result = await model.session.run({
          [model.session.inputNames[0]]: new model.ort.Tensor(
            'float32',
            input,
            [1, 3, 224, 224]
          )
        });
        const output = result[model.session.outputNames[0]];
        if (!(output.data instanceof Float32Array) || output.data.length !== model.labels.length) {
          throw new Error('El modelo devolvió un resultado inesperado.');
        }

        let bestIndex = 0;
        let bestLogit = Number.NEGATIVE_INFINITY;
        let secondLogit = Number.NEGATIVE_INFINITY;
        for (let index = 0; index < output.data.length; index++) {
          const logit = output.data[index];
          if (logit > bestLogit) {
            secondLogit = bestLogit;
            bestLogit = logit;
            bestIndex = index;
          } else if (logit > secondLogit) {
            secondLogit = logit;
          }
        }

        const margin = bestLogit - secondLogit;
        if (
          bestLogit >= 3 &&
          margin >= 2 &&
          (!bestPrediction || bestLogit > bestPrediction.logit)
        ) {
          bestPrediction = { index: bestIndex, logit: bestLogit };
        }

        if ((regionIndex + 1) % 5 === 0 || regionIndex === regions.length - 1) {
          onStatus(`Buscando el Pokémon en la foto (${regionIndex + 1}/${regions.length})...`);
        }
      }

      if (!bestPrediction) {
        throw new Error(
          'No se pudo identificar claramente un Pokémon. Acércalo, céntralo y vuelve a intentarlo.'
        );
      }
      return model.labels[bestPrediction.index];
    } finally {
      image.close();
    }
  }

  private async getModel(onStatus: (message: string) => void): Promise<ModelBundle> {
    if (!this.modelPromise) {
      this.modelPromise = this.loadModel(onStatus);
    }

    try {
      return await this.modelPromise;
    } catch (error) {
      this.modelPromise = null;
      throw error;
    }
  }

  private async loadModel(onStatus: (message: string) => void): Promise<ModelBundle> {
    onStatus('Cargando el motor de reconocimiento local...');
    const ort = await this.withTimeout(
      import('onnxruntime-web'),
      ONNX_IMPORT_TIMEOUT_MS,
      'El motor de reconocimiento no respondió. Recarga la página e inténtalo de nuevo.'
    );
    ort.env.wasm.wasmPaths =
      'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.31.0-dev.20260914-8d85527a0/dist/';
    ort.env.wasm.numThreads = 1;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => controller.abort(new DOMException('Model download timed out.', 'TimeoutError')),
      MODEL_DOWNLOAD_TIMEOUT_MS
    );

    try {
      const [modelBytes, labels] = await Promise.all([
        this.downloadModel(onStatus, controller.signal),
        this.downloadLabels(controller.signal)
      ]);

      onStatus('Preparando el reconocimiento local...');
      const session = await ort.InferenceSession.create(modelBytes, {
        executionProviders: ['wasm']
      });
      if (session.inputNames.length !== 1 || session.outputNames.length !== 1) {
        throw new Error('El modelo de reconocimiento no tiene las entradas esperadas.');
      }
      return { ort, session, labels };
    } catch (error) {
      const didTimeout =
        controller.signal.aborted &&
        controller.signal.reason instanceof DOMException &&
        controller.signal.reason.name === 'TimeoutError';
      if (!controller.signal.aborted) {
        controller.abort(error);
      }
      if (didTimeout) {
        throw new Error(
          'La descarga del modelo tardó demasiado. Revisa tu conexión e inténtalo de nuevo.'
        );
      }
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  private async downloadModel(onStatus: (message: string) => void, signal: AbortSignal): Promise<ArrayBuffer> {
    const response = await fetch(`${MODEL_URL}/pokemon_classifier.onnx`, { signal });
    if (!response.ok) {
      throw new Error(`No se pudo descargar el modelo local (${response.status}).`);
    }
    if (!response.body) {
      throw new Error('El navegador no pudo iniciar la descarga del modelo local.');
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let downloadedBytes = 0;
    let lastReportedMegabyte = -1;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        chunks.push(value);
        downloadedBytes += value.byteLength;

        const downloadedMegabytes = Math.floor(downloadedBytes / (1024 * 1024));
        if (downloadedMegabytes !== lastReportedMegabyte) {
          lastReportedMegabyte = downloadedMegabytes;
          onStatus(
            `Descargando modelo local: ${downloadedMegabytes} MB de aproximadamente ${MODEL_SIZE_MB} MB...`
          );
        }
      }
    } finally {
      reader.releaseLock();
    }

    const expectedBytes = Number(response.headers.get('content-length'));
    if (Number.isFinite(expectedBytes) && expectedBytes > 0 && downloadedBytes !== expectedBytes) {
      throw new Error('La descarga del modelo quedó incompleta. Inténtalo de nuevo.');
    }

    const bytes = new Uint8Array(downloadedBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return bytes.buffer;
  }

  private async downloadLabels(signal: AbortSignal): Promise<PokemonLabel[]> {
    const response = await fetch(`${MODEL_URL}/pokemon_labels.json`, { signal });
    if (!response.ok) {
      throw new Error(`No se pudieron descargar las etiquetas del modelo (${response.status}).`);
    }
    const labels: unknown = await response.json();
    if (
      !Array.isArray(labels) ||
      labels.length !== LABEL_COUNT ||
      !labels.every(
        (label, index): label is PokemonLabel =>
          typeof label === 'object' &&
          label !== null &&
          'id' in label &&
          label.id === index + 1 &&
          'name' in label &&
          typeof label.name === 'string' &&
          label.name.length > 0
      )
    ) {
      throw new Error('Las etiquetas del modelo no tienen el formato esperado.');
    }
    return labels;
  }

  private async withTimeout<T>(task: Promise<T>, timeoutMs: number, message: string): Promise<T> {
    let timeoutId = 0;
    try {
      return await Promise.race([
        task,
        new Promise<T>((_, reject) => {
          timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs);
        })
      ]);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  private getCandidateRegions(width: number, height: number): ImageRegion[] {
    const minDimension = Math.min(width, height);
    const regions: ImageRegion[] = [{ x: 0, y: 0, width, height }];
    const centers = [0.2, 0.5, 0.8];

    for (const scale of [0.65, 0.4, 0.22]) {
      const size = minDimension * scale;
      for (const centerY of centers) {
        for (const centerX of centers) {
          regions.push({
            x: Math.max(0, Math.min(centerX * width - size / 2, width - size)),
            y: Math.max(0, Math.min(centerY * height - size / 2, height - size)),
            width: size,
            height: size
          });
        }
      }
    }
    return regions;
  }

  private preprocessImage(image: ImageBitmap, region: ImageRegion): Float32Array {
    const canvas = document.createElement('canvas');
    canvas.width = 224;
    canvas.height = 224;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      throw new Error('No se pudo preparar la foto para reconocerla.');
    }

    context.drawImage(
      image,
      region.x,
      region.y,
      region.width,
      region.height,
      0,
      0,
      224,
      224
    );
    const imageData = context.getImageData(0, 0, 224, 224).data;
    const pixels = new Float32Array(3 * 224 * 224);
    const mean = [0.485, 0.456, 0.406];
    const standardDeviation = [0.229, 0.224, 0.225];
    const area = 224 * 224;

    for (let index = 0; index < area; index++) {
      for (let channel = 0; channel < 3; channel++) {
        pixels[channel * area + index] =
          (imageData[index * 4 + channel] / 255 - mean[channel]) / standardDeviation[channel];
      }
    }
    return pixels;
  }
}
