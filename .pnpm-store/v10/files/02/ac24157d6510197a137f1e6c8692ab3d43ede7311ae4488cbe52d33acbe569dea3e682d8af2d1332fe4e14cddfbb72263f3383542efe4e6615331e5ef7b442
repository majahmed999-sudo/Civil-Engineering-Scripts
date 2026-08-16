import EasCommand, { ContextInput } from '../commandUtils/EasCommand';
import { ExpoGraphqlClient } from '../commandUtils/context/contextUtils/createGraphqlClient';
/**
 * Shared context resolution for observe commands.
 *
 * If `projectIdOverride` is provided (typically via `--project-id`), the
 * helper only requires the LoggedIn context (so the command can run outside
 * of a project directory). Otherwise it uses the full context definition,
 * which derives the project ID from the local app config.
 */
export declare function resolveObserveCommandContextAsync({ command, commandClass, loggedInOnlyContextDefinition, projectIdOverride, nonInteractive, }: {
    command: EasCommand;
    commandClass: {
        contextDefinition: ContextInput<any>;
    };
    loggedInOnlyContextDefinition: ContextInput<any>;
    projectIdOverride?: string;
    nonInteractive: boolean;
}): Promise<{
    projectId: string;
    graphqlClient: ExpoGraphqlClient;
}>;
