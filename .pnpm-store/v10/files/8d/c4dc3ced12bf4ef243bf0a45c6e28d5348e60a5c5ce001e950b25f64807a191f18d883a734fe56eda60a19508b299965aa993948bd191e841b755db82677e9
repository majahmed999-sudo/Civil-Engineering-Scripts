"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const EasCommand_1 = tslib_1.__importDefault(require("../../commandUtils/EasCommand"));
const flags_1 = require("../../commandUtils/flags");
const DeviceRunSessionMutation_1 = require("../../graphql/mutations/DeviceRunSessionMutation");
const ora_1 = require("../../ora");
const env_1 = require("../../simulator/env");
const json_1 = require("../../utils/json");
class SimulatorStop extends EasCommand_1.default {
    static hidden = true;
    static description = '[EXPERIMENTAL] stop a remote simulator session on EAS by its simulator session ID';
    static flags = {
        id: core_1.Flags.string({
            description: `Simulator session ID. Defaults to ${env_1.SIMULATOR_DOTENV_FILE_NAME}.`,
        }),
        ...flags_1.EasNonInteractiveAndJsonFlags,
    };
    static contextDefinition = {
        ...this.ContextOptions.LoggedIn,
        ...this.ContextOptions.ProjectDir,
    };
    async runAsync() {
        const { flags } = await this.parse(SimulatorStop);
        const { json: jsonFlag, nonInteractive } = (0, flags_1.resolveNonInteractiveAndJsonFlags)(flags);
        if (jsonFlag) {
            (0, json_1.enableJsonOutput)();
        }
        const { projectDir, loggedIn: { graphqlClient }, } = await this.getContextAsync(SimulatorStop, {
            nonInteractive,
        });
        await (0, env_1.loadSimulatorEnvAsync)(projectDir);
        const flagId = flags.id || process.env[env_1.EAS_SIMULATOR_SESSION_ID];
        if (!flagId) {
            throw new Error(`No simulator session ID provided. Pass --id, or run \`eas simulator:start\` first to write ${env_1.SIMULATOR_DOTENV_FILE_NAME}.`);
        }
        const stopSpinner = (0, ora_1.ora)(`🛑 Stopping simulator session ${flagId}`).start();
        let session;
        try {
            session = await DeviceRunSessionMutation_1.DeviceRunSessionMutation.ensureDeviceRunSessionStoppedAsync(graphqlClient, flagId);
            stopSpinner.succeed(`🎉 Simulator session ${session.id} is ${session.status.toLowerCase()}`);
        }
        catch (err) {
            stopSpinner.fail(`Failed to stop simulator session ${flagId}`);
            throw err;
        }
        if (jsonFlag) {
            (0, json_1.printJsonOnlyOutput)({ id: session.id, status: session.status });
        }
    }
}
exports.default = SimulatorStop;
