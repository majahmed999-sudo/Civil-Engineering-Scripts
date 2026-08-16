import { ExpoConfig } from '@expo/config';
import { SubmitProfile } from '@expo/eas-json';
import { Analytics } from '../analytics/AnalyticsManager';
import { ExpoGraphqlClient } from '../commandUtils/context/contextUtils/createGraphqlClient';
import { CredentialsContext } from '../credentials/context';
/**
 * Sync a local store configuration with the stores.
 * Note, only App Store is supported at this time.
 */
export declare function uploadMetadataAsync({ projectDir, profile, exp, analytics, credentialsCtx, nonInteractive, graphqlClient, projectId, }: {
    projectDir: string;
    profile: SubmitProfile;
    exp: ExpoConfig;
    analytics: Analytics;
    credentialsCtx: CredentialsContext;
    nonInteractive: boolean;
    graphqlClient: ExpoGraphqlClient;
    projectId: string;
}): Promise<{
    appleLink: string;
}>;
