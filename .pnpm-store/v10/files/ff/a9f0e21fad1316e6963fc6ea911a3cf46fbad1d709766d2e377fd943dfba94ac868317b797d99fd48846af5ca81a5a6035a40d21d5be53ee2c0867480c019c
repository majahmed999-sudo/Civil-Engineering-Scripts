import { ExpoGraphqlClient } from '../commandUtils/context/contextUtils/createGraphqlClient';
import { AppObserveEvent, AppObserveEventsOrderBy, AppObservePlatform, AppPlatform, PageInfo } from '../graphql/generated';
export declare enum EventsOrderPreset {
    Slowest = "SLOWEST",
    Fastest = "FASTEST",
    Newest = "NEWEST",
    Oldest = "OLDEST"
}
export declare function resolveOrderBy(input: string): AppObserveEventsOrderBy;
interface FetchObserveEventsOptions {
    metricName?: string;
    orderBy: AppObserveEventsOrderBy;
    limit: number;
    after?: string;
    startTime?: string;
    endTime?: string;
    platform?: AppObservePlatform;
    appVersion?: string;
    updateId?: string;
    sessionId?: string;
}
interface FetchObserveEventsResult {
    events: AppObserveEvent[];
    pageInfo: PageInfo;
}
export declare function fetchObserveEventsAsync(graphqlClient: ExpoGraphqlClient, appId: string, options: FetchObserveEventsOptions): Promise<FetchObserveEventsResult>;
export declare function fetchTotalEventCountAsync(graphqlClient: ExpoGraphqlClient, appId: string, metricName: string, platforms: AppPlatform[], startTime: string, endTime: string): Promise<number>;
export {};
