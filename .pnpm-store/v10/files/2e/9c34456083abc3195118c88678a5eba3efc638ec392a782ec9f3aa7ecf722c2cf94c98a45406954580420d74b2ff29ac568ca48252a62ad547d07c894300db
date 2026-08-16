import { ConvexProject, ConvexTeamConnection, SetupConvexProjectResult } from '../generated';
export type ConvexTeamConnectionData = Pick<ConvexTeamConnection, 'id' | 'convexTeamIdentifier' | 'convexTeamName' | 'convexTeamSlug' | 'hasBeenClaimed' | 'createdAt' | 'updatedAt' | 'invitedAt' | 'invitedEmail'>;
export type ConvexProjectData = Pick<ConvexProject, 'id' | 'convexProjectIdentifier' | 'convexProjectName' | 'convexProjectSlug' | 'createdAt' | 'updatedAt'> & {
    convexTeamConnection: ConvexTeamConnectionData;
};
export type SetupConvexProjectResultData = Pick<SetupConvexProjectResult, 'convexDeploymentName' | 'convexDeploymentUrl' | 'deployKey'> & {
    convexProject: ConvexProjectData;
};
export declare const ConvexTeamConnectionFragmentNode: import("graphql").DocumentNode;
export declare const ConvexProjectFragmentNode: import("graphql").DocumentNode;
export declare const SetupConvexProjectResultFragmentNode: import("graphql").DocumentNode;
