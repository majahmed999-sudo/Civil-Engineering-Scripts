import EasCommand from '../../../../commandUtils/EasCommand';
export default class IntegrationsConvexTeamInvite extends EasCommand {
    static description: string;
    static args: {
        CONVEX_TEAM: import("@oclif/core/lib/interfaces").Arg<string | undefined, Record<string, unknown>>;
    };
    static flags: {
        'non-interactive': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    static contextDefinition: {
        loggedIn: import("../../../../commandUtils/context/LoggedInContextField").default;
        privateProjectConfig: import("../../../../commandUtils/context/PrivateProjectConfigContextField").PrivateProjectConfigContextField;
    };
    runAsync(): Promise<void>;
    private getActorEmail;
    private logTeam;
    private logPreviousInvite;
    private resolveConnectionAsync;
}
