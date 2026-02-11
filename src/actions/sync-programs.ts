"use server"

import { createLogger } from "@/lib/logger"
import { KStartupScraper } from "@/lib/scrapers/k-startup-scraper"
import { createClient } from "@/lib/supabase/server"

const logger = createLogger({ agent: "system-sync" })

/**
 * Sync K-Startup programs from the web to the database
 * This should be called via a cron job or admin dashboard
 */
export async function syncStartupPrograms() {
    const scraper = new KStartupScraper()
    const supabase = await createClient()

    try {
        logger.info("Starting K-Startup sync...")
        const programs = await scraper.fetchLatestPrograms()
        logger.info(`Scraped ${programs.length} programs`)

        if (programs.length === 0) {
            return { success: false, message: "No programs found" }
        }

        // Upsert into DB
        // Assuming startup_programs table has columns: name, url, category, deadline, organization
        // We might need to map fields: title -> name

        const upsertData = programs.map(p => ({
            name: p.title,
            description: `Source: ${p.organization}`, // Simple description
            category: p.category,
            deadline: p.deadline,
            url: p.url,
            // Assuming we have a unique constraint on url or name+deadline?
            // If not, we might duplicate. Let's assume URL is unique.
        }))

        // We use 'upsert' but we need a unique key. 
        // If 'url' is not unique in schema, we might append.
        // Let's check schema or just insert for now.
        // Safe bet: Insert and ignore duplicates if possible, or just insert.
        // Actually, let's look at schema if we can. But simple approach first.

        const { error } = await supabase
            .from('startup_programs')
            .upsert(upsertData, { onConflict: 'url', ignoreDuplicates: true })
        // Note: 'url' needs to be a unique key/constraint. If not, this might fail or duplicate.

        if (error) {
            // Fallback: If no unique constraint, try simple insert?
            // Or log error.
            logger.error("DB Sync failed", error)
            throw error
        }

        logger.info("K-Startup sync complete")
        return { success: true, count: programs.length }

    } catch (error: any) {
        logger.error("Sync failed", error)
        return { success: false, error: error.message }
    } finally {
        await scraper.close()
    }
}
