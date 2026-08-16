"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const eas_build_job_1 = require("@expo/eas-build-job");
const core_1 = require("@oclif/core");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
const path_1 = tslib_1.__importDefault(require("path"));
const EasCommand_1 = tslib_1.__importDefault(require("../../commandUtils/EasCommand"));
const flags_1 = require("../../commandUtils/flags");
const generated_1 = require("../../graphql/generated");
const BuildQuery_1 = require("../../graphql/queries/BuildQuery");
const AppPlatform_1 = require("../../graphql/types/AppPlatform");
const log_1 = tslib_1.__importDefault(require("../../log"));
const prompts_1 = require("../../prompts");
const run_1 = require("../../run/run");
const download_1 = require("../../utils/download");
const files_1 = require("../../utils/files");
const json_1 = require("../../utils/json");
const paths_1 = require("../../utils/paths");
class Download extends EasCommand_1.default {
    static description = 'download a simulator/emulator build by build ID or fingerprint hash';
    static flags = {
        'build-id': core_1.Flags.string({
            aliases: ['id'],
            description: 'ID of the build to download. Mutually exclusive with --fingerprint, --platform, and --dev-client; the platform is derived from the build itself.',
            exclusive: ['fingerprint', 'platform', 'dev-client'],
        }),
        fingerprint: core_1.Flags.string({
            description: 'Fingerprint hash of the build to download',
            exclusive: ['build-id'],
        }),
        platform: core_1.Flags.option({
            char: 'p',
            options: [eas_build_job_1.Platform.IOS, eas_build_job_1.Platform.ANDROID],
            exclusive: ['build-id'],
        })(),
        'dev-client': core_1.Flags.boolean({
            description: 'Filter only dev-client builds.',
            allowNo: true,
            exclusive: ['build-id'],
        }),
        'all-artifacts': core_1.Flags.boolean({
            description: 'Download all available build artifacts (build artifacts archive, Xcode logs, etc.) in addition to the application archive. Without this flag, only the application archive is downloaded and the command errors if it is missing.',
            default: false,
        }),
        ...flags_1.EasNonInteractiveAndJsonFlags,
    };
    static contextDefinition = {
        ...this.ContextOptions.LoggedIn,
        ...this.ContextOptions.ProjectId,
    };
    async runAsync() {
        const { flags: { 'build-id': buildId, platform, fingerprint, 'dev-client': developmentClient, 'all-artifacts': allArtifacts, ...rawFlags }, } = await this.parse(Download);
        const { json: jsonFlag, nonInteractive } = (0, flags_1.resolveNonInteractiveAndJsonFlags)(rawFlags);
        if (!buildId && !fingerprint) {
            throw new Error('Either --build-id or --fingerprint is required.');
        }
        const { loggedIn: { graphqlClient }, projectId, } = await this.getContextAsync(Download, {
            nonInteractive,
        });
        if (jsonFlag) {
            (0, json_1.enableJsonOutput)();
        }
        let build;
        let selectedPlatform;
        if (buildId) {
            build = await this.getBuildByIdAsync({ graphqlClient, buildId });
            selectedPlatform = build.platform;
            log_1.default.succeed(`🎯 Found build ${chalk_1.default.bold(buildId)} on EAS servers.`);
        }
        else {
            selectedPlatform = await resolvePlatformAsync({ nonInteractive, platform });
            build = await this.getBuildByFingerprintAsync({
                graphqlClient,
                projectId,
                platform: selectedPlatform,
                fingerprintHash: fingerprint,
                developmentClient,
            });
        }
        let buildArtifactPath = null;
        if (build.artifacts?.applicationArchiveUrl) {
            buildArtifactPath = await this.getPathToBuildArtifactAsync(build, selectedPlatform);
        }
        else if (!allArtifacts) {
            const availableArtifacts = listAvailableExtraArtifactNames(build);
            if (availableArtifacts.length > 0) {
                throw new Error(`Build does not have an application archive url. Other artifacts are available (${availableArtifacts.join(', ')}); re-run with --all-artifacts to download them.`);
            }
            throw new Error('Build does not have an application archive url');
        }
        let extraArtifactPaths = {};
        if (allArtifacts) {
            extraArtifactPaths = await this.downloadExtraArtifactsAsync(build);
        }
        if (jsonFlag) {
            const jsonResults = {
                ...(buildArtifactPath != null && { path: buildArtifactPath }),
                ...extraArtifactPaths,
            };
            (0, json_1.printJsonOnlyOutput)(jsonResults);
        }
        else {
            if (buildArtifactPath != null) {
                log_1.default.log(`Build downloaded to ${chalk_1.default.bold(buildArtifactPath)}`);
            }
            for (const [name, filePath] of Object.entries(extraArtifactPaths)) {
                log_1.default.log(`${name} downloaded to ${chalk_1.default.bold(filePath)}`);
            }
        }
    }
    async downloadExtraArtifactsAsync(build) {
        const artifacts = build.artifacts;
        if (!artifacts) {
            return {};
        }
        const extraArtifacts = [];
        if (artifacts.buildArtifactsUrl) {
            extraArtifacts.push({ name: 'buildArtifacts', url: artifacts.buildArtifactsUrl });
        }
        if (artifacts.xcodeBuildLogsUrl) {
            extraArtifacts.push({ name: 'xcodeBuildLogs', url: artifacts.xcodeBuildLogsUrl });
        }
        if (artifacts.buildUrl && artifacts.buildUrl !== artifacts.applicationArchiveUrl) {
            extraArtifacts.push({ name: 'build', url: artifacts.buildUrl });
        }
        if (extraArtifacts.length === 0) {
            return {};
        }
        const outputDir = path_1.default.join((0, paths_1.getEasBuildRunCacheDirectoryPath)(), `${build.id}-artifacts`);
        await fs_extra_1.default.ensureDir(outputDir);
        const downloaded = {};
        for (const { name, url } of extraArtifacts) {
            const fileName = getFileNameFromUrl(url, name);
            const outputPath = path_1.default.join(outputDir, fileName);
            await (0, download_1.downloadFileWithProgressTrackerAsync)(url, outputPath, (ratio, total) => `Downloading ${name} (${(0, files_1.formatBytes)(total * ratio)} / ${(0, files_1.formatBytes)(total)})`, `Successfully downloaded ${name}`);
            downloaded[name] = outputPath;
        }
        return downloaded;
    }
    async getBuildByIdAsync({ graphqlClient, buildId, }) {
        try {
            return await BuildQuery_1.BuildQuery.byIdAsync(graphqlClient, buildId);
        }
        catch (error) {
            throw new Error(`Could not find build with ID ${buildId}: ${error.message}`);
        }
    }
    async getBuildByFingerprintAsync({ graphqlClient, projectId, platform, fingerprintHash, developmentClient, }) {
        const builds = await BuildQuery_1.BuildQuery.viewBuildsOnAppAsync(graphqlClient, {
            appId: projectId,
            filter: {
                platform,
                fingerprintHash,
                status: generated_1.BuildStatus.Finished,
                simulator: platform === generated_1.AppPlatform.Ios ? true : undefined,
                distribution: platform === generated_1.AppPlatform.Android ? generated_1.DistributionType.Internal : undefined,
                developmentClient,
            },
            offset: 0,
            limit: 1,
        });
        if (builds.length === 0) {
            throw new Error(`No builds available for ${platform} with fingerprint hash ${fingerprintHash}`);
        }
        log_1.default.succeed(`🎯 Found successful build with matching fingerprint on EAS servers.`);
        return builds[0];
    }
    async getPathToBuildArtifactAsync(build, platform) {
        const cachedBuildArtifactPath = (0, run_1.getEasBuildRunCachedAppPath)(build.project.id, build.id, platform);
        if (await fs_extra_1.default.pathExists(cachedBuildArtifactPath)) {
            log_1.default.newLine();
            log_1.default.log(`Using cached build...`);
            return cachedBuildArtifactPath;
        }
        if (!build.artifacts?.applicationArchiveUrl) {
            throw new Error('Build does not have an application archive url');
        }
        return await (0, download_1.downloadAndMaybeExtractAppAsync)(build.artifacts.applicationArchiveUrl, platform, cachedBuildArtifactPath);
    }
}
exports.default = Download;
async function resolvePlatformAsync({ nonInteractive, platform, }) {
    if (nonInteractive && !platform) {
        throw new Error('Platform must be provided in non-interactive mode');
    }
    if (platform) {
        return (0, AppPlatform_1.toAppPlatform)(platform);
    }
    const { selectedPlatform } = await (0, prompts_1.promptAsync)({
        type: 'select',
        message: 'Select platform',
        name: 'selectedPlatform',
        choices: [
            { title: 'Android', value: generated_1.AppPlatform.Android },
            { title: 'iOS', value: generated_1.AppPlatform.Ios },
        ],
    });
    return selectedPlatform;
}
function listAvailableExtraArtifactNames(build) {
    const names = [];
    if (build.artifacts?.buildArtifactsUrl) {
        names.push('buildArtifacts');
    }
    if (build.artifacts?.xcodeBuildLogsUrl) {
        names.push('xcodeBuildLogs');
    }
    if (build.artifacts?.buildUrl &&
        build.artifacts.buildUrl !== build.artifacts.applicationArchiveUrl) {
        names.push('build');
    }
    return names;
}
function getFileNameFromUrl(url, fallbackName) {
    try {
        const pathname = new URL(url).pathname;
        const basename = path_1.default.basename(pathname);
        if (basename) {
            return basename;
        }
    }
    catch {
        // fall through to default
    }
    return fallbackName;
}
