import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { toast } from 'react-toastify'

export const useAuth = () => {
  const [loading, setLoading] = useState(false)

  const signUp = async (email, password, name) => {
    try {
      setLoading(true)
      
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      // Create profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: email,
              name: name,
              avatar_url: null,
            }
          ])

        if (profileError) throw profileError
      }

      toast.success('Account created successfully!')
      return { data: authData, error: null }
    } catch (error) {
      console.error('Error signing up:', error)
      toast.error(error.message || 'Failed to create account')
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('Logged in successfully!')
      return { data, error: null }
    } catch (error) {
      console.error('Error signing in:', error)
      toast.error(error.message || 'Failed to sign in')
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Logged out successfully!')
      return { error: null }
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error(error.message || 'Failed to sign out')
      return { error }
    } finally {
      setLoading(false)
    }
  }

  return {
    signUp,
    signIn,
    signOut,
    loading
  }
}
