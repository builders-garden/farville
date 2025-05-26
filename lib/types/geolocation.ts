export type Geo = {
  /** The city that the request originated from. */
  city?: string;
  /** The country that the request originated from. */
  country?: string;
  /** The flag emoji for the country the request originated from. */
  flag?: string;
  /** The [Vercel Edge Network region](https://vercel.com/docs/concepts/edge-network/regions) that received the request. */
  region?: string;
  /** The region part of the ISO 3166-2 code of the client IP.
   * See [docs](https://vercel.com/docs/concepts/edge-network/headers#x-vercel-ip-country-region).
   */
  countryRegion?: string;
  /** The latitude of the client. */
  latitude?: string;
  /** The longitude of the client. */
  longitude?: string;
  /** The postal code of the client */
  postalCode?: string;
};
