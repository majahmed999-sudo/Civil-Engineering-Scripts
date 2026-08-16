"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const EasCommand_1 = tslib_1.__importDefault(require("../../../commandUtils/EasCommand"));
const flags_1 = require("../../../commandUtils/flags");
const utils_1 = require("../../../integrations/asc/utils");
const AscAppLinkMutation_1 = require("../../../graphql/mutations/AscAppLinkMutation");
const AscAppLinkQuery_1 = require("../../../graphql/queries/AscAppLinkQuery");
const log_1 = tslib_1.__importDefault(require("../../../log"));
const ora_1 = require("../../../ora");
const prompts_1 = require("../../../prompts");
const json_1 = require("../../../utils/json");
class IntegrationsAscDisconnect extends EasCommand_1.default {
    static description = 'disconnect the current project from its App Store Connect app';
    static flags = {
        yes: core_1.Flags.boolean({
            description: 'Skip confirmation prompt',
            default: false,
        }),
        ...flags_1.EasNonInteractiveAndJsonFlags,
    };
    static contextDefinition = {
        ...this.ContextOptions.ProjectId,
        ...this.ContextOptions.LoggedIn,
    };
    async runAsync() {
        const { flags } = await this.parse(IntegrationsAscDisconnect);
        const { json, nonInteractive } = (0, flags_1.resolveNonInteractiveAndJsonFlags)(flags);
        if (json) {
            (0, json_1.enableJsonOutput)();
        }
        const { projectId, loggedIn: { graphqlClient }, } = await this.getContextAsync(IntegrationsAscDisconnect, {
            nonInteractive: nonInteractive || flags.yes,
        });
        // Step 1: Check current status
        const metadata = await this.fetchCurrentStatusAsync(graphqlClient, projectId);
        if (!metadata) {
            if (json) {
                (0, json_1.printJsonOnlyOutput)((0, utils_1.buildInvalidJsonOutput)('disconnect', projectId));
            }
            else {
                log_1.default.addNewLineIfNone();
                log_1.default.warn('The App Store Connect API key linked to this project has been revoked or is no longer valid.\nThe connection cannot be resolved from the CLI. Please update the API key on the Expo dashboard.');
            }
            return;
        }
        if (!metadata.appStoreConnectApp) {
            if (json) {
                (0, json_1.printJsonOnlyOutput)((0, utils_1.buildJsonOutput)('disconnect', metadata));
            }
            else {
                log_1.default.addNewLineIfNone();
                log_1.default.log(`Project ${chalk_1.default.bold(metadata.fullName)} is not connected to any App Store Connect app.`);
            }
            return;
        }
        // Step 2: Confirm
        if (!flags.yes && !nonInteractive) {
            log_1.default.addNewLineIfNone();
            log_1.default.log((0, utils_1.formatAscAppLinkStatus)(metadata));
            log_1.default.newLine();
            log_1.default.warn('You are about to disconnect this project from its App Store Connect app.\nThis action is reversible by reconnecting.');
            log_1.default.newLine();
            const confirmed = await (0, prompts_1.toggleConfirmAsync)({
                message: 'Are you sure you wish to proceed?',
            });
            if (!confirmed) {
                log_1.default.error('Canceled disconnection');
                process.exit(1);
            }
        }
        // Step 3: Delete
        const deleteSpinner = (0, ora_1.ora)('Disconnecting App Store Connect app').start();
        try {
            await AscAppLinkMutation_1.AscAppLinkMutation.deleteAppStoreConnectAppAsync(graphqlClient, metadata.appStoreConnectApp.id);
            deleteSpinner.succeed('Disconnected App Store Connect app');
        }
        catch (err) {
            deleteSpinner.fail('Failed to disconnect App Store Connect app');
            throw err;
        }
        // Step 4: Refetch and display
        const refetchSpinner = (0, ora_1.ora)('Verifying disconnection').start();
        const updatedMetadata = await AscAppLinkQuery_1.AscAppLinkQuery.getAppMetadataAsync(graphqlClient, projectId, {
            useCache: false,
        });
        refetchSpinner.succeed('Verified disconnection');
        if (json) {
            (0, json_1.printJsonOnlyOutput)((0, utils_1.buildJsonOutput)('disconnect', updatedMetadata));
        }
        else {
            log_1.default.addNewLineIfNone();
            log_1.default.log((0, utils_1.formatAscAppLinkStatus)(updatedMetadata));
        }
    }
    async fetchCurrentStatusAsync(graphqlClient, projectId) {
        const spinner = (0, ora_1.ora)('Checking current App Store Connect app link status').start();
        try {
            const metadata = await AscAppLinkQuery_1.AscAppLinkQuery.getAppMetadataAsync(graphqlClient, projectId);
            spinner.succeed('Checked current status');
            return metadata;
        }
        catch (err) {
            if ((0, utils_1.isAscAuthenticationError)(err)) {
                spinner.fail('App Store Connect connection is invalid');
                return null;
            }
            spinner.fail('Failed to check current status');
            throw err;
        }
    }
}
exports.default = IntegrationsAscDisconnect;
