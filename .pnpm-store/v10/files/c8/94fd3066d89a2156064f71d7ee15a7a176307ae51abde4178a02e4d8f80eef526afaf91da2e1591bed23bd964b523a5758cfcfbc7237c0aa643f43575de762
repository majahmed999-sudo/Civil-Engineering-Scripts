"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostHogProjectDashboardUrl = getPostHogProjectDashboardUrl;
exports.formatPostHogProject = formatPostHogProject;
exports.logNoPostHogProject = logNoPostHogProject;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const log_1 = tslib_1.__importStar(require("../log"));
function getPostHogProjectDashboardUrl(project) {
    const host = project.posthogHost.replace(/\/$/, '');
    return `${host}/project/${encodeURIComponent(project.posthogProjectIdentifier)}`;
}
function formatPostHogProject(project) {
    return [
        `${chalk_1.default.bold('Name')}: ${project.posthogProjectName}`,
        `${chalk_1.default.bold('Host')}: ${project.posthogHost}`,
        `${chalk_1.default.bold('Region')}: ${project.posthogOrganizationConnection.posthogRegion}`,
        `${chalk_1.default.bold('Dashboard')}: ${(0, log_1.link)(getPostHogProjectDashboardUrl(project), { dim: false })}`,
    ].join('\n');
}
function logNoPostHogProject(projectName) {
    log_1.default.warn(`No PostHog project is linked to Expo app ${chalk_1.default.bold(projectName)} on EAS.`);
}
