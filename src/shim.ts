#! /usr/bin/env node

// This file is built as a separate entry point (dist/shim.js) and symlinked
// as `terraform`. It resolves which version to run:
//   1. the nearest .terraform-version file walking up from the cwd
//   2. the active version from the manifest
// then spawns the real binary with the caller's argv and exit code.
//
// It is deliberately dependency-free and allocation-light: it runs on every
// `terraform` invocation, so startup cost matters.

import { existsSync, readFileSync, realpathSync } from "fs";
import { join, dirname, resolve } from "path";
import { spawn } from "child_process";
import { homedir, platform } from "os";

interface Manifest {
  versions: Array<{ version: string; fileName: string }>;
  active: string | null;
}

// Resolve the storage dir: explicit env first (these point at the dir itself),
// then the directory this shim lives in (it is copied into the storage dir),
// then the default ~/.tfvm.
const resolveStorageDir = (): string => {
  const envDir = process.env.TFVM_STORAGE_DIR || process.env.TFVM_PATH;
  if (envDir) return envDir;
  const entry = process.argv[1];
  if (entry) {
    try {
      return dirname(realpathSync(entry));
    } catch {
      // fall through to the default
    }
  }
  return join(homedir(), ".tfvm");
};

const STORAGE_DIR = resolveStorageDir();

const PIN_FILE = ".terraform-version";

function fail(message: string): never {
  process.stderr.write(`tfvm: ${message}\n`);
  process.exit(1);
}

// Locate the nearest .terraform-version by walking up to the filesystem root.
const findPinnedVersion = (): string | null => {
  let dir = resolve(process.cwd());
  for (;;) {
    const pinPath = join(dir, PIN_FILE);
    if (existsSync(pinPath)) {
      try {
        const pinned = readFileSync(pinPath, "utf-8").trim();
        if (pinned) return pinned;
      } catch {
        // Unreadable pin file: keep walking.
      }
    }
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
};

const readManifest = (): Manifest => {
  try {
    return JSON.parse(readFileSync(join(STORAGE_DIR, "manifest.json"), "utf-8"));
  } catch {
    return { versions: [], active: null };
  }
};

const resolveBinary = (): string => {
  const manifest = readManifest();
  if (!manifest || !Array.isArray(manifest.versions)) {
    fail("no Terraform versions installed. Run: tfvm download <version>");
  }

  const pinned = findPinnedVersion();
  if (pinned) {
    const match = manifest.versions.find((v) => v.version === pinned);
    if (!match) {
      fail(
        `this project requires Terraform ${pinned}, but it is not installed. ` +
        `Run: tfvm download ${pinned}`
      );
    }
    const binary = join(STORAGE_DIR, match.fileName);
    if (!existsSync(binary)) {
      fail(`pinned Terraform ${pinned} is missing its binary. Run: tfvm download ${pinned}`);
    }
    return binary;
  }

  if (manifest.active) {
    const match = manifest.versions.find((v) => v.fileName === manifest.active);
    if (match && existsSync(join(STORAGE_DIR, match.fileName))) {
      return join(STORAGE_DIR, match.fileName);
    }
  }

  if (manifest.versions.length === 0) {
    fail("no Terraform versions installed. Run: tfvm download <version>");
  }

  fail(
    "no active Terraform version. Run: tfvm use, or pin a project with: tfvm pin <version>"
  );
};

const binary = resolveBinary();

const child = spawn(binary, process.argv.slice(2), {
  stdio: "inherit",
  // Windows needs shell:true for .exe resolution in some environments; harmless elsewhere.
  shell: platform() === "win32",
});

child.on("error", (err: Error) => fail(`could not run Terraform: ${err.message}`));
child.on("close", (code?: number) => {
  if (code === null) process.exit(1);
  process.exit(code);
});
child.on("exit", (code: number | null, signal: string | null) => {
  // Mirror signals the same way shells do (128 + signal number).
  if (signal) {
    const signalNumber = Number(signal.replace("SIG", "")) || 0;
    process.exit(signalNumber > 0 ? 128 + signalNumber : 1);
  }
  if (code === null) process.exit(1);
});
