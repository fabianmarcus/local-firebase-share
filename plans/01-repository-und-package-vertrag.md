## 1 Repository und Package-Vertrag

**Ziel:** Zwei eigenständige, baubare Packages in einem npm-Workspace-Repository und ein verbindlicher Core-/Adapter-Vertrag stehen bereit.

**Abhängigkeiten:** Keine.

**Umsetzung:**

- Auf explizite Freigabe das Repository `fabianmarcus/local-firebase-share` für `@fabianmarcus/local-firebase-share` und `@fabianmarcus/react-local-firebase-share` erstellen. Sichtbarkeit und Rechte zur Übernahme des Ausgangscodes beziehungsweise dessen Lizenz vor der Veröffentlichung klären. Die MIT-Lizenz der Vorlage allein belegt nicht die Lizenz des Angular-Codes.
- Keine Firebase-Projektkennungen, Zugangsdaten, Build-Ausgaben oder App-Daten aus den Ursprungsprojekten übernehmen.
- Privates Root-Package mit npm Workspaces für `packages/core` und `packages/react` anlegen; das Root selbst wird nicht veröffentlicht. Ein gemeinsames Lockfile, eigene Manifeste/Exports/README-Dateien je Package und Build-Reihenfolge Core vor React.
- Für beide Packages Name, `repository` inklusive `directory`, Registry und ESM/CJS-/Typausgabe mit `tsdown` festlegen. Zunächst gemeinsame Versionierung; React deklariert die konkrete Core-Version als reguläre Dependency, nicht als Peer oder gebündelten Source-Code.
- Core externalisiert Firebase; React externalisiert React, Firebase und das Core-Package. Core deklariert nur Firebase als Peer, React deklariert React und denselben Firebase-Bereich als Peers. Keine React-/Angular-Imports oder Framework-Dev-Dependencies im Core.
- Zwei separate Package-Einstiege statt eines React-Subpfads `./core` vorsehen. Der React-Einstieg erhält bei Bedarf eine vom Build erhaltene `"use client"`-Direktive; der Core niemals. Keine Deep-Imports des Adapters in Core-Interna.
- API und Fehlercodes für Verschlüsselung und speicherunabhängigen Transport festlegen. Keine Dummy-Funktionen mit scheinbar erfolgreichen Rückgabewerten veröffentlichen.
- `share(data, password)` akzeptiert JSON-kompatible Werte und rekursiv eingebettete Blobs/Files; `retrieve(id, password)` liefert geprüfte Daten mit rekonstruierten Binärtypen, keinen ungeprüft als Domänentyp behaupteten generischen Wert. Fachliche Validierung und lokale Schreiboperationen bleiben bei der Host-App. Fehlende Remote-Dokumente werden als `SHARE_NOT_FOUND` gemeldet.
- `sharePublic(data)` und `retrievePublic(id)` ergänzen ausdrücklich öffentliche Freigaben ohne Passwort. Ohne explizite Public-Konfiguration melden sie `PUBLIC_SHARING_DISABLED`. Fehlendes Passwort bei `share` meldet einen Eingabefehler, niemals einen Public-Fallback.
- `FirebaseShareOptions` enthält getrennte Collection-/Storage-Bereiche `encrypted` und optional `public`; gleiche oder überlappende Bereiche sind ungültig. Ein Ergebnis `{ id }` bleibt bereichsspezifisch; die Host-App muss den Modus in ihrem Link-/Importvertrag mitführen.
- Verhalten bei gleichzeitig gestarteten Hook-Aktionen festlegen: Pro Hook ist nur eine Remote-Aktion gleichzeitig zugelassen; weitere Aufrufe werden als `OPERATION_IN_PROGRESS` abgewiesen.
- npm-Scripts für Lint, Typecheck, Build, Unit-Tests und später Integrationstests sowie Lockfile einrichten. Unterstützte React-/Firebase-Versionen zunächst konservativ wählen und vor dem Release testen.

**Dateien:**

