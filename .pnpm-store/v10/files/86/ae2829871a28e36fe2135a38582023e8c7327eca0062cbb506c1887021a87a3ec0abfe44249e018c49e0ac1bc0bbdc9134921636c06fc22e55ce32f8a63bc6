"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObserveUpdateIdFlag = exports.ObserveAppVersionFlag = exports.ObserveAfterFlag = exports.ObserveTimeRangeFlags = exports.ObservePlatformFlag = exports.ObserveProjectIdFlag = void 0;
const core_1 = require("@oclif/core");
const platforms_1 = require("./platforms");
exports.ObserveProjectIdFlag = {
    'project-id': core_1.Flags.string({
        description: 'EAS project ID (defaults to the project ID of the current directory)',
    }),
};
exports.ObservePlatformFlag = {
    platform: core_1.Flags.option({
        description: 'Filter by platform',
        options: platforms_1.allowedPlatformFlagValues,
    })(),
};
exports.ObserveTimeRangeFlags = {
    start: core_1.Flags.string({
        description: 'Start of time range (ISO date)',
        exclusive: ['days'],
    }),
    end: core_1.Flags.string({
        description: 'End of time range (ISO date)',
        exclusive: ['days'],
    }),
    days: core_1.Flags.integer({
        description: 'Show results from the last N days (mutually exclusive with --start/--end)',
        min: 1,
        exclusive: ['start', 'end'],
    }),
};
exports.ObserveAfterFlag = {
    after: core_1.Flags.string({
        description: 'Cursor for pagination. Use the endCursor from a previous query to fetch the next page.',
    }),
};
exports.ObserveAppVersionFlag = {
    'app-version': core_1.Flags.string({
        description: 'Filter by app version',
    }),
};
exports.ObserveUpdateIdFlag = {
    'update-id': core_1.Flags.string({
        description: 'Filter by EAS update ID',
    }),
};
