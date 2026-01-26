export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

/**
 * A custom error class for Firestore permission errors.
 * This class captures the context of the Firestore operation that failed,
 * which is useful for debugging security rules.
 */
export class FirestorePermissionError extends Error {
  context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const message = `Firestore Permission Denied: The following request was denied by Firestore Security Rules.`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
  }

  /**
   * Returns a plain object representation of the error context,
   * which can be easily serialized (e.g., to JSON).
   */
  toContextObject() {
    return this.context;
  }
}
