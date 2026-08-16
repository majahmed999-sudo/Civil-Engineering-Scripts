"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceRunSessionQuery = void 0;
const tslib_1 = require("tslib");
const graphql_tag_1 = tslib_1.__importDefault(require("graphql-tag"));
const client_1 = require("../client");
exports.DeviceRunSessionQuery = {
    async byIdAsync(graphqlClient, deviceRunSessionId) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .query((0, graphql_tag_1.default) `
            query DeviceRunSessionByIdQuery($deviceRunSessionId: ID!) {
              deviceRunSessions {
                byId(deviceRunSessionId: $deviceRunSessionId) {
                  id
                  status
                  type
                  platform
                  createdAt
                  startedAt
                  finishedAt
                  updatedAt
                  app {
                    id
                    slug
                    ownerAccount {
                      id
                      name
                    }
                  }
                  artifacts {
                    id
                    name
                    filename
                    downloadUrl
                    fileSizeBytes
                    metadata
                    createdAt
                    updatedAt
                  }
                  remoteConfig {
                    __typename
                    ... on AgentDeviceRunSessionRemoteConfig {
                      agentDeviceRemoteSessionUrl
                      agentDeviceRemoteSessionToken
                      webPreviewUrl
                    }
                    ... on ArgentRunSessionRemoteConfig {
                      toolsUrl
                      toolsAuthToken
                      webPreviewUrl
                    }
                    ... on ServeSimRunSessionRemoteConfig {
                      previewUrl
                    }
                  }
                  turtleJobRun {
                    id
                    status
                  }
                }
              }
            }
          `, { deviceRunSessionId }, { requestPolicy: 'network-only' })
            .toPromise());
        return data.deviceRunSessions.byId;
    },
    async listByAppIdAsync(graphqlClient, { appId, first, after, filter, }) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .query((0, graphql_tag_1.default) `
            query DeviceRunSessionsByAppId(
              $appId: String!
              $first: Int
              $after: String
              $filter: DeviceRunSessionFilterInput
            ) {
              app {
                byId(appId: $appId) {
                  id
                  deviceRunSessionsPaginated(first: $first, after: $after, filter: $filter) {
                    edges {
                      cursor
                      node {
                        id
                        status
                        type
                        platform
                        createdAt
                        startedAt
                        finishedAt
                        app {
                          id
                          slug
                          ownerAccount {
                            id
                            name
                          }
                        }
                        turtleJobRun {
                          id
                          status
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
          `, { appId, first, after, filter }, { requestPolicy: 'network-only' })
            .toPromise());
        return data.app.byId.deviceRunSessionsPaginated;
    },
};
