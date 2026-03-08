export default function DashboardLoading() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '40px 50px',
        borderRadius: '20px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #667eea',
          borderRadius: '50%',
          margin: '0 auto 20px',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ 
          color: '#666', 
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '8px'
        }}>
          Loading Dashboard...
        </p>
        <p style={{ 
          color: '#999', 
          fontSize: '13px'
        }}>
          Please wait
        </p>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
