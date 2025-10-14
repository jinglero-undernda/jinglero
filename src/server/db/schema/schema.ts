/*
Graph Schema Documentation

Nodes:
------
1. Usuario
   Labels: Usuario
   Properties:
   - id: string (UUID)
   - email: string (unique)
   - role: string (enum: ADMIN, MEMBER)
   - youtubeHandle: string (optional, unique)
   - createdAt: datetime
   - lastLogin: datetime (optional)
   - updatedAt: datetime

2. Jingle
   Labels: Jingle
   Properties:
   - id: string (UUID)
   - youtubeUrl: string (based on the Fabrica URL and timestamp)
   - timestamp: number (in seconds, derived from the relationship to Fabrica)
   - title: string (optional)
   - comment: string (optional)
   - commentAuthor: string (optional)
   - lyrics: string (optional)
   - songTitle: string (inherited from the associated Cancion)
   - artistName: string (inherited from the associated Cancion's Artista)
   - genre: string (optional, inherited from the associated Cancion)
   - isJinglazo: boolean
   - isJinglazoDelDia: boolean
   - isPrecario: boolean
   - createdAt: datetime
   - updatedAt: datetime

3. Artista
   Labels: Artista
   Properties:
   - id: string (UUID)
   - name: string (unique)
   - isUsuario: boolean (indicates if the artist is also a user ,inherited from relationship)
   - createdAt: datetime
   - updatedAt: datetime

4. Cancion 
   Labels: Cancion
   Properties:
   - id: string (UUID)
   - title: string
   - album: string (optional)
   - year: number (optional)
   - genre: string (optional)
   - youtubeMusic: string (optional)
   - lyrics: string (optional, URL to retrieve lyrics)
   - createdAt: datetime
   - updatedAt: datetime

5. Fabrica
   Labels: Fabrica
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
   Properties:
   - id: string (UUID)
   - name: string (unique)
   - category: string (optional enum: ACTUALIDAD, POLITICA, CULTURA, GELATINA)
   - description: string
   - createdAt: datetime
   - updatedAt: datetime

Relationships:
-------------
1. APPEARS_IN
   Start Node: Jingle
   End Node: Fabrica
   Properties:
   - order: number
   - timestamp: number

2. JINGLERO_DE
   Start Node: Artista
   End Node: Jingle
   Properties:
   - status: string (enum: DRAFT, CONFIRMED)
   - createdAt: datetime

3. AUTOR_DE
   Start Node: Artista
   End Node: Cancion
   Properties:
   - status: string (enum: DRAFT, CONFIRMED)
   - createdAt: datetime

4. VERSIONA
   Start Node: Jingle
   End Node: Cancion
   Properties:
   - createdAt: datetime

5. TAGGED_WITH
   Start Node: Jingle
   End Node: Tematica
   Properties:
   - createdAt: datetime
   
6. SOY_YO
   Start Node: Usuario
   End Node: Artista
   Properties:
   - status: string (enum: REQUESTED, REJECTED, APPROVED)
   - requestedAt: datetime
   - verified: boolean (if APPROVED)
   - verifiedAt: datetime (either APPROVED or REJECTED date)
   - verifiedBy: string (user ID)

7. REACCIONA_A
   Start Node: Usuario
   End Node: Jingle
   Properties:
   - type: string (enum: ME_GUSTA, JINGLAZO, JINGLAZO_DEL_DIA)
   - createdAt: datetime
   - updatedAt: datetime
   - removedAt: datetime (optional, if the reaction was removed)

*/