"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddedUpdateAssetMutation = void 0;
const tslib_1 = require("tslib");
const graphql_tag_1 = tslib_1.__importDefault(require("graphql-tag"));
const client_1 = require("../client");
exports.EmbeddedUpdateAssetMutation = {
    async getSignedUploadSpecAsync(graphqlClient, { appId, embeddedUpdateId, contentType, }) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .mutation((0, graphql_tag_1.default) `
            mutation GetSignedEmbeddedUpdateAssetUploadSpec(
              $appId: ID!
              $embeddedUpdateId: ID!
              $contentType: String!
            ) {
              embeddedUpdateAsset {
                getSignedEmbeddedUpdateAssetUploadSpecifications(
                  appId: $appId
                  embeddedUpdateId: $embeddedUpdateId
                  contentType: $contentType
                ) {
                  storageKey
                  presignedUrl
                  fields
                }
              }
            }
          `, { appId, embeddedUpdateId, contentType })
            .toPromise());
        return data.embeddedUpdateAsset.getSignedEmbeddedUpdateAssetUploadSpecifications;
    },
};
