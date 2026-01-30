export default function TesteSimples() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '20px' }}>
        🚀 TÁ RODANDO!
      </h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '40px' }}>
        Página de teste super simples
      </p>
      <div style={{
        background: 'rgba(255,255,255,0.2)',
        padding: '30px',
        borderRadius: '15px',
        backdropFilter: 'blur(10px)'
      }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
          ✅ React funcionando
        </p>
        <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
          ✅ Servidor ativo
        </p>
        <p style={{ fontSize: '1.2rem' }}>
          ✅ Rota configurada
        </p>
      </div>
      <p style={{ 
        marginTop: '40px', 
        fontSize: '1rem',
        opacity: 0.8
      }}>
        Se você vê isso, tudo está funcionando! 🎉
      </p>
    </div>
  )
}
