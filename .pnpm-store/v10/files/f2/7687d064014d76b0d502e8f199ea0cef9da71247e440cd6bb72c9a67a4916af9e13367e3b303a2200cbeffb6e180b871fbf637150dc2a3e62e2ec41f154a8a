import EasCommand from '../../commandUtils/EasCommand';
export default class UpdateView extends EasCommand {
    static description: string;
    static args: {
        groupId: import("@oclif/core/lib/interfaces").Arg<string, Record<string, unknown>>;
    };
    static flags: {
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        insights: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        days: import("@oclif/core/lib/interfaces").OptionFlag<number | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        start: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        end: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
    };
    static contextDefinition: {
        loggedIn: import("../../commandUtils/context/LoggedInContextField").default;
    };
    runAsync(): Promise<void>;
    /**
     * Resolves the provided ID into an update group and its updates. The ID may be either an
     * update group ID or the ID of a single platform-specific update. We first try to look it up
     * as a group; if no updates are found, we fall back to resolving it as a platform-specific
     * update and then fetch the group that update belongs to.
     */
    private static resolveUpdateGroupAsync;
}
