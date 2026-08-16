"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const spawn_async_1 = tslib_1.__importDefault(require("@expo/spawn-async"));
const core_1 = require("@oclif/core");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
const fs = tslib_1.__importStar(require("fs-extra"));
const path_1 = tslib_1.__importDefault(require("path"));
const environment_1 = require("../../../build/utils/environment");
const EasCommand_1 = tslib_1.__importDefault(require("../../../commandUtils/EasCommand"));
const convex_1 = require("../../../commandUtils/convex");
const flags_1 = require("../../../commandUtils/flags");
const generated_1 = require("../../../graphql/generated");
const ConvexMutation_1 = require("../../../graphql/mutations/ConvexMutation");
const EnvironmentVariableMutation_1 = require("../../../graphql/mutations/EnvironmentVariableMutation");
const ConvexQuery_1 = require("../../../graphql/queries/ConvexQuery");
const EnvironmentVariablesQuery_1 = require("../../../graphql/queries/EnvironmentVariablesQuery");
const log_1 = tslib_1.__importDefault(require("../../../log"));
const ora_1 = require("../../../ora");
const projectUtils_1 = require("../../../project/projectUtils");
const prompts_1 = require("../../../prompts");
const CONVEX_REGIONS = [
    { title: 'US East (aws-us-east-1)', value: 'aws-us-east-1' },
    { title: 'EU West (aws-eu-west-1)', value: 'aws-eu-west-1' },
];
const DEFAULT_REGION = 'aws-us-east-1';
const EAS_CONVEX_ENV_VAR_NAME = 'EXPO_PUBLIC_CONVEX_URL';
const EAS_CONVEX_ENVIRONMENTS = [
    environment_1.DefaultEnvironment.Production,
    environment_1.DefaultEnvironment.Preview,
    environment_1.DefaultEnvironment.Development,
];
class IntegrationsConvexConnect extends EasCommand_1.default {
    static description = 'connect Convex to your Expo project';
    static contextDefinition = {
        ...this.ContextOptions.ProjectConfig,
    };
    static flags = {
        ...flags_1.EASNonInteractiveFlag,
        region: core_1.Flags.string({
            description: 'Convex deployment region (e.g. aws-us-east-1, aws-eu-west-1)',
            options: CONVEX_REGIONS.map(r => r.value),
        }),
        'team-name': core_1.Flags.string({
            description: 'Name for the new Convex team (defaults to EAS account name)',
        }),
        'project-name': core_1.Flags.string({
            description: 'Name for the Convex project (defaults to app slug)',
        }),
    };
    async runAsync() {
        const { flags: { region: regionFlag, 'team-name': teamNameFlag, 'project-name': projectNameFlag, 'non-interactive': nonInteractive, }, } = await this.parse(IntegrationsConvexConnect);
        const { privateProjectConfig: { projectId, exp, projectDir }, loggedIn: { graphqlClient, actor }, } = await this.getContextAsync(IntegrationsConvexConnect, {
            nonInteractive,
            withServerSideEnvironment: null,
        });
        const account = await (0, projectUtils_1.getOwnerAccountForProjectIdAsync)(graphqlClient, projectId);
        // 1. Check for existing Convex team connections
        const existingConnections = await ConvexQuery_1.ConvexQuery.getConvexTeamConnectionsByAccountIdAsync(graphqlClient, account.id);
        const region = await this.resolveRegionAsync(regionFlag, nonInteractive);
        let connection = null;
        let teamName = null;
        if (existingConnections.length === 0) {
            // 2a. No connection - resolve a team name and create it after local package install succeeds
            teamName = await this.resolveTeamNameAsync(teamNameFlag, account.name, nonInteractive);
        }
        else if (existingConnections.length === 1) {
            // 2b. Single existing connection
            connection = existingConnections[0];
            log_1.default.withTick(`Using existing Convex team ${chalk_1.default.bold((0, convex_1.formatConvexTeam)(connection))}`);
        }
        else {
            // 2c. Multiple connections - prompt to select
            connection = await this.selectConnectionAsync(existingConnections, nonInteractive);
        }
        // 3. Resolve project name before project setup mutation
        const projectName = await this.resolveProjectNameAsync(projectNameFlag, exp.slug, nonInteractive);
        // 4. Install the Convex package before creating new server-side resources
        await this.installConvexPackageAsync(projectDir);
        if (!connection) {
            const spinner = (0, ora_1.ora)('Creating Convex team').start();
            try {
                connection = await ConvexMutation_1.ConvexMutation.createConvexTeamConnectionAsync(graphqlClient, {
                    accountId: account.id,
                    deploymentRegion: region,
                    convexTeamName: teamName ?? account.name,
                });
                spinner.succeed(`Created Convex team ${chalk_1.default.bold((0, convex_1.formatConvexTeam)(connection))}`);
            }
            catch (error) {
                spinner.fail('Failed to create Convex team');
                throw error;
            }
        }
        // 5. Set up Convex project
        const spinner = (0, ora_1.ora)('Setting up Convex project').start();
        let setupResult;
        try {
            setupResult = await ConvexMutation_1.ConvexMutation.setupConvexProjectAsync(graphqlClient, {
                appId: projectId,
                convexTeamConnectionId: connection.id,
                deploymentRegion: region,
                projectName,
            });
            spinner.succeed(`Created Convex project ${chalk_1.default.bold(projectName)} with deployment ${chalk_1.default.bold(setupResult.convexDeploymentName)}`);
        }
        catch (error) {
            spinner.fail('Failed to set up Convex project');
            throw error;
        }
        // 6. Save the Convex URL as an EAS environment variable for builds
        await this.upsertConvexUrlEasEnvVarAsync(graphqlClient, projectId, setupResult.convexDeploymentUrl, nonInteractive);
        // 7. Send team invite (non-fatal)
        const teamInviteResult = await this.sendTeamInviteAsync(graphqlClient, connection, actor, {
            nonInteractive,
        });
        // 8. Write deploy key and URL to .env.local
        await this.writeEnvLocalAsync(projectDir, setupResult.deployKey, setupResult.convexDeploymentUrl, nonInteractive);
        // 9. Success message
        log_1.default.addNewLineIfNone();
        log_1.default.log(chalk_1.default.green('Convex is ready!'));
        log_1.default.newLine();
        log_1.default.log('Next steps:');
        log_1.default.log(`  1. Start the Convex dev server: ${chalk_1.default.cyan('npx convex dev')}`);
        log_1.default.log(`  2. Learn how to connect to your new Convex database by following our quickstart guide: ${chalk_1.default.cyan('https://docs.expo.dev/guides/using-convex')}`);
        log_1.default.log(`  3. Read more about Convex: ${chalk_1.default.cyan('https://docs.convex.dev/')}`);
        log_1.default.newLine();
        if (teamInviteResult === 'sent') {
            log_1.default.log(`Check your email for an invitation to join your Convex team. Accept it for full dashboard access.`);
        }
    }
    async upsertConvexUrlEasEnvVarAsync(graphqlClient, projectId, convexUrl, nonInteractive) {
        const existingVariables = await EnvironmentVariablesQuery_1.EnvironmentVariablesQuery.byAppIdAsync(graphqlClient, {
            appId: projectId,
            filterNames: [EAS_CONVEX_ENV_VAR_NAME],
        });
        const existingProjectVariable = existingVariables.find(variable => variable.scope === generated_1.EnvironmentVariableScope.Project);
        if (existingProjectVariable) {
            if (!nonInteractive) {
                const overwrite = await (0, prompts_1.confirmAsync)({
                    message: `EAS already has an ${EAS_CONVEX_ENV_VAR_NAME} environment variable for this project. Overwrite it?`,
                });
                if (!overwrite) {
                    log_1.default.warn(`Skipped updating EAS environment variable ${chalk_1.default.bold(EAS_CONVEX_ENV_VAR_NAME)}.`);
                    return;
                }
            }
            await EnvironmentVariableMutation_1.EnvironmentVariableMutation.updateAsync(graphqlClient, {
                id: existingProjectVariable.id,
                name: EAS_CONVEX_ENV_VAR_NAME,
                value: convexUrl,
                environments: EAS_CONVEX_ENVIRONMENTS,
                visibility: generated_1.EnvironmentVariableVisibility.Public,
                type: generated_1.EnvironmentSecretType.String,
            });
            log_1.default.withTick(`Updated EAS environment variable ${chalk_1.default.bold(EAS_CONVEX_ENV_VAR_NAME)} for builds`);
            return;
        }
        await EnvironmentVariableMutation_1.EnvironmentVariableMutation.createForAppAsync(graphqlClient, {
            name: EAS_CONVEX_ENV_VAR_NAME,
            value: convexUrl,
            environments: EAS_CONVEX_ENVIRONMENTS,
            visibility: generated_1.EnvironmentVariableVisibility.Public,
            type: generated_1.EnvironmentSecretType.String,
        }, projectId);
        log_1.default.withTick(`Created EAS environment variable ${chalk_1.default.bold(EAS_CONVEX_ENV_VAR_NAME)} for builds`);
    }
    async resolveRegionAsync(flagValue, nonInteractive) {
        if (flagValue) {
            return flagValue;
        }
        if (nonInteractive) {
            return DEFAULT_REGION;
        }
        return await (0, prompts_1.selectAsync)('Select a Convex deployment region', CONVEX_REGIONS);
    }
    async resolveTeamNameAsync(flagValue, accountName, nonInteractive) {
        if (flagValue) {
            return flagValue;
        }
        if (nonInteractive) {
            return accountName;
        }
        const { teamName } = await (0, prompts_1.promptAsync)({
            type: 'text',
            name: 'teamName',
            message: 'Convex team name',
            initial: accountName,
            validate: (value) => (value.trim() ? true : 'Team name cannot be empty'),
        });
        return teamName;
    }
    async resolveProjectNameAsync(flagValue, slug, nonInteractive) {
        if (flagValue) {
            return flagValue;
        }
        if (nonInteractive) {
            return slug;
        }
        const { projectName } = await (0, prompts_1.promptAsync)({
            type: 'text',
            name: 'projectName',
            message: 'Convex project name',
            initial: slug,
            validate: (value) => (value.trim() ? true : 'Project name cannot be empty'),
        });
        return projectName;
    }
    async selectConnectionAsync(connections, nonInteractive) {
        if (nonInteractive) {
            return connections[0];
        }
        const choices = connections.map(c => ({
            title: `${(0, convex_1.formatConvexTeam)(c)} (created ${new Date(c.createdAt).toLocaleDateString()})`,
            value: c,
        }));
        return await (0, prompts_1.selectAsync)('Select a Convex team connection', choices);
    }
    getActorEmail(actor) {
        return actor.__typename === 'User' ? actor.email : null;
    }
    async sendTeamInviteAsync(graphqlClient, connection, actor, { nonInteractive }) {
        if (connection.hasBeenClaimed) {
            log_1.default.warn('Convex team has already been claimed. Skipping Convex team invitation.');
            return 'skipped';
        }
        const email = this.getActorEmail(actor);
        if (!email) {
            log_1.default.warn(`Could not determine your verified email address, so no Convex team invitation was sent. Run ${chalk_1.default.cyan('eas integrations:convex:team:invite')} after signing in with a user account.`);
            return 'skipped';
        }
        if (!(await (0, convex_1.confirmRecentConvexInviteAsync)(connection, { nonInteractive }))) {
            log_1.default.warn('Skipped sending Convex team invitation.');
            return 'skipped';
        }
        try {
            await ConvexMutation_1.ConvexMutation.sendConvexTeamInviteToVerifiedEmailAsync(graphqlClient, {
                convexTeamConnectionId: connection.id,
            });
            log_1.default.withTick(`Sent Convex team invitation to ${chalk_1.default.bold(email)}`);
            return 'sent';
        }
        catch (error) {
            log_1.default.warn(`Failed to send Convex team invitation to ${email}. Run ${chalk_1.default.cyan('eas integrations:convex:team:invite')} to retry.`);
            log_1.default.warn(error instanceof Error ? error.message : String(error));
            return 'failed';
        }
    }
    async installConvexPackageAsync(projectDir) {
        log_1.default.newLine();
        log_1.default.log(`Running ${chalk_1.default.bold('npx expo install convex')}`);
        log_1.default.newLine();
        try {
            await (0, spawn_async_1.default)('npx', ['expo', 'install', 'convex'], {
                cwd: projectDir,
                stdio: 'inherit',
            });
            log_1.default.withTick(`Installed the ${chalk_1.default.bold('convex')} npm package`);
        }
        catch (error) {
            log_1.default.warn(`Failed to install the ${chalk_1.default.bold('convex')} npm package. Run ${chalk_1.default.cyan('npx expo install convex')} from your project directory, then run ${chalk_1.default.cyan('npx convex dev')}.`);
            throw error;
        }
    }
    async writeEnvLocalAsync(projectDir, deployKey, convexUrl, nonInteractive) {
        const envPath = path_1.default.join(projectDir, '.env.local');
        let existingContent = {};
        let rawContent = '';
        if (await fs.pathExists(envPath)) {
            rawContent = await fs.readFile(envPath, 'utf8');
            existingContent = dotenv_1.default.parse(rawContent);
            if (existingContent.CONVEX_DEPLOY_KEY && !nonInteractive) {
                const overwrite = await (0, prompts_1.confirmAsync)({
                    message: `.env.local already contains CONVEX_DEPLOY_KEY. Overwrite Convex values?`,
                });
                if (!overwrite) {
                    log_1.default.log('Skipping .env.local update. Deploy key:');
                    log_1.default.log(`  CONVEX_DEPLOY_KEY=${deployKey}`);
                    log_1.default.log(`  EXPO_PUBLIC_CONVEX_URL=${convexUrl}`);
                    return;
                }
            }
        }
        const updatedContent = this.mergeEnvContent(rawContent, {
            CONVEX_DEPLOY_KEY: deployKey,
            EXPO_PUBLIC_CONVEX_URL: convexUrl,
        });
        await fs.writeFile(envPath, updatedContent);
        log_1.default.withTick(`Wrote Convex config to ${chalk_1.default.bold('.env.local')}`);
    }
    mergeEnvContent(rawContent, newVars) {
        let content = rawContent;
        const keysToAdd = { ...newVars };
        for (const [key, value] of Object.entries(newVars)) {
            // Replace existing line if present
            const regex = new RegExp(`^${key}=.*$`, 'm');
            if (regex.test(content)) {
                content = content.replace(regex, `${key}=${value}`);
                delete keysToAdd[key];
            }
        }
        // Append any keys that weren't already in the file
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
}
exports.default = IntegrationsConvexConnect;
