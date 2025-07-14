/* ManageAgeGroupsForm.jsx
 * Create / edit / archive daycare age-groups
 * ------------------------------------------------------------ */

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { apiCall } from '../../lib/mockApi';
import { API_ENDPOINTS } from '../../lib/config';
import { useAuth } from '../../contexts/AuthContext';

const EMPTY_DRAFT = {
  id: null,
  name: '',
  description: '',
  min_age_months: 0,
  max_age_months: '',
};

const ManageAgeGroupsForm = ({ onClose }) => {
  const { accessToken } = useAuth();

  /* -------------------------------------------------- state */
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  /* --------------------------------------------- fetch list */
  useEffect(() => {
    (async () => {
      try {
        const res = await apiCall(API_ENDPOINTS.AGE_GROUPS, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const json = await res.json();
        setGroups(json);
      } catch (e) {
        console.error(e);
        toast.error('Could not load age groups');
      } finally {
        setLoading(false);
      }
    })();
  }, [accessToken]);

  /* ------------------------------------------ helpers */
  const resetDraft = () => setDraft(EMPTY_DRAFT);

  const saveDraft = async () => {
    const isEdit = !!draft.id;
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit
      ? `${API_ENDPOINTS.AGE_GROUPS}/${draft.id}`
      : API_ENDPOINTS.AGE_GROUPS;

    const res = await apiCall(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(draft),
    });

    if (!res.ok) {
      toast.error('Failed to save age group');
      return;
    }

    const saved = await res.json();
    toast.success(isEdit ? 'Age-group updated' : 'Age-group created');

    setGroups(
      isEdit ? groups.map(g => (g.id === saved.id ? saved : g)) : [...groups, saved],
    );
    resetDraft();
  };

  const archiveGroup = async id => {
    if (!window.confirm('Archive this age group?')) return;

    const res = await apiCall(`${API_ENDPOINTS.AGE_GROUPS}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.ok) {
      setGroups(groups.filter(g => g.id !== id));
      toast.success('Age-group archived');
    } else {
      toast.error('Could not archive');
    }
  };

  /* -------------------------------------------------- render */
  return (
    <div className="text-sm">
      {/* List ------------------------------------------------ */}
      <h4 className="text-md font-semibold mb-2">Existing age groups</h4>

      {loading ? (
        <p>Loading…</p>
      ) : groups.length === 0 ? (
        <p className="text-gray-500 mb-4">No age groups yet</p>
      ) : (
        <table className="w-full mb-6">
          <thead>
            <tr className="text-left border-b">
              <th className="py-1">Name</th>
              <th className="py-1">Min&nbsp;(mo)</th>
              <th className="py-1">Max&nbsp;(mo)</th>
              <th className="py-1 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {groups.map(g => (
              <tr key={g.id} className="border-b last:border-0">
                <td className="py-1">{g.name}</td>
                <td className="py-1">{g.min_age_months}</td>
                <td className="py-1">{g.max_age_months ?? '—'}</td>
                <td className="py-1 text-right space-x-2">
                  <button
                    onClick={() => setDraft(g)}
                    className="text-indigo-600 text-xs hover:underline"
                  >
                    edit
                  </button>
                  <button
                    onClick={() => archiveGroup(g.id)}
                    className="text-red-600 text-xs hover:underline"
                  >
                    archive
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Create / Edit ------------------------------------- */}
      <h4 className="text-md font-semibold mb-2">
        {draft.id ? 'Edit age group' : 'New age group'}
      </h4>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <input
          type="text"
          placeholder="Name"
          value={draft.name}
          onChange={e => setDraft({ ...draft, name: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="number"
          min="0"
          placeholder="Min months"
          value={draft.min_age_months}
          onChange={e =>
            setDraft({ ...draft, min_age_months: Number(e.target.value) })
          }
          className="border p-2 rounded"
        />
        <input
          type="number"
          min="0"
          placeholder="Max months (blank = ∞)"
          value={draft.max_age_months}
          onChange={e =>
            setDraft({
              ...draft,
              max_age_months: e.target.value === '' ? '' : Number(e.target.value),
            })
          }
          className="border p-2 rounded"
        />
      </div>

      <div className="flex justify-end space-x-2">
        {draft.id && (
          <button
            onClick={resetDraft}
            className="px-3 py-1 border rounded text-gray-600"
          >
            Cancel
          </button>
        )}
        <button
          onClick={saveDraft}
          className="px-4 py-1 bg-indigo-600 text-white rounded"
        >
          {draft.id ? 'Update' : 'Create'}
        </button>
      </div>

      {/* Footer -------------------------------------------- */}
      <div className="text-right mt-6">
        <button
          onClick={onClose}
          className="text-xs text-gray-500 hover:underline"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ManageAgeGroupsForm;
