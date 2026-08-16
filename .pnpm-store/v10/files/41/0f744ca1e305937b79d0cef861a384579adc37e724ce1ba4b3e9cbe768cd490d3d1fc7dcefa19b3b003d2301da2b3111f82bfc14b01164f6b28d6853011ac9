"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenshotsTask = void 0;
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
 * Task for managing App Store screenshots.
 * Downloads existing screenshots and uploads new ones based on store configuration.
 */
class ScreenshotsTask extends task_1.AppleTask {
    name = () => 'screenshots';
    async prepareAsync({ context }) {
        // Initialize the screenshot sets map
        context.screenshotSets = new Map();
        if (!context.versionLocales) {
            return;
        }
        // Fetch screenshot sets for all locales in parallel
        await Promise.all(context.versionLocales.map(async (locale) => {
            const sets = await locale.getAppScreenshotSetsAsync();
            const displayTypeMap = new Map();
            for (const set of sets) {
                displayTypeMap.set(set.attributes.screenshotDisplayType, set);
            }
            context.screenshotSets.set(locale.attributes.locale, displayTypeMap);
        }));
    }
    async downloadAsync({ config, context }) {
        if (!context.screenshotSets || !context.versionLocales) {
            return;
        }
        for (const locale of context.versionLocales) {
            const localeCode = locale.attributes.locale;
            const displayTypeMap = context.screenshotSets.get(localeCode);
            if (!displayTypeMap || displayTypeMap.size === 0) {
                continue;
            }
            const screenshots = {};
            for (const [displayType, set] of displayTypeMap) {
                const screenshotModels = set.attributes.appScreenshots;
                if (!screenshotModels || screenshotModels.length === 0) {
                    continue;
                }
                // Download screenshots and save to local filesystem. When a screenshot
                // is in a broken state (AWAITING_UPLOAD with no rendered imageAsset)
                // the download will fail, but we still preserve the entry pointing at
                // its expected local path so users can either drop in a replacement
                // file or remove the entry to delete the broken ASC record.
                const paths = [];
                for (let i = 0; i < screenshotModels.length; i++) {
                    const screenshot = screenshotModels[i];
                    const downloaded = await downloadScreenshotAsync(context.projectDir, localeCode, displayType, screenshot, i);
                    if (downloaded) {
                        paths.push(downloaded);
                        continue;
                    }
                    // Fall back to a placeholder path so the entry isn't lost from
                    // config. Push will detect that the existing screenshot isn't
                    // complete and either re-upload (if a local file exists at this
                    // path) or warn and skip (if it doesn't).
                    const fileName = screenshot.attributes.fileName || `${String(i + 1).padStart(2, '0')}.png`;
                    paths.push(path_1.default.join('store', 'apple', 'screenshot', localeCode, displayType, fileName));
                }
                if (paths.length > 0) {
                    screenshots[displayType] = paths;
                }
            }
            if (Object.keys(screenshots).length > 0) {
                config.setScreenshots(localeCode, screenshots);
            }
        }
    }
    async uploadAsync({ config, context }) {
        if (!context.screenshotSets || !context.versionLocales) {
            log_1.default.log((0, chalk_1.default) `{dim - Skipped screenshots, no version available}`);
            return;
        }
        const locales = config.getLocales();
        if (locales.length <= 0) {
            log_1.default.log((0, chalk_1.default) `{dim - Skipped screenshots, no locales configured}`);
            return;
        }
        for (const localeCode of locales) {
            const screenshots = config.getScreenshots(localeCode);
            if (!screenshots || Object.keys(screenshots).length === 0) {
                continue;
            }
            const localization = context.versionLocales.find(l => l.attributes.locale === localeCode);
            if (!localization) {
                log_1.default.warn((0, chalk_1.default) `{yellow Skipping screenshots for ${localeCode} - locale not found}`);
                continue;
            }
            for (const [displayType, paths] of Object.entries(screenshots)) {
                if (!paths || paths.length === 0) {
                    continue;
                }
                await syncScreenshotSetAsync(context.projectDir, localization, displayType, paths, context.screenshotSets.get(localeCode));
            }
        }
    }
}
exports.ScreenshotsTask = ScreenshotsTask;
/**
 * Sync a screenshot set - upload new screenshots, delete removed ones, reorder if needed.
 */
