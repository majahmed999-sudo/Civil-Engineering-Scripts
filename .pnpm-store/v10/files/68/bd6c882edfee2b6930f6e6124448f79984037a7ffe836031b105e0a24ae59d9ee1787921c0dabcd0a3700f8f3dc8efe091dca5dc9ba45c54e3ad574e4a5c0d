import { AppObservePlatform, AppPlatform } from '../graphql/generated';
/**
 * Allowed values for the --platform flag in observe commands.
 * Derived from the AppObservePlatform enum so new platforms added on
 * the server are automatically picked up.
 */
export declare const allowedPlatformFlagValues: string[];
type PlatformFlagValue = (typeof allowedPlatformFlagValues)[number];
/**
 * Resolve a single AppObservePlatform from a --platform flag value.
 * Returns undefined when no flag was provided.
 */
export declare function appObservePlatformFromFlag(flag: PlatformFlagValue | undefined): AppObservePlatform | undefined;
/**
 * Resolve a list of AppPlatform values from a --platform flag value.
 * Returns the single matching platform when a flag is provided, or all
 * known platforms when no flag is provided (so the caller queries every
 * platform).
 */
export declare function appPlatformsFromFlag(flag: PlatformFlagValue | undefined): AppPlatform[];
export declare const appPlatformToObservePlatform: Record<AppPlatform, AppObservePlatform>;
export {};
