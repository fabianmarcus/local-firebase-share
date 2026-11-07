# Umsetzungsplan: local-firebase-share

## Festgelegter Rahmen

- Basis-Package: `@fabianmarcus/local-firebase-share`.
- React-Adapter: `@fabianmarcus/react-local-firebase-share`, konsumiert das Basis-Package als reguläre npm-Abhängigkeit.
- Neues GitHub-Repository: `fabianmarcus/local-firebase-share`.
- Gemeinsames Repository mit npm Workspaces `packages/core` und `packages/react`, wie bestätigt. Kein Angular-Package im aktuellen Umfang.
- Veröffentlichung ausschließlich über GitHub Packages: <https://npm.pkg.github.com>.
- Lizenz für das Projekt und beide Packages: MIT. Bei späterer Übernahme von Code bleiben Rechteprüfung und vorhandene Lizenzhinweise erforderlich.
- Ablage: verschlüsselte Textdateien oder ausdrücklich öffentliche JSON-Dateien in Firebase Storage, Metadaten in Firestore.
- Diese Plandateien liegen aktuell unter `/Users/fabian/Workspace/local-firebase-share/plans/`.
- Schritt 01 wird zunächst lokal umgesetzt. Commits, Pushes, Deployments und Veröffentlichung bleiben separate, explizit freizugebende Aktionen.

## Ergebnis der Bestandsaufnahme

Die Ausgangsdateien liegen im Angular-Projekt `decision-bandit`:

- [EncryptionService](../../decision-bandit/src/app/services/encryption/encryption.service.ts): JSON-Verschlüsselung mit AES-GCM-256, PBKDF2-SHA-256 mit 100.000 Iterationen, zufälligem Salt mit 16 Bytes und IV mit 12 Bytes. Das bisherige Format ist `salt.iv.ciphertext`, jeweils Base64-kodiert.
- [ShareService](../../decision-bandit/src/app/services/share/share.service.ts): Upload einer verschlüsselten Datei nach `encrypted_bandits`, Speicherung von `fileid`, `file`, `created` und `uri` in der Collection `encrypted`, anschließender Abruf anhand der Dokument-ID.
- Öffentliches Teilen über `shareBandit` und `getSharedBandit` wird als generische Fähigkeit übernommen, nicht als Bandit-spezifisches Firestore-Schema mit Bullet-Subcollections und separaten Bilddateien.
- [ShareComponent](../../decision-bandit/src/app/pages/bandit/share/share.component.ts): Vorverarbeitung von Bildern und Zusammenführung der Verschlüsselung mit dem Upload.
- [blobImageToBase64DataUrl](../../decision-bandit/src/app/services/bandit/bandit.service.ts): Die Share-Komponente konvertiert das Bandit-Bild und Bilder der Items mit diesem FileReader-Helfer in Data-URLs. Dieses Prinzip wird für beliebig verschachtelte Blobs verallgemeinert; die neue Rückkonvertierung stellt echte Blobs beziehungsweise Files wieder her.
- [ImportComponent](../../decision-bandit/src/app/pages/history/import/import.component.ts): Abruf, Entschlüsselung und anschließender Import in die lokale Historie.
- [HistoryService](../../decision-bandit/src/app/services/history/history.service.ts): Die aktuelle lokale Historie verwendet IndexedDB, nicht LocalStorage. Die beiden Ausgangsservices enthalten selbst keinen Zugriff auf LocalStorage.
- Die [Verschlüsselungstests](../../decision-bandit/src/app/services/encryption/encryption.service.spec.ts) und [Sharing-Tests](../../decision-bandit/src/app/services/share/share.service.spec.ts) prüfen bisher nur die Erstellung der Services, nicht den Daten-Roundtrip.

Die Vorlage [react-hook-indexeddb](../../react-hook-indexeddb/package.json) liefert npm-Scope, Registry, ESM/CJS-Ausgabe, Typdeklarationen, `tsdown`, Vitest und React Testing Library. Der tatsächlich deklarierte Package-Name ist `@fabianmarcus/react-indexeddb-hook`.

Im untersuchten Checkout fehlen der in dessen README erwähnte Publish-Workflow sowie ESLint- und Prettier-Konfigurationen. Diese Angaben werden nicht ungeprüft übernommen; das neue Package erhält eigene Qualitäts- und Release-Konfigurationen.

## Zielarchitektur und MVP

Vier klar getrennte Verantwortungen:

