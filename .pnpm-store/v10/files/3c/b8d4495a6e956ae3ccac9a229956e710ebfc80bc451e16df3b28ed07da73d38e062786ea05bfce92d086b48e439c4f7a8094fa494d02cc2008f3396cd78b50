import { App, Session } from '@expo/apple-utils';
import { ExpoConfig } from '@expo/config';
import { SubmitProfile } from '@expo/eas-json';
import { ExpoGraphqlClient } from '../commandUtils/context/contextUtils/createGraphqlClient';
import { CredentialsContext } from '../credentials/context';
export type MetadataAppStoreAuthentication = {
    /** The root entity of the App store */
    app: App;
    /** The authentication state we used to fetch the root entity */
    auth: Partial<Session.AuthState>;
};
/**
 * To start syncing ASC entities, we need access to the apple utils App instance.
 * This resolves both the authentication and that App instance.
 *
 * Resolution order for authentication:
 * 1. ASC API key from environment variables (EXPO_ASC_API_KEY_PATH, etc.)
 * 2. ASC API key from submit profile (ascApiKeyPath, etc. in eas.json)
 * 3. ASC API key from EAS credentials service
 * 4. Interactive cookie auth (only when not in non-interactive mode)
 */
export declare function getAppStoreAuthAsync({ projectDir, profile, exp, credentialsCtx, nonInteractive, graphqlClient, projectId, }: {
    projectDir: string;
    profile: SubmitProfile;
    exp: ExpoConfig;
    credentialsCtx: CredentialsContext;
    nonInteractive: boolean;
    graphqlClient: ExpoGraphqlClient;
    projectId: string;
}): Promise<MetadataAppStoreAuthentication>;
