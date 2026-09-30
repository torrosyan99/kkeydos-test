const fs = require('node:fs');
const world = JSON.parse(fs.readFileSync('tmp/about-world-countries.json', 'utf8'));
const project = ([lon, lat]) => [40 + ((lon + 180) / 360) * 1120, 40 + (85 - lat) * 3.2];
const round = (n) => Number(n.toFixed(1));
const point = (coordinates) => project(coordinates).map(round);
const arcs = world.arcs.map((arc) => {
  let x = 0;
  let y = 0;
  return arc.map(([dx, dy]) => {
    x += dx;
    y += dy;
    return point([
      x * world.transform.scale[0] + world.transform.translate[0],
      y * world.transform.scale[1] + world.transform.translate[1],
    ]);
  });
});
const ring = (indices) => {
  const coordinates = indices.flatMap((index, i) => {
    const arc = index < 0 ? [...arcs[~index]].reverse() : arcs[index];
    return i ? arc.slice(1) : arc;
  });
  const unwrapped = coordinates.map(([x, y], index) => {
    if (index) {
      while (x - coordinates[index - 1][0] > 560) x -= 1120;
      while (x - coordinates[index - 1][0] < -560) x += 1120;
    }
    coordinates[index] = [x, y];
    return [round(x), y];
  });
  return `M${unwrapped.map((p) => p.join(',')).join('L')}Z`;
};
const locations = [
  { name: 'USA', id: '840', coordinates: [-98, 39], label: [207, 211, 102] },
  { name: 'Canada', id: '124', coordinates: [-106, 57], label: [169, 77, 130] },
  { name: 'Germany', id: '276', coordinates: [10.5, 51], label: [667, 113, 144] },
  { name: 'Denmark', id: '208', coordinates: [10, 56.5], label: [608, 43, 145] },
  { name: 'Netherlands', id: '528', coordinates: [5.3, 52.1], label: [406, 132, 177] },
  { name: 'Qatar', id: '634', coordinates: [51.18, 25.35], label: [611, 212, 108] },
  { name: 'Dubai, UAE', id: '784', coordinates: [55.27, 25.2], label: [619, 272, 163] },
  { name: 'Singapore', id: '702', coordinates: [103.82, 1.35], label: [1015, 302, 165] },
  { name: 'Philippines', id: '608', coordinates: [122, 13], label: [1012, 221, 171] },
  { name: 'South Africa', id: '710', coordinates: [25, -29], label: [705, 429, 178] },
];
const headquarters = point([78.4867, 17.385]);
const active = new Set(locations.map(({ id }) => id));
const countries = world.objects.countries.geometries
  .filter(({ id }) => id !== '010')
  .map((country, index) => {
    const polygons = country.type === 'Polygon' ? [country.arcs] : country.arcs;
    const d = polygons.flatMap((polygon) => polygon.map(ring)).join('');
    const fill = country.id === '356' ? '#f48949' : active.has(country.id) ? '#62b6b5' : '#dce8ec';
    return `<path id="country-${index}" fill="${fill}" d="${d}"/><use href="#country-${index}" transform="translate(-1120 0)"/><use href="#country-${index}" transform="translate(1120 0)"/>`;
  }).join('\n');
const connections = locations.map(({ coordinates }) => {
  const [x, y] = point(coordinates);
  const [hx, hy] = headquarters;
  const cy = Math.min(y, hy) - Math.min(110, Math.abs(hx - x) * 0.2 + 25);
  return `<path d="M${hx},${hy}Q${round((hx + x) / 2)},${round(cy)} ${x},${y}"/>`;
}).join('\n');
const markers = locations.map(({ name, coordinates, label: [lx, ly, width] }) => {
  const [x, y] = point(coordinates);
  const endX = Math.max(lx + 12, Math.min(lx + width - 12, x));
  const endY = y < ly ? ly : y > ly + 40 ? ly + 40 : y;
  return `<g>
    <title>${name} — clients and partnerships</title>
    <path d="M${x},${y}L${endX},${endY}" fill="none" stroke="#0f8a8d" stroke-width="1.4" stroke-opacity="0.6"/>
    <circle cx="${x}" cy="${y}" r="10" fill="#0f8a8d" fill-opacity="0.12"/>
    <circle cx="${x}" cy="${y}" r="5.5" fill="#0f8a8d" stroke="#fff" stroke-width="2"/>
    <rect x="${lx}" y="${ly}" width="${width}" height="40" rx="10" fill="#fff" stroke="#e2e8e0"/>
    <text x="${lx + 12}" y="${ly + 26}" font-size="19" font-weight="600">${name}</text>
  </g>`;
}).join('\n');
const [hx, hy] = headquarters;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 520" role="img" aria-labelledby="map-title map-description">
  <title id="map-title">Our Global Footprint</title>
  <desc id="map-description">KKEYDOS headquarters in Hyderabad, India, connected to client and partnership presence in the USA, Canada, Germany, Denmark, Netherlands, Qatar, Dubai in the UAE, Singapore, Philippines, and South Africa.</desc>
  <!-- Geography: Natural Earth public-domain data, distributed by https://github.com/topojson/world-atlas (countries-110m, v2). Country markers indicate presence, not office addresses. -->
  <defs><clipPath id="map-extent"><rect x="40" y="30" width="1120" height="480"/></clipPath></defs>
  <g clip-path="url(#map-extent)" stroke="#fff" stroke-width="0.8" stroke-linejoin="round">${countries}</g>
  <g fill="none" stroke="#f48949" stroke-width="1.8" stroke-dasharray="4 5" stroke-opacity="0.8">${connections}</g>
  <g font-family="Arial, sans-serif" fill="#0f172a">${markers}
    <path d="M${hx},${hy}L${hx},340" fill="none" stroke="#f48949" stroke-width="2"/>
    <circle cx="${hx}" cy="${hy}" r="22" fill="#f48949" fill-opacity="0.18"/>
    <circle cx="${hx}" cy="${hy}" r="14" fill="#f48949" stroke="#fff" stroke-width="3"/>
    <circle cx="${hx}" cy="${hy}" r="5" fill="#fff"/>
    <rect x="788" y="340" width="225" height="65" rx="12" fill="#fff" stroke="#f48949" stroke-width="1.5"/>
    <text x="804" y="366" font-size="21" font-weight="700">Hyderabad, India</text>
    <text x="804" y="390" font-size="17" fill="#a54b16">Headquarters</text>
    <circle cx="65" cy="440" r="8" fill="#f48949"/>
    <text x="86" y="446" font-size="18">Headquarters</text>
    <circle cx="65" cy="474" r="6" fill="#0f8a8d"/>
    <text x="86" y="480" font-size="18">Clients &amp; partnerships</text>
  </g>
