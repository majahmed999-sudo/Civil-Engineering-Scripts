import EasCommand from '../../commandUtils/EasCommand';
export default class AccountAudit extends EasCommand {
    static description: string;
    static args: {
        ACCOUNT_NAME: import("@oclif/core/lib/interfaces").Arg<string | undefined, Record<string, unknown>>;
    };
    static flags: {
        'non-interactive': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        limit: import("@oclif/core/lib/interfaces").OptionFlag<number | undefined>;
        after: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
    };
    static contextDefinition: {
        loggedIn: import("../../commandUtils/context/LoggedInContextField").default;
    };
    runAsync(): Promise<void>;
}
