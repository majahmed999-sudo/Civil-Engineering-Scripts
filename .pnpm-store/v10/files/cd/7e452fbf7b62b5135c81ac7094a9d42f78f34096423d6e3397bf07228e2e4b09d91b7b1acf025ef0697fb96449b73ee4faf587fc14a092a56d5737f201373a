"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const EasCommand_1 = tslib_1.__importDefault(require("../../commandUtils/EasCommand"));
const flags_1 = require("../../commandUtils/flags");
const pagination_1 = require("../../commandUtils/pagination");
const log_1 = tslib_1.__importDefault(require("../../log"));
const ObserveQuery_1 = require("../../graphql/queries/ObserveQuery");
const fetchCustomEvents_1 = require("../../observe/fetchCustomEvents");
const flags_2 = require("../../observe/flags");
const formatCustomEvents_1 = require("../../observe/formatCustomEvents");
const platforms_1 = require("../../observe/platforms");
const resolveProjectContext_1 = require("../../observe/resolveProjectContext");
const startAndEndTime_1 = require("../../observe/startAndEndTime");
const json_1 = require("../../utils/json");
const DEFAULT_EVENTS_LIMIT = 10;
class ObserveEvents extends EasCommand_1.default {
    static description = 'display individual events emitted by the app via `logEvent`, filtered by the event name in the argument. With no arguments, a list of the available event names and associated event counts is returned.';
    static args = {
        eventName: core_1.Args.string({
            description: 'Event name to filter by',
            required: false,
        }),
    };
    static flags = {
        ...flags_2.ObservePlatformFlag,
        ...flags_2.ObserveAfterFlag,
        limit: (0, pagination_1.getLimitFlagWithCustomValues)({
            defaultTo: DEFAULT_EVENTS_LIMIT,
            limit: 100,
        }),
        ...flags_2.ObserveTimeRangeFlags,
        ...flags_2.ObserveAppVersionFlag,
        ...flags_2.ObserveUpdateIdFlag,
        'session-id': core_1.Flags.string({
            description: 'Filter by session ID',
        }),
        'all-events': core_1.Flags.boolean({
            description: 'When no event name argument is provided, list all events across all event names instead of a summary of event names + counts.',
            default: false,
        }),
        ...flags_2.ObserveProjectIdFlag,
        ...flags_1.EasNonInteractiveAndJsonFlags,
    };
    static contextDefinition = {
        ...this.ContextOptions.ProjectId,
        ...this.ContextOptions.LoggedIn,
    };
    static loggedInOnlyContextDefinition = {
        ...this.ContextOptions.LoggedIn,
    };
    async runAsync() {
        const { flags, args } = await this.parse(ObserveEvents);
        if (args.eventName && flags['all-events']) {
            throw new Error('--all-events cannot be combined with an event name argument. Pass an event name to filter by it, or pass --all-events to list all events across all event names.');
        }
        const { projectId, graphqlClient } = await (0, resolveProjectContext_1.resolveObserveCommandContextAsync)({
            command: this,
            commandClass: ObserveEvents,
            loggedInOnlyContextDefinition: ObserveEvents.loggedInOnlyContextDefinition,
            projectIdOverride: flags['project-id'],
            nonInteractive: flags['non-interactive'],
        });
        if (flags.json) {
            (0, json_1.enableJsonOutput)();
        }
        const { daysBack, startTime, endTime } = (0, startAndEndTime_1.resolveTimeRange)(flags);
        const platform = (0, platforms_1.appObservePlatformFromFlag)(flags.platform);
        if (!args.eventName && !flags['all-events']) {
            const { names, isTruncated } = await ObserveQuery_1.ObserveQuery.customEventNamesAsync(graphqlClient, {
                appId: projectId,
                startTime,
                endTime,
                platform,
            });
            if (flags.json) {
                (0, json_1.printJsonOnlyOutput)((0, formatCustomEvents_1.buildObserveCustomEventNamesJson)(names, isTruncated));
            }
            else {
                log_1.default.addNewLineIfNone();
                log_1.default.log((0, formatCustomEvents_1.buildObserveCustomEventNamesTable)(names, {
                    daysBack,
                    startTime,
                    endTime,
                    isTruncated,
                }));
            }
            return;
        }
        const { events, pageInfo } = await (0, fetchCustomEvents_1.fetchObserveCustomEventsAsync)(graphqlClient, projectId, {
            eventName: args.eventName,
            limit: flags.limit ?? DEFAULT_EVENTS_LIMIT,
            ...(flags.after && { after: flags.after }),
            startTime,
            endTime,
            platform,
            appVersion: flags['app-version'],
            updateId: flags['update-id'],
            sessionId: flags['session-id'],
        });
        if (args.eventName && events.length === 0) {
            const { names, isTruncated } = await ObserveQuery_1.ObserveQuery.customEventNamesAsync(graphqlClient, {
                appId: projectId,
                startTime,
                endTime,
                platform,
            });
            if (flags.json) {
                (0, json_1.printJsonOnlyOutput)((0, formatCustomEvents_1.buildObserveCustomEventsEmptyWithSuggestionsJson)(args.eventName, names, isTruncated));
            }
            else {
                log_1.default.addNewLineIfNone();
                log_1.default.log((0, formatCustomEvents_1.buildObserveCustomEventsEmptyWithSuggestionsTable)(args.eventName, names, {
                    daysBack,
                    startTime,
                    endTime,
                    isTruncated,
                }));
            }
            return;
        }
        if (flags.json) {
            (0, json_1.printJsonOnlyOutput)((0, formatCustomEvents_1.buildObserveCustomEventsJson)(events, pageInfo));
        }
        else {
            log_1.default.addNewLineIfNone();
            log_1.default.log((0, formatCustomEvents_1.buildObserveCustomEventsTable)(events, pageInfo, {
                eventName: args.eventName,
                daysBack,
                startTime,
                endTime,
            }));
        }
    }
}
exports.default = ObserveEvents;
