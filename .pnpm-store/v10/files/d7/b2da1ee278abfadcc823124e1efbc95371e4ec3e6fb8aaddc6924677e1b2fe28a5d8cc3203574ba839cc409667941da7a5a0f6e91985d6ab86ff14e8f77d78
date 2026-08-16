"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const better_opn_1 = tslib_1.__importDefault(require("better-opn"));
const url_1 = require("../build/utils/url");
const EasCommand_1 = tslib_1.__importDefault(require("../commandUtils/EasCommand"));
const flags_1 = require("../commandUtils/flags");
const log_1 = tslib_1.__importDefault(require("../log"));
const ora_1 = require("../ora");
const projectUtils_1 = require("../project/projectUtils");
const json_1 = require("../utils/json");
const PROJECT_PAGES = {
    build: 'builds',
    builds: 'builds',
    submit: 'submissions',
    submissions: 'submissions',
    update: 'updates',
    updates: 'updates',
    workflow: 'workflows',
    workflows: 'workflows',
    cicd: 'workflows',
    hosting: 'hosting',
    deployments: 'hosting/deployments',
    credentials: 'credentials',
    env: 'environment-variables',
    insights: 'insights',
    observe: 'observe',
    settings: 'settings',
};
class Browse extends EasCommand_1.default {
    static description = 'Transition from the terminal to the web browser to view and interact with your project on https://expo.dev';
    static args = {
        page: core_1.Args.string({
            description: 'Project subpage to open. Defaults to the project dashboard.',
            required: false,
            options: Object.keys(PROJECT_PAGES),
        }),
    };
    static flags = {
        'no-browser': core_1.Flags.boolean({
            char: 'n',
            description: 'Print the URL instead of opening it in a web browser',
            default: false,
        }),
        ...flags_1.EasNonInteractiveAndJsonFlags,
    };
    static contextDefinition = {
        ...this.ContextOptions.ProjectConfig,
        ...this.ContextOptions.LoggedIn,
    };
    async runAsync() {
        const { args, flags } = await this.parse(Browse);
        const page = args.page ? PROJECT_PAGES[args.page] : null;
        const { json: jsonFlag, nonInteractive } = (0, flags_1.resolveNonInteractiveAndJsonFlags)(flags);
        if (jsonFlag) {
            (0, json_1.enableJsonOutput)();
        }
        const { privateProjectConfig: { projectId, exp }, loggedIn: { graphqlClient }, } = await this.getContextAsync(Browse, {
            nonInteractive,
            withServerSideEnvironment: null,
        });
        const account = await (0, projectUtils_1.getOwnerAccountForProjectIdAsync)(graphqlClient, projectId);
        const url = (0, url_1.getProjectPageUrl)(account.name, exp.slug, page);
        if (jsonFlag) {
            (0, json_1.printJsonOnlyOutput)({ url });
            return;
        }
        if (flags['no-browser']) {
            log_1.default.log(url);
            return;
        }
        const failedMessage = `Unable to open a web browser. Project page is available at: ${url}`;
        const spinner = (0, ora_1.ora)(`Opening ${url}`).start();
        try {
            const opened = await (0, better_opn_1.default)(url);
            if (opened) {
                spinner.succeed(`Opened ${url}`);
            }
            else {
                spinner.fail(failedMessage);
            }
        }
        catch (error) {
            spinner.fail(failedMessage);
            throw error;
        }
    }
}
exports.default = Browse;
