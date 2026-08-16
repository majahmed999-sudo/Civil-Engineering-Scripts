"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AscAppLinkQuery = void 0;
const tslib_1 = require("tslib");
const graphql_1 = require("graphql");
const graphql_tag_1 = tslib_1.__importDefault(require("graphql-tag"));
const client_1 = require("../client");
const Account_1 = require("../types/Account");
exports.AscAppLinkQuery = {
    async getAppMetadataAsync(graphqlClient, appId, options) {
        const useCache = options?.useCache ?? true;
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .query((0, graphql_tag_1.default) `
            query AscAppLinkAppMetadata($appId: String!) {
              app {
                byId(appId: $appId) {
                  id
                  fullName
                  ownerAccount {
                    id
                    ...AccountFragment
                  }
                  appStoreConnectApp {
                    id
                    ascAppIdentifier
                    remoteAppStoreConnectApp {
                      ascAppIdentifier
                      bundleIdentifier
                      name
                      appStoreIconUrl
                    }
                  }
                }
              }
            }
            ${(0, graphql_1.print)(Account_1.AccountFragmentNode)}
          `, { appId }, {
            requestPolicy: useCache ? 'cache-first' : 'network-only',
            additionalTypenames: ['App', 'AppStoreConnectApp'],
        })
            .toPromise());
        return data.app.byId;
    },
    async discoverAccessibleAppsAsync(graphqlClient, appStoreConnectApiKeyId, bundleIdentifier) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .query((0, graphql_tag_1.default) `
            query DiscoverAccessibleAppStoreConnectApps(
              $appStoreConnectApiKeyId: ID!
              $bundleIdentifier: String
            ) {
              appStoreConnectApiKey {
                byId(id: $appStoreConnectApiKeyId) {
                  id
                  remoteAppStoreConnectApps(bundleIdentifier: $bundleIdentifier) {
                    ascAppIdentifier
                    bundleIdentifier
                    name
                    appStoreIconUrl
                  }
                }
              }
            }
          `, { appStoreConnectApiKeyId, bundleIdentifier }, { additionalTypenames: ['AppStoreConnectApp'] })
            .toPromise());
        return data.appStoreConnectApiKey.byId?.remoteAppStoreConnectApps ?? [];
    },
};
