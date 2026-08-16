import { ExpoGraphqlClient } from '../commandUtils/context/contextUtils/createGraphqlClient';
import { AppObserveAppVersion, AppPlatform } from '../graphql/generated';
export interface AppVersionsResult {
    platform: AppPlatform;
    appVersions: AppObserveAppVersion[];
}
export declare function fetchObserveVersionsAsync(graphqlClient: ExpoGraphqlClient, appId: string, platforms: AppPlatform[], startTime: string, endTime: string): Promise<AppVersionsResult[]>;
