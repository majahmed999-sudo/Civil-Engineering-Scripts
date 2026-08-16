import EasCommand from '../../commandUtils/EasCommand';
export default class UpdateRollback extends EasCommand {
    static description: string;
    static args: {
        groupId: import("@oclif/core/lib/interfaces").Arg<string | undefined, Record<string, unknown>>;
    };
    static flags: {
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'non-interactive': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        message: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        platform: import("@oclif/core/lib/interfaces").OptionFlag<"android" | "ios" | "all", import("@oclif/core/lib/interfaces").CustomOptions>;
        'private-key-path': import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
    };
    static contextDefinition: {
        loggedIn: import("../../commandUtils/context/LoggedInContextField").default;
        privateProjectConfig: import("../../commandUtils/context/PrivateProjectConfigContextField").PrivateProjectConfigContextField;
    };
    runAsync(): Promise<void>;
}
