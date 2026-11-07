import type { SHARE_ERROR_CODES } from "../constants";

/** Maschinenlesbarer Fehlercode des gemeinsamen Core-/Adapter-Vertrags. */
export type ShareErrorCode = (typeof SHARE_ERROR_CODES)[keyof typeof SHARE_ERROR_CODES];

/** Fehler mit Ursache; ein Storage-Pfad macht einen bereits erfolgten Upload sichtbar. */
export type ShareError = Error & {
  readonly code: ShareErrorCode;
  readonly storagePath?: string;
};

/** Zusatzinformationen ohne Passwort oder Nutzdaten für einen Freigabefehler. */
export type ShareErrorOptions = {
  cause?: unknown;
  storagePath?: string;
};
