# @fabianmarcus/react-local-firebase-share

React-Adapter für `@fabianmarcus/local-firebase-share`.

## Aktueller Umfang

Schritt 01 exportiert den geplanten Hook-Vertrag `UseLocalFirebaseShare`, das diskriminierte Ergebnis `UseLocalFirebaseShareResult` und benötigte Core-Typen sowie dessen Fehlercodes. **`useLocalFirebaseShare` wird erst in Schritt 05 implementiert und ist noch kein Export.**

```ts
import { SHARE_ERROR_CODES } from "@fabianmarcus/react-local-firebase-share";
import type { UseLocalFirebaseShare, ShareValue, FirebaseShareOptions } from "@fabianmarcus/react-local-firebase-share";
```

Der Adapter konsumiert Core `0.1.0` als reguläre Dependency und bündelt ihn nicht. React (`^18.0.0 || ^19.0.0`) und Firebase (`~12.9.0`, derselbe Bereich wie im Core) sind Peers. Das Gerüst wird mit React 19 geprüft; ausführbare React-18-/19-Hook-Verhaltenstests folgen mit dem Hook. Angular und `react-indexeddb-hook` sind keine Abhängigkeiten.

## Verbindlicher Zielvertrag

Der künftige Hook erhält `FirebaseShareOptions` und bietet:

- `share(data, password)` und `retrieve(id, password)` für Verschlüsselung.
- `sharePublic(data)` und `retrievePublic(id)` für bewusst öffentliche Daten.
- `is.sharing`, `is.retrieving`, `is.sharingPublic`, `is.retrievingPublic`.
- `result` mit eindeutiger Aktion und Modus, `error` und `clearError()`.

Initial sind Flags `false`, Ergebnis und Fehler `null`. Genau eine Aktion pro Hook darf gleichzeitig laufen; weitere Aufrufe werden mit `OPERATION_IN_PROGRESS` abgewiesen. Methoden setzen den sichtbaren Fehlerzustand und lehnen mit demselben Fehler ab. `clearError` löscht den Fehler, nicht das letzte erfolgreiche Ergebnis.

Unmount oder Konfigurationswechsel invalidiert ausstehende Ergebnisse. Ungültig gewordene Abrufe liefern `OPERATION_ABORTED`, keinen Erfolg für nachgelagerte Schreibaktionen. Ein bereits gestarteter Upload kann trotzdem remote abschließen. Es werden keine Aktionen beim Rendern gestartet und keine Passwörter im React-State gespeichert.

Der Adapter nutzt ausschließlich öffentliche Core-Imports. Geschäftslogik, Firebase-Zugriffe und Binärkonvertierung gehören dem Core. Lokales Lesen/Schreiben und fachliche Prüfung bleiben Aufgabe der Anwendung.

## Ausgabe und Veröffentlichung

ESM und CJS mit getrennten Typdeklarationen. Im aktuellen reinen Vertragsgerüst ist keine `"use client"`-Direktive nötig; sie wird mit dem tatsächlichen Hook samt Build-Prüfung ergänzt.

Nach Veröffentlichung wird nur dieses Adapter-Package ausdrücklich installiert; der Core kommt transitiv mit. Beide benötigen GitHub-Packages-Lesezugriff und stehen unter [MIT](./LICENSE). Veröffentlichung bleibt bis zur Implementierung und Release-Abnahme blockiert. Siehe [Projekt-README](../../README.md) und [Plan](../../plans/README.md).
