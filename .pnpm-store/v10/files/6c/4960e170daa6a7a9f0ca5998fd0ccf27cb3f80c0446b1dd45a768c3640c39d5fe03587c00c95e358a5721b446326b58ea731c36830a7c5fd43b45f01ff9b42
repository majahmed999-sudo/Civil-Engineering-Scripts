import EasCommand from '../../../commandUtils/EasCommand';
export default class IntegrationsPostHogConnect extends EasCommand {
    static description: string;
    static contextDefinition: {
        loggedIn: import("../../../commandUtils/context/LoggedInContextField").default;
        privateProjectConfig: import("../../../commandUtils/context/PrivateProjectConfigContextField").PrivateProjectConfigContextField;
    };
    static flags: {
        region: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        'session-replay': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'error-tracking': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'posthog-cli-api-key': import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        overwrite: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'non-interactive': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    runAsync(): Promise<void>;
    private startConnectionAsync;
    private completePendingConnectionViaBrowserAsync;
    private pollForConnectionAsync;
    private resolveFeaturesAsync;
    private resolveCliApiKeyAsync;
    private resolveRegionAsync;
    private installSdkPackagesAsync;
    private addConfigPluginAsync;
    private writeEnvLocalAsync;
    private mergeEnvContent;
    private upsertEasEnvVarAsync;
    private printNextSteps;
}
