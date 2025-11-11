"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const premioController_1 = require("../controllers/premioController");
const router = (0, express_1.Router)();
router.get("/premio", premioController_1.sortearPremio);
exports.default = router;
