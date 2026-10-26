const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../public-scroll.js'), 'utf8');
function load(reduced = false, available = true) {
  const created = [];
  const motion = {matches:reduced, addEventListener(event, callback) {this.change = callback;}};
  class Lenis {
    constructor(options) {this.options = options; this.destroyed = false; created.push(this);}
    destroy() {this.destroyed = true;}
  }
  vm.runInNewContext(source, {Lenis:available ? Lenis : undefined, matchMedia:() => motion});
  return {created, motion};
}
const normal = load();
assert.equal(normal.created.length, 1);
assert.equal(normal.created[0].options.autoRaf, true);
assert.equal(normal.created[0].options.syncTouch, false, 'Keep native touch scrolling');
assert.equal(normal.created[0].options.anchors.offset, -110, 'Keep anchor targets below sticky header');
normal.motion.matches = true;
normal.motion.change();
assert(normal.created[0].destroyed, 'Stop animation when reduced motion is enabled');
normal.motion.matches = false;
normal.motion.change();
assert.equal(normal.created.length, 2, 'Restore scrolling when motion preference changes');
assert.equal(load(true).created.length, 0);
assert.equal(load(false, false).created.length, 0, 'Keep native scroll if vendor script fails');
console.log('Public scroll checks passed: setup, anchors, touch, reduced motion and native fallback.');
