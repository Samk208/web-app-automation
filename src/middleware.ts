import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { correlationHeader, getCorrelationIdFromHeaders } from './lib/correlation'

export async function middleware(request: NextRequest) {
    const correlationId = getCorrelationIdFromHeaders(request.headers)

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Create an unmodified Supabase client
    // It handles cookie refreshing automatically via the cookies methods
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
                },
            },
        }
    )

    await supabase.auth.getUser()

    // propagate correlation ID on response
    response.headers.set(correlationHeader, correlationId)

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - .png, .jpg, .jpeg, .gif, .svg (image files)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
