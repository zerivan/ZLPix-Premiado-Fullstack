import fs from "fs";

export function load(file: string) {
  const path = `json/${file}`;
  if (!fs.existsSync(path)) return file.endsWith(".json") ? [] : {};
  return JSON.parse(fs.readFileSync(path, "utf-8"));
}

export function save(file: string, data: any) {
  const path = `json/${file}`;
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

export function loadMeta() {
  return load("meta.json");
}

export function saveMeta(data: any) {
  save("meta.json", data);
}
