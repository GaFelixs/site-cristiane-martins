const token = localStorage.getItem('token');
const nome = localStorage.getItem('nome');

if (!token) window.location.href = '/galeria/';

document.getElementById('nomeCliente').textContent = nome || '';
document.getElementById('btnLogout').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = '/galeria/';
});

const grid = document.getElementById('galeriaGrid');
const totalEl = document.getElementById('totalSelecionadas');
const countConfirmar = document.getElementById('countConfirmar');

let fotos = [];

async function carregarFotos() {
  try {
    const res = await fetch('/api/photos/cliente/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.status === 401) { localStorage.clear(); window.location.href = '/galeria/'; return; }

    fotos = await res.json();

    if (fotos.length === 0) {
      grid.innerHTML = '<p class="empty-text">Nenhuma foto disponível ainda. Aguarde a fotógrafa fazer o upload.</p>';
      return;
    }

    renderFotos();
    atualizarContador();
  } catch {
    grid.innerHTML = '<p class="empty-text">Erro ao carregar fotos.</p>';
  }
}

function renderFotos() {
  grid.innerHTML = '';
  fotos.forEach(foto => {
    const card = document.createElement('div');
    card.className = `foto-card ${foto.selected ? 'selecionada' : ''}`;
    card.dataset.id = foto.id;
    card.innerHTML = `
      <img src="/uploads/${foto.filename}" alt="Foto ${foto.id}" loading="lazy" />
      <div class="check-overlay">✓</div>
    `;
    card.addEventListener('click', () => toggleSelecao(card, foto));
    grid.appendChild(card);
  });
}

async function toggleSelecao(card, foto) {
  try {
    const res = await fetch('/api/selections/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ photo_id: foto.id })
    });

    const data = await res.json();
    foto.selected = data.selected;
    card.classList.toggle('selecionada', data.selected);
    atualizarContador();
  } catch {
    alert('Erro ao salvar seleção. Tente novamente.');
  }
}

function atualizarContador() {
  const total = fotos.filter(f => f.selected).length;
  totalEl.textContent = `${total} selecionada${total !== 1 ? 's' : ''}`;
  countConfirmar.textContent = total;
}

document.getElementById('btnConfirmar').addEventListener('click', () => {
  const total = fotos.filter(f => f.selected).length;
  if (total === 0) {
    alert('Selecione ao menos uma foto antes de confirmar.');
    return;
  }
  document.getElementById('modalConfirmar').style.display = 'flex';
});

document.getElementById('btnFecharModal').addEventListener('click', () => {
  document.getElementById('modalConfirmar').style.display = 'none';
});

carregarFotos();
