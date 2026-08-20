import React, { useState } from 'react';
import { X, Code2, Copy, Check, FileCode, FileText, Download } from 'lucide-react';

interface ExportCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportCodeModal: React.FC<ExportCodeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'index' | 'style' | 'app' | 'firebaseJson' | 'rules'>('app');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const files = {
    index: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MeloVision - Encurtador de Links</title>
  <link rel="stylesheet" href="style.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
</head>
<body>
  <!-- Navbar -->
  <header class="navbar">
    <div class="nav-container">
      <div class="logo">
        <span class="logo-icon">🔗</span>
        <span class="logo-text">MeloVision</span>
        <span class="badge">Shortener</span>
      </div>
      <div id="user-nav-area" class="user-nav hidden">
        <span id="user-display-name">Carregando...</span>
        <button id="btn-logout" class="btn-secondary">Sair</button>
      </div>
    </div>
  </header>

  <main class="main-content">
    <!-- Tela de Redirecionamento (Ativada se rota /melovisionXXXX for acessada) -->
    <section id="redirect-section" class="card redirect-card hidden">
      <h2>MeloVision Redirecionamento</h2>
      <p id="redirect-slug" class="slug-pill">melovisionXXXX</p>
      <div class="spinner"></div>
      <p id="redirect-status">Buscando URL de destino no Firestore...</p>
      <div id="redirect-target-box" class="target-box hidden">
        <span>Destino:</span>
        <p id="redirect-target-url"></p>
      </div>
    </section>

    <!-- Tela de Login / Cadastro -->
    <section id="auth-section" class="card auth-card">
      <div class="auth-header">
        <h1>Bem-vindo ao MeloVision</h1>
        <p>Encurte links com identificadores exclusivos <code>melovisionXXXX</code> e Firebase.</p>
      </div>

      <div class="auth-body">
        <button id="btn-google-login" class="btn-google">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
          <span>Entrar com o Google</span>
        </button>

        <div class="divider"><span>ou com e-mail</span></div>

        <form id="auth-form">
          <div id="name-group" class="form-group hidden">
            <label for="auth-name">Nome Completo</label>
            <input type="text" id="auth-name" placeholder="Seu nome" />
          </div>

          <div class="form-group">
            <label for="auth-email">E-mail</label>
            <input type="email" id="auth-email" required placeholder="seuemail@exemplo.com" />
          </div>

          <div class="form-group">
            <label for="auth-password">Senha</label>
            <input type="password" id="auth-password" required placeholder="••••••••" />
          </div>

          <div id="auth-error" class="alert-error hidden"></div>
          <div id="auth-success" class="alert-success hidden"></div>

          <button type="submit" id="btn-submit-auth" class="btn-primary">Entrar no Painel</button>
        </form>

        <div class="auth-toggle">
          <span id="toggle-text">Ainda não tem conta?</span>
          <button id="btn-toggle-mode">Criar conta grátis</button>
        </div>
      </div>
    </section>

    <!-- Painel do Usuário (Dashboard) -->
    <section id="dashboard-section" class="dashboard hidden">
      <!-- Formulário de Criação -->
      <div class="card create-card">
        <h2>Encurtar Novo Link</h2>
        <p class="subtitle">Gera automaticamente o padrão obrigatório <code>melovisionXXXX</code>.</p>
        
        <form id="create-link-form" class="form-inline">
          <div class="input-group">
            <input type="url" id="original-url-input" required placeholder="Cole sua URL original: https://exemplo.com/..." />
          </div>
          <button type="submit" id="btn-shorten" class="btn-primary">Encurtar Link</button>
        </form>
        <div id="create-error" class="alert-error hidden"></div>
      </div>

      <!-- Tabela / Lista de Links -->
      <div class="card list-card">
        <div class="list-header">
          <h3>Seus Links Criados (<span id="links-count">0</span>)</h3>
        </div>

        <div class="table-responsive">
          <table class="links-table">
            <thead>
              <tr>
                <th>Slug (Curto)</th>
                <th>URL Original</th>
                <th>Cliques</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody id="links-table-body">
              <tr>
                <td colspan="5" class="empty-state">Nenhum link criado ainda.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </main>

