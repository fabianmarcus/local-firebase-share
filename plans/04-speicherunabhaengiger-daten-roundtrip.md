## 4 Speicherunabhängiger Daten-Roundtrip

**Ziel:** Daten einschließlich direkter oder eingebetteter Blobs/Files können unabhängig von ihrem lokalen Speicher verschlüsselt übertragen und typgerecht wieder abgerufen werden.

**Abhängigkeiten:** Einheiten 2 und 3.

**Umsetzung:**

- Framework-unabhängige Aktionen `share(data, password, options)` und `retrieve(id, password, options)` als Grundlage des Hooks implementieren.
- Keine Abhängigkeit von IndexedDB, LocalStorage oder einem bestimmten lokalen Schlüsselmodell einführen. Die Host-App liest ausgewählte Daten und übergibt sie direkt.
- `share` erstellt vor dem ersten asynchronen Schritt einen validierten Snapshot der Objekt-/Array-Struktur. Blob-Bytes werden danach asynchron gelesen; Blobs sind unveränderlich, File-Metadaten werden im Snapshot festgehalten. Nur den fertig serialisierten Snapshot verschlüsseln und hochladen.
- Objekte, Arrays, Strings einschließlich `""`, endliche Zahlen, Booleans, `null`, Blob und File unterstützen. Date, Map, `undefined`, Funktionen, BigInt und zyklische Strukturen explizit abweisen, statt Daten stillschweigend zu verlieren.
- Auf dem bestehenden `blobImageToBase64DataUrl`-Prinzip aufbauen: Binärbytes in Base64 überführen und gemeinsam mit der Objektstruktur verschlüsseln. Keine Beschränkung auf `image`-Felder oder Bandit-Datentypen übernehmen.
- Ein versioniertes, eindeutig typisiertes JSON-Transportformat definieren. Alle Werte als explizite Knotentypen für primitive Werte, Objekte, Arrays, Blob und File kodieren, damit gewöhnliche Nutzobjekte mit markerähnlichen Feldern unverändert bleiben.
- Blob-Knoten enthalten Base64-Bytes und MIME-Typ; File-Knoten zusätzlich Name und `lastModified`. File vor Blob erkennen, da File von Blob erbt. Leere Blobs und leere MIME-Typen sind gültig.
- Binärdaten vorzugsweise mit `Blob.arrayBuffer()` lesen und mit einem getesteten Base64-Helfer kodieren, statt den Angular-FileReader inklusive Typassertion unverändert zu kopieren. Lesefehler explizit melden.
- `retrieve` authentifiziert und entschlüsselt vollständig, prüft die Payload-Kodierung und decodiert ausschließlich das gekennzeichnete neue Transportformat. Bytes und MIME-Typ in `Blob`, zusätzlich Dateimetadaten in `File` rekonstruieren.
- Den Decoder strikt begrenzen und validieren: bekannte Versionen/Knotentypen, gültiges Base64, erlaubte Felder, Metadatentypen, sichere Behandlung von Objektschlüsseln wie `__proto__`, begrenzte Verschachtelung und Gesamtgröße. Keine Dateinamen als Pfade verwenden und keine Data-URLs abrufen.
- Lesbarkeit alter verschlüsselter JSON-Objekte beibehalten. Deren Data-URL-Strings nicht automatisch konvertieren: Sie tragen keine verlässliche Blob-/File-Typinformation. Fachliche Schemavalidierung erfolgt weiterhin in der Host-App.
- Vor Binärlesen Gesamtgröße der Blobs und erwarteten Kodierungsaufschlag prüfen; nach Serialisierung und Verschlüsselung exakte Byte-Limits prüfen. Kein Upload, wenn die vollständige Datei das Limit überschreitet; kein Streaming oder Chunking im MVP.
- Keine Passwortpersistenz, keine lokale Enumeration und keine automatische lokale Schreiboperation. Abruf-Erfolg bedeutet erfolgreiche Entschlüsselung, nicht erfolgreiche lokale Wiederherstellung.
- In der Dokumentation die Komposition mit dem vorhandenen IndexedDB-Hook zeigen: lesen → teilen beziehungsweise abrufen → fachlich validieren → explizit speichern.
- Fehler beim lokalen Lesen und Speichern behandelt die Host-App separat. Sie entscheidet über Überschreiben, ID-Neuvergabe und Transaktionen.

