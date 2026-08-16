"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostHogQuery = void 0;
const tslib_1 = require("tslib");
const graphql_1 = require("graphql");
const graphql_tag_1 = tslib_1.__importDefault(require("graphql-tag"));
const client_1 = require("../client");
const PostHogConnection_1 = require("../types/PostHogConnection");
exports.PostHogQuery = {
    async getPostHogOrganizationConnectionByAccountIdAsync(graphqlClient, accountId, { useCache = true } = {}) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .query((0, graphql_tag_1.default) `
            query PostHogOrganizationConnectionByAccountId($accountId: String!) {
              account {
                byId(accountId: $accountId) {
                  id
                  posthogOrganizationConnection {
                    id
                    ...PostHogOrganizationConnectionFragment
                  }
                }
              }
            }
            ${(0, graphql_1.print)(PostHogConnection_1.PostHogOrganizationConnectionFragmentNode)}
          `, { accountId }, {
            additionalTypenames: ['PostHogOrganizationConnection'],
            requestPolicy: useCache ? 'cache-first' : 'network-only',
        })
            .toPromise());
        return data.account.byId.posthogOrganizationConnection ?? null;
    },
    async getPostHogProjectByAppIdAsync(graphqlClient, appId) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .query((0, graphql_tag_1.default) `
            query PostHogProjectByAppId($appId: String!) {
              app {
                byId(appId: $appId) {
                  id
                  posthogProject {
                    id
                    ...PostHogProjectFragment
                  }
                }
              }
            }
            ${(0, graphql_1.print)(PostHogConnection_1.PostHogOrganizationConnectionFragmentNode)}
            ${(0, graphql_1.print)(PostHogConnection_1.PostHogProjectFragmentNode)}
          `, { appId }, { additionalTypenames: ['App', 'PostHogProject'] })
            .toPromise());
        return data.app.byId.posthogProject ?? null;
    },
};
