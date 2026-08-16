import EasCommand from '../../commandUtils/EasCommand';
export default class UpdateInsights extends EasCommand {
    static description: string;
    static args: {
        groupId: import("@oclif/core/lib/interfaces").Arg<string, Record<string, unknown>>;
    };
    static flags: {
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'non-interactive': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        platform: import("@oclif/core/lib/interfaces").OptionFlag<"android" | "ios" | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        days: import("@oclif/core/lib/interfaces").OptionFlag<number | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        start: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        end: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
    };
    static contextDefinition: {
        loggedIn: import("../../commandUtils/context/LoggedInContextField").default;
    };
    runAsync(): Promise<void>;
}
