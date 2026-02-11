
import { supabaseAdmin } from '@/lib/supabase/admin'
import { nanoid } from 'nanoid'

/**
 * Upload diagram to Supabase Storage
 * Uses service role to bypass RLS (authorization already verified in action)
 */
export async function uploadDiagram(
    imageBuffer: Buffer,
    metadata: {
        organizationId: string
        planId: string
        diagramType: string
        format: 'png' | 'svg'
    },
    client?: any
): Promise<string> {

    // Skip empty buffers
    if (!imageBuffer || imageBuffer.length === 0) {
        console.warn(`Skipping empty diagram: ${metadata.diagramType}`)
        return ''
    }

    // Use service role client to bypass RLS
    // Authorization is already checked in the business-plan action
    const supabase = supabaseAdmin

    const filename = `${metadata.organizationId}/${metadata.planId}/${metadata.diagramType}-${nanoid()}.${metadata.format}`

    try {
        const { error } = await supabase.storage
            .from('diagrams')
            .upload(filename, imageBuffer, {
                contentType: metadata.format === 'png' ? 'image/png' : 'image/svg+xml',
                cacheControl: '3600',
                upsert: true  // Allow overwrite
            })

        if (error) {
            console.error(`Supabase upload failed for ${metadata.diagramType}:`, error.message)
            // Debugging info
            console.error('Upload Target Details:', {
                bucket: 'diagrams',
                filename,
                url: process.env.NEXT_PUBLIC_SUPABASE_URL
            })
            return ''
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('diagrams')
            .getPublicUrl(filename)

        return publicUrl
    } catch (err: any) {
        console.error(`Upload exception for ${metadata.diagramType}:`, err.message)
        return ''
    }
}

/**
 * Upload multiple diagrams in batch
 */
export async function uploadDiagramBatch(
    diagrams: Array<{
        buffer: Buffer
        type: string
        format: 'png' | 'svg'
    }>,
    metadata: {
        organizationId: string
        planId: string
    },
    client?: any
): Promise<Record<string, string>> {

    const uploadPromises = diagrams.map(async (diagram) => {
        const url = await uploadDiagram(diagram.buffer, {
            ...metadata,
            diagramType: diagram.type,
            format: diagram.format
        }, client)

        return [diagram.type, url]
    })

    const results = await Promise.all(uploadPromises)

    return Object.fromEntries(results)
}

/**
 * Delete old diagrams for a plan
 */
export async function cleanupOldDiagrams(
    organizationId: string,
    planId: string,
    client?: any
): Promise<void> {

    const supabase = supabaseAdmin

    const prefix = `${organizationId}/${planId}/`

    const { data: files, error: listError } = await supabase.storage
        .from('diagrams')
        .list(prefix)

    if (listError || !files || files.length === 0) {
        return
    }

    const filePaths = files.map((file: any) => `${prefix}${file.name}`)

    const { error: deleteError } = await supabase.storage
        .from('diagrams')
        .remove(filePaths)

    if (deleteError) {
        console.error('Failed to cleanup old diagrams:', deleteError)
    }
}
