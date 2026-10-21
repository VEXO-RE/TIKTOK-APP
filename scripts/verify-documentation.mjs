import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const check = (ok, message) => { if (!ok) failures.push(message); };
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
let manifest;
try { manifest = JSON.parse(read("docs/development/structure.json")); }
catch (err) { console.error("Manifest unreadable: " + err.message); process.exit(1); }

const unique = new Set(manifest.files);
check(unique.size === manifest.files.length, "Duplicate documented paths");
for (const rel of manifest.files) {
  check(!path.isAbsolute(rel) && !rel.split(/[\\/]/).includes(".."), "Unsafe documented path: " + rel);
  if (path.isAbsolute(rel) || rel.split(/[\\/]/).includes("..")) continue;
  check(fs.existsSync(path.join(root,rel)), "Missing file: " + rel);
  if (!fs.existsSync(path.join(root,rel))) continue;
  const content = read(rel);
  check(content.trim().length > 0, "Empty file: " + rel);
  if (rel.endsWith(".json")) {
    try {
      const obj=JSON.parse(content);
      if (rel.endsWith(".schema.json")) {
        check(obj.$schema === "https://json-schema.org/draft/2020-12/schema", "Schema dialect: " + rel);
        check(obj.type === "object" && obj.additionalProperties === false, "Open root schema: " + rel);
        for (const key of obj.required ?? []) check(key in obj.properties, "Undefined required property: " + rel + "/" + key);
      }
    } catch (err) { failures.push("Invalid JSON: " + rel + ": " + err.message); }
  }
  if (rel.endsWith(".md")) {
    for(const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target=match[1].split("#")[0];
      if(!target || /^[a-z]+:\/\//i.test(target) || /^[a-z]:[\\/]/i.test(target) || target.startsWith("/")) continue;
      check(fs.existsSync(path.resolve(root,path.dirname(rel),target)), "Broken local link: " + rel + " -> " + target);
    }
  }
}
check(manifest.phases.length === 11 && new Set(manifest.phases.map(p=>p.phase)).size === 11, "Phase coverage must be 0..10");
for(const p of manifest.phases) check(fs.existsSync(path.join(root,p.guide)), "Missing phase guide: " + p.phase);
for(const m of manifest.modules) for(const item of [m.rules,m.spec]) check(fs.existsSync(path.join(root,item)), "Missing module rule/spec: " + item);
const repositories=JSON.parse(read("docs/development/repositories.json"));
check(repositories.installedByThisPhase === false, "Documentary phase must not claim dependencies installed");
check(new Set(repositories.repositories.map(r=>r.repo)).size === repositories.repositories.length, "Duplicate repositories");
for(const r of repositories.repositories) check(r.reviewType==="primary_repository_docs" && r.url==="https://github.com/"+r.repo, "Untraceable repository: " + r.repo);
const skill=read(".agents/skills/tiktok-development/SKILL.md");
check(skill.startsWith("---\n") && /^name: tiktok-development$/m.test(skill) && /^description: .+/m.test(skill), "Skill frontmatter invalid");
if(failures.length){failures.forEach(m=>console.error("FAIL: "+m));process.exit(1);}
console.log("PASS: " + manifest.files.length + " documented files; " + manifest.phases.length + " phase guides; " + manifest.modules.length + " scoped modules; " + repositories.repositories.length + " primary repositories.");
console.log("Structural verification only: no runtime, network, provider authorization or operational certification.");
