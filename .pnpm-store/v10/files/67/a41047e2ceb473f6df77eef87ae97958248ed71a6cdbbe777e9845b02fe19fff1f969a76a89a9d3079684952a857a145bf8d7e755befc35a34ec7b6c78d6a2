import EasCommand from '../../commandUtils/EasCommand';
export default class ObserveMetricsSummary extends EasCommand {
    static description: string;
    static flags: {
        json: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'non-interactive': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'project-id': import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        start: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        end: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        days: import("@oclif/core/lib/interfaces").OptionFlag<number | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        metric: import("@oclif/core/lib/interfaces").OptionFlag<string[] | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        stat: import("@oclif/core/lib/interfaces").OptionFlag<("min" | "max" | "median" | "average" | "p80" | "p90" | "p99" | "eventCount")[] | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
        platform: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces").CustomOptions>;
    };
    static contextDefinition: {
        loggedIn: import("../../commandUtils/context/LoggedInContextField").default;
        projectId: import("../../commandUtils/context/ProjectIdContextField").ProjectIdContextField;
    };
    private static loggedInOnlyContextDefinition;
    runAsync(): Promise<void>;
}
