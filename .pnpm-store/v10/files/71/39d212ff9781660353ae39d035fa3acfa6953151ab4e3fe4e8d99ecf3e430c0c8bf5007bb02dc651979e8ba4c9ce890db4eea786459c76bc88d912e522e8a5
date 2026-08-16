"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureLockfileExistsAsync = ensureLockfileExistsAsync;
const tslib_1 = require("tslib");
const package_manager_1 = require("@expo/package-manager");
const fs_extra_1 = require("fs-extra");
const path_1 = tslib_1.__importDefault(require("path"));
const LOCKFILE_NAMES = [
    package_manager_1.NPM_LOCK_FILE,
    package_manager_1.YARN_LOCK_FILE,
    package_manager_1.PNPM_LOCK_FILE,
    package_manager_1.BUN_LOCK_FILE,
    package_manager_1.BUN_TEXT_LOCK_FILE,
];
async function hasLockfileAsync(dir) {
    for (const lockfile of LOCKFILE_NAMES) {
        if (await (0, fs_extra_1.pathExists)(path_1.default.join(dir, lockfile))) {
            return true;
        }
    }
    return false;
}
async function ensureLockfileExistsAsync(projectDir) {
    if (await hasLockfileAsync(projectDir)) {
        return;
    }
    const workspaceRoot = (0, package_manager_1.resolveWorkspaceRoot)(projectDir);
    if (workspaceRoot && workspaceRoot !== projectDir) {
        if (await hasLockfileAsync(workspaceRoot)) {
            return;
        }
    }
    throw new Error(`No lockfile found in the project directory.\n` +
        `A lockfile is required to ensure deterministic dependency installation in EAS.\n` +
        `Run your package manager's install command (e.g. "npm install") to generate one.\n` +
        `To skip this check, run this command with EAS_BUILD_SKIP_LOCKFILE_CHECK=1.`);
}
