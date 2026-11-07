## 6 Beispielanwendung und Integrationstests

**Ziel:** Der reale Browser-Roundtrip und die Firebase-Regeln sind unabhängig von `decision-bandit` und `mal-ehrlich` nachgewiesen.

**Abhängigkeiten:** Einheiten 3, 4, 4b und 5.

**Umsetzung:**

- Eine minimale React-Beispielanwendung mit IndexedDB als primärem lokalen Speicher bereitstellen. Sie konsumiert den gebauten React-Adapter mit transitivem Core und den vorhandenen IndexedDB-Hook, nicht interne Source-Dateien.
- Einen minimalen frameworkfreien Browser-Verbraucher ausschließlich mit dem Basis-Package prüfen. Er verwendet dieselben vier Core-Aktionen ohne React, Angular oder Adapter und bestätigt, dass kein Framework-Package installiert oder geladen wird.
- Verbrauchertests außerhalb der Workspace-Auflösung mit beiden gepackten Tarballs durchführen; Core-Imports dürfen nicht durch Source-Aliasse oder Symlinks scheinbar funktionieren. Der Adapter muss seine konkrete Core-Dependency korrekt auflösen.
- Einen Datensatz mit Hauptbild-Blob und eingebetteten Item-Bildern analog zum Angular-Ablauf sowie einem File verwenden. Nach Abruf die rekonstruierten Typen fachlich prüfen und eine Bildvorschau per Object-URL anzeigen; Object-URLs beim Ersetzen und Unmount freigeben.
- Datensatzauswahl, Passwort und Abruf-ID sowie getrennte Aktionen für Abruf und lokalen Import anbieten. Ergebnisse und Fehler zugänglich anzeigen; keine vorgegebenen echten Nutzdaten.
- Einen klar getrennten Public-Bereich mit eigener Freigabeaktion und sichtbarer Offenlegungswarnung anbieten. Kein vorausgewählter öffentlicher Modus; Public-Abruf ohne Passwort im zweiten Browserprofil. Link-/ID-Anzeige muss den Modus kenntlich machen.
- Fachliche Laufzeitvalidierung nach Abruf und vor lokalem Speichern implementieren. Überschreibschutz und gegebenenfalls ID-Neuvergabe gehören zum Beispiel, nicht zum Share-Package.
- Ein kleines zusätzliches LocalStorage-Beispiel zeigt dieselbe API mit einem String. Keine LocalStorage-Pflicht und keine eigene IndexedDB-CRUD-Schicht im Share-Package.
- Lokale Fehler separat behandeln: fehlender Datensatz, gescheitertes Lesen und fehlgeschlagenes Schreiben dürfen keinen erfolgreichen lokalen Import melden. Testbarkeit des Imports an einem abgeschlossenen IndexedDB-Transaction-Commit festmachen, nicht nur an einem Request-Erfolg.
- Für Tests ein eigenes Firebase-Demoprojekt und eigene Emulator-Konfiguration für Firestore, Storage und Auth verwenden. Keine Produktionsregeln ersetzen und keine Emulator-Ports aus dem aktuellen Projekt blind übernehmen.
- Zwei Regelprofile dokumentieren: bestehende anonyme Kompatibilität und empfohlenes authentifiziertes Erstellen. Beide erlauben nur gezielten Abruf, kein Listing/Update/Delete.
- Das Kompatibilitätsprofil gilt für bisherige verschlüsselte Daten, nicht für das alte Bandit-Public-Schema. Neue Public-Regeln erhalten getrennte Collection-/Storage-Matches: authentifiziertes Erstellen, anonymer Einzelabruf, kein Listing/Update/Delete und nur begrenzte `application/json`-Dateien.
- Schema, Pfad, MIME-Typ und verschlüsselte Dateigröße in Regeln beschränken. Verschlüsselung selbst ist durch Firebase-Regeln nicht nachprüfbar.
- Authentifizierung bleibt Host-Verantwortung. Fehlende Anmeldung darf keine automatische Erfolgsvorgabe erhalten; das Beispiel meldet Permission-Fehler verständlich.
- Teilfehler und den Umgang mit verwaisten Dateien dokumentieren. App Check, Kostenbegrenzung und stärkere serverseitige Missbrauchskontrolle als Betreibermaßnahmen erklären, nicht als vom Package garantierten Schutz.
- Bucket-CORS für den Browserdownload dokumentieren. Zusätzlich zum Emulator einmal gegen einen eigens freigegebenen Test-Bucket prüfen; Emulatorerfolg allein belegt Produktions-CORS nicht.
- Beispiel und Test-Harness nicht in den veröffentlichten Tarball aufnehmen.

