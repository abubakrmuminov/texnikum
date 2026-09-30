import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Bus,
  Clock,
  Compass,
  ExternalLink,
  Mail,
  MapPin,
  Navigation,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactsFeedbackForm, CopyAddressButton } from '@/components/contacts/contacts-client';
import { apiClient, FALLBACK_CONTACTS } from '@/lib/api-client';

export const metadata: Metadata = {
  title: 'Bogʻlanish va aloqa maʼlumotlari — Fargʻona 2-son texnikumi',
  description:
    'Oʻquv binolari manzillari, talabalar turar joyi, qabul komissiyasi telefonlari, ish vaqti va shahar jamoat transporti yoʻnalishlari.',
};

export default async function ContactsPage(): Promise<JSX.Element> {
  const contacts = await apiClient.getContacts().catch(() => FALLBACK_CONTACTS);
  const campuses = contacts?.campuses?.length ? contacts.campuses : FALLBACK_CONTACTS.campuses;
  const phones = contacts?.phones?.length ? contacts.phones : FALLBACK_CONTACTS.phones;
  const directions = contacts?.directions || FALLBACK_CONTACTS.directions;
  const mapCoordinates = contacts?.mapCoordinates || FALLBACK_CONTACTS.mapCoordinates;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-12">
      {/* Хлебные крошки и заголовок */}
      <div>
        <nav aria-label="Xleb kırıntilari" className="mb-3 text-xs text-muted-foreground flex items-center gap-1.5">
          <Link href="/" className="hover:text-primary transition-colors">
            Bosh sahifa
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium" aria-current="page">
            Aloqa
          </span>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Bogʻlanish va aloqa maʼlumotlari
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Texnikum boʻlimlari telefonlari, oʻquv binolari manzillari, qabul komissiyasi ish tartibi va shahar jamoat transporti yoʻnalishlari.
        </p>
      </div>

      {/* Адреса корпусов техникума */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          Texnikum binolari va boʻlinmalari
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {campuses.map((camp, idx) => (
            <Card key={camp.id || idx} className="flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MapPin className="size-4" aria-hidden="true" />
                  </span>
                  <CardTitle className="text-base font-bold text-foreground leading-snug">
                    {camp.name}
                  </CardTitle>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="text-foreground font-medium">{camp.address}</p>
                  <CopyAddressButton address={camp.address} />
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs flex-1 flex flex-col justify-between pt-0">
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="text-muted-foreground">
                    <span className="font-semibold text-foreground">Boʻlinmalar: </span>
                    {camp.departments}
                  </div>

                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Phone className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                    <a href={`tel:${camp.phone.replace(/[^0-9+]/g, '')}`} className="hover:underline">
                      {camp.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                    <a href={`mailto:${camp.email}`} className="hover:underline">
                      {camp.email}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                    <span>{camp.workHours}</span>
                  </div>

                  <div className="flex items-center gap-2 text-primary font-medium">
                    <Navigation className="size-3.5 shrink-0" aria-hidden="true" />
                    <span>{camp.transport}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Телефонный справочник подразделений */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          Asosiy boʻlimlar telefon maʼlumotnomasi
        </h2>

        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border uppercase text-[11px] font-semibold text-muted-foreground">
                <th className="p-3.5">Boʻlim / Xizmat</th>
                <th className="p-3.5 w-52">Telefon</th>
                <th className="p-3.5 hidden sm:table-cell">Vazifasi</th>
              </tr>
            </thead>
            <tbody>
              {phones.map((item, idx) => (
                <tr key={item.id || idx} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-3.5 font-medium text-foreground">
                    {item.title}
                  </td>
                  <td className="p-3.5 font-bold text-primary font-mono whitespace-nowrap">
                    <a href={`tel:${item.phone.replace(/[^0-9+]/g, '')}`} className="hover:underline">
                      {item.phone}
                    </a>
                  </td>
                  <td className="p-3.5 text-muted-foreground hidden sm:table-cell">
                    {item.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Интерактивная карта OpenStreetMap и форма обратной связи */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Интерактивная схема проезда / Карта */}
        <section className="lg:col-span-7 space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Compass className="size-5 text-primary" aria-hidden="true" />
            <span>Bosh binoga kelish yoʻnalishi</span>
          </h2>

          <div className="p-6 rounded-2xl border border-border bg-muted/40 space-y-4">
            <div className="space-y-3 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  <Bus className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <strong className="text-foreground block">Shahar jamoat transportida:</strong>
                  <span>{directions.bus}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  <Navigation className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <strong className="text-foreground block">Moʻljal:</strong>
                  <span>{directions.landmark}</span>
                </div>
              </div>
            </div>

            {/* Картографический блок OpenStreetMap */}
            <div className="w-full rounded-xl border border-border bg-card overflow-hidden shadow-inner flex flex-col">
              <div className="aspect-[16/9] w-full bg-muted">
                <iframe
                  title="Fargʻona 2-son texnikumi OpenStreetMap xaritasi"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${(mapCoordinates.lng - 0.0164).toFixed(4)}%2C${(mapCoordinates.lat - 0.0114).toFixed(4)}%2C${(mapCoordinates.lng + 0.0186).toFixed(4)}%2C${(mapCoordinates.lat + 0.0116).toFixed(4)}&amp;layer=mapnik&amp;marker=${mapCoordinates.lat}%2C${mapCoordinates.lng}`}
                />
              </div>

              <div className="p-4 bg-card flex flex-wrap items-center justify-between gap-3 text-xs border-t border-border">
                <div className="space-y-0.5">
                  <span className="font-bold text-foreground block">
                    Fargʻona 2-son texnikumi (OpenStreetMap)
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    GPS koordinatalar: {mapCoordinates.lat}° N, {mapCoordinates.lng}° E
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${mapCoordinates.lat}&amp;mlon=${mapCoordinates.lng}#map=16/${mapCoordinates.lat}/${mapCoordinates.lng}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="sm" variant="outline" className="text-xs gap-1.5">
                      <span>OpenStreetMap</span>
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </Button>
                  </a>
                  <a
                    href={`https://maps.google.com/?q=${mapCoordinates.lat},${mapCoordinates.lng}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="sm" variant="outline" className="text-xs gap-1.5">
                      <span>Google Maps</span>
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Форма онлайн-обращения */}
        <section className="lg:col-span-5 p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">
              Elektron murojaat yuborish
            </h2>
            <p className="text-xs text-muted-foreground">
              Texnikum rahbariyati, oʻquv boʻlimi yoki qabul komissiyasiga savol yoki murojaatingizni yoʻllang.
            </p>
          </div>

          <ContactsFeedbackForm />
        </section>
      </div>
    </div>
  );
}
