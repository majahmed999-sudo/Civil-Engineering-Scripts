import { AppObserveEvent, PageInfo } from '../graphql/generated';
export interface ObserveEventJson {
    id: string;
    metricName: string;
    metricValue: number;
    appVersion: string;
    appBuildNumber: string;
    appUpdateId: string | null;
    deviceModel: string;
    deviceOs: string;
    deviceOsVersion: string;
    countryCode: string | null;
    sessionId: string | null;
    easClientId: string;
    timestamp: string;
    customParams: {
        [key: string]: any;
    } | null;
    routeName: string | null;
}
export interface BuildEventsTableOptions {
    metricName: string;
    daysBack?: number;
    startTime?: string;
    endTime?: string;
    totalEventCount?: number;
}
export declare function buildObserveEventsTable(events: AppObserveEvent[], pageInfo: PageInfo, options?: BuildEventsTableOptions): string;
export declare function buildObserveEventsJson(events: AppObserveEvent[], pageInfo: PageInfo): {
    events: ObserveEventJson[];
    pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
    };
};
