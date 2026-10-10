import type { de } from './locales/de';

export type UiKey = keyof typeof de;
export type UiStrings = Record<UiKey, string>;
