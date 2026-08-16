import { ExpoGraphqlClient } from '../../commandUtils/context/contextUtils/createGraphqlClient';
import { CreateConvexTeamConnectionInput, SendConvexTeamInviteToVerifiedEmailInput, SetupConvexProjectInput } from '../generated';
import { ConvexTeamConnectionData, SetupConvexProjectResultData } from '../types/ConvexTeamConnection';
export declare const ConvexMutation: {
    createConvexTeamConnectionAsync(graphqlClient: ExpoGraphqlClient, input: CreateConvexTeamConnectionInput): Promise<ConvexTeamConnectionData>;
    deleteConvexTeamConnectionAsync(graphqlClient: ExpoGraphqlClient, convexTeamConnectionId: string): Promise<ConvexTeamConnectionData>;
    setupConvexProjectAsync(graphqlClient: ExpoGraphqlClient, input: SetupConvexProjectInput): Promise<SetupConvexProjectResultData>;
    deleteConvexProjectAsync(graphqlClient: ExpoGraphqlClient, convexProjectId: string): Promise<string>;
    sendConvexTeamInviteToVerifiedEmailAsync(graphqlClient: ExpoGraphqlClient, input: SendConvexTeamInviteToVerifiedEmailInput): Promise<boolean>;
};
