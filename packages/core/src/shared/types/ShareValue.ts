/** Unterstützte primitive Werte; Zahlen müssen zur Laufzeit endlich sein. */
export type ShareValuePrimitive = string | number | boolean | null;

/** Rekursives Datenobjekt ohne Klasseninstanzen oder zyklische Referenzen. */
export type ShareValueObject = { [key: string]: ShareValue };

/** Speicherunabhängiger Datenvertrag mit direkten und eingebetteten Blobs/Files. */
export type ShareValue = ShareValuePrimitive | ShareValueObject | ShareValue[] | Blob | File;
