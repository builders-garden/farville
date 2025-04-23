import { Mode } from "../types/game";

export function validMode(mode: string): boolean {
  return Object.values(Mode).includes(mode as Mode);
}
