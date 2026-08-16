"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppClipTask = void 0;
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
 * Task for managing App Clip metadata (default experience, localized
 * subtitles + header images, App Store review invocation URLs).
 *
 * No-op when the app does not have an App Clip target.
 */
class AppClipTask extends task_1.AppleTask {
    name = () => 'app clip';
    async prepareAsync({ context }) {
        context.appClip = null;
        context.appClipDefaultExperience = null;
        context.appClipTemplateExperience = null;
        context.appClipLocalizations = new Map();
        context.appClipHeaderImages = new Map();
        context.appClipReviewDetail = null;
        const appClips = await context.app.getAppClipsAsync();
        if (appClips.length === 0) {
            return;
        }
        // Apps may have multiple App Clip bundles registered. Pick the first
        // clip that has any default experiences attached.
        let chosenClip = null;
        let allExperiences = [];
        for (const clip of appClips) {
            const experiences = await clip.getAppClipDefaultExperiencesAsync();
            if (experiences.length > 0) {
                chosenClip = clip;
                allExperiences = experiences;
                break;
            }
        }
        chosenClip ??= appClips[0];
        context.appClip = chosenClip;
        if (allExperiences.length === 0) {
            return;
        }
        // App Clip default experiences are versioned per app store version. Find
        // the experience linked to the current editable version. Fall back to the
        // first experience as a template (used as the source of truth on pull
        // when the current version has no experience yet, and as a template when
        // creating a new experience on push).
        const currentVersionId = context.version?.id;
        const currentVersionExperience = currentVersionId
            ? (allExperiences.find(exp => exp.attributes.releaseWithAppStoreVersion?.id === currentVersionId) ?? null)
            : null;
        context.appClipDefaultExperience = currentVersionExperience;
        // The template is only used when we need to CREATE a new default
        // experience for the current version on push — pick any other existing
        // experience (most recent first by sort order). When the current version
        // already has an experience, no template is needed.
        context.appClipTemplateExperience = currentVersionExperience
            ? null
            : (allExperiences[0] ?? null);
        // Use the current version's experience for downstream data when present;
        // otherwise fall back to the template so `metadata:pull` still produces a
        // populated `store.config.json`.
        const sourceExperience = currentVersionExperience ?? context.appClipTemplateExperience;
        if (!sourceExperience) {
            return;
        }
        const [localizations, reviewDetail] = await Promise.all([
            sourceExperience.getAppClipDefaultExperienceLocalizationsAsync(),
            sourceExperience.getAppClipAppStoreReviewDetailAsync(),
        ]);
        for (const localization of localizations) {
            context.appClipLocalizations.set(localization.attributes.locale, localization);
        }
        context.appClipReviewDetail = reviewDetail;
        // Header images may be missing from the included payload depending on
        // ASC's whims; fetch any that weren't pre-populated.
        await Promise.all(localizations.map(async (localization) => {
            const included = localization.attributes.appClipHeaderImage;
            if (included) {
                context.appClipHeaderImages.set(localization.attributes.locale, included);
                return;
            }
            const headerImage = await localization.getAppClipHeaderImageAsync();
            if (headerImage) {
                context.appClipHeaderImages.set(localization.attributes.locale, headerImage);
            }
        }));
    }
    async downloadAsync({ config, context }) {
        // Pull data from the current version's experience when present, otherwise
        // fall back to the template experience. The localizations and review
        // detail in `context` were populated from whichever was used.
        const experience = context.appClipDefaultExperience ?? context.appClipTemplateExperience;
        if (!experience) {
            return;
        }
        config.setAppClipDefaultExperience({
            action: experience.attributes.action ?? undefined,
            // ASC does not expose `releaseWithAppStoreVersion` directly on the
            // attributes — it's a relationship. We treat presence of an included
            // version as `true`. When unset we leave the field undefined so the
            // serializer omits it.
            releaseWithAppStoreVersion: experience.attributes.releaseWithAppStoreVersion != null ? true : undefined,
        });
        const reviewDetail = context.appClipReviewDetail;
        if (reviewDetail?.attributes.invocationUrls?.length) {
            config.setAppClipReviewDetail({
                invocationUrls: reviewDetail.attributes.invocationUrls,
            });
        }
        else {
            config.setAppClipReviewDetail(null);
        }
        for (const [locale, localization] of context.appClipLocalizations) {
            const headerImage = context.appClipHeaderImages.get(locale);
            let headerImagePath;
            if (headerImage) {
                const downloaded = await downloadAppClipHeaderImageAsync(context.projectDir, locale, headerImage);
                if (downloaded) {
                    headerImagePath = downloaded;
                }
                else {
                    // Image exists in ASC but isn't downloadable yet (still processing,
                    // or Apple's CDN hasn't caught up). Preserve the expected local path
                    // so subsequent pushes don't try to delete the in-progress upload.
                    // Filename match in syncAppClipHeaderImageAsync will skip re-upload.
                    const fileName = headerImage.attributes.fileName || 'header.png';
                    headerImagePath = path_1.default.join('store', 'apple', 'app-clip', locale, fileName);
                }
            }
            config.setAppClipLocalizedInfo(locale, {
                subtitle: localization.attributes.subtitle ?? undefined,
                headerImage: headerImagePath,
            });
        }
    }
    async uploadAsync({ config, context }) {
        const desired = config.getAppClipDefaultExperience();
        if (!desired) {
            log_1.default.log((0, chalk_1.default) `{dim - Skipped app clip, not configured}`);
            return;
        }
        if (!context.appClip) {
            log_1.default.warn((0, chalk_1.default) `{yellow Skipping app clip - no App Clip is registered for this app in App Store Connect}`);
            return;
        }
        if (!context.version) {
            log_1.default.warn((0, chalk_1.default) `{yellow Skipping app clip - no editable app store version available}`);
            return;
        }
        // App Clip default experiences are versioned per app store version. If
        // the current editable version doesn't have one yet, create a new one,
        // optionally cloning the most recent prior experience as a template.
        let experience = context.appClipDefaultExperience;
        // We always link the default experience to the current editable version,
        // regardless of whether the user opted into `releaseWithAppStoreVersion`
        // — every default experience must belong to a version in ASC.
        const releaseWithAppStoreVersionId = context.version.id;
        if (!experience) {
            const appClipId = context.appClip.id;
            const templateId = context.appClipTemplateExperience?.id;
            experience = await (0, log_2.logAsync)(() => apple_utils_1.AppClipDefaultExperience.createAsync(context.app.context, {
                appClipId,
                releaseWithAppStoreVersionId,
                appClipDefaultExperienceTemplateId: templateId,
                attributes: { action: desired.action ?? null },
            }), {
                pending: templateId
                    ? `Creating App Clip default experience for ${chalk_1.default.bold(context.version.attributes.versionString)} (cloned from previous version)...`
                    : `Creating App Clip default experience for ${chalk_1.default.bold(context.version.attributes.versionString)}...`,
                success: `Created App Clip default experience for ${chalk_1.default.bold(context.version.attributes.versionString)}`,
                failure: `Failed creating App Clip default experience for ${chalk_1.default.bold(context.version.attributes.versionString)}`,
            });
            context.appClipDefaultExperience = experience;
            // Apple cloned the previous experience's localizations + review detail
            // into the new experience. Re-fetch them so subsequent diff/sync logic
            // operates on the new resource ids.
            const [localizations, reviewDetail] = await Promise.all([
                experience.getAppClipDefaultExperienceLocalizationsAsync(),
                experience.getAppClipAppStoreReviewDetailAsync(),
            ]);
            context.appClipLocalizations = new Map();
            context.appClipHeaderImages = new Map();
            for (const localization of localizations) {
                context.appClipLocalizations.set(localization.attributes.locale, localization);
                const included = localization.attributes.appClipHeaderImage;
                if (included) {
                    context.appClipHeaderImages.set(localization.attributes.locale, included);
                }
                else {
                    const headerImage = await localization.getAppClipHeaderImageAsync();
                    if (headerImage) {
                        context.appClipHeaderImages.set(localization.attributes.locale, headerImage);
                    }
                }
            }
            context.appClipReviewDetail = reviewDetail;
        }
        else {
            const currentAction = experience.attributes.action ?? null;
            const desiredAction = desired.action ?? null;
            // Apple rejects PATCHes on `action` once the linked app store version is
            // locked (in review / released). Skip the call when nothing actually
            // changed to avoid spurious failures on round-trip pushes.
            if (currentAction !== desiredAction) {
                const existing = experience;
                experience = await (0, log_2.logAsync)(() => existing.updateAsync({
                    action: desiredAction,
                    releaseWithAppStoreVersionId: desired.releaseWithAppStoreVersion
                        ? (releaseWithAppStoreVersionId ?? null)
                        : null,
                }), {
                    pending: 'Updating App Clip default experience...',
                    success: 'Updated App Clip default experience',
                    failure: 'Failed updating App Clip default experience',
                });
                context.appClipDefaultExperience = experience;
            }
            else {
                log_1.default.log((0, chalk_1.default) `{dim - Skipped App Clip default experience, no changes}`);
            }
        }
        // Sync App Store review detail (invocation URLs).
        const desiredReview = desired.reviewDetail;
        if (desiredReview && desiredReview.invocationUrls.length > 0) {
            if (context.appClipReviewDetail) {
                const currentUrls = context.appClipReviewDetail.attributes.invocationUrls ?? [];
                const desiredUrls = desiredReview.invocationUrls;
                const unchanged = currentUrls.length === desiredUrls.length &&
                    currentUrls.every((url, i) => url === desiredUrls[i]);
                if (!unchanged) {
                    const existingReview = context.appClipReviewDetail;
                    context.appClipReviewDetail = await (0, log_2.logAsync)(() => existingReview.updateAsync({
                        invocationUrls: desiredUrls,
                    }), {
                        pending: 'Updating App Clip review invocation URLs...',
                        success: 'Updated App Clip review invocation URLs',
                        failure: 'Failed updating App Clip review invocation URLs',
                    });
                }
            }
            else {
                context.appClipReviewDetail = await (0, log_2.logAsync)(() => apple_utils_1.AppClipAppStoreReviewDetail.createAsync(context.app.context, {
                    appClipDefaultExperienceId: experience.id,
                    attributes: { invocationUrls: desiredReview.invocationUrls },
                }), {
                    pending: 'Creating App Clip review invocation URLs...',
                    success: 'Created App Clip review invocation URLs',
                    failure: 'Failed creating App Clip review invocation URLs',
                });
            }
        }
        else if (context.appClipReviewDetail) {
            await (0, log_2.logAsync)(() => context.appClipReviewDetail.deleteAsync(), {
                pending: 'Removing App Clip review invocation URLs...',
                success: 'Removed App Clip review invocation URLs',
                failure: 'Failed removing App Clip review invocation URLs',
            });
            context.appClipReviewDetail = null;
        }
        // Sync localizations: create/update from config, delete locales that
        // exist in ASC but were removed from the config.
        const desiredLocales = config.getAppClipLocales();
        const desiredLocaleSet = new Set(desiredLocales);
        for (const locale of desiredLocales) {
            const desiredInfo = config.getAppClipLocalizedInfo(locale);
            if (!desiredInfo) {
                continue;
            }
            let localization = context.appClipLocalizations.get(locale);
            if (!localization) {
                localization = await (0, log_2.logAsync)(() => experience.createAppClipDefaultExperienceLocalizationAsync({
                    locale,
                    subtitle: desiredInfo.subtitle ?? null,
                }), {
                    pending: `Creating App Clip localization for ${chalk_1.default.bold(locale)}...`,
                    success: `Created App Clip localization for ${chalk_1.default.bold(locale)}`,
                    failure: `Failed creating App Clip localization for ${chalk_1.default.bold(locale)}`,
                });
                context.appClipLocalizations.set(locale, localization);
            }
            else if (localization.attributes.subtitle !== (desiredInfo.subtitle ?? null)) {
                localization = await (0, log_2.logAsync)(() => localization.updateAsync({ subtitle: desiredInfo.subtitle ?? null }), {
                    pending: `Updating App Clip localization for ${chalk_1.default.bold(locale)}...`,
                    success: `Updated App Clip localization for ${chalk_1.default.bold(locale)}`,
                    failure: `Failed updating App Clip localization for ${chalk_1.default.bold(locale)}`,
                });
                context.appClipLocalizations.set(locale, localization);
            }
            // Sync header image.
            await syncAppClipHeaderImageAsync({
                projectDir: context.projectDir,
                localization,
                existing: context.appClipHeaderImages.get(locale),
                desiredPath: desiredInfo.headerImage,
                onUploaded: image => context.appClipHeaderImages.set(locale, image),
                onDeleted: () => context.appClipHeaderImages.delete(locale),
            });
        }
        // Delete localizations no longer in config.
        for (const [locale, localization] of context.appClipLocalizations) {
            if (!desiredLocaleSet.has(locale)) {
                await (0, log_2.logAsync)(() => localization.deleteAsync(), {
                    pending: `Deleting App Clip localization for ${chalk_1.default.bold(locale)}...`,
                    success: `Deleted App Clip localization for ${chalk_1.default.bold(locale)}`,
                    failure: `Failed deleting App Clip localization for ${chalk_1.default.bold(locale)}`,
                });
                context.appClipLocalizations.delete(locale);
                context.appClipHeaderImages.delete(locale);
            }
        }
    }
}
exports.AppClipTask = AppClipTask;
/**
 * Upload, replace, or delete the header image for a single App Clip
 * localization based on the desired config path.
 */
