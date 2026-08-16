"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const EasCommand_1 = tslib_1.__importDefault(require("../../commandUtils/EasCommand"));
const flags_1 = require("../../commandUtils/flags");
const pagination_1 = require("../../commandUtils/pagination");
const AuditLogQuery_1 = require("../../graphql/queries/AuditLogQuery");
const log_1 = tslib_1.__importDefault(require("../../log"));
const ora_1 = require("../../ora");
const prompts_1 = require("../../prompts");
const json_1 = require("../../utils/json");
const renderTextTable_1 = tslib_1.__importDefault(require("../../utils/renderTextTable"));
const AUDIT_LOGS_LIMIT = 50;
class AccountAudit extends EasCommand_1.default {
    static description = 'view the audit logs for an account';
    static args = {
        ACCOUNT_NAME: core_1.Args.string({
            description: 'Account name to view audit logs for. If not provided, the account will be selected interactively (or defaults to the only account if there is just one)',
        }),
    };
    static flags = {
        limit: (0, pagination_1.getLimitFlagWithCustomValues)({ defaultTo: AUDIT_LOGS_LIMIT, limit: 100 }),
        after: core_1.Flags.string({
            description: 'Cursor for pagination. Use the endCursor from a previous query to fetch the next page.',
        }),
        ...flags_1.EasJsonOnlyFlag,
        ...flags_1.EASNonInteractiveFlag,
    };
    static contextDefinition = {
        ...this.ContextOptions.LoggedIn,
    };
    async runAsync() {
        const { args: { ACCOUNT_NAME: accountName }, flags: { limit, after, json: jsonFlag, 'non-interactive': nonInteractive }, } = await this.parse(AccountAudit);
        const json = jsonFlag || nonInteractive;
        if (json) {
            (0, json_1.enableJsonOutput)();
        }
        const { loggedIn: { graphqlClient, actor }, } = await this.getContextAsync(AccountAudit, { nonInteractive });
        const pageSize = limit ?? AUDIT_LOGS_LIMIT;
        let targetAccount;
        const availableAccounts = actor.accounts.map(a => a.name).join(', ');
        if (accountName) {
            const found = actor.accounts.find(a => a.name === accountName);
            if (!found) {
                throw new Error(`Account "${accountName}" not found or you don't have access. Available accounts: ${availableAccounts}`);
            }
            targetAccount = found;
        }
        else if (nonInteractive) {
            throw new Error('ACCOUNT_NAME argument must be provided when running in `--non-interactive` mode.');
        }
        else if (actor.accounts.length === 1) {
            targetAccount = actor.accounts[0];
        }
        else {
            targetAccount = await (0, prompts_1.selectAsync)('Select account to view audit logs for:', actor.accounts.map(account => ({
                title: account.name,
                value: account,
            })));
        }
        if (json) {
            const spinner = (0, ora_1.ora)(`Fetching audit logs for account ${targetAccount.name}`).start();
            try {
                const connection = await AuditLogQuery_1.AuditLogQuery.getAllForAccountAsync(graphqlClient, targetAccount.id, {
                    first: pageSize,
                    after,
                });
                spinner.stop();
                (0, json_1.printJsonOnlyOutput)({
                    auditLogs: connection.edges.map(edge => edge.node),
                    pageInfo: connection.pageInfo,
                });
            }
            catch (error) {
                spinner.fail(`Failed to fetch audit logs for account ${targetAccount.name}`);
                throw error;
            }
            return;
        }
        let cursor = after;
        do {
            const spinner = (0, ora_1.ora)(`Fetching audit logs for account ${targetAccount.name}`).start();
            const connection = await AuditLogQuery_1.AuditLogQuery.getAllForAccountAsync(graphqlClient, targetAccount.id, {
                first: pageSize,
                after: cursor,
            });
            spinner.stop();
            const logs = connection.edges.map(edge => edge.node);
            renderPageOfAuditLogs(logs);
            if (!connection.pageInfo.hasNextPage) {
                break;
            }
            cursor = connection.pageInfo.endCursor ?? undefined;
        } while (cursor && (await (0, prompts_1.confirmAsync)({ message: 'Load more audit logs?' })));
    }
}
exports.default = AccountAudit;
function renderPageOfAuditLogs(logs) {
    if (logs.length === 0) {
        log_1.default.log('No audit logs found.');
        return;
    }
    log_1.default.log((0, renderTextTable_1.default)(['Date', 'Actor', 'Action', 'Entity', 'Message'], logs.map(log => [
        new Date(log.createdAt).toLocaleString(),
        log.actor?.displayName ?? 'Unknown',
        log.targetEntityMutationType,
        log.targetEntityTypePublicName,
        log.websiteMessage,
    ])));
    log_1.default.addNewLineIfNone();
}
