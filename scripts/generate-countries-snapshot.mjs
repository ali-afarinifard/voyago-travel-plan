/**
 * Regenerates lib/data/countries.json — the local snapshot that powers
 * getAllCountries()/getCountry()/getContinents() in lib/api/server.ts.
 *
 * Why a snapshot instead of a live call:
 * https://countries.trevorblades.com/graphql is a free community demo API.
 * It isn't reliable enough to sit on the critical path of
 * `generateStaticParams` (see the comment in lib/api/server.ts for the
 * full incident writeup). Country master data — codes, names, capitals,
 * currencies, languages — barely ever changes, so it's bundled locally
 * instead of being fetched on every build/request.
 *
 * Run this only when you actually need to refresh the data (e.g. a new
 * country/currency change), not as part of your normal build:
 *
 *   node scripts/generate-countries-snapshot.mjs
 *
 * It queries the same GraphQL API the app used to call directly, but only
 * once, from your machine/CI, at a time you control — not 250 times in
 * parallel during a Vercel build.
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ENDPOINT = "https://countries.trevorblades.com/graphql";

const QUERY = /* GraphQL */ `
  query GetCountries {
    countries {
      code
      name
      native
      capital
      currency
      emoji
      phone
      continent {
        code
        name
      }
      languages {
        code
        name
        native
        rtl
      }
    }
  }
`;

async function main() {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: QUERY }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL request failed with status ${res.status}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  /** @type {Array<{code: string, name: string}>} */
  const countries = json.data.countries;
  countries.sort((a, b) => a.name.localeCompare(b.name));

  const outPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "lib",
    "data",
    "countries.json",
  );

  writeFileSync(outPath, JSON.stringify(countries, null, 2) + "\n", "utf-8");
  console.log(`Wrote ${countries.length} countries to ${outPath}`);
}

main().catch((err) => {
  console.error("Failed to regenerate countries snapshot:", err);
  process.exit(1);
});
