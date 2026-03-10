'use client'
import { useEffect, useState } from 'react'
import type { User, SupabaseClient } from '@supabase/supabase-js'
import { createBrowserSupabaseClient } from '@/lib/supabase'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserSupabaseClient() as SupabaseClient

    supabase.auth.getUser().then((response: { data: { user: User | null } }) => {
      setUser(response.data.user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => {
    const supabase = createBrowserSupabaseClient() as SupabaseClient
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return { user, loading, logout }
}
