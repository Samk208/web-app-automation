import crypto from "crypto";

type LogLevel = "info" | "error" | "warn";

type LogMeta = Record<string, unknown>;

const now = () => new Date().toISOString();

const serializeError = (err: unknown) => {
    if (err instanceof Error) {
        return { message: err.message, stack: err.stack };
    }
    return { message: String(err) };
};

export function createLogger(base: { agent: string; correlationId?: string; context?: LogMeta }) {
    const correlationId = base.correlationId || crypto.randomUUID();
    const baseMeta = { agent: base.agent, correlationId, ...(base.context || {}) };

    const normalizeMeta = (meta: unknown): LogMeta => {
        if (meta == null) return {};
        if (typeof meta === "object" && !Array.isArray(meta)) return meta as LogMeta;
        return { detail: serializeError(meta) };
    };

    const log = (level: LogLevel, message: string, meta?: unknown) => {
        console.log(
            JSON.stringify({
                level,
                message,
                ts: now(),
                ...baseMeta,
                ...normalizeMeta(meta),
            })
        );
    };

    return {
        correlationId,
        info: (message: string, meta?: unknown) => log("info", message, meta),
        warn: (message: string, meta?: unknown) => log("warn", message, meta),
        error: (message: string, err?: unknown, meta?: LogMeta) =>
            log("error", message, { ...normalizeMeta(meta), error: serializeError(err) }),
    };
}

