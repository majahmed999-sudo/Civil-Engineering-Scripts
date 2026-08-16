import { ExpoGraphqlClient } from '../../commandUtils/context/contextUtils/createGraphqlClient';
import { BackgroundJobReceiptDataFragment } from '../generated';
export declare const AppMutation: {
    createAppAsync(graphqlClient: ExpoGraphqlClient, appInput: {
        accountId: string;
        projectName: string;
    }): Promise<string>;
    scheduleAppDeletionAsync(graphqlClient: ExpoGraphqlClient, appId: string): Promise<BackgroundJobReceiptDataFragment>;
};
