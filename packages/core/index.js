const BUILT_INS = new Set(["expression", "if", "each", "else", "elif"]);

export class Rebase {
  constructor(options = {}) {
    this.options = options;
    this.scope = options.scope ?? {};
    this.syntax = new SyntaxRegistry();
    this.plugins = new Map();
    this.roots = new Set();

    if (options.host) this.host(options.host);
    if (options.builtIns !== false) registerBuiltIns(this);
  }

  host(nameOrOptions) {
    const hosts = typeof nameOrOptions === "string"
      ? { name: nameOrOptions }
      : nameOrOptions;

    const disabled = HOST_RESERVED[hosts.name] ?? [];
    for (const syntax of disabled) this.syntax.disable(syntax.type, syntax.name);
    return this;
  }

  use(plugin, options = {}) {
    const normalized = plugin?.default ?? plugin;
    if (!normalized) throw new TypeError("Rebase.use(): plugin is required.");

    if (typeof normalized === "function") {
      normalized(this.api(), options);
    } else if (typeof normalized.install === "function") {
      normalized.install(this.api(), options);
    } else {
      throw new TypeError("Rebase.use(): plugin must be a function or expose install().");
    }

    if (normalized.name) this.plugins.set(normalized.name, normalized);
    return this;
  }

  directive(name, handler, options = {}) {
    return this.syntax.directive(name, handler, options);
  }

  expression(name, handler, options = {}) {
    return this.syntax.expression(name, handler, options);
  }

  block(name, handler, options = {}) {
    return this.syntax.block(name, handler, options);
  }

  hook(name, handler) {
    return this.syntax.hook(name, handler);
  }

  api() {
    return Object.freeze({
      version,
      rebase: this,
      directive: this.directive.bind(this),
      expression: this.expression.bind(this),
      block: this.block.bind(this),
      hook: this.hook.bind(this),
      syntax: this.syntax
    });
  }

  mount(target, options = {}) {
    const root = resolveTarget(target);
    if (!root) throw new Error("Rebase.mount(): target not found.");

    const record = {
      root,
      source: options.template ?? root.innerHTML,
      scope: { ...this.scope, ...(options.scope ?? {}) },
      options
    };

    this.roots.add(record);
    this.render(record);

    return {
      update: () => this.render(record),
      unmount: () => {
        this.roots.delete(record);
        root.innerHTML = record.source;
      }
    };
  }

  transform(source, options = {}) {
    const host = options.host ?? this.options.host;
    const scope = options.scope ?? this.scope;
    return this.syntax.process(source, scope, this, { host });
  }

  render(record) {
    let html = record.source;
    html = this.syntax.process(html, record.scope, this);
    record.root.innerHTML = html;
    bindEvents(record.root, record.scope);
    this.hook("render", { root: record.root, scope: record.scope });
    return html;
  }

  update() {
    for (const record of this.roots) this.render(record);
    return this;
  }
}

export class SyntaxRegistry {
  constructor() {
    this.directives = new Map();
    this.expressions = new Map();
    this.blocks = new Map();
    this.hooks = new Map();
    this.disabled = new Map();
  }

  directive(name, handler, options = {}) {
    assertName(name);
    this.directives.set(name, { handler, options });
    return this;
  }

  expression(name, handler, options = {}) {
    assertName(name);
    this.expressions.set(name, { handler, options });
    return this;
  }

  block(name, handler, options = {}) {
    assertName(name);
    this.blocks.set(name, { handler, options });
    return this;
  }

  hook(name, handler) {
    const list = this.hooks.get(name) ?? [];
    list.push(handler);
    this.hooks.set(name, list);
    return this;
  }

  disable(type, name) {
    const set = this.disabled.get(type) ?? new Set();
    set.add(name);
    this.disabled.set(type, set);
    return this;
  }

  isEnabled(type, name) {
    return !this.disabled.get(type)?.has(name);
  }

  process(source, scope, rebase, options = {}) {
    let output = source;
    const host = options.host ?? rebase.options.host;

    output = processBlocks(output, this.blocks, scope, rebase, this, host);
    output = processDirectives(output, this.directives, scope, rebase);
    if (!host) output = processExpressions(output, this.expressions, scope, rebase);
    if (!host) output = interpolate(output, scope);
    return output;
  }
}

export function plugin(definition) {
  return definition;
}

export function createRebase(options) {
  return new Rebase(options);
}

export const hosts = {
  svelte: {
    name: "svelte",
    reserved: HOST_RESERVED.svelte
  },
  vue: {
    name: "vue",
    reserved: HOST_RESERVED.vue
  },
  react: {
    name: "react",
    reserved: HOST_RESERVED.react
  }
};

