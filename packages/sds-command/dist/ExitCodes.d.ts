/*******************************************************************************
*                                                                              *
*                                 ExitCodes                                    *
*                                                                              *
*******************************************************************************/
export declare const ExitCodes: {
    readonly OK: 0;
    readonly GeneralError: 1;
    readonly UsageError: 2;
    readonly NotFound: 3;
    readonly Unauthorized: 4;
    readonly NetworkError: 5;
    readonly Forbidden: 6;
};
export type ExitCode = typeof ExitCodes[keyof typeof ExitCodes];
//# sourceMappingURL=ExitCodes.d.ts.map