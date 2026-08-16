"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const better_opn_1 = tslib_1.__importDefault(require("better-opn"));
const EasCommand_1 = tslib_1.__importDefault(require("../../../commandUtils/EasCommand"));
const flags_1 = require("../../../commandUtils/flags");
const posthog_1 = require("../../../commandUtils/posthog");
const generated_1 = require("../../../graphql/generated");
const PostHogMutation_1 = require("../../../graphql/mutations/PostHogMutation");
const PostHogQuery_1 = require("../../../graphql/queries/PostHogQuery");
const log_1 = tslib_1.__importDefault(require("../../../log"));
const ora_1 = require("../../../ora");
const json_1 = require("../../../utils/json");
class IntegrationsPostHogDashboard extends EasCommand_1.default {
    static description = 'open the PostHog dashboard for the linked PostHog project';
    static flags = {
        'show-link': core_1.Flags.boolean({
            default: false,
            description: 'Print the signed-in dashboard URL in addition to opening it. The URL contains a single-use login token.',
        }),
        ...flags_1.EasNonInteractiveAndJsonFlags,
    };
    static contextDefinition = {
        ...this.ContextOptions.ProjectConfig,
    };
    async runAsync() {
        const { flags } = await this.parse(IntegrationsPostHogDashboard);
        const { json: jsonFlag, nonInteractive } = (0, flags_1.resolveNonInteractiveAndJsonFlags)(flags);
        const showLink = flags['show-link'];
        if (jsonFlag) {
            (0, json_1.enableJsonOutput)();
        }
        const { privateProjectConfig: { projectId, exp }, loggedIn: { graphqlClient }, } = await this.getContextAsync(IntegrationsPostHogDashboard, {
            nonInteractive,
            withServerSideEnvironment: null,
        });
        const posthogProject = await PostHogQuery_1.PostHogQuery.getPostHogProjectByAppIdAsync(graphqlClient, projectId);
        if (!posthogProject) {
            if (jsonFlag) {
                (0, json_1.printJsonOnlyOutput)({ dashboardUrl: null });
            }
            else {
                (0, posthog_1.logNoPostHogProject)(exp.slug);
            }
            return;
        }
        const staticDashboardUrl = (0, posthog_1.getPostHogProjectDashboardUrl)(posthogProject);
        // Signed-in deep links are single-use and expire in 10 minutes, so only the interactive
        // browser-open benefits from one. JSON/non-interactive consumers may store the URL, so give
        // them the stable (login-required) dashboard URL instead.
        if (jsonFlag) {
            (0, json_1.printJsonOnlyOutput)({ dashboardUrl: staticDashboardUrl });
            return;
        }
        if (nonInteractive) {
            log_1.default.log(staticDashboardUrl);
            return;
        }
        let dashboardUrl;
        try {
            dashboardUrl = await PostHogMutation_1.PostHogMutation.createPostHogDeepLinkAsync(graphqlClient, {
                posthogOrganizationConnectionId: posthogProject.posthogOrganizationConnection.id,
                appId: projectId,
                purpose: generated_1.PostHogDeepLinkPurpose.Dashboard,
            });
        }
        catch (error) {
            log_1.default.debug(`Failed to mint a PostHog deep link; opening the static dashboard URL: ${error}`);
            dashboardUrl = staticDashboardUrl;
        }
        const openLabel = showLink ? dashboardUrl : 'your PostHog dashboard';
        const failedMessage = `Unable to open a web browser. PostHog dashboard is available at: ${showLink ? dashboardUrl : staticDashboardUrl}`;
        const spinner = (0, ora_1.ora)(`Opening ${openLabel}`).start();
        try {
            const opened = await (0, better_opn_1.default)(dashboardUrl);
            if (opened) {
                spinner.succeed(`Opened ${openLabel}`);
            }
            else {
                spinner.fail(failedMessage);
            }
        }
        catch (error) {
            spinner.fail(failedMessage);
            throw error;
        }
    }
}
exports.default = IntegrationsPostHogDashboard;
