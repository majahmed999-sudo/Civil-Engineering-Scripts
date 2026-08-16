"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const EasCommand_1 = tslib_1.__importDefault(require("../../../commandUtils/EasCommand"));
const flags_1 = require("../../../commandUtils/flags");
const EmbeddedUpdateMutation_1 = require("../../../graphql/mutations/EmbeddedUpdateMutation");
const log_1 = tslib_1.__importDefault(require("../../../log"));
const prompts_1 = require("../../../prompts");
const json_1 = require("../../../utils/json");
class UpdateEmbeddedDelete extends EasCommand_1.default {
    static description = 'delete an embedded update registered with EAS Update';
    static args = {
        id: core_1.Args.string({
            required: true,
            description: 'The ID of the embedded update (manifest UUID from app.manifest).',
        }),
    };
    static flags = {
        ...flags_1.EasNonInteractiveAndJsonFlags,
    };
    static contextDefinition = {
        ...this.ContextOptions.LoggedIn,
    };
    async runAsync() {
        const { args: { id: embeddedUpdateId }, flags, } = await this.parse(UpdateEmbeddedDelete);
        const { json: jsonFlag, nonInteractive } = (0, flags_1.resolveNonInteractiveAndJsonFlags)(flags);
        const { loggedIn: { graphqlClient }, } = await this.getContextAsync(UpdateEmbeddedDelete, { nonInteractive });
        if (jsonFlag) {
            (0, json_1.enableJsonOutput)();
        }
        if (!nonInteractive) {
            log_1.default.log(`You are about to permanently delete embedded update: "${embeddedUpdateId}". ` +
                `Diff patches already generated against this bundle keep serving, but new diffs ` +
                `can't be generated until you re-upload it.`);
            log_1.default.newLine();
            const confirmed = await (0, prompts_1.toggleConfirmAsync)({ message: 'Are you sure you wish to proceed?' });
            if (!confirmed) {
                log_1.default.error(`Canceled deletion of embedded update: "${embeddedUpdateId}".`);
                process.exit(1);
            }
        }
        // Best-effort delete on the server: deleting an unknown id succeeds (idempotent),
        // so we don't need a not-found branch here.
        await EmbeddedUpdateMutation_1.EmbeddedUpdateMutation.deleteEmbeddedUpdateAsync(graphqlClient, {
            id: embeddedUpdateId,
        });
        if (jsonFlag) {
            (0, json_1.printJsonOnlyOutput)({ id: embeddedUpdateId });
            return;
        }
        log_1.default.withTick(`Deleted embedded update ${embeddedUpdateId}`);
    }
}
exports.default = UpdateEmbeddedDelete;
