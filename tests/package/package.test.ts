import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import root from "../../package.json";
import core from "../../packages/core/package.json";
import react from "../../packages/react/package.json";

const ROOT = resolve(import.meta.dirname, "../..");
const MANIFESTS = [core, react];

describe("workspace package contracts", () => {
  /** Prüft Namen, Versionen und die reguläre transitive Core-Abhängigkeit. */
  it("uses one version and a concrete core dependency", () => {
    expect(root.private).toBe(true);
    expect(root.workspaces).toEqual(["packages/core", "packages/react"]);
    expect(core.name).toBe("@fabianmarcus/local-firebase-share");
    expect(react.name).toBe("@fabianmarcus/react-local-firebase-share");
    expect(react.version).toBe(core.version);
    expect(react.dependencies["@fabianmarcus/local-firebase-share"]).toBe(core.version);
    expect(core.peerDependencies.firebase).toBe(react.peerDependencies.firebase);
    expect(Object.keys(core.devDependencies)).toEqual(["firebase"]);
    expect(Object.keys(core.peerDependencies)).toEqual(["firebase"]);
  });

  /** Prüft echte Distributionsdateien hinter allen Exportbedingungen. */
  it("provides separate ESM, CJS and declaration files", () => {
    for (const manifest of MANIFESTS) {
      const directory = resolve(ROOT, manifest.repository.directory);
      const exports = manifest.exports["."];

      for (const file of [
        exports.import.default,
        exports.import.types,
        exports.require.default,
        exports.require.types,
      ]) {
        expect(existsSync(resolve(directory, file)), file).toBe(true);
      }
      expect(exports.import.default).toBe(manifest.module);
      expect(exports.require.default).toBe(manifest.main);
      expect(exports.import.types).toBe(manifest.types);
      expect(Object.keys(manifest.exports)).toEqual(["."]);
      expect(manifest.publishConfig.registry).toBe("https://npm.pkg.github.com");
      expect(manifest.repository.url).toBe("git+https://github.com/fabianmarcus/local-firebase-share.git");
    }
  });

  /** Prüft, dass der Adapter den Core nicht einbundelt. */
  it("retains public core imports in the React distribution", () => {
    const directory = resolve(ROOT, react.repository.directory);
    const esm = readFileSync(resolve(directory, react.module), "utf8");
    const cjs = readFileSync(resolve(directory, react.main), "utf8");
    const declarations = readFileSync(resolve(directory, react.types), "utf8");

    expect(esm).toContain("@fabianmarcus/local-firebase-share");
    expect(cjs).toContain("@fabianmarcus/local-firebase-share");
    expect(declarations).toContain("@fabianmarcus/local-firebase-share");
    expect(esm).not.toContain("METADATA_WRITE_FAILED");
    expect(cjs).not.toContain("METADATA_WRITE_FAILED");
    expect(declarations).not.toMatch(/\.\.\/.*core|packages\/core|src\/shared/);
  });

  /** Prüft die Paketumfangsliste ohne ein Package zu veröffentlichen. */
  it("packs only distribution files, documentation, license and manifest", () => {
    for (const manifest of MANIFESTS) {
      const output = execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
        cwd: resolve(ROOT, manifest.repository.directory),
        encoding: "utf8",
      });
      const results: unknown = JSON.parse(output);
      expect(Array.isArray(results)).toBe(true);
      if (!Array.isArray(results)) throw new Error("Invalid npm pack output");
      const result: unknown = results[0];
      if (typeof result !== "object" || result === null || !("files" in result) || !Array.isArray(result.files)) {
        throw new Error("Missing file list in npm pack output");
      }
      const paths = result.files.map((entry: unknown) => {
        if (typeof entry !== "object" || entry === null || !("path" in entry) || typeof entry.path !== "string") {
          throw new Error("Invalid npm pack file entry");
        }
        return entry.path;
      });
      expect(paths).toEqual(expect.arrayContaining(["README.md", "LICENSE", "package.json"]));
      expect(
        paths.every((path) => path.startsWith("dist/") || ["README.md", "LICENSE", "package.json"].includes(path)),
      ).toBe(true);
    }
  });

  /** Prüft übereinstimmende MIT-Lizenzen im Root und in beiden Packages. */
  it("includes the same MIT license in both packages", () => {
    const license = readFileSync(resolve(ROOT, "LICENSE"), "utf8");
    expect(root.license).toBe("MIT");
    expect(license).toContain("MIT License");
    expect(license).toContain("Copyright (c) 2026 Fabian Marcus");
    for (const manifest of MANIFESTS) {
      expect(manifest.license).toBe("MIT");
      expect(readFileSync(resolve(ROOT, manifest.repository.directory, "LICENSE"), "utf8")).toBe(license);
    }
  });

  /** Prüft die verbleibende Releasesperre über die echte npm-Lifecycle-Ausführung. */
  it("blocks publishing before implementation and release validation", () => {
    for (const manifest of MANIFESTS) {
      expect(() =>
        execFileSync("npm", ["run", "prepublishOnly", "--workspace", manifest.name], { cwd: ROOT, stdio: "pipe" }),
      ).toThrow(/implementation and release validation are not complete/);
    }
  });
});
