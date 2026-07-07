import { NextResponse } from "next/server";
import { getAllCountries } from "@/lib/api/server";

/**
 * Serves the bundled country list to client components (e.g. the "new
 * trip" destination picker) instead of having the browser call
 * https://countries.trevorblades.com/graphql directly. Same reasoning as
 * lib/api/server.ts: that endpoint is a free demo API, not something we
 * want a production feature depending on directly. This route just reads
 * the local snapshot, so it's fast and can't fail.
 */
export async function GET() {
  const countries = await getAllCountries();
  return NextResponse.json(
    { countries },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}