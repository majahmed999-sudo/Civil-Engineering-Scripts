import EasCommand from '../../../commandUtils/EasCommand';
export default class IntegrationsConvexConnect extends EasCommand {
    static description: string;
    static contextDefinition: {
        loggedIn: import("../../../commandUtils/context/LoggedInContextField").default;
        privateProjectConfig: import("../../../commandUtils/context/PrivateProjectConfigContextField").PrivateProjectConfigContextField;
    };
    static flags: {
        region: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        'team-name': import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        'project-name': import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        'non-interactive': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    runAsync(): Promise<void>;
    private upsertConvexUrlEasEnvVarAsync;
    private resolveRegionAsync;
    private resolveTeamNameAsync;
    private resolveProjectNameAsync;
    private selectConnectionAsync;
    private getActorEmail;
    private sendTeamInviteAsync;
    private installConvexPackageAsync;
    private writeEnvLocalAsync;
    private mergeEnvContent;
}
