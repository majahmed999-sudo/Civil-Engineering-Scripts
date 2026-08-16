"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetUpProvisioningProfile = void 0;
const tslib_1 = require("tslib");
const nullthrows_1 = tslib_1.__importDefault(require("nullthrows"));
const AscApiKeyUtils_1 = require("./AscApiKeyUtils");
const BuildCredentialsUtils_1 = require("./BuildCredentialsUtils");
const ConfigureProvisioningProfile_1 = require("./ConfigureProvisioningProfile");
const CreateProvisioningProfile_1 = require("./CreateProvisioningProfile");
const ProvisioningProfileUtils_1 = require("./ProvisioningProfileUtils");
const SetUpDistributionCertificate_1 = require("./SetUpDistributionCertificate");
const generated_1 = require("../../../graphql/generated");
const log_1 = tslib_1.__importStar(require("../../../log"));
const target_1 = require("../../../project/ios/target");
const prompts_1 = require("../../../prompts");
const errors_1 = require("../../errors");
const resolveCredentials_1 = require("../appstore/resolveCredentials");
const authenticateTypes_1 = require("../appstore/authenticateTypes");
const validateProvisioningProfile_1 = require("../validators/validateProvisioningProfile");
/**
 * Sets up either APP_STORE or ENTERPRISE provisioning profiles
 */
