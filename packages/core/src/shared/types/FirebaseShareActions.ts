import type { ShareValue } from "./ShareValue";
import type { ShareResult } from "./ShareResult";
import type { FirebaseShareOptions } from "./FirebaseShareOptions";

/** Geplanter Core-Vertrag; konkrete Aktionen werden in den Einheiten 4 und 4b implementiert. */
export type FirebaseShareActions = {
  share: (data: ShareValue, password: string, options: FirebaseShareOptions) => Promise<ShareResult>;
  retrieve: (id: string, password: string, options: FirebaseShareOptions) => Promise<ShareValue>;
  sharePublic: (data: ShareValue, options: FirebaseShareOptions) => Promise<ShareResult>;
  retrievePublic: (id: string, options: FirebaseShareOptions) => Promise<ShareValue>;
};
