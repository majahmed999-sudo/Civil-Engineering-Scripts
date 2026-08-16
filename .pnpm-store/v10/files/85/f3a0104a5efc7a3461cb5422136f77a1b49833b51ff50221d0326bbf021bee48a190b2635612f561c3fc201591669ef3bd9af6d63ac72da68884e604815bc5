import { ExpoGraphqlClient } from '../../commandUtils/context/contextUtils/createGraphqlClient';
import { CreatePostHogAccountRequestInput, CreatePostHogDeepLinkInput, SetupPostHogProjectInput } from '../generated';
import { PostHogProjectData, StartPostHogConnectionResult } from '../types/PostHogConnection';
export declare const PostHogMutation: {
    startPostHogConnectionAsync(graphqlClient: ExpoGraphqlClient, input: CreatePostHogAccountRequestInput): Promise<StartPostHogConnectionResult>;
    setupPostHogProjectAsync(graphqlClient: ExpoGraphqlClient, input: SetupPostHogProjectInput): Promise<PostHogProjectData>;
    deletePostHogProjectAsync(graphqlClient: ExpoGraphqlClient, id: string): Promise<string>;
    createPostHogDeepLinkAsync(graphqlClient: ExpoGraphqlClient, input: CreatePostHogDeepLinkInput): Promise<string>;
};
