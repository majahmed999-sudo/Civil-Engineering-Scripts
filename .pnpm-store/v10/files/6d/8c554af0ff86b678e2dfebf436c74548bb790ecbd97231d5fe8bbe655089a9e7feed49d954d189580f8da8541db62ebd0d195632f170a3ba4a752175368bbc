import EasCommand from '../../commandUtils/EasCommand';
export default class SimulatorStop extends EasCommand {
    static hidden: boolean;
    static description: string;
    static flags: {
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'non-interactive': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        id: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
    };
    static contextDefinition: {
        projectDir: import("../../commandUtils/context/ProjectDirContextField").default;
        loggedIn: import("../../commandUtils/context/LoggedInContextField").default;
    };
    runAsync(): Promise<void>;
}
