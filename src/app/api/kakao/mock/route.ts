import { NextResponse } from "next/server";

export async function POST() {
    return NextResponse.json({
        version: "2.0",
        template: {
            outputs: [
                { simpleText: { text: "[mock] Kakao webhook received." } }
            ]
        }
    });
}

