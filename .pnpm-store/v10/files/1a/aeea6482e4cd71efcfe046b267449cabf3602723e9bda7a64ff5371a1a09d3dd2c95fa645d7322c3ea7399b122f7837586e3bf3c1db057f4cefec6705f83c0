import { AppPlatform } from '../graphql/generated';
export type StatisticKey = 'min' | 'max' | 'median' | 'average' | 'p80' | 'p90' | 'p99' | 'eventCount';
export declare const STAT_ALIASES: Record<string, StatisticKey>;
export declare const STAT_DISPLAY_NAMES: Record<StatisticKey, string>;
export declare function resolveStatKey(input: string): StatisticKey;
export interface MetricValues {
    min: number | null | undefined;
    max: number | null | undefined;
    median: number | null | undefined;
    average: number | null | undefined;
    p80: number | null | undefined;
    p90: number | null | undefined;
    p99: number | null | undefined;
    eventCount: number | null | undefined;
}
type ObserveMetricsKey = `${string}:${AppPlatform}`;
export type ObserveMetricsMap = Map<ObserveMetricsKey, Map<string, MetricValues>>;
export type BuildNumbersMap = Map<ObserveMetricsKey, string[]>;
export type UpdateIdsMap = Map<ObserveMetricsKey, string[]>;
export declare function makeMetricsKey(appVersion: string, platform: AppPlatform): ObserveMetricsKey;
export type MetricValuesJson = Partial<Record<StatisticKey, number | null>>;
export interface ObserveMetricsVersionResult {
    appVersion: string;
    platform: AppPlatform;
    buildNumbers: string[];
    updateIds: string[];
    metrics: Record<string, MetricValuesJson>;
}
export interface ObserveMetricsJsonOutput {
    versions: ObserveMetricsVersionResult[];
    totalEventCounts: Record<string, Record<string, number>>;
}
export declare function buildObserveMetricsJson(metricsMap: ObserveMetricsMap, metricNames: string[], stats: StatisticKey[], totalEventCounts?: Map<string, number>, buildNumbersMap?: BuildNumbersMap, updateIdsMap?: UpdateIdsMap): ObserveMetricsJsonOutput;
export declare function buildObserveMetricsTable(metricsMap: ObserveMetricsMap, metricNames: string[], stats: StatisticKey[], options?: {
    daysBack?: number;
    buildNumbersMap?: BuildNumbersMap;
    totalEventCounts?: Map<string, number>;
}): string;
export {};
