import { AppleDistributionCertificateFragment, AppleProvisioningProfileFragment, IosAppBuildCredentialsFragment, IosDistributionType } from '../../../graphql/generated';
import { CredentialsContext } from '../../context';
import { AppLookupParams } from '../api/graphql/types/AppLookupParams';
import { Target } from '../types';
/**
 * Sets up either APP_STORE or ENTERPRISE provisioning profiles
 */
export declare class SetUpProvisioningProfile {
    private readonly app;
    private readonly target;
    private readonly distributionType;
    constructor(app: AppLookupParams, target: Target, distributionType: IosDistributionType);
    areBuildCredentialsSetupAsync(ctx: CredentialsContext): Promise<boolean>;
    assignNewAndDeleteOldProfileAsync(ctx: CredentialsContext, distCert: AppleDistributionCertificateFragment, currentProfile: AppleProvisioningProfileFragment): Promise<IosAppBuildCredentialsFragment>;
    createAndAssignProfileAsync(ctx: CredentialsContext, distCert: AppleDistributionCertificateFragment): Promise<IosAppBuildCredentialsFragment>;
    configureAndAssignProfileAsync(ctx: CredentialsContext, distCert: AppleDistributionCertificateFragment, originalProvisioningProfile: AppleProvisioningProfileFragment): Promise<IosAppBuildCredentialsFragment | null>;
    runAsync(ctx: CredentialsContext): Promise<IosAppBuildCredentialsFragment>;
    /**
     * The team type determines `team.inHouse`, which in turn selects the Apple profile
     * type used for every subsequent profile lookup and creation (IOS_APP_INHOUSE for
     * enterprise vs IOS_APP_STORE otherwise). We derive it from the distribution
     * type, which is exactly what the requested operation needs: enterprise
     * builds require an in-house team, other distribution types don't.
     * A genuine team/distribution mismatch is rejected by Apple regardless of this value.
     */
    private getDerivedTeamTypeForAuthentication;
    private resolveTeamTypeForAuthentication;
    private getCurrentProfileStoreInfo;
}
