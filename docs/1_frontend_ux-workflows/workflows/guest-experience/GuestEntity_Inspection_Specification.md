# Entity Inspection Specification for Guest Users

## Fabrica

Title: Fabrica (Heading Row)

- Jingles (Expandable Content Row)
  - [CTR monitor - limited height]
  - [Cancion]
  - [Autor]
  - [Jinglero]
  - [Tematica]

## Jingle

Title: Jingle (Heading Row)

- [CTR monitor - full width]
- Fabrica (Expandable Content Row)
  - [Jingles] (including the parent)
- Cancion (Expandable Content Row)
  - [CTR monitor - limited height]
  - [Autores]
  - [Jingles] (including the parent)
- Jinglero (Expandable Content Row)
  - [Jingles] (including the parent)
- Versiones (Jingles)
  - [CTR monitor - limited height]
- Tematicas (Expandable Content Row)
  - [Jingles] (including the parent)

## Cancion

Title: Cancion (Heading Row)

- [CTR monitor - full width]
- [Autores] (expandable content row)
  - [Canciones] (including the parent)
- [Jingles] (expandable content row)
  - [CTR monitor - limited height]
  - [Fabrica]
  - [Jingleros]
  - [Tematicas]

## Artista

Title: Autor (Heading Row)

- [Canciones] (expandable content row)
  - [CTR monitor - limited height]
  - [Jingles]
- [Jingles] (expandable content row)
  - [CTR monitor - limited height]
  - [Canciones]

## Tematica

Title: Tematica (Heading Row)

- [Jingles] (expandable content row)
  - [CTR monitor - limited height]
  - [Fabrica]
  - [Cancion]
  - [Jingleros]
  - [Tematicas]
