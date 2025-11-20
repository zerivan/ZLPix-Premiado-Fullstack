import fs from "fs";

export function load(file: string) {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

export function save(file: string, data: any) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export function loadMeta() {
  return load("meta.json");
}

export function saveMeta(data: any) {
  save("meta.json", data);
}
