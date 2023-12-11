declare module '@jeevesinc/jeeves-auth' {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  export const AuthenticatedContext: any;
  export const jwtUtils: {
    init: (
      issuer: string,
      audience: string,
      publicKeyBase64EncodedInput: string,
      privateKeyBase64EncodedInput: string,
    ) => void;
    verifyAndGetContext: (token: string, logger: any) => any;
  };
  export const LoginResponse: any;
  export const RefreshTokenRequest: any;
}
