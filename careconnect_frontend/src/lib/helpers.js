/* ───────────────────────────── helpers.js ──────────────────────────────
   Generic, stateless helper functions used by multiple components.
   Keep it tiny & pure.  No React, no side–effects.
──────────────────────────────────────────────────────────────────────── */

import { v4 as uuid } from "uuid";

/* ── 1) Access-permissions (can-pick-up list) ───────────────────────── */

export const deserializeAccess = (raw = []) =>
  (Array.isArray(raw) ? raw : []).map(ap => ({
    // add a local UUID so <React :key> is stable,
    // but never send this back to the backend
    id : ap.id || uuid(),
    name : ap.name,
    phone : ap.phone ?? "",
    relation : ap.relation ?? "",
    is_authorized : ap.is_authorized ?? true,
  }));

export const serializeAccess = list =>
  // strip the local “id” before PUT/POST
  list.map(({ id, ...rest }) => rest);


/* ── 2) String-array helper used in EditChildForm etc. ──────────────── */

export const toStrArr = (raw = []) => {
  const list = Array.isArray(raw) ? raw : [raw];

  const splitter = item => {
    const str = typeof item === "string" ? item : item?.name || "";
    return str.split(/,\s*/).map(s => s.trim()).filter(Boolean);
  };

  return list.flatMap ? list.flatMap(splitter)
                      : list.reduce((acc, cur) => acc.concat(splitter(cur)), []);
};


/* ── 3) Tiny assertion / guard (handy for dev) ──────────────────────── */
export const invariant = (cond, msg = "Invariant failed") => {
  if (!cond) throw new Error(msg);
};
