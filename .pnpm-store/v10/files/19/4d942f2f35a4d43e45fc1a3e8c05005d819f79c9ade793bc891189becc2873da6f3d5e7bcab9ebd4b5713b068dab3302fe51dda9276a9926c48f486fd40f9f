import { ExpoGraphqlClient } from '../../commandUtils/context/contextUtils/createGraphqlClient';
import { ExpoGoProjectConfiguration, ExpoGoRepackInput, ExpoGoSdkVersion, WorkflowRunByIdQuery, WorkflowRunByIdWithJobsQuery, WorkflowRunFragment, WorkflowRunStatus } from '../generated';
export declare const WorkflowRunQuery: {
    expoGoSupportedSdkVersionsAsync(graphqlClient: ExpoGraphqlClient): Promise<ExpoGoSdkVersion[]>;
    expoGoRepackConfigurationAsync(graphqlClient: ExpoGraphqlClient, input: ExpoGoRepackInput): Promise<ExpoGoProjectConfiguration>;
    byIdAsync(graphqlClient: ExpoGraphqlClient, workflowRunId: string, { useCache }?: {
        useCache?: boolean;
    }): Promise<WorkflowRunByIdQuery["workflowRuns"]["byId"]>;
    withJobsByIdAsync(graphqlClient: ExpoGraphqlClient, workflowRunId: string, { useCache }?: {
        useCache?: boolean;
    }): Promise<WorkflowRunByIdWithJobsQuery["workflowRuns"]["byId"]>;
    byAppIdFileNameAndStatusAsync(graphqlClient: ExpoGraphqlClient, appId: string, fileName: string, status?: WorkflowRunStatus, limit?: number): Promise<WorkflowRunFragment[]>;
};
