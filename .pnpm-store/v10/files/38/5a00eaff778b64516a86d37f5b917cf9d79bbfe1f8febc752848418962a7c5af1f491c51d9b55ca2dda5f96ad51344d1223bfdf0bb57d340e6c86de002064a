"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const EasCommand_1 = tslib_1.__importDefault(require("../../commandUtils/EasCommand"));
const flags_1 = require("../../commandUtils/flags");
const UpdateInsightsQuery_1 = require("../../graphql/queries/UpdateInsightsQuery");
const UpdateQuery_1 = require("../../graphql/queries/UpdateQuery");
const timeRange_1 = require("../../insights/timeRange");
const log_1 = tslib_1.__importDefault(require("../../log"));
const formatInsights_1 = require("../../update/insights/formatInsights");
const utils_1 = require("../../update/utils");
const json_1 = require("../../utils/json");
class UpdateView extends EasCommand_1.default {
    static description = 'update group details';
    static args = {
        groupId: core_1.Args.string({
            required: true,
            description: 'The ID of an update group, or the ID of a platform-specific update.',
        }),
    };
    static flags = {
        insights: core_1.Flags.boolean({
            description: 'Also show insights (launches, crash rate, unique users, payload size) for the update group.',
            default: false,
        }),
        days: core_1.Flags.integer({
            description: 'Show insights from the last N days (default 7). Only used with --insights.',
            min: 1,
            exclusive: ['start', 'end'],
        }),
        start: core_1.Flags.string({
            description: 'Start of insights time range (ISO date). Only used with --insights.',
            exclusive: ['days'],
        }),
        end: core_1.Flags.string({
            description: 'End of insights time range (ISO date). Only used with --insights.',
            exclusive: ['days'],
        }),
        ...flags_1.EasJsonOnlyFlag,
    };
    static contextDefinition = {
        ...this.ContextOptions.LoggedIn,
    };
    async runAsync() {
        const { args: { groupId: idArg }, flags: { json: jsonFlag, insights: insightsFlag, days, start, end }, } = await this.parse(UpdateView);
        if (!insightsFlag && (days !== undefined || start !== undefined || end !== undefined)) {
            throw new Error('--days, --start, and --end can only be used with --insights.');
        }
        const { loggedIn: { graphqlClient }, } = await this.getContextAsync(UpdateView, { nonInteractive: true });
        if (jsonFlag) {
            (0, json_1.enableJsonOutput)();
        }
        const { groupId, updatesByGroup } = await UpdateView.resolveUpdateGroupAsync(graphqlClient, idArg);
        let insightsSummary = null;
        if (insightsFlag) {
            const { daysBack, startTime, endTime } = (0, timeRange_1.resolveInsightsTimeRange)({ days, start, end });
            const updatesWithInsights = await UpdateInsightsQuery_1.UpdateInsightsQuery.viewUpdateGroupInsightsAsync(graphqlClient, { groupId, startTime, endTime });
            insightsSummary = (0, formatInsights_1.toUpdateInsightsSummary)(groupId, updatesWithInsights, {
                startTime,
                endTime,
                daysBack,
            });
        }
        if (jsonFlag) {
            if (insightsSummary) {
                (0, json_1.printJsonOnlyOutput)({
                    updates: (0, utils_1.getUpdateJsonInfosForUpdates)(updatesByGroup),
                    insights: (0, formatInsights_1.buildUpdateInsightsJson)(insightsSummary),
                });
            }
            else {
                (0, json_1.printJsonOnlyOutput)((0, utils_1.getUpdateJsonInfosForUpdates)(updatesByGroup));
            }
        }
        else {
            const [updateGroupDescription] = (0, utils_1.getUpdateGroupDescriptions)([updatesByGroup]);
            log_1.default.log(chalk_1.default.bold('Update group:'));
            log_1.default.log((0, utils_1.formatUpdateGroup)(updateGroupDescription));
            if (insightsSummary) {
                log_1.default.addNewLineIfNone();
                log_1.default.log((0, formatInsights_1.buildUpdateInsightsTable)(insightsSummary));
            }
        }
    }
    /**
     * Resolves the provided ID into an update group and its updates. The ID may be either an
     * update group ID or the ID of a single platform-specific update. We first try to look it up
     * as a group; if no updates are found, we fall back to resolving it as a platform-specific
     * update and then fetch the group that update belongs to.
     */
    static async resolveUpdateGroupAsync(graphqlClient, id) {
        try {
            const updatesByGroup = await UpdateQuery_1.UpdateQuery.viewUpdateGroupAsync(graphqlClient, { groupId: id });
            return { groupId: id, updatesByGroup };
        }
        catch (groupError) {
            let update;
            try {
                update = await UpdateQuery_1.UpdateQuery.viewByUpdateAsync(graphqlClient, { updateId: id });
            }
            catch {
                // The ID is neither a valid update group nor a valid platform-specific update; surface
                // the original group lookup error since the group ID is the primary input.
                throw groupError;
            }
            const updatesByGroup = await UpdateQuery_1.UpdateQuery.viewUpdateGroupAsync(graphqlClient, {
                groupId: update.group,
            });
            return { groupId: update.group, updatesByGroup };
        }
    }
}
exports.default = UpdateView;