  <!-- Modal de Edição -->
  <div id="edit-modal" class="modal-backdrop hidden">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Editar Link de Destino</h3>
        <button id="btn-close-edit-modal" class="btn-close">&times;</button>
      </div>
      <form id="edit-link-form">
        <input type="hidden" id="edit-link-id" />
        <div class="form-group">
          <label>Slug Fixo</label>
          <input type="text" id="edit-slug-display" disabled />
        </div>
        <div class="form-group">
          <label for="edit-original-url">Nova URL Original de Destino</label>
          <input type="url" id="edit-original-url" required />
        </div>
        <div class="modal-actions">
          <button type="button" id="btn-cancel-edit" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary">Salvar Alterações</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Script Firebase Modular SDK v9+ -->
  <script type="module" src="app.js"></script>
</body>
</html>`,

    style: `/* MeloVision - Modern & Clean Stylesheet */
:root {
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --bg-main: #f8fafc;
  --bg-card: #ffffff;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --border: #e2e8f0;
  --radius: 14px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background-color: var(--bg-main);
  color: var(--text-main);
  line-height: 1.6;
  min-height: 100vh;
}

code {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  background: #eef2ff;
  color: var(--primary);
  padding: 2px 6px;
  border-radius: 6px;
}

.navbar {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.nav-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  font-size: 1.2rem;
}

.badge {
  background: #e0e7ff;
  color: var(--primary);
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 6px;
}

.user-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
}

.main-content {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 28px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;
}

.auth-card {
  max-width: 440px;
  margin: 40px auto;
}

.auth-header {
  text-align: center;
  margin-bottom: 24px;
}

.auth-header h1 {
  font-size: 1.5rem;
  font-weight: 800;
}

.auth-header p {
  font-size: 0.88rem;
  color: var(--text-muted);
  margin-top: 6px;
}

.btn-primary {
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  font-size: 0.9rem;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  background: #f1f5f9;
  border: 1px solid var(--border);
  color: var(--text-main);
  padding: 8px 14px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-google {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #fff;
  border: 1px solid var(--border);
  padding: 10px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 16px;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 18px 0;
  color: var(--text-muted);
  font-size: 0.78rem;
}

.divider::before, .divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border);
}

.divider span {
  padding: 0 10px;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 5px;
}

.form-group input, .form-inline input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.9rem;
}

.form-inline {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.form-inline .input-group {
  flex: 1;
}

.table-responsive {
  overflow-x: auto;
  margin-top: 14px;
}

.links-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.85rem;
}

.links-table th, .links-table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
}

.links-table th {
  background: #f8fafc;
  font-weight: 700;
  color: var(--text-muted);
}

.btn-action {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  border: 1px solid var(--border);
  background: #fff;
  cursor: pointer;
  margin-right: 4px;
}

.btn-action.delete {
  color: #dc2626;
}

.hidden {
  display: none !important;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 20px;
}

.modal-content {
  background: #fff;
  border-radius: var(--radius);
  width: 100%;
  max-width: 500px;
  padding: 24px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* Responsive */
@media (max-width: 640px) {
  .form-inline {
    flex-direction: column;
  }
}`,

    app: `// app.js - Firebase Modular SDK v9+ Implementation
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 1. CONFIGURAÇÃO DO FIREBASE (Preencha com as chaves do projeto 'encurtadorlink')
const firebaseConfig = {
  apiKey: "",
  authDomain: "encurtadorlink.firebaseapp.com",
  projectId: "encurtadorlink",
  storageBucket: "encurtadorlink.appspot.com",
  messagingSenderId: "",
  appId: ""
};

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

let currentUser = null;
let unsubscribeLinks = null;
let isRegisterMode = false;

// 2. REGRA DE NEGÓCIO: Geração do Slug "melovisionXXXX"
function generateMeloVisionSlug() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return "melovision" + suffix;
}

