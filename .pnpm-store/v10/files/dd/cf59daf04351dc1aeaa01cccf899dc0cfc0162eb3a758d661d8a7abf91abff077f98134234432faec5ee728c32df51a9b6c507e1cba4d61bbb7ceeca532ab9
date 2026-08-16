"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatConvexInviteTimestamp = formatConvexInviteTimestamp;
exports.getConvexTeamDashboardUrl = getConvexTeamDashboardUrl;
exports.getConvexProjectDashboardUrl = getConvexProjectDashboardUrl;
exports.formatConvexTeam = formatConvexTeam;
exports.formatConvexTeamConnection = formatConvexTeamConnection;
exports.formatConvexProject = formatConvexProject;
exports.logNoConvexTeams = logNoConvexTeams;
exports.logNoConvexProject = logNoConvexProject;
exports.confirmRecentConvexInviteAsync = confirmRecentConvexInviteAsync;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const dateformat_1 = tslib_1.__importDefault(require("dateformat"));
const log_1 = tslib_1.__importStar(require("../log"));
const prompts_1 = require("../prompts");
const CONVEX_DASHBOARD_HOST = 'https://dashboard.convex.dev';
const RECENT_INVITE_THRESHOLD_MS = 60 * 60 * 1000;
function formatConvexInviteTimestamp(timestamp) {
    return (0, dateformat_1.default)(timestamp, 'mmm dd HH:MM:ss');
}
function getConvexTeamDashboardUrl(connection) {
    return `${CONVEX_DASHBOARD_HOST}/t/${encodeURIComponent(connection.convexTeamSlug)}`;
}
function getConvexProjectDashboardUrl(project) {
    return `${getConvexTeamDashboardUrl(project.convexTeamConnection)}/${encodeURIComponent(project.convexProjectSlug)}`;
}
function formatConvexTeam(connection) {
    return `${connection.convexTeamName} / ${connection.convexTeamSlug}`;
}
function formatConvexTeamConnection(connection) {
    const lines = [
        `${chalk_1.default.bold('Team')}: ${formatConvexTeam(connection)}`,
        `${chalk_1.default.bold('Dashboard')}: ${(0, log_1.link)(getConvexTeamDashboardUrl(connection), { dim: false })}`,
        `${chalk_1.default.bold('Claimed')}: ${connection.hasBeenClaimed ? 'Yes' : 'No'}`,
    ];
    if (connection.invitedEmail) {
        lines.push(`${chalk_1.default.bold('Invited email')}: ${connection.invitedEmail}`);
    }
    if (connection.invitedAt) {
        lines.push(`${chalk_1.default.bold('Invited at')}: ${formatConvexInviteTimestamp(connection.invitedAt)}`);
    }
    return lines.join('\n');
}
function formatConvexProject(project) {
    return [
        `${chalk_1.default.bold('Name')}: ${project.convexProjectName}`,
        `${chalk_1.default.bold('Slug')}: ${project.convexProjectSlug}`,
        `${chalk_1.default.bold('Identifier')}: ${project.convexProjectIdentifier}`,
        `${chalk_1.default.bold('Team')}: ${formatConvexTeam(project.convexTeamConnection)}`,
        `${chalk_1.default.bold('Dashboard')}: ${(0, log_1.link)(getConvexProjectDashboardUrl(project), { dim: false })}`,
    ].join('\n');
}
function logNoConvexTeams(accountName) {
    log_1.default.warn(`No Convex team is linked to account ${chalk_1.default.bold(accountName)} on EAS.`);
}
function logNoConvexProject(projectName) {
    log_1.default.warn(`No Convex project is linked to Expo app ${chalk_1.default.bold(projectName)} on EAS.`);
}
async function confirmRecentConvexInviteAsync(connection, { nonInteractive }) {
    const invitedAt = connection.invitedAt ? new Date(connection.invitedAt) : null;
    if (!invitedAt || Number.isNaN(invitedAt.getTime())) {
        return true;
    }
    const timeSinceInviteMs = Date.now() - invitedAt.getTime();
    if (timeSinceInviteMs >= RECENT_INVITE_THRESHOLD_MS) {
        return true;
    }
    const previousInvite = `A Convex team invite was already sent${connection.invitedEmail ? ` to ${connection.invitedEmail}` : ''} at ${formatConvexInviteTimestamp(connection.invitedAt)}.`;
    if (nonInteractive) {
        log_1.default.warn(`${previousInvite} Sending another invite because this command is running in non-interactive mode.`);
        return true;
    }
    return await (0, prompts_1.confirmAsync)({
        message: `${previousInvite} Are you sure you want to send another invite?`,
    });
}
