/**
 * RFC 4180 CSV helpers used by `lit-material-data-grid`'s `toCSV()`. Plain functions with no DOM, so
 * they also run on a server.
 */

export interface CsvTextOptions {
  /** Field separator. Default `","`. Use `";"` for spreadsheets in locales with a decimal comma. */
  delimiter?: string;
  /** Start with a UTF-8 byte order mark, so Excel reads non-ASCII text correctly. Default `false`. */
  bom?: boolean;
  /**
   * Prefix `'` to a cell that starts with `=`, `+`, `-`, `@`, a tab or a carriage return, so a spreadsheet
   * shows it as text instead of running it as a formula (CSV injection). Plain numbers such as `-5` are left
   * alone. Default `true`.
   */
  escapeFormulas?: boolean;
}

const FORMULA_START = /^[=+\-@\t\r]/;
const PLAIN_NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;

/** `'`-prefixes text a spreadsheet would treat as a formula; plain numbers stay as they are. */
export function neutralizeFormula(text: string): string {
  return FORMULA_START.test(text) && !PLAIN_NUMBER.test(text) ? `'${text}` : text;
}

/** One field: quoted (with `"` doubled) when it holds the delimiter, a quote, CR or LF. */
export function csvField(text: string, delimiter = ",", escapeFormulas = true): string {
  const value = escapeFormulas ? neutralizeFormula(text) : text;
  return value.includes(delimiter) || /["\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Records (each an array of field texts) as CSV, lines separated by CRLF. */
export function toCsvText(records: readonly (readonly string[])[], options: CsvTextOptions = {}): string {
  const { delimiter = ",", bom = false, escapeFormulas = true } = options;
  const text = records.map((record) => record.map((field) => csvField(field, delimiter, escapeFormulas)).join(delimiter)).join("\r\n");
  return bom ? `﻿${text}` : text;
}
