import { AppObserveCustomEvent, AppObserveCustomEventName, PageInfo } from '../graphql/generated';
export interface ObserveCustomEventPropertyJson {
    key: string;
    value: string;
    type: string;
}
export interface ObserveCustomEventJson {
    id: string;
    eventName: string;
    timestamp: string;
    sessionId: string | null;
    severityNumber: number | null;
    severityText: string | null;
    properties: ObserveCustomEventPropertyJson[];
    appVersion: string;
    appBuildNumber: string;
    appUpdateId: string | null;
    appEasBuildId: string | null;
    deviceModel: string;
    deviceOs: string;
    deviceOsVersion: string;
    countryCode: string | null;
    environment: string | null;
    easClientId: string;
}
export interface BuildCustomEventsTableOptions {
    eventName?: string;
    daysBack?: number;
    startTime?: string;
    endTime?: string;
    totalEventCount?: number;
}
export declare function buildObserveCustomEventsTable(events: AppObserveCustomEvent[], pageInfo: PageInfo, options?: BuildCustomEventsTableOptions): string;
export declare function buildObserveCustomEventsJson(events: AppObserveCustomEvent[], pageInfo: PageInfo): {
    events: ObserveCustomEventJson[];
    pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
    };
};
export interface BuildEmptyCustomEventsWithSuggestionsOptions {
    daysBack?: number;
    startTime?: string;
    endTime?: string;
    isTruncated?: boolean;
}
export declare function buildObserveCustomEventsEmptyWithSuggestionsTable(eventName: string, names: AppObserveCustomEventName[], options?: BuildEmptyCustomEventsWithSuggestionsOptions): string;
export declare function buildObserveCustomEventsEmptyWithSuggestionsJson(eventName: string, names: AppObserveCustomEventName[], isTruncated: boolean): {
    filteredEventName: string;
    events: [];
    availableEventNames: Array<{
        eventName: string;
        count: number;
    }>;
    availableEventNamesIsTruncated: boolean;
};
export interface BuildCustomEventNamesTableOptions {
    daysBack?: number;
    startTime?: string;
    endTime?: string;
    isTruncated?: boolean;
}
export declare function buildObserveCustomEventNamesTable(names: AppObserveCustomEventName[], options?: BuildCustomEventNamesTableOptions): string;
export declare function buildObserveCustomEventNamesJson(names: AppObserveCustomEventName[], isTruncated: boolean): {
    names: Array<{
        eventName: string;
        count: number;
    }>;
    isTruncated: boolean;
};
