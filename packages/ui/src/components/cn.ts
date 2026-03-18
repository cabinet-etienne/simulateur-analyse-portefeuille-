import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitaire pour combiner des classes Tailwind de manière sûre.
 * Utilise clsx pour la logique conditionnelle et tailwind-merge pour résoudre les conflits.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
