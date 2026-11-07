## 4b Öffentliches Teilen

**Ziel:** Daten einschließlich Blobs/Files lassen sich ausdrücklich unverschlüsselt speichern und anhand einer ID öffentlich abrufen.

**Abhängigkeiten:** Einheiten 3 und 4.

**Umsetzung:**

- Die Fähigkeit von Angulars `shareBandit` und `getSharedBandit` in `sharePublic(data, options)` und `retrievePublic(id, options)` übertragen. Keine Bandit-Felder, Bullet-Subcollections oder separaten Bild-Uploads übernehmen.
- Dieselbe Snapshot-/Blob-/File-Serialisierung und validierte Rekonstruktion aus Einheit 4 verwenden. Keine Kopie der Konvertierungslogik.
- Die versionierte Transporthülle als `application/json` in einem eigenen Storage-Präfix ablegen; Firestore enthält nur Datei-Metadaten. Kein Passwort, keine KDF und keine Verschlüsselung.
- Die gemeinsame Transportmechanik aus Einheit 3 verwenden. Öffentliche Datei-Metadaten haben denselben Kernvertrag, werden aber mit eigener Collection und eigenem Storage-Präfix geprüft.
- Public-Sharing nur bei expliziter Konfiguration erlauben. Getrennte Beispieldefaults etwa `public-shares` und `public_share_payloads`; weder die bisherige öffentliche Bandit-Struktur noch verschlüsselte Bereiche wiederverwenden.
- Kein automatisches Erkennen oder Ausprobieren des anderen Modus bei ungültigen IDs, fehlenden Dokumenten oder Decoderfehlern.
- Abruf ohne Anmeldung erlauben; Erstellung im empfohlenen Regelprofil nur authentifiziert. Öffentlichkeit ist keine Liste und kein Geheimnis hinter einer zufälligen ID.
- JSON-Parser, Knotendecoder, Byte-Limits und Verschachtelungsgrenzen vor Ergebnisrückgabe prüfen. Beide Modi haben dieselbe vollständige Dateigrößenobergrenze; im Public-Modus entfällt die zusätzliche Ciphertext-Base64-Schicht.
- Schema-Prüfung bietet keinen kryptografischen Herkunftsnachweis. Daten niemals als HTML ausführen oder automatisch in lokale Datenbanken importieren.
- Teilfehler nach Upload genauso sichtbar melden wie beim verschlüsselten Modus. Keine unimplementierte Rückruf-, Delete- oder Ablaufgarantie.
- URL-Erstellung, Warnung vor Offenlegung und fachliche Schemavalidierung bleiben bei der Host-App. Die README zeigt eine bewusste Public-Aktion, keinen Standard-Upload aller lokalen Daten.
- Alte öffentliche Angular-Bandits benötigen einen separat geplanten Fachadapter; der generische neue Abruf verspricht keine Schemakompatibilität.

**Dateien:**

- `packages/core/src/shared/share/sharePublic.ts`, `retrievePublic.ts` – öffentliche Aktionen.
- `packages/core/src/shared/firebase/saveSharePayload.ts`, `getSharePayload.ts` – gemeinsame Mechanik um Public-MIME-/Bereichsverwendung ergänzen, falls nötig.
- `packages/core/src/shared/types/FirebaseShareOptions.ts`, `ShareResult.ts`, `ShareError.ts` – Public-Konfiguration und Fehlervertrag.
- `packages/core/src/shared/constants.ts` – separate Public-Beispielpfade und MIME-Typ.
- `packages/core/index.ts` – explizite Public-Exports neben `share` und `retrieve`.
- `packages/core/tests/shared/share/sharePublic.test.ts`, `retrievePublic.test.ts` – Roundtrip, Grenzen und Modustrennung.
- `packages/core/README.md` – öffentlich versus verschlüsselt, lesbare Payloads, fehlende Rückrufgarantie und URL-Verantwortung.

**Tests:** Objekte, Arrays, direkte und eingebettete Blobs/Files einschließlich Byte-/MIME-/File-Metadaten-Roundtrip. Public-Aktionen rufen keine Kryptofunktionen auf. Deaktivierte oder überlappende Public-Konfiguration, ungültige Hüllen, fehlende Dateien und Größen-Grenzfälle scheitern explizit. Keine Abfragen oder Uploads im Encrypted-Bereich; kein Public-Upload bei fehlendem Passwort in `share`.

**Testbarkeit:** Ein Anwender teilt bewusst einen synthetischen Datensatz öffentlich. Ein zweites Browserprofil kann ihn ohne Passwort abrufen; die Public-Datei ist in Firebase lesbar. Verschlüsselte Freigaben bleiben davon getrennt.

**Abnahme:** Öffentlicher Daten-Roundtrip einschließlich Blob/File, getrennte Pfade und Regeln sowie dokumentierte bewusste Offenlegung.
