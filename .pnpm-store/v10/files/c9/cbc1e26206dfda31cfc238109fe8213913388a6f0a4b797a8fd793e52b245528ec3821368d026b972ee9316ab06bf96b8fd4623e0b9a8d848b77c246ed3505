import { ExpoGraphqlClient } from '../commandUtils/context/contextUtils/createGraphqlClient';
export interface SessionEventEntry {
    source: 'metric' | 'log';
    timestamp: string;
    sessionId: string;
    appVersion: string;
    appBuildNumber: string;
    appUpdateId: string | null;
    deviceModel: string;
    deviceOs: string;
    deviceOsVersion: string;
    countryCode: string | null;
    easClientId: string;
    metricName?: string;
    metricValue?: number;
    customParams?: {
        [key: string]: any;
    } | null;
    routeName?: string | null;
    eventName?: string;
    severityText?: string | null;
    severityNumber?: number | null;
    properties?: Array<{
        key: string;
        value: string;
        type: string;
    }>;
    environment?: string | null;
}
export interface SessionMetadata {
    appVersion: string;
    appBuildNumber: string;
    appUpdateId: string | null;
    deviceOs: string;
    deviceOsVersion: string;
    deviceModel: string;
    countryCode: string | null;
    firstSeenAt: string;
    lastSeenAt: string;
}
export interface FetchSessionEventsOptions {
    sessionId: string;
    limit: number;
}
export interface FetchSessionEventsResult {
    entries: SessionEventEntry[];
    metadata: SessionMetadata | null;
    hasMoreMetricEvents: boolean;
    hasMoreLogEvents: boolean;
}
export declare function fetchObserveSessionEventsAsync(graphqlClient: ExpoGraphqlClient, appId: string, options: FetchSessionEventsOptions): Promise<FetchSessionEventsResult>;
