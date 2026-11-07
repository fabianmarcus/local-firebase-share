# @fabianmarcus/local-firebase-share

Frameworkfreier Core für Firebase-Sharing. Dieses Package liest und schreibt keinen lokalen Browserspeicher.

## Aktueller Umfang

Schritt 01 exportiert Daten-, Konfigurations-, Aktions- und Fehlertypen sowie `SHARE_ERROR_CODES` und `createShareError`. Sharing, Verschlüsselung und Blob-/File-Konvertierung sind noch nicht ausführbar.

```ts
import { createShareError, SHARE_ERROR_CODES } from "@fabianmarcus/local-firebase-share";
import type { ShareValue, FirebaseShareOptions, FirebaseShareActions } from "@fabianmarcus/local-firebase-share";
```

Es gibt keine React-/Angular-Abhängigkeiten. Firebase ist ein externalisierter Peer (`~12.9.0`), aktuell mit 12.9.0 und TypeScript 5.9 geprüft. Der Bereich bleibt zunächst eng: neuere Firebase-Minorversionen benötigen möglicherweise zusätzliche Typbibliotheken und werden erst nach eigenen Verbrauchertests freigegeben. Browseroperationen benötigen künftig Web Crypto und passende Blob-/File-APIs; Importieren allein greift nicht auf `window`, Firebase oder lokalen Speicher zu.

## Verbindlicher Zielvertrag

`FirebaseShareActions` beschreibt die künftigen Core-Funktionen:

- `share(data, password, options): Promise<{ id: string }>`
- `retrieve(id, password, options): Promise<ShareValue>`
- `sharePublic(data, options): Promise<{ id: string }>`
- `retrievePublic(id, options): Promise<ShareValue>`

`FirebaseShareOptions` enthält die initialisierten Instanzen `firestore` und `storage`. Optionales `encrypted` konfiguriert `collectionPath` und `storagePrefix`; ohne diese Angabe gelten künftig `encrypted` und `encrypted_bandits` aus dem bestehenden Ablauf. Öffentliches Teilen verlangt eine explizite `public`-Konfiguration. Identische oder überlappende Bereiche werden bei der Implementierung als `INVALID_CONFIGURATION` abgewiesen.

Fehlendes Passwort bei `share` ist `INVALID_INPUT`, kein Wechsel zum öffentlichen Modus. Fehlendes Dokument ist `SHARE_NOT_FOUND`, deaktiviertes Public-Sharing ist `PUBLIC_SHARING_DISABLED`. Fehler sind `Error`-Objekte mit maschinenlesbarem `code` und ursprünglicher `cause`; ein `storagePath` macht einen bereits erfolgten Upload bei anschließend fehlgeschriebenen Metadaten sichtbar.

`ShareValue` umfasst JSON-Werte, Arrays, gewöhnliche Objekte, Blob und File. Endliche Zahlen und eine nicht zyklische Struktur werden zur Laufzeit geprüft, sobald die Datenfunktionen implementiert sind. Rückgaben sind keine ungeprüften fachlichen Domänentypen. File-Bytes, MIME-Typ, Name und `lastModified` sollen erhalten bleiben. Alte Data-URLs bleiben Strings.

Der Core hat keinen globalen Pending-State. Aufrufer sind selbst für Lebenszyklus, Parallelität und fachliche Prüfung verantwortlich. Passwörter und Payloads werden nicht geloggt.

## Ausgabe und Veröffentlichung

ESM und CJS mit jeweils passenden Typdeklarationen, nur öffentliche Root-Exports und keine Source-Deep-Imports. Das Package steht unter [MIT](./LICENSE); Veröffentlichung bleibt bis zur Implementierung und Release-Abnahme blockiert. Siehe [Projekt-README](../../README.md) und [Plan](../../plans/README.md).
