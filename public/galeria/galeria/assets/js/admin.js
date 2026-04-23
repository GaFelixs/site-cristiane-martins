const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token || role !== 'admin') {
  localStorage.clear();
  window.location.href = '/galeria/';
}

document.getElementById('btnLogout').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = '/galeria/';
});

// ===========================
// Tabs
// ===========================
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
  });
});

// ===========================
// Clientes
// ===========================
async function carregarClientes() {
  const res = await fetch('/api/admin/clientes', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
}

async function renderClientes() {
  const lista = document.getElementById('clientesLista');
  lista.innerHTML = '<p class="loading-text">Carregando...</p>';

  const clientes = await carregarClientes();

  if (clientes.length === 0) {
    lista.innerHTML = '<p class="empty-text">Nenhum cliente cadastrado.</p>';
    return;
  }

  lista.innerHTML = clientes.map(c => `
    <div class="cliente-card">
      <div class="cliente-card__info">
        <strong>${c.nome}</strong>
        <span>${c.email}</span>
      </div>
    </div>
  `).join('');
}

document.getElementById('btnNovoCliente').addEventListener('click', () => {
  const form = document.getElementById('formNovoCliente');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('btnCancelarCliente').addEventListener('click', () => {
  document.getElementById('formNovoCliente').style.display = 'none';
});

document.getElementById('btnSalvarCliente').addEventListener('click', async () => {
  const nome = document.getElementById('clienteNome').value.trim();
  const email = document.getElementById('clienteEmail').value.trim();
  const senha = document.getElementById('clienteSenha').value;
  const errorEl = document.getElementById('clienteError');

  errorEl.textContent = '';

  if (!nome || !email || !senha) {
    errorEl.textContent = 'Preencha todos os campos.';
    return;
  }

  const res = await fetch('/api/admin/clientes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ nome, email, senha })
  });

  const data = await res.json();

  if (!res.ok) {
    errorEl.textContent = data.error;
    return;
  }

  document.getElementById('formNovoCliente').style.display = 'none';
  document.getElementById('clienteNome').value = '';
  document.getElementById('clienteEmail').value = '';
  document.getElementById('clienteSenha').value = '';
  renderClientes();
  popularSelectsClientes();
});

// ===========================
// Upload — popular selects
// ===========================
async function popularSelectsClientes() {
  const clientes = await carregarClientes();
  const selects = ['uploadCliente', 'selecaoCliente'];

  selects.forEach(id => {
    const sel = document.getElementById(id);
    const current = sel.value;
    sel.innerHTML = '<option value="">Selecione o cliente</option>';
    clientes.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.nome;
      sel.appendChild(opt);
    });
    sel.value = current;
  });
}

document.getElementById('uploadCliente').addEventListener('change', async (e) => {
  const clientId = e.target.value;
  const ensaioSel = document.getElementById('uploadEnsaio');
  ensaioSel.innerHTML = '<option value="">Selecione o ensaio</option>';

  if (!clientId) return;

  const res = await fetch(`/api/admin/ensaios/${clientId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const ensaios = await res.json();

  ensaios.forEach(en => {
    const opt = document.createElement('option');
    opt.value = en.id;
    opt.textContent = en.titulo;
    ensaioSel.appendChild(opt);
  });
});

// ===========================
// Novo Ensaio
// ===========================
document.getElementById('btnNovoEnsaio').addEventListener('click', () => {
  const group = document.getElementById('novoEnsaioGroup');
  group.style.display = group.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('btnCriarEnsaio').addEventListener('click', async () => {
  const clientId = document.getElementById('uploadCliente').value;
  const titulo = document.getElementById('novoEnsaioTitulo').value.trim();

  if (!clientId || !titulo) {
    alert('Selecione o cliente e informe o título do ensaio.');
    return;
  }

  const res = await fetch('/api/admin/ensaios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ client_id: clientId, titulo })
  });

  const data = await res.json();

  if (!res.ok) { alert(data.error); return; }

  document.getElementById('novoEnsaioTitulo').value = '';
  document.getElementById('novoEnsaioGroup').style.display = 'none';

  const ensaioSel = document.getElementById('uploadEnsaio');
  const opt = document.createElement('option');
  opt.value = data.id;
  opt.textContent = titulo;
  ensaioSel.appendChild(opt);
  ensaioSel.value = data.id;
});

// ===========================
// Upload de Fotos
// ===========================
let arquivosSelecionados = [];

const uploadArea = document.getElementById('uploadArea');
const uploadInput = document.getElementById('uploadInput');
const uploadPreview = document.getElementById('uploadPreview');

document.getElementById('uploadClick').addEventListener('click', () => uploadInput.click());

uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  handleArquivos(Array.from(e.dataTransfer.files));
});

uploadInput.addEventListener('change', () => handleArquivos(Array.from(uploadInput.files)));

function handleArquivos(files) {
  arquivosSelecionados = files.filter(f => f.type.startsWith('image/'));
  uploadPreview.innerHTML = '';
  arquivosSelecionados.forEach(f => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(f);
    uploadPreview.appendChild(img);
  });
}

document.getElementById('btnEnviarFotos').addEventListener('click', async () => {
  const clientId = document.getElementById('uploadCliente').value;
  const ensaioId = document.getElementById('uploadEnsaio').value;
  const errorEl = document.getElementById('uploadError');
  const successEl = document.getElementById('uploadSuccess');

  errorEl.textContent = '';
  successEl.textContent = '';

  if (!clientId || !ensaioId) { errorEl.textContent = 'Selecione o cliente e o ensaio.'; return; }
  if (arquivosSelecionados.length === 0) { errorEl.textContent = 'Selecione ao menos uma foto.'; return; }

  const formData = new FormData();
  formData.append('client_id', clientId);
  formData.append('ensaio_id', ensaioId);
  arquivosSelecionados.forEach(f => formData.append('fotos', f));

  const btn = document.getElementById('btnEnviarFotos');
  btn.textContent = 'Enviando...';
  btn.disabled = true;

  try {
    const res = await fetch('/api/photos/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    const data = await res.json();

    if (!res.ok) { errorEl.textContent = data.error; return; }

    successEl.textContent = data.message;
    arquivosSelecionados = [];
    uploadPreview.innerHTML = '';
    uploadInput.value = '';
  } catch {
    errorEl.textContent = 'Erro ao enviar fotos.';
  } finally {
    btn.textContent = 'Enviar fotos';
    btn.disabled = false;
  }
});

// ===========================
// Seleções
// ===========================
document.getElementById('selecaoCliente').addEventListener('change', async (e) => {
  const clientId = e.target.value;
  const resultado = document.getElementById('selecoesResultado');

  if (!clientId) { resultado.innerHTML = ''; return; }

  resultado.innerHTML = '<p class="loading-text">Carregando seleções...</p>';

  const res = await fetch(`/api/selections/cliente/${clientId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const fotos = await res.json();

  if (fotos.length === 0) {
    resultado.innerHTML = '<p class="empty-text">Este cliente ainda não selecionou fotos.</p>';
    return;
  }

  resultado.innerHTML = `
    <p style="margin-bottom:1rem;color:var(--color-muted)">${fotos.length} foto(s) selecionada(s)</p>
    <div class="selecoes-grid">
      ${fotos.map(f => `
        <div class="selecao-foto">
          <img src="/uploads/${f.filename}" alt="Foto selecionada" loading="lazy" />
        </div>
      `).join('')}
    </div>
  `;
});

// ===========================
// Init
// ===========================
renderClientes();
popularSelectsClientes();
