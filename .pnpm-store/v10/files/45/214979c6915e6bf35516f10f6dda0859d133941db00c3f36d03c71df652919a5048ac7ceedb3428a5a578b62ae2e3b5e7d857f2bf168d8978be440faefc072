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
const projectUtils_1 = require("../../../../project/projectUtils");
const prompts_1 = require("../../../../prompts");
class IntegrationsConvexTeamDelete extends EasCommand_1.default {
    static description = "remove a Convex team link from the current Expo app owner account's EAS servers";
    static args = {
        CONVEX_TEAM: core_1.Args.string({
            required: false,
            description: 'Slug of the Convex team to remove',
        }),
    };
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
        const { args: { CONVEX_TEAM: team }, flags: { 'non-interactive': nonInteractive, yes }, } = await this.parse(IntegrationsConvexTeamDelete);
        const { privateProjectConfig: { projectId }, loggedIn: { graphqlClient }, } = await this.getContextAsync(IntegrationsConvexTeamDelete, {
            nonInteractive,
            withServerSideEnvironment: null,
        });
        const account = await (0, projectUtils_1.getOwnerAccountForProjectIdAsync)(graphqlClient, projectId);
        const connections = await ConvexQuery_1.ConvexQuery.getConvexTeamConnectionsByAccountIdAsync(graphqlClient, account.id);
        if (connections.length === 0) {
            (0, convex_1.logNoConvexTeams)(account.name);
            return;
        }
        const connection = await this.resolveConnectionAsync(connections, team, nonInteractive);
        log_1.default.addNewLineIfNone();
        log_1.default.log((0, convex_1.formatConvexTeamConnection)(connection));
        log_1.default.newLine();
        const dashboardUrl = (0, convex_1.getConvexTeamDashboardUrl)(connection);
        if (!nonInteractive && !yes) {
            const confirmed = await (0, prompts_1.confirmAsync)({
                message: `Remove this Convex team link from EAS servers? This does not destroy resources on Convex. Convex dashboard: ${(0, log_1.link)(dashboardUrl, { dim: false })}`,
            });
            if (!confirmed) {
                log_1.default.error('Canceled deletion of the Convex team link');
                return;
            }
        }
        else {
            log_1.default.warn(`Removing the Convex team link from EAS servers. This does not destroy resources on Convex: ${dashboardUrl}`);
        }
        const spinner = (0, ora_1.ora)('Removing Convex team link').start();
        try {
            await ConvexMutation_1.ConvexMutation.deleteConvexTeamConnectionAsync(graphqlClient, connection.id);
            spinner.succeed(`Removed Convex team ${chalk_1.default.bold((0, convex_1.formatConvexTeam)(connection))} from EAS servers`);
        }
        catch (error) {
            spinner.fail('Failed to remove Convex team link');
            throw error;
        }
    }
    async resolveConnectionAsync(connections, team, nonInteractive) {
        if (team) {
            const connection = connections.find(item => item.convexTeamSlug === team || item.convexTeamName === team || item.id === team);
            if (!connection) {
                throw new Error(`Convex team ${team} is not linked to this account.`);
            }
            return connection;
        }
        if (connections.length === 1) {
            return connections[0];
        }
        if (nonInteractive) {
            throw new Error('Convex team slug must be provided in non-interactive mode when multiple Convex team links exist.');
        }
        return await (0, prompts_1.selectAsync)('Select a Convex team link to remove', connections.map(connection => ({
            title: (0, convex_1.formatConvexTeam)(connection),
            value: connection,
        })));
    }
}
exports.default = IntegrationsConvexTeamDelete;
