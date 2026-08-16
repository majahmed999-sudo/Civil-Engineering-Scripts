"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogQuery = void 0;
const tslib_1 = require("tslib");
const graphql_1 = require("graphql");
const graphql_tag_1 = tslib_1.__importDefault(require("graphql-tag"));
const client_1 = require("../client");
const AuditLog_1 = require("../types/AuditLog");
exports.AuditLogQuery = {
    async getAllForAccountAsync(graphqlClient, accountId, queryParams) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .query((0, graphql_tag_1.default) `
            query AuditLogsByAccount(
              $accountId: String!
              $first: Int
              $after: String
              $last: Int
              $before: String
            ) {
              account {
                byId(accountId: $accountId) {
                  id
                  auditLogsPaginated(
                    first: $first
                    after: $after
                    last: $last
                    before: $before
                  ) {
                    edges {
                      cursor
                      node {
                        id
                        ...AuditLogFragment
                      }
                    }
                    pageInfo {
                      hasNextPage
                      hasPreviousPage
                      startCursor
                      endCursor
                    }
                  }
                }
              }
            }
            ${(0, graphql_1.print)(AuditLog_1.AuditLogFragmentNode)}
          `, {
            accountId,
            first: queryParams.first,
            after: queryParams.after,
            last: queryParams.last,
            before: queryParams.before,
        }, { additionalTypenames: ['AuditLog'] })
            .toPromise());
        return data.account.byId.auditLogsPaginated;
    },
};
