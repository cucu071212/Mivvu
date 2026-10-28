/** Mivvu preview intro choreography (auto-advance only; tap skips immediately). */
export const MIVVU_INTRO_ENTER_MS = 400;
export const MIVVU_INTRO_HOLD_MS = 2500;
export const MIVVU_INTRO_EXIT_MS = 300;

export const MIVVU_INTRO_EXIT_START_MS =
  MIVVU_INTRO_ENTER_MS + MIVVU_INTRO_HOLD_MS;

export const MIVVU_INTRO_TOTAL_MS =
  MIVVU_INTRO_EXIT_START_MS + MIVVU_INTRO_EXIT_MS;
