const FALLBACK_BASE_NAME = "imagem";
const MAX_BASE_LENGTH = 100;

/** Nome do arquivo sem pastas e sem a última extensão. */
function baseNameOf(fileName: string): string {
  const name = fileName.split(/[\\/]/).pop() ?? "";
  const lastDot = name.lastIndexOf(".");
  // ".png" sozinho não tem nome; "foto.tar.png" vira "foto.tar".
  return lastDot > 0 ? name.slice(0, lastDot) : lastDot === 0 ? "" : name;
}

/** Tira caracteres que os sistemas recusam em nomes de arquivo. */
function sanitize(baseName: string): string {
  return baseName
    .replace(/[\u0000-\u001f\u007f<>:"/\\|?*]+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^[\s.-]+|[\s.-]+$/g, "")
    .slice(0, MAX_BASE_LENGTH)
    .trim();
}

/**
 * Nome previsível do arquivo de saída.
 * Ex.: ("foto.PNG", { extension: "webp" }) → "foto.webp";
 * ("foto.jpg", { extension: "jpg", suffix: "cortada" }) → "foto-cortada.jpg".
 * Sem nome aproveitável, usa "imagem".
 */
export function getOutputFileName(
  inputName: string,
  { extension, suffix }: { extension: string; suffix?: string },
): string {
  const base = sanitize(baseNameOf(inputName)) || FALLBACK_BASE_NAME;
  const withSuffix = suffix ? `${base}-${suffix}` : base;
  return `${withSuffix}.${extension.toLowerCase().replace(/^\./, "")}`;
}
