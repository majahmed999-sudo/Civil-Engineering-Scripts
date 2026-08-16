import EasCommand from '../../commandUtils/EasCommand';
export default class SimulatorStart extends EasCommand {
    static hidden: boolean;
    static description: string;
    static flags: {
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'non-interactive': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        platform: import("@oclif/core/lib/interfaces").OptionFlag<"android" | "ios", import("@oclif/core/lib/interfaces").CustomOptions>;
        type: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces").CustomOptions>;
        'package-version': import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        'max-duration-minutes': import("@oclif/core/lib/interfaces").OptionFlag<number | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        force: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'out-config-type': import("@oclif/core/lib/interfaces").OptionFlag<"env" | "dotenv", import("@oclif/core/lib/interfaces").CustomOptions>;
    };
    static contextDefinition: {
        loggedIn: import("../../commandUtils/context/LoggedInContextField").default;
        projectDir: import("../../commandUtils/context/ProjectDirContextField").default;
        projectId: import("../../commandUtils/context/ProjectIdContextField").ProjectIdContextField;
    };
    runAsync(): Promise<void>;
}
