"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const eas_build_job_1 = require("@expo/eas-build-job");
const core_1 = require("@oclif/core");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const EasCommand_1 = tslib_1.__importDefault(require("../../../commandUtils/EasCommand"));
const flags_1 = require("../../../commandUtils/flags");
const pagination_1 = require("../../../commandUtils/pagination");
const ChannelQuery_1 = require("../../../graphql/queries/ChannelQuery");
const EmbeddedUpdateQuery_1 = require("../../../graphql/queries/EmbeddedUpdateQuery");
const AppPlatform_1 = require("../../../graphql/types/AppPlatform");
const log_1 = tslib_1.__importDefault(require("../../../log"));
const prompts_1 = require("../../../prompts");
const date_1 = require("../../../utils/date");
const formatFields_1 = tslib_1.__importDefault(require("../../../utils/formatFields"));
const json_1 = require("../../../utils/json");
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 50;
const CHANNELS_LIMIT = 50;
class UpdateEmbeddedList extends EasCommand_1.default {
    static description = 'list embedded updates registered with EAS Update for this project';
    static flags = {
        platform: core_1.Flags.option({
            char: 'p',
            description: 'Filter by platform',
            options: [eas_build_job_1.Platform.IOS, eas_build_job_1.Platform.ANDROID],
        })(),
        'runtime-version': core_1.Flags.string({
            description: 'Filter by runtime version',
        }),
        channel: core_1.Flags.string({
            description: 'Filter by channel name (pass "all" to skip the channel prompt)',
        }),
        limit: (0, pagination_1.getLimitFlagWithCustomValues)({ defaultTo: DEFAULT_LIMIT, limit: MAX_LIMIT }),
        'after-cursor': core_1.Flags.string({
            description: 'Return items after this cursor (for pagination)',
        }),
        ...flags_1.EasNonInteractiveAndJsonFlags,
    };
    static contextDefinition = {
        ...this.ContextOptions.ProjectId,
        ...this.ContextOptions.LoggedIn,
    };
    async runAsync() {
        const { flags } = await this.parse(UpdateEmbeddedList);
        const { json: jsonFlag, nonInteractive } = (0, flags_1.resolveNonInteractiveAndJsonFlags)(flags);
        const { projectId, loggedIn: { graphqlClient }, } = await this.getContextAsync(UpdateEmbeddedList, { nonInteractive });
        if (jsonFlag) {
            (0, json_1.enableJsonOutput)();
        }
        const platform = flags.platform
            ? (0, AppPlatform_1.toAppPlatform)(flags.platform)
            : undefined;
        // Resolve channel filter:
        // - `--channel <name>`: use it
        // - `--channel all` (or no flag in non-interactive / json): no channel filter
        // - no flag in interactive: prompt with the project's channels + "All channels"
        let channel;
        if (flags.channel) {
            channel = flags.channel.toLowerCase() === 'all' ? undefined : flags.channel;
        }
        else if (!nonInteractive && !jsonFlag) {
            channel = await promptForChannelAsync(graphqlClient, projectId);
        }
        const filter = platform || flags['runtime-version'] || channel
            ? {
                platform,
                runtimeVersion: flags['runtime-version'],
                channel,
            }
            : undefined;
        const limit = flags.limit ?? DEFAULT_LIMIT;
        const connection = await EmbeddedUpdateQuery_1.EmbeddedUpdateQuery.viewPaginatedAsync(graphqlClient, {
            appId: projectId,
            filter,
            first: limit,
            after: flags['after-cursor'],
        });
        const embeddedUpdates = connection.edges.map(e => e.node);
        if (jsonFlag) {
            (0, json_1.printJsonOnlyOutput)({
                embeddedUpdates,
                pageInfo: connection.pageInfo,
            });
            return;
        }
        if (embeddedUpdates.length === 0) {
            log_1.default.log('No embedded updates found.');
            return;
        }
        log_1.default.addNewLineIfNone();
        log_1.default.log(chalk_1.default.bold(`Embedded updates (${embeddedUpdates.length}${connection.pageInfo.hasNextPage ? '+' : ''}):`));
        log_1.default.newLine();
        log_1.default.log(embeddedUpdates.map(formatEmbeddedUpdateRow).join(`\n\n${chalk_1.default.dim('———')}\n\n`));
        if (connection.pageInfo.hasNextPage && connection.pageInfo.endCursor) {
            log_1.default.newLine();
            log_1.default.log(chalk_1.default.dim(`Showing ${embeddedUpdates.length}. For the next page, run with --after-cursor ${connection.pageInfo.endCursor}`));
        }
    }
}
exports.default = UpdateEmbeddedList;
// Sentinel for the "All channels" option. We can't use `undefined` here because
// the underlying `prompts` library substitutes a choice's index when its value
// is undefined, which then leaks into the GraphQL filter.
const ALL_CHANNELS = '__embedded_update_list__all_channels__';
async function promptForChannelAsync(graphqlClient, projectId) {
    const channels = await ChannelQuery_1.ChannelQuery.viewUpdateChannelsOnAppAsync(graphqlClient, {
        appId: projectId,
        offset: 0,
        limit: CHANNELS_LIMIT,
    });
    if (channels.length === 0) {
        // Nothing to choose from — fall back to listing everything.
        return undefined;
    }
    const selected = await (0, prompts_1.selectAsync)('Filter embedded updates by which channel?', [
        { title: 'All channels', value: ALL_CHANNELS },
        ...channels.map(c => ({ title: c.name, value: c.name })),
    ]);
    return selected === ALL_CHANNELS ? undefined : selected;
}
function formatEmbeddedUpdateRow(embeddedUpdate) {
    const createdAt = new Date(embeddedUpdate.createdAt);
    return (0, formatFields_1.default)([
        { label: 'ID', value: embeddedUpdate.id },
        { label: 'Platform', value: embeddedUpdate.platform.toLowerCase() },
        { label: 'Runtime version', value: embeddedUpdate.runtimeVersion },
        { label: 'Channel', value: embeddedUpdate.channel },
        { label: 'Created', value: `${(0, date_1.fromNow)(createdAt)} ago` },
    ]);
}
