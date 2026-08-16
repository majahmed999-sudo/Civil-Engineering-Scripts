import { ExpoGraphqlClient } from '../commandUtils/context/contextUtils/createGraphqlClient';
import { Actor } from '../user/User';
export type InitializeMethodOptions = {
    force: boolean;
    nonInteractive: boolean;
};
export declare function ensureOwnerSlugConsistencyAsync(graphqlClient: ExpoGraphqlClient, projectId: string, projectDir: string, { force, nonInteractive }: InitializeMethodOptions): Promise<void>;
export declare function initializeWithExplicitIDAsync(projectId: string, projectDir: string, { force, nonInteractive }: InitializeMethodOptions): Promise<void>;
export declare function initializeWithoutExplicitIDAsync(graphqlClient: ExpoGraphqlClient, actor: Actor, projectDir: string, { force, nonInteractive }: InitializeMethodOptions): Promise<string>;
