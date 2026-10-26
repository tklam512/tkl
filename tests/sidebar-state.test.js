const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../admin/app.js'), 'utf8');
function page(values) {
  const classes = new Set();
  const handlers = {}, attributes = {}, events = {}, icon = {};
  const toggle = {addEventListener: (name, handler) => {handlers[name] = handler;},
    setAttribute: (key, value) => {attributes[key] = value;}, getAttribute: key => attributes[key], querySelector: () => icon};
  const context = {
    localStorage: {getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value)},
    sessionStorage: {getItem: () => 'true'},
    window: {location: {pathname: '/admin/home/'}, addEventListener: (name, handler) => {events[name] = handler;}},
    document: {
      body: {insertAdjacentHTML() {}, classList: {
        toggle(name, force = !classes.has(name)) {force ? classes.add(name) : classes.delete(name); return force;}
      }},
      querySelectorAll: () => [],
      getElementById: id => id === 'sidebarToggle' ? toggle : {addEventListener() {}}
    }
  };
  vm.runInNewContext(source, context);
  return {classes, handlers, attributes, events, icon};
}
const values = new Map([['btl.sidebarCollapsed', 'true']]);
const first = page(values);
assert(first.classes.has('sidebar-collapsed'), 'Restore the chosen state on navigation');
assert.equal(first.attributes['aria-expanded'], 'false');
first.handlers.click();
assert(!first.classes.has('sidebar-collapsed'));
assert.equal(values.get('btl.sidebarCollapsed'), 'false');
assert.equal(first.attributes['aria-expanded'], 'true');
const second = page(values);
assert(!second.classes.has('sidebar-collapsed'));
first.handlers.click();
second.events.storage({key: 'btl.sidebarCollapsed', newValue: 'true'});
assert(second.classes.has('sidebar-collapsed'), 'An open tab follows preference changes in another tab');
assert.equal(second.attributes['aria-expanded'], 'false');
assert.equal(second.icon.className, 'bi bi-camera-reels-fill');
assert(page(values).classes.has('sidebar-collapsed'), 'Reload preserves collapsed state');
console.log('Sidebar checks passed: navigation, reload, cross-tab changes and accessible toggle state.');
