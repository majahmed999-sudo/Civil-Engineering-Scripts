"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddedUpdateQuery = void 0;
exports.isEmbeddedUpdateNotFoundError = isEmbeddedUpdateNotFoundError;
const tslib_1 = require("tslib");
const core_1 = require("@urql/core");
const graphql_tag_1 = tslib_1.__importDefault(require("graphql-tag"));
const client_1 = require("../client");
function isEmbeddedUpdateNotFoundError(error) {
    return (error instanceof core_1.CombinedError &&
        error.graphQLErrors.some(e => e.extensions?.['errorCode'] === 'EMBEDDED_UPDATE_NOT_FOUND'));
}
exports.EmbeddedUpdateQuery = {
    async viewByIdAsync(graphqlClient, { embeddedUpdateId, appId }) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .query((0, graphql_tag_1.default) `
            query ViewEmbeddedUpdateById($embeddedUpdateId: ID!, $appId: ID!) {
              embeddedUpdates {
                byId(embeddedUpdateId: $embeddedUpdateId, appId: $appId) {
                  id
                  platform
                  runtimeVersion
                  channel
                  createdAt
                  launchAsset {
                    id
                    fileSize
                    finalFileSize
                    fileSHA256
                  }
                }
              }
            }
          `, { embeddedUpdateId, appId }, { additionalTypenames: ['EmbeddedUpdate'] })
            .toPromise());
        return data.embeddedUpdates.byId;
    },
    async viewPaginatedAsync(graphqlClient, { appId, filter, first, after, }) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .query((0, graphql_tag_1.default) `
            query ViewEmbeddedUpdatesPaginated(
              $appId: String!
              $first: Int!
              $after: String
              $filter: EmbeddedUpdateFilterInput
            ) {
              app {
                byId(appId: $appId) {
                  id
                  embeddedUpdatesPaginated(first: $first, after: $after, filter: $filter) {
                    edges {
                      cursor
                      node {
                        id
                        platform
                        runtimeVersion
                        channel
                        createdAt
                        launchAsset {
                          id
                          fileSize
                          finalFileSize
                          fileSHA256
                        }
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
          `, { appId, first, after, filter }, { additionalTypenames: ['EmbeddedUpdate'] })
            .toPromise());
        return data.app.byId.embeddedUpdatesPaginated;
    },
};
