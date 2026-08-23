/* ===========================================================================
   THE ARTWORK LIST  —  this is the only file you need to edit to add art.

   HOW TO ADD A PIECE
   1. Name the image file after the artwork, using underscores for spaces:
        Tidal_Glow.jpg   ->   shown on the site as "Tidal Glow"
   2. Put it in the  pixel/  folder.
   3. Add a line at the TOP of the list below (newest first):
        { file: 'Tidal_Glow.jpg', featured: true },
   4. Run  python tools/make-thumbs.py
   5. Save. Refresh the site. Done.

   FIELDS
     file  - the filename inside pixel/ . This is the only required one.
     title - only if you want the caption to differ from the filename.
             Left out, the title is the filename with _ turned into spaces.
     year  - shown next to the title. Optional.
     tags  - which filter buttons it appears under. Optional.
             The buttons build themselves from the tags actually used here.
             With no tags anywhere, the filter bar hides itself.
     note  - a longer caption, shown in the lightbox. Optional.
     featured - true puts it on the home page strip. Optional.
                The first featured piece is also the big home page image.

   A fuller entry, if you want one:
     { file: 'Tidal_Glow.jpg', year: 2026, tags: ['scenes'], featured: true },

   Careful: keep the commas and quotes exactly as they are.
   =========================================================================== */

window.PIXEL_ART = [
  { file: 'Under_the_Surface.jpg', featured: true },
  { file: 'Hidden_in_Green.jpg', featured: true },
  { file: 'Tidal_Glow.jpg', featured: true },
  { file: 'Manta_Ray_Dive.jpg', featured: true }
];
