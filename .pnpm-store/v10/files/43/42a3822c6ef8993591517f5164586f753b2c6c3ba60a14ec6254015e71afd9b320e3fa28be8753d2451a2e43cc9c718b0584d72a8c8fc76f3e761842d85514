"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildJsonOutput = buildJsonOutput;
exports.buildInvalidJsonOutput = buildInvalidJsonOutput;
exports.isAscAuthenticationError = isAscAuthenticationError;
exports.formatAscAppLinkStatus = formatAscAppLinkStatus;
const tslib_1 = require("tslib");
const core_1 = require("@urql/core");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
function buildJsonOutput(action, metadata) {
    const link = metadata.appStoreConnectApp;
    return {
        action,
        project: metadata.fullName,
        status: link ? 'connected' : 'not-connected',
        appStoreConnectApp: link
            ? {
                id: link.id,
                ascAppIdentifier: link.ascAppIdentifier,
                name: link.remoteAppStoreConnectApp?.name ?? null,
                bundleIdentifier: link.remoteAppStoreConnectApp?.bundleIdentifier ?? null,
                appleUrl: getAppleAppUrl(link.ascAppIdentifier),
            }
            : null,
    };
}
function buildInvalidJsonOutput(action, projectId) {
    return {
        action,
        project: projectId,
        status: 'invalid',
        appStoreConnectApp: null,
    };
}
function isAscAuthenticationError(error) {
    return (error instanceof core_1.CombinedError &&
        error.graphQLErrors.some(e => e.message.includes('App Store Connect rejected this API key')));
}
function formatAscAppLinkStatus(metadata) {
    const link = metadata.appStoreConnectApp;
    if (!link) {
        return `Project ${chalk_1.default.bold(metadata.fullName)}: ${chalk_1.default.yellow('Not connected')} to App Store Connect.`;
    }
    const lines = [
        `Project ${chalk_1.default.bold(metadata.fullName)}: ${chalk_1.default.green('Connected')} to App Store Connect.`,
        `  ASC App ID:  ${chalk_1.default.bold(link.ascAppIdentifier)}`,
    ];
    const remote = link.remoteAppStoreConnectApp;
    if (remote) {
        lines.push(`  Name:        ${remote.name}`);
        lines.push(`  Bundle ID:   ${remote.bundleIdentifier}`);
    }
    lines.push(`  Apple URL:   ${getAppleAppUrl(link.ascAppIdentifier)}`);
    return lines.join('\n');
}
function getAppleAppUrl(ascAppIdentifier) {
    return `https://appstoreconnect.apple.com/apps/${encodeURIComponent(ascAppIdentifier)}/distribution`;
}
