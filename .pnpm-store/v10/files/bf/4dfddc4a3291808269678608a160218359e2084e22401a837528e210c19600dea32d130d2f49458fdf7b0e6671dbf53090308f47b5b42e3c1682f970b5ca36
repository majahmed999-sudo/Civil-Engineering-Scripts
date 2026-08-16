"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const EasCommand_1 = tslib_1.__importDefault(require("../../../commandUtils/EasCommand"));
const convex_1 = require("../../../commandUtils/convex");
const ConvexQuery_1 = require("../../../graphql/queries/ConvexQuery");
const log_1 = tslib_1.__importDefault(require("../../../log"));
const projectUtils_1 = require("../../../project/projectUtils");
class IntegrationsConvexTeam extends EasCommand_1.default {
    static description = "display Convex teams linked to the current Expo app's owner account";
    static contextDefinition = {
        ...this.ContextOptions.ProjectConfig,
    };
    async runAsync() {
        const { privateProjectConfig: { projectId }, loggedIn: { graphqlClient }, } = await this.getContextAsync(IntegrationsConvexTeam, {
            nonInteractive: false,
            withServerSideEnvironment: null,
        });
        const account = await (0, projectUtils_1.getOwnerAccountForProjectIdAsync)(graphqlClient, projectId);
        const connections = await ConvexQuery_1.ConvexQuery.getConvexTeamConnectionsByAccountIdAsync(graphqlClient, account.id);
        if (connections.length === 0) {
            (0, convex_1.logNoConvexTeams)(account.name);
            return;
        }
        log_1.default.log(chalk_1.default.bold(`Convex teams linked to @${account.name}`));
        for (const [index, connection] of connections.entries()) {
            if (index > 0) {
                log_1.default.newLine();
            }
            log_1.default.log((0, convex_1.formatConvexTeamConnection)(connection));
        }
    }
}
exports.default = IntegrationsConvexTeam;
