import type { Firestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";

/** Getrennte Firestore- und Storage-Pfade eines Freigabebereichs. */
export type FirebaseShareOptionsArea = {
  collectionPath: string;
  storagePrefix: string;
};

/** Von der Host-App bereitgestellte Firebase-Instanzen und Freigabebereiche. */
export type FirebaseShareOptions = {
  firestore: Firestore;
  storage: FirebaseStorage;
  encrypted?: FirebaseShareOptionsArea;
  public?: FirebaseShareOptionsArea;
};
