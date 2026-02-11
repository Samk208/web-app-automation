"use server"

import { requireAuth, requireResourceAccess } from "@/lib/auth/authorization"
import { Errors, handleAPIError } from "@/lib/error-handler"
import { createLogger } from "@/lib/logger"
import { traced } from "@/lib/observability/langsmith-wrapper"
import { getActiveOrg } from "@/lib/org-context"
import { enforceRateLimit } from "@/lib/rate-limit-redis"
import { enqueueReview } from "@/lib/review-queue"
import { createClient } from "@/lib/supabase/server"
import { UUIDSchema } from "@/lib/validation/schemas"
import { z } from "zod"

interface Transaction {
    id: string
    date: string
    desc: string
    amount: number
}

interface Receipt {
    id: string
    vendor: string
    date: string
    amount: number
}

interface MatchResult {
    bank_id: string
    receipt_id: string
    confidence: number
    notes: string
}

interface Discrepancy {
    type: 'bank_only' | 'receipt_only'
    id: string
    desc: string
    amount: number
    reason: string
}

const TransactionSchema = z.object({
    id: z.string().min(1).max(128),
    date: z.string().min(4).max(64),
    desc: z.string().min(1).max(500),
    amount: z.number().finite(),
})

const ReceiptSchema = z.object({
    id: z.string().min(1).max(128),
    vendor: z.string().min(1).max(200),
    date: z.string().min(4).max(64),
    amount: z.number().finite(),
})

const CreateReconciliationJobSchema = z.object({
    company_name: z.string().min(2).max(200),
    bank_statement_data: z.array(TransactionSchema).max(5000),
    receipt_data: z.array(ReceiptSchema).max(5000),
})

export async function createReconciliationJob(input: unknown, opts?: { correlationId?: string }) {
    const logger = createLogger({ agent: 'reconciliation', correlationId: opts?.correlationId })

    try {
        await requireAuth()
        const { organization_id } = await getActiveOrg()

        await enforceRateLimit(`reconciliation:create:${organization_id}`, 10)

        const parsed = CreateReconciliationJobSchema.parse(input)

        const supabase = await createClient()
        const { data, error } = await supabase
            .from('reconciliation_jobs')
            .insert({
                company_name: parsed.company_name,
                status: 'UPLOADED',
                bank_statement_data: parsed.bank_statement_data,
                receipt_data: parsed.receipt_data,
                organization_id,
            })
            .select('*')
            .single()

        if (error || !data) {
            logger.error('Failed to create reconciliation job', error)
            throw Errors.internal('Failed to create reconciliation job')
        }

        return { success: true, job: data }
    } catch (err) {
        const sanitized = handleAPIError(err, {
            service: 'reconciliation',
            correlationId: opts?.correlationId,
        })
        return { success: false, error: sanitized.error }
    }
}

