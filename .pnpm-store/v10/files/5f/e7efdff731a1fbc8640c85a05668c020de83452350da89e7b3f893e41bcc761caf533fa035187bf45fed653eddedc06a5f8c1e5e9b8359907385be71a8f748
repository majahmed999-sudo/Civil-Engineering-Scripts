"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const better_opn_1 = tslib_1.__importDefault(require("better-opn"));
const EasCommand_1 = tslib_1.__importDefault(require("../../../commandUtils/EasCommand"));
const convex_1 = require("../../../commandUtils/convex");
const ConvexQuery_1 = require("../../../graphql/queries/ConvexQuery");
const ora_1 = require("../../../ora");
class IntegrationsConvexDashboard extends EasCommand_1.default {
    static description = 'open the Convex dashboard for the linked Convex project';
    static contextDefinition = {
        ...this.ContextOptions.ProjectConfig,
    };
    async runAsync() {
        const { privateProjectConfig: { projectId, exp }, loggedIn: { graphqlClient }, } = await this.getContextAsync(IntegrationsConvexDashboard, {
            nonInteractive: false,
            withServerSideEnvironment: null,
        });
        const convexProject = await ConvexQuery_1.ConvexQuery.getConvexProjectByAppIdAsync(graphqlClient, projectId);
        if (!convexProject) {
            (0, convex_1.logNoConvexProject)(exp.slug);
            return;
        }
        const dashboardUrl = (0, convex_1.getConvexProjectDashboardUrl)(convexProject);
        const failedMessage = `Unable to open a web browser. Convex dashboard is available at: ${dashboardUrl}`;
        const spinner = (0, ora_1.ora)(`Opening ${dashboardUrl}`).start();
        try {
            const opened = await (0, better_opn_1.default)(dashboardUrl);
            if (opened) {
                spinner.succeed(`Opened ${dashboardUrl}`);
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
exports.default = IntegrationsConvexDashboard;
