/* Browser terminal shared by all eight standalone demos. No external dependencies. */
(function () {
  'use strict';
  class BrowserTerminal {
    constructor(slug) {
      this.slug = slug;
      this.prefix = 'sharanyapal:cpp-playground:' + slug + ':';
      this.element = document.getElementById('console');
      this.command = document.getElementById('command');
      this.send = document.getElementById('send');
      this.form = document.getElementById('input-form');
      this.status = document.getElementById('status');
      this.startButton = document.getElementById('start');
      this.restartButton = document.getElementById('restart');
      this.running = false;
      this.waiter = null;
      this.lastInput = '';
      this.form.addEventListener('submit', event => {
        event.preventDefault();
        if (!this.waiter) return;
        const value = this.command.value;
        this.command.value = '';
        this.write(value + '\n');
        const deliver = this.waiter;
        this.waiter = null;
        deliver(value);
      });
    }
    write(message = '') {
      this.element.textContent += String(message);
      if (this.element.textContent.length > 250000) {
        this.element.textContent = '[Earlier terminal output truncated]\n' + this.element.textContent.slice(-200000);
      }
      this.element.scrollTop = this.element.scrollHeight;
    }
    line(message = '') { this.write(String(message) + '\n'); }
    block(message = '') { this.write('\n' + String(message) + '\n'); }
    rule(char = '-', length = 54) { this.line(char.repeat(length)); }
    head(message) { this.block('  ' + message.toUpperCase()); this.rule('═', 50); }
    screen(message) { this.block('\n  ───────────── ' + String(message) + ' ─────────────'); }
    setStatus(value) { this.status.textContent = value; }
    async ask(prompt = '> ') {
      if (!this.running) throw new Error('Session stopped');
      this.write('\n' + prompt + ' ');
      this.command.disabled = false;
      this.send.disabled = false;
      this.command.focus();
      return await new Promise(resolve => { this.waiter = resolve; });
    }
    async text(prompt, maxLength = 80) {
      while (true) {
        const value = (await this.ask(prompt)).trim();
        if (value && value.length <= maxLength) return value;
        this.line('Please enter a value (up to ' + maxLength + ' characters).');
      }
    }
    async int(prompt, min = -Number.MAX_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
      while (true) {
        const raw = (await this.ask(prompt)).trim();
        const number = Number(raw);
        if (/^[+-]?\d+$/.test(raw) && Number.isSafeInteger(number) && number >= min && number <= max) return number;
        this.line('Enter a whole number from ' + (Number.isFinite(min) && Math.abs(min) < 1e9 ? min : 'any') + ' to ' + (Number.isFinite(max) && Math.abs(max) < 1e9 ? max : 'any') + '.');
      }
    }
    async number(prompt, min = 0, max = 1e9) {
      while (true) {
        const raw = (await this.ask(prompt)).trim();
        const number = Number(raw);
        if (raw !== '' && Number.isFinite(number) && number >= min && number <= max) return number;
        this.line('Please enter a valid number between ' + min + ' and ' + max + '.');
      }
    }
    async pick(prompt, allowed) {
      const set = allowed.map(x => String(x).toLowerCase());
      while (true) {
        const value = (await this.ask(prompt)).trim().toLowerCase();
        if (set.includes(value)) return value;
        this.line('Choose one of: ' + allowed.join(', '));
      }
    }
    async pause() { await this.ask('Press Enter to continue:'); }
    money(value) { return Number(value).toFixed(2); }
    load(key, fallback = []) {
      try {
        const raw = localStorage.getItem(this.prefix + key);
        return raw === null ? structuredClone(fallback) : JSON.parse(raw);
      } catch (_) { return JSON.parse(JSON.stringify(fallback)); }
    }
    save(key, value) {
      try { localStorage.setItem(this.prefix + key, JSON.stringify(value)); }
      catch (_) { this.line('Note: browser storage is unavailable; data will not persist after refresh.'); }
    }
    clearStorage() {
      try {
        Object.keys(localStorage).filter(k => k.startsWith(this.prefix)).forEach(k => localStorage.removeItem(k));
      } catch (_) { /* Private browsing can disable localStorage */ }
    }
    download() {
      const blob = new Blob([this.element.textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.slug + '-transcript.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
    finish() {
      this.running = false;
      this.command.disabled = true;
      this.send.disabled = true;
      this.setStatus('COMPLETED');
      this.line('\n[Session completed. Click Restart to run again.]');
    }
  }
  function initPlayground({ slug, title }) {
    const ui = new BrowserTerminal(slug);
    function launch() {
      if (ui.running) { ui.line('[A program is already running.]'); return; }
      ui.element.textContent = '$ Starting ' + title + '…\n';
      ui.running = true;
      ui.setStatus('RUNNING');
      ui.startButton.disabled = true;
      ui.restartButton.disabled = false;
      ui.command.disabled = false;
      ui.send.disabled = false;
      ui.command.focus();
      Promise.resolve().then(() => window.runProject(ui)).then(
        () => ui.finish(),
        error => {
          ui.line('\n[Error: ' + (error && error.message ? error.message : String(error)) + ']');
          ui.finish();
        }
      );
    }
    document.getElementById('start').addEventListener('click', launch);
    document.getElementById('restart').addEventListener('click', () => location.reload());
    document.getElementById('clear').addEventListener('click', () => { ui.element.textContent = ''; });
    document.getElementById('download').addEventListener('click', () => ui.download());
    document.getElementById('reset-data').addEventListener('click', () => {
      if (window.confirm('Delete this project\'s saved records from this browser? This cannot be undone.')) {
        ui.clearStorage();
        ui.line('[Saved records cleared. Restart the program to reload data.]');
      }
    });
    window.addEventListener('keydown', event => {
      if (event.ctrlKey && event.key.toLowerCase() === 'l') {
        event.preventDefault(); ui.element.textContent = '';
      }
    });
  }
  window.initPlayground = initPlayground;
})();
