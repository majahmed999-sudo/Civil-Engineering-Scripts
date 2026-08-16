"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const EasCommand_1 = tslib_1.__importDefault(require("../../../../commandUtils/EasCommand"));
const convex_1 = require("../../../../commandUtils/convex");
const flags_1 = require("../../../../commandUtils/flags");
const ConvexMutation_1 = require("../../../../graphql/mutations/ConvexMutation");
const ConvexQuery_1 = require("../../../../graphql/queries/ConvexQuery");
const log_1 = tslib_1.__importStar(require("../../../../log"));
const ora_1 = require("../../../../ora");
const prompts_1 = require("../../../../prompts");
class IntegrationsConvexProjectDelete extends EasCommand_1.default {
    static description = 'remove the Convex project link for the current Expo app from EAS servers';
    static flags = {
        ...flags_1.EASNonInteractiveFlag,
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
        const { flags: { 'non-interactive': nonInteractive, yes }, } = await this.parse(IntegrationsConvexProjectDelete);
        const { privateProjectConfig: { projectId, exp }, loggedIn: { graphqlClient }, } = await this.getContextAsync(IntegrationsConvexProjectDelete, {
            nonInteractive,
            withServerSideEnvironment: null,
        });
        const convexProject = await ConvexQuery_1.ConvexQuery.getConvexProjectByAppIdAsync(graphqlClient, projectId);
        if (!convexProject) {
            (0, convex_1.logNoConvexProject)(exp.slug);
            return;
        }
        log_1.default.addNewLineIfNone();
        log_1.default.log((0, convex_1.formatConvexProject)(convexProject));
        log_1.default.newLine();
        const dashboardUrl = (0, convex_1.getConvexProjectDashboardUrl)(convexProject);
        if (!nonInteractive && !yes) {
            const confirmed = await (0, prompts_1.confirmAsync)({
                message: `Remove this Convex project link from EAS servers? This does not destroy resources on Convex. Convex dashboard: ${(0, log_1.link)(dashboardUrl, { dim: false })}`,
            });
            if (!confirmed) {
                log_1.default.error('Canceled deletion of the Convex project link');
                return;
            }
        }
        else {
            log_1.default.warn(`Removing the Convex project link from EAS servers. This does not destroy resources on Convex: ${dashboardUrl}`);
        }
        const spinner = (0, ora_1.ora)('Removing Convex project link').start();
        try {
            await ConvexMutation_1.ConvexMutation.deleteConvexProjectAsync(graphqlClient, convexProject.id);
            spinner.succeed(`Removed Convex project ${chalk_1.default.bold(convexProject.convexProjectName)} from EAS servers`);
        }
        catch (error) {
            spinner.fail('Failed to remove Convex project link');
            throw error;
        }
    }
}
exports.default = IntegrationsConvexProjectDelete;
