"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppleConfigWriter = void 0;
const apple_utils_1 = require("@expo/apple-utils");
/**
 * Serializes the Apple ASC entities into the metadata configuration schema.
 * This uses version 0 of the config schema.
 */
class AppleConfigWriter {
    schema;
    constructor(schema = {}) {
        this.schema = schema;
    }
    /** Get the schema result to write it to the config file */
    toSchema() {
        return {
            configVersion: 0,
            apple: this.schema,
        };
    }
    // Note, both `seventeenPlus` and `gamlingAndContests` are deprecated
    setAgeRating(attributes) {
        this.schema.advisory = {
            ageRatingOverride: attributes.ageRatingOverride ?? apple_utils_1.RatingOverride.NONE,
            alcoholTobaccoOrDrugUseOrReferences: attributes.alcoholTobaccoOrDrugUseOrReferences ?? apple_utils_1.Rating.NONE,
            contests: attributes.contests ?? apple_utils_1.Rating.NONE,
            gambling: attributes.gambling ?? false,
            gamblingSimulated: attributes.gamblingSimulated ?? apple_utils_1.Rating.NONE,
            horrorOrFearThemes: attributes.horrorOrFearThemes ?? apple_utils_1.Rating.NONE,
            kidsAgeBand: attributes.kidsAgeBand ?? null,
            koreaAgeRatingOverride: attributes.koreaAgeRatingOverride ?? apple_utils_1.KoreaRatingOverride.NONE,
            lootBox: attributes.lootBox ?? false,
            matureOrSuggestiveThemes: attributes.matureOrSuggestiveThemes ?? apple_utils_1.Rating.NONE,
            medicalOrTreatmentInformation: attributes.medicalOrTreatmentInformation ?? apple_utils_1.Rating.NONE,
            profanityOrCrudeHumor: attributes.profanityOrCrudeHumor ?? apple_utils_1.Rating.NONE,
            sexualContentGraphicAndNudity: attributes.sexualContentGraphicAndNudity ?? apple_utils_1.Rating.NONE,
            sexualContentOrNudity: attributes.sexualContentOrNudity ?? apple_utils_1.Rating.NONE,
            unrestrictedWebAccess: attributes.unrestrictedWebAccess ?? false,
            violenceCartoonOrFantasy: attributes.violenceCartoonOrFantasy ?? apple_utils_1.Rating.NONE,
            violenceRealistic: attributes.violenceRealistic ?? apple_utils_1.Rating.NONE,
            violenceRealisticProlongedGraphicOrSadistic: attributes.violenceRealisticProlongedGraphicOrSadistic ?? apple_utils_1.Rating.NONE,
            advertising: attributes.advertising ?? false,
            ageAssurance: attributes.ageAssurance ?? false,
            ageRatingOverrideV2: attributes.ageRatingOverrideV2 ?? null,
            developerAgeRatingInfoUrl: attributes.developerAgeRatingInfoUrl ?? null,
            gunsOrOtherWeapons: attributes.gunsOrOtherWeapons ?? apple_utils_1.Rating.NONE,
            healthOrWellnessTopics: attributes.healthOrWellnessTopics ?? false,
            messagingAndChat: attributes.messagingAndChat ?? false,
            parentalControls: attributes.parentalControls ?? false,
            userGeneratedContent: attributes.userGeneratedContent ?? false,
        };
    }
    setInfoLocale(attributes) {
        this.schema.info = this.schema.info ?? {};
        const existing = this.schema.info[attributes.locale] ?? {};
        this.schema.info[attributes.locale] = {
            ...existing,
            title: attributes.name ?? '',
            subtitle: optional(attributes.subtitle),
            privacyPolicyUrl: optional(attributes.privacyPolicyUrl),
            privacyPolicyText: optional(attributes.privacyPolicyText),
            privacyChoicesUrl: optional(attributes.privacyChoicesUrl),
        };
    }
    setCategories(attributes) {
        this.schema.categories = undefined;
        if (!attributes.primaryCategory && !attributes.secondaryCategory) {
            return;
        }
        this.schema.categories = [];
        if (attributes.primaryCategory && attributes.primarySubcategoryOne) {
            this.schema.categories[0] = [
                attributes.primaryCategory.id,
                attributes.primarySubcategoryOne?.id,
                attributes.primarySubcategoryTwo?.id,
            ].filter(Boolean);
        }
        else {
            // If only the secondaryCategory was provided,
            // autofill with an empty string and cause a store config error.
            this.schema.categories[0] = attributes.primaryCategory?.id ?? '';
        }
        if (attributes.secondaryCategory && attributes.secondarySubcategoryOne) {
            this.schema.categories[1] = [
                attributes.secondaryCategory.id,
                attributes.secondarySubcategoryOne?.id,
                attributes.secondarySubcategoryTwo?.id,
            ].filter(Boolean);
        }
        else if (attributes.secondaryCategory) {
            this.schema.categories[1] = attributes.secondaryCategory.id;
        }
    }
    setVersion(attributes) {
        this.schema.version = optional(attributes.versionString);
        this.schema.copyright = optional(attributes.copyright);
    }
    setVersionReleaseType(attributes) {
        if (attributes.releaseType === apple_utils_1.ReleaseType.SCHEDULED && attributes.earliestReleaseDate) {
            this.schema.release = {
                ...this.schema.release,
                automaticRelease: attributes.earliestReleaseDate,
            };
        }
        if (attributes.releaseType === apple_utils_1.ReleaseType.AFTER_APPROVAL) {
            this.schema.release = {
                ...this.schema.release,
                automaticRelease: true,
            };
        }
        if (attributes.releaseType === apple_utils_1.ReleaseType.MANUAL) {
            this.schema.release = {
                ...this.schema.release,
                automaticRelease: false,
            };
        }
    }
    setVersionReleasePhased(attributes) {
        if (!attributes) {
            delete this.schema.release?.phasedRelease;
        }
        else {
            this.schema.release = {
                ...this.schema.release,
                phasedRelease: true,
            };
        }
    }
    setVersionLocale(attributes) {
        this.schema.info = this.schema.info ?? {};
        const existing = this.schema.info[attributes.locale] ?? {};
        this.schema.info[attributes.locale] = {
            ...existing,
            description: optional(attributes.description),
            keywords: optional(attributes.keywords)
                ?.split(',')
                .map(keyword => keyword.trim()),
            releaseNotes: optional(attributes.whatsNew),
            marketingUrl: optional(attributes.marketingUrl),
            promoText: optional(attributes.promotionalText),
            supportUrl: optional(attributes.supportUrl),
        };
    }
    setReviewDetails(attributes) {
        this.schema.review = {
            firstName: attributes.contactFirstName ?? '',
            lastName: attributes.contactLastName ?? '',
            email: attributes.contactEmail ?? '',
            phone: attributes.contactPhone ?? '',
            demoUsername: optional(attributes.demoAccountName),
            demoPassword: optional(attributes.demoAccountPassword),
            demoRequired: optional(attributes.demoAccountRequired),
            notes: optional(attributes.notes),
            // TODO: add attachment
        };
    }
    /** Set screenshots for a specific locale */
    setScreenshots(locale, screenshots) {
        this.schema.info = this.schema.info ?? {};
        this.schema.info[locale] = this.schema.info[locale] ?? { title: '' };
        this.schema.info[locale].screenshots =
            Object.keys(screenshots).length > 0 ? screenshots : undefined;
    }
    /** Set video previews for a specific locale */
    setPreviews(locale, previews) {
        this.schema.info = this.schema.info ?? {};
        this.schema.info[locale] = this.schema.info[locale] ?? { title: '' };
        this.schema.info[locale].previews = Object.keys(previews).length > 0 ? previews : undefined;
    }
    /** Set the App Clip default experience attributes (action, releaseWithAppStoreVersion). */
    setAppClipDefaultExperience(attributes) {
        this.schema.appClip = this.schema.appClip ?? {};
        this.schema.appClip.defaultExperience = {
            ...this.schema.appClip.defaultExperience,
            action: attributes.action,
            releaseWithAppStoreVersion: attributes.releaseWithAppStoreVersion,
        };
    }
    /** Set the App Clip App Store review detail (invocation URLs). */
    setAppClipReviewDetail(reviewDetail) {
        this.schema.appClip = this.schema.appClip ?? {};
        this.schema.appClip.defaultExperience = this.schema.appClip.defaultExperience ?? {};
        if (reviewDetail && reviewDetail.invocationUrls.length > 0) {
            this.schema.appClip.defaultExperience.reviewDetail = reviewDetail;
        }
        else {
            delete this.schema.appClip.defaultExperience.reviewDetail;
        }
    }
    /** Set per-locale App Clip info (subtitle + header image). */
    setAppClipLocalizedInfo(locale, info) {
        this.schema.appClip = this.schema.appClip ?? {};
        this.schema.appClip.defaultExperience = this.schema.appClip.defaultExperience ?? {};
        this.schema.appClip.defaultExperience.info = this.schema.appClip.defaultExperience.info ?? {};
        if (info.subtitle || info.headerImage) {
            this.schema.appClip.defaultExperience.info[locale] = {
                subtitle: optional(info.subtitle ?? null),
                headerImage: optional(info.headerImage ?? null),
            };
        }
        else {
            delete this.schema.appClip.defaultExperience.info[locale];
        }
    }
}
exports.AppleConfigWriter = AppleConfigWriter;
/** Helper function to convert `T | null` to `T | undefined`, required for the entity properties */
function optional(value) {
    return value ?? undefined;
}
