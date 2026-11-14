/** Proporção de corte, com o uso nas redes sociais no rótulo. */
export type CropPreset = {
  id: string;
  /** Rótulo curto (ex.: "1:1"). */
  label: string;
  /** Onde a proporção é usada (ex.: "Feed do Instagram"). */
  usage: string;
  /** Largura ÷ altura. Sem valor: corte livre. */
  ratio?: number;
};

/** Proporções do cortador, na ordem dos botões. */
export const cropPresets: readonly CropPreset[] = [
  { id: "free", label: "Livre", usage: "Qualquer formato" },
  { id: "1-1", label: "1:1", usage: "Feed e foto de perfil", ratio: 1 },
  { id: "4-5", label: "4:5", usage: "Retrato do Instagram", ratio: 4 / 5 },
  {
    id: "9-16",
    label: "9:16",
    usage: "Stories, Reels e TikTok",
    ratio: 9 / 16,
  },
  { id: "16-9", label: "16:9", usage: "YouTube e telas", ratio: 16 / 9 },
  { id: "4-3", label: "4:3", usage: "Fotos e apresentações", ratio: 4 / 3 },
];

export const DEFAULT_CROP_PRESET = cropPresets[0];

export function getCropPreset(id: string): CropPreset {
  return cropPresets.find((preset) => preset.id === id) ?? DEFAULT_CROP_PRESET;
}
