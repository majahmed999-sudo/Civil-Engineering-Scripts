import EasCommand from '../../../../commandUtils/EasCommand';
export default class IntegrationsConvexTeamDelete extends EasCommand {
    static description: string;
    static args: {
        CONVEX_TEAM: import("@oclif/core/lib/interfaces").Arg<string | undefined, Record<string, unknown>>;
    };
    static flags: {
        yes: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'non-interactive': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    static contextDefinition: {
        loggedIn: import("../../../../commandUtils/context/LoggedInContextField").default;
        privateProjectConfig: import("../../../../commandUtils/context/PrivateProjectConfigContextField").PrivateProjectConfigContextField;
    };
    runAsync(): Promise<void>;
    private resolveConnectionAsync;
}
