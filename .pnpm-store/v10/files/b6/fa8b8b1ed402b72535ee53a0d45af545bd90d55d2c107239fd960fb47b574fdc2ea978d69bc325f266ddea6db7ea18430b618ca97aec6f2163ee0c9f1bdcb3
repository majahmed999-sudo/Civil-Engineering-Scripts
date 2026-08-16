"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const EasCommand_1 = tslib_1.__importDefault(require("../../commandUtils/EasCommand"));
const flags_1 = require("../../commandUtils/flags");
const log_1 = tslib_1.__importDefault(require("../../log"));
const fetchSessions_1 = require("../../observe/fetchSessions");
const flags_2 = require("../../observe/flags");
const formatSessions_1 = require("../../observe/formatSessions");
const resolveProjectContext_1 = require("../../observe/resolveProjectContext");
const json_1 = require("../../utils/json");
// Fixed at 100 — the maximum page size accepted by the underlying events and
// customEventList queries. Until there's a dedicated sessions query, this
// command pulls one page of each and merges client-side.
const SESSION_PAGE_SIZE = 100;
class ObserveSession extends EasCommand_1.default {
    static description = 'display the timeline of metric and log events for a specific session';
    static args = {
        sessionId: core_1.Args.string({
            description: 'Session ID to inspect',
            required: true,
        }),
    };
    static flags = {
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
        const { flags, args } = await this.parse(ObserveSession);
        const { projectId, graphqlClient } = await (0, resolveProjectContext_1.resolveObserveCommandContextAsync)({
            command: this,
            commandClass: ObserveSession,
            loggedInOnlyContextDefinition: ObserveSession.loggedInOnlyContextDefinition,
            projectIdOverride: flags['project-id'],
            nonInteractive: flags['non-interactive'],
        });
        if (flags.json) {
            (0, json_1.enableJsonOutput)();
        }
        const { entries, metadata, hasMoreMetricEvents, hasMoreLogEvents } = await (0, fetchSessions_1.fetchObserveSessionEventsAsync)(graphqlClient, projectId, {
            sessionId: args.sessionId,
            limit: SESSION_PAGE_SIZE,
        });
        if (flags.json) {
            (0, json_1.printJsonOnlyOutput)((0, formatSessions_1.buildObserveSessionEventsJson)(entries, args.sessionId, metadata, hasMoreMetricEvents, hasMoreLogEvents));
        }
        else {
            log_1.default.addNewLineIfNone();
            log_1.default.log((0, formatSessions_1.buildObserveSessionEventsTable)(entries, {
                metadata,
                hasMoreMetricEvents,
                hasMoreLogEvents,
            }));
        }
    }
}
exports.default = ObserveSession;
