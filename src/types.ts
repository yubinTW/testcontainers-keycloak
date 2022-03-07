type KeycloakRealm = {
  id: string
  realm: string
  notBefore: number
  defaultSignatureAlgorithm: string
  revokeRefreshToken: boolean
  refreshTokenMaxReuse: number
  accessTokenLifespan: number
  accessTokenLifespanForImplicitFlow: number
  ssoSessionIdleTimeout: number
  ssoSessionMaxLifespan: number
  ssoSessionIdleTimeoutRememberMe: number
  ssoSessionMaxLifespanRememberMe: number
  offlineSessionIdleTimeout: number
  offlineSessionMaxLifespanEnabled: boolean
  offlineSessionMaxLifespan: number
  clientSessionIdleTimeout: number
  clientSessionMaxLifespan: number
  clientOfflineSessionIdleTimeout: number
  clientOfflineSessionMaxLifespan: number
  accessCodeLifespan: number
  accessCodeLifespanUserAction: number
  accessCodeLifespanLogin: number
  actionTokenGeneratedByAdminLifespan: number
  actionTokenGeneratedByUserLifespan: number
  oauth2DeviceCodeLifespan: number
  oauth2DevicePollingInterval: number
  enabled: boolean
  sslRequired: string
  registrationAllowed: boolean
  registrationEmailAsUsername: boolean
  rememberMe: boolean
  verifyEmail: boolean
  loginWithEmailAllowed: boolean
  duplicateEmailsAllowed: boolean
  resetPasswordAllowed: boolean
  editUsernameAllowed: boolean
  bruteForceProtected: boolean
  permanentLockout: boolean
  maxFailureWaitSeconds: number
  minimumQuickLoginWaitSeconds: number
  waitIncrementSeconds: number
  quickLoginCheckMilliSeconds: number
  maxDeltaTimeSeconds: number
  failureFactor: number
  defaultRole: {
    id: string
    name: string
    description: string
    composite: boolean
    clientRole: boolean
    containerId: string
  }
  requiredCredentials: [string]
  otpPolicyType: string
  otpPolicyAlgorithm: string
  otpPolicyInitialCounter: number
  otpPolicyDigits: number
  otpPolicyLookAheadWindow: number
  otpPolicyPeriod: number
  otpSupportedApplications: [string]
  webAuthnPolicyRpEntityName: string
  webAuthnPolicySignatureAlgorithms: [string]
  webAuthnPolicyRpId: string
  webAuthnPolicyAttestationConveyancePreference: string
  webAuthnPolicyAuthenticatorAttachment: string
  webAuthnPolicyRequireResidentKey: string
  webAuthnPolicyUserVerificationRequirement: string
  webAuthnPolicyCreateTimeout: number
  webAuthnPolicyAvoidSameAuthenticatorRegister: boolean
  webAuthnPolicyAcceptableAaguids: []
  webAuthnPolicyPasswordlessRpEntityName: string
  webAuthnPolicyPasswordlessSignatureAlgorithms: [string]
  webAuthnPolicyPasswordlessRpId: string
  webAuthnPolicyPasswordlessAttestationConveyancePreference: string
  webAuthnPolicyPasswordlessAuthenticatorAttachment: string
  webAuthnPolicyPasswordlessRequireResidentKey: string
  webAuthnPolicyPasswordlessUserVerificationRequirement: string
  webAuthnPolicyPasswordlessCreateTimeout: number
  webAuthnPolicyPasswordlessAvoidSameAuthenticatorRegister: boolean
  webAuthnPolicyPasswordlessAcceptableAaguids: []
  browserSecurityHeaders: {
    contentSecurityPolicyReportOnly: string
    xContentTypeOptions: string
    xRobotsTag: string
    xFrameOptions: string
    contentSecurityPolicy: string
    xXSSProtection: string
    strictTransportSecurity: string
  }
  smtpServer: {}
  eventsEnabled: boolean
  eventsListeners: [string]
  enabledEventTypes: []
  adminEventsEnabled: boolean
  adminEventsDetailsEnabled: boolean
  identityProviders: []
  identityProviderMappers: []
  internationalizationEnabled: boolean
  supportedLocales: []
  browserFlow: string
  registrationFlow: string
  directGrantFlow: string
  resetCredentialsFlow: string
  clientAuthenticationFlow: string
  dockerAuthenticationFlow: string
  attributes: {
    cibaBackchannelTokenDeliveryMode: string
    cibaExpiresIn: number
    cibaAuthRequestedUserHint: string
    oauth2DeviceCodeLifespan: number
    oauth2DevicePollingInterval: number
    parRequestUriLifespan: number
    cibaInterval: number
  }
  userManagedAccessAllowed: boolean
  clientProfiles: {
    profiles: []
  }
  clientPolicies: {
    policies: []
  }
}

type KeycloakUser = {
  id: string
  createdTimestamp: number
  username: string
  enabled: boolean
  totp: boolean
  emailVerified: boolean
  firstName: string
  lastName: string
  disableableCredentialTypes: []
  requiredActions: []
  notBefore: number
  access: {
    manageGroupMembership: boolean
    view: boolean
    mapRoles: boolean
    impersonate: boolean
    manage: boolean
  }
}

type KeycloakClient = {
  id: string
  clientId: string
  surrogateAuthRequired: boolean
  enabled: boolean
  alwaysDisplayInConsole: boolean
  clientAuthenticatorType: string
  redirectUris: Array<string>
  webOrigins: Array<string>
  notBefore: number
  bearerOnly: boolean
  consentRequired: boolean
  standardFlowEnabled: boolean
  implicitFlowEnabled: boolean
  directAccessGrantsEnabled: boolean
  serviceAccountsEnabled: boolean
  publicClient: boolean
  frontchannelLogout: boolean
  protocol: string
  attributes: {}
  authenticationFlowBindingOverrides: {}
  fullScopeAllowed: boolean
  nodeReRegistrationTimeout: number
  defaultClientScopes: Array<string>
  optionalClientScopes: Array<string>
  access: {
    view: boolean
    configure: boolean
    manage: boolean
  }
}

type ClientSecret = {
  type: string
  value: string
}
