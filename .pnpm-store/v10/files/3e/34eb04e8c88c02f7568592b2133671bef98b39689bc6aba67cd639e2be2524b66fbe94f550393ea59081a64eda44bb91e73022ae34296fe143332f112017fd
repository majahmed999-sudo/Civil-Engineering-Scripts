import EasCommand from '../commandUtils/EasCommand';
export declare function detectProjectSdkVersionAsync(projectDir: string): Promise<string | undefined>;
export default class Go extends EasCommand {
    static description: string;
    static hidden: boolean;
    static flags: {
        'bundle-id': import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        name: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces").CustomOptions>;
        'sdk-version': import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        credentials: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    static contextDefinition: {
        analytics: import("../commandUtils/context/AnalyticsContextField").default;
        loggedIn: import("../commandUtils/context/LoggedInContextField").default;
    };
    runAsync(): Promise<void>;
    private selectSdkVersionAsync;
    private generateBundleId;
    private ensureEasProjectAsync;
    private setupCredentialsAsync;
    private dispatchWorkflowAsync;
    private monitorWorkflowJobsAsync;
    private formatSpinnerText;
}
