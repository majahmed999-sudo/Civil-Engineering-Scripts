import { ExpoGraphqlClient } from '../../commandUtils/context/contextUtils/createGraphqlClient';
export type UsageTier = 'approaching' | 'at' | 'over';
export declare function maybeWarnAboutUsageOveragesAsync({ graphqlClient, accountId, }: {
    graphqlClient: ExpoGraphqlClient;
    accountId: string;
}): Promise<void>;
export declare function classifyUsageTier({ planValue, limit, overageCount, overageCostCents, hasFreePlan, }: {
    planValue: number;
    limit: number;
    overageCount: number;
    overageCostCents: number;
    hasFreePlan: boolean;
}): UsageTier | null;
export declare function calculatePercentUsed(value: number, limit: number): number;
export declare function createProgressBar(percentUsed: number, width?: number): string;
export declare function displayOverageWarning({ tier, name, hasFreePlan, planValue, limit, overageCount, overageCostCents, }: {
    tier: UsageTier;
    name: string;
    hasFreePlan: boolean;
    planValue: number;
    limit: number;
    overageCount: number;
    overageCostCents: number;
}): void;
