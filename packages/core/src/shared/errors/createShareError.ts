import type { ShareError, ShareErrorCode, ShareErrorOptions } from "../types/ShareError";

/**
 * Erstellt einen typisierten Freigabefehler ohne Protokollierung von Nutzdaten.
 * @param code Maschinenlesbarer Fehlercode.
 * @param message Beschreibung der fehlgeschlagenen Operation.
 * @param options Ursache und optionaler Pfad eines bereits erfolgten Uploads.
 * @returns Fehler mit unveränderter Ursache und optionalem Storage-Pfad.
 */
export function createShareError(code: ShareErrorCode, message: string, options: ShareErrorOptions = {}): ShareError {
  const error = Object.assign(new Error(message, { cause: options.cause }), { code });
  return options.storagePath === undefined ? error : Object.assign(error, { storagePath: options.storagePath });
}

export default createShareError;
