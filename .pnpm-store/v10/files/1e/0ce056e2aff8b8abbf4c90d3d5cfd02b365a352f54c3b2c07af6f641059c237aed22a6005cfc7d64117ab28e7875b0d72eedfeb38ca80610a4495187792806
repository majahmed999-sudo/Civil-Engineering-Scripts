import { ExpoGraphqlClient } from '../commandUtils/context/contextUtils/createGraphqlClient';
import { AppObserveNavigationRoute, AppObserveNavigationRoutesOrderBy, AppPlatform, PageInfo } from '../graphql/generated';
export interface NavigationRouteWithPlatform {
    platform: AppPlatform;
    route: AppObserveNavigationRoute;
}
export interface FetchNavigationRoutesOptions {
    startTime: string;
    endTime: string;
    platforms: AppPlatform[];
    limit: number;
    after?: string;
    appVersion?: string;
    updateId?: string;
    buildNumber?: string;
    routeNames?: string[];
    orderBy?: AppObserveNavigationRoutesOrderBy;
}
export interface FetchNavigationRoutesResult {
    routes: NavigationRouteWithPlatform[];
    pageInfoByPlatform: Map<AppPlatform, PageInfo>;
}
export declare function fetchObserveNavigationRoutesAsync(graphqlClient: ExpoGraphqlClient, appId: string, options: FetchNavigationRoutesOptions): Promise<FetchNavigationRoutesResult>;
