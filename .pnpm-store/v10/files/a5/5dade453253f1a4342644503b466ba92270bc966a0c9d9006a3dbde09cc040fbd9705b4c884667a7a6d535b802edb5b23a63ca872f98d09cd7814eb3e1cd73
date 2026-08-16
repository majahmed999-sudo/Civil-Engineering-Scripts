"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectOrCreateAscApiKeyIdAsync = selectOrCreateAscApiKeyIdAsync;
const prompts_1 = require("../../prompts");
const AscApiKeyUtils_1 = require("../../credentials/ios/actions/AscApiKeyUtils");
async function selectOrCreateAscApiKeyIdAsync({ credentialsContext, existingKeys, ownerAccount, }) {
    const sortedKeys = (0, AscApiKeyUtils_1.sortAscApiKeysByUpdatedAtDesc)(existingKeys);
    const createKeyOption = {
        title: '[Create or upload a new API key]',
        value: '__create_new_key__',
    };
    const selectedValue = sortedKeys.length === 0
        ? createKeyOption.value
        : await (0, prompts_1.selectAsync)('Select an App Store Connect API key:', [
            ...sortedKeys.map(key => ({
                title: (0, AscApiKeyUtils_1.formatAscApiKey)(key),
                value: key.id,
            })),
            createKeyOption,
        ]);
    if (selectedValue !== createKeyOption.value) {
        return selectedValue;
    }
    const newKey = await credentialsContext.ios.createAscApiKeyAsync(credentialsContext.graphqlClient, ownerAccount, await (0, AscApiKeyUtils_1.provideOrGenerateAscApiKeyAsync)(credentialsContext, AscApiKeyUtils_1.AppStoreApiKeyPurpose.ASC_APP_CONNECTION));
    return newKey.id;
}
