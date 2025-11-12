/*
Graph Schema Documentation

Nodes:
------
1. Usuario
   Labels: Usuario
   Import file: node-Usuario-YYYY-MM-DD.csv
   Properties:
   - id: string (UUID)
   - email: string (unique)
   - role: string (enum: ADMIN, GUEST)
   - artistId: string (optional, indicates if the user is also an artist, inherited from relationship)
   - displayName: string
   - profilePictureUrl: string (optional)
   - twitterHandle: string (optional, unique)
   - instagramHandle: string (optional, unique)
   - facebookProfile: string (optional, unique)
   - youtubeHandle: string (optional, unique)
   - contributionsCount: number
   - createdAt: datetime
   - lastLogin: datetime (optional)
   - updatedAt: datetime


2. Jingle
   Labels: Jingle
   Import file: node-Jingle-YYYY-MM-DD.csv
   Properties:
   - id: string (UUID)
   - youtubeUrl: string (based on the Fabrica URL and timestamp)
   - timestamp: number (in seconds, derived from the relationship to Fabrica)
   - youtubeClipUrl: string (for clips of the jingle on YouTube)
   - title: string (optional)
   - comment: string (optional)
   - lyrics: string (optional)
   - songTitle: string (inherited from the associated Cancion)
   - artistName: string (inherited from the associated Cancion's Artista)
   - genre: string (optional, inherited from the associated Cancion)
   - isJinglazo: boolean
   - isJinglazoDelDia: boolean
   - isPrecario: boolean
  - fabricaId: string (optional, redundant with APPEARS_IN relationship - for performance)
  - fabricaDate: datetime (optional, redundant with APPEARS_IN->Fabrica.date - for display/query performance)
  - cancionId: string (optional, redundant with VERSIONA relationship - for performance)
  - isLive: boolean (optional, indicates if Jingle was performed live)
  - isRepeat: boolean (optional, indicates if this song was performed on the show before)
   - createdAt: datetime
   - updatedAt: datetime

3. Artista
   Labels: Artista
   Import file: node-Artista-YYYY-MM-DD.csv
   Properties:
   - id: string (UUID)
   - name: string (unique)
   - stageName: string (optional)
   - idUsuario: string (optional, indicates if the artist is also a user ,inherited from relationship)
   - nationality: string (optional)
   - isArg: boolean (indicates if the artist is from Argentina)
   - youtubeHandle: string (optional)
   - instagramHandle: string (optional)
   - twitterHandle: string (optional)
   - facebookProfile: string (optional)
   - website: string (optional)
   - bio: string (optional)
   - createdAt: datetime
   - updatedAt: datetime

4. Cancion 
   Labels: Cancion
   Import file: node-Cancion-YYYY-MM-DD.csv
   Properties:
   - id: string (UUID)
   - title: string
   - album: string (optional)
   - year: number (optional)
   - genre: string (optional)
   - youtubeMusic: string (optional)
   - lyrics: string (optional, URL to retrieve lyrics)
   - autorIds: string[] (optional, redundant with AUTOR_DE relationships - for performance)
   - createdAt: datetime
   - updatedAt: datetime

5. Fabrica
   Labels: Fabrica
   Import file: node-Fabrica-YYYY-MM-DD.csv
   Properties:
   - id: string (UUID - Youtube video ID)
   - title: string
   - date: datetime
   - youtubeUrl: string
   - visualizations: number
   - likes: number
   - description: string
   - contents: string (based on a comment in the YouTube video)
   - status: string (enum: DRAFT, PROCESSING, COMPLETED)
   - createdAt: datetime
   - updatedAt: datetime

6. Tematica
   Labels: Tematica
   Import file: node-Tematica-YYYY-MM-DD.csv
   Properties:
   - id: string (UUID)
   - name: string (unique)
   - category: string (optional enum: ACTUALIDAD, POLITICA, CULTURA, GENTE, GELATINA)
   - description: string
   - createdAt: datetime
   - updatedAt: datetime

Relationships:
-------------
1. APPEARS_IN
   Start Node: Jingle
   End Node: Fabrica
   Import file: rel-Jingle-APPEARS_IN-Fabrica-YYYY-MM-DD.csv
   Properties:
   - order: number
   - timestamp: number

2. JINGLERO_DE
   Start Node: Artista
   End Node: Jingle
   Import file: rel-Artista-JINGLERO_DE-Jingle-YYYY-MM-DD.csv
   Properties:
   - status: string (enum: DRAFT, CONFIRMED)
   - createdAt: datetime

3. AUTOR_DE
   Start Node: Artista
   End Node: Cancion
   Import file: rel-Artista-AUTOR_DE-Cancion-YYYY-MM-DD.csv
   Properties:
   - status: string (enum: DRAFT, CONFIRMED)
   - createdAt: datetime

4. VERSIONA
   Start Node: Jingle
   End Node: Cancion
   Import file: rel-Jingle-VERSIONA-Cancion-YYYY-MM-DD.csv
   Properties:
   - status: string (enum: DRAFT, CONFIRMED)
   - createdAt: datetime

5. TAGGED_WITH
   Start Node: Jingle
   End Node: Tematica
   Import file: rel-Jingle-TAGGED_WITH-Tematica-YYYY-MM-DD.csv
   Properties:
   - isPrimary: boolean
   - status: string (enum: DRAFT, CONFIRMED)
   - createdAt: datetime
   
6. SOY_YO
   Start Node: Usuario
   End Node: Artista
   Import file: rel-Usuario-SOY_YO-Artista-YYYY-MM-DD.csv
   Properties:
   - status: string (enum: REQUESTED, REJECTED, APPROVED)
   - requestedAt: datetime
   - isVerified: boolean (if APPROVED)
   - verifiedAt: datetime (either APPROVED or REJECTED date)
   - verifiedBy: string (user ID)

7. REACCIONA_A
   Start Node: Usuario
   End Node: Jingle
   Import file: rel-Usuario-REACCIONA_A-Jingle-YYYY-MM-DD.csv
   Properties:
   - type: string (enum: ME_GUSTA, JINGLAZO, JINGLAZO_DEL_DIA)
   - createdAt: datetime
   - updatedAt: datetime
   - removedAt: datetime (optional, if the reaction was removed)

*/