**Dateien:**

- `examples/react/` – eigenständig startbare Verbraucheranwendung samt README und Package-Konfiguration.
- `examples/core/` – minimales frameworkfreies Browserbeispiel mit direktem Core-Verbrauch.
- `firebase.test.json`, `firestore.test.rules`, `storage.test.rules` – isolierte Emulator-Konfiguration und empfohlenes Profil.
- `tests/fixtures/rules/` – explizites Kompatibilitätsprofil.
- `tests/integration/encryptedLocalShare.test.ts` – tatsächlicher Firebase-Roundtrip mit synthetischen Daten.
- `tests/integration/publicLocalShare.test.ts` – öffentlicher Roundtrip ohne Passwort und ohne Anmeldung beim Lesen.
- `tests/integration/indexedDbComposition.test.ts`, `localStorageComposition.test.ts` – Komposition mit lokalen Speichern ohne Package-Bindung.
- `tests/integration/firestoreRules.test.ts`, `storageRules.test.ts` – Regeln mit erlaubten und abgewiesenen Operationen.
- `tests/package/consumer.test.ts` – beide Tarballs, transitive Core-Auflösung, Export-/Typgrenzen und unterstützte Peer-Versionen.
- `README.md`, `packages/core/README.md`, `packages/react/README.md` – Architektur, Firebase-Einrichtung, jeweilige Installation und Beispiele.

**Tests:**

- Ein Browserprofil liest ein Objekt mit Blobs/Files aus IndexedDB und teilt es; ein zweites ruft es mit ID und Passwort ab und importiert es nach fachlicher Prüfung explizit in seine IndexedDB. Nach abgeschlossenem Commit erneut lesen und Bytes, MIME-Typ, File-Name und `lastModified` vergleichen. Zusätzlich einen LocalStorage-String unverändert übertragen.
- Firestore enthält keine Nutzdaten und kein Passwort; die Storage-Datei enthält keinen Klartext-Testmarker.
- Bilder und Dateimetadaten werden nicht separat unverschlüsselt hochgeladen. Einen alten Angular-Testpayload mit Data-URL-Bildern unverändert lesen; keine automatische Typkonvertierung alter Strings.
- Die beiden vorstehenden Vertraulichkeitsprüfungen gelten für verschlüsselte Freigaben. Public-Payloads enthalten bewusst lesbare Daten und File-Metadaten; deren Blob-/File-Roundtrip ebenfalls bis nach dem IndexedDB-Commit prüfen.
- Anonymer Public-Abruf erlaubt, anonyme Public-Erstellung im empfohlenen Profil abgewiesen; falscher Modus, überlappende Pfade, deaktivierte Public-Konfiguration und fehlendes Passwort führen niemals zu einem Modus-Fallback.
- Falsches Passwort, verweigerte Writes, fehlende Dokumente/Dateien, Überschreibschutz und lokale Schreibfehler.
- Erlaubter Einzelabruf, verweigertes Listing/Update/Delete, Auth-Anforderungen sowie Größenwerte unmittelbar unter, auf und über der festgelegten Grenze.
- ESM/CJS und Typdeklarationen aus dem Tarball; React 18 und eine aktuelle unterstützte React-Version sowie die deklarierten Firebase-Versionen.
- Core-Tarball ohne Framework installieren und importieren; Adapter-Tarball ohne eingebundelten Core testen. Gleiches Datenformat und gleiche Fehlercodes bei direktem Core- und React-Verbrauch belegen.

**Testbarkeit:** Ein Anwender führt das Beispiel mit isolierten Emulatoren aus, teilt einen IndexedDB-Datensatz und stellt ihn in einem zweiten Browserprofil wieder her. Die Firebase-Oberfläche zeigt ausschließlich erlaubte Remote-Daten; IndexedDB bleibt die lokale Datenbank.

**Abnahme:** Realer SDK-/Browser-Roundtrip, Regeln und Paketverbrauch erfolgreich. Produktionstest-CORS ist getrennt dokumentiert und verifiziert.