- `package.json`, `package-lock.json` – privates Workspace-Root, gemeinsame Scripts und Lockfile.
- `packages/core/package.json`, `packages/react/package.json` – getrennte Metadaten, Peers, Core-Dependency, Exports und Registry.
- `packages/core/index.ts`, `packages/react/index.ts` – öffentliche Einstiegspunkte, zunächst nur verfügbare Typen/Exports.
- `tsconfig.base.json`, `packages/core/tsconfig.json`, `packages/react/tsconfig.json` – TypeScript-Konfigurationen ohne Source-Pfad-Alias über die Package-Grenze.
- `packages/core/tsdown.config.ts`, `packages/react/tsdown.config.ts`, `vitest.config.ts` – separate Builds und passend getrennte Testumgebungen.
- `eslint.config.mjs`, `prettier.config.mjs` – TypeScript-/React-Hooks-Regeln und Importgrenzen.
- `.gitignore`, `.npmrc`, `LICENSE`, `README.md` – Repository-Regeln, Scope-Zuordnung ohne Token und Architektur.
- `packages/core/README.md`, `packages/react/README.md` – packageeigene Dokumentation; geprüfte Lizenz in beide Tarballs aufnehmen.
- `packages/core/src/shared/types/FirebaseShareOptions.ts`, `ShareResult.ts`, `ShareError.ts`, `ShareValue.ts` – gemeinsame öffentliche Core-Typen.
- `packages/react/src/shared/types/UseLocalFirebaseShare.ts` – React-Rückgabetyp, importiert Core-Typen aus dessen Package-Einstieg.
- `tests/package/package.test.ts` – beide Paketmetadaten, Abhängigkeitsgrenzen und Einstiegspunkte.

**Tests:** Beide Gerüste bauen und typechecken; Core vor React. ESM/CJS-Einstiege und Typdeklarationen getrennt prüfen. `npm pack --dry-run` für jedes Workspace-Package darf nur vorgesehene Distributionsdateien enthalten. Ein frameworkfreier Core-Verbraucher darf weder React noch Angular benötigen. Der React-Tarball referenziert den Core per npm-Name und enthält keine Core-Implementierung oder lokalen Workspace-Pfade.

**Testbarkeit:** Ein Anwender kann die beiden lokal gepackten Gerüste in isolierten Verbraucherprojekten importieren: Core ohne Framework, React mit Core als Dependency. Noch keine Datenfreigabe.

**Abnahme:** Gerüst baubar, Tests erfolgreich, API-Vertrag dokumentiert, Repository-/Lizenzfreigaben geklärt.

## Umsetzungsstand

- Die beiden Plan-READMEs wurden im neuen Projekt zusammengeführt: Repository `fabianmarcus/local-firebase-share` und Instructions-/Skills-Regel sind erhalten.
- Workspace-Gerüst, getrennte ESM/CJS-/Typausgaben, öffentliche Typverträge, Fehlerhelfer, ESLint/Prettier und Paketverbrauchertests sind lokal umgesetzt. Sharing-Aktionen und Hook bleiben gemäß den späteren Einheiten unimplementiert.
- Ein lokales Git-Repository ist initialisiert; `origin` zeigt auf das geplante Repository. Keine Commits oder Pushes wurden durchgeführt.
- Das GitHub-Repository wurde vom Anwender erstellt: <https://github.com/fabianmarcus/local-firebase-share>. Der zuvor bestehende Blocker zur Repository-Erstellung ist damit erledigt.
- MIT ist für das Projekt und beide Packages gewählt; identische Lizenztexte liegen im Root und in beiden Packages. Noch kein Angular-Code wurde übernommen; dessen Rechte und Lizenzhinweise sind bei einer späteren Übernahme zu prüfen.
- Die Lizenzklärung als Blocker von Schritt 01 ist erledigt. `prepublishOnly` blockiert weiterhin vorzeitige Veröffentlichung bis zur Implementierung und Release-Abnahme in Schritt 07.
