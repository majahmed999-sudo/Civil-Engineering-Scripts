"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTimespan = formatTimespan;
exports.toDateOnly = toDateOnly;
const tslib_1 = require("tslib");
const dateformat_1 = tslib_1.__importDefault(require("dateformat"));
function formatTimespan(timespan) {
    if (timespan.daysBack) {
        return `last ${timespan.daysBack} day${timespan.daysBack === 1 ? '' : 's'}`;
    }
    return `${toDateOnly(timespan.startTime)} to ${toDateOnly(timespan.endTime)}`;
}
function toDateOnly(isoTimestamp) {
    return (0, dateformat_1.default)(new Date(isoTimestamp), 'UTC:yyyy-mm-dd');
}
