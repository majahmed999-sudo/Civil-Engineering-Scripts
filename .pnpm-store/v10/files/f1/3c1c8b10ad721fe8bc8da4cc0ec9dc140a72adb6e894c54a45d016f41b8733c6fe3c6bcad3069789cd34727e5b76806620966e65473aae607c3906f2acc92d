"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.METRIC_SHORT_NAMES = exports.METRIC_ALIASES = exports.NAVIGATION_METRIC_ALIASES = void 0;
exports.resolveMetricName = resolveMetricName;
exports.resolveNavigationMetricName = resolveNavigationMetricName;
exports.getMetricDisplayName = getMetricDisplayName;
const errors_1 = require("../commandUtils/errors");
exports.NAVIGATION_METRIC_ALIASES = {
    nav_cold_ttr: 'expo.navigation.cold_ttr',
    nav_warm_ttr: 'expo.navigation.warm_ttr',
    nav_tti: 'expo.navigation.tti',
};
exports.METRIC_ALIASES = {
    ...exports.NAVIGATION_METRIC_ALIASES,
    tti: 'expo.app_startup.tti',
    ttr: 'expo.app_startup.ttr',
    cold_launch: 'expo.app_startup.cold_launch_time',
    warm_launch: 'expo.app_startup.warm_launch_time',
    bundle_load: 'expo.app_startup.bundle_load_time',
    update_download: 'expo.updates.download_time',
};
const KNOWN_FULL_NAMES = new Set(Object.values(exports.METRIC_ALIASES));
const KNOWN_FULL_NAVIGATION_NAMES = new Set(Object.values(exports.NAVIGATION_METRIC_ALIASES));
exports.METRIC_SHORT_NAMES = {
    'expo.app_startup.cold_launch_time': 'Cold Launch',
    'expo.app_startup.warm_launch_time': 'Warm Launch',
    'expo.app_startup.tti': 'Startup TTI',
    'expo.app_startup.ttr': 'Startup TTR',
    'expo.app_startup.bundle_load_time': 'Bundle Load',
    'expo.updates.download_time': 'Update Download',
    'expo.navigation.cold_ttr': 'Nav Cold TTR',
    'expo.navigation.warm_ttr': 'Nav Warm TTR',
    'expo.navigation.tti': 'Nav TTI',
};
function resolveMetricName(input) {
    if (exports.METRIC_ALIASES[input]) {
        return exports.METRIC_ALIASES[input];
    }
    if (KNOWN_FULL_NAMES.has(input) || input.includes('.')) {
        return input;
    }
    throw new errors_1.EasCommandError(`Unknown metric: "${input}". Use a full metric name (e.g. expo.app_startup.tti) or a short alias: ${Object.keys(exports.METRIC_ALIASES).join(', ')}`);
}
function resolveNavigationMetricName(input) {
    if (exports.NAVIGATION_METRIC_ALIASES[input]) {
        return exports.NAVIGATION_METRIC_ALIASES[input];
    }
    if (KNOWN_FULL_NAVIGATION_NAMES.has(input)) {
        return input;
    }
    throw new errors_1.EasCommandError(`Unknown navigation metric: "${input}". Use a full metric name (e.g. expo.navigation.cold_ttr) or a short alias: ${Object.keys(exports.NAVIGATION_METRIC_ALIASES).join(', ')}`);
}
function getMetricDisplayName(metricName) {
    return exports.METRIC_SHORT_NAMES[metricName] ?? metricName;
}