</svg>`;
fs.writeFileSync('app/assets/images/pages/about/global-footprint.svg', svg);
if (process.argv.includes('--map-only')) process.exit(0);

const htmlFile = 'app/about/index.html';
let html = fs.readFileSync(htmlFile, 'utf8');
const start = html.lastIndexOf('              <section', html.indexOf('id="our-team"'));
const end = html.indexOf('</section>', start) + '</section>'.length;
if (start < 0 || end < start) throw new Error('Team section not found');
const list = locations.map(({ name }) => `<li class="flex items-center gap-2"><span class="bg-brand-teal size-1.5 shrink-0 rounded-full" aria-hidden="true"></span>${name}</li>`).join('\n');
const section = `              <section
                id="our-team"
                class="max-middle:pb-24 max-middle:pl-12 relative scroll-mt-28 pb-40 pl-14 max-xl:pb-32"
                data-story-step=""
              >
                <span class="about-stop ring-brand-orange/15 bg-brand-orange absolute top-1 left-0 size-8 rounded-full ring-8 transition duration-500 motion-reduce:transition-none" aria-hidden="true"></span>
                <div class="-mt-4 flex items-center gap-12 max-lg:flex-col max-lg:items-stretch max-middle:gap-8 max-sm:-mt-2">
                  <div class="w-80 shrink-0 max-lg:w-full">
                    <h2 class="mb-6 text-5xl font-medium max-notebook:text-4xl max-middle:text-3xl">Our Global Footprint</h2>
                    <p class="text-brand-gray mb-8 text-xl max-middle:text-base">From our headquarters in Hyderabad, India, we work with clients and partners around the world.</p>
                    <div class="border-brand-orange mb-8 border-l-2 pl-4">
                      <p class="text-brand-gray mb-1 text-sm">Headquarters</p>
                      <p class="text-xl font-semibold">Hyderabad, India</p>
                    </div>
                    <h3 class="mb-4 text-base font-semibold">Clients &amp; partnerships</h3>
                    <ul class="text-brand-gray grid grid-cols-2 gap-x-4 gap-y-3 text-base">${list}</ul>
                  </div>
                  <figure class="bg-brand-light-alt border-brand-border min-w-0 flex-1 overflow-hidden rounded-2xl border p-4 max-middle:p-2">
                    <img class="h-auto w-full" src="../assets/images/pages/about/global-footprint.svg" alt="World map connecting Hyderabad, India headquarters with our international clients and partners." width="1200" height="520" loading="lazy" decoding="async" />
                    <figcaption class="text-brand-gray px-2 pt-3 pb-2 text-sm">Global presence through clients and partnerships.</figcaption>
                  </figure>
                </div>
              </section>`;
html = html.slice(0, start) + section + html.slice(end);
fs.writeFileSync(htmlFile, html);

const scriptFile = 'app/assets/scripts/pages/about.js';
let script = fs.readFileSync(scriptFile, 'utf8');
for (const line of [
  "  const tablet = window.matchMedia('(min-width: 834px)');\n",
  "  const orbit = page.querySelector('[data-about-orbit]');\n",
  "  const members = [...orbit.querySelectorAll('[data-orbit-member]')];\n",
  '  let orbitAnimations = [];\n',
  '  let orbitVisible = false;\n',
  "  document.addEventListener('visibilitychange', syncOrbit);\n",
]) script = script.replace(line, '');
const syncStart = script.indexOf('  const syncOrbit = () => {');
const syncEnd = script.indexOf('  const measure = () => {', syncStart);
script = script.slice(0, syncStart) + script.slice(syncEnd);
const orbitStart = script.indexOf('    const elapsed = Number(orbitAnimations[0]?.currentTime) || 0;');
const orbitEnd = script.indexOf('    schedule();', orbitStart);
if (syncStart < 0 || orbitStart < 0 || orbitEnd < 0) throw new Error('Orbit logic not found');
script = script.slice(0, orbitStart) + script.slice(orbitEnd);
script = script.replace(/  new IntersectionObserver\(\(\[entry\]\) => \{[\s\S]*?\}\)\.observe\(orbit\);\n\n/, '');
fs.writeFileSync(scriptFile, script);
console.log('Created vector map with 10 presence locations and Hyderabad HQ; replaced team orbit and removed its logic.');
