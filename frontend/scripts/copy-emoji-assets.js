import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const src = path.join(
  __dirname,
  "..",
  "node_modules",
  "emoji-datasource-apple",
  "img",
  "apple",
  "64",
);

const dest = path.join(__dirname, "..", "public", "emoji-assets", "apple", "64");

// ایجاد پوشه مقصد
if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest, { recursive: true });
}

// کپی فایل‌ها
if (fs.existsSync(src)) {
  fs.cpSync(src, dest, { recursive: true });
  console.log(`✅ Emoji assets copied to ${dest}`);
} else {
  console.error(`❌ Source not found: ${src}`);
  process.exit(1);
}