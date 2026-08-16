import { ExpoGraphqlClient } from '../../commandUtils/context/contextUtils/createGraphqlClient';
import { AscAppLinkAppMetadataQuery, DiscoverAccessibleAppStoreConnectAppsQuery } from '../generated';
export declare const AscAppLinkQuery: {
    getAppMetadataAsync(graphqlClient: ExpoGraphqlClient, appId: string, options?: {
        useCache?: boolean;
    }): Promise<AscAppLinkAppMetadataQuery["app"]["byId"]>;
    discoverAccessibleAppsAsync(graphqlClient: ExpoGraphqlClient, appStoreConnectApiKeyId: string, bundleIdentifier?: string): Promise<DiscoverAccessibleAppStoreConnectAppsQuery["appStoreConnectApiKey"]["byId"]["remoteAppStoreConnectApps"]>;
};
