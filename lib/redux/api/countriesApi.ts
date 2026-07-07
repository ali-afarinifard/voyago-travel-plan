import { baseApi } from "./baseApi";
import {
  GET_CONTINENTS,
  GET_COUNTRIES,
  GET_COUNTRIES_BY_CONTINENT,
  GET_COUNTRY,
} from "@/lib/graphql/queries";
import type { Continent, Country } from "@/lib/types/travel";

interface CountriesResponse {
  countries: Country[];
}
interface CountryResponse {
  country: Country | null;
}
interface ContinentsResponse {
  continents: Continent[];
}
interface CountriesByContinentResponse {
  continent: { code: string; name: string; countries: Country[] } | null;
}

export const countriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * All countries. Served from our own /api/countries route (which reads
     * the bundled local snapshot) rather than calling
     * countries.trevorblades.com directly from the browser — same
     * reliability reasoning as the server-side data layer. Used by the
     * Explore grid, search, and the "new trip" destination picker.
     */
    getCountries: builder.query<Country[], void>({
      query: () => ({ type: "rest", url: "/api/countries" }),
      transformResponse: (response: CountriesResponse) => response.countries,
      providesTags: (result) =>
        result
          ? [
              ...result.map((c) => ({ type: "Country" as const, id: c.code })),
              { type: "Country" as const, id: "LIST" },
            ]
          : [{ type: "Country" as const, id: "LIST" }],
    }),

    /** Single country by ISO code — GraphQL. Used by the destination detail page. */
    getCountry: builder.query<Country | null, string>({
      query: (code) => ({
        type: "graphql",
        document: GET_COUNTRY,
        variables: { code },
      }),
      transformResponse: (response: CountryResponse) => response.country,
      providesTags: (_result, _error, code) => [{ type: "Country", id: code }],
    }),

    /** Continents list — GraphQL. Used for the explore filter. */
    getContinents: builder.query<Continent[], void>({
      query: () => ({ type: "graphql", document: GET_CONTINENTS }),
      transformResponse: (response: ContinentsResponse) => response.continents,
      providesTags: [{ type: "Continent", id: "LIST" }],
    }),

    /** Countries scoped to one continent — GraphQL, server-side filterable. */
    getCountriesByContinent: builder.query<Country[], string>({
      query: (code) => ({
        type: "graphql",
        document: GET_COUNTRIES_BY_CONTINENT,
        variables: { code },
      }),
      transformResponse: (response: CountriesByContinentResponse) =>
        response.continent?.countries ?? [],
      providesTags: (result) =>
        result
          ? [
              ...result.map((c) => ({ type: "Country" as const, id: c.code })),
              { type: "Country" as const, id: "LIST" },
            ]
          : [{ type: "Country" as const, id: "LIST" }],
    }),
  }),
});

export const {
  useGetCountriesQuery,
  useGetCountryQuery,
  useGetContinentsQuery,
  useGetCountriesByContinentQuery,
} = countriesApi;
