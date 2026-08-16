"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostHogMutation = void 0;
const tslib_1 = require("tslib");
const graphql_1 = require("graphql");
const graphql_tag_1 = tslib_1.__importDefault(require("graphql-tag"));
const client_1 = require("../client");
const PostHogConnection_1 = require("../types/PostHogConnection");
exports.PostHogMutation = {
    async startPostHogConnectionAsync(graphqlClient, input) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .mutation((0, graphql_tag_1.default) `
            mutation StartPostHogConnection($input: CreatePostHogAccountRequestInput!) {
              posthogOrganizationConnection {
                startPostHogConnection(input: $input) {
                  __typename
                  ... on PostHogOrganizationConnection {
                    id
                    ...PostHogOrganizationConnectionFragment
                  }
                  ... on PostHogPendingConnection {
                    url
                  }
                }
              }
            }
            ${(0, graphql_1.print)(PostHogConnection_1.PostHogOrganizationConnectionFragmentNode)}
          `, { input }, { additionalTypenames: ['PostHogOrganizationConnection'] })
            .toPromise());
        return data.posthogOrganizationConnection.startPostHogConnection;
    },
    async setupPostHogProjectAsync(graphqlClient, input) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .mutation((0, graphql_tag_1.default) `
            mutation SetupPostHogProject($input: SetupPostHogProjectInput!) {
              posthogProject {
                setupPostHogProject(input: $input) {
                  id
                  ...PostHogProjectFragment
                }
              }
            }
            ${(0, graphql_1.print)(PostHogConnection_1.PostHogOrganizationConnectionFragmentNode)}
            ${(0, graphql_1.print)(PostHogConnection_1.PostHogProjectFragmentNode)}
          `, { input })
            .toPromise());
        return data.posthogProject.setupPostHogProject;
    },
    async deletePostHogProjectAsync(graphqlClient, id) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .mutation((0, graphql_tag_1.default) `
            mutation DeletePostHogProject($id: ID!) {
              posthogProject {
                deletePostHogProject(id: $id)
              }
            }
          `, { id }, { additionalTypenames: ['App', 'PostHogProject'] })
            .toPromise());
        return data.posthogProject.deletePostHogProject;
    },
    async createPostHogDeepLinkAsync(graphqlClient, input) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .mutation((0, graphql_tag_1.default) `
            mutation CreatePostHogDeepLink($input: CreatePostHogDeepLinkInput!) {
              posthogOrganizationConnection {
                createPostHogDeepLink(input: $input) {
                  url
                }
              }
            }
          `, { input })
            .toPromise());
        return data.posthogOrganizationConnection.createPostHogDeepLink.url;
    },
};
