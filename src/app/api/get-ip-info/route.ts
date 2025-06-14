// app/api/image-proxy/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("http://www.geoplugin.net/json.gp");

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to get ip info: ${response.statusText}` },
        { status: response.status }
      );
    }
    const json = await response.json();
    return NextResponse.json(json, { status: 200 });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
