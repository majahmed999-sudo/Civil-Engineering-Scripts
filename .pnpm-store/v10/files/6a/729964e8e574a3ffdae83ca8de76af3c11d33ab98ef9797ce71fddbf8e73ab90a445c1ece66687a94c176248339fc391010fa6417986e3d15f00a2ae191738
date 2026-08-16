"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const EasCommand_1 = tslib_1.__importDefault(require("../commandUtils/EasCommand"));
const browse_1 = tslib_1.__importDefault(require("./browse"));
class Open extends EasCommand_1.default {
    static description = 'open the project page in a web browser (alias of `eas browse`)';
    static hidden = true;
    async runAsync() {
        await browse_1.default.run([]);
    }
}
exports.default = Open;
