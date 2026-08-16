"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const EasCommand_1 = tslib_1.__importDefault(require("../../../commandUtils/EasCommand"));
const flags_1 = require("../../../commandUtils/flags");
const utils_1 = require("../../../integrations/asc/utils");
const AscAppLinkQuery_1 = require("../../../graphql/queries/AscAppLinkQuery");
const log_1 = tslib_1.__importDefault(require("../../../log"));
const ora_1 = require("../../../ora");
const json_1 = require("../../../utils/json");
class IntegrationsAscStatus extends EasCommand_1.default {
    static description = 'show the App Store Connect app link status for the current project';
    static flags = {
        ...flags_1.EasNonInteractiveAndJsonFlags,
    };
    static contextDefinition = {
        ...this.ContextOptions.ProjectId,
        ...this.ContextOptions.LoggedIn,
    };
    async runAsync() {
        const { flags } = await this.parse(IntegrationsAscStatus);
        const { json, nonInteractive } = (0, flags_1.resolveNonInteractiveAndJsonFlags)(flags);
        if (json) {
            (0, json_1.enableJsonOutput)();
        }
        const { projectId, loggedIn: { graphqlClient }, } = await this.getContextAsync(IntegrationsAscStatus, {
            nonInteractive,
        });
        const metadata = await this.fetchStatusAsync(graphqlClient, projectId);
        if (!metadata) {
            if (json) {
                (0, json_1.printJsonOnlyOutput)((0, utils_1.buildInvalidJsonOutput)('status', projectId));
            }
            else {
                log_1.default.addNewLineIfNone();
                log_1.default.warn('The App Store Connect API key linked to this project has been revoked or is no longer valid.');
            }
            return;
        }
        if (json) {
            (0, json_1.printJsonOnlyOutput)((0, utils_1.buildJsonOutput)('status', metadata));
        }
        else {
            log_1.default.addNewLineIfNone();
            log_1.default.log((0, utils_1.formatAscAppLinkStatus)(metadata));
        }
    }
    async fetchStatusAsync(graphqlClient, projectId) {
        const spinner = (0, ora_1.ora)('Fetching App Store Connect app link status').start();
        try {
            const metadata = await AscAppLinkQuery_1.AscAppLinkQuery.getAppMetadataAsync(graphqlClient, projectId);
            spinner.succeed('Fetched App Store Connect app link status');
            return metadata;
        }
        catch (err) {
            if ((0, utils_1.isAscAuthenticationError)(err)) {
                spinner.fail('App Store Connect connection is invalid');
                return null;
            }
            spinner.fail('Failed to fetch App Store Connect app link status');
            throw err;
        }
    }
}
exports.default = IntegrationsAscStatus;
