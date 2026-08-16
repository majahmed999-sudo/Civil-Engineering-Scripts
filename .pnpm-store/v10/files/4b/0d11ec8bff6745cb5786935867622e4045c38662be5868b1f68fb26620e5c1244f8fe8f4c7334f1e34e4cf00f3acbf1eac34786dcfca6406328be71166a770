"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreviewsTask = void 0;
const tslib_1 = require("tslib");
const apple_utils_1 = require("@expo/apple-utils");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const fetch_1 = tslib_1.__importDefault(require("../../../fetch"));
const log_1 = tslib_1.__importDefault(require("../../../log"));
const log_2 = require("../../utils/log");
const task_1 = require("../task");
/**
 * Normalize preview config to always return an object with path and optional previewFrameTimeCode.
 */
function normalizePreviewConfig(config) {
    if (typeof config === 'string') {
        return { path: config };
    }
    return config;
}
/**
 * Task for managing App Store video previews.
 * Downloads existing previews and uploads new ones based on store configuration.
 */
class PreviewsTask extends task_1.AppleTask {
    name = () => 'video previews';
    async prepareAsync({ context }) {
        // Initialize the preview sets map
        context.previewSets = new Map();
        if (!context.versionLocales) {
            return;
        }
        // Fetch preview sets for all locales in parallel
        await Promise.all(context.versionLocales.map(async (locale) => {
            const sets = await locale.getAppPreviewSetsAsync();
            const previewTypeMap = new Map();
            for (const set of sets) {
                previewTypeMap.set(set.attributes.previewType, set);
            }
            context.previewSets.set(locale.attributes.locale, previewTypeMap);
        }));
    }
    async downloadAsync({ config, context }) {
        if (!context.previewSets || !context.versionLocales) {
            return;
        }
        for (const locale of context.versionLocales) {
            const localeCode = locale.attributes.locale;
            const previewTypeMap = context.previewSets.get(localeCode);
            if (!previewTypeMap || previewTypeMap.size === 0) {
                continue;
            }
            const previews = {};
            for (const [previewType, set] of previewTypeMap) {
                const previewModels = set.attributes.appPreviews;
                if (!previewModels || previewModels.length === 0) {
                    continue;
                }
                // For now, we only handle the first preview per set (App Store allows up to 3)
                // We can extend this later to support multiple previews
                const preview = previewModels[0];
                const downloaded = await downloadPreviewAsync(context.projectDir, localeCode, previewType, preview, 0);
                // When the download succeeds, write the real path. When it fails
                // (e.g. the preview is in a broken AWAITING_UPLOAD state with no
                // rendered videoUrl), preserve the entry in config so the user can
                // either drop in a replacement file or remove the entry to delete
                // the broken ASC record.
                const fileName = preview.attributes.fileName || 'preview.mp4';
                const relativePath = downloaded || path_1.default.join('store', 'apple', 'preview', localeCode, previewType, fileName);
                if (preview.attributes.previewFrameTimeCode) {
                    previews[previewType] = {
                        path: relativePath,
                        previewFrameTimeCode: preview.attributes.previewFrameTimeCode,
                    };
                }
                else {
                    previews[previewType] = relativePath;
                }
            }
            if (Object.keys(previews).length > 0) {
                config.setPreviews(localeCode, previews);
            }
        }
    }
    async uploadAsync({ config, context }) {
        if (!context.previewSets || !context.versionLocales) {
            log_1.default.log((0, chalk_1.default) `{dim - Skipped video previews, no version available}`);
            return;
        }
        const locales = config.getLocales();
        if (locales.length <= 0) {
            log_1.default.log((0, chalk_1.default) `{dim - Skipped video previews, no locales configured}`);
            return;
        }
        for (const localeCode of locales) {
            const previews = config.getPreviews(localeCode);
            const existingSets = context.previewSets.get(localeCode);
            const localization = context.versionLocales.find(l => l.attributes.locale === localeCode);
            if (!localization) {
                log_1.default.warn((0, chalk_1.default) `{yellow Skipping video previews for ${localeCode} - locale not found}`);
                continue;
            }
            // Upload/sync configured previews
            if (previews) {
                for (const [previewType, previewConfig] of Object.entries(previews)) {
                    if (!previewConfig) {
                        continue;
                    }
                    if (!apple_utils_1.ALL_PREVIEW_TYPES.includes(previewType)) {
                        const strippedType = previewType.replace(/^APP_/, '');
                        const suggestion = apple_utils_1.ALL_PREVIEW_TYPES.includes(strippedType)
                            ? (0, chalk_1.default) ` Did you mean {bold ${strippedType}}? Preview types don't use the "APP_" prefix (that's only for screenshots).`
                            : '';
                        log_1.default.warn((0, chalk_1.default) `{yellow Unknown preview type {bold ${previewType}} for ${localeCode}, skipping.${suggestion}}`);
                        log_1.default.warn((0, chalk_1.default) `{yellow Valid preview types: ${apple_utils_1.ALL_PREVIEW_TYPES.join(', ')}}`);
                        continue;
                    }
                    await syncPreviewSetAsync(context.projectDir, localization, previewType, normalizePreviewConfig(previewConfig), existingSets);
                }
            }
            // Delete remote previews for types no longer in config
            if (existingSets) {
                for (const [previewType, previewSet] of existingSets) {
                    if (previews?.[previewType]) {
                        continue;
                    }
                    const existingPreviews = previewSet.attributes.appPreviews || [];
                    for (const preview of existingPreviews) {
                        await (0, log_2.logAsync)(() => preview.deleteAsync(), {
                            pending: `Deleting video preview ${chalk_1.default.bold(preview.attributes.fileName)} (${localeCode})...`,
                            success: `Deleted video preview ${chalk_1.default.bold(preview.attributes.fileName)} (${localeCode})`,
                            failure: `Failed deleting video preview ${chalk_1.default.bold(preview.attributes.fileName)} (${localeCode})`,
                        });
                    }
                }
            }
        }
    }
}
exports.PreviewsTask = PreviewsTask;
/**
 * Sync a preview set - upload new preview, delete old one if changed.
 */
