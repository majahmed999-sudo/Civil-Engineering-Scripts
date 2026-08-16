import EasCommand from '../../commandUtils/EasCommand';
export default class ProjectInit extends EasCommand {
    static description: string;
    static aliases: string[];
    static flags: {
        'non-interactive': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        id: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        force: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    static contextDefinition: {
        projectDir: import("../../commandUtils/context/ProjectDirContextField").default;
        loggedIn: import("../../commandUtils/context/LoggedInContextField").default;
    };
    runAsync(): Promise<void>;
}