async function syncAppClipHeaderImageAsync({ projectDir, localization, existing, desiredPath, onUploaded, onDeleted, }) {
    const locale = localization.attributes.locale;
    if (!desiredPath) {
        if (existing) {
            await (0, log_2.logAsync)(() => existing.deleteAsync(), {
                pending: `Deleting App Clip header image for ${chalk_1.default.bold(locale)}...`,
                success: `Deleted App Clip header image for ${chalk_1.default.bold(locale)}`,
                failure: `Failed deleting App Clip header image for ${chalk_1.default.bold(locale)}`,
            });
            onDeleted();
        }
        return;
    }
    const absolutePath = path_1.default.resolve(projectDir, desiredPath);
    if (!fs_1.default.existsSync(absolutePath)) {
        log_1.default.warn((0, chalk_1.default) `{yellow App Clip header image not found: ${absolutePath}}`);
        return;
    }
    const fileName = path_1.default.basename(absolutePath);
    // Skip upload if the existing image already has the same filename and is
    // either fully processed or still being processed (i.e. anything that
    // isn't AWAITING_UPLOAD or FAILED). Apple does not expose the original
    // source bytes (only re-rendered copies), so we can't reliably compare
    // file size or checksum after a round-trip pull — filename is the only
    // stable identity available.
    if (existing &&
        !existing.isAwaitingUpload() &&
        !existing.isFailed() &&
        existing.attributes.fileName === fileName) {
        return;
    }
    if (existing) {
        await (0, log_2.logAsync)(() => existing.deleteAsync(), {
            pending: `Replacing App Clip header image for ${chalk_1.default.bold(locale)}...`,
            success: `Removed previous App Clip header image for ${chalk_1.default.bold(locale)}`,
            failure: `Failed removing previous App Clip header image for ${chalk_1.default.bold(locale)}`,
        });
        onDeleted();
    }
    const uploaded = await (0, log_2.logAsync)(() => apple_utils_1.AppClipHeaderImage.uploadAsync(localization.context, {
        id: localization.id,
        filePath: absolutePath,
        waitForProcessing: true,
    }), {
        pending: `Uploading App Clip header image ${chalk_1.default.bold(fileName)} (${locale})...`,
        success: `Uploaded App Clip header image ${chalk_1.default.bold(fileName)} (${locale})`,
        failure: `Failed uploading App Clip header image ${chalk_1.default.bold(fileName)} (${locale})`,
    });
    onUploaded(uploaded);
}
/**
 * Download an App Clip header image to the local filesystem.
 * Returns the relative path to the downloaded file, or null on failure.
 */
async function downloadAppClipHeaderImageAsync(projectDir, locale, headerImage) {
    const imageUrl = headerImage.getImageAssetUrl({ type: 'png' });
    if (!imageUrl) {
        log_1.default.warn((0, chalk_1.default) `{yellow Could not get download URL for App Clip header image (${locale})}`);
        return null;
    }
    const targetDir = path_1.default.join(projectDir, 'store', 'apple', 'app-clip', locale);
    await fs_1.default.promises.mkdir(targetDir, { recursive: true });
    const fileName = headerImage.attributes.fileName || 'header.png';
    const outputPath = path_1.default.join(targetDir, fileName);
    const relativePath = path_1.default.relative(projectDir, outputPath);
    try {
        const response = await (0, fetch_1.default)(imageUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const buffer = await response.buffer();
        await fs_1.default.promises.writeFile(outputPath, buffer);
        log_1.default.log((0, chalk_1.default) `{dim Downloaded App Clip header image: ${relativePath}}`);
        return relativePath;
    }
    catch (error) {
        log_1.default.warn((0, chalk_1.default) `{yellow Failed to download App Clip header image (${locale}): ${error.message}}`);
        return null;
    }
}