// 3. LÓGICA DE REDIRECIONAMENTO (se acessar /melovisionXXXX)
async function handleRedirection() {
  const path = window.location.pathname.replace(/^\\//, "");
  if (/^melovision[a-zA-Z0-9]{4}$/.test(path)) {
    document.getElementById("auth-section").classList.add("hidden");
    document.getElementById("dashboard-section").classList.add("hidden");
    const redirectSec = document.getElementById("redirect-section");
    redirectSec.classList.remove("hidden");
    document.getElementById("redirect-slug").textContent = path;

    try {
      const docRef = doc(db, "links", path);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        document.getElementById("redirect-status").textContent = "Redirecionando...";
        document.getElementById("redirect-target-url").textContent = data.originalUrl;
        document.getElementById("redirect-target-box").classList.remove("hidden");

        // Incrementa cliques no Firestore
        await updateDoc(docRef, { clicks: increment(1) });

        // Redireciona via window.location.href
        setTimeout(() => {
          window.location.href = data.originalUrl;
        }, 1200);
      } else {
        document.getElementById("redirect-status").textContent = "Link não encontrado ou expirado.";
      }
    } catch (e) {
      console.error(e);
      document.getElementById("redirect-status").textContent = "Erro ao buscar destino no banco de dados.";
    }
    return true;
  }
  return false;
}

// 4. AUTENTICAÇÃO
function initAuth() {
  const authForm = document.getElementById("auth-form");
  const btnGoogle = document.getElementById("btn-google-login");
  const btnToggle = document.getElementById("btn-toggle-mode");
  const btnLogout = document.getElementById("btn-logout");

  btnGoogle.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      showAuthError(err.message);
    }
  });

  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("auth-email").value;
    const password = document.getElementById("auth-password").value;

    try {
      if (isRegisterMode) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      showAuthError(err.message);
    }
  });

  btnToggle.addEventListener("click", () => {
    isRegisterMode = !isRegisterMode;
    document.getElementById("name-group").classList.toggle("hidden", !isRegisterMode);
    document.getElementById("btn-submit-auth").textContent = isRegisterMode ? "Cadastrar" : "Entrar no Painel";
    document.getElementById("toggle-text").textContent = isRegisterMode ? "Já tem conta?" : "Ainda não tem conta?";
    btnToggle.textContent = isRegisterMode ? "Fazer Login" : "Criar conta grátis";
  });

  btnLogout.addEventListener("click", () => signOut(auth));

  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
      document.getElementById("auth-section").classList.add("hidden");
      document.getElementById("dashboard-section").classList.remove("hidden");
      document.getElementById("user-nav-area").classList.remove("hidden");
      document.getElementById("user-display-name").textContent = user.displayName || user.email;
      listenToLinks(user.uid);
    } else {
      if (unsubscribeLinks) unsubscribeLinks();
      document.getElementById("auth-section").classList.remove("hidden");
      document.getElementById("dashboard-section").classList.add("hidden");
      document.getElementById("user-nav-area").classList.add("hidden");
    }
  });
}

function showAuthError(msg) {
  const errBox = document.getElementById("auth-error");
  errBox.textContent = msg;
  errBox.classList.remove("hidden");
}

// 5. CRUD NO CLOUD FIRESTORE
// CREATE
document.getElementById("create-link-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) return;
  const input = document.getElementById("original-url-input");
  let url = input.value.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  const slug = generateMeloVisionSlug();
  const linkData = {
    id: slug,
    slug: slug,
    originalUrl: url,
    shortUrl: window.location.origin + "/" + slug,
    userId: currentUser.uid,
    userEmail: currentUser.email,
    createdAt: Date.now(),
    clicks: 0
  };

  try {
    await setDoc(doc(db, "links", slug), linkData);
    input.value = "";
  } catch (err) {
    alert("Erro ao salvar link no Firestore: " + err.message);
  }
});

// READ (Real-time com onSnapshot)
function listenToLinks(userId) {
  const q = query(collection(db, "links"), where("userId", "==", userId));
  unsubscribeLinks = onSnapshot(q, (snapshot) => {
    const links = [];
    snapshot.forEach((doc) => links.push(doc.data()));
    links.sort((a, b) => b.createdAt - a.createdAt);
    renderLinksTable(links);
  });
}

