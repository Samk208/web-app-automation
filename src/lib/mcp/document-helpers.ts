import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { MCPClient } from './client';
import { MCP_SERVERS } from './config';

/**
 * MCP Document Generation Helper Functions
 * Provides high-level document operations using MCP servers
 */

interface KoreanDocxOptions {
  content: string;
  title?: string;
  template?: 'government' | 'business' | 'proposal';
  metadata?: {
    author?: string;
    organization?: string;
    date?: string;
  };
}

interface TranslationOptions {
  text: string;
  sourceLanguage?: string;
  targetLanguage: 'ko' | 'en' | 'ja' | 'zh';
  context?: string;
  tone?: 'formal' | 'casual' | 'technical' | 'marketing';
}

interface StorageUploadResult {
  downloadUrl: string;
  filePath: string;
  publicUrl: string;
}

/**
 * Generates a professionally formatted Korean DOCX document
 * Uses DOCX MCP server for document generation
 */
export async function generateKoreanDocx(
  options: KoreanDocxOptions
): Promise<Buffer> {
  const client = new MCPClient(MCP_SERVERS['famano-office']);

  try {
    await client.connect();

    // Determine template settings based on type
    const templateConfig = getTemplateConfig(options.template || 'government');

    // Call DOCX MCP to generate document
    const result = await client.callTool('create_document', {
      format: 'docx',
      content: options.content,
      title: options.title || '비즈니스 계획서',
      styles: {
        font: templateConfig.font,
        fontSize: templateConfig.fontSize,
        lineSpacing: templateConfig.lineSpacing,
        margins: templateConfig.margins,
      },
      metadata: {
        author: options.metadata?.author || 'AI Automation Agency',
        company: options.metadata?.organization || '',
        date: options.metadata?.date || new Date().toISOString().split('T')[0],
      },
    });

    // Convert result to Buffer
    if (result.content) {
      // Handle base64 encoded content
      if (typeof result.content === 'string') {
        return Buffer.from(result.content, 'base64');
      }
      // Handle binary content
      return Buffer.from(result.content);
    }

    throw new Error('MCP server returned no content');
  } catch (error: any) {
    console.error('[MCP] Document generation failure details:', {
      message: error.message,
      stack: error.stack,
      config: MCP_SERVERS['famano-office']
    });
    throw error;
  } finally {
    client.disconnect();
  }
}

/**
 * Translates text to Korean using DocTranslate MCP
 * Ensures professional, context-aware translation
 */
export async function translateToKorean(
  options: TranslationOptions
): Promise<string> {
  const client = new MCPClient(MCP_SERVERS['doctranslate']);

  try {
    await client.connect();

    const result = await client.callTool('translate', {
      text: options.text,
      source_language: options.sourceLanguage || 'auto',
      target_language: options.targetLanguage,
      context: options.context || '',
      tone: options.tone || 'formal',
      preserve_formatting: true,
    });

    return result.translated_text || result.text || options.text;
  } catch (error) {
    console.error('[MCP] Translation failed, returning original:', error);
    // Fallback: return original text if translation fails
    return options.text;
  } finally {
    client.disconnect();
  }
}

/**
 * Uploads a file to Supabase Storage and returns download URL
 * Uses service role to bypass RLS (authorization already verified in calling action)
 */
export async function uploadToStorage(
  file: Buffer,
  path: string,
  bucketName: string = 'business-plans'
): Promise<StorageUploadResult> {
  // Use admin client to bypass RLS for storage operations
  const supabase = supabaseAdmin;

  // Ensure bucket exists (idempotent)
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some((b) => b.name === bucketName);

  if (!bucketExists) {
    await supabase.storage.createBucket(bucketName, {
      public: false,
      fileSizeLimit: 52428800, // 50MB
    });
  }

  // Upload file
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(path, file, {
      contentType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  // Generate signed URL (valid for 7 days)
  const { data: signedUrlData } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(path, 604800); // 7 days in seconds

  if (!signedUrlData) {
    throw new Error('Failed to generate signed URL');
  }

  // Also get public URL (requires public bucket or signed access)
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(path);

  return {
    downloadUrl: signedUrlData.signedUrl,
    filePath: uploadData.path,
    publicUrl: publicUrlData.publicUrl,
  };
}

/**
 * Helper: Get template configuration for Korean documents
 */
function getTemplateConfig(template: 'government' | 'business' | 'proposal') {
  const configs = {
    government: {
      font: '바탕체', // Batang (Korean Government Standard)
      fontSize: 11,
      lineSpacing: 1.6,
      margins: {
        top: 30,
        bottom: 30,
        left: 20,
        right: 20,
      },
    },
    business: {
      font: '맑은 고딕', // Malgun Gothic (Modern Business)
      fontSize: 11,
      lineSpacing: 1.5,
      margins: {
        top: 25,
        bottom: 25,
        left: 25,
        right: 25,
      },
    },
    proposal: {
      font: '나눔고딕', // Nanum Gothic (Professional Proposals)
      fontSize: 10.5,
      lineSpacing: 1.5,
      margins: {
        top: 20,
        bottom: 20,
        left: 30,
        right: 30,
      },
    },
  };

  return configs[template];
}

/**
 * Complete document generation pipeline
 * Generates DOCX and uploads to storage in one operation
 */
export async function generateAndUploadDocument(
  content: string,
  options: {
    organizationId: string;
    resourceId: string;
    resourceType: 'business-plan' | 'proposal';
    title?: string;
    template?: 'government' | 'business' | 'proposal';
  }
): Promise<StorageUploadResult> {
  // Generate DOCX
  const docxBuffer = await generateKoreanDocx({
    content,
    title: options.title,
    template: options.template || 'government',
  });

  // Determine storage path
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${options.resourceType}-${options.resourceId}-${timestamp}.docx`;
  const storagePath = `${options.organizationId}/${options.resourceId}/${fileName}`;

  // Upload to storage
  const bucketName =
    options.resourceType === 'business-plan' ? 'business-plans' : 'proposals';

  return uploadToStorage(docxBuffer, storagePath, bucketName);
}

/**
 * Generate PDF from DOCX using document-generator MCP
 */
export async function convertDocxToPdf(docxBuffer: Buffer): Promise<Buffer> {
  const client = new MCPClient(MCP_SERVERS['document-generator']);

  try {
    await client.connect();

    const result = await client.callTool('convert_to_pdf', {
      input: docxBuffer.toString('base64'),
      input_format: 'docx',
    });

    if (result.pdf) {
      return Buffer.from(result.pdf, 'base64');
    }

    throw new Error('PDF conversion failed');
  } finally {
    client.disconnect();
  }
}
