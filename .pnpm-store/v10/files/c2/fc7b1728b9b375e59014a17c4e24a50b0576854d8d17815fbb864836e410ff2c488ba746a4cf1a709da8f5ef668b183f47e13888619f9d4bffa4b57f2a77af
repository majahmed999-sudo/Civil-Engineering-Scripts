"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBranchFromChannelNameAndCreateAndLinkIfNotExistsAsync = getBranchFromChannelNameAndCreateAndLinkIfNotExistsAsync;
const queries_1 = require("../branch/queries");
const errors_1 = require("../channel/errors");
const queries_2 = require("../channel/queries");
const ChannelQuery_1 = require("../graphql/queries/ChannelQuery");
async function getBranchFromChannelNameAndCreateAndLinkIfNotExistsAsync(graphqlClient, projectId, channelName) {
    let channel;
    try {
        channel = await ChannelQuery_1.ChannelQuery.viewUpdateChannelAsync(graphqlClient, {
            appId: projectId,
            channelName,
        });
    }
    catch (error) {
        if (!(error instanceof errors_1.ChannelNotFoundError)) {
            throw error;
        }
        return await createAndLinkBranchToChannelAsync(graphqlClient, projectId, channelName);
    }
    if (channel.updateBranches.length === 1) {
        const branch = channel.updateBranches[0];
        return { branchId: branch.id, branchName: branch.name };
    }
    if (channel.updateBranches.length === 0) {
        return await createAndLinkBranchToChannelAsync(graphqlClient, projectId, channelName);
    }
    throw new Error(`Channel has multiple branches associated with it. Instead, use '--branch' instead of '--channel'`);
}
async function createAndLinkBranchToChannelAsync(graphqlClient, projectId, channelName) {
    const { branch } = await (0, queries_1.ensureBranchExistsAsync)(graphqlClient, {
        appId: projectId,
        branchName: channelName,
    });
    await (0, queries_2.createChannelOnAppAsync)(graphqlClient, {
        appId: projectId,
        channelName,
        branchId: branch.id,
    });
    return { branchId: branch.id, branchName: channelName };
}
