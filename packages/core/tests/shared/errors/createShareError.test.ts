import { describe, expect, it } from "vitest";
import { SHARE_ERROR_CODES } from "../../../src/shared/constants";
import { createShareError } from "../../../src/shared/errors/createShareError";

describe("createShareError", () => {
  /** Prüft Fehlercode, Nachricht und unveränderte Ursache. */
  it("preserves the error code, message and cause", () => {
    const cause = new Error("Firestore write failed");
    const error = createShareError(SHARE_ERROR_CODES.METADATA_WRITE_FAILED, "Could not store metadata", { cause });

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Could not store metadata");
    expect(error.code).toBe("METADATA_WRITE_FAILED");
    expect(error.cause).toBe(cause);
    expect(error).not.toHaveProperty("storagePath");
  });

  /** Prüft den sichtbaren Teilzustand nach einem erfolgreichen Upload. */
  it("includes an uploaded storage path when supplied", () => {
    const error = createShareError(SHARE_ERROR_CODES.METADATA_WRITE_FAILED, "Could not store metadata", {
      storagePath: "encrypted_bandits/test.txt",
    });

    expect(error.storagePath).toBe("encrypted_bandits/test.txt");
  });

  /** Prüft, dass optionale Zusatzinformationen nicht erforderlich sind. */
  it("creates an error without options", () => {
    const error = createShareError(SHARE_ERROR_CODES.INVALID_INPUT, "A password is required");

    expect(error.code).toBe("INVALID_INPUT");
    expect(error.cause).toBeUndefined();
    expect(error).not.toHaveProperty("storagePath");
  });
});
