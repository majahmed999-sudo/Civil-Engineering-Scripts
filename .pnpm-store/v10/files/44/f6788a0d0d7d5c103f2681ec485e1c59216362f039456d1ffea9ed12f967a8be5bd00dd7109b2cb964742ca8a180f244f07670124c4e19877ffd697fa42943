import { ExpoConfig } from '@expo/config';
import { Env } from '@expo/eas-build-job';
import { XcodeBuildContext } from './scheme';
import { ApplePlatform } from '../../credentials/ios/appstore/constants';
import { Target } from '../../credentials/ios/types';
import { Client } from '../../vcs/vcs';
interface ResolveTargetOptions {
    projectDir: string;
    exp: ExpoConfig;
    env?: Env;
    xcodeBuildContext: XcodeBuildContext;
    vcsClient: Client;
}
/**
 * For managed projects we don't have an Xcode project to read build settings
 * from, but the @react-native-tvos/config-tv plugin signals a tvOS build via
 * the EXPO_TV environment variable. That variable can come from the build
 * profile's `env` in eas.json (the typical case, which flows in via `env`),
 * or from the shell process when the user runs `EXPO_TV=1 eas build ...`
 * (which is NOT included in the merged `env` upstream, so we read
 * `process.env` directly as a fallback). When set, synthesize
 * TARGETED_DEVICE_FAMILY=3 so getApplePlatformFromTarget (and every
 * Apple-portal flow downstream) picks TV_OS for these targets instead of
 * defaulting to IOS.
 */
export declare function getManagedTvBuildSettings(env: Env | undefined): Target['buildSettings'] | undefined;
export declare function resolveManagedProjectTargetsAsync({ exp, projectDir, xcodeBuildContext, env, vcsClient, }: ResolveTargetOptions): Promise<Target[]>;
export declare function resolveBareProjectTargetsAsync({ exp, projectDir, xcodeBuildContext, vcsClient, }: ResolveTargetOptions): Promise<Target[]>;
export declare function resolveTargetsAsync(opts: ResolveTargetOptions): Promise<Target[]>;
export declare function findApplicationTarget(targets: Target[]): Target;
export declare function findTargetByName(targets: Target[], name: string): Target;
/**
 * Get Apple Platform from the Xcode Target where possible.
 * @returns - Apple Platform when known, defaults to IOS when unknown
 */
export declare function getApplePlatformFromTarget(target: Target): ApplePlatform;
/**
 * Get Apple Platform from the Xcode SDKROOT where possible.
 * @returns - Apple Platform when known, defaults to null when unknown
 */
export declare function getApplePlatformFromSdkRoot(target: Target): ApplePlatform | null;
/**
 * Get Apple Platform from the Xcode TARGETED_DEVICE_FAMILY where possible.
 *
 * References:
 * https://developer-mdn.apple.com/library/archive/documentation/DeveloperTools/Reference/XcodeBuildSettingRef/1-Build_Setting_Reference/build_setting_ref.html
 * https://stackoverflow.com/questions/39677524/xcode-8-how-to-change-targeted-device-family#comment100316573_39677659
 *
 * @returns - Apple Platform when known, defaults to null when unknown
 */
export declare function getApplePlatformFromDeviceFamily(target: Target): ApplePlatform | null;
export {};
