## 3 Firebase-Transport

**Ziel:** Verschlüsselte Dateien lassen sich mit injizierten Firebase-Instanzen speichern und anhand der Firestore-ID wieder abrufen.

**Abhängigkeiten:** Einheit 1. Die Kryptologik aus Einheit 2 ist für den Transport selbst nicht erforderlich.

**Umsetzung:**

- Zunächst den verschlüsselten Ablauf aus ShareService übertragen und dessen Upload-/Downloadmechanik für Einheit 4b wiederverwenden. Keine Bandit-Typen übernehmen. Die generische Blob-/File-Konvertierung gehört in Einheit 4.
- Gemeinsame Mechanik in `saveSharePayload` und `getSharePayload` bündeln; bereichsspezifische Aufrufer wählen ausschließlich den validierten Encrypted- oder Public-Bereich. Die Public-Erweiterung darf weder verschlüsselte Pfade öffnen noch Kopien automatisch in den anderen Bereich verschieben.
- `Firestore` und `FirebaseStorage` aus derselben Host-Konfiguration verwenden; kein verstecktes `getStorage()` auf der Default-App.
- Collection-Pfad und Storage-Präfix bei Speichern und Lesen gleichermaßen berücksichtigen. Den bisherigen Unterschied zwischen konfigurierbarer Schreib-Collection und fest verdrahteter Lese-Collection beseitigen.
- Metadatenfelder `fileid`, `file`, `created` und `uri` für vorhandene Dokumente beibehalten. `fileid` bezeichnet die Datei-ID, nicht die Firestore-Dokument-ID; `created` wird als Firestore-Timestamp geschrieben und gelesen.
- Zufällige Dateipfade und eine automatisch erzeugte Dokument-ID verwenden. Eine lokale syntaktische Prüfung darf Dokument-IDs nicht pauschal auf 20 Zeichen einschränken.
- Metadaten vor Verwendung prüfen, insbesondere Storage-Pfad und erwartetes Präfix. Kein Zugriff auf beliebige externe Download-URLs aus fremden Metadaten.
- Download vorzugsweise über `getBytes` mit begrenzter Größe. Die erforderliche Bucket-CORS-Konfiguration dokumentieren und in Einheit 6 im Browser verifizieren.
- Eine gemeinsame Obergrenze für die vollständige verschlüsselte UTF-8-Datei definieren, unterhalb des bisherigen strikten Limits von 10 MiB. Upload und Download prüfen Bytes, nicht die Länge des Klartext-Strings.
- Das Limit gilt für das gesamte Objekt einschließlich aller kodierten Blobs/Files und beider Base64-Schichten. MIME-Typ und Dateiname eingebetteter Dateien bleiben im verschlüsselten Payload, nicht in Firestore-Metadaten.
- Uploadfehler erzeugen kein Metadatendokument. Scheitert der Metadaten-Write nach Upload, wird ein expliziter Teilfehler mit Storage-Pfad und Ursache gemeldet.
- Keine automatische Kompensation durch Delete voraussetzen: Die bisherigen Regeln verbieten es. Verwaiste Dateien benötigen ein autorisiertes, separat dokumentiertes Betreiberverfahren.
- Firebase-Fehler unverfälscht als Ursache erhalten; fehlendes Dokument, fehlende Datei, Zugriffsverweigerung und Netzwerkfehler unterscheiden.

**Dateien:**

- `packages/core/src/shared/firebase/saveEncryptedShare.ts`, `getEncryptedShare.ts` – Upload und Abruf.
- `packages/core/src/shared/firebase/saveSharePayload.ts`, `getSharePayload.ts` – gemeinsame Upload-/Downloadmechanik im Basis-Package.
- `packages/core/src/shared/types/EncryptedShareMetadata.ts` – geprüftes Metadatenschema.
- `packages/core/src/shared/constants.ts` – Pfaddefaults und Dateiobergrenze.
- `packages/core/index.ts` – verfügbare Transportfunktionen exportieren.
- `packages/core/tests/shared/firebase/saveEncryptedShare.test.ts`, `getEncryptedShare.test.ts` – SDK-basierte Transporttests.
- `packages/core/README.md` – Instanzübergabe, Speicherformat, CORS, Limits und Teilfehler.

**Tests:** Reihenfolge von Upload und Write, identische Ciphertext-Rückgabe, benannte Firebase-App, alternative Collection/Präfixe, fehlende Dokumente/Dateien, ungültige Metadaten, Größen-Grenzfälle und alle Teilfehler prüfen. Keine Passwörter oder Klartexte in den SDK-Aufrufen.

**Testbarkeit:** Ein Anwender speichert einen synthetischen Ciphertext, erhält eine Dokument-ID und ruft darüber exakt dieselbe Datei ab. In der Firebase-Konsole liegen ausschließlich Ciphertext und erlaubte Metadaten.

**Abnahme:** Symmetrisch konfigurierbarer Transport; Fehler und nicht atomare Teilzustände sind vollständig sichtbar.
