"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const EasCommand_1 = tslib_1.__importDefault(require("../../commandUtils/EasCommand"));
const flags_1 = require("../../commandUtils/flags");
const projectInitialization_1 = require("../../project/projectInitialization");
class ProjectInit extends EasCommand_1.default {
    static description = 'create or link an EAS project';
    static aliases = ['init'];
    static flags = {
        id: core_1.Flags.string({
            description: 'ID of the EAS project to link',
        }),
        force: core_1.Flags.boolean({
            description: 'Whether to create a new project/link an existing project without additional prompts or overwrite any existing project ID when running with --id flag',
        }),
        ...flags_1.EASNonInteractiveFlag,
    };
    static contextDefinition = {
        ...this.ContextOptions.LoggedIn,
        ...this.ContextOptions.ProjectDir,
    };
    async runAsync() {
        const { flags: { id: idArgument, force, 'non-interactive': nonInteractive }, } = await this.parse(ProjectInit);
        const { loggedIn: { actor, graphqlClient }, projectDir, } = await this.getContextAsync(ProjectInit, { nonInteractive });
        let idForConsistency;
        if (idArgument) {
            await (0, projectInitialization_1.initializeWithExplicitIDAsync)(idArgument, projectDir, {
                force,
                nonInteractive,
            });
            idForConsistency = idArgument;
        }
        else {
            idForConsistency = await (0, projectInitialization_1.initializeWithoutExplicitIDAsync)(graphqlClient, actor, projectDir, {
                force,
                nonInteractive,
            });
        }
        await (0, projectInitialization_1.ensureOwnerSlugConsistencyAsync)(graphqlClient, idForConsistency, projectDir, {
            force,
            nonInteractive,
        });
    }
}
exports.default = ProjectInit;
