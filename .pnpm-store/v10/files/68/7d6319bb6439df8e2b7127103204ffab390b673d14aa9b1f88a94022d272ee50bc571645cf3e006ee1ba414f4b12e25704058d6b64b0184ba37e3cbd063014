"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildObserveVersionsJson = buildObserveVersionsJson;
exports.buildObserveVersionsTable = buildObserveVersionsTable;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const platform_1 = require("../platform");
const renderTextTable_1 = tslib_1.__importDefault(require("../utils/renderTextTable"));
const formatUtils_1 = require("./formatUtils");
function mapEasBuilds(easBuilds) {
    return easBuilds.map(b => ({
        easBuildId: b.easBuildId,
        firstSeenAt: b.firstSeenAt,
        eventCount: b.eventCount,
        uniqueUserCount: b.uniqueUserCount,
    }));
}
function mapBuildNumbers(buildNumbers) {
    return buildNumbers.map(bn => ({
        appBuildNumber: bn.appBuildNumber,
        firstSeenAt: bn.firstSeenAt,
        eventCount: bn.eventCount,
        uniqueUserCount: bn.uniqueUserCount,
        easBuilds: mapEasBuilds(bn.easBuilds),
    }));
}
function mapUpdates(updates) {
    return updates.map(u => ({
        appUpdateId: u.appUpdateId,
        firstSeenAt: u.firstSeenAt,
        eventCount: u.eventCount,
        uniqueUserCount: u.uniqueUserCount,
        easBuilds: mapEasBuilds(u.easBuilds),
    }));
}
function buildObserveVersionsJson(results) {
    const output = [];
    for (const { platform, appVersions } of results) {
        for (const v of appVersions) {
            output.push({
                platform: platform,
                appVersion: v.appVersion,
                firstSeenAt: v.firstSeenAt,
                eventCount: v.eventCount,
                uniqueUserCount: v.uniqueUserCount,
                buildNumbers: mapBuildNumbers(v.buildNumbers),
                updates: mapUpdates(v.updates),
            });
        }
    }
    return output;
}
function buildObserveVersionsTable(results) {
    const hasAnyVersions = results.some(r => r.appVersions.length > 0);
    if (!hasAnyVersions) {
        return chalk_1.default.yellow('No app versions found.');
    }
    const headers = ['App Version', 'First Seen', 'Events', 'Users', 'Builds', 'Updates'];
    const sections = [];
    for (const { platform, appVersions } of results) {
        if (appVersions.length === 0) {
            continue;
        }
        if (sections.length > 0) {
            sections.push('');
        }
        sections.push(chalk_1.default.bold(platform_1.appPlatformDisplayNames[platform]));
        const rows = appVersions.map(version => [
            version.appVersion,
            (0, formatUtils_1.formatDate)(version.firstSeenAt),
            String(version.eventCount),
            String(version.uniqueUserCount),
            String(version.buildNumbers.length),
            String(version.updates.length),
        ]);
        sections.push((0, renderTextTable_1.default)(headers, rows));
    }
    return sections.join('\n');
}
