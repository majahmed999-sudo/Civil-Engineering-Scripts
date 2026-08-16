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
class IntegrationsConvexTeamInvite extends EasCommand_1.default {
    static description = 'send a Convex team invitation to your verified email address';
    static args = {
        CONVEX_TEAM: core_1.Args.string({
            required: false,
            description: 'Slug of the Convex team to invite yourself to',
        }),
    };
    static flags = {
        ...flags_1.EASNonInteractiveFlag,
    };
    static contextDefinition = {
        ...this.ContextOptions.ProjectConfig,
    };
    async runAsync() {
        const { args: { CONVEX_TEAM: team }, flags: { 'non-interactive': nonInteractive }, } = await this.parse(IntegrationsConvexTeamInvite);
        const { privateProjectConfig: { projectId }, loggedIn: { graphqlClient, actor }, } = await this.getContextAsync(IntegrationsConvexTeamInvite, {
            nonInteractive,
            withServerSideEnvironment: null,
        });
        const email = this.getActorEmail(actor);
        if (!email) {
            log_1.default.warn(`Could not determine your verified email address, so no Convex team invitation was sent. Run ${chalk_1.default.cyan('eas integrations:convex:team:invite')} after signing in with a user account.`);
            return;
        }
        const account = await (0, projectUtils_1.getOwnerAccountForProjectIdAsync)(graphqlClient, projectId);
        const connections = await ConvexQuery_1.ConvexQuery.getConvexTeamConnectionsByAccountIdAsync(graphqlClient, account.id);
        if (connections.length === 0) {
            (0, convex_1.logNoConvexTeams)(account.name);
            return;
        }
        const connection = await this.resolveConnectionAsync(connections, team, nonInteractive);
        log_1.default.addNewLineIfNone();
        this.logTeam(connection);
        this.logPreviousInvite(connection);
        log_1.default.newLine();
        if (connection.hasBeenClaimed) {
            log_1.default.warn('Convex team has already been claimed. Skipping Convex team invitation.');
            return;
        }
        if (!(await (0, convex_1.confirmRecentConvexInviteAsync)(connection, { nonInteractive }))) {
            log_1.default.warn('Skipped sending Convex team invitation.');
            return;
        }
        const spinner = (0, ora_1.ora)(`Sending Convex team invitation to ${email}`).start();
        try {
            await ConvexMutation_1.ConvexMutation.sendConvexTeamInviteToVerifiedEmailAsync(graphqlClient, {
                convexTeamConnectionId: connection.id,
            });
            spinner.succeed(`Sent Convex team invitation to ${chalk_1.default.bold(email)} for ${chalk_1.default.bold((0, convex_1.formatConvexTeam)(connection))}`);
            log_1.default.log(`Convex dashboard: ${(0, log_1.link)((0, convex_1.getConvexTeamDashboardUrl)(connection), { dim: false })}`);
        }
        catch (error) {
            spinner.fail('Failed to send Convex team invitation');
            throw error;
        }
    }
    getActorEmail(actor) {
        return 'email' in actor && typeof actor.email === 'string' ? actor.email : null;
    }
    logTeam(connection) {
        log_1.default.log(chalk_1.default.bold(`Convex team ${(0, convex_1.formatConvexTeam)(connection)}`));
        log_1.default.log(`${chalk_1.default.bold('Dashboard')}: ${(0, log_1.link)((0, convex_1.getConvexTeamDashboardUrl)(connection), { dim: false })}`);
        log_1.default.log(`${chalk_1.default.bold('Claimed')}: ${connection.hasBeenClaimed ? 'Yes' : 'No'}`);
    }
    logPreviousInvite(connection) {
        if (!connection.invitedEmail && !connection.invitedAt) {
            return;
        }
        log_1.default.newLine();
        log_1.default.log(chalk_1.default.bold('Previous invite'));
        if (connection.invitedEmail) {
            log_1.default.log(`${chalk_1.default.bold('Email')}: ${connection.invitedEmail}`);
        }
        if (connection.invitedAt) {
            log_1.default.log(`${chalk_1.default.bold('Sent at')}: ${(0, convex_1.formatConvexInviteTimestamp)(connection.invitedAt)}`);
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
        return await (0, prompts_1.selectAsync)('Select a Convex team link to invite yourself to', connections.map(connection => ({
            title: (0, convex_1.formatConvexTeam)(connection),
            value: connection,
        })));
    }
}
exports.default = IntegrationsConvexTeamInvite;
