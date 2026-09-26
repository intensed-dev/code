export const version = "1.0.0-alpha.2";

export class SyntaxRegistry {
  constructor(){this.expressions=new Map();this.directives=new Map();this.blocks=new Map();this.hooks=new Map();this.disabled=new Map();}
  expression(name,handler,options={}){add(this.expressions,name,handler,options);return this}
  directive(name,handler,options={}){add(this.directives,name,handler,options);return this}
  block(name,handler,options={}){add(this.blocks,name,handler,options);return this}
  hook(name,handler){if(typeof handler!=="function")throw new TypeError("Invalid hook");(this.hooks.get(name)||this.hooks.set(name,[]).get(name)).push(handler);return this}
  disable(type,name){(this.disabled.get(type)||this.disabled.set(type,new Set()).get(type)).add(name);return this}
  enabled(type,name){return !this.disabled.get(type)?.has(name)}
  emit(name,value){for(const fn of this.hooks.get(name)||[])fn(value)}
}

export class Rebase {
  constructor(options={}){this.options={...options};this.scope=options.scope||{};this.syntax=new SyntaxRegistry();this.plugins=new Map();this.roots=new Set();if(options.host)this.host(options.host);if(options.builtIns!==false)builtIns(this)}
  host(name){this.options.host=name;for(const x of HOSTS[name]||[])this.syntax.disable(x[0],x[1]);return this}
  use(plugin,options={}){const p=plugin?.default||plugin;if(typeof p==="function")p(this.api(),options);else if(p?.install)p.install(this.api(),options);else throw new TypeError("Invalid Rebase plugin");if(p?.name)this.plugins.set(p.name,p);return this}
  expression(n,h,o){this.syntax.expression(n,h,o);return this}
  directive(n,h,o){this.syntax.directive(n,h,o);return this}
  block(n,h,o){this.syntax.block(n,h,o);return this}
  hook(n,h){this.syntax.hook(n,h);return this}
  api(){return Object.freeze({version,rebase:this,expression:this.expression.bind(this),directive:this.directive.bind(this),block:this.block.bind(this),hook:this.hook.bind(this),syntax:this.syntax})}
  async transform(source,{scope={},host=this.options.host}={}){return render(String(source),{...this.scope,...scope},this,host)}
  mount(target,{template,scope={}}={}){const root=typeof target==="string"?document.querySelector(target):target;if(!root)throw new Error("Rebase mount target not found");const record={root,source:template??root.innerHTML,scope:{...this.scope,...scope}};this.roots.add(record);this.render(record);return{update:()=>this.render(record),unmount:()=>{this.roots.delete(record);root.innerHTML=record.source}}}
  render(record){const html=renderSync(record.source,record.scope,this,this.options.host);record.root.innerHTML=html;bind(record.root,record.scope);this.syntax.emit("render",{root:record.root,scope:record.scope});return html}
  update(){for(const r of this.roots)this.render(r);return this}
}

export const createRebase=options=>new Rebase(options);
export const plugin=definition=>definition;

function builtIns(r){r.expression("value",x=>evalIn(x.expression,x.scope));r.block("if",x=>evalIn(x.expression,x.scope)?x.body:"");r.block("each",x=>{const m=x.expression.match(/^(.+?)\s+as\s+([A-Za-z_$][\w$]*)(?:\s*,\s*([A-Za-z_$][\w$]*))?$/);if(!m)return"";const list=evalIn(m[1],x.scope);if(!list?.[Symbol.iterator])return"";return[...list].map((v,i)=>renderSync(x.body,{...x.scope,[m[2]]:v,...m[3]?[m[3]]:[],...(m[3]?{[m[3]]:i}:{})},x.rebase)).join("")})}

function renderSync(s,scope,r,host){let out=s;out=blocks(out,r,scope,host);out=directives(out,r,scope);if(!host)out=out.replace(/\{\{([^{}]+)\}\}/g,(_,e)=>esc(evalIn(e.trim(),scope)));return out}
async function render(s,scope,r,host){let out=s;out=blocks(out,r,scope,host);out=await directivesAsync(out,r,scope);if(!host)out=out.replace(/\{\{([^{}]+)\}\}/g,(_,e)=>esc(evalIn(e.trim(),scope)));return out}

function blocks(s,r,scope,host){const re=/\{#([\w$-]+)(?:\s+([^}]*))?\}([\s\S]*?)\{\/\1\}/g;return s.replace(re,(full,n,e,b)=>{if(!r.syntax.enabled("block",n)||host&&HOSTS[host]?.some(x=>x[0]==="block"&&x[1]===n))return full;const h=r.syntax.blocks.get(n);if(!h)return full;return String(h.handler({name:n,expression:(e||"").trim(),body:blocks(b,r,scope,host),scope,rebase:r})??"")})}
function directives(s,r,scope){return s.replace(/\{@([\w$:-]+)(?:\s+([^{}]*))?\}/g,(full,n,e)=>{const h=r.syntax.directives.get(n);if(!h)return full;const v=h.handler({name:n,expression:(e||"").trim(),scope,rebase:r});if(v?.then)throw new Error("Async Rebase plugin requires transform()");return v==null?"":String(v)})}
async function directivesAsync(s,r,scope){let out="",i=0;for(const m of s.matchAll(/\{@([\w$:-]+)(?:\s+([^{}]*))?\}/g)){out+=s.slice(i,m.index);const h=r.syntax.directives.get(m[1]);if(!h)out+=m[0];else out+=String(await h.handler({name:m[1],expression:(m[2]||"").trim(),scope,rebase:r})??"");i=m.index+m[0].length}return out+s.slice(i)}
function bind(root,scope){for(const el of root.querySelectorAll("*"))for(const a of [...el.attributes])if(a.name.startsWith("on:")){const e=a.name.slice(3),x=a.value.replace(/^\{|\}$/g,"");el.removeAttribute(a.name);el.addEventListener(e,ev=>evalIn(x,{...scope,event:ev}))}}
function evalIn(e,s){try{return Function("scope","with(scope)return ("+e+")")(s)}catch{return undefined}}
function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}
function add(map,name,handler,options){if(!/^[A-Za-z_$][\w$-]*$/.test(name)||typeof handler!=="function")throw new TypeError("Invalid Rebase syntax registration");map.set(name,{handler,options})}
const HOSTS={svelte:[["block","if"],["block","each"],["block","await"],["block","key"],["block","snippet"]],vue:[],react:[]};
