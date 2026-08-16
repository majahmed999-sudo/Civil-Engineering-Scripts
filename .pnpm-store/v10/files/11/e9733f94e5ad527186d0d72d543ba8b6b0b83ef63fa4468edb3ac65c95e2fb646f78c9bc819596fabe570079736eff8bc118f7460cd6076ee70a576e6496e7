"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const spawn_async_1 = tslib_1.__importDefault(require("@expo/spawn-async"));
const core_1 = require("@oclif/core");
const better_opn_1 = tslib_1.__importDefault(require("better-opn"));
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
const fs = tslib_1.__importStar(require("fs-extra"));
const path_1 = tslib_1.__importDefault(require("path"));
const environment_1 = require("../../../build/utils/environment");
const EasCommand_1 = tslib_1.__importDefault(require("../../../commandUtils/EasCommand"));
const flags_1 = require("../../../commandUtils/flags");
const posthog_1 = require("../../../commandUtils/posthog");
const generated_1 = require("../../../graphql/generated");
const EnvironmentVariableMutation_1 = require("../../../graphql/mutations/EnvironmentVariableMutation");
const PostHogMutation_1 = require("../../../graphql/mutations/PostHogMutation");
const EnvironmentVariablesQuery_1 = require("../../../graphql/queries/EnvironmentVariablesQuery");
const PostHogQuery_1 = require("../../../graphql/queries/PostHogQuery");
const log_1 = tslib_1.__importStar(require("../../../log"));
const ora_1 = require("../../../ora");
const expoConfig_1 = require("../../../project/expoConfig");
const projectUtils_1 = require("../../../project/projectUtils");
const prompts_1 = require("../../../prompts");
const json_1 = require("../../../utils/json");
const POSTHOG_REGIONS = [
    { title: 'United States (US)', value: generated_1.PostHogRegion.Us },
    { title: 'European Union (EU)', value: generated_1.PostHogRegion.Eu },
];
const EAS_POSTHOG_ENVIRONMENTS = [
    environment_1.DefaultEnvironment.Production,
    environment_1.DefaultEnvironment.Preview,
    environment_1.DefaultEnvironment.Development,
];
const SDK_PACKAGES = [
    'posthog-react-native',
    'expo-file-system',
    'expo-application',
    'expo-device',
    'expo-localization',
];
const SESSION_REPLAY_PACKAGE = 'posthog-react-native-session-replay';
const CONFIG_PLUGIN = 'posthog-react-native/expo';
const EAS_POSTHOG_API_KEY_ENV_VAR_NAME = 'EXPO_PUBLIC_POSTHOG_API_KEY';
const EAS_POSTHOG_HOST_ENV_VAR_NAME = 'EXPO_PUBLIC_POSTHOG_HOST';
const POSTHOG_CLI_API_KEY_ENV_VAR_NAME = 'POSTHOG_CLI_API_KEY';
const POSTHOG_CLI_PROJECT_ID_ENV_VAR_NAME = 'POSTHOG_CLI_PROJECT_ID';
const POSTHOG_CLI_HOST_ENV_VAR_NAME = 'POSTHOG_CLI_HOST';
// Match the server's 15-minute pending-row TTL — timing out sooner would strand an approval
// the user completes within the window.
const CONNECTION_POLL_INTERVAL_MS = 2_000;
const CONNECTION_POLL_TIMEOUT_MS = 15 * 60 * 1_000;
const PERSONAL_API_KEY_SETTINGS_PATH = '/settings/user-api-keys';
const ERROR_TRACKING_NEEDS_KEY_MESSAGE = `Error tracking needs a PostHog personal API key in non-interactive mode. Pass --posthog-cli-api-key (create one in PostHog under Settings → Personal API keys (${PERSONAL_API_KEY_SETTINGS_PATH}) with the "Source map upload" preset), or drop --error-tracking.`;
function getSpawnErrorOutput(error) {
    const { stdout, stderr } = (error ?? {});
    return `${stdout ?? ''}${stderr ?? ''}`;
}
class IntegrationsPostHogConnect extends EasCommand_1.default {
    static description = 'connect PostHog to your Expo project';
    static contextDefinition = {
        ...this.ContextOptions.ProjectConfig,
    };
    static flags = {
        ...flags_1.EasNonInteractiveAndJsonFlags,
        region: core_1.Flags.string({
            description: 'PostHog region',
            options: POSTHOG_REGIONS.map(r => r.value),
        }),
        'session-replay': core_1.Flags.boolean({
            allowNo: true,
            description: 'Set up PostHog session replay (default: yes)',
        }),
        'error-tracking': core_1.Flags.boolean({
            allowNo: true,
            description: 'Set up PostHog error tracking / source maps (requires a personal API key)',
        }),
        'posthog-cli-api-key': core_1.Flags.string({
            description: 'PostHog personal API key for error-tracking source-map uploads (enables error tracking non-interactively)',
        }),
        overwrite: core_1.Flags.boolean({
            description: 'Overwrite existing PostHog environment variables without prompting',
            default: false,
        }),
    };
    async runAsync() {
        const { flags } = await this.parse(IntegrationsPostHogConnect);
        const { region: regionFlag, overwrite } = flags;
        const cliApiKeyFlag = (flags['posthog-cli-api-key'] ?? process.env[POSTHOG_CLI_API_KEY_ENV_VAR_NAME])?.trim() ||
            undefined;
        const { json: jsonFlag, nonInteractive } = (0, flags_1.resolveNonInteractiveAndJsonFlags)(flags);
        if (jsonFlag) {
            (0, json_1.enableJsonOutput)();
        }
        if (nonInteractive && flags['error-tracking'] === true && !cliApiKeyFlag) {
            throw new Error(ERROR_TRACKING_NEEDS_KEY_MESSAGE);
        }
        const { privateProjectConfig: { projectId, exp, projectDir }, loggedIn: { graphqlClient }, } = await this.getContextAsync(IntegrationsPostHogConnect, {
            nonInteractive,
            withServerSideEnvironment: null,
        });
        const account = await (0, projectUtils_1.getOwnerAccountForProjectIdAsync)(graphqlClient, projectId);
        let connection = await PostHogQuery_1.PostHogQuery.getPostHogOrganizationConnectionByAccountIdAsync(graphqlClient, account.id);
        if (connection) {
            if (regionFlag && regionFlag !== connection.posthogRegion) {
                log_1.default.warn(`This account is already connected to PostHog in the ${connection.posthogRegion} region; --region ${regionFlag} is ignored. An account has a single PostHog organization and its region can't be changed.`);
            }
            log_1.default.withTick(`Using existing PostHog organization ${chalk_1.default.bold(connection.posthogOrganizationName)} (${connection.posthogRegion})`);
        }
        else {
            const region = await this.resolveRegionAsync(regionFlag, nonInteractive);
            connection = await this.startConnectionAsync(graphqlClient, account, region, nonInteractive);
        }
        let project = await PostHogQuery_1.PostHogQuery.getPostHogProjectByAppIdAsync(graphqlClient, projectId);
        if (project) {
            log_1.default.withTick(`Using existing PostHog project ${chalk_1.default.bold(project.posthogProjectName)}`);
        }
        else {
            const spinner = (0, ora_1.ora)('Setting up PostHog project').start();
            try {
                project = await PostHogMutation_1.PostHogMutation.setupPostHogProjectAsync(graphqlClient, {
                    appId: projectId,
                    posthogOrganizationConnectionId: connection.id,
                });
                spinner.succeed(`Created PostHog project ${chalk_1.default.bold(project.posthogProjectName)}`);
            }
            catch (error) {
                spinner.fail('Failed to set up PostHog project');
                throw error;
            }
        }
        const features = await this.resolveFeaturesAsync(flags, cliApiKeyFlag, nonInteractive);
        const anyFeatureSelected = features.analytics || features.sessionReplay || features.errorTracking;
        const envVars = [];
        if (anyFeatureSelected) {
            envVars.push({
                name: EAS_POSTHOG_API_KEY_ENV_VAR_NAME,
                value: project.posthogProjectToken,
                visibility: generated_1.EnvironmentVariableVisibility.Public,
            }, {
                name: EAS_POSTHOG_HOST_ENV_VAR_NAME,
                value: project.posthogHost,
                visibility: generated_1.EnvironmentVariableVisibility.Public,
            });
        }
        if (features.errorTracking) {
            const cliApiKey = await this.resolveCliApiKeyAsync(cliApiKeyFlag, project.posthogHost);
            envVars.push({
                name: POSTHOG_CLI_API_KEY_ENV_VAR_NAME,
                value: cliApiKey,
                visibility: generated_1.EnvironmentVariableVisibility.Sensitive,
            }, {
                name: POSTHOG_CLI_PROJECT_ID_ENV_VAR_NAME,
                value: project.posthogProjectIdentifier,
                visibility: generated_1.EnvironmentVariableVisibility.Public,
            }, {
                name: POSTHOG_CLI_HOST_ENV_VAR_NAME,
                value: project.posthogHost,
                visibility: generated_1.EnvironmentVariableVisibility.Public,
            });
        }
        const manualSteps = [];
        if (anyFeatureSelected) {
            const packages = [...SDK_PACKAGES];
            if (features.sessionReplay) {
                packages.push(SESSION_REPLAY_PACKAGE);
            }
            const installResult = await this.installSdkPackagesAsync(projectDir, packages, jsonFlag);
            if (installResult === 'failed') {
                manualSteps.push(`The PostHog SDK packages didn't install. Run npx expo install ${packages.join(' ')} from your project directory.`);
            }
            const pluginManualStep = await this.addConfigPluginAsync(projectDir, exp);
            if (pluginManualStep) {
                manualSteps.push(pluginManualStep);
            }
        }
        await this.writeEnvLocalAsync(projectDir, envVars, nonInteractive, overwrite);
        await Promise.all(envVars.map(envVar => this.upsertEasEnvVarAsync(graphqlClient, projectId, envVar, nonInteractive, overwrite)));
        if (jsonFlag) {
            (0, json_1.printJsonOnlyOutput)({
                organizationConnection: {
                    id: connection.id,
                    name: connection.posthogOrganizationName,
                    region: connection.posthogRegion,
                },
                project: {
                    id: project.id,
                    name: project.posthogProjectName,
                    apiKey: project.posthogProjectToken,
                    host: project.posthogHost,
                },
                features,
                dashboardUrl: (0, posthog_1.getPostHogProjectDashboardUrl)(project),
                environmentVariables: envVars.map(v => v.name),
                manualSteps,
            });
            return;
        }
        if (!anyFeatureSelected) {
            log_1.default.addNewLineIfNone();
            log_1.default.log(chalk_1.default.green('PostHog project created.'));
            log_1.default.newLine();
            log_1.default.log(`${chalk_1.default.bold('Dashboard')}: ${(0, log_1.link)((0, posthog_1.getPostHogProjectDashboardUrl)(project), { dim: false })}`);
            log_1.default.newLine();
            log_1.default.warn('No PostHog features selected, so no SDK, config plugin, or environment variables were set up. Re-run to add analytics, session replay, or error tracking.');
            return;
        }
        this.printNextSteps(project, features, manualSteps);
    }
    async startConnectionAsync(graphqlClient, account, region, nonInteractive) {
        const spinner = (0, ora_1.ora)('Creating PostHog organization').start();
        let result;
        try {
            result = await PostHogMutation_1.PostHogMutation.startPostHogConnectionAsync(graphqlClient, {
                accountId: account.id,
                region,
            });
        }
        catch (error) {
            spinner.fail('Failed to create PostHog organization');
            throw error;
        }
        if (result.__typename === 'PostHogOrganizationConnection') {
            spinner.succeed(`Created PostHog organization ${chalk_1.default.bold(result.posthogOrganizationName)}`);
            return result;
        }
        spinner.stop();
        if (nonInteractive) {
            throw new Error(`The email on the ${chalk_1.default.bold(account.name)} account already has a PostHog account, which must be connected by approving it in a browser. Re-run \`eas integrations:posthog:connect\` interactively to finish connecting.`);
        }
        return await this.completePendingConnectionViaBrowserAsync(graphqlClient, account, result);
    }
    async completePendingConnectionViaBrowserAsync(graphqlClient, account, pending) {
        log_1.default.addNewLineIfNone();
        log_1.default.log(`The email on the ${chalk_1.default.bold(account.name)} account already has a PostHog account. Approve connecting it to Expo in your browser.`);
        const opened = await (0, better_opn_1.default)(pending.url).catch(() => false);
        log_1.default.log(opened
            ? `Opened ${(0, log_1.link)(pending.url)}`
            : `Open this URL to approve the connection: ${(0, log_1.link)(pending.url)}`);
        const spinner = (0, ora_1.ora)('Waiting for you to approve the connection in PostHog (up to 15 minutes; press Ctrl-C to cancel)').start();
        try {
            const connection = await this.pollForConnectionAsync(graphqlClient, account.id);
            spinner.succeed(`Connected PostHog organization ${chalk_1.default.bold(connection.posthogOrganizationName)}`);
            return connection;
        }
        catch (error) {
            spinner.fail("Couldn't confirm the PostHog connection");
            throw error;
        }
    }
    async pollForConnectionAsync(graphqlClient, accountId) {
        const deadline = Date.now() + CONNECTION_POLL_TIMEOUT_MS;
        while (true) {
            let connection = null;
            try {
                connection = await PostHogQuery_1.PostHogQuery.getPostHogOrganizationConnectionByAccountIdAsync(graphqlClient, accountId, { useCache: false });
            }
            catch (error) {
                log_1.default.debug(`Polling for the PostHog connection failed, will retry: ${error}`);
            }
            if (connection) {
                return connection;
            }
            if (Date.now() >= deadline) {
                throw new Error('Timed out waiting for the PostHog connection. If you approved it in your browser, re-run `eas integrations:posthog:connect` — it will pick up the connection. If not, approve it and try again.');
            }
            await new Promise(resolve => setTimeout(resolve, CONNECTION_POLL_INTERVAL_MS));
        }
    }
    async resolveFeaturesAsync(flags, cliApiKey, nonInteractive) {
        const sessionReplayFlag = flags['session-replay'];
        const errorTrackingFlag = flags['error-tracking'];
        const hasCliApiKey = !!cliApiKey;
        if (nonInteractive) {
            const errorTracking = errorTrackingFlag ?? hasCliApiKey;
            if (errorTrackingFlag === undefined && !hasCliApiKey) {
                log_1.default.warn('Skipping error tracking (source maps) — it needs a personal API key. Re-run interactively, or pass --posthog-cli-api-key to enable it non-interactively.');
            }
            return { analytics: true, sessionReplay: sessionReplayFlag ?? true, errorTracking };
        }
        if (sessionReplayFlag !== undefined || errorTrackingFlag !== undefined) {
            return {
                analytics: true,
                sessionReplay: sessionReplayFlag ?? true,
                errorTracking: errorTrackingFlag ?? true,
            };
        }
        const { features } = await (0, prompts_1.promptAsync)({
            type: 'multiselect',
            name: 'features',
            message: 'PostHog features to set up',
            choices: [
                { title: 'Analytics', value: 'analytics', selected: true },
                { title: 'Session replay', value: 'session-replay', selected: true },
                {
                    title: 'Error tracking (source maps) — requires a personal API key',
                    value: 'error-tracking',
                    selected: true,
                },
            ],
            instructions: false,
            min: 0,
        });
        const selected = new Set(features);
        return {
            analytics: selected.has('analytics'),
            sessionReplay: selected.has('session-replay'),
            errorTracking: selected.has('error-tracking'),
        };
    }
    async resolveCliApiKeyAsync(cliApiKey, host) {
        if (cliApiKey) {
            return cliApiKey;
        }
        const settingsUrl = `${host.replace(/\/$/, '')}${PERSONAL_API_KEY_SETTINGS_PATH}`;
        const { apiKey } = await (0, prompts_1.promptAsync)({
            type: 'password',
            name: 'apiKey',
            message: `Paste a PostHog personal API key for source-map uploads.\nCreate one at ${settingsUrl} using the "Source map upload" preset.`,
            validate: (value) => (value.trim() ? true : 'Personal API key cannot be empty'),
        });
        return apiKey.trim();
    }
    async resolveRegionAsync(flagValue, nonInteractive) {
        const flagRegion = POSTHOG_REGIONS.find(r => r.value === flagValue);
        if (flagRegion) {
            return flagRegion.value;
        }
        if (nonInteractive) {
            throw new Error('A PostHog region is required in non-interactive mode. Pass --region US or --region EU. The region sets data residency and cannot be changed after connecting.');
        }
        return await (0, prompts_1.selectAsync)('Select a PostHog region', POSTHOG_REGIONS);
    }
    async installSdkPackagesAsync(projectDir, packages, jsonFlag) {
        const spinner = jsonFlag ? null : (0, ora_1.ora)('Installing the PostHog SDK packages').start();
        try {
            await (0, spawn_async_1.default)('npx', ['expo', 'install', ...packages], { cwd: projectDir });
            spinner?.succeed('Installed the PostHog SDK packages');
            return 'installed';
        }
        catch (error) {
            const output = getSpawnErrorOutput(error);
            log_1.default.debug(output || error);
            if (output.includes('Cannot automatically write to dynamic config')) {
                spinner?.succeed('Installed the PostHog SDK packages');
                return 'installed';
            }
            spinner?.fail('Failed to install the PostHog SDK packages');
            return 'failed';
        }
    }
    async addConfigPluginAsync(projectDir, exp) {
        const plugins = exp.plugins ?? [];
        const alreadyAdded = plugins.some(p => (Array.isArray(p) ? p[0] : p) === CONFIG_PLUGIN);
        if (alreadyAdded) {
            log_1.default.withTick(`Config plugin ${chalk_1.default.bold(CONFIG_PLUGIN)} is already configured`);
            return null;
        }
        const modification = await (0, expoConfig_1.createOrModifyExpoConfigAsync)(projectDir, { plugins: [...plugins, CONFIG_PLUGIN] }, { skipSDKVersionRequirement: true });
        if (modification.type === 'success') {
            log_1.default.withTick(`Added the ${chalk_1.default.bold(CONFIG_PLUGIN)} config plugin`);
            return null;
        }
        if (modification.type === 'warn') {
            return `${modification.message} Add ${JSON.stringify(CONFIG_PLUGIN)} to the "plugins" array in your app config.`;
        }
        return `Add ${JSON.stringify(CONFIG_PLUGIN)} to the "plugins" array in your app config.`;
    }
    async writeEnvLocalAsync(projectDir, envVars, nonInteractive, overwrite) {
        if (envVars.length === 0) {
            return;
        }
        const envPath = path_1.default.join(projectDir, '.env.local');
        let rawContent = '';
        if (await fs.pathExists(envPath)) {
            rawContent = await fs.readFile(envPath, 'utf8');
            const existing = dotenv_1.default.parse(rawContent);
            const conflicts = envVars.filter(v => existing[v.name] !== undefined);
            if (conflicts.length > 0 && !overwrite) {
                if (nonInteractive) {
                    log_1.default.warn(`.env.local already defines ${conflicts
                        .map(v => v.name)
                        .join(', ')}; skipped (pass --overwrite to replace).`);
                    return;
                }
                const confirmed = await (0, prompts_1.confirmAsync)({
                    message: `.env.local already defines ${conflicts
                        .map(v => v.name)
                        .join(', ')}. Overwrite with the PostHog values?`,
                });
                if (!confirmed) {
                    log_1.default.warn(`Skipped updating ${chalk_1.default.bold('.env.local')}.`);
                    return;
                }
            }
        }
        const updatedContent = this.mergeEnvContent(rawContent, Object.fromEntries(envVars.map(v => [v.name, v.value])));
        await fs.writeFile(envPath, updatedContent);
        log_1.default.withTick(`Wrote PostHog config to ${chalk_1.default.bold('.env.local')}`);
    }
    mergeEnvContent(rawContent, newVars) {
        let content = rawContent;
        const keysToAdd = { ...newVars };
        for (const [key, value] of Object.entries(newVars)) {
            const regex = new RegExp(`^${key}=.*$`, 'm');
            if (regex.test(content)) {
                content = content.replace(regex, () => `${key}=${value}`);
                delete keysToAdd[key];
            }
        }
        const remaining = Object.entries(keysToAdd);
        if (remaining.length > 0) {
            if (content.length > 0 && !content.endsWith('\n')) {
                content += '\n';
            }
            for (const [key, value] of remaining) {
                content += `${key}=${value}\n`;
            }
        }
        return content;
    }
    async upsertEasEnvVarAsync(graphqlClient, projectId, envVar, nonInteractive, overwrite) {
        const existingVariables = await EnvironmentVariablesQuery_1.EnvironmentVariablesQuery.byAppIdAsync(graphqlClient, {
            appId: projectId,
            filterNames: [envVar.name],
        });
        const existingProjectVariable = existingVariables.find(variable => variable.scope === generated_1.EnvironmentVariableScope.Project);
        if (existingProjectVariable) {
            const shouldOverwrite = overwrite ||
                (!nonInteractive &&
                    (await (0, prompts_1.confirmAsync)({
                        message: `EAS already has an ${envVar.name} environment variable for this project. Overwrite it?`,
                    })));
            if (!shouldOverwrite) {
                log_1.default.warn(`Skipped updating EAS environment variable ${chalk_1.default.bold(envVar.name)}${nonInteractive ? ' (pass --overwrite to replace it)' : ''}.`);
                return;
            }
            await EnvironmentVariableMutation_1.EnvironmentVariableMutation.updateAsync(graphqlClient, {
                id: existingProjectVariable.id,
                name: envVar.name,
                value: envVar.value,
                environments: EAS_POSTHOG_ENVIRONMENTS,
                visibility: envVar.visibility,
                type: generated_1.EnvironmentSecretType.String,
            });
            log_1.default.withTick(`Updated EAS environment variable ${chalk_1.default.bold(envVar.name)} for builds`);
            return;
        }
        await EnvironmentVariableMutation_1.EnvironmentVariableMutation.createForAppAsync(graphqlClient, {
            name: envVar.name,
            value: envVar.value,
            environments: EAS_POSTHOG_ENVIRONMENTS,
            visibility: envVar.visibility,
            type: generated_1.EnvironmentSecretType.String,
        }, projectId);
        log_1.default.withTick(`Created EAS environment variable ${chalk_1.default.bold(envVar.name)} for builds`);
    }
    printNextSteps(project, features, manualSteps) {
        log_1.default.addNewLineIfNone();
        log_1.default.log(chalk_1.default.green('PostHog is connected!'));
        log_1.default.newLine();
        log_1.default.log(`${chalk_1.default.bold('Dashboard')}: ${(0, log_1.link)((0, posthog_1.getPostHogProjectDashboardUrl)(project), { dim: false })}`);
        log_1.default.newLine();
        log_1.default.log('Next steps:');
        const steps = [
            `Wrap your app in ${chalk_1.default.cyan('<PostHogProvider>')} following our guide (${chalk_1.default.cyan('https://docs.expo.dev/guides/using-posthog')}).`,
        ];
        if (features.sessionReplay) {
            steps.push(`Enable session replay in the provider options (the ${chalk_1.default.bold(SESSION_REPLAY_PACKAGE)} package is installed).`);
        }
        if (features.errorTracking) {
            steps.push(`Error-tracking source maps: your ${chalk_1.default.bold('POSTHOG_CLI_*')} env vars are set. Wrap ${chalk_1.default.bold('metro.config.js')} with ${chalk_1.default.cyan('getPostHogExpoConfig')} (see ${chalk_1.default.cyan('https://docs.expo.dev/guides/using-posthog#source-maps')}); uploads then run automatically on EAS Build, and via ${chalk_1.default.cyan('posthog-cli hermes upload')} for EAS Update.`);
        }
        steps.forEach((step, index) => {
            log_1.default.log(`  ${index + 1}. ${step}`);
        });
        if (manualSteps.length > 0) {
            log_1.default.newLine();
            log_1.default.warn('Finish setup manually:');
            manualSteps.forEach(step => {
                log_1.default.warn(`  • ${step}`);
            });
        }
    }
}
exports.default = IntegrationsPostHogConnect;
