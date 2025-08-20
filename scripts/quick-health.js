#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

// Minimal required files for basic health check
const required = [
  "CLAUDE.md",
  "docs/01_initial/initial.md",
  "docs/02_prp/prp.md",
  "docs/05_validation/validation-gates.md",
  "src/config/flags.ts"
];

const missing = required.filter(p => !fs.existsSync(path.join(process.cwd(), p)));
const result = { 
  ok: missing.length === 0, 
  missing: missing 
};

console.log(JSON.stringify(result, null, 2));
process.exit(0);