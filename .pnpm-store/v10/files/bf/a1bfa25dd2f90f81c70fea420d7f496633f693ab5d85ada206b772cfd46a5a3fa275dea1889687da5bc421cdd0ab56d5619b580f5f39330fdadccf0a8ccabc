"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const url_1 = require("../../build/utils/url");
const EasCommand_1 = tslib_1.__importDefault(require("../../commandUtils/EasCommand"));
const flags_1 = require("../../commandUtils/flags");
const generated_1 = require("../../graphql/generated");
const DeviceRunSessionQuery_1 = require("../../graphql/queries/DeviceRunSessionQuery");
const log_1 = tslib_1.__importStar(require("../../log"));
const ora_1 = require("../../ora");
const env_1 = require("../../simulator/env");
const utils_1 = require("../../simulator/utils");
const files_1 = require("../../utils/files");
const formatFields_1 = tslib_1.__importDefault(require("../../utils/formatFields"));
const json_1 = require("../../utils/json");
class SimulatorGet extends EasCommand_1.default {
    static hidden = true;
    static description = '[EXPERIMENTAL] get info about a remote simulator session on EAS by its simulator session ID';
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
        const { flags } = await this.parse(SimulatorGet);
        const { json: jsonFlag, nonInteractive } = (0, flags_1.resolveNonInteractiveAndJsonFlags)(flags);
        if (jsonFlag) {
            (0, json_1.enableJsonOutput)();
        }
        const { projectDir, loggedIn: { graphqlClient }, } = await this.getContextAsync(SimulatorGet, {
            nonInteractive,
        });
        await (0, env_1.loadSimulatorEnvAsync)(projectDir);
        const flagId = flags.id || process.env[env_1.EAS_SIMULATOR_SESSION_ID];
        if (!flagId) {
            throw new Error(`No simulator session ID provided. Pass --id, or run \`eas simulator:start\` first to write ${env_1.SIMULATOR_DOTENV_FILE_NAME}.`);
        }
        const fetchSpinner = (0, ora_1.ora)(`Fetching simulator session ${flagId}`).start();
        let session;
        try {
            session = await DeviceRunSessionQuery_1.DeviceRunSessionQuery.byIdAsync(graphqlClient, flagId);
            fetchSpinner.succeed(`Fetched simulator session ${session.id}`);
        }
        catch (err) {
            fetchSpinner.fail(`Failed to fetch simulator session ${flagId}`);
            throw err;
        }
        const deviceRunSessionUrl = (0, url_1.getDeviceRunSessionUrl)(session.app.ownerAccount.name, session.app.slug, session.id);
        if (jsonFlag) {
            (0, json_1.printJsonOnlyOutput)({
                id: session.id,
                type: (0, utils_1.deviceRunSessionTypeToFlagValue)(session.type),
                status: session.status,
                platform: session.platform,
                createdAt: session.createdAt,
                startedAt: session.startedAt ?? undefined,
                finishedAt: session.finishedAt ?? undefined,
                updatedAt: session.updatedAt,
                deviceRunSessionUrl,
                remoteConfig: session.remoteConfig,
                artifacts: session.artifacts,
            });
            return;
        }
        log_1.default.newLine();
        log_1.default.log(formatSessionFields(session, deviceRunSessionUrl));
        if (session.status === generated_1.DeviceRunSessionStatus.InProgress) {
            log_1.default.newLine();
            if (session.remoteConfig) {
                log_1.default.log((0, utils_1.formatRemoteSessionInstructions)(session.remoteConfig, 'env'));
            }
            else {
                log_1.default.log('⏳ Session is starting up — remote config is not available yet. Re-run this command in a moment.');
            }
        }
        printArtifacts('Session artifacts', session.artifacts, formatDeviceRunSessionArtifactFields);
    }
}
exports.default = SimulatorGet;
function formatSessionFields(session, deviceRunSessionUrl) {
    return (0, formatFields_1.default)([
        { label: 'ID', value: session.id },
        { label: 'Type', value: session.type },
        { label: 'Status', value: session.status },
        { label: 'Platform', value: session.platform },
        { label: 'Created at', value: String(session.createdAt) },
        { label: 'Started at', value: formatNullable(session.startedAt) },
        { label: 'Finished at', value: formatNullable(session.finishedAt) },
        { label: 'Updated at', value: String(session.updatedAt) },
        { label: 'URL', value: (0, log_1.link)(deviceRunSessionUrl) },
    ]);
}
function printArtifacts(title, artifacts, formatArtifactFields) {
    if (artifacts.length === 0) {
        return;
    }
    log_1.default.addNewLineIfNone();
    log_1.default.gray(`${title}:`);
    for (const artifact of artifacts) {
        log_1.default.log((0, formatFields_1.default)(formatArtifactFields(artifact)));
        log_1.default.addNewLineIfNone();
    }
}
function formatDeviceRunSessionArtifactFields(artifact) {
    return [
        { label: '  ID', value: artifact.id },
        { label: '  Name', value: artifact.name },
        { label: '  Filename', value: artifact.filename },
        { label: '  File size', value: formatFileSize(artifact.fileSizeBytes) },
        { label: '  Created at', value: String(artifact.createdAt) },
        { label: '  Updated at', value: String(artifact.updatedAt) },
        { label: '  Metadata', value: formatMetadata(artifact.metadata) },
        { label: '  Download URL', value: (0, log_1.link)(artifact.downloadUrl) },
    ];
}
function formatFileSize(fileSizeBytes) {
    return typeof fileSizeBytes === 'number'
        ? `${(0, files_1.formatBytes)(fileSizeBytes)} (${fileSizeBytes} B)`
        : 'null';
}
function formatMetadata(metadata) {
    return metadata ? JSON.stringify(metadata) : 'null';
}
function formatNullable(value) {
    return value ? String(value) : 'null';
}
