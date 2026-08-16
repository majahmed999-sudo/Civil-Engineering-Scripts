"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const nullthrows_1 = tslib_1.__importDefault(require("nullthrows"));
const url_1 = require("../../build/utils/url");
const EasCommand_1 = tslib_1.__importDefault(require("../../commandUtils/EasCommand"));
const flags_1 = require("../../commandUtils/flags");
const generated_1 = require("../../graphql/generated");
const DeviceRunSessionMutation_1 = require("../../graphql/mutations/DeviceRunSessionMutation");
const DeviceRunSessionQuery_1 = require("../../graphql/queries/DeviceRunSessionQuery");
const log_1 = tslib_1.__importStar(require("../../log"));
const ora_1 = require("../../ora");
const env_1 = require("../../simulator/env");
const utils_1 = require("../../simulator/utils");
const json_1 = require("../../utils/json");
const promise_1 = require("../../utils/promise");
const POLL_INTERVAL_MS = 5_000; // 5 seconds
const POLL_TIMEOUT_MS = 15 * 60 * 1_000; // 15 minutes
const OUT_CONFIG_TYPE_VALUES = {
    Env: 'env',
    Dotenv: 'dotenv',
};
class SimulatorStart extends EasCommand_1.default {
    static hidden = true;
    static description = '[EXPERIMENTAL] start a remote simulator session on EAS and get instructions to connect to it';
    static flags = {
        platform: core_1.Flags.option({
            char: 'p',
            description: 'Device platform',
            options: ['android', 'ios'],
            required: true,
        })(),
        type: core_1.Flags.option({
            description: 'Type of simulator session to create',
            options: Object.values(utils_1.DEVICE_RUN_SESSION_TYPE_FLAG_VALUES),
            default: utils_1.DEVICE_RUN_SESSION_TYPE_FLAG_VALUES[generated_1.DeviceRunSessionType.AgentDevice],
        })(),
        'package-version': core_1.Flags.string({
            description: 'Version of the package backing the simulator session (e.g. "0.1.3-alpha.3"). Defaults to "latest" when omitted.',
        }),
        'max-duration-minutes': core_1.Flags.integer({
            description: 'Maximum duration of the simulator session in minutes before it is automatically stopped. Only customizable on paid plans. Defaults to a value derived from the job run priority when omitted.',
            min: 0,
        }),
        force: core_1.Flags.boolean({
            description: '[default: true] Create a new simulator session even when an existing simulator session is present in the environment.',
            default: true,
            allowNo: true,
        }),
        'out-config-type': core_1.Flags.option({
            description: `How to output simulator connection configuration. Use "env" to print shell exports, or "dotenv" to write ${env_1.SIMULATOR_DOTENV_FILE_NAME}.`,
            options: Object.values(OUT_CONFIG_TYPE_VALUES),
            default: OUT_CONFIG_TYPE_VALUES.Dotenv,
        })(),
        ...flags_1.EasNonInteractiveAndJsonFlags,
    };
    static contextDefinition = {
        ...this.ContextOptions.ProjectId,
        ...this.ContextOptions.ProjectDir,
        ...this.ContextOptions.LoggedIn,
    };
    async runAsync() {
        const { flags } = await this.parse(SimulatorStart);
        const { json: jsonFlag, nonInteractive } = (0, flags_1.resolveNonInteractiveAndJsonFlags)(flags);
        if (jsonFlag) {
            (0, json_1.enableJsonOutput)();
        }
        const { projectId, projectDir, loggedIn: { graphqlClient }, } = await this.getContextAsync(SimulatorStart, {
            nonInteractive,
        });
        await (0, env_1.loadSimulatorEnvAsync)(projectDir);
        const existingDeviceRunSessionId = process.env[env_1.EAS_SIMULATOR_SESSION_ID];
        if (existingDeviceRunSessionId && !flags.force) {
            throw new Error(`Existing simulator session in environment. Use --force to create a new simulator session.`);
        }
        if (existingDeviceRunSessionId) {
            log_1.default.warn(`  Overwriting previous simulator session (id: ${existingDeviceRunSessionId}). ` +
                `The previous remote session will continue running until stopped. ` +
                `To stop it, run: eas simulator:stop --id ${existingDeviceRunSessionId}`);
            log_1.default.newLine();
        }
        const platform = flags.platform === 'android' ? generated_1.AppPlatform.Android : generated_1.AppPlatform.Ios;
        const createSpinner = (0, ora_1.ora)('🚀 Creating simulator session').start();
        let deviceRunSessionId;
        let deviceRunSessionUrl;
        try {
            const session = await DeviceRunSessionMutation_1.DeviceRunSessionMutation.createDeviceRunSessionAsync(graphqlClient, {
                appId: projectId,
                platform,
                type: utils_1.DEVICE_RUN_SESSION_TYPE_BY_FLAG_VALUE[flags.type],
                packageVersion: flags['package-version'],
                maxRunTimeMinutes: flags['max-duration-minutes'],
            });
            deviceRunSessionId = session.id;
            (0, nullthrows_1.default)(session.turtleJobRun?.id, 'Expected simulator session to start');
            deviceRunSessionUrl = (0, url_1.getDeviceRunSessionUrl)(session.app.ownerAccount.name, session.app.slug, deviceRunSessionId);
            const simulatorEnvWritten = !jsonFlag && flags['out-config-type'] === OUT_CONFIG_TYPE_VALUES.Dotenv
                ? await writeSimulatorEnvSafelyAsync(projectDir, {
                    [env_1.EAS_SIMULATOR_SESSION_ID]: deviceRunSessionId,
                })
                : false;
            createSpinner.succeed(`Simulator session created (id: ${deviceRunSessionId}${simulatorEnvWritten ? `, saved to ${env_1.SIMULATOR_DOTENV_FILE_NAME}` : ''}) ${(0, log_1.link)(deviceRunSessionUrl)}`);
        }
        catch (err) {
            createSpinner.fail('Failed to create simulator session');
            throw err;
        }
        const pollSpinner = (0, ora_1.ora)(`⏳ Waiting for ${flags.type} session to be ready`).start();
        const deadline = Date.now() + POLL_TIMEOUT_MS;
        let remoteConfig;
        try {
            while (Date.now() < deadline) {
                const session = await DeviceRunSessionQuery_1.DeviceRunSessionQuery.byIdAsync(graphqlClient, deviceRunSessionId);
                if (session.status === generated_1.DeviceRunSessionStatus.Errored ||
                    session.status === generated_1.DeviceRunSessionStatus.Stopped) {
                    throw new Error(`Simulator session ${deviceRunSessionId} ${session.status.toLowerCase()} before the ${flags.type} session was ready. ${(0, log_1.link)(deviceRunSessionUrl)}`);
                }
                const jobRunStatus = session.turtleJobRun?.status;
                if (jobRunStatus === generated_1.JobRunStatus.Errored ||
                    jobRunStatus === generated_1.JobRunStatus.Canceled ||
                    jobRunStatus === generated_1.JobRunStatus.Finished) {
                    throw new Error(`Turtle job run for simulator session ${deviceRunSessionId} ${jobRunStatus.toLowerCase()} before the ${flags.type} session was ready. ${(0, log_1.link)(deviceRunSessionUrl)}`);
                }
                if (session.remoteConfig) {
                    remoteConfig = session.remoteConfig;
                    pollSpinner.succeed(`🎉 ${flags.type} session is ready`);
                    break;
                }
                await (0, promise_1.sleepAsync)(POLL_INTERVAL_MS);
            }
        }
        catch (err) {
            pollSpinner.fail(`Failed while polling for ${flags.type} session to be ready`);
            await ensureDeviceRunSessionStoppedSafelyAsync(graphqlClient, deviceRunSessionId);
            throw err;
        }
        if (!remoteConfig) {
            pollSpinner.fail(`Timed out waiting for ${flags.type} session to be ready`);
            await ensureDeviceRunSessionStoppedSafelyAsync(graphqlClient, deviceRunSessionId);
            throw new Error(`Timed out after ${Math.round(POLL_TIMEOUT_MS / 1000)}s waiting for ${flags.type} session to be ready. ${(0, log_1.link)(deviceRunSessionUrl)}`);
        }
        if (flags['out-config-type'] === OUT_CONFIG_TYPE_VALUES.Dotenv) {
            await writeSimulatorEnvSafelyAsync(projectDir, {
                ...(0, utils_1.getRemoteSessionEnvironmentVariables)(remoteConfig),
                [env_1.EAS_SIMULATOR_SESSION_ID]: deviceRunSessionId,
            });
        }
        if (jsonFlag) {
            (0, json_1.printJsonOnlyOutput)({
                id: deviceRunSessionId,
                type: flags.type,
                deviceRunSessionUrl,
                remoteConfig,
            });
            return;
        }
        log_1.default.newLine();
        log_1.default.log((0, utils_1.formatRemoteSessionInstructions)(remoteConfig, flags['out-config-type']));
        log_1.default.newLine();
        if (nonInteractive) {
            log_1.default.log(`When you are done, stop the session with: eas simulator:stop --id ${deviceRunSessionId}`);
            return;
        }
        await waitForSessionEndOrInterruptAsync({
            graphqlClient,
            deviceRunSessionId,
            deviceRunSessionUrl,
            projectDir,
        });
    }
}
exports.default = SimulatorStart;
async function writeSimulatorEnvSafelyAsync(projectDir, environmentVariables) {
    try {
        await (0, env_1.writeSimulatorEnvAsync)(projectDir, environmentVariables);
        return true;
    }
    catch (err) {
        log_1.default.warn(`Failed to write simulator environment variables to ${env_1.SIMULATOR_DOTENV_FILE_NAME}: ${err instanceof Error ? err.message : String(err)}`);
        return false;
    }
}
async function waitForSessionEndOrInterruptAsync({ graphqlClient, deviceRunSessionId, deviceRunSessionUrl, projectDir, }) {
    const spinner = (0, ora_1.ora)(`Simulator session active — press Ctrl+C to stop, or run \`eas simulator:stop --id ${deviceRunSessionId}\` from another shell`).start();
    const abortController = new AbortController();
    const { signal } = abortController;
    const abortPromise = new Promise(resolve => {
        signal.addEventListener('abort', () => {
            resolve();
        }, { once: true });
    });
    const sigintHandler = () => {
        if (signal.aborted) {
            // Force exit on a second Ctrl+C in case cleanup is hanging. The session may still be
            // running on EAS, so tell the user how to make sure it gets terminated.
            spinner.fail(`Aborted before the simulator session could be stopped. Run \`eas simulator:stop --id ${deviceRunSessionId}\` to terminate it and avoid unexpected charges.`);
            process.exit(130);
        }
        abortController.abort();
    };
    process.on('SIGINT', sigintHandler);
    try {
        while (!signal.aborted) {
            let session;
            try {
                session = await DeviceRunSessionQuery_1.DeviceRunSessionQuery.byIdAsync(graphqlClient, deviceRunSessionId);
            }
            catch (err) {
                log_1.default.debug(`Failed to poll simulator session: ${err instanceof Error ? err.message : String(err)}`);
                await Promise.race([(0, promise_1.sleepAsync)(POLL_INTERVAL_MS), abortPromise]);
                continue;
            }
            const jobRunStatus = session.turtleJobRun?.status;
            if (session.status === generated_1.DeviceRunSessionStatus.Errored ||
                jobRunStatus === generated_1.JobRunStatus.Errored) {
                spinner.fail(`Simulator session errored. ${(0, log_1.link)(deviceRunSessionUrl)}`);
                throw new Error(`Simulator session ${deviceRunSessionId} errored.`);
            }
            if (session.status === generated_1.DeviceRunSessionStatus.Stopped ||
                jobRunStatus === generated_1.JobRunStatus.Canceled ||
                jobRunStatus === generated_1.JobRunStatus.Finished) {
                spinner.succeed(`Simulator session ended. ${(0, log_1.link)(deviceRunSessionUrl)}`);
                await resetSimulatorEnvVerboseAsync(projectDir);
                return;
            }
            await Promise.race([(0, promise_1.sleepAsync)(POLL_INTERVAL_MS), abortPromise]);
        }
        spinner.text = 'Stopping simulator session...';
        const stopped = await ensureDeviceRunSessionStoppedSafelyAsync(graphqlClient, deviceRunSessionId);
        if (stopped) {
            spinner.succeed('Simulator session stopped');
            await resetSimulatorEnvVerboseAsync(projectDir);
        }
        else {
            spinner.fail(`Could not confirm the simulator session was stopped. Run \`eas simulator:stop --id ${deviceRunSessionId}\` to terminate it and avoid unexpected charges.`);
        }
    }
    finally {
        process.removeListener('SIGINT', sigintHandler);
    }
}
async function resetSimulatorEnvVerboseAsync(projectDir) {
    try {
        await (0, env_1.resetSimulatorEnvAsync)(projectDir);
    }
    catch (err) {
        log_1.default.error(`Failed to clean up ${env_1.SIMULATOR_DOTENV_FILE_NAME}`);
        throw err;
    }
}
async function ensureDeviceRunSessionStoppedSafelyAsync(graphqlClient, deviceRunSessionId) {
    try {
        await DeviceRunSessionMutation_1.DeviceRunSessionMutation.ensureDeviceRunSessionStoppedAsync(graphqlClient, deviceRunSessionId);
        return true;
    }
    catch (err) {
        // Cleanup is best-effort; surface the failure but don't mask the original error.
        log_1.default.warn(`Failed to stop simulator session ${deviceRunSessionId}: ${err instanceof Error ? err.message : String(err)}`);
        return false;
    }
}
