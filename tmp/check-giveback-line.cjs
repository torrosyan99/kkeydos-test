const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('app/assets/scripts/pages/about.js', 'utf8');
const start = source.indexOf('    const track = line.parentElement.getBoundingClientRect();');
const end = source.indexOf('    drawIntro();', start);
assert(start > 0 && end > start);
const updateLines = source.slice(start, end);
function sample(scroll, reduced = false) {
  const rect = (top, height) => ({ top: top - scroll, height });
  const context = {
    viewport: 1000,
    firstRevealed: true,
    motion: { matches: !reduced },
    line: { style: {}, parentElement: { getBoundingClientRect: () => rect(100, 900) } },
    ball: { style: {} },
    steps: [],
    givebackTrack: { getBoundingClientRect: () => rect(1000, 900) },
    givebackStop: { dataset: {}, getBoundingClientRect: () => rect(1164, 32) },
    givebackLine: { style: {} },
    givebackBall: { style: {} },
  };
  vm.runInNewContext(updateLines, context);
  return context;
}
const before = sample(470);
assert.equal(before.line.style.height, '890px');
assert.equal(before.givebackLine.style.height, '0px');
const boundary = sample(480);
assert.equal(boundary.line.style.height, '900px');
assert.equal(boundary.givebackLine.style.height, '0px');
const inside = sample(520);
assert.equal(inside.givebackLine.style.height, '40px');
assert.equal(inside.givebackBall.hidden, false);
assert.equal(inside.ball.hidden, true);
const reached = sample(660);
assert.equal(reached.givebackLine.style.height, '180px');
assert.equal(reached.givebackStop.dataset.reached, 'true');
assert.equal(reached.givebackBall.hidden, true);
assert.equal(sample(470).givebackStop.dataset.reached, 'false');
const reduced = sample(0, true);
assert.equal(reduced.line.style.height, '900px');
assert.equal(reduced.givebackLine.style.height, '180px');
assert.equal(reduced.givebackBall.hidden, true);
console.log('Timeline boundary, white continuation, reverse scroll and reduced motion passed.');
