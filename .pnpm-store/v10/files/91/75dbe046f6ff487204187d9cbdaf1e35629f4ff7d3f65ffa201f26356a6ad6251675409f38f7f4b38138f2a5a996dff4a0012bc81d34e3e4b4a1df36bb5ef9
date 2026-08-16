"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceRunSessionMutation = void 0;
const tslib_1 = require("tslib");
const graphql_tag_1 = tslib_1.__importDefault(require("graphql-tag"));
const client_1 = require("../client");
exports.DeviceRunSessionMutation = {
    async createDeviceRunSessionAsync(graphqlClient, deviceRunSessionInput) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .mutation((0, graphql_tag_1.default) `
            mutation CreateDeviceRunSessionMutation($deviceRunSessionInput: CreateDeviceRunSessionInput!) {
              deviceRunSession {
                createDeviceRunSession(deviceRunSessionInput: $deviceRunSessionInput) {
                  id
                  status
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
                  }
                }
              }
            }
          `, { deviceRunSessionInput }, { noRetry: true })
            .toPromise());
        return data.deviceRunSession.createDeviceRunSession;
    },
    async ensureDeviceRunSessionStoppedAsync(graphqlClient, deviceRunSessionId) {
        const data = await (0, client_1.withErrorHandlingAsync)(graphqlClient
            .mutation((0, graphql_tag_1.default) `
            mutation EnsureDeviceRunSessionStoppedMutation($deviceRunSessionId: ID!) {
              deviceRunSession {
                ensureDeviceRunSessionStopped(deviceRunSessionId: $deviceRunSessionId) {
                  id
                  status
                }
              }
            }
          `, { deviceRunSessionId }, { noRetry: true })
            .toPromise());
        return data.deviceRunSession.ensureDeviceRunSessionStopped;
    },
};
