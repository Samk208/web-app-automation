"use server"

import { defaultModel } from "@/lib/ai"
import { requireOrganizationAccess } from "@/lib/auth/authorization"
import { handleAPIError } from "@/lib/error-handler"
import { enforceSchema, enforceSize, withRetry, withTimeout } from "@/lib/guard"
import { createLogger } from "@/lib/logger"
import { traced, tracedGenerateObject } from "@/lib/observability/langsmith-wrapper"
import { enforceRateLimit } from "@/lib/rate-limit-redis"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const SafetyLogSchema = z.object({
    compliance_note: z.string().describe("Formal legal log entry description the safety event and automated response"),
    severity_level: z.enum(["WARNING", "CRITICAL", "FATAL"]),
    recommended_action: z.string()
})

type GenerateObjectResultLike<T> = {
    object: T
    usage?: {
        promptTokens?: number
        completionTokens?: number
    }
}

const SafetyEventSchema = z.object({
    sensorType: z.string().min(1).max(128),
    value: z.number().finite(),
    zone: z.string().min(1).max(128),
    organizationId: z.string().uuid(),
})

function toDBStatus(severity: z.infer<typeof SafetyLogSchema>['severity_level']): 'WARNING' | 'CRITICAL' {
    if (severity === 'WARNING') return 'WARNING'
    return 'CRITICAL'
}

async function dispatchAlertBestEffort(payload: {
    organizationId: string
    zone: string
    sensorType: string
    value: number
    severity: string
    message: string
}) {
    const url = process.env.ALERT_WEBHOOK_URL
    if (!url) return

    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...payload,
                timestamp: new Date().toISOString(),
            })
        })
    } catch {
        // best-effort
    }
}

export const processSafetyLog = traced(
    'safety-compliance-log',
    async (sensorType: string, value: number, zone: string, opts: { correlationId?: string, organizationId: string }) => {
        const supabase = await createClient()
        const logger = createLogger({ agent: "safety-guardian", correlationId: opts?.correlationId, context: { sensorType, zone } })

        try {
            enforceSize(sensorType, 128, "sensorType")
            enforceSize(zone, 128, "zone")

            const parsed = SafetyEventSchema.parse({
                sensorType,
                value,
                zone,
                organizationId: opts?.organizationId,
            })

            const auth = await requireOrganizationAccess(parsed.organizationId)
            await enforceRateLimit(`safety:${auth.organizationId}:${parsed.zone}`, 120)

            // 1. Determine Context
            const isCritical = parsed.value > 80
            if (!isCritical) {
                logger.info("Reading normal", { value: parsed.value, organizationId: auth.organizationId })
                return { status: "NORMAL" as const }
            }

            // 2. AI Compliance Logging
            const prompt = `
      You are the AI Safety Officer for a High-Tech Semicon Manufacturing Plant.
      ANOMALY DETECTED:
      - Sensor: ${sensorType}
      - Value: ${value} (Threshold: 80)
      - Zone: ${zone}
      
      Tasks:
      1. Generate a "Compliance Log Entry" (Technical & Legal tone).
      2. Cite standard safety protocols (ISO 45001 or Korean OSHA).
      3. Recommend immediate automated action (e.g., "Emergency Shutdown Sequence Alpha").
    `

            const result = await withTimeout(
                withRetry(() =>
                    tracedGenerateObject<GenerateObjectResultLike<z.infer<typeof SafetyLogSchema>>>({
                        model: defaultModel,
                        schema: SafetyLogSchema,
                        prompt,
                    }, {
                        organizationId: auth.organizationId,
                        agentName: "safety-guardian"
                    })
                    , { retries: 1, delayMs: 300 }),
                10_000
            )

            const object = result.object

            // 3. Save to DB
            await supabase.from('safety_logs').insert({
                factory_zone: zone,
                sensor_type: sensorType,
                reading_value: value,
                status: toDBStatus(enforceSchema(SafetyLogSchema, object).severity_level),
                compliance_note: `[${object.severity_level}] ${object.recommended_action} - ${object.compliance_note}`,
                organization_id: auth.organizationId
            })

            logger.info("Safety log recorded", { severity: object.severity_level })

            if (object.severity_level !== 'WARNING') {
                await dispatchAlertBestEffort({
                    organizationId: auth.organizationId,
                    zone: parsed.zone,
                    sensorType: parsed.sensorType,
                    value: parsed.value,
                    severity: object.severity_level,
                    message: object.recommended_action,
                })
            }
            return { success: true, log: object }

        } catch (err) {
            const sanitized = handleAPIError(err, {
                service: 'safety-guardian',
                correlationId: opts?.correlationId,
                organizationId: opts?.organizationId,
                sensorType,
                zone,
            })

            throw sanitized.error
        }
    }, { tags: ['agent', 'safety-guardian'] })
