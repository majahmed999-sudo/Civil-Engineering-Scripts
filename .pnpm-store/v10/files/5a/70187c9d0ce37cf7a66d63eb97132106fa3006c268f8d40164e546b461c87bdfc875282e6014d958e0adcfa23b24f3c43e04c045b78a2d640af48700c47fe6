import { ExpoGraphqlClient } from '../../../commandUtils/context/contextUtils/createGraphqlClient';
import { AccountFragment, AppStoreConnectApiKeyFragment } from '../../../graphql/generated';
import { CredentialsContext } from '../../context';
import { AppLookupParams } from '../api/graphql/types/AppLookupParams';
import { AscApiKey } from '../appstore/Credentials.types';
import { AppleTeamType } from '../appstore/authenticateTypes';
import { AscApiKeyPath, MinimalAscApiKey } from '../credentials';
export declare enum AppStoreApiKeyPurpose {
    SUBMISSION_SERVICE = "EAS Submit",
    ASC_APP_CONNECTION = "EAS Connect"
}
export declare function promptForAscApiKeyPathAsync(ctx: CredentialsContext): Promise<AscApiKeyPath>;
export declare function promptForIssuerIdAsync(): Promise<string>;
export declare function getMinimalAscApiKeyAsync(ascApiKey: AscApiKey): Promise<MinimalAscApiKey>;
export declare function provideOrGenerateAscApiKeyAsync(ctx: CredentialsContext, purpose: AppStoreApiKeyPurpose): Promise<MinimalAscApiKey>;
export declare function getAscApiKeyName(purpose: AppStoreApiKeyPurpose): string;
export declare function getAscApiKeysFromAccountAsync(ctx: CredentialsContext, account: AccountFragment, { filterDifferentAppleTeam }?: {
    filterDifferentAppleTeam?: boolean;
}): Promise<AppStoreConnectApiKeyFragment[]>;
export declare function selectAscApiKeysFromAccountAsync(ctx: CredentialsContext, account: AccountFragment, { filterDifferentAppleTeam }?: {
    filterDifferentAppleTeam?: boolean;
}): Promise<AppStoreConnectApiKeyFragment | null>;
export declare function sortAscApiKeysByUpdatedAtDesc(keys: AppStoreConnectApiKeyFragment[]): AppStoreConnectApiKeyFragment[];
export declare function formatAscApiKey(ascApiKey: AppStoreConnectApiKeyFragment): string;
export declare function resolveAscApiKeyForAppCredentialsAsync({ graphqlClient, app, }: {
    graphqlClient: ExpoGraphqlClient;
    app: AppLookupParams;
}): Promise<{
    ascApiKey: MinimalAscApiKey;
    teamId?: string;
    teamName?: string;
} | null>;
/**
 * Best-effort helper that populates `ctx.appStore.authCtx` in non-interactive mode
 * by loading an App Store Connect API key (from env vars, or by fetching the app's
 * stored key from the www GraphQL API).
 *
 * Returns true if `ctx.appStore.authCtx` is set after the call, false otherwise.
 * Never throws.
 */
export declare function tryAuthenticateAppStoreWithEasAscApiKeyAsync(ctx: CredentialsContext, app: AppLookupParams, teamType: AppleTeamType): Promise<boolean>;
