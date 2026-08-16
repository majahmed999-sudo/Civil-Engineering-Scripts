"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelInsightsQuery = void 0;
const tslib_1 = require("tslib");
const graphql_tag_1 = tslib_1.__importDefault(require("graphql-tag"));
const errors_1 = require("../../channel/errors");
const client_1 = require("../client");
exports.ChannelInsightsQuery = {
    async viewChannelRuntimeInsightsAsync(graphqlClient, { appId, channelName, runtimeVersion, startTime, endTime, }) {
        const data = await (0, client_1.withUpgradeRequiredErrorHandlingAsync)(graphqlClient
            .query((0, graphql_tag_1.default) `
            query ViewChannelRuntimeInsightsOnApp(
              $appId: String!
              $channelName: String!
              $runtimeVersion: String!
              $timespan: InsightsTimespan!
            ) {
              app {
                byId(appId: $appId) {
                  id
                  updateChannelByName(name: $channelName) {
                    id
                    name
                    runtimeInsights {
                      id
                      embeddedUpdateTotalUniqueUsers(runtimeVersion: $runtimeVersion, timespan: $timespan)
                      mostPopularUpdates(runtimeVersion: $runtimeVersion, timespan: $timespan) {
                        id
                        group
                        message
                        runtimeVersion
                        platform
                        insights {
                          id
                          totalUniqueUsers(timespan: $timespan)
                        }
                      }
                      uniqueUsersOverTime(runtimeVersion: $runtimeVersion, timespan: $timespan) {
                        data {
                          labels
                          datasets {
                            id
                            label
                            data
                          }
                        }
                      }
                      cumulativeMetricsOverTime(runtimeVersion: $runtimeVersion, timespan: $timespan) {
                        data {
                          labels
                          datasets {
                            id
                            label
                            data
                          }
                        }
                        metricsAtLastTimestamp {
                          id
                          label
                          data
                        }
                      }
                    }
                  }
                }
              }
            }
          `, {
            appId,
            channelName,
            runtimeVersion,
            timespan: { start: startTime, end: endTime },
        }, { additionalTypenames: ['UpdateChannel', 'Update', 'UpdateChannelRuntimeInsights'] })
            .toPromise(), { featureName: 'EAS Update channel insights' });
        const updateChannel = data.app.byId.updateChannelByName;
        if (!updateChannel) {
            throw new errors_1.ChannelNotFoundError(`Could not find channel with the name ${channelName}`);
        }
        return updateChannel.runtimeInsights;
    },
};
