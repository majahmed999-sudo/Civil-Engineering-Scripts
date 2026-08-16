import { ExpoConfig } from '@expo/config';
import { Client } from '../../vcs/vcs';
export declare const DEVELOPMENT_BUILD_PROFILE_NAME = "development";
export declare const DEVELOPMENT_IOS_SIMULATOR_BUILD_PROFILE_NAME = "development-ios-simulator";
export declare function buildProfileNamesFromProjectAsync(projectDir: string): Promise<Set<string>>;
export declare function ensureDevelopmentBuildProfilesExistAsync(projectDir: string): Promise<void>;
export declare function addProductionBuildProfileToEasJsonIfNeededAsync(projectDir: string): Promise<boolean>;
export declare function configureEasUpdateIfNeededAsync({ projectDir, expoConfig, projectId, vcsClient, }: {
    projectDir: string;
    expoConfig: ExpoConfig;
    projectId: string;
    vcsClient: Client;
}): Promise<void>;
export declare function configureEasBuildIfNeededAsync({ projectDir, expoConfig, vcsClient, }: {
    projectDir: string;
    expoConfig: ExpoConfig;
    vcsClient: Client;
}): Promise<void>;
