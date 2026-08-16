import EasCommand from '../../commandUtils/EasCommand';
export default class SimulatorList extends EasCommand {
    static hidden: boolean;
    static description: string;
    static flags: {
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'non-interactive': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        status: import("@oclif/core/lib/interfaces").OptionFlag<string[] | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        type: import("@oclif/core/lib/interfaces").OptionFlag<string[] | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        platform: import("@oclif/core/lib/interfaces").OptionFlag<string[] | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        limit: import("@oclif/core/lib/interfaces").OptionFlag<number | undefined>;
        after: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
    };
    static contextDefinition: {
        loggedIn: import("../../commandUtils/context/LoggedInContextField").default;
        projectId: import("../../commandUtils/context/ProjectIdContextField").ProjectIdContextField;
    };
    runAsync(): Promise<void>;
}
