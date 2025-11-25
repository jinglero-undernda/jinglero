/**
 * Centralized Field Configuration
 * 
 * Contains all field display configurations for entity forms and editors:
 * - Field ordering per entity type
 * - Excluded fields (auto-managed, redundant)
 * - Field options for dropdowns
 * - Textarea field definitions
 */

// Comprehensive list of countries (in Spanish for UI consistency)
// Most common countries (Argentina, España, México) are at the top
const COMMON_COUNTRIES = ['Argentina', 'España', 'México'];
const OTHER_COUNTRIES = [
  'Afganistán', 'Albania', 'Argelia', 'Andorra', 'Angola', 'Antigua y Barbuda', 'Armenia', 'Australia', 'Austria',
  'Azerbaiyán', 'Bahamas', 'Baréin', 'Bangladesh', 'Barbados', 'Bielorrusia', 'Bélgica', 'Belice', 'Benín', 'Bután',
  'Bolivia', 'Bosnia y Herzegovina', 'Botsuana', 'Brasil', 'Brunéi', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Camboya',
  'Camerún', 'Canadá', 'Chad', 'Chile', 'China', 'Colombia', 'Comoras', 'Congo', 'Costa Rica', 'Croacia',
  'Cuba', 'Chipre', 'República Checa', 'Dinamarca', 'Yibuti', 'Dominica', 'República Dominicana', 'Ecuador', 'Egipto', 'El Salvador',
  'Guinea Ecuatorial', 'Eritrea', 'Estonia', 'Esuatini', 'Etiopía', 'Fiyi', 'Finlandia', 'Francia', 'Gabón', 'Gambia',
  'Georgia', 'Alemania', 'Ghana', 'Grecia', 'Granada', 'Guatemala', 'Guinea', 'Guinea-Bisáu', 'Guyana', 'Haití',
  'Honduras', 'Hungría', 'Islandia', 'India', 'Indonesia', 'Irán', 'Irak', 'Irlanda', 'Israel', 'Italia',
  'Jamaica', 'Japón', 'Jordania', 'Kazajistán', 'Kenia', 'Kiribati', 'Kosovo', 'Kuwait', 'Kirguistán', 'Laos',
  'Letonia', 'Líbano', 'Lesoto', 'Liberia', 'Libia', 'Liechtenstein', 'Lituania', 'Luxemburgo', 'Madagascar', 'Malaui',
  'Malasia', 'Maldivas', 'Malí', 'Malta', 'Islas Marshall', 'Mauritania', 'Mauricio', 'Micronesia', 'Moldavia',
  'Mónaco', 'Mongolia', 'Montenegro', 'Marruecos', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Países Bajos',
  'Nueva Zelanda', 'Nicaragua', 'Níger', 'Nigeria', 'Corea del Norte', 'Macedonia del Norte', 'Noruega', 'Omán', 'Pakistán', 'Palaos',
  'Palestina', 'Panamá', 'Papúa Nueva Guinea', 'Paraguay', 'Perú', 'Filipinas', 'Polonia', 'Portugal', 'Catar', 'Rumania',
  'Rusia', 'Ruanda', 'San Cristóbal y Nieves', 'Santa Lucía', 'San Vicente y las Granadinas', 'Samoa', 'San Marino', 'Santo Tomé y Príncipe', 'Arabia Saudí', 'Senegal',
  'Serbia', 'Seychelles', 'Sierra Leona', 'Singapur', 'Eslovaquia', 'Eslovenia', 'Islas Salomón', 'Somalia', 'Sudáfrica', 'Corea del Sur',
  'Sudán del Sur', 'Sri Lanka', 'Sudán', 'Surinam', 'Suecia', 'Suiza', 'Siria', 'Taiwán', 'Tayikistán',
  'Tanzania', 'Tailandia', 'Timor Oriental', 'Togo', 'Tonga', 'Trinidad y Tobago', 'Túnez', 'Turquía', 'Turkmenistán', 'Tuvalu',
  'Uganda', 'Ucrania', 'Emiratos Árabes Unidos', 'Reino Unido', 'Estados Unidos', 'Uruguay', 'Uzbekistán', 'Vanuatu', 'Vaticano', 'Venezuela',
  'Vietnam', 'Yemen', 'Zambia', 'Zimbabue'
].sort();
export const COUNTRIES = [...COMMON_COUNTRIES, ...OTHER_COUNTRIES];

/**
 * Fields to exclude from metadata editor (per spec)
 */
export const EXCLUDED_FIELDS: Record<string, string[]> = {
  // Auto-managed fields
  _all: ['createdAt', 'updatedAt'],
  // Redundant fields (with relationships)
  jingles: ['fabricaId', 'fabricaDate', 'cancionId'],
  canciones: ['autorIds'],
  artistas: ['idUsuario'],
  // Redundant fields (derivable) - Note: youtubeUrl is NOT excluded for fabricas as it's shown read-only
  // Inherited/derived fields
  jingles_derived: ['youtubeUrl', 'timestamp', 'songTitle', 'artistName', 'genre'],
};

/**
 * Custom field ordering for specific entity types
 */
export const FIELD_ORDER: Record<string, string[]> = {
  jingle: ['id', 'autoComment', 'title', 'isJinglazo', 'isJinglazoDelDia', 'isPrecario', 'isLive', 'isRepeat', 'comment', 'youtubeClipUrl', 'lyrics'],
  fabrica: ['id', 'title', 'date', 'status', 'youtubeUrl', 'contents'],
  cancion: ['id', 'title', 'album', 'year', 'genre', 'youtubeMusic', 'lyrics', 'musicBrainzId'],
  artista: ['id', 'name', 'stageName', 'nationality', 'isArg', 'youtubeHandle', 'instagramHandle', 'twitterHandle', 'facebookProfile', 'website', 'bio', 'musicBrainzId'],
  tematica: ['id', 'name', 'description', 'category'],
};

/**
 * Field value options for dropdowns
 */
export const FIELD_OPTIONS: Record<string, Record<string, string[]>> = {
  fabrica: {
    status: ['DRAFT', 'PROCESSING', 'COMPLETED'],
  },
  artista: {
    nationality: COUNTRIES,
  },
  tematica: {
    category: ['ACTUALIDAD', 'CULTURA', 'GELATINA', 'GENTE', 'POLITICA'],
  },
};

/**
 * Fields that should be rendered as textareas (multi-line, word-wrapping)
 */
export const TEXTAREA_FIELDS: Record<string, string[]> = {
  fabrica: ['title', 'description', 'contents'],
  jingle: ['title', 'comment', 'youtubeClipUrl', 'lyrics'],
  cancion: ['title', 'lyrics'],
  artista: ['bio'],
  tematica: ['description'],
};

/**
 * Get field configuration for a specific entity type
 */
export function getFieldConfig(entityType: string) {
  return {
    fieldOrder: FIELD_ORDER[entityType] || [],
    excludedFields: [
      ...(EXCLUDED_FIELDS._all || []),
      ...(EXCLUDED_FIELDS[entityType] || []),
      ...(entityType === 'jingle' ? EXCLUDED_FIELDS.jingles_derived || [] : []),
    ],
    fieldOptions: FIELD_OPTIONS[entityType] || {},
    textareaFields: TEXTAREA_FIELDS[entityType] || [],
  };
}

