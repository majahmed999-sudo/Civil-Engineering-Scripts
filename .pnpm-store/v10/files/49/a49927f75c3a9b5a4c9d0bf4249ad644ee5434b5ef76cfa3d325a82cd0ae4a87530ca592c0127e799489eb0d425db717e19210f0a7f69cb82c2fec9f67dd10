import { ExpoGraphqlClient } from '../../commandUtils/context/contextUtils/createGraphqlClient';
import { AppObserveAppVersion, AppObserveCustomEvent, AppObserveCustomEventListFilter, AppObserveCustomEventName, AppObserveEvent, AppObserveEventsFilter, AppObserveEventsOrderBy, AppObserveNavigationRoute, AppObserveNavigationRoutesFilter, AppObserveNavigationRoutesOrderBy, AppObservePlatform, AppObserveTimeSeriesStatistics, PageInfo } from '../generated';
export type AppObserveTimeSeriesResult = {
    appVersionMarkers: AppObserveAppVersion[];
    eventCount: number;
    statistics: AppObserveTimeSeriesStatistics;
};
type AppObserveEventsQueryVariables = {
    appId: string;
    filter?: AppObserveEventsFilter;
    first?: number;
    after?: string;
    orderBy?: AppObserveEventsOrderBy;
};
type AppObserveCustomEventListQueryVariables = {
    appId: string;
    filter?: AppObserveCustomEventListFilter;
    first?: number;
    after?: string;
};
type AppObserveNavigationRoutesQueryVariables = {
    appId: string;
    filter: AppObserveNavigationRoutesFilter;
    first?: number;
    after?: string;
    orderBy?: AppObserveNavigationRoutesOrderBy;
};
export declare const ObserveQuery: {
    timeSeriesAsync(graphqlClient: ExpoGraphqlClient, { appId, metricName, platform, startTime, endTime, }: {
        appId: string;
        metricName: string;
        platform: AppObservePlatform;
        startTime: string;
        endTime: string;
    }): Promise<AppObserveTimeSeriesResult>;
    appVersionsAsync(graphqlClient: ExpoGraphqlClient, { appId, platform, startTime, endTime, metricNames, }: {
        appId: string;
        platform: AppObservePlatform;
        startTime: string;
        endTime: string;
        metricNames?: string[];
    }): Promise<AppObserveAppVersion[]>;
    eventsAsync(graphqlClient: ExpoGraphqlClient, variables: AppObserveEventsQueryVariables): Promise<{
        events: AppObserveEvent[];
        pageInfo: PageInfo;
    }>;
    customEventListAsync(graphqlClient: ExpoGraphqlClient, variables: AppObserveCustomEventListQueryVariables): Promise<{
        events: AppObserveCustomEvent[];
        pageInfo: PageInfo;
    }>;
    customEventNamesAsync(graphqlClient: ExpoGraphqlClient, { appId, startTime, endTime, platform, environment, }: {
        appId: string;
        startTime: string;
        endTime: string;
        platform?: AppObservePlatform;
        environment?: string;
    }): Promise<{
        names: AppObserveCustomEventName[];
        isTruncated: boolean;
    }>;
    navigationRoutesAsync(graphqlClient: ExpoGraphqlClient, variables: AppObserveNavigationRoutesQueryVariables): Promise<{
        routes: AppObserveNavigationRoute[];
        pageInfo: PageInfo;
    }>;
};
export {};