**Dateien:**

- `packages/core/src/shared/share/share.ts`, `retrieve.ts` – vollständige speicherunabhängige Aktionen.
- `packages/core/src/shared/serialization/serializeShareData.ts`, `deserializeShareData.ts` – Snapshot, rekursive Blob-/File-Kodierung und validierte Rekonstruktion.
- `packages/core/src/shared/types/ShareValue.ts`, `SerializedShareData.ts` – öffentlicher Datenvertrag und internes versioniertes Knotenschema.
- `packages/core/src/shared/constants.ts` – Transportversion und begrenzte Größen-/Verschachtelungswerte.
- `packages/core/index.ts` – öffentliche Share-/Retrieve-Aktionen des eigenständig nutzbaren Basis-Packages.
- `serializeShareData` und `deserializeShareData` werden für Einheit 4b intern wiederverwendet, ohne die verschlüsselte API abzuschwächen. Der Serializer liefert eine explizit versionierte Hülle, die beide Modi eindeutig prüfen können.
- `packages/core/tests/shared/share/share.test.ts`, `retrieve.test.ts` – Verhaltensprüfungen.
- `packages/core/tests/shared/serialization/serializeShareData.test.ts`, `deserializeShareData.test.ts` – Binär-Roundtrip und Formatprüfungen.
- `packages/core/README.md` – Datenvertrag, Blob-/File-Unterstützung und frameworkfreie Verwendung; keine React-Beispiele im Core erforderlich.

**Tests:**

- End-to-End innerhalb der Module mit echtem Web Crypto und kontrolliertem Transport: Objekt beziehungsweise Array mit Blobs/Files → Ciphertext → Abruf → gleicher Inhalt und Binärtypen.
- Direkter Blob, direktes File, Bandit-ähnliches Objekt mit Hauptbild und Item-Bildern sowie tief verschachtelte Arrays/Objekte; jedes Byte, MIME-Typ, File-Name und `lastModified` vergleichen.
- Leere Binärdaten, leere MIME-Typen, beliebige Nicht-Bild-Bytes und mehrfach referenzierte Blobs. Inhalt und Typ erhalten; identische Objektidentität wird nicht garantiert.
- Markerähnliche Nutzobjekte, `__proto__`-Schlüssel und normale Data-URL-Strings unverändert erhalten; unbekannte Versionen, ungültige Base64-Daten oder File-Metadaten abweisen.
- Leerer String, Unicode, primitive Werte und `null`; bereits serialisierte Strings bleiben exakt erhalten.
- Nicht unterstützte Werte werden vor Upload abgewiesen. Änderungen an der Eingabe nach Aufruf verändern den serialisierten Snapshot nicht.
- Fehlgeschlagenes Blob-Lesen und Größen-Grenzfälle einschließlich aller Kodierungsaufschläge erzeugen keinen Upload.
- Falsches Passwort, ungültige Remote-Daten, fehlende Dateien und Altformat-Kompatibilität.
- Kein direkter Zugriff auf IndexedDB oder LocalStorage durch irgendeine Core-Aktion.

**Testbarkeit:** Ein Anwender übergibt ein aus IndexedDB gelesenes Objekt mit Bild-Blob und File und erhält es nach Abruf mit ID und Passwort samt ursprünglichen Bytes und Typen zurück. Ein LocalStorage-String funktioniert über dieselbe API.

**Abnahme:** Vollständiger Daten-Roundtrip einschließlich Blob/File ohne Speicherbindung, unverschlüsselte Binär-Uploads oder automatische lokale Schreibzugriffe.
