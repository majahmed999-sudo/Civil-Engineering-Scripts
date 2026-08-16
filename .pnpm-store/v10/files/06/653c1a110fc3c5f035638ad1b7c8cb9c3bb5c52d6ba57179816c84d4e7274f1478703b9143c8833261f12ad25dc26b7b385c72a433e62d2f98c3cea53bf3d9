"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIMULATOR_DOTENV_FILE_HEADER = exports.EAS_SIMULATOR_SESSION_ID = exports.SIMULATOR_DOTENV_FILE_NAME = void 0;
exports.getSimulatorEnvFilePath = getSimulatorEnvFilePath;
exports.loadSimulatorEnvAsync = loadSimulatorEnvAsync;
exports.writeSimulatorEnvAsync = writeSimulatorEnvAsync;
exports.resetSimulatorEnvAsync = resetSimulatorEnvAsync;
const tslib_1 = require("tslib");
const env_1 = require("@expo/env");
const fs = tslib_1.__importStar(require("fs-extra"));
const path_1 = tslib_1.__importDefault(require("path"));
exports.SIMULATOR_DOTENV_FILE_NAME = '.env.eas-simulator';
exports.EAS_SIMULATOR_SESSION_ID = 'EAS_SIMULATOR_SESSION_ID';
exports.SIMULATOR_DOTENV_FILE_HEADER = '# Do not commit this file.\n# Do not modify these values manually. They are managed by eas-cli.\n# It holds configuration only for the current simulator session.\n\n';
function getSimulatorEnvFilePath(projectDir) {
    return path_1.default.join(projectDir, exports.SIMULATOR_DOTENV_FILE_NAME);
}
async function loadSimulatorEnvAsync(projectDir) {
    const simulatorDotenvFilePath = getSimulatorEnvFilePath(projectDir);
    (0, env_1.loadProjectEnv)(projectDir, { silent: true });
    (0, env_1.loadEnvFiles)([simulatorDotenvFilePath], { force: true });
}
async function writeSimulatorEnvAsync(projectDir, environmentVariables) {
    const simulatorDotenvFilePath = getSimulatorEnvFilePath(projectDir);
    const simulatorDotenvContent = exports.SIMULATOR_DOTENV_FILE_HEADER +
        Object.entries(environmentVariables)
            .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
            .join('\n') +
        '\n';
    await fs.writeFile(simulatorDotenvFilePath, simulatorDotenvContent);
}
async function resetSimulatorEnvAsync(projectDir) {
    const simulatorDotenvFilePath = getSimulatorEnvFilePath(projectDir);
    try {
        await fs.writeFile(simulatorDotenvFilePath, exports.SIMULATOR_DOTENV_FILE_HEADER, { flag: 'r+' });
        await fs.truncate(simulatorDotenvFilePath, Buffer.byteLength(exports.SIMULATOR_DOTENV_FILE_HEADER));
    }
    catch (err) {
        if (typeof err === 'object' && err !== null && 'code' in err && err.code === 'ENOENT') {
            return;
        }
        throw err;
    }
}
