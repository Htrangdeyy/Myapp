// Minimal typing of the claude.ai artifact runtime used by this app.
export interface McpError { code: string; message: string; retryable?: boolean }
export interface McpNamespace {
  callTool(server: string, tool: string, input?: unknown, options?: { cache?: false }): Promise<{ payload?: unknown }>;
  listTools(server?: string): Promise<{ servers: { server: string; tools: { name: string }[] }[] }>;
}
export interface DbError { code: string; message: string }
export interface DocSnap { id: string; exists: boolean; data(): Record<string, unknown> | undefined; metadata: { hasPendingWrites: boolean } }
export interface DocRef {
  set(data: Record<string, unknown>): Promise<void>;
  delete(): Promise<void>;
  onSnapshot(next: (s: DocSnap) => void, error?: (e: DbError) => void): () => void;
}
export interface QuerySnap { docs: DocSnap[] }
export interface CollRef {
  doc(id?: string): DocRef;
  onSnapshot(next: (s: QuerySnap) => void, error?: (e: DbError) => void): () => void;
}
export interface DB { doc(path: string): DocRef; collection(path: string): CollRef }
declare global {
  interface Window {
    claude?: { use(name: "mcp"): Promise<McpNamespace | null>; use(name: "db"): Promise<DB | null> };
  }
}
