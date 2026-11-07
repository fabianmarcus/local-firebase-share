import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { packPackage } from "./packPackage";
import coreManifest from "../../packages/core/package.json";
import reactManifest from "../../packages/react/package.json";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";

const ROOT = resolve(import.meta.dirname, "../..");
const CORE = "@fabianmarcus/local-firebase-share";
const REACT = "@fabianmarcus/react-local-firebase-share";

describe("isolated package consumers", () => {
  /** Prüft beide Tarballs außerhalb von npm Workspaces, einschließlich transitiver Core-Auflösung. */
  it("imports packed contracts in ESM and CJS without source aliases", () => {
    const temporary = mkdtempSync(join(tmpdir(), "local-firebase-share-consumer-"));
    try {
      const coreTarball = packPackage(join(ROOT, "packages/core"), temporary);
      const reactTarball = packPackage(join(ROOT, "packages/react"), temporary);
      for (const adapter of [false, true]) {
        const directory = join(temporary, adapter ? "react-consumer" : "core-consumer");
        mkdirSync(directory);
        // Der lokale Override ersetzt nur die noch nicht veröffentlichte Registry-Version.
        const manifest = adapter
          ? { dependencies: { [REACT]: `file:${reactTarball}` }, overrides: { [CORE]: `file:${coreTarball}` } }
          : { dependencies: { [CORE]: `file:${coreTarball}` } };
        const dependencies = {
          ...manifest.dependencies,
          firebase: coreManifest.devDependencies.firebase,
          ...(adapter ? { react: reactManifest.devDependencies.react } : {}),
        };
        writeFileSync(join(directory, "package.json"), JSON.stringify({ private: true, ...manifest, dependencies }));
        execFileSync(
          "npm",
          ["install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund", "--package-lock=false"],
          { cwd: directory, stdio: "pipe" },
        );
        const name = adapter ? REACT : CORE;
        for (const mode of ["module", "commonjs"]) {
          const importCode =
            mode === "module"
              ? `import * as api from ${JSON.stringify(name)};`
              : `const api = require(${JSON.stringify(name)});`;
          const output = execFileSync(
            process.execPath,
            ["--input-type", mode, "-e", `${importCode} console.log(JSON.stringify(Object.keys(api).sort()));`],
            { cwd: directory, encoding: "utf8" },
          );
          expect(JSON.parse(output)).toEqual(
            adapter ? ["SHARE_ERROR_CODES"] : ["SHARE_ERROR_CODES", "createShareError"],
          );
        }
        expect(existsSync(join(directory, "node_modules/react"))).toBe(adapter);
        expect(existsSync(join(directory, "node_modules/@angular"))).toBe(false);
        expect(existsSync(join(directory, "node_modules", CORE, "src"))).toBe(false);
        expect(existsSync(join(directory, "node_modules", CORE, "dist/index.d.mts"))).toBe(true);
        for (const extension of ["mts", "cts"]) {
          writeFileSync(
            join(directory, `consumer.${extension}`),
            `import { SHARE_ERROR_CODES } from "${name}";
import type { ShareValue, FirebaseShareOptions } from "${name}";
export const data: ShareValue = { image: new Blob(["test"]) };
export const code: string = SHARE_ERROR_CODES.INVALID_INPUT;
export type Options = FirebaseShareOptions;
// @ts-expect-error BigInt ist kein unterstützter Wert.
export const invalid: ShareValue = 1n;
`,
          );
        }
        writeFileSync(
          join(directory, "tsconfig.json"),
          JSON.stringify({
            compilerOptions: {
              strict: true,
              noEmit: true,
              skipLibCheck: false,
              target: "ES2022",
              module: "NodeNext",
              moduleResolution: "NodeNext",
              types: [],
            },
            include: ["consumer.mts", "consumer.cts"],
          }),
        );
        execFileSync(process.execPath, [join(ROOT, "node_modules/typescript/bin/tsc"), "--project", directory], {
          cwd: directory,
          stdio: "pipe",
        });
      }
    } finally {
      rmSync(temporary, { recursive: true, force: true });
    }
  });
});
