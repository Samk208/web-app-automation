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

    const log = (level: LogLevel, message: string, meta?: LogMeta) => {
        console.log(
            JSON.stringify({
                level,
                message,
                ts: now(),
                ...baseMeta,
                ...(meta || {}),
            })
        );
    };

    return {
        correlationId,
        info: (message: string, meta?: LogMeta) => log("info", message, meta),
        warn: (message: string, meta?: LogMeta) => log("warn", message, meta),
        error: (message: string, err?: unknown, meta?: LogMeta) =>
            log("error", message, { ...meta, error: serializeError(err) }),
    };
}

