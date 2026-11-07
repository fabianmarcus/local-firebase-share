# local-firebase-share

Framework-unabhängiger Core und React-Adapter für das Teilen lokal vorhandener Browserdaten über Firebase.

## Stand: Schritt 01

Das Workspace-Gerüst, die öffentlichen Typverträge und ein Fehlerhelfer sind vorhanden. Verschlüsselung, Blob-Serialisierung, Firebase-Transport und React-Hook sind **noch nicht implementiert**. Es werden keine Dummy-Sharing-Funktionen exportiert.

Das Projekt und beide Packages stehen unter der [MIT-Lizenz](./LICENSE). Es wurde noch kein Angular-Code übernommen; bei späterer Übernahme sind Rechte und vorhandene Lizenzhinweise zu prüfen. Ein `prepublishOnly`-Guard blockiert weiterhin vorzeitige Veröffentlichung, bis Implementierung und Release-Abnahme aus Schritt 07 abgeschlossen sind.

Das lokale Git-Repository ist initialisiert und `origin` für `fabianmarcus/local-firebase-share` vorbereitet. Das GitHub-Repository wurde vom Anwender erstellt; es wurden keine Commits oder Pushes vorgenommen.

## Packages

- [Core](./packages/core/README.md): `@fabianmarcus/local-firebase-share`, unabhängig von React und Angular.
- [React-Adapter](./packages/react/README.md): `@fabianmarcus/react-local-firebase-share`, mit konkreter Core-Version als regulärer Dependency.

Beide liegen im Repository `fabianmarcus/local-firebase-share`. Das Root-Package ist privat und wird nicht veröffentlicht. Zunächst werden beide Packages gemeinsam versioniert; der Core wird vor dem React-Adapter veröffentlicht. Angular ist nur eine spätere Erweiterungsmöglichkeit.

## Entwicklung

Node.js 22.18+, 24.11+ oder 26+ und npm mit Workspaces verwenden:

```bash
npm ci
npm run build
npm run typecheck
npm run lint
npm run test
```

`build` baut zuerst den Core, dann React. `test` baut vor den Pakettests neu. ESLint und Prettier sind eingerichtet; `npm run format` formatiert die Projektdateien. Vorhandene Copilot- und VS-Code-Konfigurationen werden nicht umgeschrieben.

Beide Packages erzeugen ESM, CJS und zugehörige Typdeklarationen. Externe Peers werden nicht gebündelt. Package-Tests prüfen Exports, Verträge, übereinstimmende MIT-Lizenzen, Releasesperre, Paketumfang und isolierte Verbraucher.

Die Tests installieren lokale Tarballs in temporäre Projekte außerhalb der Workspaces und prüfen ESM-/CJS-Imports sowie beide Typauflösungen. Ein lokaler npm-Override ersetzt nur die noch unveröffentlichte transitive Core-Version; ein echter Registry-Installationstest folgt in Schritt 07.

Der aktuelle npm-Audit meldet 14 betroffene Abhängigkeiten (10 moderate, 4 hohe Einstufungen) in den Firebase-/gRPC- und ESLint-/minimatch-Ketten. Es wurde kein riskantes `audit fix --force` oder ungetesteter Dependency-Override angewendet. Diese Meldungen müssen vor dem Release erneut bewertet und behoben werden; der Core bündelt Firebase nicht, die Host-App stellt es als Peer bereit.

## Geplanter Datenfluss

Die Anwendung liest selbst aus IndexedDB, LocalStorage oder anderem lokalen Speicher. Der Core teilt die übergebenen Werte verschlüsselt oder ausdrücklich öffentlich und ruft sie wieder ab. Die Anwendung validiert den fachlichen Inhalt und schreibt selbst lokal.

Unterstützt werden künftig JSON-kompatible Werte sowie direkte oder verschachtelte Blobs/Files. Date, Map, zyklische Strukturen und andere nicht unterstützte Werte werden abgewiesen. Die vollständigen Verträge, Sicherheitsgrenzen und Umsetzungseinheiten stehen im [zusammengeführten Plan](./plans/README.md).

## Registry

Beide Packages sind für GitHub Packages unter dem Scope `@fabianmarcus` vorbereitet, aber noch nicht veröffentlicht. `.npmrc` enthält nur die Registry-Zuordnung, keinen Token.

Nach Implementierung und Veröffentlichung benötigt eine Installation einen PAT classic mit mindestens `read:packages` beziehungsweise passenden Actions-Zugriff auf **beide** Packages. Tokens gehören in die Benutzerkonfiguration oder CI-Umgebung, niemals in Browsercode oder versionierte Dateien.
