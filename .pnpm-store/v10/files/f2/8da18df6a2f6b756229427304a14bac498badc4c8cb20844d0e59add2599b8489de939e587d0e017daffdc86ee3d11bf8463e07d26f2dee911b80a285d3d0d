"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectProjectSdkVersionAsync = detectProjectSdkVersionAsync;
const tslib_1 = require("tslib");
const config_1 = require("@expo/config");
const apple_utils_1 = require("@expo/apple-utils");
const core_1 = require("@oclif/core");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const fs = tslib_1.__importStar(require("fs-extra"));
const os = tslib_1.__importStar(require("os"));
const path = tslib_1.__importStar(require("path"));
const EasCommand_1 = tslib_1.__importDefault(require("../commandUtils/EasCommand"));
const context_1 = require("../credentials/context");
const AscApiKeyUtils_1 = require("../credentials/ios/actions/AscApiKeyUtils");
const BuildCredentialsUtils_1 = require("../credentials/ios/actions/BuildCredentialsUtils");
const SetUpAscApiKey_1 = require("../credentials/ios/actions/SetUpAscApiKey");
const SetUpBuildCredentials_1 = require("../credentials/ios/actions/SetUpBuildCredentials");
const SetUpPushKey_1 = require("../credentials/ios/actions/SetUpPushKey");
const ensureAppExists_1 = require("../credentials/ios/appstore/ensureAppExists");
const generated_1 = require("../graphql/generated");
const url_1 = require("../build/utils/url");
const AppMutation_1 = require("../graphql/mutations/AppMutation");
const WorkflowRunMutation_1 = require("../graphql/mutations/WorkflowRunMutation");
const WorkflowRunQuery_1 = require("../graphql/queries/WorkflowRunQuery");
const log_1 = tslib_1.__importStar(require("../log"));
const prompts_1 = require("../prompts");
const ora_1 = require("../ora");
const expoConfig_1 = require("../project/expoConfig");
const fetchOrCreateProjectIDForWriteToConfigWithConfirmationAsync_1 = require("../project/fetchOrCreateProjectIDForWriteToConfigWithConfirmationAsync");
const uploadAccountScopedFileAsync_1 = require("../project/uploadAccountScopedFileAsync");
const uploadAccountScopedProjectSourceAsync_1 = require("../project/uploadAccountScopedProjectSourceAsync");
const actions_1 = require("../user/actions");
const User_1 = require("../user/User");
const promise_1 = require("../utils/promise");
const noVcs_1 = tslib_1.__importDefault(require("../vcs/clients/noVcs"));
const bundleIdentifier_1 = require("../project/ios/bundleIdentifier");
function deriveBundleIdSlug(bundleId) {
    return bundleId.split('.').filter(Boolean).pop();
}
async function detectProjectSdkVersionAsync(projectDir) {
    const paths = (0, config_1.getConfigFilePaths)(projectDir);
    if (!paths.staticConfigPath && !paths.dynamicConfigPath) {
        return;
    }
    try {
        return (await (0, expoConfig_1.getPrivateExpoConfigAsync)(projectDir)).sdkVersion;
    }
    catch {
        return;
    }
}
const TESTFLIGHT_GROUP_NAME = 'Team (Expo)';
async function setupTestFlightAsync(ascApp) {
    let group;
    for (let attempt = 0; attempt < 10; attempt++) {
        try {
            const groups = await ascApp.getBetaGroupsAsync({
                query: { includes: ['betaTesters'] },
            });
            group = groups.find(g => g.attributes.isInternalGroup && g.attributes.name === TESTFLIGHT_GROUP_NAME);
            if (!group) {
                group = await ascApp.createBetaGroupAsync({
                    name: TESTFLIGHT_GROUP_NAME,
                    isInternalGroup: true,
                    hasAccessToAllBuilds: true,
                });
            }
            break;
        }
        catch (error) {
            // Apple returns this error when the app isn't ready yet
            if (error?.data?.errors?.some((e) => e.code === 'ENTITY_ERROR.RELATIONSHIP.INVALID')) {
                if (attempt < 9) {
                    await (0, promise_1.sleepAsync)(10_000);
                    continue;
                }
            }
            throw error;
        }
    }
    if (!group) {
        throw new Error('Failed to create TestFlight group');
    }
    const users = await apple_utils_1.User.getAsync(ascApp.context);
    const admins = users.filter(u => u.attributes.roles?.includes(apple_utils_1.UserRole.ADMIN));
    const existingEmails = new Set(group.attributes.betaTesters?.map((t) => t.attributes.email?.toLowerCase()) ?? []);
    const newTesters = admins
        .filter(u => u.attributes.email && !existingEmails.has(u.attributes.email.toLowerCase()))
        .map(u => ({
        email: u.attributes.email,
        firstName: u.attributes.firstName ?? '',
        lastName: u.attributes.lastName ?? '',
    }));
    if (newTesters.length > 0) {
        await group.createBulkBetaTesterAssignmentsAsync(newTesters);
    }
}
/* eslint-disable no-console */
async function withSuppressedOutputAsync(fn) {
    const originalStdoutWrite = process.stdout.write.bind(process.stdout);
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    let capturedOutput = '';
    const capture = (chunk) => {
        if (typeof chunk === 'string') {
            capturedOutput += chunk;
        }
        return true;
    };
    // Suppress stdout and console output during credential setup so its verbose
    // log lines don't interleave with our progress spinners.
    process.stdout.write = capture;
    console.log = () => { };
    console.error = () => { };
    console.warn = () => { };
    let didThrow = false;
    try {
        return await fn();
    }
    catch (error) {
        didThrow = true;
        throw error;
    }
    finally {
        process.stdout.write = originalStdoutWrite;
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
        if (didThrow && capturedOutput) {
            originalConsoleLog(capturedOutput);
        }
    }
}
/* eslint-enable no-console */
class Go extends EasCommand_1.default {
    static description = 'Create a custom Expo Go and submit to TestFlight';
    static hidden = true;
    static flags = {
        'bundle-id': core_1.Flags.string({
            description: 'iOS bundle identifier (auto-generated if not provided)',
            required: false,
        }),
        name: core_1.Flags.string({
            description: 'App name',
            default: 'My Expo Go',
        }),
        'sdk-version': core_1.Flags.string({
            description: 'Expo Go SDK version to prepare (default: latest)',
            required: false,
        }),
        credentials: core_1.Flags.boolean({
            description: 'Interactively select credentials (default: auto-select)',
            default: false,
        }),
    };
    static contextDefinition = {
        ...this.ContextOptions.LoggedIn,
        ...this.ContextOptions.Analytics,
    };
    async runAsync() {
        log_1.default.log(chalk_1.default.bold(`Creating your personal Expo Go and deploying to TestFlight. ${(0, log_1.learnMore)('https://expo.fyi/deploy-expo-go-testflight')}`));
        const { flags } = await this.parse(Go);
        const { loggedIn: { actor, graphqlClient }, analytics, } = await this.getContextAsync(Go, {
            nonInteractive: false,
        });
        log_1.default.withTick(`Logged in as ${chalk_1.default.cyan((0, User_1.getActorDisplayName)(actor))}`);
        const detectedSdkVersion = await detectProjectSdkVersionAsync(process.cwd());
        if (detectedSdkVersion && !flags['sdk-version']) {
            log_1.default.log(`Current project using SDK ${detectedSdkVersion.split('.')[0]}. Auto-selected same version. To use a different version, pass --sdk-version.`);
        }
        let sdkVersion = flags['sdk-version'] ?? detectedSdkVersion;
        if (!sdkVersion) {
            ({ sdkVersion } = await this.selectSdkVersionAsync(graphqlClient));
        }
        const bundleId = flags['bundle-id'] ?? this.generateBundleId(actor);
        if (!(0, bundleIdentifier_1.isBundleIdentifierValid)(bundleId)) {
            throw new Error(`"${bundleId}" is not a valid iOS bundle identifier. ${bundleIdentifier_1.INVALID_BUNDLE_IDENTIFIER_MESSAGE} Pass a valid identifier with --bundle-id.`);
        }
        const appName = flags.name;
        const slug = deriveBundleIdSlug(bundleId);
        const setupSpinner = (0, ora_1.ora)('Setting up project...').start();
        let projectId;
        try {
            projectId = await withSuppressedOutputAsync(() => this.ensureEasProjectAsync(graphqlClient, actor, slug));
        }
        catch (error) {
            setupSpinner.fail();
            throw error;
        }
        const tmpDir = path.join(os.tmpdir(), `eas-go-${Date.now()}`);
        await fs.ensureDir(tmpDir);
        const vcsClient = new noVcs_1.default({ cwdOverride: tmpDir });
        try {
            const ascApp = await this.setupCredentialsAsync(slug, projectId, bundleId, appName, graphqlClient, actor, analytics, vcsClient, flags.credentials, () => {
                setupSpinner.stop();
                log_1.default.markFreshLine();
            });
            const { workflowUrl, workflowRunId, sdkVersion: resolvedSdkVersion, } = await this.dispatchWorkflowAsync(graphqlClient, projectId, actor, bundleId, appName, ascApp.id, sdkVersion, tmpDir, vcsClient);
            log_1.default.withTick(`Using Expo Go SDK ${chalk_1.default.cyan(resolvedSdkVersion.split('.')[0])}`);
            log_1.default.withTick(`Build started: ${chalk_1.default.cyan(workflowUrl)}`);
            const status = await this.monitorWorkflowJobsAsync(graphqlClient, workflowRunId);
            if (status === generated_1.WorkflowRunStatus.Failure) {
                throw new Error('Build failed');
            }
            else if (status === generated_1.WorkflowRunStatus.Canceled) {
                throw new Error('Build was canceled');
            }
            try {
                await setupTestFlightAsync(ascApp);
            }
            catch (e) {
                log_1.default.debug('TestFlight group setup failed:', e);
            }
            log_1.default.newLine();
            log_1.default.succeed(`Done! Your custom Expo Go has been submitted to TestFlight. ${(0, log_1.learnMore)(`https://appstoreconnect.apple.com/apps/${ascApp.id}/testflight`, { learnMoreMessage: 'Open it on App Store Connect' })}`);
            log_1.default.log(`App Store processing may take several minutes to complete. ${(0, log_1.learnMore)('https://expo.fyi/personal-expo-go', { learnMoreMessage: 'Learn more about Expo Go on TestFlight' })}`);
        }
        finally {
            await fs.remove(tmpDir);
        }
    }
    async selectSdkVersionAsync(graphqlClient) {
        let versions;
        try {
            versions = await WorkflowRunQuery_1.WorkflowRunQuery.expoGoSupportedSdkVersionsAsync(graphqlClient);
        }
        catch {
            return { sdkVersion: undefined };
        }
        const selectable = versions.filter(v => !v.isDeprecated);
        if (selectable.length === 0) {
            return { sdkVersion: undefined };
        }
        const defaultVersion = selectable.find(v => v.isLatest) ?? selectable.at(-1);
        return {
            sdkVersion: await (0, prompts_1.selectAsync)('Select an Expo SDK version', selectable.map(v => {
                const major = v.sdkVersion.split('.')[0];
                const title = v.isLatest
                    ? `SDK ${major} (latest)`
                    : v.isBeta
                        ? `SDK ${major} (beta)`
                        : `SDK ${major}`;
                return { title, value: v.sdkVersion };
            }), { initial: defaultVersion?.sdkVersion }),
        };
    }
    generateBundleId(actor) {
        const username = (0, actions_1.ensureActorHasPrimaryAccount)(actor).name;
        const sanitizedUsername = username
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-{2,}/g, '-')
            .replace(/^-+|-+$/g, '');
        return `com.${sanitizedUsername}.expogo`;
    }
    async ensureEasProjectAsync(graphqlClient, actor, slug) {
        const account = (0, actions_1.ensureActorHasPrimaryAccount)(actor);
        const existingProjectId = await (0, fetchOrCreateProjectIDForWriteToConfigWithConfirmationAsync_1.findProjectIdByAccountNameAndSlugNullableAsync)(graphqlClient, account.name, slug);
        if (existingProjectId) {
            return existingProjectId;
        }
        return await AppMutation_1.AppMutation.createAppAsync(graphqlClient, {
            accountId: account.id,
            projectName: slug,
        });
    }
    async setupCredentialsAsync(slug, projectId, bundleId, appName, graphqlClient, actor, analytics, vcsClient, customizeCreds, onBeforeAppleAuth) {
        const extensionBundleId = `${bundleId}.ExpoNotificationServiceExtension`;
        const exp = { name: appName, slug, ios: { bundleIdentifier: bundleId } };
        const credentialsCtx = new context_1.CredentialsContext({
            projectInfo: { exp, projectId },
            nonInteractive: false,
            autoAcceptCredentialReuse: !customizeCreds,
            projectDir: process.cwd(),
            user: actor,
            graphqlClient,
            analytics,
            vcsClient,
        });
        onBeforeAppleAuth?.();
        const userAuthCtx = await credentialsCtx.appStore.ensureUserAuthenticatedAsync();
        const app = await (0, BuildCredentialsUtils_1.getAppFromContextAsync)(credentialsCtx);
        const targets = [
            {
                targetName: slug,
                bundleIdentifier: bundleId,
                entitlements: {},
            },
            {
                targetName: 'ExpoNotificationServiceExtension',
                bundleIdentifier: extensionBundleId,
                parentBundleIdentifier: bundleId,
                entitlements: {},
            },
        ];
        await new SetUpBuildCredentials_1.SetUpBuildCredentials({
            app,
            targets,
            distribution: 'store',
        }).runAsync(credentialsCtx);
        const appLookupParams = {
            ...app,
            bundleIdentifier: bundleId,
        };
        await new SetUpAscApiKey_1.SetUpAscApiKey(appLookupParams, AscApiKeyUtils_1.AppStoreApiKeyPurpose.SUBMISSION_SERVICE).runAsync(credentialsCtx);
        const ascApp = await (0, ensureAppExists_1.ensureAppExistsAsync)(userAuthCtx, {
            name: appName,
            bundleIdentifier: bundleId,
        });
        const setupPushKeyAction = new SetUpPushKey_1.SetUpPushKey(appLookupParams);
        const isPushKeySetup = await setupPushKeyAction.isPushKeySetupAsync(credentialsCtx);
        if (!isPushKeySetup) {
            if (customizeCreds) {
                const wantsPushNotifications = await (0, prompts_1.confirmAsync)({
                    message: 'Would you like to set up Push Notifications for your app?',
                    initial: true,
                });
                if (wantsPushNotifications) {
                    await setupPushKeyAction.runAsync(credentialsCtx);
                }
            }
            else {
                await setupPushKeyAction.runAsync(credentialsCtx);
            }
        }
        return ascApp;
    }
    async dispatchWorkflowAsync(graphqlClient, projectId, actor, bundleId, appName, ascAppId, sdkVersion, tmpDir, vcsClient) {
        const account = (0, actions_1.ensureActorHasPrimaryAccount)(actor);
        const repackConfig = await WorkflowRunQuery_1.WorkflowRunQuery.expoGoRepackConfigurationAsync(graphqlClient, {
            appId: projectId,
            ascAppId,
            appName,
            bundleId,
            sdkVersion,
        });
        await Promise.all(repackConfig.files.map(f => fs.writeFile(path.join(tmpDir, f.fileName), f.fileContents)));
        const { projectArchiveBucketKey, easJsonBucketKey, packageJsonBucketKey } = await withSuppressedOutputAsync(async () => {
            const { projectArchiveBucketKey } = await (0, uploadAccountScopedProjectSourceAsync_1.uploadAccountScopedProjectSourceAsync)({
                graphqlClient,
                vcsClient,
                accountId: account.id,
            });
            const { fileBucketKey: easJsonBucketKey } = await (0, uploadAccountScopedFileAsync_1.uploadAccountScopedFileAsync)({
                graphqlClient,
                accountId: account.id,
                filePath: path.join(tmpDir, 'eas.json'),
                maxSizeBytes: 1024 * 1024,
            });
            const { fileBucketKey: packageJsonBucketKey } = await (0, uploadAccountScopedFileAsync_1.uploadAccountScopedFileAsync)({
                graphqlClient,
                accountId: account.id,
                filePath: path.join(tmpDir, 'package.json'),
                maxSizeBytes: 1024 * 1024,
            });
            return { projectArchiveBucketKey, easJsonBucketKey, packageJsonBucketKey };
        });
        const result = await WorkflowRunMutation_1.WorkflowRunMutation.createExpoGoRepackWorkflowRunAsync(graphqlClient, {
            appId: projectId,
            sdkVersion: repackConfig.sdkVersion,
            projectSource: {
                type: generated_1.WorkflowProjectSourceType.Gcs,
                projectArchiveBucketKey,
                easJsonBucketKey,
                packageJsonBucketKey,
            },
        });
        const workflowUrl = (0, url_1.getWorkflowRunUrl)(account.name, deriveBundleIdSlug(bundleId), result.id);
        return { workflowUrl, workflowRunId: result.id, sdkVersion: repackConfig.sdkVersion };
    }
    async monitorWorkflowJobsAsync(graphqlClient, workflowRunId) {
        const EXPECTED_BUILD_DURATION_SECONDS = 5 * 60;
        const EXPECTED_SUBMIT_DURATION_SECONDS = 2 * 60;
        const buildStartTime = Date.now();
        let submitStartTime = null;
        const buildSpinner = (0, ora_1.ora)(this.formatSpinnerText('Building Expo Go', EXPECTED_BUILD_DURATION_SECONDS, buildStartTime)).start();
        let submitSpinner = null;
        let buildCompleted = false;
        let failedFetchesCount = 0;
        while (true) {
            if (!buildCompleted) {
                buildSpinner.text = this.formatSpinnerText('Building Expo Go', EXPECTED_BUILD_DURATION_SECONDS, buildStartTime);
            }
            if (submitSpinner && submitStartTime) {
                submitSpinner.text = this.formatSpinnerText('Submitting to TestFlight', EXPECTED_SUBMIT_DURATION_SECONDS, submitStartTime);
            }
            try {
                const workflowRun = await WorkflowRunQuery_1.WorkflowRunQuery.withJobsByIdAsync(graphqlClient, workflowRunId, {
                    useCache: false,
                });
                failedFetchesCount = 0;
                const repackJob = workflowRun.jobs.find(j => j.key === 'build');
                const submitJob = workflowRun.jobs.find(j => j.key === 'submit');
                if (!buildCompleted) {
                    if (repackJob?.status === generated_1.WorkflowJobStatus.Success) {
                        buildSpinner.succeed('Built Expo Go');
                        buildCompleted = true;
                    }
                    else if (repackJob?.status === generated_1.WorkflowJobStatus.Failure ||
                        repackJob?.status === generated_1.WorkflowJobStatus.Canceled) {
                        buildSpinner.fail('Build failed');
                        return generated_1.WorkflowRunStatus.Failure;
                    }
                }
                if (buildCompleted && submitSpinner === null && submitJob) {
                    submitStartTime = Date.now();
                    submitSpinner = (0, ora_1.ora)(this.formatSpinnerText('Submitting to TestFlight', EXPECTED_SUBMIT_DURATION_SECONDS, submitStartTime)).start();
                }
                if (workflowRun.status === generated_1.WorkflowRunStatus.Success) {
                    submitSpinner?.stop();
                    return generated_1.WorkflowRunStatus.Success;
                }
                else if (workflowRun.status === generated_1.WorkflowRunStatus.Failure) {
                    buildSpinner.stop();
                    submitSpinner?.fail('Submission failed');
                    return generated_1.WorkflowRunStatus.Failure;
                }
                else if (workflowRun.status === generated_1.WorkflowRunStatus.Canceled) {
                    buildSpinner.stop();
                    submitSpinner?.stop();
                    return generated_1.WorkflowRunStatus.Canceled;
                }
            }
            catch {
                failedFetchesCount++;
                if (failedFetchesCount > 6) {
                    buildSpinner.fail();
                    submitSpinner?.fail();
                    throw new Error('Failed to fetch the workflow run status 6 times in a row');
                }
            }
            await (0, promise_1.sleepAsync)(10 * 1000);
        }
    }
    formatSpinnerText(label, expectedDurationSeconds, startTime) {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const remainingSeconds = Math.max(0, expectedDurationSeconds - elapsedSeconds);
        if (remainingSeconds === 0) {
            return `${label} (almost done...)`;
        }
        const minutes = Math.ceil(remainingSeconds / 60);
        const unit = minutes === 1 ? 'minute' : 'minutes';
        return `${label} (~${minutes} ${unit} remaining)`;
    }
}
exports.default = Go;
