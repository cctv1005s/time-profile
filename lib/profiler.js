'use strict';

const assert = require('assert');

const EventEmitter = require('events');

const Entry = require('./entry');

class Profiler extends EventEmitter {
  constructor() {
    super();
    this._map = new Map(); // <key, index>
    this._list = []; // entry stack
    this._start = null;
    this._lastEnd = null;
  }

  start(key) {
    assert(key !== null && key !== undefined, 'should pass `key`');

    let entry;
    if (this._map.has(key)) {
      const index = this._map.get(key);
      entry = this._list[index];
      entry.total++;
    } else {
      entry = new Entry(key);
      const size = this._list.push(entry);
      this._map.set(key, size - 1);
    }
    if (!this._start) {
      this._start = entry.start;
    }
  }

  end(key) {
    assert(key !== null && key !== undefined, 'should pass `key`');
    assert(this._map.has(key), 'should run start(\'' + key + '\') first');

    const index = this._map.get(key);
    const entry = this._list[index];
    if (entry.markEnd()) {
      this._map.delete(key);
    }
    this._lastEnd = entry.end;

    return entry.duration;
  }

  reset() {
    this._list = [];
    this._map.clear();
    this._start = null;
    this._lastEnd = null;
  }

  toJSON() {
    return this._list;
  }

  toString(prefix) {
    if (undefined === prefix) prefix = '';
    return prefix + '\n' + this._list.map(entry => entry.toString(this._start, this._lastEnd)).join('\n');
  }
}

module.exports = Profiler;
