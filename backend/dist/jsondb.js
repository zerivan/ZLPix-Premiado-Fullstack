"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.load = load;
exports.save = save;
exports.loadMeta = loadMeta;
exports.saveMeta = saveMeta;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function load(file) {
    const p = path_1.default.join(__dirname, "..", "json", file);
    if (!fs_1.default.existsSync(p))
        return file.endsWith(".json") ? [] : {};
    return JSON.parse(fs_1.default.readFileSync(p, "utf-8"));
}
function save(file, data) {
    const p = path_1.default.join(__dirname, "..", "json", file);
    fs_1.default.writeFileSync(p, JSON.stringify(data, null, 2));
}
function loadMeta() {
    return load("meta.json");
}
function saveMeta(data) {
    save("meta.json", data);
}
