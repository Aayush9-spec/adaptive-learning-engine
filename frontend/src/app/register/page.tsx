'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [grade, setGrade] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!username.trim() || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }
    if (role === 'student' && !grade) {
      setError('Please select your grade')
      setLoading(false)
      return
    }

    try {
      await register(username, password, role, role === 'student' ? parseInt(grade) : undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: '#f0f0f0',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '24px'
          }}>
            ✓
          </div>
          <h1 style={{ 
            fontSize: '24px',
            fontWeight: '600',
            color: '#1a1a1a',
            marginBottom: '8px'
          }}>
            Create Account
          </h1>
          <p style={{ 
            fontSize: '14px',
            color: '#666'
          }}>
            Join Adaptive Learning today
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ 
              background: '#fee',
              border: '1px solid #fcc',
              color: '#c33',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              disabled={loading}
              autoComplete="username"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: '#f5f5f5',
                border: '1px solid #e0e0e0',
                borderRadius: '10px',
                fontSize: '14px',
                color: '#1a1a1a',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.background = '#fff'
                e.target.style.borderColor = '#667eea'
              }}
              onBlur={(e) => {
                e.target.style.background = '#f5f5f5'
                e.target.style.borderColor = '#e0e0e0'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={loading}
              autoComplete="new-password"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: '#f5f5f5',
                border: '1px solid #e0e0e0',
                borderRadius: '10px',
                fontSize: '14px',
                color: '#1a1a1a',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.background = '#fff'
                e.target.style.borderColor = '#667eea'
              }}
              onBlur={(e) => {
                e.target.style.background = '#f5f5f5'
                e.target.style.borderColor = '#e0e0e0'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: '#f5f5f5',
                border: '1px solid #e0e0e0',
                borderRadius: '10px',
                fontSize: '14px',
                color: '#1a1a1a',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.background = '#fff'
                e.target.style.borderColor = '#667eea'
              }}
              onBlur={(e) => {
                e.target.style.background = '#f5f5f5'
                e.target.style.borderColor = '#e0e0e0'
              }}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          {role === 'student' && (
            <div style={{ marginBottom: '24px' }}>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: '#f5f5f5',
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: grade ? '#1a1a1a' : '#999',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.background = '#fff'
                  e.target.style.borderColor = '#667eea'
                }}
                onBlur={(e) => {
                  e.target.style.background = '#f5f5f5'
                  e.target.style.borderColor = '#e0e0e0'
                }}
              >
                <option value="">Select Grade</option>
                {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#999' : '#2c3e50',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginBottom: '20px'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = '#1a252f'
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = '#2c3e50'
            }}
          >
            {loading ? 'Creating account...' : 'Get Started'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Already have an account?{' '}
            <Link 
              href="/login" 
              style={{ 
                color: '#667eea',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
