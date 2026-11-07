import type { ShareValue, ShareResult, ShareError } from "@fabianmarcus/local-firebase-share";

/** Eindeutige Aktion und Freigabeart eines React-Ergebnisses. */
export type UseLocalFirebaseShareResult =
  | { action: "share"; mode: "encrypted"; value: ShareResult }
  | { action: "retrieve"; mode: "encrypted"; value: ShareValue }
  | { action: "sharePublic"; mode: "public"; value: ShareResult }
  | { action: "retrievePublic"; mode: "public"; value: ShareValue };

/** Geplanter Hook-Vertrag; der Hook selbst entsteht erst in Einheit 5. */
export type UseLocalFirebaseShare = {
  is: {
    sharing: boolean;
    retrieving: boolean;
    sharingPublic: boolean;
    retrievingPublic: boolean;
  };
  result: UseLocalFirebaseShareResult | null;
  error: ShareError | null;
  clearError: () => void;
  share: (data: ShareValue, password: string) => Promise<ShareResult>;
  retrieve: (id: string, password: string) => Promise<ShareValue>;
  sharePublic: (data: ShareValue) => Promise<ShareResult>;
  retrievePublic: (id: string) => Promise<ShareValue>;
};
