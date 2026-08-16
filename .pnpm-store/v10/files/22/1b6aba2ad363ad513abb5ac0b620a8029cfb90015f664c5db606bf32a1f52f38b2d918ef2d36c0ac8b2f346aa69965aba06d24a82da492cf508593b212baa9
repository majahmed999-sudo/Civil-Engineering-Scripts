"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const config_1 = require("@expo/config");
const core_1 = require("@oclif/core");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const EasCommand_1 = tslib_1.__importDefault(require("../../commandUtils/EasCommand"));
const findProjectDirAndVerifyProjectSetupAsync_1 = require("../../commandUtils/context/contextUtils/findProjectDirAndVerifyProjectSetupAsync");
const flags_1 = require("../../commandUtils/flags");
const AppMutation_1 = require("../../graphql/mutations/AppMutation");
const AppQuery_1 = require("../../graphql/queries/AppQuery");
const log_1 = tslib_1.__importDefault(require("../../log"));
const ora_1 = require("../../ora");
const expoConfig_1 = require("../../project/expoConfig");
const prompts_1 = require("../../prompts");
const sudo_1 = require("../../user/sudo");
const json_1 = require("../../utils/json");
const pollForBackgroundJobReceiptAsync_1 = require("../../utils/pollForBackgroundJobReceiptAsync");
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
class ProjectDelete extends EasCommand_1.default {
    static description = 'delete a project';
    static args = {
        name: core_1.Args.string({
            required: false,
            description: 'Full name (@account/slug) or ID of the project to delete. Defaults to the project in the current directory.',
        }),
    };
    static flags = {
        'dangerously-confirm-deletion': core_1.Flags.string({
            description: "The project's full name (@account/slug), to confirm deletion. Required in non-interactive mode.",
        }),
        ...flags_1.EasNonInteractiveAndJsonFlags,
    };
    static contextDefinition = {
        ...this.ContextOptions.LoggedIn,
    };
    async runAsync() {
        const { args: { name }, flags, } = await this.parse(ProjectDelete);
        const { json: jsonFlag, nonInteractive } = (0, flags_1.resolveNonInteractiveAndJsonFlags)(flags);
        if (jsonFlag) {
            (0, json_1.enableJsonOutput)();
        }
        const { loggedIn: { graphqlClient, authenticationInfo }, } = await this.getContextAsync(ProjectDelete, { nonInteractive });
        let app;
        if (name) {
            app = UUID_REGEX.test(name)
                ? await AppQuery_1.AppQuery.byIdAsync(graphqlClient, name)
                : await AppQuery_1.AppQuery.byFullNameAsync(graphqlClient, name);
        }
        else {
            let projectDir = null;
            try {
                projectDir = await (0, findProjectDirAndVerifyProjectSetupAsync_1.findProjectRootAsync)();
            }
            catch {
                // Not inside a project directory — handled by the error below.
            }
            let projectId;
            if (projectDir) {
                // Only read the config when one already exists: getPrivateExpoConfigAsync creates a
                // fresh app.json as a side effect when the directory has none. Config errors (broken
                // app.config.js, invalid app.json) propagate so they are not masked by the error below.
                const configPaths = (0, config_1.getConfigFilePaths)(projectDir);
                if (configPaths.staticConfigPath ?? configPaths.dynamicConfigPath) {
                    const exp = await (0, expoConfig_1.getPrivateExpoConfigAsync)(projectDir);
                    projectId = exp.extra?.eas?.projectId;
                }
            }
            if (!projectId) {
                throw new Error("No EAS project found in the current directory. Pass the project's full name (@account/slug) or ID as an argument.");
            }
            app = await AppQuery_1.AppQuery.byIdAsync(graphqlClient, projectId);
        }
        const confirmedFullName = flags['dangerously-confirm-deletion'];
        if (confirmedFullName) {
            if (confirmedFullName !== app.fullName) {
                throw new Error(`The value of --dangerously-confirm-deletion ("${confirmedFullName}") did not match the project's full name ("${app.fullName}"). Cancelled deletion.`);
            }
        }
        else if (nonInteractive) {
            throw new Error(`Deleting a project in non-interactive mode requires passing --dangerously-confirm-deletion with the project's full name ("${app.fullName}").`);
        }
        else {
            log_1.default.addNewLineIfNone();
            log_1.default.warn(`You are about to permanently delete project ${chalk_1.default.bold(app.fullName)}.` +
                `\nThis will delete everything associated with it, including builds, submissions, update branches, published updates, and environment variables.` +
                `\nThis action is irreversible.`);
            log_1.default.newLine();
            const { confirmedName } = await (0, prompts_1.promptAsync)({
                type: 'text',
                name: 'confirmedName',
                message: `Type the project's full name (${app.fullName}) to confirm deletion:`,
            });
            if (confirmedName !== app.fullName) {
                log_1.default.error(`The input did not match the project's full name. Cancelled deletion.`);
                process.exit(1);
            }
        }
        const spinner = (0, ora_1.ora)(`Deleting project ${app.fullName}`).start();
        try {
            let receipt;
            try {
                receipt = await AppMutation_1.AppMutation.scheduleAppDeletionAsync(graphqlClient, app.id);
            }
            catch (error) {
                if (!(0, sudo_1.isSudoModeRequiredError)(error)) {
                    throw error;
                }
                if (nonInteractive) {
                    throw new Error('Deleting a project requires a session in sudo mode. Run this command interactively to confirm your password, then retry in non-interactive mode while sudo mode is active.');
                }
                spinner.stop();
                await (0, sudo_1.promptForSudoModeUpgradeAsync)(authenticationInfo);
                spinner.start();
                receipt = await AppMutation_1.AppMutation.scheduleAppDeletionAsync(graphqlClient, app.id);
            }
            await (0, pollForBackgroundJobReceiptAsync_1.pollForBackgroundJobReceiptAsync)(graphqlClient, receipt);
            spinner.succeed(`Deleted project ${chalk_1.default.bold(app.fullName)}`);
        }
        catch (error) {
            spinner.fail(`Failed to delete project ${chalk_1.default.bold(app.fullName)}`);
            throw error;
        }
        if (jsonFlag) {
            (0, json_1.printJsonOnlyOutput)({ id: app.id, fullName: app.fullName });
        }
    }
}
exports.default = ProjectDelete;
