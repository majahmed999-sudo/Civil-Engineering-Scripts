"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstalledExpoPackageVersionAsync = getInstalledExpoPackageVersionAsync;
const turtle_spawn_1 = __importDefault(require("@expo/turtle-spawn"));
const results_1 = require("@expo/results");
const promises_1 = __importDefault(require("fs/promises"));
const semver_1 = __importDefault(require("semver"));
const errors = __importStar(require("./errors"));
async function getInstalledExpoPackageVersionAsync({ env = process.env, projectDir, }) {
    const expoPackageJsonPathResult = await (0, results_1.asyncResult)((0, turtle_spawn_1.default)('node', ['--print', "require.resolve('expo/package.json')"], {
        cwd: projectDir,
        env,
        stdio: 'pipe',
    }));
    if (!expoPackageJsonPathResult.ok) {
        throw new errors.UserError('EAS_BUILD_EXPO_PACKAGE_VERSION_NOT_FOUND', 'Cannot resolve the installed expo package version because require.resolve("expo/package.json") failed.', { cause: expoPackageJsonPathResult.reason });
    }
    const expoPackageJsonPath = expoPackageJsonPathResult.value.stdout.toString().trim();
    const expoPackageJsonResult = await (0, results_1.asyncResult)(readJsonAsync(expoPackageJsonPath));
    if (!expoPackageJsonResult.ok) {
        throw new errors.UserError('EAS_BUILD_EXPO_PACKAGE_VERSION_READ_FAILED', 'Cannot resolve the installed expo package version because expo/package.json could not be read.', { cause: expoPackageJsonResult.reason });
    }
    const expoPackageVersion = expoPackageJsonResult.value.version;
    if (typeof expoPackageVersion !== 'string' || !semver_1.default.valid(expoPackageVersion)) {
        throw new errors.UserError('EAS_BUILD_EXPO_PACKAGE_VERSION_INVALID', 'Cannot resolve the installed expo package version because expo/package.json has an invalid version.');
    }
    return expoPackageVersion;
}
async function readJsonAsync(filePath) {
    return JSON.parse(await promises_1.default.readFile(filePath, 'utf8'));
}
