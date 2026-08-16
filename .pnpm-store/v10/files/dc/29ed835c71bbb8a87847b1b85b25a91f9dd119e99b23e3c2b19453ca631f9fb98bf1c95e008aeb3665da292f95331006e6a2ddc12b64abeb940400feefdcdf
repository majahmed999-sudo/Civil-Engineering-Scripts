import { ExpoGraphqlClient } from '../commandUtils/context/contextUtils/createGraphqlClient';
import { AppObserveCustomEvent, AppObservePlatform, PageInfo } from '../graphql/generated';
interface FetchCustomEventsOptions {
    eventName?: string;
    limit: number;
    after?: string;
    startTime?: string;
    endTime?: string;
    platform?: AppObservePlatform;
    appVersion?: string;
    updateId?: string;
    sessionId?: string;
}
interface FetchCustomEventsResult {
    events: AppObserveCustomEvent[];
    pageInfo: PageInfo;
}
export declare function fetchObserveCustomEventsAsync(graphqlClient: ExpoGraphqlClient, appId: string, options: FetchCustomEventsOptions): Promise<FetchCustomEventsResult>;
export {};
