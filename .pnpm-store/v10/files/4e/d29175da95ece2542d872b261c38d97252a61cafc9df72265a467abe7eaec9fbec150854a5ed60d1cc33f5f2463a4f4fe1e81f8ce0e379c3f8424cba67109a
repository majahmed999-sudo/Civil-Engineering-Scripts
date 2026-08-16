"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddedUpdateMutation = void 0;
exports.isEmbeddedUpdateAssetNotAvailableError = isEmbeddedUpdateAssetNotAvailableError;
exports.isEmbeddedUpdateAlreadyExistsError = isEmbeddedUpdateAlreadyExistsError;
const tslib_1 = require("tslib");
const core_1 = require("@urql/core");
const graphql_tag_1 = tslib_1.__importDefault(require("graphql-tag"));
const client_1 = require("../client");
function isEmbeddedUpdateAssetNotAvailableError(error) {
    return (error instanceof core_1.CombinedError &&
        error.graphQLErrors.some(e => e.extensions?.['errorCode'] === 'EMBEDDED_UPDATE_ASSET_NOT_AVAILABLE'));
}
function isEmbeddedUpdateAlreadyExistsError(error) {
    return (error instanceof core_1.CombinedError &&
        error.graphQLErrors.some(e => e.extensions?.['errorCode'] === 'EMBEDDED_UPDATE_ALREADY_EXISTS'));
}
exports.EmbeddedUpdateMutation = {
    async uploadEmbeddedUpdateAsync(graphqlClient, input) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .mutation((0, graphql_tag_1.default) `
            mutation UploadEmbeddedUpdate($input: UploadEmbeddedUpdateInput!) {
              embeddedUpdate {
                uploadEmbeddedUpdate(input: $input) {
                  id
                  platform
                  runtimeVersion
                  channel
                  createdAt
                }
              }
            }
          `, { input })
            .toPromise());
        return data.embeddedUpdate.uploadEmbeddedUpdate;
    },
    async deleteEmbeddedUpdateAsync(graphqlClient, { id }) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .mutation((0, graphql_tag_1.default) `
            mutation DeleteEmbeddedUpdate($id: ID!) {
              embeddedUpdate {
                deleteEmbeddedUpdate(id: $id) {
                  id
                }
              }
            }
          `, { id })
            .toPromise());
        return data.embeddedUpdate.deleteEmbeddedUpdate;
    },
};
