import { ExpoConfig } from '@expo/config';
import { ExpoGraphqlClient } from '../context/contextUtils/createGraphqlClient';
import { Client } from '../../vcs/vcs';
export declare enum WorkflowStarterName {
    BUILD = "build",
    UPDATE = "update",
    CUSTOM = "custom",
    DEPLOY = "deploy"
}
export type WorkflowStarter = {
    name: WorkflowStarterName;
    displayName: string;
    defaultFileName: string;
    template: any;
    header: string;
    nextSteps?: string[];
};
export declare const PLACEHOLDER_WORKFLOW_CONTENTS = "name: # Workflow name\n\non: # Add triggers https://docs.expo.dev/eas/workflows/syntax/#on\n\njobs: # Add pre-packaged jobs https://docs.expo.dev/eas/workflows/pre-packaged-jobs/. See all syntax https://docs.expo.dev/eas/workflows/syntax/#jobs.\n";
export declare function howToRunWorkflow(workflowFileName: string, workflowStarter: WorkflowStarter): string;
export declare const workflowStarters: WorkflowStarter[];
export declare function customizeTemplateIfNeededAsync({ workflowStarter, projectDir, expoConfig, graphqlClient, projectId, vcsClient, }: {
    workflowStarter: WorkflowStarter;
    projectDir: string;
    expoConfig: ExpoConfig;
    graphqlClient: ExpoGraphqlClient;
    projectId: string;
    vcsClient: Client;
}): Promise<WorkflowStarter>;
