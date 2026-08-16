import { ExpoGraphqlClient } from '../../commandUtils/context/contextUtils/createGraphqlClient';
import { Connection } from '../../utils/relay';
import { EmbeddedUpdateFilterInput, ViewEmbeddedUpdateByIdQuery } from '../generated';
export declare function isEmbeddedUpdateNotFoundError(error: unknown): boolean;
export type EmbeddedUpdateFragment = ViewEmbeddedUpdateByIdQuery['embeddedUpdates']['byId'];
export type EmbeddedUpdateFilter = EmbeddedUpdateFilterInput;
export declare const EmbeddedUpdateQuery: {
    viewByIdAsync(graphqlClient: ExpoGraphqlClient, { embeddedUpdateId, appId }: {
        embeddedUpdateId: string;
        appId: string;
    }): Promise<EmbeddedUpdateFragment>;
    viewPaginatedAsync(graphqlClient: ExpoGraphqlClient, { appId, filter, first, after, }: {
        appId: string;
        filter?: EmbeddedUpdateFilter;
        first: number;
        after?: string;
    }): Promise<Connection<EmbeddedUpdateFragment>>;
};
