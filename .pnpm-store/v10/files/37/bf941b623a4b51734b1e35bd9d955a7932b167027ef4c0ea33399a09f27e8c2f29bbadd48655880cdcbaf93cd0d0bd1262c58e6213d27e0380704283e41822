"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const spawn_async_1 = tslib_1.__importDefault(require("@expo/spawn-async"));
const EasCommand_1 = tslib_1.__importDefault(require("../../commandUtils/EasCommand"));
const env_1 = require("../../simulator/env");
class SimulatorExec extends EasCommand_1.default {
    static hidden = true;
    static description = `[EXPERIMENTAL] execute a simulator command with ${env_1.SIMULATOR_DOTENV_FILE_NAME} environment loaded`;
    static strict = false;
    static contextDefinition = {
        ...this.ContextOptions.ProjectDir,
    };
    isRunningSubprocess = false;
    async runAsync() {
        const rawArgv = [...this.argv];
        // Required to avoid `Warning: Command exec did not parse its arguments. Did you forget to call 'this.parse'?`
        await this.parse(SimulatorExec, []);
        const [command, ...args] = rawArgv;
        if (typeof command !== 'string' || command.length === 0) {
            throw new Error('No command provided. Run `eas simulator:exec <command> [args...]`.');
        }
        const { projectDir } = await this.getContextAsync(SimulatorExec, {
            nonInteractive: true,
        });
        await (0, env_1.loadSimulatorEnvAsync)(projectDir);
        this.isRunningSubprocess = true;
        await (0, spawn_async_1.default)(command, args, {
            stdio: 'inherit',
            env: process.env,
        });
    }
    catch(err) {
        // Propagate wrapped command from spawnAsync rejection
        if (this.isRunningSubprocess) {
            process.exitCode = process.exitCode ?? err.status ?? 1;
            return Promise.resolve();
        }
        return super.catch(err);
    }
}
exports.default = SimulatorExec;