async function syncScreenshotSetAsync(projectDir, localization, displayType, paths, existingSets) {
    const locale = localization.attributes.locale;
    // Get or create the screenshot set
    let screenshotSet = existingSets?.get(displayType);
    if (!screenshotSet) {
        screenshotSet = await (0, log_2.logAsync)(() => localization.createAppScreenshotSetAsync({
            screenshotDisplayType: displayType,
        }), {
            pending: `Creating screenshot set for ${chalk_1.default.bold(displayType)} (${locale})...`,
            success: `Created screenshot set for ${chalk_1.default.bold(displayType)} (${locale})`,
            failure: `Failed creating screenshot set for ${chalk_1.default.bold(displayType)} (${locale})`,
        });
    }
    const existingScreenshots = screenshotSet.attributes.appScreenshots || [];
    // Build a map of existing screenshots by filename for comparison
    const existingByFilename = new Map();
    for (const screenshot of existingScreenshots) {
        existingByFilename.set(screenshot.attributes.fileName, screenshot);
    }
    // Track which screenshots to keep, upload, and delete
    const screenshotIdsToKeep = [];
    const pathsToUpload = [];
    for (const relativePath of paths) {
        const absolutePath = path_1.default.resolve(projectDir, relativePath);
        const fileName = path_1.default.basename(absolutePath);
        // Check if screenshot already exists with same name and file size
        const existing = existingByFilename.get(fileName);
        const localSize = fs_1.default.existsSync(absolutePath) ? fs_1.default.statSync(absolutePath).size : null;
        if (existing &&
            existing.isComplete() &&
            (localSize === null || existing.attributes.fileSize === localSize)) {
            screenshotIdsToKeep.push(existing.id);
            existingByFilename.delete(fileName);
        }
        else {
            pathsToUpload.push(absolutePath);
        }
    }
    // Delete screenshots that are no longer in config
    for (const screenshot of existingByFilename.values()) {
        await (0, log_2.logAsync)(() => screenshot.deleteAsync(), {
            pending: `Deleting screenshot ${chalk_1.default.bold(screenshot.attributes.fileName)} (${locale})...`,
            success: `Deleted screenshot ${chalk_1.default.bold(screenshot.attributes.fileName)} (${locale})`,
            failure: `Failed deleting screenshot ${chalk_1.default.bold(screenshot.attributes.fileName)} (${locale})`,
        });
    }
    // Upload new screenshots
    for (const absolutePath of pathsToUpload) {
        const fileName = path_1.default.basename(absolutePath);
        if (!fs_1.default.existsSync(absolutePath)) {
            log_1.default.warn((0, chalk_1.default) `{yellow Screenshot not found: ${absolutePath}}`);
            continue;
        }
        const newScreenshot = await (0, log_2.logAsync)(() => apple_utils_1.AppScreenshot.uploadAsync(localization.context, {
            id: screenshotSet.id,
            filePath: absolutePath,
            waitForProcessing: true,
        }), {
            pending: `Uploading screenshot ${chalk_1.default.bold(fileName)} (${locale})...`,
            success: `Uploaded screenshot ${chalk_1.default.bold(fileName)} (${locale})`,
            failure: `Failed uploading screenshot ${chalk_1.default.bold(fileName)} (${locale})`,
        });
        screenshotIdsToKeep.push(newScreenshot.id);
    }
    // Reorder screenshots to match config order
    if (screenshotIdsToKeep.length > 0) {
        const refreshedSet = await apple_utils_1.AppScreenshotSet.infoAsync(localization.context, {
            id: screenshotSet.id,
        });
        const refreshedScreenshots = refreshedSet.attributes.appScreenshots || [];
        const screenshotsByFilename = new Map();
        for (const s of refreshedScreenshots) {
            screenshotsByFilename.set(s.attributes.fileName, s);
        }
        // Build the desired order based on config paths
        const orderedIds = [];
        for (const relativePath of paths) {
            const fileName = path_1.default.basename(relativePath);
            const screenshot = screenshotsByFilename.get(fileName);
            if (screenshot) {
                orderedIds.push(screenshot.id);
            }
        }
        // Only call reorder if the order actually differs from current
        const currentIds = refreshedScreenshots.map(s => s.id);
        if (orderedIds.length > 0 &&
            (orderedIds.length !== currentIds.length || orderedIds.some((id, i) => id !== currentIds[i]))) {
            await screenshotSet.reorderScreenshotsAsync({ appScreenshots: orderedIds });
        }
    }
}
/**
 * Download a screenshot to the local filesystem.
 * Returns the relative path to the downloaded file.
 */
async function downloadScreenshotAsync(projectDir, locale, displayType, screenshot, index) {
    const imageUrl = screenshot.getImageAssetUrl({ type: 'png' });
    if (!imageUrl) {
        log_1.default.warn((0, chalk_1.default) `{yellow Could not get download URL for screenshot ${screenshot.attributes.fileName}}`);
        return null;
    }
    // Create directory structure: store/apple/screenshot/{locale}/{displayType}/
    const screenshotsDir = path_1.default.join(projectDir, 'store', 'apple', 'screenshot', locale, displayType);
    await fs_1.default.promises.mkdir(screenshotsDir, { recursive: true });
    // Use original filename for matching during sync
    const fileName = screenshot.attributes.fileName || `${String(index + 1).padStart(2, '0')}.png`;
    const outputPath = path_1.default.join(screenshotsDir, fileName);
    const relativePath = path_1.default.relative(projectDir, outputPath);
    try {
        const response = await (0, fetch_1.default)(imageUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const buffer = await response.buffer();
        await fs_1.default.promises.writeFile(outputPath, buffer);
        log_1.default.log((0, chalk_1.default) `{dim Downloaded screenshot: ${relativePath}}`);
        return relativePath;
    }
    catch (error) {
        log_1.default.warn((0, chalk_1.default) `{yellow Failed to download screenshot ${fileName}: ${error.message}}`);
        return null;
    }
}
