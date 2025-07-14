// src/lib/apiCall.js
export { apiCall } from "./mockApi";   // later you can swap to "./realApi"

// Add this (or paste at the bottom of the file)
export async function safeJson(res) {
    // Some responses are HTML (error pages) or empty (304), not JSON
    // Parse only if the server labelled it JSON
   const ctype = res.headers.get("content-type") || "";
   if (!ctype.includes("application/json")) return null;
 
   // A 204 / 304 response has no body
   if (res.status === 204 || res.status === 304) return null;
 
   try {
     return await res.json();
   } catch (_) {
     return null;               
   }
  }
  
