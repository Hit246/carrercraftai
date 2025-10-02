
export type SecurityRuleContext = {
    path: string;
    operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
    requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
    public context: SecurityRuleContext;
    public originalError?: any;

    constructor(context: SecurityRuleContext, originalError?: any) {
        const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${JSON.stringify(context, null, 2)}`;
        super(message);
        this.name = 'FirestorePermissionError';
        this.context = context;
        this.originalError = originalError;

        // This is to ensure the stack trace is captured correctly
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, FirestorePermissionError);
        }
    }
}
