import { NextResponse } from "next/server";

const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:3001",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
};

export async function OPTIONS() {
    console.log("🔍 OPTIONS request received");
    return NextResponse.json({ message: "CORS preflight successful" }, { headers: corsHeaders });
}

export async function GET() {
    console.log("🔍 GET request received");
    return NextResponse.json({ message: "CORS test successful" }, { headers: corsHeaders });
}

export async function POST() {
    console.log("🔍 POST request received");
    return NextResponse.json({ message: "CORS POST test successful" }, { headers: corsHeaders });
}
