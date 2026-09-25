# Hero artwork

- Mobile asset: `app/assets/images/ai/assistant-v2.png` (transparent PNG).
- Desktop asset: `app/assets/images/ai/chip.svg` (editable SVG).
- The robot was made with the built-in `image_gen` tool using
  `example/Снимок экрана 2026-09-24 205844.png` as a visual reference.
- The responsive `<picture class="service-hero-artwork">` in `app/index.html`
  selects the desktop asset from 640px upward. Both sources can be replaced for
  other services. The icon cards remain separate editable HTML.

## Generation prompt

Use case: stylized-concept. Asset type: transparent mobile website hero
illustration. The attached image is a STYLE AND SUBJECT REFERENCE only, not an
edit target: focus on the tiny friendly white 3D robot in the center of the
phone screen. Generate only that robot as a clean polished three-dimensional
rendered cutout on a truly transparent background. Single small friendly
floating robot, pearly white rounded plastic body, rounded white head, dark
midnight blue glass face with two luminous cyan oval eyes and a small gentle
smile. Short white antenna with a tiny lavender tip, rounded articulated arms
spread slightly, small hovering feet. A vivid periwinkle blue microchip with
protruding chip pins is centered on its belly and has exactly the text "AI" in
white. Front view slightly from above, white glossy plastic, soft violet and
blue bounced light, dimensional smooth reflections and soft ambient occlusion.
Similar character proportions to the attached robot, slightly large head and
short body, refined soft 3D product illustration. Composition: robot centered,
fills 85% of square image, all parts visible with margin. No card, no UI, no
headings, no extra words, no circular orbit lines, no colored background, no
drawn 2D vector outlines. Output a transparent PNG reusable as a standalone
website image.
