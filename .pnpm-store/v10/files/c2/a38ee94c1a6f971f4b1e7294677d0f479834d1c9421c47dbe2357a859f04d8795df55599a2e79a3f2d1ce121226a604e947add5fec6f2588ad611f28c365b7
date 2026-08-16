"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInsightsQuery = void 0;
const tslib_1 = require("tslib");
const graphql_tag_1 = tslib_1.__importDefault(require("graphql-tag"));
const client_1 = require("../client");
exports.UpdateInsightsQuery = {
    async viewUpdateGroupInsightsAsync(graphqlClient, { groupId, startTime, endTime }) {
        const data = await (0, client_1.withUpgradeRequiredErrorHandlingAsync)(graphqlClient
            .query((0, graphql_tag_1.default) `
            query ViewUpdateGroupInsights($groupId: ID!, $timespan: InsightsTimespan!) {
              updatesByGroup(group: $groupId) {
                id
                platform
                insights {
                  id
                  totalUniqueUsers(timespan: $timespan)
                  cumulativeAverageMetrics {
                    launchAssetCount
                    averageUpdatePayloadBytes
                  }
                  cumulativeMetrics(timespan: $timespan) {
                    metricsAtLastTimestamp {
                      totalInstalls
                      totalFailedInstalls
                    }
                    data {
                      labels
                      installsDataset {
                        id
                        label
                        cumulative
                        difference
                      }
                      failedInstallsDataset {
                        id
                        label
                        cumulative
                        difference
                      }
                    }
                  }
                }
              }
            }
          `, { groupId, timespan: { start: startTime, end: endTime } }, { additionalTypenames: ['Update', 'UpdateInsights'] })
            .toPromise(), { featureName: 'EAS Update insights' });
        if (data.updatesByGroup.length === 0) {
            throw new Error(`Could not find any updates with group ID: "${groupId}"`);
        }
        return data.updatesByGroup;
    },
};
