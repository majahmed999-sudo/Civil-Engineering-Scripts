"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const url_1 = require("../../build/utils/url");
const EasCommand_1 = tslib_1.__importDefault(require("../../commandUtils/EasCommand"));
const flags_1 = require("../../commandUtils/flags");
const pagination_1 = require("../../commandUtils/pagination");
const generated_1 = require("../../graphql/generated");
const DeviceRunSessionQuery_1 = require("../../graphql/queries/DeviceRunSessionQuery");
const log_1 = tslib_1.__importStar(require("../../log"));
const ora_1 = require("../../ora");
const utils_1 = require("../../simulator/utils");
const date_1 = require("../../utils/date");
const json_1 = require("../../utils/json");
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const STATUS_FLAG_VALUES = {
    [generated_1.DeviceRunSessionStatus.New]: 'new',
    [generated_1.DeviceRunSessionStatus.InProgress]: 'in-progress',
    [generated_1.DeviceRunSessionStatus.Stopped]: 'stopped',
    [generated_1.DeviceRunSessionStatus.Errored]: 'errored',
};
const STATUS_BY_FLAG_VALUE = Object.fromEntries(Object.entries(STATUS_FLAG_VALUES).map(([status, value]) => [
    value,
    status,
]));
const PLATFORM_FLAG_VALUES = {
    [generated_1.AppPlatform.Android]: 'android',
    [generated_1.AppPlatform.Ios]: 'ios',
};
const PLATFORM_BY_FLAG_VALUE = Object.fromEntries(Object.entries(PLATFORM_FLAG_VALUES).map(([platform, value]) => [value, platform]));
class SimulatorList extends EasCommand_1.default {
    static hidden = true;
    static description = '[EXPERIMENTAL] list remote simulator sessions for the current project';
    static flags = {
        status: core_1.Flags.option({
            description: 'Filter by session status (repeatable)',
            options: Object.values(STATUS_FLAG_VALUES),
            multiple: true,
        })(),
        type: core_1.Flags.option({
            description: 'Filter by session type (repeatable)',
            options: Object.values(utils_1.DEVICE_RUN_SESSION_TYPE_FLAG_VALUES),
            multiple: true,
        })(),
        platform: core_1.Flags.option({
            description: 'Filter by device platform (repeatable)',
            options: Object.values(PLATFORM_FLAG_VALUES),
            multiple: true,
        })(),
        limit: (0, pagination_1.getLimitFlagWithCustomValues)({ defaultTo: DEFAULT_LIMIT, limit: MAX_LIMIT }),
        after: core_1.Flags.string({
            description: 'Cursor for pagination. Use the endCursor from a previous query to fetch the next page.',
        }),
        ...flags_1.EasNonInteractiveAndJsonFlags,
    };
    static contextDefinition = {
        ...this.ContextOptions.ProjectId,
        ...this.ContextOptions.LoggedIn,
    };
    async runAsync() {
        const { flags } = await this.parse(SimulatorList);
        const { json: jsonFlag, nonInteractive } = (0, flags_1.resolveNonInteractiveAndJsonFlags)(flags);
        if (jsonFlag) {
            (0, json_1.enableJsonOutput)();
        }
        const { projectId, loggedIn: { graphqlClient }, } = await this.getContextAsync(SimulatorList, {
            nonInteractive,
        });
        const filter = {};
        if (flags.status && flags.status.length > 0) {
            filter.statuses = flags.status.map(value => STATUS_BY_FLAG_VALUE[value]);
        }
        if (flags.type && flags.type.length > 0) {
            filter.types = flags.type.map(value => utils_1.DEVICE_RUN_SESSION_TYPE_BY_FLAG_VALUE[value]);
        }
        if (flags.platform && flags.platform.length > 0) {
            filter.platforms = flags.platform.map(value => PLATFORM_BY_FLAG_VALUE[value]);
        }
        const limit = flags.limit ?? DEFAULT_LIMIT;
        const fetchSpinner = jsonFlag ? null : (0, ora_1.ora)('Fetching simulator sessions').start();
        let connection;
        try {
            connection = await DeviceRunSessionQuery_1.DeviceRunSessionQuery.listByAppIdAsync(graphqlClient, {
                appId: projectId,
                first: limit,
                after: flags.after,
                filter: Object.keys(filter).length > 0 ? filter : undefined,
            });
            fetchSpinner?.succeed(`Fetched ${connection.edges.length} simulator session(s)`);
        }
        catch (err) {
            fetchSpinner?.fail('Failed to fetch simulator sessions');
            throw err;
        }
        const sessions = connection.edges.map(edge => edge.node);
        if (jsonFlag) {
            (0, json_1.printJsonOnlyOutput)({
                sessions: sessions.map(session => ({
                    id: session.id,
                    type: (0, utils_1.deviceRunSessionTypeToFlagValue)(session.type),
                    status: session.status,
                    platform: session.platform,
                    createdAt: session.createdAt,
                    startedAt: session.startedAt ?? undefined,
                    finishedAt: session.finishedAt ?? undefined,
                    deviceRunSessionUrl: (0, url_1.getDeviceRunSessionUrl)(session.app.ownerAccount.name, session.app.slug, session.id),
                })),
                pageInfo: connection.pageInfo,
            });
            return;
        }
        if (sessions.length === 0) {
            log_1.default.newLine();
            log_1.default.log('No simulator sessions found.');
            return;
        }
        log_1.default.newLine();
        const formattedEntries = sessions.map(session => {
            const deviceRunSessionUrl = (0, url_1.getDeviceRunSessionUrl)(session.app.ownerAccount.name, session.app.slug, session.id);
            const lines = [
                `ID:       ${session.id}`,
                `Type:     ${session.type}`,
                `Status:   ${session.status}`,
                `Platform: ${session.platform}`,
                `Created:  ${(0, date_1.fromNow)(new Date(session.createdAt))} ago`,
                `URL:      ${(0, log_1.link)(deviceRunSessionUrl)}`,
            ];
            return lines.join('\n');
        });
        log_1.default.log(formattedEntries.join(`\n\n${chalk_1.default.dim('———')}\n\n`));
        if (connection.pageInfo.hasNextPage && connection.pageInfo.endCursor) {
            log_1.default.newLine();
            log_1.default.log(`More results available. Re-run with --after ${connection.pageInfo.endCursor} to fetch the next page.`);
        }
    }
}
exports.default = SimulatorList;
