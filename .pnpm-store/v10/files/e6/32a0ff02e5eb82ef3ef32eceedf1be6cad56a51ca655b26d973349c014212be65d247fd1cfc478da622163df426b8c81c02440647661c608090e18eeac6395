"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterDevicesForApplePlatform = filterDevicesForApplePlatform;
exports.chooseDevicesAsync = chooseDevicesAsync;
exports.formatDeviceLabel = formatDeviceLabel;
const prompts_1 = require("../.././../prompts");
const generated_1 = require("../../../graphql/generated");
const AppleDevice_1 = require("../../../graphql/types/credentials/AppleDevice");
const constants_1 = require("../appstore/constants");
function filterDevicesForApplePlatform(devices, applePlatform) {
    if (applePlatform === constants_1.ApplePlatform.TV_OS) {
        throw new Error('Filtering for tvOS is not supported yet');
    }
    if (applePlatform === constants_1.ApplePlatform.VISION_OS) {
        throw new Error('Filtering for visionOS is not supported yet');
    }
    return devices.filter(device => isDeviceCompatibleWithApplePlatform(device, applePlatform));
}
function isDeviceCompatibleWithApplePlatform(device, applePlatform) {
    switch (applePlatform) {
        case constants_1.ApplePlatform.IOS:
            return (device.deviceClass === generated_1.AppleDeviceClass.Iphone ||
                device.deviceClass === generated_1.AppleDeviceClass.Ipad);
        case constants_1.ApplePlatform.MAC_OS:
            return device.deviceClass === generated_1.AppleDeviceClass.Mac;
    }
}
async function chooseDevicesAsync(allDevices, preselectedDeviceIdentifiers = []) {
    const preselectedDeviceIdentifierSet = new Set(preselectedDeviceIdentifiers);
    const isSelected = (device) => preselectedDeviceIdentifierSet.size === 0 ||
        preselectedDeviceIdentifierSet.has(device.identifier);
    const { devices } = await (0, prompts_1.promptAsync)({
        type: 'multiselect',
        name: 'devices',
        selectionFormat: '<num> devices selected',
        message: 'Select devices for the ad hoc build:',
        hint: '- Space to select. Return to submit',
        choices: allDevices.map(device => ({
            value: device,
            title: formatDeviceLabel(device),
            selected: isSelected(device),
        })),
        instructions: false,
        min: 1,
    });
    return devices;
}
function formatDeviceLabel(device) {
    const deviceDetails = formatDeviceDetails(device);
    return `${device.identifier}${deviceDetails !== '' ? ` ${deviceDetails}` : ''}${device.name ? ` (${device.name})` : ''}${device.createdAt ? ` (created at: ${device.createdAt})` : ''}`;
}
function formatDeviceDetails(device) {
    let details = '';
    if (device.deviceClass) {
        details += AppleDevice_1.APPLE_DEVICE_CLASS_LABELS[device.deviceClass];
    }
    if (device.model) {
        details += details === '' ? device.model : ` ${device.model}`;
    }
    return details === '' ? details : `(${details})`;
}
