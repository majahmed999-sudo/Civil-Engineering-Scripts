import { ExpoGraphqlClient } from '../commandUtils/context/contextUtils/createGraphqlClient';
import { AppPlatform } from '../graphql/generated';
import { BuildNumbersMap, ObserveMetricsMap, UpdateIdsMap } from './formatMetrics';
export declare function validateDateFlag(value: string, flagName: string): void;
export interface FetchObserveMetricsResult {
    metricsMap: ObserveMetricsMap;
    buildNumbersMap: BuildNumbersMap;
    updateIdsMap: UpdateIdsMap;
    totalEventCounts: Map<string, number>;
}
export declare function fetchObserveMetricsAsync(graphqlClient: ExpoGraphqlClient, appId: string, metricNames: string[], platforms: AppPlatform[], startTime: string, endTime: string): Promise<FetchObserveMetricsResult>;
