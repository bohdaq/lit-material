#!/usr/bin/env node
import { run } from "../dist/cli.js";

const result = run(process.argv.slice(2));
for (const message of result.messages) console.log(message);
process.exitCode = result.exitCode;
