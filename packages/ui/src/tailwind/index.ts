import { elisePreset } from './preset';

// Exponemos el preset y sus globs de contenido para que el consumidor pueda hacer spread y evitar purga.
export const eliseContent = elisePreset.content ?? [];
export const elise = elisePreset;

export { elisePreset };

export default elise;
