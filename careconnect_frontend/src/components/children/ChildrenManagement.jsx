import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import ChildProfile from './ChildProfile'
import { apiCall } from '../../lib/mockApi'
import { API_ENDPOINTS } from '../../lib/config'
import { labelOfAgeGroup } from '../../lib/ageGroup'

const ChildrenManagement = ({ onBack, filter = 'all' }) => {
  const { t } = useTranslation()
  const { accessToken, logout } = useAuth()

  const [searchTerm, setSearchTerm]       = useState('')
  const [children, setChildren]           = useState([])
  const [loadingList, setLoadingList]     = useState(true)

  const [selectedChild, setSelectedChild] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // 1) Fetch list of children whenever `filter` changes
  useEffect(() => {
    setLoadingList(true)
    let url = API_ENDPOINTS.DAYCARE_CHILDREN
    if (filter === 'present')  url += '?present=true'
    if (filter === 'waitlist') url += '?status=waitlist'
    if (filter === 'enrolled') url += '?status=enrolled';

    apiCall(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => res.json())
      .then(data => setChildren(data))
      .catch(() => {
        /* optionally toast an error */
      })
      .finally(() => setLoadingList(false))
  }, [filter, accessToken])

  // 2) When you click on a child, fetch its full details
  const handleChildClick = async child => {
    setLoadingDetail(true)
    try {
      const res = await apiCall(
        `${API_ENDPOINTS.DAYCARE_CHILDREN}/${child.id}/full`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const data  = await res.json()

      console.log('detail response', data);

      // flatten so ChildProfile gets the fields where it expects them

      const normalised = {
        ...data,
        id:           data.id            ?? data.child?.id,
        first_name:   data.first_name    ?? data.child?.first_name ?? data.child?.firstName,
        last_name:    data.last_name     ?? data.child?.last_name  ?? data.child?.lastName,
        age:          data.age           ?? data.child?.age,
        status:       data.status        ?? data.child?.status     ?? data.currentStatus,
        date_of_birth: data.date_of_birth ?? data.child?.date_of_birth,
        age_group:     data.age_group     ?? data.child?.age_group,
        enrollment_date: data.enrollment_date ?? data.child?.enrollment_date,

        parents:            data.parents            || data.child?.parents            || [],
        emergency_contacts: data.emergency_contacts || data.child?.emergency_contacts || [],
        medical_info:       data.medical_info       || data.child?.medical_info       || {},
        recent_incidents:   data.recent_incidents   || data.child?.recent_incidents   || [],
      }
      setSelectedChild(normalised)
    } catch (err) {
      console.error(err)
      // optionally toast an error
    } finally {
      setLoadingDetail(false)
    }
  }

  // Show spinner while loading list
  if (loadingList) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  // Show spinner while loading detail
  if (loadingDetail) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  // 3) Detail view
  if (selectedChild) {
    return (
      <ChildProfile
        child={selectedChild}
        onBack={() => setSelectedChild(null)}
      />
    )
  }

  // 4) Main list view
  const filtered = children.filter(child =>
    `${child.first_name} ${child.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold text-gray-900">CareConnect</h1>
            <button
              onClick={onBack}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← {t('dashboard.backToDashboard')}
            </button>
          </div>
        </div>
      </div>

      {/* Search + Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
          <input
            type="text"
            placeholder={t('searchChildren')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div className="grid gap-6">
          {filtered.length > 0 ? (
            filtered.map(child => (
              <div
                key={child.id}
                onClick={() => handleChildClick(child)}
                className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-teal-600 font-bold text-lg">
                      {child.first_name.charAt(0).toUpperCase()}
                      {child.last_name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {child.first_name} {child.last_name}
                      </h3>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {t(child.status === 'active' ? 'active' : child.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <span>📅</span>
                        <span>
                          {t('age')}: {child.age} yrs
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>👥</span>
                        <span>
                        {t('ageGroup')}: {labelOfAgeGroup(child.age_group) || t('n/a')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>📅</span>
                        <span>
                          {t('enrolled')}: {child.enrollment_date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">{t('childrenManagement.noResults')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom User Info */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {accessToken?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {t('dashboard.loggedInAs')} {t('common.you')}
            </p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            🚪 {t('common.logout')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChildrenManagement
