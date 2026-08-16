"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@expo/logger");
const spawn_async_1 = __importDefault(require("@expo/spawn-async"));
function spawn(command, args, _options = {
    stdio: 'inherit',
    cwd: process.cwd(),
}) {
    const { logger, ...options } = _options;
    if (logger) {
        options.stdio = 'pipe';
    }
    const promise = (0, spawn_async_1.default)(command, args, options);
    if (logger && promise.child) {
        (0, logger_1.pipeSpawnOutput)(logger, promise.child, options);
    }
    return promise;
}
exports.default = spawn;
