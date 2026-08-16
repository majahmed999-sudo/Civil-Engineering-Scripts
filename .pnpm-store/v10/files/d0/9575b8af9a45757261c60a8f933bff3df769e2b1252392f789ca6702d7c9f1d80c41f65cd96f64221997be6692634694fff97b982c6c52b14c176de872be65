import { ExpoGraphqlClient } from '../../commandUtils/context/contextUtils/createGraphqlClient';
import { AppPlatform, UploadEmbeddedUpdateInput } from '../generated';
export type EmbeddedUpdateResult = {
    id: string;
    platform: AppPlatform;
    runtimeVersion: string;
    channel: string;
    createdAt: string;
};
export declare function isEmbeddedUpdateAssetNotAvailableError(error: unknown): boolean;
export declare function isEmbeddedUpdateAlreadyExistsError(error: unknown): boolean;
export declare const EmbeddedUpdateMutation: {
    uploadEmbeddedUpdateAsync(graphqlClient: ExpoGraphqlClient, input: UploadEmbeddedUpdateInput): Promise<EmbeddedUpdateResult>;
    deleteEmbeddedUpdateAsync(graphqlClient: ExpoGraphqlClient, { id }: {
        id: string;
    }): Promise<{
        id: string;
    }>;
};
