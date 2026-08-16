"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const EasCommand_1 = tslib_1.__importDefault(require("../../../commandUtils/EasCommand"));
const convex_1 = require("../../../commandUtils/convex");
const ConvexQuery_1 = require("../../../graphql/queries/ConvexQuery");
const log_1 = tslib_1.__importDefault(require("../../../log"));
class IntegrationsConvexProject extends EasCommand_1.default {
    static description = 'display the Convex project linked to the current Expo app';
    static contextDefinition = {
        ...this.ContextOptions.ProjectConfig,
    };
    async runAsync() {
        const { privateProjectConfig: { projectId, exp }, loggedIn: { graphqlClient }, } = await this.getContextAsync(IntegrationsConvexProject, {
            nonInteractive: false,
            withServerSideEnvironment: null,
        });
        const convexProject = await ConvexQuery_1.ConvexQuery.getConvexProjectByAppIdAsync(graphqlClient, projectId);
        if (!convexProject) {
            (0, convex_1.logNoConvexProject)(exp.slug);
            return;
        }
        log_1.default.log(chalk_1.default.bold(`Convex project linked to ${exp.slug}`));
        log_1.default.log((0, convex_1.formatConvexProject)(convexProject));
    }
}
exports.default = IntegrationsConvexProject;
