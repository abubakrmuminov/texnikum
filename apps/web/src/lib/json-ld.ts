import { InstitutionPublicSettings } from '@college/shared';

/**
 * Builds schema.org EducationalOrganization JSON-LD object.
 * Strictly includes ONLY filled fields and omits empty/null fields.
 */
export function buildEducationalOrgJsonLd(
  institution: InstitutionPublicSettings | null,
): Record<string, unknown> | null {
  if (!institution) {
    return null;
  }

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
  };

  if (institution.nameUz) {
    jsonLd.name = institution.nameUz;
  }
  if (institution.shortNameUz) {
    jsonLd.alternateName = institution.shortNameUz;
  }
  if (institution.websiteDomain) {
    const domain = institution.websiteDomain.startsWith('http')
      ? institution.websiteDomain
      : `https://${institution.websiteDomain}`;
    jsonLd.url = domain;
  }
  if (institution.logoUrl) {
    jsonLd.logo = institution.logoUrl;
    jsonLd.image = institution.logoUrl;
  }
  if (institution.mainPhone) {
    jsonLd.telephone = institution.mainPhone;
  }
  if (institution.contactEmail) {
    jsonLd.email = institution.contactEmail;
  }
  if (institution.legalAddressUz) {
    jsonLd.address = {
      '@type': 'PostalAddress',
      streetAddress: institution.legalAddressUz,
      addressCountry: 'UZ',
    };
  }
  if (
    typeof institution.geoLatitude === 'number' &&
    typeof institution.geoLongitude === 'number' &&
    (institution.geoLatitude !== 0 || institution.geoLongitude !== 0)
  ) {
    jsonLd.geo = {
      '@type': 'GeoCoordinates',
      latitude: institution.geoLatitude,
      longitude: institution.geoLongitude,
    };
  }
  if (institution.stirInn) {
    jsonLd.taxID = institution.stirInn;
  }

  const socialLinks = [
    institution.socialTelegram,
    institution.socialInstagram,
    institution.socialFacebook,
    institution.socialYoutube,
  ].filter(Boolean) as string[];

  if (socialLinks.length > 0) {
    jsonLd.sameAs = socialLinks;
  }

  return jsonLd;
}
