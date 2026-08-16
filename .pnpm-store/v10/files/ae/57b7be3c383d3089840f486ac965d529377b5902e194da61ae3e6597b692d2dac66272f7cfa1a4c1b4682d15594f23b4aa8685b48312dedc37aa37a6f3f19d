"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatEmbeddedUpdate = formatEmbeddedUpdate;
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const EasCommand_1 = tslib_1.__importDefault(require("../../../commandUtils/EasCommand"));
const flags_1 = require("../../../commandUtils/flags");
const EmbeddedUpdateQuery_1 = require("../../../graphql/queries/EmbeddedUpdateQuery");
const log_1 = tslib_1.__importDefault(require("../../../log"));
const date_1 = require("../../../utils/date");
const files_1 = require("../../../utils/files");
const formatFields_1 = tslib_1.__importDefault(require("../../../utils/formatFields"));
const json_1 = require("../../../utils/json");
class UpdateEmbeddedView extends EasCommand_1.default {
    static description = 'view details of an embedded update registered with EAS Update';
    static args = {
        id: core_1.Args.string({
            required: true,
            description: 'The ID of the embedded update (manifest UUID from app.manifest).',
        }),
    };
    static flags = {
        ...flags_1.EasJsonOnlyFlag,
    };
    static contextDefinition = {
        ...this.ContextOptions.ProjectId,
        ...this.ContextOptions.LoggedIn,
    };
    async runAsync() {
        const { args: { id: embeddedUpdateId }, flags: { json: jsonFlag }, } = await this.parse(UpdateEmbeddedView);
        const { projectId, loggedIn: { graphqlClient }, } = await this.getContextAsync(UpdateEmbeddedView, { nonInteractive: true });
        if (jsonFlag) {
            (0, json_1.enableJsonOutput)();
        }
        let embeddedUpdate;
        try {
            embeddedUpdate = await EmbeddedUpdateQuery_1.EmbeddedUpdateQuery.viewByIdAsync(graphqlClient, {
                embeddedUpdateId,
                appId: projectId,
            });
        }
        catch (e) {
            if ((0, EmbeddedUpdateQuery_1.isEmbeddedUpdateNotFoundError)(e)) {
                core_1.Errors.error(`No embedded update found with id "${embeddedUpdateId}" for this project. ` +
                    `Run "eas update:embedded:list" to see the embedded updates registered for this app.`, { exit: 1 });
            }
            throw e;
        }
        if (jsonFlag) {
            (0, json_1.printJsonOnlyOutput)(embeddedUpdate);
            return;
        }
        log_1.default.addNewLineIfNone();
        log_1.default.log(chalk_1.default.bold('Embedded update:'));
        log_1.default.log(formatEmbeddedUpdate(embeddedUpdate));
    }
}
exports.default = UpdateEmbeddedView;
function formatEmbeddedUpdate(embeddedUpdate) {
    const createdAt = new Date(embeddedUpdate.createdAt);
    const bundleSize = embeddedUpdate.launchAsset.finalFileSize ?? embeddedUpdate.launchAsset.fileSize;
    return (0, formatFields_1.default)([
        { label: 'ID', value: embeddedUpdate.id },
        { label: 'Platform', value: embeddedUpdate.platform.toLowerCase() },
        { label: 'Runtime version', value: embeddedUpdate.runtimeVersion },
        { label: 'Channel', value: embeddedUpdate.channel },
        { label: 'Bundle size', value: (0, files_1.formatBytes)(bundleSize) },
        { label: 'Bundle SHA-256', value: embeddedUpdate.launchAsset.fileSHA256 },
        {
            label: 'Created at',
            value: `${createdAt.toLocaleString()} (${(0, date_1.fromNow)(createdAt)} ago)`,
        },
    ]);
}