1. Framework-unabhängige JSON-Verschlüsselung über Web Crypto.
2. Gemeinsamer Firebase-Transport mit getrennten Pfaden für verschlüsselte und öffentliche Freigaben.
3. Speicherunabhängiges Teilen und Abrufen von Daten einschließlich Blob-/File-Serialisierung.
4. React-Hook für Aktionen, Ergebnis, Pending-Status und Fehler.

Die ersten drei Verantwortungen liegen ausschließlich im Basis-Package; der React-Adapter enthält nur den Hook und dessen Zustands-/Lifecycle-Verwaltung. Das Basis-Package ist direkt ohne Framework verwendbar. Ein zukünftiger Angular-Adapter könnte denselben öffentlichen Core-Vertrag konsumieren, wird aber jetzt weder angelegt noch veröffentlicht.

```text
packages/core  → @fabianmarcus/local-firebase-share
packages/react → @fabianmarcus/react-local-firebase-share
                 └─ dependency: @fabianmarcus/local-firebase-share
```

Die Host-Anwendung stellt initialisierte `Firestore`- und `FirebaseStorage`-Instanzen bereit. Der Core initialisiert keine Default-App und verwaltet keine Firebase-Anmeldung. `firebase` ist Peer Dependency des Core und auch des React-Adapters, dessen öffentliche Konfiguration Firebase-Instanzen benötigt; beide deklarieren denselben getesteten Bereich. `react` ist nur Peer Dependency des React-Adapters. `react-dom` wird nur für Tests und Beispielanwendung benötigt. Der Core hat keine React-/Angular-Abhängigkeiten, auch nicht in seinen Dev Dependencies.

Der Adapter importiert Core-Funktionen und gemeinsame Typen ausschließlich über `@fabianmarcus/local-firebase-share`. Keine relativen Imports aus dem Core-Source-Verzeichnis, keine Kopie der Geschäftslogik und kein Einbundeln des Core. Beide Packages haben eigene ESM/CJS-Einstiege, Typdeklarationen, README und Paketumfang. Ein zusätzlicher React-Subpfad `./core` ist nicht notwendig.

Die React-API soll enthalten:

- `share(data, password)` → `{ id }`.
- `retrieve(id, password)` → entschlüsselte Daten mit wiederhergestellten Blobs/Files, ohne lokale Schreiboperation.
- `sharePublic(data)` → `{ id }`, ausdrücklich ohne Verschlüsselung.
- `retrievePublic(id)` → öffentliche Daten mit wiederhergestellten Blobs/Files, ohne Passwort und ohne lokale Schreiboperation.
- Status für Teilen und Abrufen sowie `error` und `clearError`.

Konfiguration: Firebase-Instanzen und getrennte Bereiche `encrypted` und optional `public`, jeweils mit Collection-Pfad und Storage-Präfix. Öffentliches Teilen ist ohne explizite Public-Konfiguration deaktiviert. Identische oder überlappende Bereiche werden abgewiesen. Die bisherigen verschlüsselten Defaults bleiben erhalten; neue öffentliche Defaults dürfen nicht die bestehende Bandit-Collection `shared` oder deren Storage-Präfix verwenden. Das Package benötigt weder eine IndexedDB-Datenbank noch eine LocalStorage-Instanz.

Kein optionales Passwort und kein automatischer Wechsel zum öffentlichen Modus: `share` verlangt ein gültiges Passwort; dessen Fehlen ist ein Fehler. Die Public-Aktionen sind explizit getrennt. Öffentlich bedeutet Einzelabruf ohne Passwort beziehungsweise Firebase-Anmeldung, nicht Auflistbarkeit oder Suchbarkeit. Die Host-App erstellt eigene Links und informiert vor der Freigabe über die Offenlegung.

Die Host-App liest vorwiegend Daten aus IndexedDB, beispielsweise über `@fabianmarcus/react-indexeddb-hook`, und übergibt das gewünschte Objekt oder Array an `share`. Nach `retrieve` validiert sie die Daten fachlich und speichert sie bei Bedarf selbst lokal. LocalStorage, SessionStorage und bereits im Speicher befindliche Daten sind ebenso verwendbar. Kein lokaler Speicher wird ersetzt oder automatisch ausgelesen.

Das MVP unterstützt JSON-kompatible Werte sowie Blobs und Files, sowohl direkt als auch beliebig innerhalb von Objekten und Arrays. Beide Modi nutzen dasselbe versionierte JSON-Transportformat. Bei verschlüsselten Freigaben erfolgen Serialisierung vor der Verschlüsselung und Rekonstruktion nach erfolgreicher Entschlüsselung; bei öffentlichen Freigaben nach validiertem JSON-Abruf ohne Kryptografie. Bytes und MIME-Typ sowie bei Files Name und `lastModified` bleiben erhalten. Date, Map und zyklische Strukturen bleiben außerhalb dieses Vertrags und werden explizit abgewiesen.

