import { DeploymentsMutation } from './mutations';
import { ExpoGraphqlClient } from '../commandUtils/context/contextUtils/createGraphqlClient';
import { WorkerDeploymentAliasFragment, WorkerDeploymentFragment } from '../graphql/generated';
import { selectPaginatedAsync } from '../utils/relay';
export declare function getSignedDeploymentUrlAsync(graphqlClient: ExpoGraphqlClient, options: {
    appId: string;
    deploymentIdentifier?: string | null;
    /** Custom dev domain name (preview URL subdomain) requested through the `--dev-domain` flag */
    devDomainName?: string;
    /** Callback which is invoked when the project is going to setup the dev domain */
    onSetupDevDomain?: () => any;
    /** If the terminal is running in non interactive mode or not */
    nonInteractive?: boolean;
}): Promise<string>;
/**
 * Assert that a user-provided dev domain name (preview URL subdomain) is valid.
 * Unlike the interactive prompt, which reformats invalid input while typing,
 * this throws an error when the name contains invalid characters.
 */
export declare function assertValidDevDomainName(name: string): void;
/**
 * Assign a dev domain name to a project.
 *   - When a dev domain name is provided, it will assign that name without prompting.
 *   - When running in interactive mode, it will prompt the user with a suggested domain name.
 *   - When running in non interactive mode, it will auto-assign the suggested domain name.
 */
export declare function assignDevDomainNameAsync({ graphqlClient, appId, devDomainName: requestedDevDomainName, nonInteractive, }: {
    graphqlClient: ExpoGraphqlClient;
    appId: string;
    devDomainName?: string;
    nonInteractive?: boolean;
}): ReturnType<typeof DeploymentsMutation.assignDevDomainNameAsync>;
export declare function assignWorkerDeploymentAliasAsync({ graphqlClient, appId, deploymentId, aliasName, }: {
    graphqlClient: ExpoGraphqlClient;
    appId: string;
    deploymentId: string;
    aliasName: string;
}): ReturnType<typeof DeploymentsMutation.assignAliasAsync>;
export declare function assignWorkerDeploymentProductionAsync({ graphqlClient, appId, deploymentId, }: {
    graphqlClient: ExpoGraphqlClient;
    appId: string;
    deploymentId: string;
}): ReturnType<typeof DeploymentsMutation.assignAliasAsync>;
export declare function selectWorkerDeploymentOnAppAsync({ graphqlClient, appId, selectTitle, pageSize, }: {
    graphqlClient: ExpoGraphqlClient;
    appId: string;
    selectTitle?: string;
    pageSize?: number;
}): ReturnType<typeof selectPaginatedAsync<WorkerDeploymentFragment>>;
export declare function deleteWorkerDeploymentAliasAsync({ graphqlClient, appId, aliasName, }: {
    graphqlClient: ExpoGraphqlClient;
    appId: string;
    aliasName: string;
}): Promise<{
    aliasName?: string;
    id: string;
}>;
export declare function selectWorkerDeploymentAliasOnAppAsync({ graphqlClient, appId, selectTitle, pageSize, }: {
    graphqlClient: ExpoGraphqlClient;
    appId: string;
    selectTitle?: string;
    pageSize?: number;
}): ReturnType<typeof selectPaginatedAsync<WorkerDeploymentAliasFragment>>;
export declare function deleteWorkerDeploymentAsync({ graphqlClient, appId, deploymentIdentifier, }: {
    graphqlClient: ExpoGraphqlClient;
    appId: string;
    deploymentIdentifier: string;
}): Promise<{
    deploymentIdentifier: string;
    id: string;
}>;
