export interface OpenFinanceProvider {
  createConnection(userId: string): Promise<{ connectUrl: string; itemId: string }>;
  syncTransactions(connectionId: string): Promise<any[]>;
  revokeConsent(connectionId: string): Promise<void>;
}
