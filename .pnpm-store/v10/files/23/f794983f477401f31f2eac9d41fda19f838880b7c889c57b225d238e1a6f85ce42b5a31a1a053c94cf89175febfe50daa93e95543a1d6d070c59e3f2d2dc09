import EasCommand from '../../../commandUtils/EasCommand';
export default class IntegrationsAscConnect extends EasCommand {
    static description: string;
    static flags: {
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'non-interactive': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'api-key-id': import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        'asc-app-id': import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        'bundle-id': import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
    };
    static contextDefinition: {
        vcsClient: import("../../../commandUtils/context/VcsClientContextField").default;
        analytics: import("../../../commandUtils/context/AnalyticsContextField").default;
        loggedIn: import("../../../commandUtils/context/LoggedInContextField").default;
        projectDir: import("../../../commandUtils/context/ProjectDirContextField").default;
        projectId: import("../../../commandUtils/context/ProjectIdContextField").ProjectIdContextField;
    };
    runAsync(): Promise<void>;
}
