## 7 GitHub-Packages-Veröffentlichung

**Ziel:** Basis-Package und React-Adapter lassen sich in korrekter Reihenfolge reproduzierbar im persönlichen GitHub-Scope veröffentlichen und installieren.

**Abhängigkeiten:** Einheit 6 und die Repository-/Lizenzfreigaben aus Einheit 1.

**Umsetzung:**

- `publishConfig.registry` auf `https://npm.pkg.github.com` setzen; npm-Scope und Repository-Link müssen zu `fabianmarcus` passen.
- Namen `@fabianmarcus/local-firebase-share` und `@fabianmarcus/react-local-firebase-share`, gemeinsames Repository `fabianmarcus/local-firebase-share`, jeweiliges `repository.directory` und Hook-Export `useLocalFirebaseShare` konsistent prüfen.
- Eigenen CI-Workflow mit deterministischem `npm ci`, Lint, Typecheck, Build, Unit-, Integrations- und Paketverbrauchertests anlegen.
- Eigenen Publish-Workflow analog zur dokumentierten Vorlage erstellen: GitHub Release mit Ereignis `published` und optional manueller Start.
- Release-Tag, Package-Version und ausgecheckten Commit abgleichen. Manueller Start verlangt ebenfalls eine eindeutig gewählte Version beziehungsweise einen Release-Tag.
- Für das MVP gemeinsame Versionierung: Release-Tag `vX.Y.Z` entspricht beiden Package-Versionen und der konkreten Core-Dependency des Adapters. Kein `workspace:*`, `file:` oder Root-Package im veröffentlichten Manifest.
- Core zuerst veröffentlichen und dessen Registry-Verfügbarkeit prüfen, erst danach React veröffentlichen. Beide Distributionspakete aus demselben geprüften Commit bauen; Core darf nicht in den React-Tarball gebündelt sein.
- Veröffentlichung ist nicht atomar: Scheitert React nach erfolgreichem Core-Publish, den Teilzustand sichtbar als fehlgeschlagen melden. Ein erneuter Workflow prüft existierende Versionen samt vorgesehenem Release-Commit und veröffentlicht nur das fehlende, bereits geprüfte Package. Bei abweichender Herkunft abbrechen; keine Version überschreiben oder unbemerkt überspringen.
- Nur nach allen Qualitätsprüfungen veröffentlichen. CI grundsätzlich mit `contents: read`; ausschließlich der Publish-Job zusätzlich mit `packages: write`.
- In Actions mit dem repositorygebundenen `GITHUB_TOKEN` authentifizieren, bereitgestellt als `NODE_AUTH_TOKEN`. Keine langfristigen Publish-Tokens im Repository.
- `.npmrc` enthält nur Scope-Zuordnung und gegebenenfalls eine Umgebungsvariable, niemals einen echten Token.
- Paketumfang vor Veröffentlichung erneut prüfen. Keine Source-Fixtures, Demo-Daten, Firebase-Konfigurationen oder unbeabsichtigten privaten Dateien ausliefern.
- Erste Veröffentlichung beispielsweise als `0.1.0`; SemVer und Changelog verwenden. Veröffentlichte Versionsnummern nicht erneut verwenden.
- GitHub-Package-Sichtbarkeit und Zugriffsvererbung ausdrücklich prüfen. Die erste Veröffentlichung ist standardmäßig privat; `publishConfig.access: public` ersetzt nicht die Prüfung der GitHub-Package-Einstellungen.
- Sichtbarkeit, Repository-Verknüpfung und Consumer-Actions-Zugriff für beide Packages prüfen. Berechtigungen auf den Adapter allein reichen nicht für dessen transitive Core-Abhängigkeit.
- Repository- und Package-Sichtbarkeit vor der öffentlichen Freigabe bestätigen lassen.
- Installationsdokumentation mit PAT classic und mindestens `read:packages` für lokale Nutzer. Auch öffentliche npm-Packages auf GitHub Packages benötigen Authentifizierung.
- Für andere Consumer-Repositories deren Actions-Zugriff auf das Package explizit gewähren; deren `GITHUB_TOKEN` hat nicht automatisch Zugriff.

**Dateien:**

- `.github/workflows/ci.yml` – Qualitätsprüfungen und Emulator-Tests.
- `.github/workflows/publish-package.yml` – versionierter Release-Publish mit minimalen Berechtigungen.
- `package.json`, `.npmrc` – privates Workspace-Root, Release-Scripts und Auth-Konfiguration ohne Secrets.
- `packages/core/package.json`, `packages/react/package.json` – Registry, Paketumfang, gleichzeitige Versionen und konkrete Core-Dependency.
- `README.md`, `packages/core/README.md`, `packages/react/README.md` – getrennte Installation, Tokenrechte, Firebase-Einrichtung, API und Release-Verfahren.
- `CHANGELOG.md` – gemeinsamer Release mit expliziten Änderungen an Core beziehungsweise Adapter.
- `tests/package/releaseContract.test.ts` – Paketname, Registry, Repository-Zuordnung und Exportvertrag.

**Geplante Installation beim Verbraucher:**

```ini
@fabianmarcus:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

```bash
npm install @fabianmarcus/react-local-firebase-share
```

Der React-Verbraucher installiert nur den Adapter ausdrücklich; dessen Basis-Package wird transitiv installiert. React und Firebase werden als passende Peers von der Host-App bereitgestellt. Direkte frameworkfreie Nutzung:

```bash
npm install @fabianmarcus/local-firebase-share
```

Angular wird weder installiert noch veröffentlicht.

Der Verbraucher setzt `NODE_AUTH_TOKEN` außerhalb versionierter Dateien. Für Read-only-Installationen genügt das entsprechend berechtigte Lesetoken; es wird niemals in Browsercode eingebunden.

**Tests:** CI auf dem Release-Commit erfolgreich; Tag-/Versions-/Dependency-Abweichung blockiert Publish. Nach Veröffentlichung in zwei frischen Projekten exakt veröffentlichte Versionen installieren: Core ohne Framework sowie Adapter mit transitivem Core. In beiden den jeweiligen Browser-Roundtrip aus Einheit 6 wiederholen. Publish-Reihenfolge und sichtbare, wiederaufnehmbare Teilfehler prüfen.

Die Registry-Abnahme umfasst beide Modi einschließlich Blobs/Files, getrennte Firebase-Bereiche und das Fehlen eines automatischen Public-Fallbacks. Öffentliche npm-Package-Sichtbarkeit und öffentliche Datenfreigaben sind unabhängige Einstellungen und werden in der README getrennt erklärt.

**Testbarkeit:** Ein berechtigter Anwender kann das veröffentlichte Package anhand der README in ein neues React-Projekt installieren und damit einen Testwert teilen und wiederherstellen.

**Abnahme:** Beide Packages mit korrekter Repository-Verknüpfung und bestätigter Sichtbarkeit auf GitHub sichtbar; direkte Core-Nutzung sowie React-Nutzung mit transitiver Core-Auflösung aus der Registry erfolgreich.
