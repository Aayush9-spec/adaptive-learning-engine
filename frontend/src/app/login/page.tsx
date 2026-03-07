'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!username.trim() || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      await login(username, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            padding: '30px 40px',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              margin: '0 auto 15px',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: '#666', fontSize: '14px' }}>Signing in...</p>
          </div>
        </div>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
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
            →
          </div>
          <h1 style={{ 
            fontSize: '24px',
            fontWeight: '600',
            color: '#1a1a1a',
            marginBottom: '8px'
          }}>
            Sign in
          </h1>
          <p style={{ 
            fontSize: '14px',
            color: '#666'
          }}>
            Welcome back to Adaptive Learning
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

          <div style={{ marginBottom: '24px' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={loading}
              autoComplete="current-password"
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
            {loading ? 'Signing in...' : 'Get Started'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Don't have an account?{' '}
            <Link 
              href="/register" 
              style={{ 
                color: '#667eea',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Sign up
            </Link>
          </p>
        </div>
        </div>
      </div>
    </>
  )
}