function renderLinksTable(links) {
  const tbody = document.getElementById("links-table-body");
  document.getElementById("links-count").textContent = links.length;

  if (links.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum link encurtado ainda.</td></tr>';
    return;
  }

  tbody.innerHTML = links.map(link => \`
    <tr>
      <td><strong>\${link.slug}</strong></td>
      <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        <a href="\${link.originalUrl}" target="_blank">\${link.originalUrl}</a>
      </td>
      <td>\${link.clicks || 0}</td>
      <td>\${new Date(link.createdAt).toLocaleDateString("pt-BR")}</td>
      <td>
        <button class="btn-action" onclick="copyLink('\${link.shortUrl}')">Copiar</button>
        <button class="btn-action" onclick="openEditModal('\${link.slug}', '\${link.originalUrl}')">Editar</button>
        <button class="btn-action delete" onclick="deleteLink('\${link.slug}')">Excluir</button>
      </td>
    </tr>
  \`).join("");
}

// UPDATE
window.openEditModal = (slug, originalUrl) => {
  document.getElementById("edit-link-id").value = slug;
  document.getElementById("edit-slug-display").value = slug;
  document.getElementById("edit-original-url").value = originalUrl;
  document.getElementById("edit-modal").classList.remove("hidden");
};

document.getElementById("btn-close-edit-modal").addEventListener("click", () => {
  document.getElementById("edit-modal").classList.add("hidden");
});
document.getElementById("btn-cancel-edit").addEventListener("click", () => {
  document.getElementById("edit-modal").classList.add("hidden");
});

document.getElementById("edit-link-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const slug = document.getElementById("edit-link-id").value;
  let newUrl = document.getElementById("edit-original-url").value.trim();
  if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://")) {
    newUrl = "https://" + newUrl;
  }

  try {
    await updateDoc(doc(db, "links", slug), {
      originalUrl: newUrl,
      updatedAt: Date.now()
    });
    document.getElementById("edit-modal").classList.add("hidden");
  } catch (err) {
    alert("Erro ao atualizar: " + err.message);
  }
});

// DELETE
window.deleteLink = async (slug) => {
  if (confirm("Deseja realmente excluir o link " + slug + "?")) {
    try {
      await deleteDoc(doc(db, "links", slug));
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    }
  }
};

// COPIAR LINK
window.copyLink = (shortUrl) => {
  navigator.clipboard.writeText(shortUrl);
  alert("Link copiado: " + shortUrl);
};

// Inicialização
if (!handleRedirection()) {
  initAuth();
}`,

    firebaseJson: `{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules"
  }
}`,

    rules: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /links/{linkId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if (request.auth != null && resource.data.userId == request.auth.uid) ||
                      (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['clicks', 'lastClickedAt']));
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(files[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F172A] text-[#38BDF8]">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Código dos Arquivos Solicitados
              </h3>
              <p className="text-xs text-slate-500">
                Arquivos gerados para deploy no Firebase Hosting com SDK Modular v9+
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#F8FAFC] px-6 py-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('app')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'app'
                  ? 'bg-[#0F172A] text-[#38BDF8] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>app.js (Firebase SDK)</span>
            </button>

            <button
              onClick={() => setActiveTab('index')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'index'
                  ? 'bg-[#0F172A] text-[#38BDF8] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>index.html</span>
            </button>

            <button
              onClick={() => setActiveTab('style')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'style'
                  ? 'bg-[#0F172A] text-[#38BDF8] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>style.css</span>
            </button>

            <button
              onClick={() => setActiveTab('firebaseJson')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'firebaseJson'
                  ? 'bg-[#0F172A] text-[#38BDF8] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>firebase.json</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'rules'
                  ? 'bg-[#0F172A] text-[#38BDF8] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>firestore.rules</span>
            </button>
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 rounded-xl bg-[#0F172A] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-slate-800 transition"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#38BDF8]" /> : <Copy className="h-3.5 w-3.5 text-[#38BDF8]" />}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>

        {/* Code View Area */}
        <div className="flex-1 overflow-auto bg-[#0F172A] p-5 text-xs font-mono text-slate-200">
          <pre className="whitespace-pre overflow-x-auto leading-relaxed">
            <code>{files[activeTab]}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-[#F8FAFC] px-6 py-3 text-xs text-slate-500">
          <span>Pronto para hospedar com <code className="font-mono text-[#0284C7] font-bold">firebase deploy --only hosting,firestore</code></span>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
