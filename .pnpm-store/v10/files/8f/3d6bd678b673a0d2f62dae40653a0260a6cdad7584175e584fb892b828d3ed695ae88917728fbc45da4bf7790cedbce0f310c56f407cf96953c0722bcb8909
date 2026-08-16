"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AscAppLinkMutation = void 0;
const tslib_1 = require("tslib");
const graphql_tag_1 = tslib_1.__importDefault(require("graphql-tag"));
const client_1 = require("../client");
exports.AscAppLinkMutation = {
    async createAppStoreConnectAppAsync(graphqlClient, appStoreConnectAppInput) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .mutation((0, graphql_tag_1.default) `
            mutation CreateAppStoreConnectApp($appStoreConnectAppInput: AppStoreConnectAppInput!) {
              appStoreConnectApp {
                createAppStoreConnectApp(appStoreConnectAppInput: $appStoreConnectAppInput) {
                  id
                  ascAppIdentifier
                }
              }
            }
          `, { appStoreConnectAppInput })
            .toPromise());
        return data.appStoreConnectApp.createAppStoreConnectApp;
    },
    async deleteAppStoreConnectAppAsync(graphqlClient, appStoreConnectAppId) {
        await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .mutation((0, graphql_tag_1.default) `
            mutation DeleteAppStoreConnectApp($appStoreConnectAppId: ID!) {
              appStoreConnectApp {
                deleteAppStoreConnectApp(appStoreConnectAppId: $appStoreConnectAppId) {
                  id
                }
              }
            }
          `, { appStoreConnectAppId })
            .toPromise());
    },
};
