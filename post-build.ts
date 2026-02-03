#!/usr/bin/env bun
import { readFile, writeFile } from "fs/promises";
import path from "path";

// Post-build script to update service worker with build timestamp
console.log("\n🔧 Running post-build tasks...\n");

try {
  // Read version.json to get the updated timestamp
  const versionPath = path.join(process.cwd(), "public", "version.json");
  const versionContent = await readFile(versionPath, "utf-8");
  const versionData = JSON.parse(versionContent);
  const buildTimestamp = versionData.timestamp || new Date().toISOString();

  // Update service worker with build timestamp
  const swDistPath = path.join(process.cwd(), "dist", "sw.js");
  let swContent = await readFile(swDistPath, "utf-8");
  swContent = swContent.replace(/__BUILD_TIMESTAMP__/g, buildTimestamp);
  await writeFile(swDistPath, swContent, "utf-8");

  console.log(`✅ Service worker updated with timestamp: ${buildTimestamp}\n`);
} catch (error) {
  console.error("⚠️  Failed to run post-build tasks:", error);
  process.exit(1);
}
