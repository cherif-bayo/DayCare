import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { apiCall } from '../lib/mockApi'
import { API_ENDPOINTS } from '../lib/config'

export function useDaycareStats() {
  const { accessToken } = useAuth()
  const [stats, setStats]   = useState({ enrolled_children: 0, waitlisted: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!accessToken) return

    async function fetchStats() {
      setLoading(true)
      try {
        const res = await apiCall(API_ENDPOINTS.DAYCARE_STATS, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const body = await res.json()
        setStats(body)
      } catch (err) {
        console.error("Failed to load stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [accessToken])

  return { stats, loading }
}
