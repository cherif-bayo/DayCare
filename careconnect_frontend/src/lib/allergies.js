import { API_ENDPOINTS } from "./config";
import { apiCall, safeJson } from "./apiCall";

export const fetchAllergies = (token) =>
  apiCall(API_ENDPOINTS.ALLERGIES, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  }).then(safeJson);

export const createAllergy = (token, payload) =>
  apiCall(API_ENDPOINTS.ALLERGIES, {
    method : "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).then(safeJson);
