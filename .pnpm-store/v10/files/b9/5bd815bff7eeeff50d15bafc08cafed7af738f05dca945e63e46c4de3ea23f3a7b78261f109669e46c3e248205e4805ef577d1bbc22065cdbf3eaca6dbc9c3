"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const republish_1 = tslib_1.__importDefault(require("./republish"));
const roll_back_to_embedded_1 = tslib_1.__importDefault(require("./roll-back-to-embedded"));
const EasCommand_1 = tslib_1.__importDefault(require("../../commandUtils/EasCommand"));
const flags_1 = require("../../commandUtils/flags");
const UpdateQuery_1 = require("../../graphql/queries/UpdateQuery");
const prompts_1 = require("../../prompts");
const defaultRollbackPlatforms = ['android', 'ios'];
class UpdateRollback extends EasCommand_1.default {
    static description = 'roll back to an embedded update or an existing update';
    static args = {
        groupId: core_1.Args.string({
            description: 'The ID of the update group to roll back. Must be the latest update for its branch and runtime version. The update group published before it is republished; if there is none, a roll back to the embedded update is published. Required in non-interactive mode.',
            required: false,
        }),
    };
    static flags = {
        message: core_1.Flags.string({
            char: 'm',
            description: 'Short message describing the rollback update',
            required: false,
        }),
        platform: core_1.Flags.option({
            char: 'p',
            options: [...defaultRollbackPlatforms, 'all'],
            default: 'all',
            required: false,
        })(),
        'private-key-path': core_1.Flags.string({
            description: `File containing the PEM-encoded private key corresponding to the certificate in expo-updates' configuration. Defaults to a file named "private-key.pem" in the certificate's directory. Only relevant if you are using code signing: https://docs.expo.dev/eas-update/code-signing/`,
            required: false,
        }),
        ...flags_1.EasNonInteractiveAndJsonFlags,
    };
    static contextDefinition = {
        ...this.ContextOptions.ProjectConfig,
        ...this.ContextOptions.LoggedIn,
    };
    async runAsync() {
        const { args, flags } = await this.parse(UpdateRollback);
        const { json, nonInteractive } = (0, flags_1.resolveNonInteractiveAndJsonFlags)(flags);
        const groupId = args.groupId;
        const platform = flags.platform;
        const messageArg = flags.message;
        const privateKeyPathArg = flags['private-key-path']
            ? ['--private-key-path', flags['private-key-path']]
            : [];
        if (!groupId) {
            if (nonInteractive) {
                throw new Error('The update group ID argument is required in non-interactive mode.');
            }
            const { choice } = await (0, prompts_1.promptAsync)({
                type: 'select',
                message: 'Which type of update would you like to roll back to?',
                name: 'choice',
                choices: [
                    { title: 'Published Update', value: 'published' },
                    { title: 'Embedded Update', value: 'embedded' },
                ],
            });
            if (choice === 'published') {
                await republish_1.default.run(privateKeyPathArg);
            }
            else {
                await roll_back_to_embedded_1.default.run(privateKeyPathArg);
            }
            return;
        }
        const { loggedIn: { graphqlClient }, privateProjectConfig: { projectId }, } = await this.getContextAsync(UpdateRollback, {
            nonInteractive,
            withServerSideEnvironment: null,
        });
        const sourceGroup = await getSourceUpdateGroupAsync(graphqlClient, groupId);
        const previousGroup = await getPreviousUpdateGroupAsync(graphqlClient, projectId, sourceGroup);
        const commonArgs = [
            '--non-interactive',
            '--platform',
            platform,
            ...privateKeyPathArg,
            ...(json ? ['--json'] : []),
        ];
        if (previousGroup) {
            const message = messageArg ??
                `Roll back to "${previousGroup.message ?? ''}" (group: ${previousGroup.groupId})`;
            await republish_1.default.run([
                '--group',
                previousGroup.groupId,
                '--message',
                message,
                ...commonArgs,
            ]);
        }
        else {
            const message = messageArg ?? 'Roll back to embedded';
            await roll_back_to_embedded_1.default.run([
                '--branch',
                sourceGroup.branchName,
                '--runtime-version',
                sourceGroup.runtimeVersion,
                '--message',
                message,
                ...commonArgs,
            ]);
        }
    }
}
exports.default = UpdateRollback;
async function getSourceUpdateGroupAsync(graphqlClient, groupId) {
    // viewUpdateGroupAsync throws if no updates are found for the group ID.
    const updateGroup = await UpdateQuery_1.UpdateQuery.viewUpdateGroupAsync(graphqlClient, { groupId });
    const arbitraryUpdate = updateGroup[0];
    return {
        groupId,
        branchName: arbitraryUpdate.branch.name,
        runtimeVersion: arbitraryUpdate.runtimeVersion,
    };
}
async function getPreviousUpdateGroupAsync(graphqlClient, projectId, sourceGroup) {
    // Clients on a given runtime version are served the latest update group on the branch,
    // so a rollback is only meaningful when the source group is that latest group. Fetch the
    // two most recent groups for the runtime version (returned most-recent-first): the first
    // must be the source group, and the second (if any) is the update to roll back to.
    const latestGroups = await UpdateQuery_1.UpdateQuery.viewUpdateGroupsPaginatedOnBranchAsync(graphqlClient, {
        appId: projectId,
        branchName: sourceGroup.branchName,
        first: 2,
        filter: { runtimeVersions: [sourceGroup.runtimeVersion] },
    });
    const latestGroup = latestGroups[0];
    if (!latestGroup?.length || latestGroup[0].group !== sourceGroup.groupId) {
        throw new Error(`Update group "${sourceGroup.groupId}" is not the latest update on branch "${sourceGroup.branchName}" for runtime version "${sourceGroup.runtimeVersion}"${latestGroup?.length ? ` (the latest is "${latestGroup[0].group}")` : ''}. Only the latest update can be rolled back.`);
    }
    // Source group is the only update for this runtime version: roll back to embedded.
    const previousGroup = latestGroups[1];
    if (!previousGroup?.length) {
        return null;
    }
    return { groupId: previousGroup[0].group, message: previousGroup[0].message ?? null };
}
