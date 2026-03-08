'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isNotRobot, setIsNotRobot] = useState(false)
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
    
    if (!isNotRobot) {
      setError('Please verify you are not a robot')
      setLoading(false)
      return
    }

    try {
      await register(username, password, 'student', undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    setError('Google login coming soon!')
  }

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        body {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          min-height: 100vh;
        }
      `}</style>
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
            <p style={{ color: '#666', fontSize: '14px' }}>Creating account...</p>
          </div>
        </div>
      )}
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

          <div style={{ marginBottom: '20px' }}>
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

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <input
                type="checkbox"
                checked={isNotRobot}
                onChange={(e) => setIsNotRobot(e.target.checked)}
                disabled={loading}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: '#667eea'
                }}
              />
              <span style={{ fontSize: '14px', color: '#666' }}>
                I'm not a robot
              </span>
            </label>
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
              marginBottom: '16px'
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

          <div style={{ 
            textAlign: 'center', 
            margin: '20px 0',
            color: '#999',
            fontSize: '13px'
          }}>
            Or sign up with
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '12px',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                width: '50px',
                height: '50px',
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
            <button
              type="button"
              disabled={loading}
              style={{
                width: '50px',
                height: '50px',
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            <button
              type="button"
              disabled={loading}
              style={{
                width: '50px',
                height: '50px',
                background: '#000',
                border: '1px solid #e0e0e0',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </button>
          </div>
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
    </>
  )
}