Wie im Angular-Ablauf werden Binärdaten Base64-kodiert gemeinsam mit dem Objekt verschlüsselt, nicht separat unverschlüsselt hochgeladen. Das erweitert den vorhandenen Ablauf um generische Serialisierung und echte Typwiederherstellung. Der Nachteil sind Speicherbedarf und Kodierungsaufschlag: Base64 für Blobs und nochmals für den Ciphertext vergrößern überwiegend binäre Daten grob auf das 1,78-Fache, zuzüglich Format- und Kryptografie-Overhead. Für das begrenzte MVP ist das einfacher als ein neuer Streaming-/Mehrdateienvertrag.

## Bewusste Grenzen

- Der lokale Speicher bleibt unverändert. Im verschlüsselten Modus wird die übertragene beziehungsweise remote zwischengespeicherte Kopie verschlüsselt; lokale Verschlüsselung und XSS-Schutz werden dadurch nicht bereitgestellt.
- Passwörter werden niemals remote oder zusätzlich lokal persistiert. Im verschlüsselten Modus bleiben Klartext und File-Metadaten aus Firestore, Storage-Metadaten, URLs und Logs ausgeschlossen. Öffentliche Payloads enthalten bewusst lesbare Nutzdaten und File-Metadaten; auch diese werden nicht geloggt.
- Die Sicherheit hängt unter anderem von der Passwortqualität ab. Die öffentlich abrufbare verschlüsselte Datei erlaubt Offline-Passwortversuche.
- Keine automatische Synchronisierung, Konfliktzusammenführung, Bildbearbeitung oder eigene lokale CRUD-Schicht im MVP. Unverschlüsselte öffentliche Freigaben und Blob-/File-Transportkonvertierung sind enthalten; IndexedDB-Anbindung erfolgt durch Komposition mit der Host-App.
- Keine UI-Komponenten, Provider-Pflicht oder Firebase Functions im Package.
- Bestehende Angular-Services werden nicht ungefragt ersetzt. Ein späterer Angular-Adapter könnte die framework-unabhängigen Funktionen verwenden.
- Alte verschlüsselte JSON-Objekte bleiben auch über die speicherunabhängige Abruf-API lesbar. Fachliche Validierung und lokaler Import bleiben Aufgabe der Host-App.
- Bestehende öffentliche Bandit-Dokumente sind wegen ihres Fachschemas nicht über `retrievePublic` lesbar. Deren Migration beziehungsweise ein Angular-Adapter ist kein Bestandteil dieses Plans.
- Alte Data-URL-Strings bleiben unverändert Strings: Ohne Typkennzeichnung darf das Package sie nicht automatisch als Blob interpretieren. Automatische Typwiederherstellung gilt für neu serialisierte Daten.
- Remote-Zwischenspeicherung beinhaltet im MVP keine automatische Löschung, Ablaufzeit oder garantierte Aufbewahrungsdauer. Eine spätere Lifecycle-Funktion benötigt einen eigenen Vertrag und passende Backend-Regeln.
- Die bestehenden Firebase-Regeln erlauben anonymes Erstellen und Einzelabruf, aber kein Listing, Update oder Delete. Das wird als explizites Kompatibilitätsprofil dokumentiert, nicht als allgemeiner Produktionsstandard.
- Ein neues Beispielprofil verlangt authentifizierte Erstellung und erlaubt Einzelabruf zum Teilen anhand der ID. Die Host-App kann dafür auch Firebase Anonymous Auth verwenden. Anmeldung und zusätzliche Missbrauchsbegrenzung bleiben ihre Verantwortung.
- Öffentliche Freigaben erhalten eigene Regeln: authentifiziertes Erstellen und anonymer Einzelabruf, kein Listing/Update/Delete. Eine zufällige ID ist kein Vertraulichkeitsschutz; öffentlich geteilte Kopien lassen sich ohne Lifecycle-Funktion nicht zurückrufen.
- Eine Datei und ein Firestore-Dokument lassen sich nicht gemeinsam atomar schreiben. Teilfehler werden sichtbar gemeldet; eine nicht autorisierte automatische Löschung wird nicht versprochen.

## Umsetzungseinheiten

1. [Repository und Package-Vertrag](01-repository-und-package-vertrag.md)
2. [Framework-unabhängige Verschlüsselung](02-framework-unabhaengige-verschluesselung.md)
3. [Firebase-Transport](03-firebase-transport.md)
4. [Speicherunabhängiger Daten-Roundtrip](04-speicherunabhaengiger-daten-roundtrip.md)
   - [4b Öffentliches Teilen](04b-oeffentliches-teilen.md)