export const processReconciliation = traced(
    'reconciliation-job',
    async (jobId: string, opts?: { correlationId?: string }) => {
        const logger = createLogger({
            agent: 'reconciliation',
            correlationId: opts?.correlationId,
            context: { jobId },
        })

        const supabase = await createClient()

        try {
            UUIDSchema.parse(jobId)

            const auth = await requireResourceAccess('reconciliation_jobs', jobId)

            await enforceRateLimit(`reconciliation:${auth.organizationId}`, 10)

            const { data: job, error } = await supabase
                .from('reconciliation_jobs')
                .select('*')
                .eq('id', jobId)
                .eq('organization_id', auth.organizationId)
                .single()

            if (error || !job) {
                logger.error('Reconciliation job not found', error)
                throw Errors.notFound('Reconciliation job')
            }

            // 1. Set Status
            await supabase
                .from('reconciliation_jobs')
                .update({ status: 'PROCESSING' })
                .eq('id', jobId)
                .eq('organization_id', auth.organizationId)

            const bankTx = z.array(TransactionSchema).parse(job.bank_statement_data ?? [])
            const receipts = z.array(ReceiptSchema).parse(job.receipt_data ?? [])

            const matched: MatchResult[] = []
            const bankUnmatched: Transaction[] = []
            const receiptIdsMatched = new Set<string>()

            // 3. Fuzzy Matching Algorithm
            for (const tx of bankTx) {
                let bestMatch: Receipt | null = null
                let highestScore = 0

                for (const rx of receipts) {
                    if (receiptIdsMatched.has(rx.id)) continue

                    // Score 1: Amount Match (High Weight)
                    // Bank amounts are usually negative for expenses, receipts positive
                    const txAmt = Math.abs(tx.amount)
                    const rxAmt = Math.abs(rx.amount)
                    let amountScore = 0
                    if (txAmt === rxAmt) amountScore = 1.0
                    else if (Math.abs(txAmt - rxAmt) < (txAmt * 0.01)) amountScore = 0.9 // 1% tolerance

                    if (amountScore < 0.8) continue // Optimization: Skip if amount is totally off

                    // Score 2: Date Match (Medium Weight)
                    const dateTx = new Date(tx.date).getTime()
                    const dateRx = new Date(rx.date).getTime()
                    const diffDays = Math.abs(dateTx - dateRx) / (1000 * 3600 * 24)

                    let dateScore = 0
                    if (diffDays <= 1) dateScore = 1.0
                    else if (diffDays <= 3) dateScore = 0.8
                    else if (diffDays <= 7) dateScore = 0.5

                    // Score 3: Vendor/Desc Fuzzy Match (Low Weight but confirms)
                    const txDesc = tx.desc.toLowerCase()
                    const rxVendor = rx.vendor.toLowerCase()
                    let textScore = 0

                    if (txDesc.includes(rxVendor) || rxVendor.includes(txDesc)) {
                        textScore = 1.0
                    } else {
                        // Simple token match
                        const txTokens = txDesc.split(' ')
                        const rxTokens = rxVendor.split(' ')
                        const intersection = txTokens.filter(t => rxTokens.includes(t))
                        if (intersection.length > 0) textScore = 0.6
                    }

                    // Weighted Total
                    const totalScore = (amountScore * 0.6) + (dateScore * 0.2) + (textScore * 0.2)

                    if (totalScore > highestScore) {
                        highestScore = totalScore
                        bestMatch = rx
                    }
                }

                if (bestMatch && highestScore > 0.85) {
                    matched.push({
                        bank_id: tx.id,
                        receipt_id: bestMatch.id,
                        confidence: Number(highestScore.toFixed(2)),
                        notes: highestScore > 0.95 ? "Excellent Match" : "Fuzzy Match"
                    })
                    receiptIdsMatched.add(bestMatch.id)
                } else {
                    bankUnmatched.push(tx)
                }
            }

            // 4. Transform for DB
            const unreconciled: Discrepancy[] = bankUnmatched.map(tx => ({
                type: 'bank_only',
                id: tx.id,
                desc: tx.desc,
                amount: tx.amount,
                reason: "No matching receipt found within 3 days / amount mismatch"
            }))

            // 2. Save results and require HITL approval
            await supabase
                .from('reconciliation_jobs')
                .update({
                    status: 'AWAITING_APPROVAL',
                    match_results: {
                        matched,
                        unreconciled,
                    },
                })
                .eq('id', jobId)
                .eq('organization_id', auth.organizationId)

            await enqueueReview(supabase, {
                agent: 'ledger-logic',
                resourceId: jobId,
                organizationId: auth.organizationId,
                summary: `${matched.length} matches, ${unreconciled.length} discrepancies`,
                data: { matched, unreconciled },
            })

            return { success: true, status: 'AWAITING_APPROVAL' as const }
        } catch (err) {
            try {
                const authOrNull = await (async () => {
                    try {
                        return await requireResourceAccess('reconciliation_jobs', jobId)
                    } catch {
                        return null
                    }
                })()

                if (authOrNull?.organizationId) {
                    await supabase
                        .from('reconciliation_jobs')
                        .update({ status: 'FAILED' })
                        .eq('id', jobId)
                        .eq('organization_id', authOrNull.organizationId)
                }
            } catch (updateError) {
                logger.error('Failed to update reconciliation job status to FAILED', updateError)
            }

            const sanitized = handleAPIError(err, {
                service: 'reconciliation',
                jobId,
                correlationId: opts?.correlationId,
            })

            throw sanitized.error
        }
    }, { tags: ['agent', 'reconciliation'] })