class SetUpProvisioningProfile {
    app;
    target;
    distributionType;
    constructor(app, target, distributionType) {
        this.app = app;
        this.target = target;
        this.distributionType = distributionType;
    }
    async areBuildCredentialsSetupAsync(ctx) {
        const buildCredentials = await (0, BuildCredentialsUtils_1.getBuildCredentialsAsync)(ctx, this.app, this.distributionType);
        return await (0, validateProvisioningProfile_1.validateProvisioningProfileAsync)(ctx, this.target, this.app, buildCredentials);
    }
    async assignNewAndDeleteOldProfileAsync(ctx, distCert, currentProfile) {
        const buildCredentials = await this.createAndAssignProfileAsync(ctx, distCert);
        // delete 'currentProfile' since its no longer valid
        await ctx.ios.deleteProvisioningProfilesAsync(ctx.graphqlClient, [currentProfile.id]);
        return buildCredentials;
    }
    async createAndAssignProfileAsync(ctx, distCert) {
        const provisioningProfile = await new CreateProvisioningProfile_1.CreateProvisioningProfile(this.app, this.target, distCert).runAsync(ctx);
        return await (0, BuildCredentialsUtils_1.assignBuildCredentialsAsync)(ctx, this.app, this.distributionType, distCert, provisioningProfile);
    }
    async configureAndAssignProfileAsync(ctx, distCert, originalProvisioningProfile) {
        const profileConfigurator = new ConfigureProvisioningProfile_1.ConfigureProvisioningProfile(this.app, this.target, distCert, originalProvisioningProfile);
        const updatedProvisioningProfile = await profileConfigurator.runAsync(ctx);
        if (!updatedProvisioningProfile) {
            return null;
        }
        return await (0, BuildCredentialsUtils_1.assignBuildCredentialsAsync)(ctx, this.app, this.distributionType, distCert, updatedProvisioningProfile);
    }
    async runAsync(ctx) {
        const distCert = await new SetUpDistributionCertificate_1.SetUpDistributionCertificate(this.app, this.distributionType).runAsync(ctx);
        if (ctx.nonInteractive && !ctx.appStore.authCtx) {
            await (0, AscApiKeyUtils_1.tryAuthenticateAppStoreWithEasAscApiKeyAsync)(ctx, this.app, this.resolveTeamTypeForAuthentication());
        }
        let areBuildCredentialsSetup;
        try {
            areBuildCredentialsSetup = await this.areBuildCredentialsSetupAsync(ctx);
        }
        catch (error) {
            if (ctx.nonInteractive) {
                log_1.default.warn('Skipping Provisioning Profile validation on Apple servers due to an unexpected validation error. Continuing with local validation result.');
                log_1.default.debug('Provisioning profile validation on Apple servers failed:', error);
                areBuildCredentialsSetup = true;
            }
            else {
                throw error;
            }
        }
        if (areBuildCredentialsSetup) {
            return (0, nullthrows_1.default)(await (0, BuildCredentialsUtils_1.getBuildCredentialsAsync)(ctx, this.app, this.distributionType));
        }
        if (ctx.freezeCredentials) {
            throw new errors_1.ForbidCredentialModificationError('Provisioning profile is not configured correctly. Remove the --freeze-credentials flag to configure it.');
        }
        if (ctx.nonInteractive && !ctx.appStore.authCtx) {
            throw new errors_1.InsufficientAuthenticationNonInteractiveError(`In order to configure your Provisioning Profile, authentication with an ASC API key is required in non-interactive mode. Either set the EXPO_ASC_API_KEY_PATH/EXPO_ASC_KEY_ID/EXPO_ASC_ISSUER_ID environment variables, or configure an App Store Connect API Key for submissions for bundle identifier ${this.app.bundleIdentifier} on EAS. ${(0, log_1.learnMore)('https://docs.expo.dev/build/building-on-ci/#optional-provide-an-asc-api-token-for-your-apple-team')}`);
        }
        const currentProfile = await (0, BuildCredentialsUtils_1.getProvisioningProfileAsync)(ctx, this.app, this.distributionType);
        if (!currentProfile) {
            return await this.createAndAssignProfileAsync(ctx, distCert);
        }
        // See if the profile we have exists on the Apple Servers
        const applePlatform = (0, target_1.getApplePlatformFromTarget)(this.target);
        const existingProfiles = await ctx.appStore.listProvisioningProfilesAsync(this.app.bundleIdentifier, applePlatform);
        const currentProfileFromServer = this.getCurrentProfileStoreInfo(existingProfiles, currentProfile);
        if (!currentProfileFromServer) {
            return await this.assignNewAndDeleteOldProfileAsync(ctx, distCert, currentProfile);
        }
        const isNonInteractiveOrUserDidConfirmAsync = async () => {
            if (ctx.nonInteractive || ctx.autoAcceptCredentialReuse) {
                return true;
            }
            return await (0, prompts_1.confirmAsync)({
                message: `${(0, ProvisioningProfileUtils_1.formatProvisioningProfileFromApple)(currentProfileFromServer)} \n  Would you like to reuse the original profile?`,
            });
        };
        const confirm = await isNonInteractiveOrUserDidConfirmAsync();
        if (!confirm) {
            return await this.assignNewAndDeleteOldProfileAsync(ctx, distCert, currentProfile);
        }
        // If we get here, we've verified the current profile still exists on Apple
        // But something wasn't quite right, so we want to fix and update it
        const updatedProfile = await this.configureAndAssignProfileAsync(ctx, distCert, currentProfile);
        if (!updatedProfile) {
            // Something went wrong, so just create a new profile instead
            return await this.assignNewAndDeleteOldProfileAsync(ctx, distCert, currentProfile);
        }
        return updatedProfile;
    }
    /**
     * The team type determines `team.inHouse`, which in turn selects the Apple profile
     * type used for every subsequent profile lookup and creation (IOS_APP_INHOUSE for
     * enterprise vs IOS_APP_STORE otherwise). We derive it from the distribution
     * type, which is exactly what the requested operation needs: enterprise
     * builds require an in-house team, other distribution types don't.
     * A genuine team/distribution mismatch is rejected by Apple regardless of this value.
     */
    getDerivedTeamTypeForAuthentication() {
        return this.distributionType === generated_1.IosDistributionType.Enterprise
            ? authenticateTypes_1.AppleTeamType.IN_HOUSE
            : authenticateTypes_1.AppleTeamType.COMPANY_OR_ORGANIZATION;
    }
    resolveTeamTypeForAuthentication() {
        return (0, resolveCredentials_1.resolveAppleTeamTypeFromEnvironment)() ?? this.getDerivedTeamTypeForAuthentication();
    }
    getCurrentProfileStoreInfo(profiles, currentProfile) {
        return (profiles.find(profile => currentProfile.developerPortalIdentifier
            ? currentProfile.developerPortalIdentifier === profile.provisioningProfileId
            : currentProfile.provisioningProfile === profile.provisioningProfile) ?? null);
    }
}
exports.SetUpProvisioningProfile = SetUpProvisioningProfile;