async function syncPreviewSetAsync(projectDir, localization, previewType, previewConfig, existingSets) {
    const locale = localization.attributes.locale;
    const absolutePath = path_1.default.resolve(projectDir, previewConfig.path);
    const fileName = path_1.default.basename(absolutePath);
    if (!fs_1.default.existsSync(absolutePath)) {
        log_1.default.warn((0, chalk_1.default) `{yellow Video preview not found: ${absolutePath}}`);
        return;
    }
    // Get or create the preview set
    let previewSet = existingSets?.get(previewType);
    if (!previewSet) {
        previewSet = await (0, log_2.logAsync)(() => localization.createAppPreviewSetAsync({
            previewType,
        }), {
            pending: `Creating preview set for ${chalk_1.default.bold(previewType)} (${locale})...`,
            success: `Created preview set for ${chalk_1.default.bold(previewType)} (${locale})`,
            failure: `Failed creating preview set for ${chalk_1.default.bold(previewType)} (${locale})`,
        });
    }
    const existingPreviews = previewSet.attributes.appPreviews || [];
    // Check if we need to update (different filename, size, or no existing preview)
    const existingPreview = existingPreviews.find(p => p.attributes.fileName === fileName);
    const localSize = fs_1.default.statSync(absolutePath).size;
    if (existingPreview &&
        existingPreview.isComplete() &&
        existingPreview.attributes.fileSize === localSize) {
        // Preview with same filename exists, check if we need to update preview frame time code
        if (previewConfig.previewFrameTimeCode &&
            existingPreview.attributes.previewFrameTimeCode !== previewConfig.previewFrameTimeCode) {
            await (0, log_2.logAsync)(() => existingPreview.updateAsync({
                previewFrameTimeCode: previewConfig.previewFrameTimeCode,
            }), {
                pending: `Updating preview frame time code for ${chalk_1.default.bold(fileName)} (${locale})...`,
                success: `Updated preview frame time code for ${chalk_1.default.bold(fileName)} (${locale})`,
                failure: `Failed updating preview frame time code for ${chalk_1.default.bold(fileName)} (${locale})`,
            });
        }
        log_1.default.log((0, chalk_1.default) `{dim Preview ${fileName} already exists, skipping upload}`);
        return;
    }
    // Delete all existing previews before uploading the new one.
    // Apple limits each set to 3 previews, and we manage one preview per set,
    // so we need to clean up stale entries to avoid "Too many app previews" errors.
    for (const preview of existingPreviews) {
        await (0, log_2.logAsync)(() => preview.deleteAsync(), {
            pending: `Deleting old preview ${chalk_1.default.bold(preview.attributes.fileName)} (${locale})...`,
            success: `Deleted old preview ${chalk_1.default.bold(preview.attributes.fileName)} (${locale})`,
            failure: `Failed deleting old preview ${chalk_1.default.bold(preview.attributes.fileName)} (${locale})`,
        });
    }
    // Upload new preview
    await (0, log_2.logAsync)(() => apple_utils_1.AppPreview.uploadAsync(localization.context, {
        id: previewSet.id,
        filePath: absolutePath,
        waitForProcessing: true,
        previewFrameTimeCode: previewConfig.previewFrameTimeCode,
    }), {
        pending: `Uploading video preview ${chalk_1.default.bold(fileName)} (${locale})...`,
        success: `Uploaded video preview ${chalk_1.default.bold(fileName)} (${locale})`,
        failure: `Failed uploading video preview ${chalk_1.default.bold(fileName)} (${locale})`,
    });
}
/**
 * Download a video preview to the local filesystem.
 * Returns the relative path to the downloaded file.
 */
async function downloadPreviewAsync(projectDir, locale, previewType, preview, index) {
    const videoUrl = preview.getVideoUrl();
    if (!videoUrl) {
        log_1.default.warn((0, chalk_1.default) `{yellow Could not get download URL for preview ${preview.attributes.fileName}}`);
        return null;
    }
    // Create directory structure: store/apple/preview/{locale}/{previewType}/
    const previewsDir = path_1.default.join(projectDir, 'store', 'apple', 'preview', locale, previewType);
    await fs_1.default.promises.mkdir(previewsDir, { recursive: true });
    // Use original filename for matching during sync
    const fileName = preview.attributes.fileName || `${String(index + 1).padStart(2, '0')}.mp4`;
    const outputPath = path_1.default.join(previewsDir, fileName);
    const relativePath = path_1.default.relative(projectDir, outputPath);
    try {
        const response = await (0, fetch_1.default)(videoUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const buffer = await response.buffer();
        await fs_1.default.promises.writeFile(outputPath, buffer);
        log_1.default.log((0, chalk_1.default) `{dim Downloaded video preview: ${relativePath}}`);
        return relativePath;
    }
    catch (error) {
        log_1.default.warn((0, chalk_1.default) `{yellow Failed to download video preview ${fileName}: ${error.message}}`);
        return null;
    }
}
