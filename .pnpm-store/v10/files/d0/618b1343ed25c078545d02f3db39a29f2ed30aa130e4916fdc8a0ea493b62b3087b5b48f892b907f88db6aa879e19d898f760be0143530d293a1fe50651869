"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const EasCommand_1 = tslib_1.__importDefault(require("../../commandUtils/EasCommand"));
const flags_1 = require("../../commandUtils/flags");
const log_1 = tslib_1.__importDefault(require("../../log"));
const fetchVersions_1 = require("../../observe/fetchVersions");
const flags_2 = require("../../observe/flags");
const formatVersions_1 = require("../../observe/formatVersions");
const platforms_1 = require("../../observe/platforms");
const resolveProjectContext_1 = require("../../observe/resolveProjectContext");
const startAndEndTime_1 = require("../../observe/startAndEndTime");
const json_1 = require("../../utils/json");
class ObserveVersions extends EasCommand_1.default {
    static description = 'display app versions with build and update details';
    static flags = {
        ...flags_2.ObservePlatformFlag,
        ...flags_2.ObserveTimeRangeFlags,
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
        const { flags } = await this.parse(ObserveVersions);
        const { projectId, graphqlClient } = await (0, resolveProjectContext_1.resolveObserveCommandContextAsync)({
            command: this,
            commandClass: ObserveVersions,
            loggedInOnlyContextDefinition: ObserveVersions.loggedInOnlyContextDefinition,
            projectIdOverride: flags['project-id'],
            nonInteractive: flags['non-interactive'],
        });
        if (flags.json) {
            (0, json_1.enableJsonOutput)();
        }
        const { startTime, endTime } = (0, startAndEndTime_1.resolveTimeRange)(flags);
        const platforms = (0, platforms_1.appPlatformsFromFlag)(flags.platform);
        const results = await (0, fetchVersions_1.fetchObserveVersionsAsync)(graphqlClient, projectId, platforms, startTime, endTime);
        if (flags.json) {
            (0, json_1.printJsonOnlyOutput)((0, formatVersions_1.buildObserveVersionsJson)(results));
        }
        else {
            log_1.default.addNewLineIfNone();
            log_1.default.log((0, formatVersions_1.buildObserveVersionsTable)(results));
        }
    }
}
exports.default = ObserveVersions;
