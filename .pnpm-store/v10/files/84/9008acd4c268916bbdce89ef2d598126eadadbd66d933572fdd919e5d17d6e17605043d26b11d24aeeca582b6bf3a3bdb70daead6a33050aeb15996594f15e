import { ChannelRuntimeInsights } from '../../graphql/queries/ChannelInsightsQuery';
export interface ChannelInsightsTimespan {
    startTime: string;
    endTime: string;
    daysBack?: number;
}
export interface ChannelMostPopularUpdate {
    rank: number;
    groupId: string;
    message: string | null;
    platform: string;
    totalUniqueUsers: number;
}
export interface ChannelInsightsSummary {
    channelName: string;
    runtimeVersion: string;
    startTime: string;
    endTime: string;
    daysBack?: number;
    embeddedUpdateTotalUniqueUsers: number;
    otaTotalUniqueUsers: number;
    mostPopularUpdates: ChannelMostPopularUpdate[];
    cumulativeMetricsAtLastTimestamp: {
        id: string;
        label: string;
        data: number;
    }[];
    uniqueUsersOverTime: {
        labels: string[];
        datasets: {
            id: string;
            label: string;
            data: (number | null)[];
        }[];
    };
    cumulativeMetricsOverTime: {
        labels: string[];
        datasets: {
            id: string;
            label: string;
            data: (number | null)[];
        }[];
    };
}
export declare function toChannelInsightsSummary(channelName: string, runtimeVersion: string, insights: ChannelRuntimeInsights, timespan: ChannelInsightsTimespan): ChannelInsightsSummary;
export declare function buildChannelInsightsJson(summary: ChannelInsightsSummary): object;
export declare function buildChannelInsightsTable(summary: ChannelInsightsSummary): string;
