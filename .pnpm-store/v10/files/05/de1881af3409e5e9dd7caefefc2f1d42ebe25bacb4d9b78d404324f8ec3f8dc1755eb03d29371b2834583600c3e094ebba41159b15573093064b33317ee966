"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvexMutation = void 0;
const tslib_1 = require("tslib");
const graphql_1 = require("graphql");
const graphql_tag_1 = tslib_1.__importDefault(require("graphql-tag"));
const client_1 = require("../client");
const ConvexTeamConnection_1 = require("../types/ConvexTeamConnection");
exports.ConvexMutation = {
    async createConvexTeamConnectionAsync(graphqlClient, input) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .mutation((0, graphql_tag_1.default) `
            mutation CreateConvexTeamConnection(
              $convexTeamConnectionData: CreateConvexTeamConnectionInput!
            ) {
              convexTeamConnection {
                createConvexTeamConnection(
                  convexTeamConnectionData: $convexTeamConnectionData
                ) {
                  id
                  ...ConvexTeamConnectionFragment
                }
              }
            }
            ${(0, graphql_1.print)(ConvexTeamConnection_1.ConvexTeamConnectionFragmentNode)}
          `, { convexTeamConnectionData: input })
            .toPromise());
        return data.convexTeamConnection.createConvexTeamConnection;
    },
    async deleteConvexTeamConnectionAsync(graphqlClient, convexTeamConnectionId) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .mutation((0, graphql_tag_1.default) `
            mutation DeleteConvexTeamConnection($convexTeamConnectionId: ID!) {
              convexTeamConnection {
                deleteConvexTeamConnection(
                  convexTeamConnectionId: $convexTeamConnectionId
                ) {
                  id
                  ...ConvexTeamConnectionFragment
                }
              }
            }
            ${(0, graphql_1.print)(ConvexTeamConnection_1.ConvexTeamConnectionFragmentNode)}
          `, { convexTeamConnectionId })
            .toPromise());
        return data.convexTeamConnection.deleteConvexTeamConnection;
    },
    async setupConvexProjectAsync(graphqlClient, input) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .mutation((0, graphql_tag_1.default) `
            mutation SetupConvexProject($input: SetupConvexProjectInput!) {
              convexProject {
                setupConvexProject(input: $input) {
                  ...SetupConvexProjectResultFragment
                }
              }
            }
            ${(0, graphql_1.print)(ConvexTeamConnection_1.ConvexTeamConnectionFragmentNode)}
            ${(0, graphql_1.print)(ConvexTeamConnection_1.ConvexProjectFragmentNode)}
            ${(0, graphql_1.print)(ConvexTeamConnection_1.SetupConvexProjectResultFragmentNode)}
          `, { input })
            .toPromise());
        return data.convexProject.setupConvexProject;
    },
    async deleteConvexProjectAsync(graphqlClient, convexProjectId) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .mutation((0, graphql_tag_1.default) `
            mutation DeleteConvexProject($convexProjectId: ID!) {
              convexProject {
                deleteConvexProject(convexProjectId: $convexProjectId)
              }
            }
          `, { convexProjectId })
            .toPromise());
        return data.convexProject.deleteConvexProject;
    },
    async sendConvexTeamInviteToVerifiedEmailAsync(graphqlClient, input) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .mutation((0, graphql_tag_1.default) `
            mutation SendConvexTeamInviteToVerifiedEmail($input: SendConvexTeamInviteToVerifiedEmailInput!) {
              convexTeamConnection {
                sendConvexTeamInviteToVerifiedEmail(input: $input)
              }
            }
          `, { input })
            .toPromise());
        return data.convexTeamConnection.sendConvexTeamInviteToVerifiedEmail;
    },
};
