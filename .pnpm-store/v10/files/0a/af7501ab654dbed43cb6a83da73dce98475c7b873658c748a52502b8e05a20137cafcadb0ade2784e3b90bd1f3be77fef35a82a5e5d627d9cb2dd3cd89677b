import { AgeRatingDeclaration, AppInfo, AppInfoLocalization, AppStoreReviewDetail, AppStoreVersion, AppStoreVersionLocalization, AppStoreVersionPhasedRelease } from '@expo/apple-utils';
import { AttributesOf } from '../../utils/asc';
import { AppleAppClipDefaultExperience, AppleAppClipLocalizedInfo, AppleAppClipReviewDetail, AppleMetadata, ApplePreviews, AppleScreenshots } from '../types';
/**
 * Serializes the Apple ASC entities into the metadata configuration schema.
 * This uses version 0 of the config schema.
 */
export declare class AppleConfigWriter {
    readonly schema: Partial<AppleMetadata>;
    constructor(schema?: Partial<AppleMetadata>);
    /** Get the schema result to write it to the config file */
    toSchema(): {
        configVersion: number;
        apple: Partial<AppleMetadata>;
    };
    setAgeRating(attributes: Omit<AttributesOf<AgeRatingDeclaration>, 'seventeenPlus' | 'gamblingAndContests'>): void;
    setInfoLocale(attributes: AttributesOf<AppInfoLocalization>): void;
    setCategories(attributes: Pick<AttributesOf<AppInfo>, 'primaryCategory' | 'primarySubcategoryOne' | 'primarySubcategoryTwo' | 'secondaryCategory' | 'secondarySubcategoryOne' | 'secondarySubcategoryTwo'>): void;
    setVersion(attributes: Omit<AttributesOf<AppStoreVersion>, 'releaseType' | 'earliestReleaseDate'>): void;
    setVersionReleaseType(attributes: Pick<AttributesOf<AppStoreVersion>, 'releaseType' | 'earliestReleaseDate'>): void;
    setVersionReleasePhased(attributes?: AttributesOf<AppStoreVersionPhasedRelease>): void;
    setVersionLocale(attributes: AttributesOf<AppStoreVersionLocalization>): void;
    setReviewDetails(attributes: AttributesOf<AppStoreReviewDetail>): void;
    /** Set screenshots for a specific locale */
    setScreenshots(locale: string, screenshots: AppleScreenshots): void;
    /** Set video previews for a specific locale */
    setPreviews(locale: string, previews: ApplePreviews): void;
    /** Set the App Clip default experience attributes (action, releaseWithAppStoreVersion). */
    setAppClipDefaultExperience(attributes: Pick<AppleAppClipDefaultExperience, 'action' | 'releaseWithAppStoreVersion'>): void;
    /** Set the App Clip App Store review detail (invocation URLs). */
    setAppClipReviewDetail(reviewDetail: AppleAppClipReviewDetail | null): void;
    /** Set per-locale App Clip info (subtitle + header image). */
    setAppClipLocalizedInfo(locale: string, info: AppleAppClipLocalizedInfo): void;
}
