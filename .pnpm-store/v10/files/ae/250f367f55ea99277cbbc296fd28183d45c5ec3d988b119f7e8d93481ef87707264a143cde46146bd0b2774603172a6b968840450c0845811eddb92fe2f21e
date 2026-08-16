import EasCommand from '../../commandUtils/EasCommand';
import { WorkflowStarterName } from '../../commandUtils/workflow/creation';
export declare class WorkflowCreate extends EasCommand {
    static description: string;
    static args: {
        name: import("@oclif/core/lib/interfaces").Arg<string | undefined, Record<string, unknown>>;
    };
    static flags: {
        template: import("@oclif/core/lib/interfaces").OptionFlag<WorkflowStarterName | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        'skip-validation': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    static contextDefinition: {
        vcsClient: import("../../commandUtils/context/VcsClientContextField").default;
        loggedIn: import("../../commandUtils/context/LoggedInContextField").default;
        projectDir: import("../../commandUtils/context/ProjectDirContextField").default;
        getDynamicPublicProjectConfigAsync: import("../../commandUtils/context/DynamicProjectConfigContextField").DynamicPublicProjectConfigContextField;
        getDynamicPrivateProjectConfigAsync: import("../../commandUtils/context/DynamicProjectConfigContextField").DynamicPrivateProjectConfigContextField;
    };
    runAsync(): Promise<void>;
}
