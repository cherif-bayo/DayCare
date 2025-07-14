// src/components/children/EditChildForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { Input } from "./Input";
import { apiCall, safeJson } from "../../lib/apiCall";
import { API_ENDPOINTS } from "../../lib/config";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { v4 as uuid } from "uuid";
import { labelOfAgeGroup } from '../../lib/ageGroup';
import {deserializeAccess, serializeAccess, toStrArr  } from "@/lib/helpers";


/* reusable checkbox list */
const CheckList = ({ options, selected, setSelected }) => {
    const toggle = (item) =>
        setSelected((arr) =>
            arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]
        );
    return options.map((opt) => (
        <label key={opt} className="flex items-center space-x-2">
            <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="w-4 h-4 text-teal-600 border-gray-300 rounded"
            />
            <span className="text-sm">{opt}</span>
        </label>
    ));
};

const STATUS_OPTIONS = ["enrolled", "waitlist", "withdrawn", "graduated"];
const ALLERGY_OPTS = ['Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Shellfish', 'Soy'];
const MEDICATION_OPTS = ['Ventolin (Salbutamol)', 'EpiPen Jr', 'Benadryl', 'Tylenol', 'Ritalin', 'Flovent'];
const CONDITION_OPTS = ['Asthma', 'Type 1 Diabetes', 'ADHD', 'Epilepsy', 'Eczema', 'Cerebral Palsy'];


/* fast factories for new rows */
const newContact = () => ({ id: uuid(), name: "", phone: "", relation: "" });

