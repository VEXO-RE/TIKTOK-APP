import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { AppError } from "../../core/errors.js";

const schema=JSON.parse(readFileSync(new URL("../../../docs/development/contracts/content-revision.schema.json",import.meta.url),"utf8"));
const ajv=new Ajv2020({allErrors:true,strict:true,validateFormats:true});
addFormats(ajv,{mode:"full"});
const validate=ajv.compile(schema);

export function assertContentRevision(value) {
  if(!validate(value)) {
    throw new AppError("Content revision violates its runtime contract.",500,"CONTENT_SCHEMA_INVALID");
  }
  return value;
}
