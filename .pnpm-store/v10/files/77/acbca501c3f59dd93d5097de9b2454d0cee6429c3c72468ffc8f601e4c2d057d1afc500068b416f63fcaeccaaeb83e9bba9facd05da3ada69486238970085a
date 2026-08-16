"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_DAYS_BACK = void 0;
exports.startAndEndTime = startAndEndTime;
exports.resolveTimeRange = resolveTimeRange;
const fetchMetrics_1 = require("./fetchMetrics");
exports.DEFAULT_DAYS_BACK = 60;
function startAndEndTime({ daysBack, start, end, }) {
    let startTime;
    let endTime;
    if (daysBack) {
        endTime = new Date().toISOString();
        startTime = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
    }
    else {
        endTime = end ?? new Date().toISOString();
        startTime =
            start ?? new Date(Date.now() - exports.DEFAULT_DAYS_BACK * 24 * 60 * 60 * 1000).toISOString();
    }
    return { startTime, endTime };
}
function resolveTimeRange(flags) {
    if (flags.start) {
        (0, fetchMetrics_1.validateDateFlag)(flags.start, '--start');
    }
    if (flags.end) {
        (0, fetchMetrics_1.validateDateFlag)(flags.end, '--end');
    }
    const daysBack = flags.days ?? (flags.start ? undefined : exports.DEFAULT_DAYS_BACK);
    const { startTime, endTime } = startAndEndTime({
        daysBack,
        start: flags.start,
        end: flags.end,
    });
    return { daysBack, startTime, endTime };
}
