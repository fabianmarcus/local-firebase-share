## 5 React-Adapter mit Hook

**Ziel:** React-Anwendungen können den Roundtrip über eine stabile, verständliche Hook-API verwenden.

**Abhängigkeiten:** Einheiten 4 und 4b.

**Umsetzung:**

- `useLocalFirebaseShare(options)` als dünne React-Schicht über `share`, `retrieve`, `sharePublic` und `retrievePublic` implementieren. Der Hook verwaltet keine lokale Datenbank.
- Core-Funktionen und gemeinsame Typen ausschließlich aus `@fabianmarcus/local-firebase-share` importieren. Keine Firebase-Aufruflogik, Kryptografie oder Serialisierung im Adapter duplizieren und nicht auf Core-Source-Dateien zugreifen.
- Core-Aufrufe sind frameworkfreie, unabhängige Promises ohne globalen Pending-State. Parallelitätssperre, React-State und Invalidierung gehören allein dem Adapter; ein zukünftiger Angular-Adapter wäre dafür selbst verantwortlich.
- Die explizite Action bestimmt den Modus; kein optionales Passwort als Modusschalter. Ergebnisse kennzeichnen den Modus, damit gleiche IDs oder veraltete Ergebnisse nicht zwischen Bereichen verwechselt werden. Pending-Flags umfassen alle vier Aktionen.
- Derselbe `ShareValue`-Vertrag umfasst direkte und verschachtelte Blobs/Files. Kein zusätzlicher Bild-Hook und keine Konvertierungspflicht in der Host-App.
- Stabile Action-Referenzen per `useCallback`, definierte Pending-Flags, letztes erfolgreiches Ergebnis sowie `error` und `clearError` bereitstellen.
- Upload und Download laufen ausschließlich nach explizitem Action-Aufruf, nicht automatisch in Effects und niemals beim Rendern.
- Pro Hook nur eine Remote-Aktion gleichzeitig zulassen, ohne Warteschlange. Die Sperre muss auch zwei Aufrufe vor dem nächsten Render erfassen.
- Ein Methodenfehler setzt einen sichtbaren Fehlerzustand und verwirft das Promise mit demselben Fehler. UI-Beispiele behandeln die Ablehnung, statt unhandled Rejections zu erzeugen.
- Veraltete Ergebnisse nach Konfigurationswechsel oder Unmount dürfen keinen aktuellen Hook-State überschreiben. Ein laufender Upload kann trotzdem fertig werden; keine nicht existierende Firebase-Upload-Abbruchgarantie dokumentieren.
- Ein durch Unmount oder Konfigurationswechsel ungültig gewordener Abruf wird mit explizitem Abbruchfehler abgewiesen, statt über sein Promise veraltete Daten an nachgelagerte lokale Schreibschritte zu liefern. Bereits an die Host-App zurückgegebene Daten liegen in deren Verantwortung.
- Passwörter nicht im Hook-State speichern, Aktionen nicht mit Klartext loggen. Nur notwendige Aufrufparameter bis zum Abschluss im Speicher halten.
- SSR-Import und Rendering bleiben möglich, Browseroperationen benötigen einen unterstützten Client. Next.js-Beispiel mit Client Component und durch den Build erhaltenem Client-Einstieg prüfen.

**Dateien:**

- `packages/react/src/useLocalFirebaseShare.ts` – zentrale Hook-Funktion mit benanntem und Default-Export.
- `packages/react/src/shared/types/UseLocalFirebaseShare.ts` – Rückgabetyp auf Basis importierter Core-Typen.
- `packages/react/index.ts` – öffentlicher Hook-Export und benötigte öffentliche Typ-Reexports aus dem Core, keine neue Core-Implementierung.
- `packages/react/package.json` – reguläre Core-Dependency und React-/Firebase-Peers.
- `packages/react/tests/useLocalFirebaseShare.test.ts` – Tests mit React Testing Library.
- `packages/react/tests/package/ssr.test.ts` – Import und serverseitiges Rendering.
- `packages/react/README.md` – Installation des Adapters, React-/Next.js-Beispiele, Status- und Fehlervertrag; Verweis auf das Basis-Package für direkte Funktionen.

**Tests:** Erfolgreiche Aktionen einschließlich eingebetteter Blobs/Files, Pending-Flags während Binärlesen/Verschlüsselung/Upload und Download/Entschlüsselung/Rekonstruktion, Fehlerrücksetzung, stabile Referenzen, zwei gleichzeitige Aufrufe, Strict Mode, Unmount und Konfigurationswechsel während verspäteter Antworten. Ungültig gewordene Abrufe liefern weder neuen State noch ein erfolgreiches Daten-Promise. Der Hook greift auf keinen lokalen Speicher zu.

Für Public-Aktionen dieselben Status-, Fehler- und Invalidierungsprüfungen durchführen. Modusübergreifende parallele Aktionen werden ebenfalls abgewiesen. Fehlendes Passwort erzeugt keine öffentliche Freigabe; deaktivierte Public-Konfiguration bleibt als Fehler sichtbar.

**Testbarkeit:** Eine kleine React-Ansicht zeigt während der Aktion einen Pending-Status, danach die Abruf-ID beziehungsweise abgerufene Daten mit rekonstruierten Blobs/Files. Falsches Passwort erscheint als Fehler; Rendern allein erzeugt keine Firebase-Anfragen.

**Abnahme:** React-Verhalten einschließlich Nebenläufigkeit, SSR und Request-Invalidierung nachgewiesen.
