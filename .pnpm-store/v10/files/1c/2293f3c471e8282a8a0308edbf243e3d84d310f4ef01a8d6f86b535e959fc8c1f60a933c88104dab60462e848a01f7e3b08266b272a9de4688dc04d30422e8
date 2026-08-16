import { ExpoGraphqlClient } from '../../commandUtils/context/contextUtils/createGraphqlClient';
export type EmbeddedUpdateAssetUploadSpec = {
    storageKey: string;
    presignedUrl: string;
    fields: Record<string, string>;
};
export declare const EmbeddedUpdateAssetMutation: {
    getSignedUploadSpecAsync(graphqlClient: ExpoGraphqlClient, { appId, embeddedUpdateId, contentType, }: {
        appId: string;
        embeddedUpdateId: string;
        contentType: string;
    }): Promise<EmbeddedUpdateAssetUploadSpec>;
};
