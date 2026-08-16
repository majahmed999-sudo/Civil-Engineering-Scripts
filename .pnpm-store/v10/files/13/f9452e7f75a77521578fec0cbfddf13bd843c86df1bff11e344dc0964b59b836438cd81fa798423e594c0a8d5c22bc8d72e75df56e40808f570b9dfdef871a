"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const eas_build_job_1 = require("@expo/eas-build-job");
const config_plugins_1 = require("@expo/config-plugins");
const core_1 = require("@oclif/core");
const fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
const EasCommand_1 = tslib_1.__importDefault(require("../../../commandUtils/EasCommand"));
const flags_1 = require("../../../commandUtils/flags");
const EmbeddedUpdateAssetMutation_1 = require("../../../graphql/mutations/EmbeddedUpdateAssetMutation");
const EmbeddedUpdateMutation_1 = require("../../../graphql/mutations/EmbeddedUpdateMutation");
const AppPlatform_1 = require("../../../graphql/types/AppPlatform");
const log_1 = tslib_1.__importDefault(require("../../../log"));
const ora_1 = require("../../../ora");
const embeddedManifest_1 = require("../../../update/embeddedManifest");
const uploads_1 = require("../../../uploads");
const json_1 = require("../../../utils/json");
const promise_1 = require("../../../utils/promise");
const MAX_ATTEMPTS = 10;
const RETRY_BASE_DELAY_MS = 3_000;
const RETRY_MAX_DELAY_MS = 10_000;
class UpdateEmbeddedUpload extends EasCommand_1.default {
    static description = 'upload the JS bundle embedded in a native build so EAS Update can generate bsdiff patches against it';
    static examples = [
        '$ eas update:embedded:upload --platform ios --bundle ios/build/App.app/main.jsbundle --manifest ios/build/App.app/app.manifest --channel production',
        '$ eas update:embedded:upload --platform android --bundle android/app/src/main/assets/index.android.bundle --manifest android/app/src/main/assets/app.manifest --channel production --build-id <BUILD-ID>',
    ];
    static flags = {
        platform: core_1.Flags.option({
            char: 'p',
            description: 'Platform of the embedded bundle',
            options: [eas_build_job_1.Platform.IOS, eas_build_job_1.Platform.ANDROID],
            required: true,
        })(),
        bundle: core_1.Flags.string({
            description: 'Path to the embedded JS bundle file',
            required: true,
        }),
        manifest: core_1.Flags.string({
            description: 'Path to the app.manifest file embedded in the build',
            required: true,
        }),
        channel: core_1.Flags.string({
            description: 'Channel name the embedded update should be associated with',
            required: true,
        }),
        'build-id': core_1.Flags.string({
            description: 'EAS Build ID that produced this binary (required when invoked from EAS Build)',
            required: false,
        }),
        ...flags_1.EasNonInteractiveAndJsonFlags,
    };
    static contextDefinition = {
        ...this.ContextOptions.ProjectConfig,
    };
    async runAsync() {
        const { flags } = await this.parse(UpdateEmbeddedUpload);
        const { json: jsonFlag, nonInteractive } = (0, flags_1.resolveNonInteractiveAndJsonFlags)(flags);
        const platform = flags.platform;
        const bundlePath = flags.bundle;
        const manifestPath = flags.manifest;
        const channelName = flags.channel;
        const buildId = flags['build-id'];
        const { loggedIn: { graphqlClient }, privateProjectConfig: { projectId, exp, projectDir }, } = await this.getContextAsync(UpdateEmbeddedUpload, {
            nonInteractive,
            withServerSideEnvironment: null,
        });
        if (jsonFlag) {
            (0, json_1.enableJsonOutput)();
        }
        if (!(await fs_extra_1.default.pathExists(bundlePath))) {
            core_1.Errors.error(`Bundle file not found at "${bundlePath}". Check that the path is correct and points to the JS bundle in your native build output.`, { exit: 1 });
        }
        const { id: embeddedUpdateId } = await (0, embeddedManifest_1.readEmbeddedManifestAsync)(manifestPath);
        const runtimeVersion = await config_plugins_1.Updates.getRuntimeVersionNullableAsync(projectDir, exp, platform);
        if (runtimeVersion === null) {
            core_1.Errors.error(`Could not resolve runtimeVersion for platform "${platform}". ` +
                `Ensure runtimeVersion is set in your app.json under the expo key.`, { exit: 1 });
        }
        const appPlatform = (0, AppPlatform_1.toAppPlatform)(platform);
        const uploadSpinner = (0, ora_1.ora)('Uploading bundle...').start();
        const contentType = 'application/javascript';
        const uploadSpec = await EmbeddedUpdateAssetMutation_1.EmbeddedUpdateAssetMutation.getSignedUploadSpecAsync(graphqlClient, {
            appId: projectId,
            embeddedUpdateId,
            contentType,
        });
        await (0, uploads_1.uploadWithPresignedPostWithRetryAsync)(bundlePath, { url: uploadSpec.presignedUrl, fields: uploadSpec.fields }, () => { });
        uploadSpinner.succeed('Uploaded bundle');
        const registerSpinner = (0, ora_1.ora)('Registering embedded update...').start();
        let embeddedUpdate;
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                embeddedUpdate = await EmbeddedUpdateMutation_1.EmbeddedUpdateMutation.uploadEmbeddedUpdateAsync(graphqlClient, {
                    appId: projectId,
                    platform: appPlatform,
                    runtimeVersion,
                    channel: channelName,
                    embeddedUpdateId,
                    turtleBuildId: buildId,
                });
                break;
            }
            catch (e) {
                if ((0, EmbeddedUpdateMutation_1.isEmbeddedUpdateAssetNotAvailableError)(e)) {
                    if (attempt < MAX_ATTEMPTS) {
                        await (0, promise_1.sleepAsync)(Math.min(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1), RETRY_MAX_DELAY_MS));
                    }
                    continue;
                }
                registerSpinner.fail('Failed to register embedded update');
                if ((0, EmbeddedUpdateMutation_1.isEmbeddedUpdateAlreadyExistsError)(e)) {
                    core_1.Errors.error(`An embedded update with id "${embeddedUpdateId}" is already registered for this app. Delete it before re-uploading.`, { exit: 1 });
                }
                throw e;
            }
        }
        if (embeddedUpdate === undefined) {
            registerSpinner.fail('Failed to register embedded update');
            throw new Error('Embedded bundle could not be processed in time. Try re-running the command in a moment.');
        }
        registerSpinner.succeed(`Registered ${platform} embedded update (runtimeVersion: ${runtimeVersion}, channel: "${channelName}")`);
        log_1.default.log(`Embedded update ID: ${embeddedUpdate.id}`);
        if (jsonFlag) {
            (0, json_1.printJsonOnlyOutput)(embeddedUpdate);
        }
    }
}
exports.default = UpdateEmbeddedUpload;
