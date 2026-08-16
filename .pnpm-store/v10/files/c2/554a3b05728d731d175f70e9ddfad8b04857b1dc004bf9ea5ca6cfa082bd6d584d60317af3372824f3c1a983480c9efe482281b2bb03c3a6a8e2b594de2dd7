import { AppVersionsResult } from './fetchVersions';
export interface AppVersionJson {
    platform: string;
    appVersion: string;
    firstSeenAt: string;
    eventCount: number;
    uniqueUserCount: number;
    buildNumbers: AppBuildNumberJson[];
    updates: AppUpdateJson[];
}
export interface AppBuildNumberJson {
    appBuildNumber: string;
    firstSeenAt: string;
    eventCount: number;
    uniqueUserCount: number;
    easBuilds: AppEasBuildJson[];
}
export interface AppUpdateJson {
    appUpdateId: string;
    firstSeenAt: string;
    eventCount: number;
    uniqueUserCount: number;
    easBuilds: AppEasBuildJson[];
}
export interface AppEasBuildJson {
    easBuildId: string;
    firstSeenAt: string;
    eventCount: number;
    uniqueUserCount: number;
}
export declare function buildObserveVersionsJson(results: AppVersionsResult[]): AppVersionJson[];
export declare function buildObserveVersionsTable(results: AppVersionsResult[]): string;
