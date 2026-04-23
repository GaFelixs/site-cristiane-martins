const form = document.getElementById('loginForm');
const errorEl = document.getElementById('loginError');
const btnLogin = document.getElementById('loginBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';
  btnLogin.textContent = 'Entrando...';
  btnLogin.disabled = true;

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || 'Erro ao fazer login';
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('nome', data.nome);

    if (data.role === 'admin') {
      window.location.href = '/galeria/admin.html';
    } else {
      window.location.href = '/galeria/galeria.html';
    }
  } catch {
    errorEl.textContent = 'Erro de conexão. Tente novamente.';
  } finally {
    btnLogin.textContent = 'Entrar';
    btnLogin.disabled = false;
  }
});
