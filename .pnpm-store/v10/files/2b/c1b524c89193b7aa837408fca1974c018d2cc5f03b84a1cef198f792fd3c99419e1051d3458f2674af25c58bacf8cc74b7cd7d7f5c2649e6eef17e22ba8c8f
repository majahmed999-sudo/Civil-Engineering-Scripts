"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowCreate = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const promises_1 = tslib_1.__importDefault(require("fs/promises"));
const fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
const nullthrows_1 = tslib_1.__importDefault(require("nullthrows"));
const path_1 = tslib_1.__importDefault(require("path"));
const EasCommand_1 = tslib_1.__importDefault(require("../../commandUtils/EasCommand"));
const buildProfileUtils_1 = require("../../commandUtils/workflow/buildProfileUtils");
const creation_1 = require("../../commandUtils/workflow/creation");
const validation_1 = require("../../commandUtils/workflow/validation");
const log_1 = tslib_1.__importStar(require("../../log"));
const expoConfig_1 = require("../../project/expoConfig");
const projectInitialization_1 = require("../../project/projectInitialization");
const prompts_1 = require("../../prompts");
const formatFields_1 = tslib_1.__importDefault(require("../../utils/formatFields"));
class WorkflowCreate extends EasCommand_1.default {
    static description = 'create a new workflow configuration YAML file';
    static args = {
        name: core_1.Args.string({
            description: 'Name of the workflow file. When provided without --template, a placeholder workflow is created.',
            required: false,
        }),
    };
    static flags = {
        template: core_1.Flags.option({
            description: 'Template to use for the workflow file',
            options: [
                creation_1.WorkflowStarterName.BUILD,
                creation_1.WorkflowStarterName.UPDATE,
                creation_1.WorkflowStarterName.DEPLOY,
                creation_1.WorkflowStarterName.CUSTOM,
            ],
        })(),
        'skip-validation': core_1.Flags.boolean({
            description: 'If set, the workflow file will not be validated before being created',
            default: false,
        }),
    };
    static contextDefinition = {
        ...this.ContextOptions.DynamicProjectConfig,
        ...this.ContextOptions.ProjectDir,
        ...this.ContextOptions.LoggedIn,
        ...this.ContextOptions.Vcs,
    };
    async runAsync() {
        const { args: { name: argFileName }, flags, } = await this.parse(WorkflowCreate);
        try {
            const { getDynamicPrivateProjectConfigAsync, loggedIn: { actor, graphqlClient }, projectDir, vcsClient, } = await this.getContextAsync(WorkflowCreate, {
                nonInteractive: false,
                withServerSideEnvironment: null,
            });
            if (argFileName && !flags.template) {
                await createPlaceholderWorkflowFileAsync({ argFileName, projectDir });
                return;
            }
            const privateExpoConfig = await (0, expoConfig_1.getPrivateExpoConfigAsync)(projectDir);
            if (!privateExpoConfig.extra?.eas?.projectId) {
                // Unlike `eas init`, we intentionally do not call `ensureOwnerSlugConsistencyAsync` here.
                // The workflow scaffolder should only link/create a project ID, not rewrite the app
                // config's `owner`/`slug` fields. If those are inconsistent, we leave them for `eas init`
                // to reconcile.
                await (0, projectInitialization_1.initializeWithoutExplicitIDAsync)(graphqlClient, actor, projectDir, {
                    force: false,
                    nonInteractive: false,
                });
            }
            const { exp: originalExpoConfig, projectId } = await getDynamicPrivateProjectConfigAsync();
            let workflowStarter = flags.template
                ? (0, nullthrows_1.default)(creation_1.workflowStarters.find(s => s.name === flags.template))
                : await chooseTemplateAsync();
            let expoConfig = originalExpoConfig;
            if (workflowStarter.name === creation_1.WorkflowStarterName.BUILD ||
                workflowStarter.name === creation_1.WorkflowStarterName.UPDATE ||
                workflowStarter.name === creation_1.WorkflowStarterName.DEPLOY) {
                expoConfig = await configureProjectForStarterAsync({
                    workflowStarter,
                    projectDir,
                    expoConfig: originalExpoConfig,
                    projectId,
                    vcsClient,
                    getDynamicPrivateProjectConfigAsync,
                });
            }
            const { fileName, filePath } = await resolveTemplateFileNameAsync({
                argFileName,
                projectDir,
                workflowStarter,
            });
            workflowStarter = await (0, creation_1.customizeTemplateIfNeededAsync)({
                workflowStarter,
                projectDir,
                expoConfig,
                graphqlClient,
                projectId,
                vcsClient,
            });
            log_1.default.debug(`Creating workflow file ${fileName} from template ${workflowStarter.name}`);
            const yamlString = [
                workflowStarter.header,
                (0, validation_1.workflowContentsFromParsedYaml)(workflowStarter.template),
            ].join('\n');
            if (!flags['skip-validation']) {
                await (0, validation_1.validateWorkflowFileAsync)({ yamlConfig: yamlString, filePath: fileName }, projectDir, graphqlClient, projectId);
            }
            await ensureWorkflowsDirectoryExistsAsync({ projectDir });
            await promises_1.default.writeFile(filePath, yamlString);
            log_1.default.withTick(`Created ${chalk_1.default.bold(filePath)}`);
            logNextSteps([
                ...(workflowStarter.nextSteps ?? []).map(step => `${chalk_1.default.yellow('[Action required]')} ${step}`),
                (0, creation_1.howToRunWorkflow)(fileName, workflowStarter),
            ]);
        }
        catch (error) {
            (0, validation_1.logWorkflowValidationErrors)(error);
            log_1.default.error('Failed to create workflow file.');
            process.exitCode = 1;
        }
    }
}
exports.WorkflowCreate = WorkflowCreate;
async function configureProjectForStarterAsync({ workflowStarter, projectDir, expoConfig, projectId, vcsClient, getDynamicPrivateProjectConfigAsync, }) {
    await (0, buildProfileUtils_1.configureEasBuildIfNeededAsync)({ projectDir, expoConfig, vcsClient });
    if (workflowStarter.name === creation_1.WorkflowStarterName.UPDATE ||
        workflowStarter.name === creation_1.WorkflowStarterName.DEPLOY) {
        await (0, buildProfileUtils_1.configureEasUpdateIfNeededAsync)({ projectDir, expoConfig, projectId, vcsClient });
    }
    return (await getDynamicPrivateProjectConfigAsync()).exp;
}
function logNextSteps(steps) {
    log_1.default.addNewLineIfNone();
    log_1.default.log('➡️ Next steps:');
    log_1.default.addNewLineIfNone();
    log_1.default.log((0, formatFields_1.default)(steps.map((step, index) => ({
        label: `${index + 1}.`,
        value: step,
    }))));
}
async function createPlaceholderWorkflowFileAsync({ argFileName, projectDir, }) {
    const fileName = ensureYamlExtension(argFileName);
    const filePath = path_1.default.join(projectDir, '.eas', 'workflows', fileName);
    if (await fs_extra_1.default.pathExists(filePath)) {
        log_1.default.error(`Workflow file already exists: ${chalk_1.default.bold(filePath)}`);
        return;
    }
    await ensureWorkflowsDirectoryExistsAsync({ projectDir });
    await promises_1.default.writeFile(filePath, creation_1.PLACEHOLDER_WORKFLOW_CONTENTS);
    log_1.default.withTick(`Created ${chalk_1.default.bold(filePath)}`);
    logNextSteps([
        `Fill in the "name", "on", and "jobs" fields. Learn more: ${(0, log_1.link)('https://docs.expo.dev/eas/workflows/syntax/')}`,
        `Run this workflow with ${chalk_1.default.bold(`eas workflow:run ${fileName}`)}`,
    ]);
}
async function ensureWorkflowsDirectoryExistsAsync({ projectDir, }) {
    try {
        await promises_1.default.access(path_1.default.join(projectDir, '.eas', 'workflows'));
    }
    catch {
        await promises_1.default.mkdir(path_1.default.join(projectDir, '.eas', 'workflows'), { recursive: true });
        log_1.default.withTick(`Created directory ${chalk_1.default.bold(path_1.default.join(projectDir, '.eas', 'workflows'))}`);
    }
}
async function chooseTemplateAsync() {
    const workflowStarter = (await (0, prompts_1.promptAsync)({
        type: 'select',
        name: 'starter',
        message: 'Select a workflow template:',
        choices: creation_1.workflowStarters.map(starter => ({
            title: starter.displayName,
            value: starter,
        })),
    })).starter;
    return workflowStarter;
}
async function resolveTemplateFileNameAsync({ argFileName, projectDir, workflowStarter, }) {
    const baseName = argFileName ? ensureYamlExtension(argFileName) : workflowStarter.defaultFileName;
    const ext = path_1.default.extname(baseName);
    const stem = baseName.slice(0, baseName.length - ext.length);
    let fileName = baseName;
    let filePath = path_1.default.join(projectDir, '.eas', 'workflows', fileName);
    let counter = 1;
    while (await fs_extra_1.default.pathExists(filePath)) {
        fileName = `${stem}-${counter}${ext}`;
        filePath = path_1.default.join(projectDir, '.eas', 'workflows', fileName);
        counter++;
    }
    return { fileName, filePath };
}
function ensureYamlExtension(name) {
    const ext = path_1.default.extname(name);
    if (!ext) {
        return `${name}.yml`;
    }
    const lowerExt = ext.toLowerCase();
    if (lowerExt === '.yml' || lowerExt === '.yaml') {
        return name;
    }
    throw new Error(`Workflow file name must end with .yml or .yaml, but got "${name}".`);
}
