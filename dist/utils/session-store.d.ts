export declare class SessionStore {
    get(sessionId: string): Promise<any>;
    set(sessionId: string, state: any, ttl?: number): Promise<void>;
    delete(sessionId: string): Promise<void>;
}
//# sourceMappingURL=session-store.d.ts.map