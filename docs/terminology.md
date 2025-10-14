# Terminology Reference

This document serves as the official reference for terms used in the Jinglero platform. It defines the specific terminology used throughout the application and database.

## Core Entities

### Fabrica

A YouTube video episode of "La Fabrica de Jingles" show. Each Fabrica represents a complete streaming session.

- Properties include title, date, YouTube metrics, and content markers
- Status can be: DRAFT, PROCESSING, or COMPLETED, to allow for tracking of new episodes data being collected and parsed, and future automation scripts.

### Jingle

A specific clip or segment from a Fabrica where a song is adapted.

- Contains timestamp information linking it to the source Fabrica
- Can be marked as "Jinglazo" or "Precario"
- Includes optional title.
- Core information of the song is usually captured by a one-line comment in the video description or by a YouTube user.
- Links to the original song (Cancion) it's based on

### Cancion

An original song that serves as the basis for one or more Jingles.

- Includes basic song metadata (title, album, year, genre)
- Can link to YouTube Music
- May include lyrics URL

### Artista

A performer or creator, which can be either:

- Original artist of a Cancion
- Jinglero (performer of a Jingle)
- Can be associated with a Usuario through the SOY_YO relationship

### Usuario

A registered user of the platform.

- Roles: ADMIN or MEMBER (anonymous browsing as GUEST)
- Can be linked to an Artista through verification
- Can interact with Jingles through reactions

### Tematica

A topic or theme associated with Jingles.

- Categories: ACTUALIDAD, POLITICA, CULTURA, GELATINA
- Used for content classification and discovery

## Relationships

### APPEARS_IN

Links a Jingle to its source Fabrica, including:

- Order of appearance
- Timestamp in the video

### JINGLERO_DE

Connects an Artista to a Jingle they performed.

- Status: DRAFT or CONFIRMED
- Tracks creation date

### AUTOR_DE

Links an Artista to a Cancion they created.

- Status: DRAFT or CONFIRMED
- Tracks creation date

### VERSIONA

Connects a Jingle to the original Cancion it's an adapted version of.

### TAGGED_WITH

Associates a Jingle with a Tematica for classification.

### SOY_YO

Verifies a Usuario as an Artista.

- Status: REQUESTED, REJECTED, or APPROVED
- Includes verification metadata

### REACCIONA_A

Records a Usuario's reaction to a Jingle.

- Types: ME_GUSTA, JINGLAZO, JINGLAZO_DEL_DIA
- Tracks creation, updates, and removal

## Special Terms

### Jinglazo

A highly regarded or exceptional Jingle, as determined by user reactions.

### Jinglazo del Día

A Jingle that has been selected as the day's best performance.

### Precario

A Jingle marked with this flag indicates that the contributor recorded it with precarious means, such as a karaoke version rather than elaborate production, or that it is clearly an amateur singer. Usually the Precario flag also highlights originality and witty/daring submissions.
