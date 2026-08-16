import EasCommand from '../../../../commandUtils/EasCommand';
export default class IntegrationsConvexProjectDelete extends EasCommand {
    static description: string;
    static flags: {
        yes: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'non-interactive': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    static contextDefinition: {
        loggedIn: import("../../../../commandUtils/context/LoggedInContextField").default;
        privateProjectConfig: import("../../../../commandUtils/context/PrivateProjectConfigContextField").PrivateProjectConfigContextField;
    };
    runAsync(): Promise<void>;
}
