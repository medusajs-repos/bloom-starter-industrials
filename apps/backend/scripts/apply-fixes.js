/**
 * Postinstall script to apply manual patches to node_modules.
 *
 * Patch: @medusajs/framework - set "trust proxy" to false in express-loader.js
 * Reason: The sandbox provider does not return Set-Cookie headers when trust proxy
 * is set to 1, causing session cookies to be dropped.
 */

const fs = require("fs");
const path = require("path");

const TARGET_FILE = path.join(
  __dirname,
  "..",
  "node_modules",
  "@medusajs",
  "framework",
  "dist",
  "http",
  "express-loader.js"
);

const ORIGINAL = `app.set("trust proxy", 1);`;
const PATCHED = `app.set("trust proxy", false);`;

if (!fs.existsSync(TARGET_FILE)) {
  console.log(`[apply-fixes] Skipping: target file not found at ${TARGET_FILE}`);
  process.exit(0);
}

let contents = fs.readFileSync(TARGET_FILE, "utf8");

if (contents.includes(PATCHED)) {
  console.log(`[apply-fixes] @medusajs/framework express-loader.js already patched, skipping.`);
  process.exit(0);
}

if (!contents.includes(ORIGINAL)) {
  console.warn(
    `[apply-fixes] WARNING: Could not find expected string "${ORIGINAL}" in express-loader.js. ` +
    `The package may have been updated. Verify the fix is still needed.`
  );
  process.exit(0);
}

contents = contents.replace(ORIGINAL, PATCHED);
fs.writeFileSync(TARGET_FILE, contents, "utf8");
console.log(`[apply-fixes] Patched @medusajs/framework: "trust proxy" changed from 1 to false.`);
