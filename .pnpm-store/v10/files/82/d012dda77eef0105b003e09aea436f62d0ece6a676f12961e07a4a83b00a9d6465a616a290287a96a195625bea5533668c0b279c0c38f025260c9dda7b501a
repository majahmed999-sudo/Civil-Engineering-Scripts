import { ExpoConfig } from '@expo/config';
import spawnAsync from '@expo/spawn-async';
import type { CommonSpawnOptions } from 'node:child_process';
/**
 * @returns `true` if the project is SDK +46, has `@expo/cli`, and `EXPO_USE_LOCAL_CLI` is not set to a _false_ value.
 */
export declare function shouldUseVersionedExpoCLIExpensive(projectDir: string, exp: Pick<ExpoConfig, 'sdkVersion'>): boolean;
/**
 * Determine if we can and should use `expo export` with multiple `--platform` flags.
 * This is an issue related to `expo export --all` causing issues when users have Metro web configured.
 * See: https://github.com/expo/expo/pull/23621
 */
export declare function shouldUseVersionedExpoCLIWithExplicitPlatformsExpensive(projectDir: string): boolean;
export declare const shouldUseVersionedExpoCLI: typeof shouldUseVersionedExpoCLIExpensive;
export declare const shouldUseVersionedExpoCLIWithExplicitPlatforms: typeof shouldUseVersionedExpoCLIWithExplicitPlatformsExpensive;
export declare function resolveExpoCli(projectDir: string): string;
export declare function spawnExpoCommand(projectDir: string, args: string[], opts?: CommonSpawnOptions): spawnAsync.SpawnPromise<spawnAsync.SpawnResult>;
export declare function expoCommandAsync(projectDir: string, args: string[], { silent, extraEnv, }?: {
    silent?: boolean;
    extraEnv?: Record<string, string | undefined>;
}): Promise<void>;