export default function EditChildForm({ child, onCancel, onSaved }) {
    const { t } = useTranslation();
    const { accessToken } = useAuth();

    /* ── base fields ───────────────────────────────────────────── */
    const [firstName, setFirst] = useState(child.first_name);
    const [lastName, setLast] = useState(child.last_name);
    const [dob, setDob] = useState(child.date_of_birth);
    const [ageGroup, setAge] = useState(
        child?.age_group?.id ? String(child.age_group.id) : ""
    );
    
    /* ── age-group list that comes from the API ─────────────────── */
    const [ageGroups, setAgeGroups] = useState([]);
    const [status, setStatus] = useState(child.status);
    const [saving,    setSaving] = useState(false);
    /* ── medical check-box selections ─────────────────────────── */
    const toStrArr = (raw = []) => {
            const list = Array.isArray(raw) ? raw : [raw];      // ensure array
         
            const splitter = (item) => {
              const str = typeof item === "string" ? item : item?.name || "";
              return str.split(/,\s*/).map((s) => s.trim()).filter(Boolean);
            };
         
            // Use native flatMap if present, otherwise manual reduce
            return list.flatMap ? list.flatMap(splitter)
                                : list.reduce((acc, cur) => acc.concat(splitter(cur)), []);
    };

    const [selectedAllergies, setSelectedAllergies] = useState(
        toStrArr(child.allergies)
    );
    const [selectedMedications, setSelectedMedications] = useState(
        toStrArr(child.emergency_medications)
    );
    const [selectedConditions, setSelectedConditions] = useState(
        toStrArr(child.medical_conditions)
    );
    const normaliseContacts = (raw = []) =>
        raw.length
            ? raw.map(c => ({ id: uuid(), ...c }))   // add UI id
            : [newContact()];

    /* ── emergency contacts ───────────────────────────────────── */
    const [contacts, setContacts] = useState(
        normaliseContacts(child.emergency_contacts)
    );
    const addContact = () => setContacts((c) => [...c, newContact()]);
    const updateContact = (id, field, value) =>
    setContacts((cs) => {
             const idx = cs.findIndex((c) => c.id === id);
             if (idx === -1) return cs;              
         
             const row   = cs[idx];
             if (row[field] === value) return cs;       
         
             const clone = [...cs];                     
             clone[idx]  = { ...row, [field]: value };  
             return clone;                              
           });

    const removeContact = (id) => setContacts((c) => c.filter(o => o.id !== id));

    /* ── staff assignment ─────────────────────────────────────── */
    const [staffChoices, setStaffChoices] = useState([]);        // all staff
    const [staffIds, setStaffIds] = useState(child.assigned_staff_ids || []);
    const hasInitialized = useRef(false);

    /*  Access-Permission rows  */
    const [accessRows, setAccessRows] = useState(
           deserializeAccess(child.access_permissions)
         );
         
         const addAccessRow = () =>
           setAccessRows(r => [...r, deserializeAccess([{ /* blank */ }])[0]]);
         
         const updateAccess = (id, field, value) =>
           setAccessRows(rs => rs.map(r => (r.id === id ? { ...r, [field]: value } : r)));
         
         const removeAccess = id => setAccessRows(rs => rs.filter(r => r.id !== id));

    /*  keep form in sync when parent pushes a new child prop */

    useEffect(() => {
        
        if (!hasInitialized.current) {
          setFirst(child.first_name);
          setLast(child.last_name);
          setDob(child.date_of_birth);
          setAge(child?.age_group?.id ? String(child.age_group.id) : "");
          setStatus(child.status);
          setSelectedAllergies(toStrArr(child.allergies));
          setSelectedMedications(toStrArr(child.emergency_medications));
          setSelectedConditions(toStrArr(child.medical_conditions));
          setContacts(normaliseContacts(child.emergency_contacts));
          setStaffIds(child.assigned_staff_ids || []);
          hasInitialized.current = true;
        }
      }, [child]);
      
  

    useEffect(() => {
        apiCall(API_ENDPOINTS.DAYCARE_STAFF, {
            headers: { Authorization: `Bearer ${accessToken}` },
            cache:   "no-store",
        })
            .then((r) => (r.status >= 200 && r.status < 300)    // only 2xx
              ? safeJson(r)                                     // parse body
              : []                                              // 304 => []
            )
            .then((list) => setStaffChoices(Array.isArray(list) ? list : []))
            .catch(console.error);
    }, [accessToken]);

    // fetch active age groups (standard + custom) for this daycare
    useEffect(() => {
        apiCall(API_ENDPOINTS.AGE_GROUPS, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
        })
        .then(safeJson)                    // helper you already import
        .then(list => {
            setAgeGroups(Array.isArray(list) ? list : []);
            // if the child already has a group but <select> didn't pick it, fix that:
            if (list.length && !ageGroup && child.age_group?.id) {
            setAge(String(child.age_group.id));
            }
        })
        .catch(console.error);
    }, [accessToken, child.age_group, ageGroup]);

    useEffect(() => {
        console.log("→ Allergies changed:", selectedAllergies);
    }, [selectedAllergies]);

    
  

    const toggleStaff = (id) =>
        setStaffIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
    /* ── submit ───────────────────────────────────────────────── */

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        try {
            /* 1️⃣  helpers — put these FIRST */
            const finalAgeGroup = ageGroup || (ageGroups[0]?.id ?? null);   // never empty
            const trimmedContacts = contacts                      // drop blank rows
                .filter(c => c.name || c.phone || c.relation)
                .map(({ id, ...rest }) => rest);

                console.log("SUBMIT selections:", {
                    allergies: selectedAllergies,
                    medications: selectedMedications,
                    conditions: selectedConditions,
                });
            /* 2️⃣  build the payload using those helpers */
            const payload = {
                first_name: firstName,
                last_name:  lastName,
                date_of_birth: dob,
                age_group_id: finalAgeGroup,
                status,
                emergency_contacts: trimmedContacts,
                access_permissions : serializeAccess(accessRows),
                allergies:   selectedAllergies.join(", "),
                emergency_medications: selectedMedications.join(", "),
                medical_conditions:  selectedConditions.join(", "),
                assigned_staff_ids: staffIds,
            };

            const res = await apiCall(
                `${API_ENDPOINTS.DAYCARE_CHILDREN}/${child.id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );
            if (!res.ok) throw new Error("Bad response");
            const updated = await safeJson(res);   // may be null on backend error
            console.log("Updated child returned:", updated);
            console.log("UPDATED CHILD:", updated);
            console.log("SUBMIT PAYLOAD:", payload);
            if (updated) onSaved(updated);
        } catch (err) {
            console.error(err);
            alert(t("common.saveError"));
        } finally {
            setSaving(false);
        }
    }

    /* ── RENDER ──────────────────────────────────────────────── */
    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            {/* ① Basic data */}
            <div className="grid md:grid-cols-2 gap-6 bg-white p-6 rounded border">
                <Input label={t("firstName")} value={firstName} onChange={(e) => setFirst(e.target.value)} />
                <Input label={t("lastName")} value={lastName} onChange={(e) => setLast(e.target.value)} />
                <Input label={t("dateOfBirth")} type="date" value={dob} onChange={(e) => setDob(e.target.value)} />

                <div>
                    <label className="block text-sm font-medium mb-1">{t("ageGroup")}</label>
                    <select
                        value={ageGroup}
                        onChange={e => setAge(e.target.value)}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500"
                        >
                        <option value="" disabled>{t("common.selectOne")}</option>

                        {ageGroups.map(g => (
                            <option key={g.id} value={String(g.id)}>
                            {g.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">{t("status")}</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500">
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {/* ② Emergency contacts */}
            <div className="bg-white p-6 rounded border">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{t("emergencyContacts")}</h3>
                    <button type="button" onClick={addContact} className="text-teal-600">＋</button>
                </div>
                {contacts.map((c, i) => (
                    <div key={c.id} className="mb-4 p-4 bg-gray-50 rounded border">
                        <div className="flex justify-between mb-2">
                            <h4 className="font-medium">{t("contact")} {i + 1}</h4>
                            {contacts.length > 1 && <button type="button" onClick={() => removeContact(c.id)} className="text-red-600">✕</button>}
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Input label={t("name")} value={c.name} onChange={(e) => updateContact(c.id, "name", e.target.value)} />
                            <Input label={t("phone")} value={c.phone} onChange={(e) => updateContact(c.id, "phone", e.target.value)} />
                            <Input label={t("relation")} value={c.relation} onChange={(e) => updateContact(c.id, "relation", e.target.value)} />
                        </div>
                    </div>
                ))}
            </div>

            {/* ───── Access / Pick-up Permission ───── */}
            <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Access Permissions</h3>
                <button type="button"
                        onClick={addAccessRow}
                        className="text-teal-600">＋</button>
            </div>

            {accessRows.map((ap, i) => (
                <div key={ap.id} className="mb-4 p-4 bg-white rounded-lg border">
                <h4 className="font-medium mb-3">Person {i + 1}</h4>
                <div className="grid md:grid-cols-4 gap-4">
                    <Input label="Name"
                        value={ap.name}
                        onChange={e => updateAccess(ap.id,"name",e.target.value)} />
                    <Input label="Phone"
                        value={ap.phone}
                        onChange={e => updateAccess(ap.id,"phone",e.target.value)} />
                    <Input label="Relation"
                        value={ap.relation}
                        onChange={e => updateAccess(ap.id,"relation",e.target.value)} />
                    <label className="flex items-center space-x-2">
                    <input type="checkbox"
                            checked={ap.is_authorized}
                            onChange={e =>
                            updateAccess(ap.id,"is_authorized",e.target.checked)}
                            className="w-4 h-4 text-teal-600 border-gray-300 rounded"/>
                    <span>Can Pick Up</span>
                    </label>
                </div>
                {accessRows.length > 1 && (
                    <button type="button"
                            onClick={() => removeAccess(ap.id)}
                            className="text-red-500 text-sm mt-2">Remove</button>
                )}
                </div>
            ))}
            </div>


            {/* ③ Assigned staff */}
            <div className="bg-white p-6 rounded border">
                <h3 className="text-lg font-semibold mb-3">{t("assignedStaff")}</h3>
                {staffChoices.length === 0
                    ? <p className="text-gray-500">{t("common.loading")}…</p>
                    : <div className="grid md:grid-cols-2 gap-2">
                        {staffChoices.map((s) => (
                            <label key={s.id} className="flex items-center space-x-2">
                                <input type="checkbox" checked={staffIds.includes(s.id)} onChange={() => toggleStaff(s.id)} />
                                <span>{s.first_name} {s.last_name}</span>
                            </label>
                        ))}
                    </div>}
            </div>

            {/* ④ Medical blocks (Allergies, Meds, Conditions) */}
            {/* Medical Information */}
            <div className="grid md:grid-cols-3 gap-4">
                {/* Allergies */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">{t("allergies")}</h3>
                    <CheckList
                        options={ALLERGY_OPTS}
                        selected={selectedAllergies}
                        setSelected={setSelectedAllergies}
                    />
                </div>

                {/* Emergency Medications */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">{t("medications")}</h3>
                    <CheckList
                        options={MEDICATION_OPTS}
                        selected={selectedMedications}
                        setSelected={setSelectedMedications}
                    />
                </div>

                {/* Medical Conditions */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">{t("medicalConditions")}</h3>
                    <CheckList
                        options={CONDITION_OPTS}
                        selected={selectedConditions}
                        setSelected={setSelectedConditions}
                    />
                </div>
            </div>


            {/* ⑤ actions */}
            <div className="flex justify-end space-x-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded">{t("common.cancel")}</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-teal-600 text-white rounded">
                    {saving ? t("common.saving") + "…" : t("common.save")}
                </button>
            </div>
        </form>
    );
}
