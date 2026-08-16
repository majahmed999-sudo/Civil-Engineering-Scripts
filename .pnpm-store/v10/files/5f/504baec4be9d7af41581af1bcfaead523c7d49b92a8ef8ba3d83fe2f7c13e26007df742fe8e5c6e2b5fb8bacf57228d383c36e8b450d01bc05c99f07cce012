import { UpdateWithInsightsObject } from '../../graphql/queries/UpdateInsightsQuery';
export interface UpdateInsightsTimespan {
    startTime: string;
    endTime: string;
    daysBack?: number;
}
export interface UpdateInsightsDailyEntry {
    date: string;
    installs: number;
    failedInstalls: number;
}
export interface UpdateInsightsPlatformSummary {
    platform: string;
    updateId: string;
    totalUniqueUsers: number;
    totalInstalls: number;
    totalFailedInstalls: number;
    crashRatePercent: number;
    launchAssetCount: number;
    averageUpdatePayloadBytes: number;
    daily: UpdateInsightsDailyEntry[];
}
export interface UpdateInsightsSummary {
    groupId: string;
    startTime: string;
    endTime: string;
    daysBack?: number;
    platforms: UpdateInsightsPlatformSummary[];
}
export declare function toUpdateInsightsSummary(groupId: string, updates: UpdateWithInsightsObject[], timespan: UpdateInsightsTimespan): UpdateInsightsSummary;
export declare function buildUpdateInsightsJson(summary: UpdateInsightsSummary): object;
export declare function buildUpdateInsightsTable(summary: UpdateInsightsSummary): string;
export declare function formatPercent(value: number): string;
export declare function formatBytes(bytes: number): string;
