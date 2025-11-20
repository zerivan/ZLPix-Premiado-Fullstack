import fs from "fs";
import path from "path";

export function load(file: string): any {
  const p = path.join(__dirname, "..", "json", file);
  if (!fs.existsSync(p)) return file.endsWith(".json") ? [] : {};
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

export function save(file: string, data: any): void {
  const p = path.join(__dirname, "..", "json", file);
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

export function loadMeta(): any {
  return load("meta.json");
}

export function saveMeta(data: any): void {
  save("meta.json", data);
}
