/// <reference types="vite/client" />
declare var google: { script: { run: GoogleScriptRun } };

interface GoogleScriptRun {
    withFailureHandler: (handler: (error: any) => void) => GoogleScriptRun;
    withSuccessHandler: (handler: (response: any) => void) => GoogleScriptRun;
    withUserObject: (userObject: any) => GoogleScriptRun;

    [x: string]: (...any) => void;
}
