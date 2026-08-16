"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const EasCommand_1 = tslib_1.__importDefault(require("../../../commandUtils/EasCommand"));
const flags_1 = require("../../../commandUtils/flags");
const posthog_1 = require("../../../commandUtils/posthog");
const PostHogMutation_1 = require("../../../graphql/mutations/PostHogMutation");
const PostHogQuery_1 = require("../../../graphql/queries/PostHogQuery");
const log_1 = tslib_1.__importDefault(require("../../../log"));
const ora_1 = require("../../../ora");
const prompts_1 = require("../../../prompts");
const json_1 = require("../../../utils/json");
class IntegrationsPostHogDisconnect extends EasCommand_1.default {
    static description = 'remove the PostHog project link for the current Expo app from EAS servers';
    static flags = {
        ...flags_1.EasNonInteractiveAndJsonFlags,
        yes: core_1.Flags.boolean({
            char: 'y',
            description: 'Skip confirmation prompt',
            default: false,
        }),
    };
    static contextDefinition = {
        ...this.ContextOptions.ProjectConfig,
    };
    async runAsync() {
        const { flags } = await this.parse(IntegrationsPostHogDisconnect);
        const { yes } = flags;
        const { json: jsonFlag, nonInteractive } = (0, flags_1.resolveNonInteractiveAndJsonFlags)(flags);
        if (jsonFlag) {
            (0, json_1.enableJsonOutput)();
        }
        const { privateProjectConfig: { projectId, exp }, loggedIn: { graphqlClient }, } = await this.getContextAsync(IntegrationsPostHogDisconnect, {
            nonInteractive,
            withServerSideEnvironment: null,
        });
        const posthogProject = await PostHogQuery_1.PostHogQuery.getPostHogProjectByAppIdAsync(graphqlClient, projectId);
        if (!posthogProject) {
            if (jsonFlag) {
                (0, json_1.printJsonOnlyOutput)({ id: null });
            }
            else {
                (0, posthog_1.logNoPostHogProject)(exp.slug);
            }
            return;
        }
        if (!jsonFlag) {
            log_1.default.addNewLineIfNone();
            log_1.default.log((0, posthog_1.formatPostHogProject)(posthogProject));
            log_1.default.newLine();
        }
        if (!nonInteractive && !yes) {
            const confirmed = await (0, prompts_1.confirmAsync)({
                message: 'Remove this PostHog project link from EAS servers? This does not delete the project on PostHog.',
            });
            if (!confirmed) {
                log_1.default.warn('Canceled removal of the PostHog project link.');
                return;
            }
        }
        else if (!jsonFlag) {
            log_1.default.warn('Removing the PostHog project link from EAS servers. This does not delete the project on PostHog.');
        }
        const spinner = jsonFlag ? null : (0, ora_1.ora)('Removing PostHog project link').start();
        try {
            await PostHogMutation_1.PostHogMutation.deletePostHogProjectAsync(graphqlClient, posthogProject.id);
            spinner?.succeed(`Removed PostHog project ${chalk_1.default.bold(posthogProject.posthogProjectName)} from EAS servers`);
        }
        catch (error) {
            spinner?.fail('Failed to remove PostHog project link');
            throw error;
        }
        if (jsonFlag) {
            (0, json_1.printJsonOnlyOutput)({ id: posthogProject.id, name: posthogProject.posthogProjectName });
        }
    }
}
exports.default = IntegrationsPostHogDisconnect;
