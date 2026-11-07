import type { UseLocalFirebaseShare } from "@fabianmarcus/react-local-firebase-share";
import type {
  ShareValue,
  FirebaseShareOptions,
  FirebaseShareActions,
  ShareErrorCode,
} from "@fabianmarcus/local-firebase-share";

/** Compilezeit-Prüfung des Datenvertrags einschließlich verschachtelter Binärdaten. */
export const data: ShareValue = {
  id: "example",
  images: [new Blob(["example"], { type: "text/plain" })],
  file: new File(["example"], "example.txt", { lastModified: 1 }),
};

/** Belegt, dass Konfigurationen keine lokalen Storage-Instanzen verlangen. */
export type OptionsContract = Pick<FirebaseShareOptions, "firestore" | "storage">;

/** Belegt den identischen Datenvertrag von Core und React. */
export const signaturesMatch: [
  Parameters<FirebaseShareActions["share"]>[0],
  Parameters<UseLocalFirebaseShare["share"]>[0],
] = [data, data];

/** Belegt die typisierte Ablehnung eines unbekannten Fehlercodes. */
// @ts-expect-error Unbekannte Fehlercodes sind kein Bestandteil des Vertrags.
export const invalidErrorCode: ShareErrorCode = "UNKNOWN";

/** Belegt die typisierte Ablehnung von BigInt-Daten. */
// @ts-expect-error BigInt gehört nicht zum unterstützten Datenvertrag.
export const invalidData: ShareValue = 1n;
