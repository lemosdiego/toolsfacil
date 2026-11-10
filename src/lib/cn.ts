import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Ensina ao tailwind-merge os tokens personalizados de `globals.css`
 * (raios, sombras e larguras), para que eles também resolvam conflitos.
 * Ao criar um token desses tipos no `@theme`, adicione o nome aqui.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ["control", "card"],
      shadow: ["card", "raised"],
      container: ["content", "prose"],
    },
  },
});

/**
 * Combina classes condicionais e resolve conflitos do Tailwind
 * (a última classe vence: `cn("px-2", "px-4")` → `"px-4"`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
