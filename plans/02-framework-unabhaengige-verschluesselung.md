## 2 Framework-unabhängige Verschlüsselung

**Ziel:** JSON-Werte lassen sich ohne Angular oder React zuverlässig verschlüsseln und entschlüsseln.

**Abhängigkeiten:** Einheit 1.

**Umsetzung:**

- Logik des EncryptionService in reine asynchrone Funktionen überführen; keine Angular-DI und kein direktes `window` in der Kryptologik.
- AES-GCM-256, zufälliges Salt mit 16 Bytes und IV mit 12 Bytes beibehalten. Schlüssel bleiben nicht exportierbar.
- Für neue Daten ein versioniertes Format mit eindeutig festgelegtem Algorithmus, KDF-Parametern und Base64-Feldern definieren. Manipulation sicherheitsrelevanter Headerdaten durch GCM-authentifizierte Zusatzdaten oder einen gleichwertig fest definierten Vertrag erkennen.
- Eine authentifizierte Kennzeichnung der Payload-Kodierung vorsehen: reines JSON oder das Blob-/File-Transportformat aus Einheit 4. Nur die explizite Kennzeichnung aktiviert dessen Decoder; normale JSON-Objekte dürfen nicht durch zufällig passende Felder als Transporthülle interpretiert werden.
- Für Version 1 zunächst PBKDF2-SHA-256 mit 600.000 Iterationen planen und auf Zielbrowsern messen. Den finalen Parameter vor dem ersten Release festschreiben; spätere Änderungen benötigen eine Formatversion.
- Unversionierte Altwerte `salt.iv.ciphertext` ausschließlich mit den bisherigen 100.000 Iterationen lesen. Kein stiller Rückfall auf das Altformat bei einer fehlerhaften neuen Version.
- Segmente, Base64, Version, Salt-/IV-Längen und Mindestlänge des authentifizierten Ciphertexts streng prüfen. KDF-Parameter nicht unbegrenzt aus fremden Eingaben übernehmen.
- JSON-Typen sauber definieren. Nicht darstellbare Werte wie `undefined`, `BigInt` oder zyklische Strukturen explizit zurückweisen; keine unbemerkte Datenveränderung als gültigen Roundtrip ausgeben.
- `encryptJson` und `decryptJson` bleiben JSON-Kryptofunktionen. Blob-/File-Unterstützung wird in Einheit 4 durch Vor- und Nachverarbeitung ergänzt, nicht durch direktes `JSON.stringify` auf Binärtypen.
- Fehlendes Web Crypto beziehungsweise ein nicht unterstützter Browser führt zu einem expliziten Fehler bei Aufruf, nicht bereits beim Import.
- Falsches Passwort und manipulierte Daten liefern einen Entschlüsselungsfehler, niemals Teilklartext oder ein leeres Erfolgsobjekt.

**Dateien:**

- `packages/core/src/shared/crypto/encryptJson.ts`, `decryptJson.ts` – zentrale Kryptofunktionen.
- `packages/core/src/shared/constants.ts` – Versions-, KDF-, Salt-, IV- und Größenkonstanten.
- `packages/core/src/shared/types/JsonValue.ts`, `EncryptedPayload.ts` – Daten- und Formattypen.
- `packages/core/index.ts` – öffentliche Kryptofunktionen und Typen des Basis-Packages.
- `packages/core/tests/shared/crypto/encryptJson.test.ts`, `decryptJson.test.ts` – Roundtrip- und Fehlerfälle.
- `packages/core/tests/fixtures/legacy-encrypted-payload.json` – reproduzierbarer Altformat-Testvektor mit ausschließlich synthetischen Daten.
- `packages/core/README.md` – Format, Passwortanforderungen, Browserbedingungen und Kompatibilität.

**Tests:**

- Objekte, Arrays, primitive Werte, `null`, Unicode und leere Strings korrekt rekonstruieren.
- Gleiche Eingabe mit gleichem Passwort erzeugt verschiedene Ciphertexte.
- Falsches Passwort, manipuliertes Salt/IV/Ciphertext/Header, zusätzliche Segmente und unbekannte Version abweisen.
- Altformat anhand eines unabhängig mit der Ausgangslogik erzeugten Testvektors entschlüsseln.
- Browserimport und serverseitiger Import ohne `window` funktionieren; Operationen ohne Web Crypto scheitern nachvollziehbar.

**Testbarkeit:** Ein Anwender kann im Browser ein synthetisches JSON-Objekt verschlüsseln und mit demselben Passwort exakt entschlüsseln; mit einem anderen Passwort schlägt der Vorgang fehl.

**Abnahme:** Verifizierter Roundtrip und Altformat-Lesbarkeit; neue Daten verwenden nur das festgelegte versionierte Format.
