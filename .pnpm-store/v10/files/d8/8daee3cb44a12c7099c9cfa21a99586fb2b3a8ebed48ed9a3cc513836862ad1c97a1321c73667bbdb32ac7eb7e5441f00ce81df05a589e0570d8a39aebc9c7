import { AppPlatform } from '../graphql/generated';
import { NavigationRouteWithPlatform } from './fetchNavigationRoutes';
export type NavigationStatKey = 'median' | 'p90' | 'count';
export declare const NAVIGATION_STAT_ALIASES: Record<string, NavigationStatKey>;
export declare const NAVIGATION_STAT_DISPLAY_NAMES: Record<NavigationStatKey, string>;
export declare function resolveNavigationStatKey(input: string): NavigationStatKey;
export declare const NAVIGATION_METRIC_NAMES: string[];
export declare function isNavigationMetric(metricName: string): boolean;
export interface NavigationRouteValuesJson {
    routeName: string;
    platform: AppPlatform;
    metrics: Record<string, Partial<Record<NavigationStatKey, number | null>>>;
}
export interface ObserveNavigationRoutesJsonOutput {
    routes: NavigationRouteValuesJson[];
    pageInfoByPlatform: Record<string, {
        hasNextPage: boolean;
        endCursor: string | null;
    }>;
}
export declare function buildObserveNavigationRoutesJson(routes: NavigationRouteWithPlatform[], metricNames: string[], stats: NavigationStatKey[], pageInfoByPlatform: Map<AppPlatform, {
    hasNextPage: boolean;
    endCursor?: string | null;
}>): ObserveNavigationRoutesJsonOutput;
export interface BuildNavigationRoutesTableOptions {
    daysBack?: number;
    startTime?: string;
    endTime?: string;
    pageInfoByPlatform?: Map<AppPlatform, {
        hasNextPage: boolean;
        endCursor?: string | null;
    }>;
}
export declare function buildObserveNavigationRoutesTable(routes: NavigationRouteWithPlatform[], metricNames: string[], stats: NavigationStatKey[], options?: BuildNavigationRoutesTableOptions): string;
