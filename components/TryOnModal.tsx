"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

type Status = "consent" | "loading" | "running" | "error";

// Quanto maior, mais largo o óculos fica em relação à distância entre os
// cantos externos dos olhos. É uma aproximação — cada foto de produto tem um
// enquadramento levemente diferente, então pode precisar de ajuste fino.
const GLASSES_WIDTH_FACTOR = 2.1;
// Desce o centro do óculos um pouco abaixo da linha dos olhos, pra ficar
// mais perto da altura real do nariz.
const VERTICAL_OFFSET_FACTOR = 0.35;

// Índices da malha facial (FaceLandmarker/FaceMesh, 468+ pontos) usados
// para os cantos externos dos olhos.
const LEFT_EYE_OUTER = 33;
const RIGHT_EYE_OUTER = 263;

export default function TryOnModal({
  productImage,
  productName,
  onClose,
}: {
  productImage: string;
  productName: string;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<Status>("consent");
  const [errorMessage, setErrorMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const glassesImageRef = useRef<HTMLImageElement | null>(null);
  const faceLandmarkerRef = useRef<any>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    return () => {
      stoppedRef.current = true;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopCamera() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    try {
      faceLandmarkerRef.current?.close?.();
    } catch {
      // ignora — só estamos liberando recursos
    }
    faceLandmarkerRef.current = null;
  }

  async function handleActivateCamera() {
    setStatus("loading");
    setErrorMessage("");

    try {
      // Pré-carrega a foto do produto (precisa estar pronta antes do loop de desenho).
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = productImage;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Não foi possível carregar a foto do produto."));
      });
      glassesImageRef.current = image;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) throw new Error("Não foi possível iniciar a câmera.");
      video.srcObject = stream;
      await video.play();

      await new Promise<void>((resolve) => {
        if (video.videoWidth > 0) return resolve();
        video.onloadedmetadata = () => resolve();
      });

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      if (containerRef.current) {
        containerRef.current.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
      }

      // Carregado só quando o usuário ativa a câmera — é um pacote pesado (WASM + modelo),
      // não faz sentido baixar pra quem nunca clicou em "Ativar câmera".
      const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );
      const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
      });
      faceLandmarkerRef.current = faceLandmarker;

      if (stoppedRef.current) {
        stopCamera();
        return;
      }

      setStatus("running");
      drawLoop();
    } catch (error) {
      stopCamera();
      setStatus("error");
      setErrorMessage(
        error instanceof Error && error.name === "NotAllowedError"
          ? "Você precisa permitir o acesso à câmera pra usar o provador virtual."
          : "Não foi possível ativar o provador virtual agora. Tente novamente em instantes."
      );
    }
  }

  function drawLoop() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const glasses = glassesImageRef.current;
    const faceLandmarker = faceLandmarkerRef.current;
    if (!video || !canvas || !glasses || !faceLandmarker || stoppedRef.current) return;

    const ctx = canvas.getContext("2d");
    if (ctx && video.readyState >= 2) {
      const result = faceLandmarker.detectForVideo(video, performance.now());
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const landmarks = result?.faceLandmarks?.[0];
      if (landmarks) {
        const left = landmarks[LEFT_EYE_OUTER];
        const right = landmarks[RIGHT_EYE_OUTER];
        const leftPx = { x: left.x * canvas.width, y: left.y * canvas.height };
        const rightPx = { x: right.x * canvas.width, y: right.y * canvas.height };
        const dx = rightPx.x - leftPx.x;
        const dy = rightPx.y - leftPx.y;
        const eyeDistance = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        const centerX = (leftPx.x + rightPx.x) / 2;
        const centerY = (leftPx.y + rightPx.y) / 2 + eyeDistance * VERTICAL_OFFSET_FACTOR;
        const glassesWidth = eyeDistance * GLASSES_WIDTH_FACTOR;
        const glassesHeight = glassesWidth * (glasses.naturalHeight / glasses.naturalWidth);

        ctx.save();
        ctx.globalCompositeOperation = "multiply";
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.drawImage(glasses, -glassesWidth / 2, -glassesHeight / 2, glassesWidth, glassesHeight);
        ctx.restore();
      }
    }

    rafRef.current = requestAnimationFrame(drawLoop);
  }

  function handleClose() {
    stoppedRef.current = true;
    stopCamera();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-brand-ink/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Provador virtual — ${productName}`}>
      <div className="relative w-full max-w-md overflow-hidden rounded-[1.5rem] bg-brand-ink text-brand-paper shadow-soft">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-brand-paper/25 text-brand-paper transition-colors hover:bg-brand-paper/10"
          aria-label="Fechar provador virtual"
        >
          <X size={16} />
        </button>

        {status === "consent" && (
          <div className="p-7 sm:p-9">
            <h2 className="pr-8 font-heading text-2xl font-semibold leading-tight">Experimente antes de comprar</h2>
            <p className="mt-4 font-body text-sm leading-6 text-brand-paper/70">
              O provador virtual usa a câmera do seu dispositivo. O vídeo é processado localmente,
              direto no seu navegador — não é gravado nem enviado para nenhum servidor.
            </p>
            <button onClick={handleActivateCamera} className="mt-7 w-full rounded-full bg-brand-paper px-5 py-3.5 font-body text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-ink transition-colors hover:bg-brand-gold">
              Ativar câmera
            </button>
            <p className="mt-4 text-center font-body text-[11px] leading-4 text-brand-paper/40">
              Protótipo — o encaixe é uma aproximação e pode não ficar perfeito em todos os ângulos.
            </p>
          </div>
        )}

        {status === "loading" && (
          <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-paper/25 border-t-brand-gold" />
            <p className="font-body text-sm text-brand-paper/70">Preparando o provador virtual...</p>
          </div>
        )}

        {status === "error" && (
          <div className="p-7 text-center sm:p-9">
            <p className="font-heading text-xl font-semibold">Não deu certo</p>
            <p className="mt-3 font-body text-sm leading-6 text-brand-paper/70">{errorMessage}</p>
            <button onClick={handleActivateCamera} className="mt-6 w-full rounded-full bg-brand-paper px-5 py-3.5 font-body text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-ink transition-colors hover:bg-brand-gold">
              Tentar de novo
            </button>
          </div>
        )}

        <div ref={containerRef} className={`relative w-full overflow-hidden bg-black ${status === "running" ? "" : "hidden"}`} style={{ aspectRatio: "1 / 1" }}>
          <div className="absolute inset-0" style={{ transform: "scaleX(-1)" }}>
            <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <p className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8 text-center font-body text-[11px] uppercase tracking-[0.12em] text-brand-paper/80">
            Vire o rosto devagar para melhor encaixe
          </p>
        </div>
      </div>
    </div>
  );
}
