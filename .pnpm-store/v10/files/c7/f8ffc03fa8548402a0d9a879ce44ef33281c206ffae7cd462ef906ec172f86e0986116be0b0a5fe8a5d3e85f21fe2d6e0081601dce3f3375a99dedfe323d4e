"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INSIGHTS_DEFAULT_DAYS_BACK = void 0;
exports.resolveInsightsTimeRange = resolveInsightsTimeRange;
const startAndEndTime_1 = require("../observe/startAndEndTime");
exports.INSIGHTS_DEFAULT_DAYS_BACK = 7;
function resolveInsightsTimeRange(flags) {
    const days = flags.days ?? (flags.start ? undefined : exports.INSIGHTS_DEFAULT_DAYS_BACK);
    return (0, startAndEndTime_1.resolveTimeRange)({ ...flags, days });
}
