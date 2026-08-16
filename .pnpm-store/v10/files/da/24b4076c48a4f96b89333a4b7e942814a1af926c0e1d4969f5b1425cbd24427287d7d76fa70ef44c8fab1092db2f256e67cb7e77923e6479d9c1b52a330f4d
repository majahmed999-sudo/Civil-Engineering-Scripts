"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvexQuery = void 0;
const tslib_1 = require("tslib");
const graphql_1 = require("graphql");
const graphql_tag_1 = tslib_1.__importDefault(require("graphql-tag"));
const client_1 = require("../client");
const ConvexTeamConnection_1 = require("../types/ConvexTeamConnection");
exports.ConvexQuery = {
    async getConvexTeamConnectionsByAccountIdAsync(graphqlClient, accountId) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .query((0, graphql_tag_1.default) `
            query ConvexTeamConnectionsByAccountId($accountId: String!) {
              account {
                byId(accountId: $accountId) {
                  id
                  convexTeamConnections {
                    id
                    ...ConvexTeamConnectionFragment
                  }
                }
              }
            }
            ${(0, graphql_1.print)(ConvexTeamConnection_1.ConvexTeamConnectionFragmentNode)}
          `, { accountId })
            .toPromise());
        return data.account.byId.convexTeamConnections;
    },
    async getConvexProjectByAppIdAsync(graphqlClient, appId) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .query((0, graphql_tag_1.default) `
            query ConvexProjectByAppId($appId: String!) {
              app {
                byId(appId: $appId) {
                  id
                  convexProject {
                    id
                    ...ConvexProjectFragment
                  }
                }
              }
            }
            ${(0, graphql_1.print)(ConvexTeamConnection_1.ConvexTeamConnectionFragmentNode)}
            ${(0, graphql_1.print)(ConvexTeamConnection_1.ConvexProjectFragmentNode)}
          `, { appId }, { additionalTypenames: ['App', 'ConvexProject'] })
            .toPromise());
        return data.app.byId.convexProject ?? null;
    },
};
