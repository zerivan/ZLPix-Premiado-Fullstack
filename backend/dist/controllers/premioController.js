"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortearPremio = sortearPremio;
function sortearPremio() {
    return {
        numero: Math.floor(Math.random() * 100000),
        data: new Date().toISOString()
    };
}
