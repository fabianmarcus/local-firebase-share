import { join } from "node:path";
import { execFileSync } from "node:child_process";

/**
 * Packt ein gebautes Package für einen isolierten lokalen Verbrauchertest.
 * @param directory Aufgelöstes Package-Verzeichnis.
 * @param destination Bereits angelegtes temporäres Zielverzeichnis.
 * @returns Absoluter Pfad des von npm erzeugten Tarballs.
 */
export function packPackage(directory: string, destination: string): string {
  const output = execFileSync("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", destination], {
    cwd: directory,
    encoding: "utf8",
  });
  const result: unknown = JSON.parse(output);
  if (!Array.isArray(result)) throw new Error("Invalid npm pack output");
  const entry: unknown = result[0];
  if (typeof entry !== "object" || entry === null || !("filename" in entry) || typeof entry.filename !== "string") {
    throw new Error("Missing npm package filename");
  }
  return join(destination, entry.filename);
}

export default packPackage;
