/**
 * Comprime uma imagem no navegador antes de enviar pro Supabase Storage.
 *
 * Por quê: fotos tiradas direto de celular/câmera costumam vir com
 * vários MB cada. Isso enche rápido o limite gratuito de 1 GB do
 * Supabase Storage. Aqui a gente redimensiona (se for maior que o
 * necessário pra exibir no site) e reexporta como JPEG com qualidade
 * ajustada, o que costuma reduzir o tamanho do arquivo em 70-90% sem
 * perda visível de qualidade.
 *
 * Se o arquivo não for uma imagem (ex: PDF de manual/garantia) ou algo
 * der errado no processo, devolve o arquivo original sem mexer — nunca
 * bloqueia o upload por causa disso.
 */

const MAX_DIMENSION = 1600; // px no lado maior — mais que suficiente pra web
const JPEG_QUALITY = 0.8; // 0 a 1, 0.8 é um bom equilíbrio qualidade/tamanho

export async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file; // não é imagem (ex: PDF), não mexe
  }

  // GIFs podem ser animados — comprimir com canvas perderia a animação.
  if (file.type === "image/gif") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);

    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const targetWidth = Math.round(bitmap.width * scale);
    const targetHeight = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", JPEG_QUALITY)
    );

    if (!blob) return file;

    // Se por algum motivo a versão "comprimida" ficou maior que a original
    // (pode acontecer com imagens já bem otimizadas), fica com a original.
    if (blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    // Qualquer erro no processo (formato não suportado, etc.) => usa o original.
    return file;
  }
}

/** Aplica a compressão em uma lista/array de arquivos, em paralelo. */
export async function compressImageFiles(files: File[]): Promise<File[]> {
  return Promise.all(files.map(compressImageFile));
}
