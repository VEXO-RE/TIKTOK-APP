import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

function element(value = "") {
  return { value, checked:false, disabled:false, hidden:false, textContent:"", files:[],
    addEventListener(){}, replaceChildren(){}, append(){}, setAttribute(){}, removeAttribute(){} };
}

async function editorContext() {
  const elements=new Map();
  const $=id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id);};
  const context=vm.createContext({$,console,setTimeout,FormData,File:globalThis.File,Blob,
    document:{querySelectorAll:()=>[],createElement:()=>element()},window:{addEventListener(){}},
    navigator:{},localStorage:{getItem:()=>null,setItem(){}},session:null,busy:false,recording:false,
    content:{id:"draft-1"},attempt:null,dirty:false,assetHash:"a".repeat(64),buttons(){},api(){},lists(){}});
  vm.runInContext(await readFile(new URL("../../src/review-ui/public/editor.js",import.meta.url),"utf8"),context);
  return {context,$};
}

test("editor recipe keeps the real rights controls when applying a rights-free preset",async()=>{
  const {context,$}=await editorContext();
  $("ed-rights").value="licensed";$("ed-evidence").value="  license-document-42  ";
  vm.runInContext("editorLoad({editor:{recipe:{template:'contrast'},needsRender:true}},{preserveRights:true})",context);
  const recipe=vm.runInContext("editorRecipe()",context);
  assert.deepEqual({...recipe.rights},{type:"licensed",evidence:"license-document-42"});
});

test("editor blocks export locally when the rights reference is empty",async()=>{
  const {context,$}=await editorContext();
  $("ed-rights").value="owned";$("ed-evidence").value="   ";
  assert.throws(()=>vm.runInContext("editorRecipe()",context),/Indica derechos propios o licencia/);
});
