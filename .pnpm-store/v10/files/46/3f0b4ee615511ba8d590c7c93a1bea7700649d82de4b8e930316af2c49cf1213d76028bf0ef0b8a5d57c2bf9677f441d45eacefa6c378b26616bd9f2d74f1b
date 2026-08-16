"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const EasCommand_1 = tslib_1.__importDefault(require("../../../commandUtils/EasCommand"));
const errors_1 = require("../../../commandUtils/errors");
const flags_1 = require("../../../commandUtils/flags");
const context_1 = require("../../../credentials/context");
const utils_1 = require("../../../integrations/asc/utils");
const ascApiKey_1 = require("../../../integrations/asc/ascApiKey");
const AppStoreConnectApiKeyQuery_1 = require("../../../credentials/ios/api/graphql/queries/AppStoreConnectApiKeyQuery");
const AscAppLinkMutation_1 = require("../../../graphql/mutations/AscAppLinkMutation");
const AscAppLinkQuery_1 = require("../../../graphql/queries/AscAppLinkQuery");
const log_1 = tslib_1.__importDefault(require("../../../log"));
const ora_1 = require("../../../ora");
const prompts_1 = require("../../../prompts");
const json_1 = require("../../../utils/json");
class IntegrationsAscConnect extends EasCommand_1.default {
    static description = 'connect a project to an App Store Connect app';
    static flags = {
        'api-key-id': core_1.Flags.string({
            description: 'Apple App Store Connect API Key ID',
        }),
        'asc-app-id': core_1.Flags.string({
            description: 'App Store Connect app identifier',
        }),
        'bundle-id': core_1.Flags.string({
            description: 'Filter discovered apps by bundle identifier',
        }),
        ...flags_1.EasNonInteractiveAndJsonFlags,
    };
    static contextDefinition = {
        ...this.ContextOptions.ProjectId,
        ...this.ContextOptions.ProjectDir,
        ...this.ContextOptions.LoggedIn,
        ...this.ContextOptions.Analytics,
        ...this.ContextOptions.Vcs,
    };
    async runAsync() {
        const { flags } = await this.parse(IntegrationsAscConnect);
        const { json, nonInteractive } = (0, flags_1.resolveNonInteractiveAndJsonFlags)(flags);
        if (json) {
            (0, json_1.enableJsonOutput)();
        }
        if (nonInteractive) {
            if (!flags['api-key-id']) {
                throw new errors_1.EasCommandError('--api-key-id is required in non-interactive mode.');
            }
            if (!flags['asc-app-id']) {
                throw new errors_1.EasCommandError('--asc-app-id is required in non-interactive mode.');
            }
        }
        const { projectId, projectDir, loggedIn: { actor, graphqlClient }, analytics, vcsClient, } = await this.getContextAsync(IntegrationsAscConnect, {
            nonInteractive,
        });
        // Step 1: Check current status
        const statusSpinner = (0, ora_1.ora)('Checking current App Store Connect app link status').start();
        const metadata = await AscAppLinkQuery_1.AscAppLinkQuery.getAppMetadataAsync(graphqlClient, projectId);
        statusSpinner.succeed('Checked current status');
        if (metadata.appStoreConnectApp) {
            throw new errors_1.EasCommandError(`Project ${chalk_1.default.bold(metadata.fullName)} is already connected to App Store Connect app ${chalk_1.default.bold(metadata.appStoreConnectApp.ascAppIdentifier)}. Disconnect first with ${chalk_1.default.bold('eas integrations:asc:disconnect')}.`);
        }
        // Step 2: Get ASC API key
        const keysSpinner = (0, ora_1.ora)('Fetching App Store Connect API keys').start();
        const keys = await AppStoreConnectApiKeyQuery_1.AppStoreConnectApiKeyQuery.getAllForAccountAsync(graphqlClient, metadata.ownerAccount.name);
        keysSpinner.succeed(`Found ${keys.length} API key(s)`);
        let apiKeyId = flags['api-key-id'];
        if (!apiKeyId) {
            const credentialsContext = new context_1.CredentialsContext({
                projectInfo: null,
                nonInteractive,
                projectDir,
                user: actor,
                graphqlClient,
                analytics,
                vcsClient,
            });
            apiKeyId = await (0, ascApiKey_1.selectOrCreateAscApiKeyIdAsync)({
                credentialsContext,
                existingKeys: keys,
                ownerAccount: metadata.ownerAccount,
            });
        }
        else {
            const keysByAppleId = keys.filter(key => key.keyIdentifier === apiKeyId);
            if (keysByAppleId.length > 1) {
                throw new errors_1.EasCommandError(`Multiple App Store Connect API keys match Apple key identifier "${apiKeyId}".`);
            }
            else if (keysByAppleId.length === 1) {
                apiKeyId = keysByAppleId[0].id;
            }
            else {
                throw new errors_1.EasCommandError(`No App Store Connect API key found with Apple key identifier "${apiKeyId}".`);
            }
        }
        if (!apiKeyId) {
            throw new errors_1.EasCommandError('No App Store Connect API key selected.');
        }
        // Step 3: Discover remote apps
        const discoverSpinner = (0, ora_1.ora)('Discovering App Store Connect apps').start();
        let remoteApps;
        try {
            remoteApps = await AscAppLinkQuery_1.AscAppLinkQuery.discoverAccessibleAppsAsync(graphqlClient, apiKeyId, flags['bundle-id']);
            discoverSpinner.succeed(`Found ${remoteApps.length} app(s) on App Store Connect`);
        }
        catch (err) {
            discoverSpinner.fail('Failed to discover apps');
            throw err;
        }
        if (remoteApps.length === 0) {
            throw new errors_1.EasCommandError('No accessible apps found on App Store Connect for the selected API key.' +
                (flags['bundle-id']
                    ? ` Try removing the --bundle-id filter or verify the bundle ID "${flags['bundle-id']}".`
                    : ''));
        }
        // Step 4: Select remote app
        let selectedApp;
        if (flags['asc-app-id']) {
            const match = remoteApps.find(app => app.ascAppIdentifier === flags['asc-app-id']);
            if (!match) {
                throw new errors_1.EasCommandError(`App with identifier "${flags['asc-app-id']}" was not found among accessible apps. Run ${chalk_1.default.bold('eas integrations:asc:connect')} interactively to discover available apps.`);
            }
            selectedApp = match;
        }
        else {
            selectedApp = await (0, prompts_1.selectAsync)('Select an App Store Connect app:', remoteApps.map(app => ({
                title: `${app.name} (${app.bundleIdentifier}) [${app.ascAppIdentifier}]`,
                value: app,
            })));
        }
        // Step 5: Create link
        const createSpinner = (0, ora_1.ora)('Connecting project to App Store Connect app').start();
        try {
            await AscAppLinkMutation_1.AscAppLinkMutation.createAppStoreConnectAppAsync(graphqlClient, {
                appId: metadata.id,
                ascAppIdentifier: selectedApp.ascAppIdentifier,
                appStoreConnectApiKeyId: apiKeyId,
            });
            createSpinner.succeed('Connected project to App Store Connect app');
        }
        catch (err) {
            createSpinner.fail('Failed to connect project');
            throw err;
        }
        // Step 6: Refetch and display
        const refetchSpinner = (0, ora_1.ora)('Verifying connection').start();
        const updatedMetadata = await AscAppLinkQuery_1.AscAppLinkQuery.getAppMetadataAsync(graphqlClient, projectId);
        refetchSpinner.succeed('Verified connection');
        if (json) {
            (0, json_1.printJsonOnlyOutput)((0, utils_1.buildJsonOutput)('connect', updatedMetadata));
        }
        else {
            log_1.default.addNewLineIfNone();
            log_1.default.log((0, utils_1.formatAscAppLinkStatus)(updatedMetadata));
        }
    }
}
exports.default = IntegrationsAscConnect;
