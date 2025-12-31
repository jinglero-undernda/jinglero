import { publicApi } from '../api';
import type { Artista, Cancion, Fabrica, Jingle, Tematica } from '../../types';

type ShareEntityType = 'fabrica' | 'jingle' | 'artista' | 'cancion' | 'tematica';

const WWW_BASE_ORIGIN = 'https://www.jingle.ar';

function normalizeToWwwJingleAr(rawHref: string): string {
  const url = new URL(rawHref);
  url.protocol = 'https:';
  url.username = '';
  url.password = '';
  url.host = 'www.jingle.ar';
  url.port = ''; // Explicitly clear port (important for localhost:5173)
  return url.toString();
}

function parseShareContextFromPathname(
  pathname: string
): { entityType: ShareEntityType; entityId: string } | null {
  // Normalize trailing slash
  const path = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
  const parts = path.split('/').filter(Boolean);
  if (parts.length !== 2) return null;

  const [prefix, id] = parts;
  if (!id) return null;

  switch (prefix) {
    case 'f':
      return { entityType: 'fabrica', entityId: id };
    case 'show':
      // Treat /show/:id as Fabrica for messaging + fetch, but keep the /show/:id URL as the shared link.
      return { entityType: 'fabrica', entityId: id };
    case 'j':
      return { entityType: 'jingle', entityId: id };
    case 'a':
      return { entityType: 'artista', entityId: id };
    case 'c':
      return { entityType: 'cancion', entityId: id };
    case 't':
      return { entityType: 'tematica', entityId: id };
    default:
      return null;
  }
}

function getPrefixForEntityType(entityType: ShareEntityType): string {
  switch (entityType) {
    case 'fabrica':
      return 'Mira esta Fabrica en la Cooperativa jingle.ar:';
    case 'jingle':
      return 'Mira este Jingle en la Cooperativa jingle.ar:';
    case 'artista':
      return 'Mira este Artista en la Cooperativa jingle.ar:';
    case 'cancion':
      return 'Mira esta Materia Prima (Cancion) en la Cooperativa jingle.ar:';
    case 'tematica':
      return 'Mira esta Tematica en la Cooperativa jingle.ar:';
  }
}

function buildEntityLine(displayPrimary?: string, displaySecondary?: string): string | null {
  if (!displayPrimary || !displayPrimary.trim()) return null;
  
  // displayPrimary already includes the emoji icon as first character - preserve it
  const primary = displayPrimary.trim();
  
  // displaySecondary may also contain emojis - preserve them
  // displaySecondary format is like "🚚: Artist • Album • Year • 🎤: Count"
  // We want: "📦 Title | 🚚: Artist • Album • Year • 🎤: Count"
  const secondary = (displaySecondary || '').trim();
  
  // Join with a clean separator (space-pipe-space) if secondary exists
  if (secondary) {
    return `${primary} | ${secondary}`;
  }
  
  return primary;
}

async function fetchEntityDisplayFields(
  entityType: ShareEntityType,
  entityId: string
): Promise<{ displayPrimary?: string; displaySecondary?: string } | null> {
  try {
    switch (entityType) {
      case 'fabrica': {
        const fabrica = (await publicApi.getFabrica(entityId)) as Fabrica;
        return { displayPrimary: fabrica.displayPrimary, displaySecondary: fabrica.displaySecondary };
      }
      case 'jingle': {
        const jingle = (await publicApi.getJingle(entityId)) as Jingle;
        return { displayPrimary: jingle.displayPrimary, displaySecondary: jingle.displaySecondary };
      }
      case 'artista': {
        const artista = (await publicApi.getArtista(entityId)) as Artista;
        return { displayPrimary: artista.displayPrimary, displaySecondary: artista.displaySecondary };
      }
      case 'cancion': {
        const cancion = (await publicApi.getCancion(entityId)) as Cancion;
        return { displayPrimary: cancion.displayPrimary, displaySecondary: cancion.displaySecondary };
      }
      case 'tematica': {
        const tematica = (await publicApi.getTematica(entityId)) as Tematica;
        return { displayPrimary: tematica.displayPrimary, displaySecondary: tematica.displaySecondary };
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

export async function buildWhatsAppShareMessageForCurrentPage(): Promise<{
  message: string;
  normalizedUrl: string;
}> {
  const normalizedUrl = normalizeToWwwJingleAr(window.location.href);
  const url = new URL(normalizedUrl);

  const ctx = parseShareContextFromPathname(url.pathname);
  if (!ctx) {
    const message = ['¡Mira esto en Cooperativa jingle.ar!', '', normalizedUrl].join('\n');
    return { message, normalizedUrl };
  }

  const prefix = getPrefixForEntityType(ctx.entityType);
  const display = await fetchEntityDisplayFields(ctx.entityType, ctx.entityId);
  const entityLine = buildEntityLine(display?.displayPrimary, display?.displaySecondary);

  const lines: string[] = [prefix];
  if (entityLine) lines.push(entityLine);
  lines.push('', normalizedUrl);

  return { message: lines.join('\n'), normalizedUrl };
}

export async function openWhatsAppShareForCurrentPage(): Promise<void> {
  const { message } = await buildWhatsAppShareMessageForCurrentPage();
  
  // Normalize Unicode before encoding (handles emoji variations and ensures proper encoding)
  // NFC (Canonical Composition) is the standard form for most use cases
  const normalizedMessage = message.normalize('NFC');
  
  // Use api.whatsapp.com instead of wa.me for better emoji support
  // encodeURIComponent properly handles emojis (they become percent-encoded UTF-8)
  const encodedMessage = encodeURIComponent(normalizedMessage);
  const waUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
  
  window.open(waUrl, '_blank', 'noopener,noreferrer');
}

export { WWW_BASE_ORIGIN, normalizeToWwwJingleAr, parseShareContextFromPathname };


