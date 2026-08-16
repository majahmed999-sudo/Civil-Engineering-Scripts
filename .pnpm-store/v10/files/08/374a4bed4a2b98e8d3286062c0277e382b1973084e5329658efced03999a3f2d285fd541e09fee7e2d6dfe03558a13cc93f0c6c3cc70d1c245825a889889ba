"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectDashboardUrl = getProjectDashboardUrl;
exports.getProjectPageUrl = getProjectPageUrl;
exports.getBuildLogsUrl = getBuildLogsUrl;
exports.getArtifactUrl = getArtifactUrl;
exports.getInternalDistributionInstallUrl = getInternalDistributionInstallUrl;
exports.getUpdateGroupUrl = getUpdateGroupUrl;
exports.getWorkflowRunUrl = getWorkflowRunUrl;
exports.getDeviceRunSessionUrl = getDeviceRunSessionUrl;
exports.getBareJobRunUrl = getBareJobRunUrl;
exports.getProjectGitHubSettingsUrl = getProjectGitHubSettingsUrl;
exports.getHostingDeploymentsUrl = getHostingDeploymentsUrl;
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const api_1 = require("../../api");
const generated_1 = require("../../graphql/generated");
function getProjectDashboardUrl(accountName, projectName) {
    return getProjectPageUrl(accountName, projectName);
}
function getProjectPageUrl(accountName, projectName, page) {
    const projectPath = `/accounts/${encodeURIComponent(accountName)}/projects/${encodeURIComponent(projectName)}`;
    return new URL(page ? `${projectPath}/${page}` : projectPath, (0, api_1.getExpoWebsiteBaseUrl)()).toString();
}
function getBuildLogsUrl(build, hash) {
    const { project } = build;
    const url = project.__typename !== 'App'
        ? `/builds/${build.id}`
        : `/accounts/${project.ownerAccount.name}/projects/${project.slug}/builds/${build.id}${hash ? `#${hash}` : ''}`;
    return new URL(url, (0, api_1.getExpoWebsiteBaseUrl)()).toString();
}
function getArtifactUrl(artifactId) {
    return new URL(`/artifacts/${artifactId}`, (0, api_1.getExpoWebsiteBaseUrl)()).toString();
}
function getInternalDistributionInstallUrl(build) {
    if (build.platform === generated_1.AppPlatform.Ios) {
        return `itms-services://?action=download-manifest;url=${(0, api_1.getExpoApiBaseUrl)()}/v2/projects/${build.project.id}/builds/${build.id}/manifest.plist`;
    }
    (0, assert_1.default)(build.artifacts?.buildUrl, 'buildUrl is missing');
    return build.artifacts.buildUrl;
}
function getUpdateGroupUrl(accountName, projectName, updateGroupId) {
    return new URL(`/accounts/${encodeURIComponent(accountName)}/projects/${encodeURIComponent(projectName)}/updates/${encodeURIComponent(updateGroupId)}`, (0, api_1.getExpoWebsiteBaseUrl)()).toString();
}
function getWorkflowRunUrl(accountName, projectName, workflowRunId) {
    return new URL(`/accounts/${encodeURIComponent(accountName)}/projects/${encodeURIComponent(projectName)}/workflows/${workflowRunId}`, (0, api_1.getExpoWebsiteBaseUrl)()).toString();
}
function getDeviceRunSessionUrl(accountName, projectName, deviceRunSessionId) {
    return new URL(`/accounts/${encodeURIComponent(accountName)}/projects/${encodeURIComponent(projectName)}/simulator-sessions/${encodeURIComponent(deviceRunSessionId)}`, (0, api_1.getExpoWebsiteBaseUrl)()).toString();
}
/**
 * @deprecated Links to the raw job-run page; prefer a higher-level URL (e.g. the workflow run
 * or the feature-specific dashboard) that gives users more context. Use this only for internal
 * tooling where no richer URL exists.
 */
function getBareJobRunUrl(accountName, projectName, jobRunId) {
    return new URL(`/accounts/${encodeURIComponent(accountName)}/projects/${encodeURIComponent(projectName)}/job-runs/${encodeURIComponent(jobRunId)}`, (0, api_1.getExpoWebsiteBaseUrl)()).toString();
}
function getProjectGitHubSettingsUrl(accountName, projectName) {
    return new URL(`/accounts/${encodeURIComponent(accountName)}/projects/${encodeURIComponent(projectName)}/github`, (0, api_1.getExpoWebsiteBaseUrl)()).toString();
}
function getHostingDeploymentsUrl(accountName, projectName) {
    return new URL(`/accounts/${encodeURIComponent(accountName)}/projects/${encodeURIComponent(projectName)}/hosting/deployments`, (0, api_1.getExpoWebsiteBaseUrl)()).toString();
}