function registerBuiltIns(rebase) {
  rebase.expression("value", ({ expression, scope }) => evaluate(expression, scope));
  rebase.block("if", ({ expression, body, scope }) =>
    evaluate(expression, scope) ? body : ""
  );
  rebase.block("each", ({ expression, body, scope }) => {
    const match = expression.match(/^(.+?)\\s+as\\s+([A-Za-z_$][\\w$]*)(?:\\s*,\\s*([A-Za-z_$][\\w$]*))?$/);
    if (!match) return "";
    const collection = evaluate(match[1], scope);
    if (collection == null || typeof collection[Symbol.iterator] !== "function") return "";
    return [...collection].map((item, index) => {
      const child = { ...scope, [match[2]]: item };
      if (match[3]) child[match[3]] = index;
      return processBuiltInBody(body, child);
    }).join("");
  });
}

function processBuiltInBody(body, scope) {
  return body.replace(/\\{\\s*([^{}]+?)\\s*\\}/g, (_, expression) =>
    escapeHtml(evaluate(expression, scope))
  );
}

function processBlocks(source, blocks, scope, rebase, registry, host) {
  const pattern = /\\{#([A-Za-z_$][\\w$-]*)(?:\\s+([^}]*))?\\}([\\s\\S]*?)\\{\\/([A-Za-z_$][\\w$-]*)\\}/g;

  return source.replace(pattern, (full, name, expression = "", body, closing) => {
    if (name !== closing || !registry.isEnabled("block", name)) return full;
    if (host && !registry.isEnabled("block", name)) return full;
    const entry = blocks.get(name);
    if (!entry) return full;

    const branches = splitBranches(body);
    const result = entry.handler({
      name,
      expression: expression.trim(),
      body: branches.length > 1 ? branches : body,
      scope,
      rebase
    });

    return result == null ? "" : String(result);
  });
}

function processDirectives(source, directives, scope, rebase) {
  return source.replace(/\\{@([A-Za-z_$][\\w$:-]*)(?:\\s+([^{}]*?))?\\}/g, (full, name, expression = "") => {
    const entry = directives.get(name);
    if (!entry) return full;
    const result = entry.handler({
      name,
      expression: expression.trim(),
      scope,
      rebase
    });
    return result == null ? "" : String(result);
  });
}

function processExpressions(source, expressions, scope, rebase) {
  return source.replace(/\\{([A-Za-z_$][\\w$]*(?:\\.[A-Za-z_$][\\w$]*)*)\\}/g, (full, name) => {
    const entry = expressions.get(name);
    if (!entry) return full;
    const result = entry.handler({ name, expression: name, scope, rebase });
    return escapeHtml(result);
  });
}

function interpolate(source, scope) {
  return source.replace(/\\{\\{([^{}]+)\\}\\}/g, (_, expression) =>
    escapeHtml(evaluate(expression.trim(), scope))
  );
}

function splitBranches(body) {
  const marker = /\\{:(else|elif)\\b([^}]*)\\}/g;
  const branches = [];
  let cursor = 0;
  let expression = null;
  let match;

  while ((match = marker.exec(body))) {
    branches.push({ expression, content: body.slice(cursor, match.index) });
    expression = match[1] === "elif" ? match[2].trim() : null;
    cursor = marker.lastIndex;
  }

  branches.push({ expression, content: body.slice(cursor) });
  return branches;
}

function bindEvents(root, scope) {
  for (const element of root.querySelectorAll("*")) {
    for (const attribute of [...element.attributes]) {
      if (!attribute.name.startsWith("on:")) continue;
      const eventName = attribute.name.slice(3);
      const expression = attribute.value.replace(/^\\{|\\}$/g, "").trim();
      element.removeAttribute(attribute.name);
      element.addEventListener(eventName, event =>
        evaluate(expression, { ...scope, event })
      );
    }
  }
}

function evaluate(expression, scope) {
  try {
    return Function("scope", "with (scope) { return (" + expression + "); }")(scope);
  } catch {
    return undefined;
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function resolveTarget(target) {
  if (typeof document === "undefined") throw new Error("Rebase.mount() requires a browser.");
  return typeof target === "string" ? document.querySelector(target) : target;
}

function assertName(name) {
  if (!/^[A-Za-z_$][\\w$-]*$/.test(name)) {
    throw new TypeError("Invalid Rebase syntax name: " + name);
  }
}

const HOST_RESERVED = {
  svelte: [
    { type: "block", name: "if" },
    { type: "block", name: "each" },
    { type: "block", name: "await" },
    { type: "block", name: "key" },
    { type: "block", name: "snippet" }
  ],
  vue: [],
  react: []
};

export const version = "1.0.0-alpha.1";
