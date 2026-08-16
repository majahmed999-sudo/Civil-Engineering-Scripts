import { PostHogOrganizationConnection, PostHogProject } from '../generated';
export type PostHogOrganizationConnectionData = Pick<PostHogOrganizationConnection, 'id' | 'posthogOrganizationIdentifier' | 'posthogOrganizationName' | 'posthogRegion' | 'createdAt' | 'updatedAt'>;
export type PostHogPendingConnectionData = {
    url: string;
};
export type StartPostHogConnectionResult = ({
    __typename: 'PostHogOrganizationConnection';
} & PostHogOrganizationConnectionData) | ({
    __typename: 'PostHogPendingConnection';
} & PostHogPendingConnectionData);
export type PostHogProjectData = Pick<PostHogProject, 'id' | 'posthogProjectIdentifier' | 'posthogProjectName' | 'posthogProjectToken' | 'posthogHost' | 'createdAt' | 'updatedAt'> & {
    posthogOrganizationConnection: PostHogOrganizationConnectionData;
};
export declare const PostHogOrganizationConnectionFragmentNode: import("graphql").DocumentNode;
export declare const PostHogProjectFragmentNode: import("graphql").DocumentNode;