5. [React-Hook](05-react-hook.md)
6. [Beispielanwendung und Integrationstests](06-beispielanwendung-und-integrationstests.md)
7. [GitHub-Packages-Veröffentlichung](07-github-packages-veroeffentlichung.md)

Die Nummern geben eine sinnvolle Reihenfolge an. Tatsächliche Abhängigkeiten stehen in jeder Einheit. Nach jeder Einheit müssen die bis dahin vorhandenen Funktionen ausführbar, testbar und einzeln eincheckbar sein.

## Übergreifende Qualitätsregeln

- Vor jeder Umsetzungseinheit die bereitgestellten und im Ziel-Repository geltenden Instructions prüfen und berücksichtigen. Für die jeweilige Aufgabe passende verfügbare Skills vor Beginn laden und anwenden; deren Geltungsbereich und die geltende Priorität der Anweisungen beachten. Dies gilt ebenso für Tests, Reviews, Dokumentation und Veröffentlichung.
- Alle Pfade in den Dateilisten sind repositoryrelativ. Core-Module und deren Tests liegen unter `packages/core`, React-Module und deren Tests unter `packages/react`. Gemeinsame Integrationstests bleiben unter `tests/`, Beispiele unter `examples/`.
- Ein Verantwortungsmodul pro Datei; Dateiname entspricht der zentralen Funktion, mit benanntem und Default-Export. Der Package-Einstieg bündelt bewusst öffentliche Exports.
- Interne Hilfsfunktionen unterhalb der zentralen Funktion und dem Divider `//--- Interne Modul Funktionen ---`.
- Konstanten im jeweiligen Package unter `src/shared/constants.ts`; Typen unter `src/shared/types`. Gemeinsame Daten-, Konfigurations- und Fehlertypen gehören dem Core; der Hook-Rückgabetyp dem React-Adapter.
- Striktes TypeScript ohne `any` als Datenvertrag. Entschlüsselte externe JSON-Daten werden zunächst als `unknown` behandelt und geprüft.
- Englischer Code, deutsche JSDoc-Kommentare und Tests unter `tests/`, gegliedert nach Produktionsverantwortung.
- Explizite Fehler mit Ursache und maschinenlesbarem Code; keine Erfolgsergebnisse bei fehlgeschlagenen Operationen. Keine Logs mit Nutzdaten oder Passwort.
- Jede Einheit aktualisiert die unmittelbar zugehörige README-Dokumentation und führt die kleinsten passenden Tests sowie Lint, Typecheck und Build aus.
- Vor einem späteren Push wird der Dokumentationsstand geprüft. Commits und Pushes werden nur auf ausdrückliche Anweisung durchgeführt; auf `main` erst nach Warnung und Bestätigung.

## Release-Abnahme

Für den ersten Release werden beide Packages gemeinsam mit derselben Version veröffentlicht; der Adapter deklariert diese konkrete Core-Version ohne Workspace-Protokoll oder lokale Pfade. Core zuerst veröffentlichen und dessen Verfügbarkeit prüfen, dann React. Registry-Verbrauchertests prüfen sowohl eine React-App mit nur dem Adapter als direkter Package-Abhängigkeit als auch einen frameworkfreien Verbraucher mit nur dem Core. Der React-Verbraucher muss den Core transitiv erhalten.

Ein unverbrauchtes Testprojekt muss das tatsächlich veröffentlichte Package aus GitHub Packages installieren, ein Objekt mit eingebettetem Bild-Blob und File aus IndexedDB verschlüsselt übertragen, anhand der ID abrufen und durch die Host-App in der IndexedDB eines zweiten Browserprofils wiederherstellen können. Bytes, MIME-Typ und File-Metadaten werden nach erneutem lokalen Lesen geprüft. Zusätzlich wird ein LocalStorage-String getestet, ohne eine Speicherbindung im Package einzuführen.

Derselbe Datensatz muss über die expliziten Public-Aktionen ohne Passwort und Anmeldung abrufbar sein. Die Abnahme prüft getrennte Firebase-Bereiche, deaktiviertes Public-Sharing ohne Konfiguration und dass ein fehlendes Passwort niemals einen öffentlichen Upload auslöst.

Referenz für Registry-Authentifizierung und Berechtigungen: [GitHub: Working with the npm registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry). Auch öffentliche npm-Packages dieser Registry benötigen Authentifizierung beim Installieren.
