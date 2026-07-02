(function () {
  "use strict";

  const SATS = window.SATS || {};
  if (!SATS.core || !SATS.storage || !SATS.ui) return;

  const state = {
    euSearch: "",
    euFolderId: "",
    euTool: "folder",
    editingDocumentId: "",
    checklistFolderFilter: "",
    crewProfileId: "",
    crewFolderId: "",
    crewTab: "explore",
    crewRequesterEmail: "",
    folderDocumentFilter: "all",
    folderDocumentSearch: "",
    folderDocumentSort: "recent",
    editingFolderId: "",
    pendingMoveDocumentId: "",
    pendingMoveDocumentType: "",
    pendingRenameDocumentId: "",
    pendingRenameDocumentType: "",
    editingPlanId: "",
    checklistAutosaveTimer: null,
    checklistDirty: false,
    textAutosaveTimer: null,
    textDocumentDirty: false
  };

  const DEFAULT_WORKFLOW_FOLDER_ID = "default-folder";
  const TRASH_WORKFLOW_FOLDER_ID = "__eu-tecnico-trash__";
  const CREW_RECEIVED_FOLDER_NAME = "Recebidos de Companheiros de Tripulação";

  const CHECKLIST_GROUPS = [
    {
      id: "fisicos",
      title: "Grupo 1 - Riscos Físicos",
      items: [
        { id: "radiacao-solar", label: "Radiação não ionizante - Radiação Solar" },
        { id: "solda", label: "Radiação não ionizante - Solda", fields: ["Tipo de solda", "Frequência da atividade", "Tempo de exposição por jornada"] },
        { id: "radiacoes-ionizantes", label: "Radiações Ionizantes", fields: ["Fonte geradora", "Há blindagem adequada?", "Há Plano de Proteção Radiológica?"] },
        { id: "ruido", label: "Ruído Contínuo ou Intermitente", fields: ["Medição pontual com decibelímetro (dB)", "Fonte(s) de ruído", "Frequência de exposição", "Tempo de exposição por jornada", "Necessário solicitar dosimetria?"] },
        { id: "calor", label: "Calor - Trabalhos com exposição ao calor", fields: ["Fonte artificial de calor", "Tempo de exposição", "Colaborador permanece 60 min contínuos próximo à fonte?", "O ambiente possui ventilação?", "Existe possibilidade de sobrecarga térmica?", "Necessário solicitar quantificação de calor?"] },
        { id: "frio", label: "Frio", fields: ["Fonte artificial de frio", "Frequência de exposição", "Tempo de exposição", "Temperatura da fonte (°C)", "Existe rodízio de exposição entre colaboradores?"] },
        { id: "umidade", label: "Umidade", fields: ["Fonte de umidade", "Frequência de exposição", "O ambiente é semelhante a um ambiente alagado?", "É comum o colaborador ficar com as roupas molhadas ao exercer a atividade?"] },
        { id: "vci", label: "Vibração de Corpo Inteiro (VCI)", fields: ["Fonte de VCI", "Frequência de exposição", "Tempo de exposição", "Modelo/marca do veículo", "Circulação em piso alisado ou com trepidação?", "Necessário solicitar quantificação de VCI?"] },
        { id: "vmb", label: "Vibração Mão-Braço (VMB)", fields: ["Fonte de VMB", "Modelo/marca da ferramenta", "Frequência de exposição", "Tempo de exposição", "Necessário solicitar quantificação de VMB?"] }
      ]
    },
    {
      id: "quimicos",
      title: "Grupo 2 - Riscos Químicos",
      items: [
        { id: "domissanitarios", label: "Produtos Domissanitários", fields: ["Produtos utilizados", "Frequência de exposição", "Tempo de exposição"] },
        { id: "vapores-organicos", label: "Vapores Orgânicos", fields: ["Fonte geradora", "Forma de aplicação", "Aplicação em ambiente fechado?", "Há exaustão local?", "Frequência de exposição", "Tempo de exposição", "Empresa possui FDS dos produtos?"] },
        { id: "poeiras", label: "Poeiras", fields: ["Tipo de poeira", "Fonte geradora", "Detalhamento do processo", "Ambiente fechado?", "Frequência de exposição", "Tempo de exposição"] },
        { id: "fumos-metalicos", label: "Fumos Metálicos", fields: ["Tipo de metal base", "Empresa possui FDS do arame de solda?", "Fonte geradora", "Detalhamento do processo", "Ambiente fechado?", "Frequência de exposição", "Tempo de exposição"] }
      ]
    },
    {
      id: "biologicos",
      title: "Grupo 3 - Riscos Biológicos",
      items: [
        { id: "agentes-biologicos", label: "Agentes Biológicos Infecciosos e Infectocontagiosos" },
        { id: "lixo", label: "Coleta e industrialização de lixo" },
        { id: "exumacao", label: "Exumação de corpos / manipulação de resíduos de animais deteriorados" },
        { id: "animais-infectados", label: "Trabalhos com animais infectados" },
        { id: "saude", label: "Estabelecimentos de saúde - contato com pacientes/materiais contaminados" },
        { id: "esgoto", label: "Galerias, fossas e tanques de esgoto" },
        { id: "laboratorios", label: "Laboratórios de autópsia, anatomia e anátomo-histologia" }
      ]
    },
    {
      id: "acidentes",
      title: "Grupo 4 - Riscos de Acidentes",
      items: [
        { id: "superficies-aquecidas", label: "Exposição a superfícies e/ou materiais aquecidos" },
        { id: "cortantes", label: "Objetos cortantes e/ou perfurantes" },
        { id: "queda-mesmo-nivel", label: "Queda de mesmo nível" },
        { id: "animais-domesticos", label: "Animais domésticos" },
        { id: "animais-peconhentos", label: "Animais peçonhentos" },
        { id: "movimentacao-sem-demarcacao", label: "Áreas de movimentação de materiais sem demarcação" },
        { id: "violencia", label: "Atividades com exposição a roubos ou violência física" },
        { id: "inflamaveis", label: "Atividades e operações com inflamáveis" },
        { id: "atropelamento", label: "Risco de atropelamento" },
        { id: "empilhadeira", label: "Condução de empilhadeira" },
        { id: "transpaleteira", label: "Condução de transpaleteira" },
        { id: "veiculos-pequenos", label: "Condução de veículos de pequeno porte em vias públicas" },
        { id: "veiculos-grandes", label: "Condução de veículos de grande porte em vias públicas" },
        { id: "motocicleta", label: "Condução de motocicleta em vias públicas" },
        { id: "altura", label: "Trabalho em altura - diferença de nível > 2 metros" },
        { id: "diferenca-nivel", label: "Diferença de nível ≤ 2 metros" },
        { id: "espaco-confinado", label: "Espaço Confinado" },
        { id: "intemperies", label: "Intempéries" },
        { id: "maquinas-manutencao", label: "Máquinas/equipamentos necessitando manutenção ou adequações" },
        { id: "movimentacao-materiais", label: "Movimentação de materiais" },
        { id: "prensamento", label: "Risco de prensamento ou esmagamento" },
        { id: "projecao-particulas", label: "Projeção de partículas nos olhos" },
        { id: "queda-objetos", label: "Queda de objetos" },
        { id: "respingo-quimico", label: "Respingo de produto químico" }
      ]
    },
    {
      id: "ergonomicos",
      title: "Grupo 5 - Riscos Ergonômicos",
      items: [
        { id: "desconforto-ambiental", label: "Condições ambientais com temperatura, velocidade do ar e/ou umidade causando desconforto" },
        { id: "puxar-empurrar", label: "Frequente ação de puxar/empurrar cargas ou volumes" },
        { id: "repetitivos", label: "Frequente execução de movimentos repetitivos" },
        { id: "transporte-cargas", label: "Levantamento e transporte manual de cargas ou volumes" },
        { id: "pega-pobre", label: "Manuseio de cargas com pega pobre" },
        { id: "ajustes-ergonomicos", label: "Máquinas, equipamentos e/ou ferramentas necessitando ajustes ergonômicos" },
        { id: "mobiliario", label: "Mobiliários necessitando adequação" },
        { id: "postura-pe", label: "Postura de pé por longos períodos" },
        { id: "postura-estatica", label: "Postura estática por longos períodos" },
        { id: "postura-sentada", label: "Postura sentada por longos períodos" },
        { id: "posturas-extremas", label: "Posturas extremas" },
        { id: "posturas-incomodas", label: "Trabalho em posturas incômodas/pouco confortáveis por longos períodos" },
        { id: "noturno", label: "Trabalho noturno" }
      ]
    },
    {
      id: "levantamentos",
      title: "Levantamentos e Verificações Obrigatórias",
      yesNo: true,
      items: [
        { id: "epi", label: "EPI disponibilizados pela empresa" },
        { id: "ficha-epi", label: "Ficha de EPI preenchida e atualizada" },
        { id: "sinalizacao", label: "Sinalização de segurança/alertas na empresa" },
        { id: "ordem-servico", label: "Ordem de Serviço elaborada e assinada" },
        { id: "treinamentos", label: "Treinamentos com certificados" },
        { id: "cipa", label: "Designado de CIPA ou CIPA constituída" },
        { id: "brigada", label: "Brigada de Incêndio" },
        { id: "medicoes", label: "Necessidade de medições quantitativas constatadas" }
      ]
    }
  ];

  const PGR_CHECKLIST_TEMPLATE = {
    id: "pgr-risk-recognition",
    title: "Checklist PGR - Reconhecimento de Riscos",
    version: 1,
    groups: CHECKLIST_GROUPS
  };

  const escapeHtml = value => SATS.ui.escapeHtml ? SATS.ui.escapeHtml(value) : String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
  const escapeAttr = value => SATS.ui.escapeAttr ? SATS.ui.escapeAttr(value) : escapeHtml(value);
  const normalizeText = value => (SATS.core.normalizeText ? SATS.core.normalizeText(value) : String(value || "").toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  const createId = () => SATS.core.createId ? SATS.core.createId() : "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
  const currentUser = () => SATS.core.currentUser || null;
  const appState = () => SATS.core.app || null;
  const showToast = (message, type = "info") => SATS.ui.showToast ? SATS.ui.showToast(message, type) : console.info(message);
  const saveApp = (options = {}) => SATS.storage.saveApp ? SATS.storage.saveApp(options) : undefined;
  const recordActivity = (action, detail, context) => SATS.core.recordActivity ? SATS.core.recordActivity(action, detail, context) : undefined;
  const downloadBlob = (blob, fileName) => SATS.core.downloadBlob ? SATS.core.downloadBlob(blob, fileName) : fallbackDownload(blob, fileName);
  const sanitizeFileName = value => SATS.core.sanitizeFileName ? SATS.core.sanitizeFileName(value) : String(value || "documento").replace(/[\\/:*?"<>|]+/g, "-").trim();
  const askConfirm = message => SATS.ui.managementConfirm ? SATS.ui.managementConfirm(message) : Promise.resolve(false);

  function init() {
    ensureWorkflowDom();
    wireWorkflowListeners();
    observeScreens();
    window.requestAnimationFrame(enhanceVisibleScreens);
  }

  function ensureWorkflowDom() {
    if (!document.getElementById("menuProfileModal")) {
      const modal = document.createElement("div");
      modal.id = "menuProfileModal";
      modal.className = "modal hidden";
      modal.innerHTML = `
        <div class="modal-card menu-profile-modal-card">
          <div class="modal-head">
            <h2>Editar perfil</h2>
            <button class="icon-button" type="button" data-menu-profile-close aria-label="Fechar">×</button>
          </div>
          <form id="menuProfileForm" class="modal-form">
            <div class="menu-profile-edit-avatar" id="menuProfileAvatarPreview"></div>
            <label>Nome<input id="menuProfileNameInput" type="text" required></label>
            <label>Cargo/Função<input id="menuProfileRoleInput" type="text"></label>
            <label>Empresa/Consultoria<input id="menuProfileCompanyInput" type="text"></label>
            <label>E-mail<input id="menuProfileEmailInput" type="email" readonly></label>
            <label>Foto de perfil<input id="menuProfilePhotoInput" type="file" accept="image/*"></label>
            <div class="modal-actions">
              <button class="button ghost" type="button" data-menu-profile-close>Cancelar</button>
              <button class="button primary" type="submit">Salvar perfil</button>
            </div>
          </form>
        </div>`;
      document.body.appendChild(modal);
    }
    if (!document.getElementById("checklistPageScreen")) {
      const screen = document.createElement("main");
      screen.id = "checklistPageScreen";
      screen.className = "screen checklist-page-screen hidden";
      document.body.appendChild(screen);
    }
  }

  function wireWorkflowListeners() {
    if (window.__satsMenuWorkflowWired) return;
    window.__satsMenuWorkflowWired = true;
    document.addEventListener("click", handleGlobalWorkflowClick, true);
    document.addEventListener("input", handleGlobalWorkflowInput, true);
    document.addEventListener("change", handleGlobalWorkflowChange, true);
    const form = document.getElementById("menuProfileForm");
    if (form) form.addEventListener("submit", saveMenuProfile);
    const photo = document.getElementById("menuProfilePhotoInput");
    if (photo) photo.addEventListener("change", handleMenuProfilePhoto);
  }

  function observeScreens() {
    const observer = new MutationObserver(enhanceVisibleScreens);
    ["appSelectorScreen", "euTecnicoScreen", "crewScreen", "editorScreen", "globalAppHeader", "satsLoadingScreen"].forEach(id => {
      const node = document.getElementById(id);
      if (node) observer.observe(node, { attributes: true, childList: true, subtree: false });
    });
  }

  function enhanceVisibleScreens() {
    enhanceHeaderLogo();
    enhanceGlobalUserChip();
    enhanceLoadingAvatar();
    enhancePlanActionReturnButton();
    renderMenuFooter();
    const eu = document.getElementById("euTecnicoScreen");
    if (eu && !eu.classList.contains("hidden")) maybeRenderEuTecnicoWorkflow(eu);
    const crew = document.getElementById("crewScreen");
    if (crew && !crew.classList.contains("hidden") && !crew.querySelector(".crew-workflow-root")) renderCrewWorkflow();
  }

  function maybeRenderEuTecnicoWorkflow(screen = document.getElementById("euTecnicoScreen")) {
    if (!screen) return;
    const root = screen.querySelector(".eu-workflow-root");
    const key = getEuTecnicoRenderKey();
    if (!root || root.dataset.renderKey !== key) renderEuTecnicoWorkflow(key);
  }

  function getEuTecnicoRenderKey() {
    const app = appState();
    const user = currentUser();
    const profileDigest = (app?.profiles || []).map(profile => [
      profile.id,
      profile.name,
      profile.email,
      (profile.folders || []).length,
      (profile.planFolders || []).length,
      (profile.plans || []).length,
      (profile.documents || []).length
    ].join(":")).join("|");
    return [
      user?.email || "",
      app?.activeProfileId || "",
      app?.activeFolderId || "",
      state.euFolderId || "",
      state.euTool || "",
      state.euSearch || "",
      profileDigest
    ].join("::");
  }

  function getLogoSrc() {
    const brandingLogo = appState()?.systemSettings?.branding?.logoDataUrl || "";
    if (/^data:image\//.test(brandingLogo)) return brandingLogo;
    const favicon = document.getElementById("satsFavicon");
    if (favicon?.href) return favicon.href;
    const brandIcon = document.querySelector("[data-sts-brand-icon]");
    if (brandIcon?.src) return brandIcon.src;
    const authLogo = document.querySelector(".auth-logo");
    if (authLogo?.src) return authLogo.src;
    return "";
  }

  function enhanceHeaderLogo() {
    const mark = document.querySelector(".global-header-brand-mark");
    if (!mark) return;
    const logo = getLogoSrc();
    if (logo && mark.dataset.logoApplied !== logo) {
      mark.dataset.logoApplied = logo;
      mark.innerHTML = `<img src="${escapeAttr(logo)}" alt="STS">`;
    }
  }

  function enhanceGlobalUserChip() {
    const chip = document.getElementById("globalUserLabel");
    if (!chip || chip.dataset.profileToggleReady === "true") return;
    chip.dataset.profileToggleReady = "true";
    chip.setAttribute("data-menu-profile-toggle", "true");
    chip.setAttribute("role", "button");
    chip.setAttribute("tabindex", "0");
    chip.classList.add("is-clickable");
    const parent = chip.parentElement;
    if (parent && !parent.querySelector("[data-global-profile-popover]")) {
      const popover = document.createElement("div");
      popover.className = "menu-user-popover global-user-popover hidden";
      popover.setAttribute("data-global-profile-popover", "true");
      popover.innerHTML = `
        <div class="menu-user-popover-title">Perfil</div>
        <button type="button" data-menu-profile-action="edit">Editar perfil</button>
        <button type="button" data-menu-profile-action="photo">Alterar foto</button>
        <button type="button" data-menu-profile-action="settings">Configurações</button>
        <button type="button" data-menu-profile-action="logout">Sair</button>`;
      parent.appendChild(popover);
    }
  }

  function enhanceLoadingAvatar() {
    const avatar = document.getElementById("satsLoadingAvatar");
    if (!avatar) return;
    const user = currentUser();
    SATS.core.updatePostLoginLoadingAvatar?.(user);
    avatar.classList.add("is-circular");
    if (avatar.classList.contains("has-photo") && avatar.querySelector("img")) return;
    const profile = getOwnProfile(false) || resolveCurrentUserLegacyProfile()?.profile || SATS.core.findProfileByUser?.(user);
    const cachedAvatar = getCachedLoadingAvatar(user);
    const storedAvatar = getStoredLoadingAvatar(user);
    const avatarPhoto = profile?.avatarPhoto || cachedAvatar?.avatarPhoto || storedAvatar?.avatarPhoto || "";
    avatar.classList.toggle("has-photo", !!avatarPhoto);
    if (avatarPhoto) {
      avatar.innerHTML = `<img src="${escapeAttr(avatarPhoto)}" alt="">`;
      return;
    }
    const seed = profile?.name || cachedAvatar?.name || storedAvatar?.name || user?.email || "STS";
    avatar.textContent = seed.trim().split("@")[0].replace(/[._-]+/g, " ").split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "ST";
  }

  function getCachedLoadingAvatar(user = currentUser()) {
    const email = normalizeEmail(user?.email || "");
    const id = String(user?.id || "");
    const key = email || id ? `sats.profileAvatarCache.v1.${email || id}` : "";
    if (!key) return null;
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "null");
      return parsed && parsed.avatarPhoto ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function cacheLoadingAvatar(user = currentUser(), profile = null) {
    const email = normalizeEmail(user?.email || "");
    const id = String(user?.id || "");
    const key = email || id ? `sats.profileAvatarCache.v1.${email || id}` : "";
    if (!key || !profile?.avatarPhoto) return;
    try {
      localStorage.setItem(key, JSON.stringify({
        avatarPhoto: profile.avatarPhoto,
        name: profile.name || profile.email || user?.email || "",
        updatedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.warn("Nao foi possivel guardar a foto do perfil para o loading:", error);
    }
  }

  function getStoredLoadingAvatar(user = currentUser()) {
    const email = normalizeEmail(user?.email || "");
    const userId = String(user?.id || "");
    const keys = ["planoDeAcaoSST.shared.v1", "planoDeAcaoSST.v2"];
    for (const key of keys) {
      let data = null;
      try {
        data = JSON.parse(localStorage.getItem(key) || "null");
      } catch (error) {
        data = null;
      }
      const profiles = Array.isArray(data?.profiles) ? data.profiles.filter(profile => profile?.avatarPhoto) : [];
      if (!profiles.length) continue;
      const direct = profiles.find(profile => profile.userId && userId && String(profile.userId) === userId)
        || profiles.find(profile => email && normalizeEmail(profile.email || "") === email);
      const found = direct || null;
      if (found) return {
        avatarPhoto: found.avatarPhoto,
        name: found.name || found.email || user?.email || ""
      };
    }
    return null;
  }

  function renderMenuFooter() {
    const selector = document.getElementById("appSelectorScreen");
    if (!selector || selector.classList.contains("hidden") || !currentUser()) return;
    const shell = selector.querySelector(".app-selector-shell") || selector;
    let footer = document.getElementById("menuUserFooter");
    if (!footer) {
      footer = document.createElement("footer");
      footer.id = "menuUserFooter";
      footer.className = "menu-user-footer";
      shell.appendChild(footer);
    } else if (footer.parentElement !== shell) {
      shell.appendChild(footer);
    }
    const profile = getOwnProfile(false);
    const name = profile?.name || currentUser()?.email?.split("@")[0] || "Usuário";
    const email = currentUser()?.email || profile?.email || "";
    footer.innerHTML = `
      <button class="menu-user-card" type="button" data-menu-profile-toggle>
        ${avatarMarkup(profile, "menu-user-avatar")}
        <span><strong>${escapeHtml(name)}</strong><small>${escapeHtml(email)}</small></span>
        <span class="menu-user-chevron">▾</span>
      </button>
      <div class="menu-user-popover hidden" id="menuUserPopover">
        <div class="menu-user-popover-title">Perfil</div>
        <button type="button" data-menu-profile-action="edit">Editar perfil</button>
        <button type="button" data-menu-profile-action="photo">Alterar foto</button>
        <button type="button" data-menu-profile-action="settings">Configurações</button>
        <button type="button" data-menu-profile-action="logout">Sair</button>
      </div>`;
  }

  function avatarMarkup(profile, className = "workflow-avatar") {
    if (profile?.avatarPhoto) return `<span class="${className}"><img src="${escapeAttr(profile.avatarPhoto)}" alt=""></span>`;
    const seed = profile?.name || currentUser()?.email || "STS";
    const initials = seed.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "ST";
    const color = profile?.avatarColor || "#2563eb";
    return `<span class="${className}" style="background:${escapeAttr(color)}">${escapeHtml(initials)}</span>`;
  }

  function getUserNameCandidates(user = currentUser()) {
    const localPart = user?.email ? String(user.email).split("@")[0] : "";
    const localWords = localPart.replace(/[._-]+/g, " ").trim();
    return Array.from(new Set([
      user?.name,
      user?.displayName,
      user?.user_metadata?.name,
      user?.user_metadata?.full_name,
      localPart,
      localWords,
      localWords.split(/\s+/)[0] || ""
    ].map(normalizeText).filter(Boolean)));
  }

  function looseNameMatches(value, candidates = []) {
    const name = normalizeText(value || "");
    if (!name) return false;
    return candidates.some(candidate => {
      if (!candidate || candidate.length < 3) return false;
      return name === candidate
        || name.startsWith(candidate)
        || candidate.startsWith(name)
        || name.includes(candidate)
        || candidate.includes(name);
    });
  }

  function profileNameMatchesUser(profile, user = currentUser()) {
    return looseNameMatches(profile?.name || "", getUserNameCandidates(user));
  }

  function profileMatchScore(profile, user = currentUser()) {
    if (!profile || !user || profile.hidden) return -1;
    const email = normalizeEmail(user.email || "");
    const profileEmail = normalizeEmail(profile.email || "");
    const hasData = profileHasEuTecnicoData(profile);
    let score = -1;
    if (profile.userId && user.id && String(profile.userId) === String(user.id)) score = hasData ? 120 : 40;
    if (profileEmail && email && profileEmail === email) score = Math.max(score, hasData ? 115 : 35);
    if (normalizeText(profile.name || "") === "usuario") score -= hasData ? 80 : 30;
    return score;
  }

  function getOwnProfile(createIfMissing = false) {
    const app = appState();
    const user = currentUser();
    if (!app || !user) return null;
    const resolved = resolveCurrentUserLegacyProfile();
    if (resolved.found && resolved.profile) {
      const profile = resolved.profile;
      profile.documents = Array.isArray(profile.documents) ? profile.documents : [];
      profile.folders = getFoldersFromProfile(profile);
      normalizeTechnicianFoldersOwnership(profile);
      return profile;
    }
    let profile = null;
    if (!profile && createIfMissing) {
      showToast("Perfil do usuario nao encontrado com seguranca. Abra a Recuperacao STS ou crie um perfil vazio pela tela de conflito.", "warning");
      recordActivity("Tentativa bloqueada de associar perfil errado", "Menu workflow bloqueou criacao automatica de perfil sem vinculo seguro.");
      return null;
    }
    if (profile) {
      profile.documents = Array.isArray(profile.documents) ? profile.documents : [];
      profile.folders = Array.isArray(profile.folders) ? profile.folders : [createDefaultWorkflowFolder(profile.email || user.email || "")];
      if (!profile.folders.length) profile.folders = [createDefaultWorkflowFolder(profile.email || user.email || "")];
      normalizeTechnicianFoldersOwnership(profile);
    }
    return profile;
  }

  function profileHasWorkflowData(profile) {
    if (!profile) return false;
    return !!profile.avatarPhoto
      || (profile.folders || []).some(folder => !folder.isDefault)
      || (profile.plans || []).some(plan => !plan.deleted)
      || (profile.documents || []).length > 0;
  }

  function profileHasEuTecnicoData(profile) {
    if (!profile) return false;
    return (profile.folders || []).some(folder => !folder.isDefault)
      || (profile.plans || []).some(plan => !plan.deleted)
      || (profile.planFolders || []).length > 0
      || (profile.documents || []).length > 0;
  }

  function createDefaultWorkflowFolder(email) {
    return { id: DEFAULT_WORKFLOW_FOLDER_ID, name: "Sem pasta", color: "#64748b", isDefault: true, hidden: false, createdBy: normalizeEmail(email), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }

  function createTrashWorkflowFolder() {
    return { id: TRASH_WORKFLOW_FOLDER_ID, name: "Lixeira", color: "#94a3b8", isTrash: true, hidden: false };
  }

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function isFolderOwnedByCurrentUser(folder, user = currentUser(), profile = null) {
    if (!folder || !user) return false;
    const currentEmail = normalizeEmail(user.email || "");
    const profileOwned = isProfileOwnedByCurrentUser(profile, user);
    const currentProfileId = String(profileOwned ? profile?.id || user.profileId || "" : user.profileId || "");
    const currentProfileName = normalizeText(profileOwned ? profile?.name || user.name || user.displayName || user.user_metadata?.name || user.email?.split("@")[0] || "" : user.name || user.displayName || user.user_metadata?.name || user.email?.split("@")[0] || "");
    const folderOwnerEmail = normalizeEmail(folder.createdBy || folder.ownerEmail || folder.userEmail || "");
    const folderProfileId = String(folder.profileId || folder.ownerProfileId || folder.profile?.id || "");
    const folderOwnerName = normalizeText(folder.ownerName || folder.profileName || folder.createdByName || "");
    if (folderOwnerEmail && currentEmail && folderOwnerEmail === currentEmail) return true;
    if (profileOwned && folderProfileId && currentProfileId && folderProfileId === currentProfileId) return true;
    if (profileOwned && folderOwnerName && currentProfileName && folderOwnerName === currentProfileName) return true;
    return profileOwned && !folderOwnerEmail && !folderProfileId && !folderOwnerName;
  }

  function isProfileOwnedByCurrentUser(profile, user = currentUser()) {
    if (!profile || !user) return false;
    const currentEmail = normalizeEmail(user.email || "");
    const profileEmails = [profile.email, profile.userEmail, profile.ownerEmail, profile.createdBy].map(normalizeEmail).filter(Boolean);
    if (profile.userId && user.id && String(profile.userId) === String(user.id)) return true;
    if (currentEmail && profileEmails.includes(currentEmail)) return true;
    return false;
  }

  function isDocumentOwnedByCurrentUser(document, user = currentUser(), profile = null) {
    if (!document || !user) return false;
    const ownerEmail = normalizeEmail(document.createdBy || document.ownerEmail || document.userEmail || "");
    const profileId = String(document.profileId || document.ownerProfileId || "");
    const currentEmail = normalizeEmail(user.email || "");
    const profileOwned = isProfileOwnedByCurrentUser(profile, user);
    if (ownerEmail && currentEmail && ownerEmail === currentEmail) return true;
    if (profileOwned && profileId && profile?.id && profileId === String(profile.id)) return true;
    return profileOwned && !ownerEmail && !profileId;
  }

  function profileHasLegacyPlanActionData(profile) {
    if (!profile || profile.hidden) return false;
    return (profile.folders || []).some(folder => !folder.isDefault && String(folder.id || "") !== DEFAULT_WORKFLOW_FOLDER_ID)
      || (profile.planFolders || []).length > 0
      || (profile.plans || []).length > 0
      || (profile.documents || []).length > 0;
  }

  function getActiveLegacyProfileForEuTecnico() {
    const app = appState();
    const user = currentUser();
    const email = normalizeEmail(user?.email || "");
    const profiles = (app?.profiles || []).filter(profile => !profile.hidden);
    if (!app || !user || !profiles.length) {
      return { found: false, profile: null, profileId: "", source: "", reason: "Nenhum perfil antigo disponível." };
    }

    const activeIds = [
      app.activeProfileId,
      app.selectedProfileId,
      app.currentProfileId,
      app.profileId,
      user.profileId
    ].filter(Boolean).map(String);

    for (const activeId of activeIds) {
      const selected = profiles.find(profile => profile.id && String(profile.id) === activeId);
      if (selected && isProfileOwnedByCurrentUser(selected, user)) {
        return { found: true, profile: selected, profileId: selected.id, source: activeId === String(app.activeProfileId || "") ? "app.activeProfileId" : "selectedProfileId" };
      }
    }

    const selected = profiles.find(profile => profile.id && profile.id === app.activeProfileId);

    const byEmailProfiles = profiles.filter(profile => normalizeEmail(profile.email || "") === email);
    const byEmailWithData = byEmailProfiles.find(profile => profileHasEuTecnicoData(profile));
    if (byEmailWithData) return { found: true, profile: byEmailWithData, profileId: byEmailWithData.id, source: "email" };

    const byOwnerEmailProfiles = profiles.filter(profile => {
      const profileEmail = normalizeEmail(profile.email || profile.userEmail || profile.ownerEmail || profile.createdBy || "");
      const profileUserId = String(profile.userId || "");
      if (profileUserId && user?.id && profileUserId !== String(user.id)) return false;
      if (profileEmail && profileEmail !== email) return false;
      const values = [
        profile.userEmail,
        profile.ownerEmail,
        profile.createdBy,
        ...(profile.folders || []).flatMap(folder => [folder.createdBy, folder.ownerEmail, folder.userEmail]),
        ...(profile.plans || []).flatMap(plan => [plan.createdBy, plan.ownerEmail, plan.userEmail]),
        ...(profile.documents || []).flatMap(doc => [doc.createdBy, doc.ownerEmail, doc.userEmail])
      ];
      return values.some(value => normalizeEmail(value || "") === email);
    });
    const byOwnerEmailWithData = byOwnerEmailProfiles.find(profile => profileHasEuTecnicoData(profile));
    if (byOwnerEmailWithData) return { found: true, profile: byOwnerEmailWithData, profileId: byOwnerEmailWithData.id, source: "ownerEmail" };

    const byEmail = byEmailProfiles[0];
    if (byEmail) return { found: true, profile: byEmail, profileId: byEmail.id, source: "emailEmpty" };

    const byOwnerEmail = byOwnerEmailProfiles[0];
    if (byOwnerEmail) return { found: true, profile: byOwnerEmail, profileId: byOwnerEmail.id, source: "ownerEmailEmpty" };

    if (selected && isProfileOwnedByCurrentUser(selected, user)) {
      return { found: true, profile: selected, profileId: selected.id, source: "activeProfileVerified" };
    }

    return { found: false, profile: null, profileId: "", source: "", reason: "Nenhum perfil antigo vinculado ao usuário logado." };
  }

  function resolveCurrentUserLegacyProfile() {
    return getActiveLegacyProfileForEuTecnico();
  }

  function getFoldersFromProfile(profile, options = {}) {
    if (!profile) return [];
    const includeDefault = options.includeDefault !== false;
    const folders = [];
    const seen = new Set();
    const pushFolder = folder => {
      if (!folder) return;
      const id = String(folder.id || folder.folderId || createId());
      if (seen.has(id)) return;
      seen.add(id);
      folder.id = id;
      folder.name = folder.name || folder.title || (id === "default-folder" ? "Sem pasta" : "Nova pasta");
      folders.push(folder);
    };
    (Array.isArray(profile.folders) ? profile.folders : []).forEach(pushFolder);
    (Array.isArray(profile.planFolders) ? profile.planFolders : []).forEach(pushFolder);
    if (includeDefault && !seen.has(DEFAULT_WORKFLOW_FOLDER_ID)) {
      const defaultFolder = createDefaultWorkflowFolder(profile.email || currentUser()?.email || "");
      seen.add(DEFAULT_WORKFLOW_FOLDER_ID);
      folders.unshift(defaultFolder);
    }
    return folders;
  }

  function normalizeFolderOwnership(folder, profile, user = currentUser()) {
    if (!folder || !profile || !user) return false;
    let changed = false;
    const email = normalizeEmail(user.email || profile.email || "");
    if (!folder.createdBy && email) { folder.createdBy = email; changed = true; }
    if (!folder.ownerEmail && email) { folder.ownerEmail = email; changed = true; }
    if (!folder.userEmail && email) { folder.userEmail = email; changed = true; }
    if (!folder.ownerProfileId && profile.id) { folder.ownerProfileId = profile.id; changed = true; }
    if (!folder.profileId && profile.id) { folder.profileId = profile.id; changed = true; }
    if (!folder.ownerName && profile.name) { folder.ownerName = profile.name; changed = true; }
    if (!folder.profileName && profile.name) { folder.profileName = profile.name; changed = true; }
    return changed;
  }

  function mergeUniqueFolders(folders) {
    const seen = new Set();
    return folders.filter(folder => {
      const key = String(folder?.id || folder?.folderId || normalizeText(folder?.name || ""));
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function getAllTechnicalFolders() {
    const app = appState();
    return (app?.profiles || []).flatMap(profile => getFoldersFromProfile(profile, { includeDefault: false }));
  }

  function folderIdForPlan(plan) {
    return String(plan?.folderId || DEFAULT_WORKFLOW_FOLDER_ID);
  }

  function isDefaultWorkflowFolder(folderId) {
    return !folderId || String(folderId) === DEFAULT_WORKFLOW_FOLDER_ID || String(folderId) === "default";
  }

  function planBelongsToFolder(plan, folder) {
    if (!plan || !folder) return false;
    if (folder.isTrash) return plan.deleted === true;
    const planFolderId = folderIdForPlan(plan);
    const folderId = String(folder.id || DEFAULT_WORKFLOW_FOLDER_ID);
    if (isDefaultWorkflowFolder(folderId)) return isDefaultWorkflowFolder(planFolderId);
    return planFolderId === folderId;
  }

  function documentBelongsToFolder(document, folder) {
    if (!document || !folder || folder.isTrash) return false;
    const documentFolderId = String(document.folderId || DEFAULT_WORKFLOW_FOLDER_ID);
    const folderId = String(folder.id || DEFAULT_WORKFLOW_FOLDER_ID);
    if (isDefaultWorkflowFolder(folderId)) return isDefaultWorkflowFolder(documentFolderId);
    return documentFolderId === folderId;
  }

  function getTrashPlansForProfile(profile) {
    return (profile?.plans || []).filter(plan => plan.deleted === true);
  }

  function getEuTecnicoFolders() {
    return getTechnicianFoldersForCurrentUser().folders;
  }

  function getTechnicianFoldersForCurrentUser() {
    const user = currentUser();
    const resolved = getActiveLegacyProfileForEuTecnico();
    const profile = resolved.profile;
    const legacyFolders = profile ? getFoldersFromProfile(profile) : [];
    const userFolders = [];
    let changed = false;
    const visibleFolders = mergeUniqueFolders(legacyFolders)
      .filter(folder => !folder.hidden)
      .map(folder => {
        if (profile && legacyFolders.some(item => item.id === folder.id)) {
          changed = normalizeFolderOwnership(folder, profile, user) || changed;
        }
        return folder;
      })
      .sort((a, b) => (a.isDefault ? -1 : b.isDefault ? 1 : String(a.name).localeCompare(String(b.name), "pt-BR")));
    if (profile) visibleFolders.push(createTrashWorkflowFolder());
    if (changed && profile?.id) saveApp({ profileId: profile.id });

    logTechnicianResolutionDebug(resolved, legacyFolders, userFolders, visibleFolders);
    return { resolved, profile, folders: visibleFolders };
  }

  function getEuTecnicoWriteProfile() {
    const resolved = getActiveLegacyProfileForEuTecnico();
    const profile = resolved.profile;
    if (!resolved.found || !profile) return null;
    profile.folders = getFoldersFromProfile(profile).filter(folder => !folder.isTrash);
    profile.plans = Array.isArray(profile.plans) ? profile.plans : [];
    profile.documents = Array.isArray(profile.documents) ? profile.documents : [];
    normalizeTechnicianFoldersOwnership(profile);
    return profile;
  }

  function logTechnicianResolutionDebug(resolved, legacyFolders, userFolders, visibleFolders) {
    const app = appState();
    const user = currentUser();
    console.log("[Eu Técnico] currentUser:", user);
    console.log("[Eu Técnico] selectedProfileId:", app?.selectedProfileId || null);
    console.log("[Eu Técnico] currentProfile:", resolved?.profile || null);
    console.log("[Eu Técnico] app.activeProfileId:", app?.activeProfileId || null);
    console.log("[Eu Técnico] profiles:", (app?.profiles || []).map(profile => ({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      folders: profile.folders?.length || 0,
      plans: profile.plans?.length || 0
    })));
    console.log("[Eu Técnico] perfil usado:", resolved);
    console.log("[Eu Técnico] pastas carregadas:", visibleFolders);
    console.log("[Eu Técnico] Usuário logado:", user?.email || "");
    console.log("[Eu Técnico] Perfil legado resolvido:", resolved);
    console.log("[Eu Técnico] Pastas do perfil legado:", legacyFolders.length);
    console.log("[Eu Técnico] Pastas novas do usuário:", userFolders.length);
    console.log("[Eu Técnico] Pastas visíveis finais:", visibleFolders.length);
    console.log("[Eu Técnico] Nomes das pastas visíveis:", visibleFolders.map(folder => folder.name || folder.title));
  }

  function ensureFolderOwnership(profile) {
    return normalizeTechnicianFoldersOwnership(profile);
  }

  function normalizeTechnicianFoldersOwnership(profile) {
    const ownerEmail = normalizeEmail(profile.email || currentUser()?.email || "");
    const user = currentUser();
    if (!profile || !ownerEmail || !user) return;
    const profileBelongsToUser = isProfileOwnedByCurrentUser(profile, user);
    if (!profileBelongsToUser) return;
    let changed = false;
    if (!profile.userId && user.id) {
      profile.userId = user.id;
      changed = true;
    }
    (profile.folders || []).forEach(folder => {
      if (!isFolderOwnedByCurrentUser(folder, user, profile)) return;
      if (!folder.createdBy && ownerEmail) { folder.createdBy = ownerEmail; changed = true; }
      if (!folder.ownerEmail && ownerEmail) { folder.ownerEmail = ownerEmail; changed = true; }
      if (!folder.userEmail && ownerEmail) { folder.userEmail = ownerEmail; changed = true; }
      if (!folder.profileId && profile.id) { folder.profileId = profile.id; changed = true; }
      if (!folder.ownerProfileId && profile.id) { folder.ownerProfileId = profile.id; changed = true; }
      if (!folder.ownerName && profile.name) { folder.ownerName = profile.name; changed = true; }
      if (!folder.profileName && profile.name) { folder.profileName = profile.name; changed = true; }
      folder.updatedAt = folder.updatedAt || new Date().toISOString();
    });
    (profile.plans || []).forEach(plan => {
      if (!isDocumentOwnedByCurrentUser(plan, user, profile)) return;
      if (!plan.createdBy && ownerEmail) { plan.createdBy = ownerEmail; changed = true; }
      if (!plan.profileId && profile.id) { plan.profileId = profile.id; changed = true; }
    });
    (profile.documents || []).forEach(document => {
      if (!isDocumentOwnedByCurrentUser(document, user, profile)) return;
      if (!document.createdBy && ownerEmail) { document.createdBy = ownerEmail; changed = true; }
      if (!document.profileId && profile.id) { document.profileId = profile.id; changed = true; }
    });
    if (changed) saveApp({ profileId: profile.id });
  }

  function getOwnedFolders(profile = null) {
    const result = getTechnicianFoldersForCurrentUser();
    if (result.profile && profile && result.profile.id !== profile.id) return [];
    return result.folders;
  }

  function logEuTecnicoFolderDebug(allFolders, visibleFolders) {
    const enabled = window.SATS_EU_TECNICO_DEBUG === true || /[?&]debugEuTecnico=1\b/.test(window.location.search);
    if (!enabled) return;
    const app = appState();
    const user = currentUser();
    console.log("[Eu Técnico] Usuário atual:", user?.email || "");
    console.log("[Eu Técnico] Total de pastas globais:", allFolders.length);
    console.log("[Eu Técnico] Pastas visíveis para o usuário:", visibleFolders.length);
    console.table((app?.profiles || []).map(profile => ({
      id: profile.id,
      nome: profile.name,
      email: profile.email,
      userId: profile.userId,
      pastas: (profile.folders || []).length,
      pastasReais: (profile.folders || []).filter(folder => !folder.isDefault).length,
      planos: (profile.plans || []).filter(plan => !plan.deleted).length,
      dadosEuTecnico: profileHasEuTecnicoData(profile),
      bateComUsuario: isProfileOwnedByCurrentUser(profile, user),
      pontuacao: profileMatchScore(profile, user)
    })));
  }

  function getSelectedFolder(profile = null, foldersArg = null) {
    const folders = Array.isArray(foldersArg) ? foldersArg : getOwnedFolders(profile);
    if (!folders.some(folder => folder.id === state.euFolderId)) state.euFolderId = folders[0]?.id || "";
    return folders.find(folder => folder.id === state.euFolderId) || null;
  }

  function folderDisplayName(profile, folder) {
    if (!folder) return "";
    if (folder.isDefault) return folder.name || "Sem pasta";
    return folder.name || "Sem pasta";
  }

  function renderEuTecnicoWorkflow(renderKey = getEuTecnicoRenderKey()) {
    const screen = document.getElementById("euTecnicoScreen");
    if (!screen) return;
    const folderContext = getTechnicianFoldersForCurrentUser();
    const profile = folderContext.profile;
    const folders = folderContext.folders;
    const folder = getSelectedFolder(profile, folders);
    const query = normalizeText(state.euSearch);
    const filteredFolders = query ? folders.filter(item => normalizeText(`${item.name} ${profile?.company || ""}`).includes(query)) : folders;
    screen.innerHTML = `
      <section class="eu-workflow-root" data-render-key="${escapeAttr(renderKey)}">
        <aside class="eu-workflow-sidebar">
          <button type="button" class="${state.euTool === "folder" ? "is-active" : ""}" data-eu-wf="folder">${icon("folder")}<span>Minhas Pastas</span></button>
          <button type="button" class="${state.euTool === "planForm" ? "is-active" : ""}" data-eu-wf="new-plan">${icon("clipboard")}<span>Criar Plano de Ação</span></button>
          <button type="button" class="${state.euTool === "textForm" ? "is-active" : ""}" data-eu-wf="new-text">${icon("text")}<span>Criar documento de texto</span></button>
          <button type="button" class="${state.euTool === "checklist" ? "is-active" : ""}" data-eu-wf="checklist">${icon("checklist")}<span>Checklist</span></button>
          <div class="eu-workflow-sidebar-spacer"></div>
        </aside>
        <main class="eu-workflow-main">
          <header class="eu-workflow-header">
            <div>
              <p class="section-kicker">Eu Técnico</p>
              <h1>Suas pastas e documentos</h1>
              <p>Somente pastas vinculadas ao usuário logado aparecem aqui.</p>
            </div>
            <div class="eu-workflow-actions">
              <button class="button primary" type="button" data-eu-wf="folder-form">Criar pasta</button>
              <label class="eu-workflow-search">${icon("search")}<input id="euWorkflowSearch" type="search" value="${escapeAttr(state.euSearch)}" placeholder="Pesquisar pasta..."></label>
            </div>
          </header>
          <section class="eu-workflow-layout">
            <aside class="eu-workflow-folders">
              <div class="eu-workflow-panel-head"><strong>Pastas</strong><span>${filteredFolders.length}</span></div>
              ${filteredFolders.length ? filteredFolders.map(item => `
                <button type="button" class="eu-workflow-folder ${item.id === folder?.id ? "is-active" : ""}" data-eu-folder="${escapeAttr(item.id)}">
                  <span class="folder-dot" style="background:${escapeAttr(item.color || "#2563eb")}"></span>
                  <span><strong>${escapeHtml(folderDisplayName(profile, item))}</strong><small>${getFolderDocumentCount(profile, item.id)} item(ns)</small></span>
                </button>`).join("") : `<div class="empty-state">Você ainda não criou nenhuma pasta.<br>Clique em Criar pasta para começar.</div>`}
            </aside>
            <section class="eu-workflow-content">
              ${renderEuWorkflowContent(profile, folder)}
            </section>
          </section>
        </main>
      </section>`;
  }

  function getFolderDocumentCount(profile, folderId) {
    const folder = folderId === TRASH_WORKFLOW_FOLDER_ID
      ? createTrashWorkflowFolder()
      : { id: folderId };
    const plans = (profile?.plans || []).filter(plan => planBelongsToFolder(plan, folder)).length;
    const docs = folder.isTrash ? 0 : (profile?.documents || []).filter(doc => documentBelongsToFolder(doc, folder)).length;
    return plans + docs;
  }

  function renderEuWorkflowContent(profile, folder) {
    if (state.euTool === "folderForm") return renderFolderForm();
    if (!profile) {
      return `
        <div class="empty-state">
          Não foi possível vincular automaticamente um perfil antigo ao usuário logado.
          <br>Abra com <strong>debugEuTecnico=1</strong> para conferir os perfis encontrados.
        </div>`;
    }
    if (!folder) {
      if (state.euTool === "planForm" || state.euTool === "textForm") {
        return `<div class="empty-state">Crie uma pasta antes de adicionar documentos.</div>`;
      }
      return `<div class="empty-state">Crie uma pasta para começar.</div>`;
    }
    if (state.euTool === "planForm") return renderPlanForm(profile, folder);
    if (state.euTool === "textForm") return renderTextDocumentForm(profile, folder);
    if (state.euTool === "checklist") return renderChecklistHome(profile, folder);
    if (state.euTool === "checklistForm") return renderChecklistHome(profile, folder);
    return renderFolderWorkspace(profile, folder);
  }

  function renderChecklistPlaceholder() {
    return `
      <section class="eu-phase-placeholder">
        <p class="section-kicker">Checklist</p>
        <h2>Em desenvolvimento</h2>
        <p>O checklist interativo serÃ¡ ativado na prÃ³xima fase. Nesta etapa, a base do Eu TÃ©cnico fica concentrada em pastas, planos e documentos de texto.</p>
        <button class="button" type="button" data-eu-wf="folder">Voltar para Minhas Pastas</button>
      </section>`;
  }

  function renderChecklistHome(profile, folder) {
    const folders = getOwnedFolders(profile).filter(item => !item.isTrash);
    const selectedFilter = state.checklistFolderFilter || "";
    const checklists = (profile.documents || [])
      .filter(doc => doc.type === "checklist" && !doc.deleted)
      .filter(doc => !selectedFilter || (doc.folderId || DEFAULT_WORKFLOW_FOLDER_ID) === selectedFilter)
      .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
    return `
      <section class="pgr-checklist-shell">
        <header class="pgr-checklist-header">
          <div>
            <p class="section-kicker">Checklist</p>
            <h2>Checklist PGR</h2>
            <p>Reconhecimento de riscos baseado no modelo técnico anexado. Marque apenas os riscos identificados e gere um documento com os itens selecionados.</p>
          </div>
          <button class="button primary" type="button" data-eu-checklist-new>Adicionar checklist</button>
        </header>
        <div class="pgr-checklist-toolbar">
          <label>Filtrar por pasta
            <select id="checklistFolderFilter">
              <option value="">Todas as pastas</option>
              ${folders.map(item => `<option value="${escapeAttr(item.id)}" ${item.id === selectedFilter ? "selected" : ""}>${escapeHtml(folderDisplayName(profile, item))}</option>`).join("")}
            </select>
          </label>
        </div>
        ${checklists.length ? `
          <div class="eu-workflow-doc-grid">
            ${checklists.map(doc => renderDocumentCard({
              id: doc.id,
              type: "checklist",
              title: doc.title,
              subtitle: folderDisplayName(profile, folders.find(item => item.id === (doc.folderId || DEFAULT_WORKFLOW_FOLDER_ID)) || folder),
              updatedAt: doc.updatedAt,
              folderId: doc.folderId || DEFAULT_WORKFLOW_FOLDER_ID
            }, profile, folder)).join("")}
          </div>
        ` : `<div class="empty-state">Nenhum checklist criado ainda.<br>Clique em Adicionar checklist para começar.</div>`}
      </section>`;
  }

  function renderFolderWorkspace(profile, folder) {
    const plans = (profile.plans || []).filter(plan => planBelongsToFolder(plan, folder));
    const docs = folder.isTrash ? [] : (profile.documents || []).filter(doc => documentBelongsToFolder(doc, folder));
    return `
      <div class="eu-workflow-folder-head">
        <div><p class="section-kicker">Pasta selecionada</p><h2>${escapeHtml(folderDisplayName(profile, folder))}</h2></div>
        <div class="button-row">
          ${folder.isTrash ? "" : `
            <button class="button primary" type="button" data-eu-wf="new-plan">Criar Plano de Ação</button>
            <button class="button" type="button" data-eu-wf="new-text">Documento de texto</button>
            <button class="button" type="button" data-eu-checklist-new>Novo Checklist</button>
            ${folder.isDefault ? "" : `<button class="button danger" type="button" data-eu-folder-delete="${escapeAttr(folder.id)}">Excluir pasta</button>`}
          `}
        </div>
      </div>
      <div class="eu-workflow-doc-grid">
        ${plans.map(plan => renderDocumentCard({ id: plan.id, type: "planAction", title: plan.title, subtitle: plan.company || plan.documentType || "Plano de Ação", updatedAt: plan.updatedAt, folderId: plan.folderId || DEFAULT_WORKFLOW_FOLDER_ID }, profile, folder)).join("")}
        ${docs.map(doc => renderDocumentCard({ id: doc.id, type: doc.type, title: doc.title, subtitle: doc.type === "checklist" ? "Checklist PGR" : "Documento de texto", updatedAt: doc.updatedAt, folderId: doc.folderId || DEFAULT_WORKFLOW_FOLDER_ID }, profile, folder)).join("")}
      </div>
      ${!plans.length && !docs.length ? `<div class="empty-state">Esta pasta ainda não tem documentos.</div>` : ""}`;
  }

  function renderDocumentCard(doc, profile = null, currentFolder = null) {
    const folders = getOwnedFolders(profile).filter(item => !item.isTrash);
    const moveOptions = folders
      .filter(item => item.id !== (doc.folderId || currentFolder?.id))
      .map(item => `<option value="${escapeAttr(item.id)}">${escapeHtml(folderDisplayName(profile, item))}</option>`)
      .join("");
    const copyOptions = folders
      .map(item => `<option value="${escapeAttr(item.id)}">${escapeHtml(folderDisplayName(profile, item))}</option>`)
      .join("");
    return `
      <article class="eu-workflow-doc-card">
        <span class="doc-type">${documentTypeLabel(doc.type)}</span>
        <strong>${escapeHtml(doc.title || "Sem título")}</strong>
        <small>${escapeHtml(doc.subtitle || "")}</small>
        <small>Atualizado: ${escapeHtml(formatDateTime(doc.updatedAt))}</small>
        <div class="doc-actions">
          <button class="button ghost" type="button" data-eu-doc-open="${escapeAttr(doc.id)}" data-doc-type="${escapeAttr(doc.type)}">Abrir</button>
          ${doc.type === "planAction" ? `
            <button class="button ghost" type="button" data-eu-plan-duplicate="${escapeAttr(doc.id)}">Duplicar</button>
            <button class="button danger" type="button" data-eu-plan-delete="${escapeAttr(doc.id)}">Excluir</button>
            <select data-eu-plan-move="${escapeAttr(doc.id)}" aria-label="Mover plano para pasta">
              <option value="">Mover para...</option>
              ${moveOptions}
            </select>
            <select data-eu-plan-copy="${escapeAttr(doc.id)}" aria-label="Copiar plano para pasta">
              <option value="">Copiar para...</option>
              ${copyOptions}
            </select>
          ` : `
            ${doc.type === "checklist" ? `<button class="button primary" type="button" data-eu-checklist-generate="${escapeAttr(doc.id)}">Gerar Word</button>` : ""}
            <button class="button ghost" type="button" data-eu-doc-duplicate="${escapeAttr(doc.id)}">Duplicar</button>
            <button class="button danger" type="button" data-eu-doc-delete="${escapeAttr(doc.id)}">Excluir</button>
          `}
        </div>
      </article>`;
  }

  function renderFolderForm() {
    return `
      <form class="workflow-form" data-eu-form="folder">
        <h2>Criar pasta</h2>
        <label>Nome da pasta<input id="euFolderNameInput" type="text" required></label>
        <div class="modal-actions">
          <button class="button ghost" type="button" data-eu-wf="cancel">Cancelar</button>
          <button class="button primary" type="submit">Salvar pasta</button>
        </div>
      </form>`;
  }

  function renderPlanForm(profile, folder) {
    const folders = getOwnedFolders(profile).filter(item => !item.isTrash);
    return `
      <form class="workflow-form" data-eu-form="plan">
        <h2>Criar Plano de Ação</h2>
        <label>Nome do plano<input id="euPlanTitleInput" type="text" required></label>
        <label>Empresa/Cliente<input id="euPlanCompanyInput" type="text" value="${escapeAttr(folder.isDefault ? profile.company || profile.name || "" : folder.name)}" required></label>
        <label>Pasta<select id="euPlanFolderInput">${folders.map(item => `<option value="${escapeAttr(item.id)}" ${item.id === folder.id ? "selected" : ""}>${escapeHtml(folderDisplayName(profile, item))}</option>`).join("")}</select></label>
        <label>Documento<select id="euPlanDocumentTypeInput"><option value="PGR">PGR</option><option value="PCMSO">PCMSO</option><option value="LTCAT">LTCAT</option><option value="Outro">Outro</option></select></label>
        <label>Modelo<select id="euPlanTemplateInput">${renderActionPlanTemplateOptions()}</select></label>
        <label class="workflow-check-line"><input id="euPlanOpenAfterCreateInput" type="checkbox"> Abrir editor depois de criar</label>
        <div class="modal-actions">
          <button class="button ghost" type="button" data-eu-wf="cancel">Cancelar</button>
          <button class="button primary" type="submit">Salvar na pasta</button>
        </div>
      </form>`;
  }

  function renderActionPlanTemplateOptions() {
    const app = appState();
    const normalizeTemplates = SATS.core.normalizeActionPlanTemplates || (value => Array.isArray(value) ? value : []);
    const templates = normalizeTemplates(app?.actionPlanTemplates || []);
    const customTemplates = templates.filter(template => template.active && !template.systemDefault);
    return [
      `<option value="blank">Em branco</option>`,
      `<option value="template">Modelo padrão de ações SST</option>`,
      ...customTemplates.map(template => `<option value="tpl:${escapeAttr(template.id)}">${escapeHtml(template.name)}</option>`)
    ].join("");
  }

  function renderTextDocumentForm(profile, folder) {
    const doc = state.editingDocumentId ? (profile.documents || []).find(item => item.id === state.editingDocumentId) : null;
    const folders = getOwnedFolders(profile).filter(item => !item.isTrash);
    return `
      <form class="workflow-form" data-eu-form="text">
        <h2>${doc ? "Editar documento de texto" : "Criar documento de texto"}</h2>
        <label>Título<input id="euTextTitleInput" type="text" value="${escapeAttr(doc?.title || "")}" required></label>
        <label>Pasta<select id="euTextFolderInput">${folders.map(item => `<option value="${escapeAttr(item.id)}" ${item.id === (doc?.folderId || folder.id) ? "selected" : ""}>${escapeHtml(folderDisplayName(profile, item))}</option>`).join("")}</select></label>
        <label>Texto<textarea id="euTextContentInput" rows="12" required>${escapeHtml(doc?.content || "")}</textarea></label>
        <div class="modal-actions">
          <button class="button ghost" type="button" data-eu-wf="cancel">Cancelar</button>
          <button class="button primary" type="submit">Salvar documento</button>
        </div>
      </form>`;
  }

  function renderChecklistWorkspace(profile, folder) {
    const existing = state.editingDocumentId ? (profile.documents || []).find(item => item.id === state.editingDocumentId) : null;
    const data = existing?.checklistData || {};
    const folders = getOwnedFolders(profile).filter(item => !item.isTrash);
    const selectedFolderId = data.folderId || existing?.folderId || folder.id || DEFAULT_WORKFLOW_FOLDER_ID;
    const title = existing?.title || data.title || `Checklist PGR - ${folderDisplayName(profile, folder) || "Empresa"}`;
    return `
      <form class="workflow-form checklist-builder" data-eu-form="checklist">
        <div class="checklist-builder-head">
          <div>
            <p class="section-kicker">Checklist PGR</p>
            <h2>Reconhecimento de Riscos</h2>
            <span>${escapeHtml(PGR_CHECKLIST_TEMPLATE.title)} • versão ${PGR_CHECKLIST_TEMPLATE.version}</span>
          </div>
          <button class="button primary" type="submit">Gerar Checklist para a Empresa</button>
        </div>
        <div class="checklist-meta-grid">
          <label>Pasta de destino<select id="checklistFolderInput">${folders.map(item => `<option value="${escapeAttr(item.id)}" ${item.id === selectedFolderId ? "selected" : ""}>${escapeHtml(folderDisplayName(profile, item))}</option>`).join("")}</select></label>
          <label>Título do checklist<input id="checklistTitleInput" type="text" value="${escapeAttr(title)}" required></label>
          ${metaInput("companyName", "Empresa / GHE", data.companyName || profile.company || folder.name)}
          ${metaInput("visitDate", "Data da visita", data.visitDate || "", "date")}
          ${metaInput("evaluatedSector", "Setor avaliado", data.evaluatedSector || data.sector || "")}
          ${metaInput("role", "Cargo / Função", data.role || "")}
        </div>
        <p class="checklist-note">Marque somente os riscos identificados. Campos complementares e observações entram no documento gerado.</p>
        ${CHECKLIST_GROUPS.map(group => renderChecklistGroup(group, data)).join("")}
        <label>Observações gerais<textarea id="checklistGeneralNotes" rows="5">${escapeHtml(data.generalNotes || "")}</textarea></label>
        <div class="modal-actions">
          <button class="button ghost" type="button" data-eu-wf="cancel">Cancelar</button>
          <button class="button" type="button" data-eu-wf="save-checklist">Salvar sem gerar</button>
          <button class="button primary" type="submit">Gerar Checklist para a Empresa</button>
        </div>
      </form>`;
  }

  function metaInput(id, label, value, type = "text") {
    return `<label>${escapeHtml(label)}<input data-checklist-meta="${escapeAttr(id)}" type="${escapeAttr(type)}" value="${escapeAttr(value || "")}"></label>`;
  }

  function renderChecklistGroup(group, data) {
    const selected = new Map((data.selectedItems || []).map(item => [item.id, item]));
    return `
      <section class="checklist-group">
        <header>${escapeHtml(group.title)}</header>
        ${group.items.map(item => {
          const saved = selected.get(item.id) || {};
          const requiresPhoto = item.requiresPhoto === true || (item.fields || []).length > 0;
          return `
            <article class="checklist-item ${saved.checked ? "is-checked" : ""}" data-checklist-item="${escapeAttr(item.id)}" data-group-id="${escapeAttr(group.id)}">
              <div class="checklist-item-row">
                <strong>${escapeHtml(item.label)}</strong>
                <label class="check-switch"><input type="checkbox" ${saved.checked ? "checked" : ""}>${group.yesNo ? "Sim" : "SIM"}</label>
              </div>
              <div class="checklist-extra">
                ${(item.fields || []).map(field => renderChecklistField(field, saved)).join("")}
                ${requiresPhoto ? `
                  <label class="checklist-photo-field">Foto do agente/fonte
                    <input type="file" accept="image/png,image/jpeg" data-checklist-photo>
                  </label>
                  <div class="checklist-photo-preview" data-checklist-photo-preview data-photo-name="${escapeAttr(saved.photoName || "")}" data-photo-data="${escapeAttr(saved.photoData || "")}">
                    ${saved.photoData ? `<img src="${escapeAttr(saved.photoData)}" alt=""><span>${escapeHtml(saved.photoName || "Foto registrada")}</span>` : `<span>Foto opcional salva no checklist.</span>`}
                  </div>
                ` : ""}
                <label>Observações<textarea data-observation rows="3">${escapeHtml(saved.observation || "")}</textarea></label>
              </div>
            </article>`;
        }).join("")}
      </section>`;
  }

  function isChecklistYesNoField(field) {
    return /\?/u.test(String(field || ""));
  }

  function renderChecklistField(field, saved = {}) {
    const value = saved.answers?.[field] || saved.fields?.[field] || "";
    if (isChecklistYesNoField(field)) {
      return `
        <label>${escapeHtml(field)}
          <select data-answer-field="${escapeAttr(field)}">
            <option value="">Selecione</option>
            <option value="Sim" ${value === "Sim" ? "selected" : ""}>Sim</option>
            <option value="Não" ${value === "Não" || value === "Nao" ? "selected" : ""}>Não</option>
          </select>
        </label>`;
    }
    return `<label>${escapeHtml(field)}<input data-extra-field="${escapeAttr(field)}" value="${escapeAttr(value || "")}"></label>`;
  }

  function handleGlobalWorkflowClick(event) {
    const checklistPageAction = event.target.closest("[data-checklist-page-action]");
    if (checklistPageAction) {
      event.preventDefault();
      event.stopImmediatePropagation();
      handleChecklistPageAction(checklistPageAction.dataset.checklistPageAction, checklistPageAction);
      return;
    }
    const euPlanReturn = event.target.closest("#backToFoldersBtn[data-eu-plan-return]");
    if (euPlanReturn) {
      event.preventDefault();
      event.stopImmediatePropagation();
      returnToEuTecnicoFolderFromPlan();
      return;
    }
    const profileAction = event.target.closest("[data-menu-profile-action], [data-menu-profile-toggle], [data-menu-profile-close]");
    if (profileAction) {
      handleMenuProfileClick(event, profileAction);
      return;
    }
    if (event.target.closest(".eu-workflow-root")) {
      handleEuWorkflowClick(event);
      return;
    }
    if (event.target.closest(".crew-workflow-root")) {
      handleCrewWorkflowClick(event);
    }
  }

  function handleGlobalWorkflowInput(event) {
    if (event.target.closest("#checklistPageScreen")) {
      const item = event.target.closest(".checklist-page-item");
      if (item && event.target.type === "checkbox") {
        item.classList.toggle("is-checked", event.target.checked);
        const marker = item.querySelector(".checklist-page-check span");
        if (marker) marker.textContent = event.target.checked ? "✓" : "";
      }
      markChecklistPageDirty();
      return;
    }
    if (event.target?.id === "euWorkflowSearch") {
      state.euSearch = event.target.value || "";
      renderEuTecnicoWorkflow();
      return;
    }
    const item = event.target.closest(".checklist-item");
    if (item && event.target.type === "checkbox") {
      item.classList.toggle("is-checked", event.target.checked);
      recordActivity(event.target.checked ? "Marcou item do checklist" : "Desmarcou item do checklist", item.querySelector(".checklist-item-row strong")?.textContent || "Item do checklist", { profile: getEuTecnicoWriteProfile() });
    }
  }

  function handleGlobalWorkflowChange(event) {
    if (event.target.closest("#checklistPageScreen")) {
      const photoInput = event.target.closest("[data-checklist-page-photo]");
      if (photoInput) {
        handleChecklistPagePhotoChange(photoInput);
        return;
      }
      markChecklistPageDirty();
      return;
    }
    if (event.target?.id === "checklistFolderFilter") {
      state.checklistFolderFilter = event.target.value || "";
      renderEuTecnicoWorkflow();
      return;
    }
    const photoInput = event.target.closest("[data-checklist-photo]");
    if (photoInput) {
      handleChecklistPhotoChange(photoInput);
      return;
    }
    const move = event.target.closest("[data-eu-plan-move]");
    if (move) {
      const targetFolderId = move.value || "";
      const planId = move.dataset.euPlanMove || "";
      move.value = "";
      if (targetFolderId) movePlanAction(planId, targetFolderId);
      return;
    }
    const copy = event.target.closest("[data-eu-plan-copy]");
    if (copy) {
      const targetFolderId = copy.value || "";
      const planId = copy.dataset.euPlanCopy || "";
      copy.value = "";
      if (targetFolderId) copyPlanAction(planId, targetFolderId);
    }
  }

  function handleChecklistPhotoChange(input) {
    const file = input.files?.[0];
    const item = input.closest(".checklist-item");
    const preview = item?.querySelector("[data-checklist-photo-preview]");
    if (!file || !item || !preview) return;
    if (!file.type.startsWith("image/")) return showToast("Selecione uma foto PNG ou JPG.", "warning");
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      preview.dataset.photoData = dataUrl;
      preview.dataset.photoName = file.name || "foto";
      preview.innerHTML = `<img src="${escapeAttr(dataUrl)}" alt=""><span>${escapeHtml(file.name || "Foto registrada")}</span>`;
      item.classList.add("is-checked");
      const checkbox = item.querySelector("input[type='checkbox']");
      if (checkbox) checkbox.checked = true;
      showToast("Foto anexada ao item.", "success");
    };
    reader.readAsDataURL(file);
  }

  function handleMenuProfileClick(event, target) {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (target.matches("[data-menu-profile-toggle]")) {
      const localPopover = target.closest(".eu-sidebar-profile")?.querySelector("[data-profile-popover]");
      const globalPopover = target.closest(".global-header-right")?.querySelector("[data-global-profile-popover]");
      const menuPopover = document.getElementById("menuUserPopover");
      (localPopover || globalPopover || menuPopover)?.classList.toggle("hidden");
      return;
    }
    if (target.matches("[data-menu-profile-close]")) {
      closeMenuProfileModal();
      return;
    }
    const action = target.dataset.menuProfileAction;
    if (action === "edit" || action === "photo") openMenuProfileModal(action === "photo");
    if (action === "settings") SATS.ui.openModal ? SATS.ui.openModal("settingsModal") : showToast("Configurações indisponíveis.", "warning");
    if (action === "logout") SATS.core.logout && SATS.core.logout();
  }

  function openMenuProfileModal(focusPhoto = false) {
    const profile = getEuTecnicoWriteProfile() || getOwnProfile(false);
    if (!profile) return showToast("Não encontrei o perfil antigo para editar.", "warning");
    if (SATS.core.openProfileModal) {
      SATS.core.openProfileModal(profile.id || "");
      if (focusPhoto) {
        window.setTimeout(() => document.getElementById("profilePhotoInput")?.click(), 120);
      }
      return;
    }
    document.getElementById("menuProfileNameInput").value = profile?.name || "";
    document.getElementById("menuProfileRoleInput").value = profile?.role || "";
    document.getElementById("menuProfileCompanyInput").value = profile?.company || "";
    document.getElementById("menuProfileEmailInput").value = profile?.email || "";
    document.getElementById("menuProfilePhotoInput").value = "";
    renderMenuProfileAvatarPreview(profile);
    SATS.ui.openModal ? SATS.ui.openModal("menuProfileModal") : document.getElementById("menuProfileModal").classList.remove("hidden");
    if (focusPhoto) document.getElementById("menuProfilePhotoInput").click();
  }

  function closeMenuProfileModal() {
    SATS.ui.closeModal ? SATS.ui.closeModal("menuProfileModal") : document.getElementById("menuProfileModal").classList.add("hidden");
  }

  function renderMenuProfileAvatarPreview(profile) {
    const preview = document.getElementById("menuProfileAvatarPreview");
    if (preview) preview.innerHTML = `${avatarMarkup(profile, "menu-profile-preview-avatar")}<span>Foto/avatar do usuário logado</span>`;
  }

  function handleMenuProfilePhoto(event) {
    const file = event.target.files?.[0];
    const profile = getEuTecnicoWriteProfile();
    if (!file || !profile) return;
    if (!file.type.startsWith("image/")) return showToast("Selecione uma imagem PNG ou JPG.", "warning");
    const reader = new FileReader();
    reader.onload = () => {
      profile.avatarPhoto = String(reader.result || "");
      cacheLoadingAvatar(currentUser(), profile);
      renderMenuProfileAvatarPreview(profile);
      recordActivity("Alterou foto de perfil no menu", `Perfil ${profile.name || profile.email}.`, { profile });
      saveApp({ profileId: profile.id });
      enhanceLoadingAvatar();
      renderMenuFooter();
    };
    reader.readAsDataURL(file);
  }

  function saveMenuProfile(event) {
    event.preventDefault();
    const profile = getEuTecnicoWriteProfile();
    if (!profile) return;
    profile.name = document.getElementById("menuProfileNameInput").value.trim() || profile.name || "Meu perfil";
    profile.role = document.getElementById("menuProfileRoleInput").value.trim();
    profile.company = document.getElementById("menuProfileCompanyInput").value.trim();
    profile.email = document.getElementById("menuProfileEmailInput").value.trim() || profile.email || "";
    recordActivity("Alterou perfil no menu", `Perfil ${profile.name} atualizado pelo menu.`, { profile });
    saveApp({ profileId: profile.id });
    closeMenuProfileModal();
    renderMenuFooter();
    enhanceHeaderLogo();
    showToast("Perfil atualizado.", "success");
  }

  async function handleEuWorkflowClick(event) {
    event.stopImmediatePropagation();
    const folderButton = event.target.closest("[data-eu-folder]");
    if (folderButton) {
      state.euFolderId = folderButton.dataset.euFolder || "";
      state.euTool = "folder";
      state.editingDocumentId = "";
      renderEuTecnicoWorkflow();
      return;
    }
    const docOpen = event.target.closest("[data-eu-doc-open]");
    if (docOpen) {
      openEuDocument(docOpen.dataset.euDocOpen, docOpen.dataset.docType);
      return;
    }
    const duplicate = event.target.closest("[data-eu-doc-duplicate]");
    if (duplicate) return duplicateProfileDocument(duplicate.dataset.euDocDuplicate);
    const remove = event.target.closest("[data-eu-doc-delete]");
    if (remove) return deleteProfileDocument(remove.dataset.euDocDelete);
    const checklistNew = event.target.closest("[data-eu-checklist-new]");
    if (checklistNew) {
      if (!getOwnedFolders(getEuTecnicoWriteProfile()).filter(item => !item.isTrash).length) return showToast("Crie uma pasta antes de adicionar um checklist.", "warning");
      createChecklistPageFromEuTecnico();
      return;
    }
    const checklistGenerate = event.target.closest("[data-eu-checklist-generate]");
    if (checklistGenerate) return generateSavedChecklist(checklistGenerate.dataset.euChecklistGenerate);
    const folderDelete = event.target.closest("[data-eu-folder-delete]");
    if (folderDelete) return deleteEuFolder(folderDelete.dataset.euFolderDelete);
    const planDuplicate = event.target.closest("[data-eu-plan-duplicate]");
    if (planDuplicate) return duplicatePlanAction(planDuplicate.dataset.euPlanDuplicate);
    const planDelete = event.target.closest("[data-eu-plan-delete]");
    if (planDelete) return deletePlanAction(planDelete.dataset.euPlanDelete);
    const action = event.target.closest("[data-eu-wf]");
    if (!action) return;
    const type = action.dataset.euWf;
    if (type === "folder") { state.euTool = "folder"; state.editingDocumentId = ""; }
    if (type === "folder-form") state.euTool = "folderForm";
    if (type === "new-plan") state.euTool = "planForm";
    if (type === "new-text") { state.euTool = "textForm"; state.editingDocumentId = ""; }
    if (type === "checklist") { state.euTool = "checklist"; state.editingDocumentId = ""; }
    if (type === "cancel") { state.euTool = "folder"; state.editingDocumentId = ""; }
    if (type === "save-checklist") return saveChecklist(false);
    renderEuTecnicoWorkflow();
  }

  document.addEventListener("submit", event => {
    const form = event.target.closest("[data-eu-form]");
    if (!form) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const type = form.dataset.euForm;
    if (type === "folder") saveEuFolder(form);
    if (type === "plan") saveEuPlan(form);
    if (type === "plan-editor") saveEuPlanEditor(form, { close: false });
    if (type === "text") saveTextDocument(form);
    if (type === "checklist") saveChecklist(true);
    if (type === "folder-edit") saveEuFolderEdit(form);
    if (type === "document-move") saveEuDocumentMove(form);
    if (type === "document-rename") saveEuDocumentRename(form);
    if (type === "bulk-move") saveEuBulkDocumentMove(form);
  }, true);

  function getScopedField(form, selector) {
    return form?.querySelector(selector) || document.querySelector(selector);
  }

  function ensureWritableDefaultFolder(profile) {
    profile.folders = Array.isArray(profile.folders) ? profile.folders : [];
    let defaultFolder = profile.folders.find(folder => folder.id === DEFAULT_WORKFLOW_FOLDER_ID);
    if (!defaultFolder) {
      defaultFolder = createDefaultWorkflowFolder(profile.email || currentUser()?.email || "");
      profile.folders.unshift(defaultFolder);
    }
    return defaultFolder;
  }

  async function deleteEuFolder(folderId) {
    const profile = getEuTecnicoWriteProfile();
    if (!profile) return showToast("Não encontrei o perfil antigo.", "warning");
    const folder = (profile.folders || []).find(item => item.id === folderId);
    if (!folder || folder.isDefault || folderId === DEFAULT_WORKFLOW_FOLDER_ID || folderId === TRASH_WORKFLOW_FOLDER_ID) {
      return showToast("Esta pasta não pode ser excluída.", "warning");
    }
    const ok = await askConfirm(`Excluir a pasta "${folder.name}"? Os planos e documentos serão movidos para Sem pasta.`);
    if (!ok) return;
    ensureWritableDefaultFolder(profile);
    (profile.plans || []).forEach(plan => {
      if (!plan.deleted && planBelongsToFolder(plan, folder)) {
        plan.folderId = DEFAULT_WORKFLOW_FOLDER_ID;
        plan.updatedAt = new Date().toISOString();
      }
    });
    (profile.documents || []).forEach(doc => {
      if (documentBelongsToFolder(doc, folder)) {
        doc.folderId = DEFAULT_WORKFLOW_FOLDER_ID;
        doc.updatedAt = new Date().toISOString();
      }
    });
    profile.folders = (profile.folders || []).filter(item => item.id !== folderId);
    state.euFolderId = DEFAULT_WORKFLOW_FOLDER_ID;
    state.euTool = "folder";
    recordActivity("Excluiu pasta", `Excluiu a pasta ${folder.name} no Eu Técnico.`, { profile });
    saveApp({ profileId: profile.id });
    renderEuTecnicoWorkflow();
    showToast("Pasta excluída. Conteúdo movido para Sem pasta.", "success");
  }

  function clonePlanForFolder(source, folderId, titleSuffix = " (cópia)") {
    const copy = JSON.parse(JSON.stringify(source));
    const now = new Date().toISOString();
    copy.id = createId();
    copy.title = `${source.title || "Plano sem nome"}${titleSuffix}`;
    copy.folderId = folderId || source.folderId || DEFAULT_WORKFLOW_FOLDER_ID;
    copy.deleted = false;
    copy.deletedAt = "";
    copy.deletedFromFolderId = "";
    copy.trashExpiresAt = "";
    copy.createdAt = now;
    copy.updatedAt = now;
    copy.createdBy = copy.createdBy || normalizeEmail(currentUser()?.email || "");
    return copy;
  }

  function duplicatePlanAction(planId) {
    const profile = getEuTecnicoWriteProfile();
    const source = (profile?.plans || []).find(plan => plan.id === planId);
    if (!profile || !source) return showToast("Plano não encontrado.", "warning");
    const copy = clonePlanForFolder(source, source.folderId || DEFAULT_WORKFLOW_FOLDER_ID);
    profile.plans.push(copy);
    recordActivity("Duplicou plano", `Duplicou o plano ${source.title || "sem título"} no Eu Técnico.`, { profile, plan: copy });
    saveApp({ profileId: profile.id });
    renderEuTecnicoWorkflow();
    showToast("Plano duplicado.", "success");
  }

  async function deletePlanAction(planId) {
    const profile = getEuTecnicoWriteProfile();
    const plan = (profile?.plans || []).find(item => item.id === planId);
    if (!profile || !plan) return showToast("Plano não encontrado.", "warning");
    const ok = await askConfirm(`Mover o plano "${plan.title || "sem título"}" para a Lixeira?`);
    if (!ok) return;
    const now = new Date().toISOString();
    plan.deleted = true;
    plan.deletedAt = now;
    plan.deletedFromFolderId = plan.folderId || DEFAULT_WORKFLOW_FOLDER_ID;
    plan.trashExpiresAt = plan.trashExpiresAt || "";
    plan.updatedAt = now;
    recordActivity("Moveu plano para a lixeira", `Moveu ${plan.title || "Plano sem título"} para a lixeira pelo Eu Técnico.`, { profile, plan });
    saveApp({ profileId: profile.id });
    renderEuTecnicoWorkflow();
    showToast("Plano movido para a Lixeira.", "success");
  }

  function movePlanAction(planId, targetFolderId) {
    const profile = getEuTecnicoWriteProfile();
    const plan = (profile?.plans || []).find(item => item.id === planId);
    const folder = getOwnedFolders(profile).find(item => item.id === targetFolderId && !item.isTrash);
    if (!profile || !plan || !folder) return showToast("Não foi possível mover o plano.", "warning");
    plan.folderId = folder.id;
    plan.deleted = false;
    plan.updatedAt = new Date().toISOString();
    recordActivity("Moveu plano", `Moveu ${plan.title || "Plano sem título"} para ${folderDisplayName(profile, folder)}.`, { profile, plan });
    saveApp({ profileId: profile.id });
    renderEuTecnicoWorkflow();
    showToast("Plano movido.", "success");
  }

  function copyPlanAction(planId, targetFolderId) {
    const profile = getEuTecnicoWriteProfile();
    const source = (profile?.plans || []).find(item => item.id === planId);
    const folder = getOwnedFolders(profile).find(item => item.id === targetFolderId && !item.isTrash);
    if (!profile || !source || !folder) return showToast("Não foi possível copiar o plano.", "warning");
    const copy = clonePlanForFolder(source, folder.id, " (cópia)");
    profile.plans.push(copy);
    recordActivity("Copiou plano", `Copiou ${source.title || "Plano sem título"} para ${folderDisplayName(profile, folder)}.`, { profile, plan: copy });
    saveApp({ profileId: profile.id });
    renderEuTecnicoWorkflow();
    showToast("Plano copiado.", "success");
  }

  function generateSavedChecklist(documentId) {
    const profile = getEuTecnicoWriteProfile();
    const doc = (profile?.documents || []).find(item => item.id === documentId && item.type === "checklist");
    if (!profile || !doc?.checklistData) return showToast("Checklist não encontrado.", "warning");
    const selected = (doc.checklistData.selectedItems || []).filter(item => item.checked);
    if (!selected.length) return showToast("Nenhum risco foi marcado. Marque ao menos um item para gerar o checklist da empresa.", "warning");
    generateChecklistWord({ ...doc.checklistData, title: doc.title });
    recordActivity("Gerou checklist da empresa", `Gerou ${doc.title}.`, { profile, document: doc });
    showToast("Checklist gerado.", "success");
  }

  function saveEuFolder(form = null) {
    const profile = getEuTecnicoWriteProfile();
    const name = getScopedField(form, "#euFolderNameInput")?.value.trim();
    if (!profile) return showToast("Não encontrei o perfil antigo para salvar a pasta.", "warning");
    if (!name) return showToast("Informe o nome da pasta.", "warning");
    const now = new Date().toISOString();
    const ownerEmail = normalizeEmail(profile.email || currentUser()?.email);
    const folder = {
      id: createId(),
      name,
      color: "#2563eb",
      isDefault: false,
      hidden: false,
      createdBy: ownerEmail,
      ownerEmail,
      userEmail: ownerEmail,
      profileId: profile.id || "",
      ownerProfileId: profile.id || "",
      ownerName: profile.name || currentUser()?.email || "",
      profileName: profile.name || "",
      createdAt: now,
      updatedAt: now
    };
    profile.folders.push(folder);
    state.euFolderId = folder.id;
    state.euTool = "folder";
    recordActivity("Criou pasta", `Criou a pasta ${folder.name}.`, { profile });
    saveApp({ profileId: profile.id });
    renderEuTecnicoWorkflow();
    showToast("Pasta criada.", "success");
  }

  function saveEuPlan(form = null) {
    const profile = getEuTecnicoWriteProfile();
    const folderId = getScopedField(form, "#euPlanFolderInput")?.value || state.euFolderId || "default-folder";
    const folder = getOwnedFolders(profile).filter(item => !item.isTrash).find(item => item.id === folderId) || getSelectedFolder(profile, getOwnedFolders(profile).filter(item => !item.isTrash));
    if (!profile || !folder) return showToast("Selecione uma pasta antes de criar o plano de ação.", "warning");
    const title = getScopedField(form, "#euPlanTitleInput")?.value.trim();
    const company = getScopedField(form, "#euPlanCompanyInput")?.value.trim();
    const documentType = getScopedField(form, "#euPlanDocumentTypeInput")?.value || "PGR";
    const templateChoice = getScopedField(form, "#euPlanTemplateInput")?.value || "blank";
    const openAfterCreate = !!getScopedField(form, "#euPlanOpenAfterCreateInput")?.checked;
    if (!title || !company) return showToast("Informe nome do plano e empresa.", "warning");
    const app = appState();
    const normalizeTemplates = SATS.core.normalizeActionPlanTemplates || (value => Array.isArray(value) ? value : []);
    const templates = normalizeTemplates(app?.actionPlanTemplates || []);
    const selectedTemplate = templateChoice === "template"
      ? templates.find(template => template.systemDefault)
      : templateChoice.startsWith("tpl:")
        ? templates.find(template => template.id === templateChoice.slice(4) && template.active)
        : null;
    const createPlanData = SATS.core.createPlanData || ((options = {}) => ({ meta: { company: options.company || "", documentName: options.documentType || "PGR" }, actions: [], equipment: [], trainings: [] }));
    const cloneRows = SATS.core.cloneTemplateRows || (rows => Array.isArray(rows) ? rows.map(row => ({ ...row, id: createId() })) : []);
    const cloneEquipment = SATS.core.cloneTemplateEquipmentRows || (rows => Array.isArray(rows) ? rows.map(row => ({ ...row, id: createId() })) : []);
    const cloneTrainings = SATS.core.cloneTemplateTrainingRows || (rows => Array.isArray(rows) ? rows.map(row => ({ ...row, id: createId() })) : []);
    const useDefaultTemplate = templateChoice === "template" && !selectedTemplate;
    const data = selectedTemplate ? {
      meta: createPlanData({ useTemplate: false, company, documentType }).meta,
      actions: cloneRows(selectedTemplate.rows),
      equipment: cloneEquipment(selectedTemplate.equipmentRows),
      trainings: cloneTrainings(selectedTemplate.trainingRows)
    } : createPlanData({ useTemplate: useDefaultTemplate, company, documentType });
    const now = new Date().toISOString();
    const normalizePlan = SATS.core.normalizePlan || (plan => plan);
    const ownerEmail = normalizeEmail(profile.email || currentUser()?.email);
    const plan = normalizePlan({
      id: createId(),
      title,
      company,
      documentType,
      folderId: folder.id,
      createdBy: ownerEmail,
      ownerEmail,
      userEmail: ownerEmail,
      profileId: profile.id || "",
      ownerProfileId: profile.id || "",
      ownerName: profile.name || currentUser()?.email || "",
      createdAt: now,
      updatedAt: now,
      data
    });
    profile.plans.push(plan);
    state.euFolderId = folder.id;
    state.euTool = "folder";
    recordActivity("Criou plano", `Criou o plano ${plan.title} dentro do Eu Técnico.`, { profile, plan });
    saveApp({ profileId: profile.id });
    if (openAfterCreate) {
      openOriginalPlanActionFromEuTecnico(profile, plan, folder.id);
      showToast("Plano criado e aberto no Plano de Acao.", "success");
      return;
    }
    renderEuTecnicoWorkflow();
    showToast("Plano salvo na pasta.", "success");
  }

  function saveTextDocument(form = null) {
    const profile = getEuTecnicoWriteProfile();
    if (!profile) return showToast("Não encontrei o perfil antigo para salvar o documento.", "warning");
    const title = getScopedField(form, "#euTextTitleInput")?.value.trim();
    const content = getScopedField(form, "#euTextContentInput")?.value || "";
    const folderId = getScopedField(form, "#euTextFolderInput")?.value || (state.euFolderId === TRASH_WORKFLOW_FOLDER_ID ? DEFAULT_WORKFLOW_FOLDER_ID : state.euFolderId) || DEFAULT_WORKFLOW_FOLDER_ID;
    if (!title || !content.trim()) return showToast("Informe título e texto.", "warning");
    const now = new Date().toISOString();
    let doc = state.editingDocumentId ? profile.documents.find(item => item.id === state.editingDocumentId) : null;
    if (doc) {
      doc.title = title;
      doc.content = content;
      doc.folderId = folderId;
      doc.updatedAt = now;
      doc.createdBy = doc.createdBy || normalizeEmail(profile.email || currentUser()?.email);
      doc.profileId = doc.profileId || profile.id || "";
      recordActivity("Editou documento de texto", `Editou ${doc.title}.`, { profile });
    } else {
      const ownerEmail = normalizeEmail(profile.email || currentUser()?.email);
      doc = {
        id: createId(),
        type: "textDocument",
        title,
        content,
        folderId,
        createdBy: ownerEmail,
        ownerEmail,
        userEmail: ownerEmail,
        profileId: profile.id || "",
        ownerProfileId: profile.id || "",
        ownerName: profile.name || currentUser()?.email || "",
        createdAt: now,
        updatedAt: now
      };
      profile.documents.push(doc);
      recordActivity("Criou documento de texto", `Criou ${doc.title}.`, { profile });
    }
    state.euFolderId = folderId;
    state.euTool = "folder";
    state.editingDocumentId = "";
    saveApp({ profileId: profile.id });
    renderEuTecnicoWorkflow();
    showToast("Documento salvo.", "success");
  }

  function openEuDocument(documentId, type) {
    const profile = getEuTecnicoWriteProfile();
    if (!profile) return;
    if (type === "planAction") {
      const plan = (profile.plans || []).find(item => item.id === documentId);
      if (!plan) return;
      const app = appState();
      app.activeProfileId = profile.id;
      app.activeFolderId = plan.folderId || "default-folder";
      app.activePlanId = plan.id;
      normalizeEuPlanOwnership(profile, plan);
      state.euFolderId = folderIdForPlan(plan);
      console.log("[Plano Eu Tecnico] perfil resolvido:", profile);
      console.log("[Plano Eu Tecnico] pasta atual:", state.euFolderId);
      console.log("[Plano Eu Tecnico] planos do perfil:", profile?.plans?.length);
      console.log("[Plano Eu Tecnico] plano aberto:", plan);
      console.log("[Plano Eu Tecnico] folderId do plano:", plan?.folderId);
      console.log("[Plano Eu Tecnico] templates disponiveis:", app?.actionPlanTemplates || []);
      openOriginalPlanActionFromEuTecnico(profile, plan, state.euFolderId);
      return;
    }
    const doc = (profile.documents || []).find(item => item.id === documentId);
    if (!doc) return;
    if (doc.type === "checklist") {
      openChecklistPageFromEuTecnico(doc.id, doc.folderId || state.euFolderId || DEFAULT_WORKFLOW_FOLDER_ID);
      return;
    }
    state.editingDocumentId = doc.id;
    state.euTool = "textForm";
    renderEuTecnicoWorkflow();
  }

  function openOriginalPlanActionFromEuTecnico(profile, plan, folderId) {
    const app = appState();
    if (!app || !profile || !plan) return showToast("Plano de Acao nao encontrado.", "warning");
    const safeFolderId = folderId || folderIdForPlan(plan) || DEFAULT_WORKFLOW_FOLDER_ID;
    normalizeEuPlanOwnership(profile, plan);
    app.euTecnicoReturnContext = {
      enabled: true,
      profileId: profile.id || "",
      folderId: safeFolderId,
      planId: plan.id,
      openedAt: new Date().toISOString()
    };
    app.activeProfileId = profile.id;
    app.activeFolderId = safeFolderId;
    app.activePlanId = plan.id;
    app.view = "editor";
    saveApp({ localOnly: true });
    if (SATS.router?.openModule) SATS.router.openModule("planAction");
    else SATS.core.renderApp && SATS.core.renderApp();
    setTimeout(enhancePlanActionReturnButton, 50);
  }

  function enhancePlanActionReturnButton() {
    const app = appState();
    const context = app?.euTecnicoReturnContext;
    const editor = document.getElementById("editorScreen");
    const button = document.getElementById("backToFoldersBtn");
    if (!editor || !button) return;
    const shouldShowReturn = !!(context?.enabled && context.planId && app?.activePlanId === context.planId && !editor.classList.contains("hidden"));
    if (!shouldShowReturn) {
      button.removeAttribute("data-eu-plan-return");
      return;
    }
    button.setAttribute("data-eu-plan-return", "true");
    button.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
      Voltar para pasta
    `;
  }

  function returnToEuTecnicoFolderFromPlan() {
    const app = appState();
    const context = app?.euTecnicoReturnContext || {};
    const folderId = context.folderId || app?.activeFolderId || DEFAULT_WORKFLOW_FOLDER_ID;
    state.euFolderId = folderId;
    state.euTool = "folder";
    state.editingPlanId = "";
    resetDocumentActionState();
    if (app) {
      app.activeFolderId = folderId;
      app.euTecnicoReturnContext = { enabled: false };
    }
    saveApp({ localOnly: true });
    if (SATS.router?.openModule) SATS.router.openModule("euTecnico");
    else SATS.modules?.euTecnico?.open?.();
    setTimeout(() => {
      renderEuTecnicoWorkflow();
      showToast("Voltando para a pasta do Eu Tecnico.", "success");
    }, 50);
  }

  function createChecklistPageFromEuTecnico(folderId = "") {
    const profile = getEuTecnicoWriteProfile();
    const folders = getOwnedFolders(profile).filter(item => !item.isTrash);
    const targetFolder = folders.find(item => item.id === (folderId || state.euFolderId)) || folders[0];
    if (!profile || !targetFolder) return showToast("Crie uma pasta antes de adicionar um checklist.", "warning");
    const now = new Date().toISOString();
    const ownerEmail = normalizeEmail(currentUser()?.email || profile.email || "");
    const data = buildDefaultChecklistData(profile, targetFolder);
    const doc = {
      id: createId(),
      type: "checklist",
      title: data.title,
      content: "",
      folderId: targetFolder.id,
      companyName: data.companyName || "",
      status: "draft",
      createdBy: ownerEmail,
      updatedBy: ownerEmail,
      ownerEmail,
      userEmail: ownerEmail,
      profileId: profile.id || "",
      ownerProfileId: profile.id || "",
      ownerName: profile.name || currentUser()?.email || "",
      createdAt: now,
      updatedAt: now,
      checklistData: data
    };
    profile.documents = Array.isArray(profile.documents) ? profile.documents : [];
    profile.documents.push(doc);
    state.euFolderId = targetFolder.id;
    state.editingDocumentId = doc.id;
    recordActivity("Criou checklist", `Criou ${doc.title}.`, { profile, document: doc });
    saveApp({ profileId: profile.id });
    openChecklistPageFromEuTecnico(doc.id, targetFolder.id);
  }

  function openChecklistPageFromEuTecnico(checklistId, folderId = "") {
    const profile = getEuTecnicoWriteProfile();
    const checklist = findChecklistById(profile, checklistId);
    if (!profile || !checklist) return showToast("Checklist nao encontrado.", "warning");
    const safeFolderId = folderId || checklist.folderId || DEFAULT_WORKFLOW_FOLDER_ID;
    checklist.folderId = safeFolderId;
    checklist.checklistData = normalizeChecklistPageData(profile, checklist, safeFolderId);
    state.editingDocumentId = checklist.id;
    state.euFolderId = safeFolderId;
    state.checklistDirty = false;
    const app = appState();
    if (app) {
      app.euTecnicoChecklistReturnContext = {
        enabled: true,
        source: "euTecnico",
        profileId: profile.id || "",
        folderId: safeFolderId,
        checklistId: checklist.id,
        openedAt: new Date().toISOString()
      };
    }
    console.log("[Checklist Page] perfil:", profile);
    console.log("[Checklist Page] pasta:", safeFolderId);
    console.log("[Checklist Page] checklist:", checklist);
    console.log("[Checklist Page] mobile width:", window.innerWidth);
    console.log("[Checklist Page] itens marcados:", getCheckedChecklistItems(checklist).length);
    saveApp({ localOnly: true });
    renderChecklistPage(profile, checklist, safeFolderId);
    recordActivity("Abriu checklist", `Abriu ${checklist.title || "Checklist PGR"}.`, { profile, document: checklist });
  }

  function renderChecklistPage(profile, checklist, folderId) {
    const screen = document.getElementById("checklistPageScreen");
    if (!screen) return;
    document.querySelectorAll(".screen").forEach(item => item.classList.add("hidden"));
    screen.classList.remove("hidden");
    screen.innerHTML = checklistPageHtml(profile, checklist, folderId);
    window.scrollTo({ top: 0, behavior: "instant" });
    updateChecklistPageStatus("Salvo", "saved");
  }

  function checklistPageHtml(profile, checklist, folderId) {
    const data = normalizeChecklistPageData(profile, checklist, folderId);
    const folders = getOwnedFolders(profile).filter(item => !item.isTrash);
    return `
      <section class="checklist-page-shell">
        <header class="checklist-page-header">
          <div>
            <p class="section-kicker">Checklist PGR</p>
            <h1>${escapeHtml(data.title || checklist.title || "Checklist PGR")}</h1>
            <div class="checklist-page-summary">
              <span>${escapeHtml(data.companyName || "Empresa/GHE nao informado")}</span>
              <span>${escapeHtml(data.evaluatedSector || "Setor nao informado")}</span>
              <span>${escapeHtml(data.visitDate || "Data nao informada")}</span>
              <span data-checklist-page-status="saved">Salvo</span>
            </div>
          </div>
          <div class="checklist-page-actions">
            <button class="button ghost" type="button" data-checklist-page-action="back">Voltar para pasta</button>
            <button class="button" type="button" data-checklist-page-action="save">Salvar</button>
            <button class="button primary" type="button" data-checklist-page-action="generate">Gerar documento</button>
          </div>
        </header>

        <form class="checklist-page-form" data-checklist-page-form>
          <div class="checklist-page-meta">
            <label>Titulo do checklist<input id="checklistPageTitleInput" type="text" value="${escapeAttr(data.title || checklist.title || "")}"></label>
            <label>Pasta<select id="checklistPageFolderInput">${folders.map(folder => `<option value="${escapeAttr(folder.id)}" ${folder.id === folderId ? "selected" : ""}>${escapeHtml(folderDisplayName(profile, folder))}</option>`).join("")}</select></label>
            ${checklistPageMetaInput("companyName", "Empresa / GHE", data.companyName || "")}
            ${checklistPageMetaInput("visitDate", "Data da visita", data.visitDate || "", "date")}
            ${checklistPageMetaInput("evaluatedSector", "Setor avaliado", data.evaluatedSector || "")}
            ${checklistPageMetaInput("role", "Cargo / Funcao", data.role || "")}
            ${checklistPageMetaInput("responsible", "Responsavel pela visita", data.responsible || "")}
          </div>

          <div class="checklist-page-groups">
            ${CHECKLIST_GROUPS.map(group => renderChecklistPageGroup(group, data)).join("")}
          </div>

          <section class="checklist-page-notes">
            <h2>Observacoes gerais</h2>
            <textarea id="checklistPageGeneralNotes" rows="4" placeholder="Registre apontamentos adicionais da visita...">${escapeHtml(data.generalNotes || "")}</textarea>
          </section>
        </form>

        <div class="checklist-page-end-actions">
          <button class="button ghost" type="button" data-checklist-page-action="top">Voltar ao topo</button>
          <button class="button" type="button" data-checklist-page-action="save">Salvar</button>
          <button class="button primary" type="button" data-checklist-page-action="generate">Gerar documento</button>
          <button class="button ghost" type="button" data-checklist-page-action="back">Voltar para pasta</button>
        </div>

        <div class="checklist-page-bottom-bar">
          <button type="button" data-checklist-page-action="back">Voltar</button>
          <button type="button" data-checklist-page-action="top">Topo</button>
          <button type="button" data-checklist-page-action="save">Salvar</button>
          <button type="button" data-checklist-page-action="generate">Gerar</button>
        </div>
      </section>`;
  }

  function checklistPageMetaInput(id, label, value, type = "text") {
    return `<label>${escapeHtml(label)}<input data-checklist-page-meta="${escapeAttr(id)}" type="${escapeAttr(type)}" value="${escapeAttr(value || "")}"></label>`;
  }

  function renderChecklistPageGroup(group, data) {
    const selected = new Map((data.selectedItems || []).map(item => [item.id, item]));
    const count = group.items.filter(item => selected.get(item.id)?.checked).length;
    return `
      <details class="checklist-page-group" ${count ? "open" : ""}>
        <summary><span>${escapeHtml(group.title)}</span><strong>${count} marcado(s)</strong></summary>
        <div class="checklist-page-items">
          ${group.items.map(item => renderChecklistPageItem(group, item, selected.get(item.id) || {})).join("")}
        </div>
      </details>`;
  }

  function renderChecklistPageItem(group, item, saved) {
    const requiresPhoto = item.requiresPhoto === true || (item.fields || []).length > 0;
    return `
      <article class="checklist-page-item ${saved.checked ? "is-checked" : ""}" data-checklist-page-item="${escapeAttr(item.id)}" data-group-id="${escapeAttr(group.id)}" data-label="${escapeAttr(item.label)}">
        <label class="checklist-page-check">
          <input type="checkbox" ${saved.checked ? "checked" : ""}>
          <span>${saved.checked ? "OK" : ""}</span>
          <strong>${escapeHtml(item.label)}</strong>
        </label>
        <div class="checklist-page-item-body">
          ${(item.fields || []).map(field => {
            const value = saved.fields?.[field] || "";
            return `<label>${escapeHtml(field)}<input data-checklist-page-field="${escapeAttr(field)}" value="${escapeAttr(value)}"></label>`;
          }).join("")}
          <label>Observacoes<textarea data-checklist-page-observation rows="3">${escapeHtml(saved.observation || "")}</textarea></label>
          ${requiresPhoto ? `
            <label class="checklist-page-photo">Foto/evidencia
              <input type="file" accept="image/*" capture="environment" data-checklist-page-photo>
            </label>
            <div class="checklist-page-photo-preview" data-checklist-page-photo-preview data-photo-name="${escapeAttr(saved.photoName || "")}" data-photo-data="${escapeAttr(saved.photoData || "")}">
              ${saved.photoData ? `<img src="${escapeAttr(saved.photoData)}" alt=""><span>${escapeHtml(saved.photoName || "Foto registrada")}</span><button type="button" data-checklist-page-action="remove-photo">Remover foto</button>` : `<span>Nenhuma foto adicionada.</span>`}
            </div>
          ` : ""}
        </div>
      </article>`;
  }

  function handleChecklistPageAction(action, target = null) {
    if (action === "save") return saveChecklistPage({ silent: false });
    if (action === "generate") {
      const saved = saveChecklistPage({ silent: true });
      const selected = saved ? getCheckedChecklistItems(saved) : [];
      if (!selected.length) return showToast("Nenhum risco foi marcado. Marque ao menos um item para gerar o checklist da empresa.", "warning");
      if (saved) generateChecklistWord(saved.checklistData);
      return;
    }
    if (action === "back") return returnToEuTecnicoFolderFromChecklist();
    if (action === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (action === "remove-photo") {
      const item = target?.closest?.(".checklist-page-item");
      const preview = item?.querySelector("[data-checklist-page-photo-preview]");
      if (preview) {
        preview.dataset.photoName = "";
        preview.dataset.photoData = "";
        preview.innerHTML = "<span>Nenhuma foto adicionada.</span>";
        markChecklistPageDirty();
      }
    }
  }

  function saveChecklistPage(options = {}) {
    const profile = getEuTecnicoWriteProfile();
    const checklist = findChecklistById(profile, state.editingDocumentId);
    if (!profile || !checklist) {
      updateChecklistPageStatus("Erro ao salvar", "error");
      return null;
    }
    const data = collectChecklistPageData();
    const now = new Date().toISOString();
    checklist.title = data.title || `Checklist PGR - ${data.companyName || "Empresa"}`;
    checklist.folderId = data.folderId || DEFAULT_WORKFLOW_FOLDER_ID;
    checklist.companyName = data.companyName || "";
    checklist.status = data.status || "draft";
    checklist.updatedBy = normalizeEmail(currentUser()?.email || profile.email || "");
    checklist.updatedAt = now;
    checklist.checklistData = data;
    state.euFolderId = checklist.folderId;
    const app = appState();
    if (app?.euTecnicoChecklistReturnContext?.enabled) app.euTecnicoChecklistReturnContext.folderId = checklist.folderId;
    state.checklistDirty = false;
    updateChecklistPageStatus("Salvo", "saved");
    recordActivity("Salvou checklist", `Salvou ${checklist.title}.`, { profile, document: checklist });
    saveApp({ profileId: profile.id });
    if (!options.silent) showToast("Checklist salvo.", "success");
    return checklist;
  }

  function collectChecklistPageData() {
    const form = document.querySelector("[data-checklist-page-form]");
    const meta = {};
    form?.querySelectorAll("[data-checklist-page-meta]").forEach(input => { meta[input.dataset.checklistPageMeta] = input.value || ""; });
    const selectedItems = [];
    form?.querySelectorAll(".checklist-page-item").forEach(item => {
      const fields = {};
      item.querySelectorAll("[data-checklist-page-field]").forEach(input => { fields[input.dataset.checklistPageField] = input.value || ""; });
      const preview = item.querySelector("[data-checklist-page-photo-preview]");
      selectedItems.push({
        id: item.dataset.checklistPageItem,
        groupId: item.dataset.groupId,
        label: item.dataset.label || "",
        checked: !!item.querySelector("input[type='checkbox']")?.checked,
        fields,
        observation: item.querySelector("[data-checklist-page-observation]")?.value || "",
        photoName: preview?.dataset.photoName || "",
        photoData: preview?.dataset.photoData || ""
      });
    });
    return {
      title: document.getElementById("checklistPageTitleInput")?.value.trim() || `Checklist PGR - ${meta.companyName || "Empresa"}`,
      folderId: document.getElementById("checklistPageFolderInput")?.value || state.euFolderId || DEFAULT_WORKFLOW_FOLDER_ID,
      companyName: meta.companyName || "",
      visitDate: meta.visitDate || "",
      evaluatedSector: meta.evaluatedSector || "",
      role: meta.role || "",
      responsible: meta.responsible || "",
      generalNotes: document.getElementById("checklistPageGeneralNotes")?.value || "",
      selectedItems,
      templateId: PGR_CHECKLIST_TEMPLATE.id,
      templateVersion: PGR_CHECKLIST_TEMPLATE.version,
      status: "draft"
    };
  }

  function markChecklistPageDirty() {
    state.checklistDirty = true;
    updateChecklistPageStatus("Alteracoes nao salvas", "dirty");
    if (state.checklistAutosaveTimer) clearTimeout(state.checklistAutosaveTimer);
    state.checklistAutosaveTimer = setTimeout(() => {
      updateChecklistPageStatus("Salvando...", "saving");
      saveChecklistPage({ silent: true });
    }, 1800);
  }

  function updateChecklistPageStatus(text, tone = "") {
    document.querySelectorAll("[data-checklist-page-status]").forEach(item => {
      item.textContent = text;
      item.dataset.status = tone;
    });
  }

  function handleChecklistPagePhotoChange(input) {
    const file = input.files?.[0];
    const item = input.closest(".checklist-page-item");
    const preview = item?.querySelector("[data-checklist-page-photo-preview]");
    if (!file || !item || !preview) return;
    if (!file.type.startsWith("image/")) return showToast("Selecione uma foto PNG ou JPG.", "warning");
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      preview.dataset.photoData = dataUrl;
      preview.dataset.photoName = file.name || "foto";
      preview.innerHTML = `<img src="${escapeAttr(dataUrl)}" alt=""><span>${escapeHtml(file.name || "Foto registrada")}</span><button type="button" data-checklist-page-action="remove-photo">Remover foto</button>`;
      const checkbox = item.querySelector("input[type='checkbox']");
      if (checkbox) checkbox.checked = true;
      item.classList.add("is-checked");
      markChecklistPageDirty();
    };
    reader.readAsDataURL(file);
  }

  function returnToEuTecnicoFolderFromChecklist() {
    saveChecklistPage({ silent: true });
    const app = appState();
    const context = app?.euTecnicoChecklistReturnContext || {};
    const folderId = context.folderId || state.euFolderId || DEFAULT_WORKFLOW_FOLDER_ID;
    const screen = document.getElementById("checklistPageScreen");
    if (screen) screen.classList.add("hidden");
    state.euFolderId = folderId;
    state.euTool = "folder";
    state.editingDocumentId = "";
    if (app) app.euTecnicoChecklistReturnContext = { enabled: false };
    saveApp({ localOnly: true });
    if (SATS.router?.openModule) SATS.router.openModule("euTecnico");
    else SATS.modules?.euTecnico?.open?.();
    setTimeout(() => {
      renderEuTecnicoWorkflow();
      showToast("Voltando para a pasta do Eu Tecnico.", "success");
    }, 50);
  }

  function findChecklistById(profile, id) {
    return (profile?.documents || []).find(item => item.id === id && item.type === "checklist") || null;
  }

  function buildDefaultChecklistData(profile, folder) {
    const companyName = folder?.isDefault ? (profile?.company || profile?.name || "") : (folder?.name || "");
    return {
      title: `Checklist PGR - ${companyName || "Empresa"}`,
      folderId: folder?.id || DEFAULT_WORKFLOW_FOLDER_ID,
      companyName,
      visitDate: "",
      evaluatedSector: "",
      role: "",
      responsible: profile?.name || currentUser()?.name || "",
      selectedItems: [],
      generalNotes: "",
      templateId: PGR_CHECKLIST_TEMPLATE.id,
      templateVersion: PGR_CHECKLIST_TEMPLATE.version,
      status: "draft"
    };
  }

  function normalizeChecklistPageData(profile, checklist, folderId) {
    const folder = getOwnedFolders(profile).find(item => item.id === folderId) || { id: folderId || DEFAULT_WORKFLOW_FOLDER_ID, name: "" };
    const base = buildDefaultChecklistData(profile, folder);
    const current = checklist.checklistData || {};
    return {
      ...base,
      ...current,
      title: current.title || checklist.title || base.title,
      folderId: current.folderId || checklist.folderId || base.folderId,
      companyName: current.companyName || checklist.companyName || base.companyName,
      selectedItems: Array.isArray(current.selectedItems) ? current.selectedItems : [],
      responsible: current.responsible || checklist.responsible || base.responsible
    };
  }

  function getCheckedChecklistItems(checklist) {
    return (checklist?.checklistData?.selectedItems || []).filter(item => item.checked);
  }

  function duplicateProfileDocument(documentId) {
    const profile = getEuTecnicoWriteProfile();
    const source = profile?.documents?.find(item => item.id === documentId);
    if (!profile || !source) return;
    const copy = JSON.parse(JSON.stringify(source));
    copy.id = createId();
    copy.title = `${source.title} (cópia)`;
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = copy.createdAt;
    copy.createdBy = normalizeEmail(profile.email || currentUser()?.email);
    profile.documents.push(copy);
    recordActivity(source.type === "checklist" ? "Duplicou checklist" : "Duplicou documento de texto", `Duplicou ${source.title}.`, { profile });
    saveApp({ profileId: profile.id });
    renderEuTecnicoWorkflow();
  }

  function deleteProfileDocument(documentId) {
    const profile = getEuTecnicoWriteProfile();
    const doc = profile?.documents?.find(item => item.id === documentId);
    if (!profile || !doc) return;
    profile.documents = profile.documents.filter(item => item.id !== documentId);
    recordActivity(doc.type === "checklist" ? "Excluiu checklist" : "Excluiu documento de texto", `Removeu ${doc.title}.`, { profile });
    saveApp({ profileId: profile.id });
    renderEuTecnicoWorkflow();
  }

  function saveChecklist(generateAfterSave) {
    const profile = getEuTecnicoWriteProfile();
    if (!profile) return;
    const data = collectChecklistData();
    const selected = data.selectedItems.filter(item => item.checked);
    if (generateAfterSave && !selected.length) return showToast("Nenhum risco foi marcado. Marque ao menos um item para gerar o checklist da empresa.", "warning");
    const now = new Date().toISOString();
    let doc = state.editingDocumentId ? profile.documents.find(item => item.id === state.editingDocumentId) : null;
    const title = data.title || `Checklist PGR - ${data.companyName || "Empresa"}`;
    if (doc) {
      doc.title = title;
      doc.folderId = data.folderId;
      doc.checklistData = data;
      doc.companyName = data.companyName || "";
      doc.status = data.status || "draft";
      doc.updatedBy = normalizeEmail(currentUser()?.email || profile.email || "");
      doc.updatedAt = now;
      recordActivity(generateAfterSave ? "Gerou checklist da empresa" : "Editou checklist", `${title}.`, { profile, document: doc });
    } else {
      const ownerEmail = normalizeEmail(profile.email || currentUser()?.email);
      doc = {
        id: createId(),
        type: "checklist",
        title,
        content: "",
        folderId: data.folderId,
        companyName: data.companyName || "",
        status: "draft",
        createdBy: ownerEmail,
        updatedBy: ownerEmail,
        ownerEmail,
        userEmail: ownerEmail,
        profileId: profile.id || "",
        ownerProfileId: profile.id || "",
        ownerName: profile.name || currentUser()?.email || "",
        createdAt: now,
        updatedAt: now,
        checklistData: data
      };
      profile.documents.push(doc);
      recordActivity(generateAfterSave ? "Gerou checklist da empresa" : "Criou checklist", `${title}.`, { profile, document: doc });
    }
    state.euFolderId = data.folderId;
    state.editingDocumentId = doc.id;
    saveApp({ profileId: profile.id });
    if (generateAfterSave) generateChecklistWord(data);
    showToast(generateAfterSave ? "Checklist gerado e salvo." : "Checklist salvo.", "success");
    state.euTool = "folder";
    state.editingDocumentId = "";
    renderEuTecnicoWorkflow();
  }

  function collectChecklistData() {
    const meta = {};
    document.querySelectorAll("[data-checklist-meta]").forEach(input => { meta[input.dataset.checklistMeta] = input.value || ""; });
    const selectedItems = [];
    document.querySelectorAll(".checklist-item").forEach(item => {
      const checked = item.querySelector("input[type='checkbox']")?.checked || false;
      const fields = {};
      const answers = {};
      item.querySelectorAll("[data-extra-field]").forEach(input => { if (input.value) fields[input.dataset.extraField] = input.value; });
      item.querySelectorAll("[data-answer-field]").forEach(input => { if (input.value) answers[input.dataset.answerField] = input.value; });
      const preview = item.querySelector("[data-checklist-photo-preview]");
      selectedItems.push({
        id: item.dataset.checklistItem,
        groupId: item.dataset.groupId,
        label: item.querySelector(".checklist-item-row strong")?.textContent || "",
        checked,
        fields,
        answers,
        observation: item.querySelector("[data-observation]")?.value || "",
        photoName: preview?.dataset.photoName || "",
        photoData: preview?.dataset.photoData || ""
      });
    });
    return {
      ...meta,
      title: document.getElementById("checklistTitleInput")?.value.trim() || `Checklist PGR - ${meta.companyName || "Empresa"}`,
      folderId: document.getElementById("checklistFolderInput")?.value || state.euFolderId || "default-folder",
      selectedItems,
      generalNotes: document.getElementById("checklistGeneralNotes")?.value || "",
      templateId: PGR_CHECKLIST_TEMPLATE.id,
      templateVersion: PGR_CHECKLIST_TEMPLATE.version,
      status: "draft",
      generatedAt: new Date().toISOString()
    };
  }

  function generateChecklistWord(data) {
    const selected = data.selectedItems.filter(item => item.checked);
    const grouped = CHECKLIST_GROUPS.map(group => ({ ...group, items: selected.filter(item => item.groupId === group.id) })).filter(group => group.items.length);
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Checklist PGR</title><style>
      body{font-family:Arial,sans-serif;color:#111827;font-size:11pt} h1{color:#1f4e79;text-align:center;margin-bottom:4px} .subtitle{text-align:center;color:#475569;margin-bottom:18px} h2{background:#1f4e79;color:#fff;padding:8px;font-size:12pt} table{width:100%;border-collapse:collapse;margin:10px 0 18px} th,td{border:1px solid #8aa0b8;padding:6px;vertical-align:top} th{background:#d9e8f5;text-align:left}.label{width:180px;background:#d9e8f5;font-weight:bold}.small{font-size:9pt;color:#475569}.item-title{font-weight:bold;color:#1f4e79}.photo{max-width:180px;max-height:130px;border:1px solid #8aa0b8;margin-top:6px}</style></head><body>
      <h1>CHECKLIST PGR — RECONHECIMENTO DE RISCOS</h1>
      <p class="subtitle">Documento gerado pelo STS com somente os itens marcados.</p>
      <table>
        ${infoRow("Empresa / GHE", data.companyName)}
        ${infoRow("Data da visita", data.visitDate)}
        ${infoRow("Setor avaliado", data.evaluatedSector || data.sector)}
        ${infoRow("Cargo / Função", data.role)}
        ${infoRow("Data de geração", new Date().toLocaleString("pt-BR"))}
      </table>
      <h2>RISCOS IDENTIFICADOS</h2>
      ${grouped.map(group => `<h2>${escapeHtml(group.title)}</h2><table><thead><tr><th>Item marcado</th><th>Campos complementares e respostas</th><th>Observações / Foto</th></tr></thead><tbody>${group.items.map(item => `<tr><td class="item-title">${escapeHtml(item.label)}</td><td>${renderChecklistWordFields(item)}</td><td>${escapeHtml(item.observation || "-").replace(/\n/g, "<br>")}${item.photoData ? `<br><img class="photo" src="${escapeAttr(item.photoData)}" alt="${escapeAttr(item.photoName || "Foto")}"><br><span class="small">${escapeHtml(item.photoName || "Foto do agente/fonte")}</span>` : ""}</td></tr>`).join("")}</tbody></table>`).join("")}
      ${data.generalNotes ? `<h2>Observações gerais</h2><p>${escapeHtml(data.generalNotes).replace(/\n/g, "<br>")}</p>` : ""}
      </body></html>`;
    const fileName = `Checklist PGR - ${data.companyName || "Empresa"}${data.evaluatedSector || data.sector ? " - " + (data.evaluatedSector || data.sector) : ""}`;
    downloadBlob(new Blob([html], { type: "application/msword;charset=utf-8" }), `${sanitizeFileName(fileName)}.doc`);
  }

  function renderChecklistWordFields(item) {
    const parts = [
      ...Object.entries(item.fields || {}).map(([key, value]) => `<strong>${escapeHtml(key)}:</strong> ${escapeHtml(value)}`),
      ...Object.entries(item.answers || {}).map(([key, value]) => `<strong>${escapeHtml(key)}:</strong> ${escapeHtml(value)}`)
    ];
    return parts.length ? parts.join("<br>") : "-";
  }

  function infoRow(label, value) {
    return value ? `<tr><td class="label">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>` : "";
  }

  function handleCrewWorkflowClick(event) {
    event.stopImmediatePropagation();
    const tabButton = event.target.closest("[data-crew-tab]");
    if (tabButton) {
      state.crewTab = tabButton.dataset.crewTab || "explore";
      state.crewFolderId = "";
      renderCrewWorkflow();
      return;
    }
    const profileButton = event.target.closest("[data-crew-profile]");
    if (profileButton) {
      state.crewTab = "explore";
      state.crewProfileId = profileButton.dataset.crewProfile || "";
      state.crewFolderId = "";
      renderCrewWorkflow();
      return;
    }
    const folderButton = event.target.closest("[data-crew-folder]");
    if (folderButton) {
      state.crewFolderId = folderButton.dataset.crewFolder || "";
      renderCrewWorkflow();
      return;
    }
    const requesterButton = event.target.closest("[data-crew-requester]");
    if (requesterButton) {
      state.crewTab = "received";
      state.crewRequesterEmail = requesterButton.dataset.crewRequester || "";
      renderCrewWorkflow();
      return;
    }
    const requestButton = event.target.closest("[data-copy-request]");
    if (requestButton) return createCopyRequest(requestButton.dataset.copyRequest, requestButton.dataset.docType);
    const approveButton = event.target.closest("[data-copy-approve]");
    if (approveButton) return approveCopyRequest(approveButton.dataset.copyApprove);
    const approveAllButton = event.target.closest("[data-copy-approve-all]");
    if (approveAllButton) return approveAllCopyRequests(approveAllButton.dataset.copyApproveAll);
    const rejectButton = event.target.closest("[data-copy-reject]");
    if (rejectButton) return rejectCopyRequest(rejectButton.dataset.copyReject);
  }

  function renderCrewWorkflow() {
    const screen = document.getElementById("crewScreen");
    if (!screen) return;
    const profiles = getCrewProfiles();
    const currentEmail = normalizeEmail(currentUser()?.email || "");
    if (!profiles.some(profile => profile.id === state.crewProfileId)) state.crewProfileId = profiles.find(profile => normalizeEmail(profile.email) !== currentEmail)?.id || profiles[0]?.id || "";
    const selected = profiles.find(profile => profile.id === state.crewProfileId) || null;
    screen.innerHTML = `
      <section class="crew-workflow-root">
        <header class="crew-workflow-hero">
          <div><p class="section-kicker">Companheiros de Tripulação</p><h1>Solicitar e fornecer cópias</h1><p>Documentos só são copiados após autorização do dono.</p></div>
          ${incomingCopyRequests().length ? `<span class="crew-alert">${incomingCopyRequests().length} solicitação(ões) pendente(s)</span>` : ""}
        </header>
        <section class="crew-workflow-layout">
          <aside class="crew-workflow-profiles">
            ${profiles.map(profile => renderCrewProfileCard(profile)).join("") || `<div class="empty-state">Nenhum perfil disponível.</div>`}
          </aside>
          <main class="crew-workflow-detail">
            ${selected ? renderCrewProfileDetail(selected) : `<div class="empty-state">Selecione um perfil.</div>`}
          </main>
        </section>
      </section>`;
    refreshCrewBadge();
  }

  function getCrewProfiles() {
    const app = appState();
    const fullProfiles = app?.profiles || [];
    const directory = typeof SATS.core.getVisibleTeamProfiles === "function"
      ? SATS.core.getVisibleTeamProfiles()
      : fullProfiles;
    const byEmail = new Map();
    [...directory, ...fullProfiles].forEach(profile => {
      if (!profile?.email) return;
      const key = normalizeEmail(profile.email);
      const full = fullProfiles.find(item => normalizeEmail(item.email) === key) || {};
      byEmail.set(key, {
        id: full.id || profile.id || profile.userId || key,
        userId: full.userId || profile.userId || "",
        name: full.name || profile.name,
        email: full.email || profile.email,
        company: full.company || profile.company,
        avatarPhoto: full.avatarPhoto || profile.avatarPhoto,
        avatarColor: full.avatarColor || profile.avatarColor
      });
    });
    return Array.from(byEmail.values())
      .sort((a, b) => String(a.name).localeCompare(String(b.name), "pt-BR"));
  }

  function renderCrewProfileCard(profile) {
    const pendingFromThisUser = incomingCopyRequests().filter(request => normalizeEmail(request.requesterEmail) === normalizeEmail(profile.email)).length;
    const currentEmail = normalizeEmail(currentUser()?.email || "");
    return `
      <button type="button" class="crew-workflow-profile ${profile.id === state.crewProfileId ? "is-active" : ""} ${pendingFromThisUser ? "has-request" : ""}" data-crew-profile="${escapeAttr(profile.id)}">
        ${avatarMarkup(profile)}
        <span><strong>${escapeHtml(profile.name || profile.email)}</strong><small>${escapeHtml(profile.email)}</small></span>
        ${pendingFromThisUser ? `<b>${pendingFromThisUser}</b>` : normalizeEmail(profile.email) === currentEmail ? `<em>Você</em>` : ""}
      </button>`;
  }

  function renderCrewProfileDetail(profile) {
    const currentEmail = normalizeEmail(currentUser()?.email || "");
    const isCurrentUser = normalizeEmail(profile.email) === currentEmail;
    const pendingFromSelected = incomingCopyRequests().filter(request => normalizeEmail(request.requesterEmail) === normalizeEmail(profile.email));
    const sourceProfile = getProfileByEmail(profile.email);
    const folders = getCrewFolders(sourceProfile);
    if (!state.crewFolderId || !folders.some(folder => folder.id === state.crewFolderId)) state.crewFolderId = folders[0]?.id || "";
    const folder = folders.find(item => item.id === state.crewFolderId) || null;
    const docs = folder ? getCrewDocuments(sourceProfile, folder.id) : [];
    return `
      ${pendingFromSelected.length ? renderIncomingRequestsPanel(profile, pendingFromSelected) : ""}
      <section class="crew-browser">
        <div class="crew-browser-head">
          <div><h2>${isCurrentUser ? "Seus documentos" : `Documentos de ${escapeHtml(profile.name || profile.email)}`}</h2><p>${isCurrentUser ? "Você não solicita cópia de si mesmo." : "Abra uma pasta e solicite cópia do documento desejado."}</p></div>
        </div>
        <div class="crew-folder-tabs">${folders.map(item => `<button type="button" class="${item.id === folder?.id ? "is-active" : ""}" data-crew-folder="${escapeAttr(item.id)}">${escapeHtml(item.name)}</button>`).join("")}</div>
        <div class="crew-documents">
          ${docs.length ? docs.map(doc => `<article class="crew-document-card"><span>${escapeHtml(documentTypeLabel(doc.type))}</span><strong>${escapeHtml(doc.title)}</strong><small>${escapeHtml(doc.subtitle || "")}</small>${!isCurrentUser ? `<button class="button primary" type="button" data-copy-request="${escapeAttr(doc.id)}" data-doc-type="${escapeAttr(doc.type)}">Solicitar Cópia</button>` : ""}</article>`).join("") : `<div class="empty-state">Nenhum documento nesta pasta.</div>`}
        </div>
      </section>`;
  }

  function renderIncomingRequestsPanel(profile, requests) {
    return `
      <section class="crew-request-panel">
        <header><div><h2>Solicitações de ${escapeHtml(profile.name || profile.email)}</h2><p>Forneça cópias sem liberar o original.</p></div><button class="button primary" type="button" data-copy-approve-all="${escapeAttr(profile.email)}">Fornecer Tudo</button></header>
        ${requests.map(request => `<article class="crew-request-card"><div><strong>${escapeHtml(request.sourceTitle)}</strong><span>${escapeHtml(documentTypeLabel(request.sourceDocumentType))} • ${escapeHtml(formatDateTime(request.createdAt))}</span></div><button class="button primary" type="button" data-copy-approve="${escapeAttr(request.id)}">Fornecer Cópia</button></article>`).join("")}
      </section>`;
  }

  function getProfileByEmail(email) {
    return (appState()?.profiles || []).find(profile => normalizeEmail(profile.email) === normalizeEmail(email)) || null;
  }

  function getCrewFolders(profile) {
    if (!profile) return [];
    return (profile.folders || []).filter(folder => !folder.hidden).sort((a, b) => (a.isDefault ? -1 : b.isDefault ? 1 : String(a.name).localeCompare(String(b.name), "pt-BR")));
  }

  function getCrewDocuments(profile, folderId) {
    if (!profile) return [];
    const plans = (profile.plans || []).filter(plan => !plan.deleted && (plan.folderId || "default-folder") === folderId).map(plan => ({ id: plan.id, type: "planAction", title: plan.title, subtitle: plan.company || plan.documentType || "" }));
    const docs = (profile.documents || []).filter(doc => (doc.folderId || "default-folder") === folderId).map(doc => ({ id: doc.id, type: doc.type, title: doc.title, subtitle: doc.type === "checklist" ? "Checklist PGR" : "Documento de texto" }));
    return [...plans, ...docs];
  }

  function copyRequests() {
    const app = appState();
    app.crewCopyRequests = Array.isArray(app.crewCopyRequests) ? app.crewCopyRequests : [];
    return app.crewCopyRequests;
  }

  function incomingCopyRequests() {
    const email = normalizeEmail(currentUser()?.email || "");
    return copyRequests().filter(request => normalizeEmail(request.ownerEmail) === email && request.status === "pending");
  }

  function createCopyRequest(documentId, type) {
    const owner = getCrewProfiles().find(profile => profile.id === state.crewProfileId);
    const requester = getOwnProfile(true);
    if (!owner || !requester) return;
    const ownerProfile = getProfileByEmail(owner.email);
    const source = findDocument(ownerProfile, documentId, type);
    if (!source) return showToast("Documento não encontrado.", "warning");
    const duplicate = copyRequests().some(request => request.status === "pending" && request.sourceDocumentId === documentId && normalizeEmail(request.requesterEmail) === normalizeEmail(requester.email));
    if (duplicate) return showToast("Você já solicitou cópia deste documento.", "warning");
    copyRequests().unshift({
      id: createId(),
      requesterEmail: normalizeEmail(requester.email || currentUser()?.email),
      requesterName: requester.name || currentUser()?.email || "",
      ownerEmail: normalizeEmail(owner.email),
      ownerName: owner.name || owner.email,
      sourceDocumentId: documentId,
      sourceDocumentType: type,
      sourceFolderId: source.folderId || "default-folder",
      sourceTitle: source.title || "Documento",
      status: "pending",
      createdAt: new Date().toISOString(),
      resolvedAt: null
    });
    recordActivity("Solicitou cópia", `${requester.name || requester.email} solicitou cópia de ${source.title}.`, { profile: requester });
    saveApp({ fullSave: true });
    renderCrewWorkflow();
    showToast("Solicitação enviada ao dono do documento.", "success");
  }

  function approveCopyRequest(requestId) {
    const request = copyRequests().find(item => item.id === requestId && item.status === "pending");
    if (!request) return;
    const owner = getProfileByEmail(request.ownerEmail);
    const requester = getProfileByEmail(request.requesterEmail);
    if (!owner || !requester) return showToast("Perfil de origem ou destino não encontrado.", "warning");
    owner.plans = Array.isArray(owner.plans) ? owner.plans : [];
    owner.documents = Array.isArray(owner.documents) ? owner.documents : [];
    requester.plans = Array.isArray(requester.plans) ? requester.plans : [];
    requester.documents = Array.isArray(requester.documents) ? requester.documents : [];
    const source = findDocument(owner, request.sourceDocumentId, request.sourceDocumentType);
    if (!source) return showToast("Documento original não foi encontrado.", "warning");
    const folder = ensureReceivedFolder(requester, owner);
    const copy = cloneDocumentForRequester(source, request, folder.id);
    if (request.sourceDocumentType === "planAction") requester.plans.push(copy);
    else requester.documents.push(copy);
    request.status = "approved";
    request.resolvedAt = new Date().toISOString();
    request.copiedDocumentId = copy.id;
    recordActivity("Forneceu cópia", `${owner.name || owner.email} forneceu cópia de ${request.sourceTitle} para ${request.requesterName || request.requesterEmail}.`, { profile: owner });
    saveApp({ fullSave: true });
    renderCrewWorkflow();
    showToast("Cópia fornecida.", "success");
  }

  function approveAllCopyRequests(requesterEmail) {
    incomingCopyRequests()
      .filter(request => normalizeEmail(request.requesterEmail) === normalizeEmail(requesterEmail))
      .forEach(request => approveCopyRequest(request.id));
    recordActivity("Forneceu tudo", `Forneceu todas as cópias pendentes para ${requesterEmail}.`);
  }

  function findDocument(profile, documentId, type) {
    if (!profile) return null;
    if (type === "planAction") return (profile.plans || []).find(plan => plan.id === documentId) || null;
    return (profile.documents || []).find(doc => doc.id === documentId && doc.type === type) || null;
  }

  function ensureReceivedFolder(profile, owner) {
    const name = "Recebidos de Companheiros de Tripulação";
    let folder = (profile.folders || []).find(item => normalizeText(item.name) === normalizeText(name));
    if (!folder) {
      folder = { id: createId(), name, color: "#0891b2", isDefault: false, hidden: false, createdBy: normalizeEmail(profile.email), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      profile.folders.push(folder);
    }
    return folder;
  }

  function cloneDocumentForRequester(source, request, folderId) {
    const copy = JSON.parse(JSON.stringify(source));
    copy.id = createId();
    copy.title = `${source.title || request.sourceTitle} (cópia)`;
    copy.folderId = folderId;
    copy.createdBy = normalizeEmail(request.requesterEmail);
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = copy.createdAt;
    copy.copiedFrom = { ownerEmail: request.ownerEmail, ownerName: request.ownerName, originalDocumentId: request.sourceDocumentId, copiedAt: copy.createdAt };
    return copy;
  }

  function refreshCrewBadge() {
    const count = incomingCopyRequests().length;
    document.querySelectorAll("#crewUnreadBadge, [data-crew-badge]").forEach(badge => {
      badge.textContent = count ? String(count) : "";
      badge.classList.toggle("hidden", !count);
    });
  }

  function handleCrewWorkflowClick(event) {
    event.stopImmediatePropagation();
    const tabButton = event.target.closest("[data-crew-tab]");
    if (tabButton) {
      state.crewTab = tabButton.dataset.crewTab || "explore";
      state.crewFolderId = "";
      renderCrewWorkflow();
      return;
    }
    const profileButton = event.target.closest("[data-crew-profile]");
    if (profileButton) {
      state.crewTab = "explore";
      state.crewProfileId = profileButton.dataset.crewProfile || "";
      state.crewFolderId = "";
      renderCrewWorkflow();
      return;
    }
    const folderButton = event.target.closest("[data-crew-folder]");
    if (folderButton) {
      state.crewFolderId = folderButton.dataset.crewFolder || "";
      renderCrewWorkflow();
      return;
    }
    const requesterButton = event.target.closest("[data-crew-requester]");
    if (requesterButton) {
      state.crewTab = "received";
      state.crewRequesterEmail = requesterButton.dataset.crewRequester || "";
      renderCrewWorkflow();
      return;
    }
    const requestButton = event.target.closest("[data-copy-request]");
    if (requestButton) return createCopyRequest(requestButton.dataset.copyRequest, requestButton.dataset.docType);
    const approveButton = event.target.closest("[data-copy-approve]");
    if (approveButton) return approveCopyRequest(approveButton.dataset.copyApprove);
    const approveAllButton = event.target.closest("[data-copy-approve-all]");
    if (approveAllButton) return approveAllCopyRequests(approveAllButton.dataset.copyApproveAll);
    const rejectButton = event.target.closest("[data-copy-reject]");
    if (rejectButton) return rejectCopyRequest(rejectButton.dataset.copyReject);
  }

  function renderCrewWorkflow() {
    const screen = document.getElementById("crewScreen");
    if (!screen) return;
    const pendingCount = incomingCopyRequests().length;
    const tab = ["explore", "received", "mine"].includes(state.crewTab) ? state.crewTab : "explore";
    state.crewTab = tab;
    screen.innerHTML = `
      <section class="crew-workflow-root">
        <header class="crew-workflow-hero">
          <div><p class="section-kicker">Companheiros de Tripulação</p><h1>Solicitar e fornecer cópias</h1><p>Explore documentos de outros perfis, solicite uma cópia e aguarde a autorização do dono.</p></div>
          ${pendingCount ? `<span class="crew-alert">${pendingCount} solicitação(ões) recebida(s)</span>` : ""}
        </header>
        <nav class="crew-tabs" aria-label="Áreas de Companheiros">
          ${renderCrewTabButton("explore", "Explorar perfis", 0)}
          ${renderCrewTabButton("received", "Solicitações recebidas", pendingCount)}
          ${renderCrewTabButton("mine", "Minhas solicitações", myCopyRequests().length)}
        </nav>
        ${tab === "received" ? renderReceivedCopyRequests() : tab === "mine" ? renderMyCopyRequests() : renderCrewExploreProfiles()}
      </section>`;
    recordActivity("Abriu Companheiros de Tripulação", "Visualizou o sistema de solicitação de cópias.");
    refreshCrewBadge();
  }

  function renderCrewTabButton(id, label, count) {
    return `<button type="button" class="crew-tab ${state.crewTab === id ? "is-active" : ""}" data-crew-tab="${escapeAttr(id)}">${escapeHtml(label)}${count ? `<span>${count}</span>` : ""}</button>`;
  }

  function renderCrewExploreProfiles() {
    const profiles = getCrewProfiles().filter(profile => !isCurrentUserCrewProfile(profile));
    if (!profiles.some(profile => profile.id === state.crewProfileId)) {
      state.crewProfileId = profiles[0]?.id || "";
      state.crewFolderId = "";
    }
    const selected = profiles.find(profile => profile.id === state.crewProfileId) || null;
    return `
      <section class="crew-workflow-layout">
        <aside class="crew-workflow-profiles">
          <div class="crew-panel-head"><div><h2>Explorar perfis</h2><p>Escolha um companheiro para ver pastas e pedir uma cópia.</p></div></div>
          ${profiles.map(profile => renderCrewProfileCard(profile)).join("") || `<div class="empty-state">Nenhum perfil disponível para explorar.</div>`}
        </aside>
        <main class="crew-workflow-detail">
          ${selected ? renderCrewProfileDetail(selected) : `<div class="empty-state">Selecione um perfil.</div>`}
        </main>
      </section>`;
  }

  function getCrewProfiles() {
    const app = appState();
    const fullProfiles = app?.profiles || [];
    const directory = typeof SATS.core.getVisibleTeamProfiles === "function"
      ? SATS.core.getVisibleTeamProfiles()
      : fullProfiles;
    const byEmail = new Map();
    [...directory, ...fullProfiles].forEach(profile => {
      if (!profile?.email) return;
      const key = normalizeEmail(profile.email);
      const full = fullProfiles.find(item => normalizeEmail(item.email) === key) || profile;
      byEmail.set(key, {
        id: full.id || profile.id || profile.userId || key,
        profileId: full.id || profile.id || "",
        userId: full.userId || profile.userId || "",
        name: full.name || profile.name,
        email: full.email || profile.email,
        company: full.company || profile.company,
        avatarPhoto: full.avatarPhoto || profile.avatarPhoto,
        avatarColor: full.avatarColor || profile.avatarColor,
        folderCount: getCrewFolders(full).length
      });
    });
    return Array.from(byEmail.values())
      .sort((a, b) => String(a.name).localeCompare(String(b.name), "pt-BR"));
  }

  function renderCrewProfileCard(profile) {
    const pendingFromThisUser = incomingCopyRequests().filter(request => normalizeEmail(request.requesterEmail) === normalizeEmail(profile.email)).length;
    return `
      <button type="button" class="crew-workflow-profile ${profile.id === state.crewProfileId ? "is-active" : ""} ${pendingFromThisUser ? "has-request" : ""}" data-crew-profile="${escapeAttr(profile.id)}">
        ${avatarMarkup(profile)}
        <span><strong>${escapeHtml(profile.name || profile.email)}</strong><small>${escapeHtml(profile.email || "sem e-mail")} • ${profile.folderCount || 0} pasta(s)</small></span>
        ${pendingFromThisUser ? `<b>${pendingFromThisUser}</b>` : `<em>Ver pastas</em>`}
      </button>`;
  }

  function renderCrewProfileDetail(profile) {
    const sourceProfile = getProfileByCrewRef(profile.id, profile.email);
    const folders = getCrewFolders(sourceProfile);
    if (!state.crewFolderId || !folders.some(folder => folder.id === state.crewFolderId)) state.crewFolderId = folders[0]?.id || "";
    const folder = folders.find(item => item.id === state.crewFolderId) || null;
    const docs = folder ? getCrewDocuments(sourceProfile, folder.id) : [];
    if (sourceProfile) recordActivity("Visualizou perfil da tripulação", `Visualizou ${sourceProfile.name || sourceProfile.email}.`, { profile: sourceProfile });
    return `
      <section class="crew-browser">
        <div class="crew-browser-head">
          <div><h2>Documentos de ${escapeHtml(profile.name || profile.email)}</h2><p>Visualização somente leitura. Para editar, solicite uma cópia.</p></div>
        </div>
        <div class="crew-folder-tabs">${folders.map(item => `<button type="button" class="${item.id === folder?.id ? "is-active" : ""}" data-crew-folder="${escapeAttr(item.id)}">${escapeHtml(item.name)}</button>`).join("") || `<span>Nenhuma pasta disponível.</span>`}</div>
        <div class="crew-documents">
          ${docs.length ? docs.map(doc => renderCrewDocumentCard(doc)).join("") : `<div class="empty-state">Nenhum documento nesta pasta.</div>`}
        </div>
      </section>`;
  }

  function renderCrewDocumentCard(doc) {
    const duplicate = hasPendingCopyRequest(doc.id, doc.type);
    return `
      <article class="crew-document-card">
        <span>${escapeHtml(documentTypeLabel(doc.type))}</span>
        <strong>${escapeHtml(doc.title)}</strong>
        <small>${escapeHtml(doc.subtitle || "")}</small>
        <p>${escapeHtml(doc.summary || "Documento disponível somente para solicitação de cópia.")}</p>
        <button class="button primary" type="button" data-copy-request="${escapeAttr(doc.id)}" data-doc-type="${escapeAttr(doc.type)}" ${duplicate ? "disabled" : ""}>${duplicate ? "Solicitação enviada" : "Solicitar Cópia"}</button>
      </article>`;
  }

  function renderReceivedCopyRequests() {
    const requests = incomingCopyRequests();
    const groups = groupRequestsByRequester(requests);
    if (!groups.length) state.crewRequesterEmail = "";
    if (groups.length && !groups.some(group => normalizeEmail(group.email) === normalizeEmail(state.crewRequesterEmail))) {
      state.crewRequesterEmail = groups[0].email;
    }
    const selected = groups.find(group => normalizeEmail(group.email) === normalizeEmail(state.crewRequesterEmail)) || null;
    return `
      <section class="crew-workflow-layout">
        <aside class="crew-workflow-profiles crew-request-groups">
          <div class="crew-panel-head"><div><h2>Solicitações recebidas</h2><p>Aprove ou recuse pedidos feitos aos seus documentos.</p></div></div>
          ${groups.map(group => `
            <button type="button" class="crew-workflow-profile ${normalizeEmail(group.email) === normalizeEmail(state.crewRequesterEmail) ? "is-active" : ""} has-request" data-crew-requester="${escapeAttr(group.email)}">
              ${avatarMarkup(group.profile)}
              <span><strong>${escapeHtml(group.name || group.email)}</strong><small>${group.requests.length} documento(s) solicitado(s)</small></span>
              <b>${group.requests.length}</b>
            </button>`).join("") || `<div class="empty-state">Nenhuma solicitação pendente recebida.</div>`}
        </aside>
        <main class="crew-workflow-detail">
          ${selected ? renderRequesterRequestsPanel(selected) : `<div class="empty-state">Sem solicitações pendentes.</div>`}
        </main>
      </section>`;
  }

  function renderRequesterRequestsPanel(group) {
    return `
      <section class="crew-request-panel">
        <header>
          <div><h2>${escapeHtml(group.name || group.email)} solicitou ${group.requests.length} documento(s)</h2><p>Autorize apenas cópias. O original permanece protegido no seu perfil.</p></div>
          <button class="button primary" type="button" data-copy-approve-all="${escapeAttr(group.email)}">Fornecer Tudo</button>
        </header>
        ${group.requests.map(request => renderRequestCard(request, true)).join("")}
      </section>`;
  }

  function renderMyCopyRequests() {
    const requests = myCopyRequests();
    return `
      <section class="crew-request-panel">
        <header><div><h2>Minhas solicitações</h2><p>Acompanhe o que você pediu aos companheiros.</p></div></header>
        ${requests.map(request => renderRequestCard(request, false)).join("") || `<div class="empty-state">Você ainda não solicitou cópias.</div>`}
      </section>`;
  }

  function renderRequestCard(request, ownerView) {
    const title = request.sourceDocumentTitle || request.sourceTitle || "Documento";
    const status = copyRequestStatusLabel(request.status);
    return `
      <article class="crew-request-card">
        <div>
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(documentTypeLabel(request.sourceDocumentType))} • ${escapeHtml(request.sourceFolderName || "Pasta não informada")} • ${escapeHtml(formatDateTime(request.createdAt))}</span>
          ${ownerView ? `<small>Solicitante: ${escapeHtml(request.requesterName || request.requesterEmail)}</small>` : `<small>Dono: ${escapeHtml(request.ownerName || request.ownerEmail)} • ${escapeHtml(status.text)}</small>`}
          ${!ownerView && request.status === "approved" ? `<em>Disponível em "${escapeHtml(CREW_RECEIVED_FOLDER_NAME)}".</em>` : ""}
        </div>
        <span class="crew-status-badge ${escapeAttr(status.className)}">${escapeHtml(status.text)}</span>
        ${ownerView ? `<div class="crew-actions"><button class="button primary" type="button" data-copy-approve="${escapeAttr(request.id)}">Fornecer Cópia</button><button class="button ghost danger" type="button" data-copy-reject="${escapeAttr(request.id)}">Recusar</button></div>` : ""}
      </article>`;
  }

  function groupRequestsByRequester(requests) {
    const groups = new Map();
    requests.forEach(request => {
      const key = normalizeEmail(request.requesterEmail);
      if (!groups.has(key)) {
        const profile = getProfileByCrewRef(request.requesterProfileId, request.requesterEmail);
        groups.set(key, { email: key, name: request.requesterName || profile?.name || key, profile, requests: [] });
      }
      groups.get(key).requests.push(request);
    });
    return Array.from(groups.values()).sort((a, b) => String(a.name).localeCompare(String(b.name), "pt-BR"));
  }

  function copyRequestStatusLabel(status) {
    if (status === "approved") return { text: "fornecida", className: "is-approved" };
    if (status === "rejected") return { text: "recusada", className: "is-rejected" };
    if (status === "cancelled") return { text: "cancelada", className: "is-cancelled" };
    return { text: "pendente", className: "is-pending" };
  }

  function getProfileByCrewRef(id, email) {
    const normalizedEmail = normalizeEmail(email || "");
    return (appState()?.profiles || []).find(profile => {
      if (id && (String(profile.id) === String(id) || String(profile.userId || "") === String(id))) return true;
      return normalizedEmail && normalizeEmail(profile.email || profile.ownerEmail || profile.createdBy || "") === normalizedEmail;
    }) || null;
  }

  function isCurrentUserCrewProfile(profile) {
    const email = normalizeEmail(currentUser()?.email || "");
    return !!email && normalizeEmail(profile?.email || "") === email;
  }

  function getCrewFolders(profile) {
    if (!profile) return [];
    return getFoldersFromProfile(profile)
      .filter(folder => !folder.hidden && !folder.isTrash)
      .sort((a, b) => (a.isDefault ? -1 : b.isDefault ? 1 : String(a.name).localeCompare(String(b.name), "pt-BR")));
  }

  function getCrewDocuments(profile, folderId) {
    if (!profile) return [];
    const folder = getCrewFolders(profile).find(item => item.id === folderId) || { id: folderId };
    const plans = (profile.plans || [])
      .filter(plan => !plan.deleted && planBelongsToFolder(plan, folder))
      .map(plan => ({ id: plan.id, type: "planAction", title: plan.title || "Plano de Ação", subtitle: plan.company || plan.documentType || "", summary: `${(plan.data?.actions || []).length || 0} ação(ões)` }));
    const docs = (profile.documents || [])
      .filter(doc => ["checklist", "textDocument"].includes(doc.type) && documentBelongsToFolder(doc, folder))
      .map(doc => ({ id: doc.id, type: doc.type, title: doc.title, subtitle: doc.type === "checklist" ? "Checklist PGR" : "Documento de texto", summary: doc.type === "checklist" ? `${Object.keys(doc.checklistData?.selectedItems || {}).length} item(ns) marcado(s)` : String(doc.content || "").slice(0, 120) }));
    return [...plans, ...docs];
  }

  function copyRequests() {
    const app = appState();
    if (!app) return [];
    const combined = [
      ...(Array.isArray(app.copyRequests) ? app.copyRequests : []),
      ...(Array.isArray(app.crewCopyRequests) ? app.crewCopyRequests : [])
    ];
    const seen = new Set();
    app.copyRequests = combined
      .filter(Boolean)
      .filter(request => {
        const key = request.id || [request.requesterEmail, request.ownerEmail, request.sourceDocumentId, request.createdAt].join("|");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map(request => ({
        ...request,
        requesterEmail: normalizeEmail(request.requesterEmail || ""),
        ownerEmail: normalizeEmail(request.ownerEmail || ""),
        sourceDocumentTitle: request.sourceDocumentTitle || request.sourceTitle || "Documento",
        sourceTitle: request.sourceDocumentTitle || request.sourceTitle || "Documento",
        status: ["pending", "approved", "rejected", "cancelled"].includes(request.status) ? request.status : "pending"
      }));
    app.crewCopyRequests = app.copyRequests;
    return app.copyRequests;
  }

  function incomingCopyRequests() {
    const email = normalizeEmail(currentUser()?.email || "");
    return copyRequests().filter(request => normalizeEmail(request.ownerEmail) === email && request.status === "pending");
  }

  function myCopyRequests() {
    const email = normalizeEmail(currentUser()?.email || "");
    return copyRequests().filter(request => normalizeEmail(request.requesterEmail) === email);
  }

  function hasPendingCopyRequest(documentId, type) {
    const email = normalizeEmail(currentUser()?.email || "");
    const owner = getCrewProfiles().find(profile => profile.id === state.crewProfileId);
    return copyRequests().some(request =>
      request.status === "pending"
      && request.sourceDocumentId === documentId
      && request.sourceDocumentType === type
      && normalizeEmail(request.requesterEmail) === email
      && (!owner || normalizeEmail(request.ownerEmail) === normalizeEmail(owner.email))
    );
  }

  function createCopyRequest(documentId, type) {
    const owner = getCrewProfiles().find(profile => profile.id === state.crewProfileId);
    const requester = getEuTecnicoWriteProfile() || getOwnProfile(false);
    if (!owner || !requester) return showToast("Não foi possível localizar os perfis da solicitação.", "warning");
    const ownerProfile = getProfileByCrewRef(owner.id, owner.email);
    const requesterEmail = normalizeEmail(currentUser()?.email || requester.email || "");
    const ownerEmail = normalizeEmail(ownerProfile?.email || owner.email || "");
    if (!ownerProfile || !ownerEmail || !requesterEmail) return showToast("Perfil de origem ou destino sem e-mail vinculado.", "warning");
    if (ownerEmail === requesterEmail) return showToast("Você não precisa solicitar cópia dos seus próprios documentos.", "info");
    const source = findDocument(ownerProfile, documentId, type);
    if (!source) return showToast("Documento não encontrado.", "warning");
    const folder = getCrewFolders(ownerProfile).find(item => item.id === (source.folderId || DEFAULT_WORKFLOW_FOLDER_ID)) || null;
    const duplicate = copyRequests().some(request =>
      request.status === "pending"
      && request.sourceDocumentId === documentId
      && request.sourceDocumentType === type
      && normalizeEmail(request.requesterEmail) === requesterEmail
      && normalizeEmail(request.ownerEmail) === ownerEmail
    );
    if (duplicate) return showToast("Você já solicitou cópia deste documento.", "warning");
    copyRequests().unshift({
      id: createId(),
      requesterEmail,
      requesterName: requester.name || currentUser()?.email || "",
      requesterProfileId: requester.id || "",
      ownerEmail,
      ownerName: ownerProfile.name || owner.name || owner.email,
      ownerProfileId: ownerProfile.id || owner.id || "",
      sourceFolderId: source.folderId || DEFAULT_WORKFLOW_FOLDER_ID,
      sourceFolderName: folderDisplayName(ownerProfile, folder),
      sourceDocumentId: documentId,
      sourceDocumentType: type,
      sourceDocumentTitle: source.title || "Documento",
      sourceTitle: source.title || "Documento",
      status: "pending",
      createdAt: new Date().toISOString(),
      resolvedAt: null,
      resolvedBy: null
    });
    recordActivity("Solicitou cópia", `${requester.name || requester.email} solicitou cópia de ${source.title}.`, { profile: requester });
    saveApp({ fullSave: true });
    renderCrewWorkflow();
    showToast("Solicitação de cópia enviada.", "success");
  }

  function approveCopyRequest(requestId, options = {}) {
    const request = copyRequests().find(item => item.id === requestId && item.status === "pending");
    if (!request) return null;
    if (!isCurrentUserRequestOwner(request)) {
      if (!options.silent) showToast("Apenas o dono do documento pode fornecer esta cópia.", "warning");
      return null;
    }
    const owner = getProfileByCrewRef(request.ownerProfileId, request.ownerEmail);
    const requester = getProfileByCrewRef(request.requesterProfileId, request.requesterEmail);
    if (!owner || !requester) {
      if (!options.silent) showToast("Perfil de origem ou destino não encontrado.", "warning");
      return null;
    }
    owner.plans = Array.isArray(owner.plans) ? owner.plans : [];
    owner.documents = Array.isArray(owner.documents) ? owner.documents : [];
    requester.plans = Array.isArray(requester.plans) ? requester.plans : [];
    requester.documents = Array.isArray(requester.documents) ? requester.documents : [];
    const source = findDocument(owner, request.sourceDocumentId, request.sourceDocumentType);
    if (!source) {
      if (!options.silent) showToast("Documento original não foi encontrado.", "warning");
      return null;
    }
    const folder = ensureReceivedFolder(requester, request);
    const copy = cloneDocumentForRequester(source, request, folder.id);
    if (request.sourceDocumentType === "planAction") requester.plans.push(copy);
    else requester.documents.push(copy);
    request.status = "approved";
    request.resolvedAt = new Date().toISOString();
    request.resolvedBy = currentUser()?.email || owner.email || "";
    request.copiedDocumentId = copy.id;
    recordActivity("Forneceu cópia", `${owner.name || owner.email} forneceu cópia de ${request.sourceDocumentTitle || request.sourceTitle} para ${request.requesterName || request.requesterEmail}.`, { profile: owner });
    recordActivity("Documento recebido foi criado", `${copy.title || "Documento"} foi copiado para ${request.requesterName || request.requesterEmail}.`, { profile: requester });
    if (!options.silent) {
      saveApp({ fullSave: true });
      renderCrewWorkflow();
      showToast("Cópia fornecida.", "success");
    }
    return copy;
  }

  function approveAllCopyRequests(requesterEmail) {
    let approved = 0;
    incomingCopyRequests()
      .filter(request => normalizeEmail(request.requesterEmail) === normalizeEmail(requesterEmail))
      .forEach(request => {
        const copy = approveCopyRequest(request.id, { silent: true });
        if (copy) approved += 1;
      });
    recordActivity("Forneceu tudo", `Forneceu ${approved} cópia(s) pendente(s) para ${requesterEmail}.`);
    saveApp({ fullSave: true });
    renderCrewWorkflow();
    showToast(approved ? `${approved} cópia(s) fornecida(s).` : "Nenhuma cópia foi fornecida.", approved ? "success" : "warning");
  }

  function rejectCopyRequest(requestId) {
    const request = copyRequests().find(item => item.id === requestId && item.status === "pending");
    if (!request) return;
    if (!isCurrentUserRequestOwner(request)) return showToast("Apenas o dono do documento pode recusar esta solicitação.", "warning");
    request.status = "rejected";
    request.resolvedAt = new Date().toISOString();
    request.resolvedBy = currentUser()?.email || request.ownerEmail || "";
    recordActivity("Recusou solicitação de cópia", `${request.ownerName || request.ownerEmail} recusou ${request.sourceDocumentTitle || request.sourceTitle}.`);
    saveApp({ fullSave: true });
    renderCrewWorkflow();
    showToast("Solicitação recusada.", "success");
  }

  function isCurrentUserRequestOwner(request) {
    const userEmail = normalizeEmail(currentUser()?.email || "");
    const ownProfile = getEuTecnicoWriteProfile() || getOwnProfile(false);
    return (userEmail && normalizeEmail(request.ownerEmail) === userEmail)
      || (ownProfile?.id && String(request.ownerProfileId || "") === String(ownProfile.id));
  }

  function findDocument(profile, documentId, type) {
    if (!profile) return null;
    if (type === "planAction") return (profile.plans || []).find(plan => plan.id === documentId) || null;
    return (profile.documents || []).find(doc => doc.id === documentId && doc.type === type) || null;
  }

  function ensureReceivedFolder(profile, request) {
    profile.folders = Array.isArray(profile.folders) ? profile.folders : [];
    let folder = profile.folders.find(item => normalizeText(item.name) === normalizeText(CREW_RECEIVED_FOLDER_NAME));
    if (!folder) {
      const now = new Date().toISOString();
      folder = {
        id: createId(),
        name: CREW_RECEIVED_FOLDER_NAME,
        color: "#0891b2",
        isDefault: false,
        hidden: false,
        createdBy: normalizeEmail(request.requesterEmail || profile.email),
        ownerEmail: normalizeEmail(request.requesterEmail || profile.email),
        ownerProfileId: profile.id || request.requesterProfileId || "",
        ownerName: profile.name || request.requesterName || "",
        createdAt: now,
        updatedAt: now
      };
      profile.folders.push(folder);
    }
    return folder;
  }

  function cloneDocumentForRequester(source, request, folderId) {
    const copy = JSON.parse(JSON.stringify(source));
    const now = new Date().toISOString();
    copy.id = createId();
    copy.title = `${source.title || request.sourceDocumentTitle || request.sourceTitle || "Documento"} (cópia)`;
    copy.folderId = folderId;
    copy.createdBy = normalizeEmail(request.requesterEmail);
    copy.ownerEmail = normalizeEmail(request.requesterEmail);
    copy.userEmail = normalizeEmail(request.requesterEmail);
    copy.profileId = request.requesterProfileId || "";
    copy.ownerProfileId = request.requesterProfileId || "";
    copy.ownerName = request.requesterName || "";
    copy.createdAt = now;
    copy.updatedAt = now;
    copy.deleted = false;
    copy.deletedAt = "";
    copy.copiedFrom = {
      ownerEmail: request.ownerEmail,
      ownerName: request.ownerName,
      originalDocumentId: request.sourceDocumentId,
      originalTitle: request.sourceDocumentTitle || request.sourceTitle || source.title || "",
      copiedAt: now
    };
    return copy;
  }

  /* Phase 4 - Eu Tecnico document organization.
     These overrides keep the legacy profile/folder source and add a richer folder workspace. */

  function renderEuTecnicoWorkflow(renderKey = getEuTecnicoRenderKey()) {
    const screen = document.getElementById("euTecnicoScreen");
    if (!screen) return;
    const folderContext = getTechnicianFoldersForCurrentUser();
    const profile = folderContext.profile;
    const allFolders = folderContext.folders || [];
    const folderList = allFolders.filter(item => !item.isTrash);
    const query = normalizeText(state.euSearch);
    const filteredFolders = query ? folderList.filter(item => normalizeText(`${item.name} ${profile?.company || ""}`).includes(query)) : folderList;
    const folder = state.euTool === "trash"
      ? createTrashWorkflowFolder()
      : getSelectedFolder(profile, folderList);
    const recentDocuments = profile ? getRecentEuTecnicoDocuments(profile, 5) : [];

    screen.innerHTML = `
      <section class="eu-workflow-root" data-render-key="${escapeAttr(renderKey)}">
        <aside class="eu-workflow-sidebar">
          <button type="button" class="${state.euTool === "folder" ? "is-active" : ""}" data-eu-wf="folder">${icon("folder")}<span>Minhas Pastas</span></button>
          <button type="button" class="${state.euTool === "planForm" ? "is-active" : ""}" data-eu-wf="new-plan">${icon("clipboard")}<span>Criar Plano de Acao</span></button>
          <button type="button" class="${state.euTool === "textForm" ? "is-active" : ""}" data-eu-wf="new-text">${icon("text")}<span>Criar documento de texto</span></button>
          <button type="button" class="${state.euTool === "checklist" || state.euTool === "checklistForm" ? "is-active" : ""}" data-eu-wf="checklist">${icon("checklist")}<span>Checklist</span></button>
          <button type="button" class="${state.euTool === "trash" ? "is-active" : ""}" data-eu-wf="trash">${icon("text")}<span>Lixeira</span><em>${getFolderDocumentCount(profile, TRASH_WORKFLOW_FOLDER_ID)}</em></button>
          <div class="eu-workflow-sidebar-spacer"></div>
        </aside>
        <main class="eu-workflow-main">
          <header class="eu-workflow-header">
            <div>
              <p class="section-kicker">Eu Tecnico</p>
              <h1>Suas pastas e documentos</h1>
              <p>Somente pastas vinculadas ao usuario logado aparecem aqui.</p>
            </div>
            <div class="eu-workflow-actions">
              <button class="button primary" type="button" data-eu-wf="folder-form">Criar pasta</button>
              <label class="eu-workflow-search">${icon("search")}<input id="euWorkflowSearch" type="search" value="${escapeAttr(state.euSearch)}" placeholder="Pesquisar pasta..."></label>
            </div>
          </header>
          <div class="eu-workflow-quick-actions">
            <button class="button ghost" type="button" data-eu-wf="new-plan">Novo Plano de Acao</button>
            <button class="button ghost" type="button" data-eu-checklist-new>Novo Checklist</button>
            <button class="button ghost" type="button" data-eu-wf="new-text">Novo Documento de Texto</button>
          </div>
          <section class="eu-workflow-layout">
            <aside class="eu-workflow-folders">
              <div class="eu-workflow-panel-head"><strong>Pastas</strong><span>${filteredFolders.length}</span></div>
              ${filteredFolders.length ? filteredFolders.map(item => `
                <button type="button" class="eu-workflow-folder ${state.euTool !== "trash" && item.id === folder?.id ? "is-active" : ""}" data-eu-folder="${escapeAttr(item.id)}">
                  <span class="folder-dot" style="background:${escapeAttr(item.color || "#2563eb")}"></span>
                  <span><strong>${escapeHtml(folderDisplayName(profile, item))}</strong><small>${getFolderDocumentCount(profile, item.id)} documento(s)</small></span>
                </button>`).join("") : `<div class="empty-state">Voce ainda nao criou nenhuma pasta.<br>Clique em Criar pasta para comecar.</div>`}
              ${recentDocuments.length ? renderRecentEuDocuments(recentDocuments) : ""}
            </aside>
            <section class="eu-workflow-content">
              ${renderEuWorkflowContent(profile, folder)}
            </section>
          </section>
        </main>
      </section>`;
  }

  function renderEuWorkflowContent(profile, folder) {
    if (state.euTool === "folderForm") return renderFolderForm();
    if (!profile) {
      return `
        <div class="empty-state">
          Nao foi possivel vincular automaticamente um perfil antigo ao usuario logado.
          <br>Abra com <strong>debugEuTecnico=1</strong> para conferir os perfis encontrados.
        </div>`;
    }
    if (state.euTool === "trash") return renderEuTrash(profile);
    if (!folder) {
      if (state.euTool === "planForm" || state.euTool === "textForm" || state.euTool === "checklistForm") {
        return `<div class="empty-state">Crie uma pasta antes de adicionar documentos.</div>`;
      }
      return `<div class="empty-state">Crie uma pasta para comecar.</div>`;
    }
    if (state.euTool === "folderEdit") return renderEuFolderEditForm(profile, folder);
    if (state.euTool === "documentMove") return renderEuDocumentMoveForm(profile, folder);
    if (state.euTool === "documentRename") return renderEuDocumentRenameForm(profile, folder);
    if (state.euTool === "bulkMove") return renderEuBulkMoveForm(profile, folder);
    if (state.euTool === "planForm") return renderPlanForm(profile, getWritableFolderForForms(profile, folder));
    if (state.euTool === "textForm") return renderTextDocumentForm(profile, getWritableFolderForForms(profile, folder));
    if (state.euTool === "checklist") return renderChecklistHome(profile, getWritableFolderForForms(profile, folder));
    if (state.euTool === "checklistForm") return renderChecklistHome(profile, getWritableFolderForForms(profile, folder));
    return renderFolderWorkspace(profile, folder);
  }

  function getWritableFolderForForms(profile, folder) {
    if (folder && !folder.isTrash) return folder;
    return getOwnedFolders(profile).find(item => !item.isTrash) || ensureWritableDefaultFolder(profile);
  }

  function getFolderDocumentCount(profile, folderId) {
    return getFolderDocumentsForEuTecnico(folderId, profile).length;
  }

  function getFolderDocumentsForEuTecnico(folderId, profileArg = null) {
    const profile = profileArg || getEuTecnicoWriteProfile();
    if (!profile) return [];
    const folder = folderId === TRASH_WORKFLOW_FOLDER_ID
      ? createTrashWorkflowFolder()
      : (getOwnedFolders(profile).find(item => item.id === folderId) || { id: folderId || DEFAULT_WORKFLOW_FOLDER_ID });
    const inTrash = folder.isTrash || folderId === TRASH_WORKFLOW_FOLDER_ID;
    const planDocs = (profile.plans || [])
      .filter(plan => inTrash ? plan.deleted === true : !plan.deleted && planBelongsToFolder(plan, folder))
      .map(plan => normalizeEuDocument(plan, "planAction", profile));
    const profileDocs = (profile.documents || [])
      .filter(doc => inTrash ? doc.deleted === true : !doc.deleted && documentBelongsToFolder(doc, folder))
      .map(doc => normalizeEuDocument(doc, doc.type || "textDocument", profile));
    return [...planDocs, ...profileDocs];
  }

  function normalizeEuDocument(source, type, profile) {
    const data = source || {};
    const title = data.title || data.name || (type === "checklist" ? "Checklist sem titulo" : type === "planAction" ? "Plano sem titulo" : "Documento sem titulo");
    return {
      id: data.id,
      type,
      title,
      folderId: type === "planAction" ? folderIdForPlan(data) : (data.folderId || DEFAULT_WORKFLOW_FOLDER_ID),
      createdAt: data.createdAt || data.createdDate || "",
      updatedAt: data.updatedAt || data.updatedDate || data.createdAt || "",
      createdBy: data.createdBy || data.ownerEmail || profile?.email || "",
      status: data.status || data.progressStatus || "",
      company: data.company || data.companyName || data.checklistData?.companyName || "",
      observations: data.observations || data.notes || data.generalNotes || data.checklistData?.generalNotes || "",
      content: data.content || data.description || "",
      copiedFrom: data.copiedFrom || null,
      deleted: data.deleted === true,
      deletedAt: data.deletedAt || "",
      deletedFromFolderId: data.deletedFromFolderId || data.originalFolderId || "",
      trashExpiresAt: data.trashExpiresAt || data.expiresAt || "",
      sourceData: data
    };
  }

  function renderFolderWorkspace(profile, folder) {
    if (folder.isTrash) return renderEuTrash(profile);
    const allDocs = getFolderDocumentsForEuTecnico(folder.id, profile);
    const counts = getFolderDocumentCounts(allDocs);
    const visibleDocs = getVisibleFolderDocuments(allDocs);
    const lastUpdated = allDocs.map(doc => doc.updatedAt).filter(Boolean).sort().pop();
    const folderColor = folder.color || "#2563eb";
    return `
      <div class="eu-folder-detail">
        <div class="eu-workflow-folder-head eu-folder-detail-head">
          <div>
            <p class="section-kicker">Pasta aberta</p>
            <h2><span class="folder-dot" style="background:${escapeAttr(folderColor)}"></span>${escapeHtml(folderDisplayName(profile, folder))}</h2>
            <div class="eu-folder-detail-meta">
              <span>${allDocs.length} documento(s)</span>
              <span>Atualizada: ${escapeHtml(formatDateTime(lastUpdated || folder.updatedAt))}</span>
            </div>
          </div>
          <div class="button-row">
            <button class="button ghost" type="button" data-eu-wf="folder">Voltar para pastas</button>
            ${folder.isDefault ? "" : `<button class="button ghost" type="button" data-eu-folder-edit="${escapeAttr(folder.id)}">Editar pasta</button>`}
            ${allDocs.length ? `<button class="button ghost" type="button" data-eu-wf="move-documents">Mover documentos</button>` : ""}
            ${folder.isDefault ? "" : `<button class="button danger" type="button" data-eu-folder-delete="${escapeAttr(folder.id)}">Excluir pasta</button>`}
          </div>
        </div>

        <div class="eu-doc-toolbar">
          <div class="eu-doc-filters">
            ${renderDocFilterButton("all", "Todos", counts.all)}
            ${renderDocFilterButton("planAction", "Planos de Acao", counts.planAction)}
            ${renderDocFilterButton("checklist", "Checklists", counts.checklist)}
            ${renderDocFilterButton("textDocument", "Documentos de Texto", counts.textDocument)}
            ${renderDocFilterButton("received", "Recebidos", counts.received)}
          </div>
          <div class="eu-doc-controls">
            <label class="eu-workflow-search eu-doc-search">${icon("search")}<input id="euFolderDocumentSearch" type="search" value="${escapeAttr(state.folderDocumentSearch)}" placeholder="Pesquisar documentos nesta pasta..."></label>
            <select id="euFolderDocumentSort" aria-label="Ordenar documentos">
              ${renderSortOption("recent", "Mais recentes")}
              ${renderSortOption("oldest", "Mais antigos")}
              ${renderSortOption("az", "Nome A-Z")}
              ${renderSortOption("za", "Nome Z-A")}
              ${renderSortOption("type", "Tipo")}
            </select>
          </div>
        </div>

        ${visibleDocs.length ? `
          <div class="eu-workflow-doc-grid">
            ${visibleDocs.map(doc => renderDocumentCard(doc, profile, folder)).join("")}
          </div>
        ` : `<div class="empty-state">Esta pasta ainda nao possui documentos.<br>Crie um Plano de Acao, Checklist ou Documento de Texto para comecar.</div>`}
      </div>`;
  }

  function renderDocFilterButton(id, label, count) {
    return `<button type="button" class="eu-doc-filter ${state.folderDocumentFilter === id ? "is-active" : ""}" data-eu-doc-filter="${escapeAttr(id)}">${escapeHtml(label)} <span>${Number(count || 0)}</span></button>`;
  }

  function renderSortOption(value, label) {
    return `<option value="${escapeAttr(value)}" ${state.folderDocumentSort === value ? "selected" : ""}>${escapeHtml(label)}</option>`;
  }

  function getFolderDocumentCounts(documents) {
    return {
      all: documents.length,
      planAction: documents.filter(doc => doc.type === "planAction").length,
      checklist: documents.filter(doc => doc.type === "checklist").length,
      textDocument: documents.filter(doc => doc.type === "textDocument").length,
      received: documents.filter(doc => !!doc.copiedFrom).length
    };
  }

  function getVisibleFolderDocuments(documents) {
    const filter = state.folderDocumentFilter || "all";
    const query = normalizeText(state.folderDocumentSearch || "");
    let result = documents.filter(doc => {
      if (filter === "received") return !!doc.copiedFrom;
      if (filter !== "all") return doc.type === filter;
      return true;
    });
    if (query) {
      result = result.filter(doc => normalizeText([
        doc.title,
        documentTypeLabel(doc.type),
        doc.company,
        doc.status,
        doc.observations,
        doc.content,
        doc.createdAt,
        doc.updatedAt
      ].join(" ")).includes(query));
    }
    const sorter = state.folderDocumentSort || "recent";
    return result.sort((a, b) => {
      if (sorter === "oldest") return String(a.updatedAt || a.createdAt || "").localeCompare(String(b.updatedAt || b.createdAt || ""));
      if (sorter === "az") return String(a.title || "").localeCompare(String(b.title || ""), "pt-BR");
      if (sorter === "za") return String(b.title || "").localeCompare(String(a.title || ""), "pt-BR");
      if (sorter === "type") return documentTypeLabel(a.type).localeCompare(documentTypeLabel(b.type), "pt-BR") || String(a.title || "").localeCompare(String(b.title || ""), "pt-BR");
      return String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || ""));
    });
  }

  function renderDocumentCard(doc, profile = null, currentFolder = null) {
    const iconName = doc.type === "planAction" ? "clipboard" : doc.type === "checklist" ? "checklist" : "text";
    return `
      <article class="eu-workflow-doc-card">
        <div class="eu-doc-card-head">
          <span class="eu-doc-icon">${icon(iconName)}</span>
          <div>
            <span class="doc-type">${escapeHtml(documentTypeLabel(doc.type))}${doc.copiedFrom ? " / Recebido" : ""}</span>
            <strong>${escapeHtml(doc.title || "Sem titulo")}</strong>
          </div>
        </div>
        <div class="eu-doc-meta">
          <span>Criado: ${escapeHtml(formatDateTime(doc.createdAt))}</span>
          <span>Atualizado: ${escapeHtml(formatDateTime(doc.updatedAt))}</span>
          ${doc.status ? `<span>Status: ${escapeHtml(doc.status)}</span>` : ""}
        </div>
        ${doc.copiedFrom ? `<small class="eu-doc-origin">Recebido de ${escapeHtml(doc.copiedFrom.ownerName || doc.copiedFrom.ownerEmail || "Companheiros")} / Copia de ${escapeHtml(doc.copiedFrom.originalTitle || doc.title || "documento")}</small>` : ""}
        <div class="doc-actions">
          <button class="button ghost" type="button" data-eu-doc-open="${escapeAttr(doc.id)}" data-doc-type="${escapeAttr(doc.type)}">Abrir</button>
          <button class="button ghost" type="button" data-eu-doc-duplicate-any="${escapeAttr(doc.id)}" data-doc-type="${escapeAttr(doc.type)}">Duplicar</button>
          <button class="button ghost" type="button" data-eu-doc-move="${escapeAttr(doc.id)}" data-doc-type="${escapeAttr(doc.type)}">Mover</button>
          <button class="button ghost" type="button" data-eu-doc-rename="${escapeAttr(doc.id)}" data-doc-type="${escapeAttr(doc.type)}">Renomear</button>
          ${doc.type === "checklist" ? `<button class="button primary" type="button" data-eu-checklist-generate="${escapeAttr(doc.id)}">Gerar Word</button>` : ""}
          <button class="button danger" type="button" data-eu-doc-delete-any="${escapeAttr(doc.id)}" data-doc-type="${escapeAttr(doc.type)}">Excluir</button>
        </div>
      </article>`;
  }

  function renderRecentEuDocuments(documents) {
    return `
      <section class="eu-recent-docs">
        <div class="eu-workflow-panel-head"><strong>Documentos recentes</strong><span>${documents.length}</span></div>
        ${documents.map(doc => `
          <button type="button" class="eu-recent-doc" data-eu-recent-open="${escapeAttr(doc.id)}" data-doc-type="${escapeAttr(doc.type)}">
            <span>${escapeHtml(documentTypeLabel(doc.type))}</span>
            <strong>${escapeHtml(doc.title || "Sem titulo")}</strong>
            <small>${escapeHtml(formatDateTime(doc.updatedAt || doc.createdAt))}</small>
          </button>`).join("")}
      </section>`;
  }

  function getRecentEuTecnicoDocuments(profile, limit = 5) {
    const folderIds = new Set(getOwnedFolders(profile).filter(item => !item.isTrash).map(item => String(item.id)));
    const docs = [
      ...(profile.plans || []).filter(plan => !plan.deleted).map(plan => normalizeEuDocument(plan, "planAction", profile)),
      ...(profile.documents || []).filter(doc => !doc.deleted).map(doc => normalizeEuDocument(doc, doc.type || "textDocument", profile))
    ].filter(doc => folderIds.has(String(doc.folderId || DEFAULT_WORKFLOW_FOLDER_ID)) || isDefaultWorkflowFolder(doc.folderId));
    return docs
      .sort((a, b) => String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || "")))
      .slice(0, limit);
  }

  function renderEuTrash(profile) {
    const docs = getFolderDocumentsForEuTecnico(TRASH_WORKFLOW_FOLDER_ID, profile)
      .sort((a, b) => String(b.deletedAt || "").localeCompare(String(a.deletedAt || "")));
    return `
      <section class="eu-trash-shell">
        <div class="eu-workflow-folder-head">
          <div>
            <p class="section-kicker">Lixeira</p>
            <h2>Documentos excluidos</h2>
            <p>Itens ficam separados por usuario e podem ser restaurados antes da exclusao definitiva.</p>
          </div>
          <button class="button ghost" type="button" data-eu-wf="folder">Voltar para pastas</button>
        </div>
        ${docs.length ? `<div class="eu-trash-list">${docs.map(doc => renderTrashDocumentCard(doc, profile)).join("")}</div>` : `<div class="empty-state">A lixeira esta vazia.</div>`}
      </section>`;
  }

  function renderTrashDocumentCard(doc, profile) {
    const originalFolder = getOwnedFolders(profile).find(folder => folder.id === doc.deletedFromFolderId);
    return `
      <article class="eu-trash-card">
        <div>
          <span class="doc-type">${escapeHtml(documentTypeLabel(doc.type))}</span>
          <strong>${escapeHtml(doc.title || "Sem titulo")}</strong>
          <small>Pasta original: ${escapeHtml(originalFolder ? folderDisplayName(profile, originalFolder) : "Sem pasta")}</small>
          <small>Excluido em: ${escapeHtml(formatDateTime(doc.deletedAt))}</small>
          <small>Tempo restante: ${escapeHtml(formatTrashRemaining(doc.trashExpiresAt))}</small>
        </div>
        <div class="doc-actions">
          <button class="button ghost" type="button" data-eu-trash-restore="${escapeAttr(doc.id)}" data-doc-type="${escapeAttr(doc.type)}">Restaurar</button>
          <button class="button danger" type="button" data-eu-trash-delete="${escapeAttr(doc.id)}" data-doc-type="${escapeAttr(doc.type)}">Excluir definitivamente</button>
        </div>
      </article>`;
  }

  function formatTrashRemaining(value) {
    if (!value) return "sem prazo";
    const diff = new Date(value).getTime() - Date.now();
    if (!Number.isFinite(diff) || diff <= 0) return "expirado";
    const hours = Math.ceil(diff / 3600000);
    return hours > 1 ? `${hours} horas` : "menos de 1 hora";
  }

  function renderEuFolderEditForm(profile, folder) {
    const target = (profile.folders || []).find(item => item.id === (state.editingFolderId || folder.id)) || folder;
    return `
      <form class="workflow-form" data-eu-form="folder-edit">
        <h2>Editar pasta</h2>
        <label>Nome da pasta<input id="euFolderEditNameInput" type="text" value="${escapeAttr(folderDisplayName(profile, target))}" required></label>
        <label>Cor da pasta<input id="euFolderEditColorInput" type="color" value="${escapeAttr(target.color || "#2563eb")}"></label>
        <div class="modal-actions">
          <button class="button ghost" type="button" data-eu-wf="cancel">Cancelar</button>
          <button class="button primary" type="submit">Salvar pasta</button>
        </div>
      </form>`;
  }

  function renderEuDocumentMoveForm(profile, folder) {
    const doc = findEuDocumentByState(profile, state.pendingMoveDocumentId, state.pendingMoveDocumentType);
    const folders = getOwnedFolders(profile).filter(item => !item.isTrash && item.id !== (doc?.folderId || folder?.id));
    return `
      <form class="workflow-form" data-eu-form="document-move">
        <h2>Mover documento</h2>
        <p>${escapeHtml(doc?.title || "Documento selecionado")}</p>
        <label>Pasta de destino<select id="euDocumentMoveTargetInput" required>
          <option value="">Escolha uma pasta</option>
          ${folders.map(item => `<option value="${escapeAttr(item.id)}">${escapeHtml(folderDisplayName(profile, item))}</option>`).join("")}
        </select></label>
        <div class="modal-actions">
          <button class="button ghost" type="button" data-eu-wf="cancel">Cancelar</button>
          <button class="button primary" type="submit">Mover</button>
        </div>
      </form>`;
  }

  function renderEuDocumentRenameForm(profile, folder) {
    const doc = findEuDocumentByState(profile, state.pendingRenameDocumentId, state.pendingRenameDocumentType);
    return `
      <form class="workflow-form" data-eu-form="document-rename">
        <h2>Renomear documento</h2>
        <label>Novo titulo<input id="euDocumentRenameInput" type="text" value="${escapeAttr(doc?.title || "")}" required></label>
        <div class="modal-actions">
          <button class="button ghost" type="button" data-eu-wf="cancel">Cancelar</button>
          <button class="button primary" type="submit">Salvar nome</button>
        </div>
      </form>`;
  }

  function renderEuBulkMoveForm(profile, folder) {
    const docs = getFolderDocumentsForEuTecnico(folder.id, profile);
    const folders = getOwnedFolders(profile).filter(item => !item.isTrash && item.id !== folder.id);
    return `
      <form class="workflow-form" data-eu-form="bulk-move">
        <h2>Mover documentos</h2>
        <p>Esta acao move todos os ${docs.length} documento(s) desta pasta para outra pasta sua.</p>
        <label>Pasta de destino<select id="euBulkMoveTargetInput" required>
          <option value="">Escolha uma pasta</option>
          ${folders.map(item => `<option value="${escapeAttr(item.id)}">${escapeHtml(folderDisplayName(profile, item))}</option>`).join("")}
        </select></label>
        <div class="modal-actions">
          <button class="button ghost" type="button" data-eu-wf="cancel">Cancelar</button>
          <button class="button primary" type="submit">Mover documentos</button>
        </div>
      </form>`;
  }

  function findEuDocumentByState(profile, documentId, type) {
    if (!profile || !documentId) return null;
    if (type === "planAction") {
      const plan = (profile.plans || []).find(item => item.id === documentId);
      return plan ? normalizeEuDocument(plan, "planAction", profile) : null;
    }
    const doc = (profile.documents || []).find(item => item.id === documentId);
    return doc ? normalizeEuDocument(doc, doc.type || type || "textDocument", profile) : null;
  }

  function getRawEuDocument(profile, documentId, type) {
    if (!profile || !documentId) return null;
    if (type === "planAction") return (profile.plans || []).find(item => item.id === documentId) || null;
    return (profile.documents || []).find(item => item.id === documentId) || null;
  }

  function handleGlobalWorkflowInput(event) {
    if (event.target?.id === "euWorkflowSearch") {
      state.euSearch = event.target.value || "";
      renderEuTecnicoWorkflow();
      return;
    }
    if (event.target?.id === "euFolderDocumentSearch") {
      state.folderDocumentSearch = event.target.value || "";
      renderEuTecnicoWorkflow();
      return;
    }
    if (event.target?.id === "euTextTitleInput" || event.target?.id === "euTextEditorInput") {
      markTextDocumentDirty();
      scheduleTextDocumentAutosave(event.target.closest("[data-eu-form='text']"));
      return;
    }
    const item = event.target.closest(".checklist-item");
    if (item && event.target.type === "checkbox") {
      item.classList.toggle("is-checked", event.target.checked);
      recordActivity(event.target.checked ? "Marcou item do checklist" : "Desmarcou item do checklist", item.querySelector(".checklist-item-row strong")?.textContent || "Item do checklist", { profile: getEuTecnicoWriteProfile() });
    }
  }

  function handleGlobalWorkflowChange(event) {
    if (event.target?.id === "checklistFolderFilter") {
      state.checklistFolderFilter = event.target.value || "";
      renderEuTecnicoWorkflow();
      return;
    }
    if (event.target?.id === "euFolderDocumentSort") {
      state.folderDocumentSort = event.target.value || "recent";
      renderEuTecnicoWorkflow();
      return;
    }
    const photoInput = event.target.closest("[data-checklist-photo]");
    if (photoInput) {
      handleChecklistPhotoChange(photoInput);
      return;
    }
    const move = event.target.closest("[data-eu-plan-move]");
    if (move) {
      const targetFolderId = move.value || "";
      const planId = move.dataset.euPlanMove || "";
      move.value = "";
      if (targetFolderId) movePlanAction(planId, targetFolderId);
      return;
    }
    const copy = event.target.closest("[data-eu-plan-copy]");
    if (copy) {
      const targetFolderId = copy.value || "";
      const planId = copy.dataset.euPlanCopy || "";
      copy.value = "";
      if (targetFolderId) copyPlanAction(planId, targetFolderId);
    }
  }

  async function handleEuWorkflowClick(event) {
    event.stopImmediatePropagation();
    const folderButton = event.target.closest("[data-eu-folder]");
    if (folderButton) {
      state.euFolderId = folderButton.dataset.euFolder || "";
      state.euTool = "folder";
      resetDocumentActionState();
      renderEuTecnicoWorkflow();
      return;
    }
    const filterButton = event.target.closest("[data-eu-doc-filter]");
    if (filterButton) {
      state.folderDocumentFilter = filterButton.dataset.euDocFilter || "all";
      renderEuTecnicoWorkflow();
      return;
    }
    const textCommand = event.target.closest("[data-text-command]");
    if (textCommand) {
      runTextDocumentCommand(textCommand.dataset.textCommand || "", textCommand.dataset.value || "");
      return;
    }
    const textTemplate = event.target.closest("[data-text-apply-template]");
    if (textTemplate) {
      applySelectedTextDocumentTemplate();
      return;
    }
    const textSave = event.target.closest("[data-text-save]");
    if (textSave) {
      const form = textSave.closest("[data-eu-form='text']");
      saveTextDocument(form, { close: false });
      return;
    }
    const textExport = event.target.closest("[data-text-export]");
    if (textExport) {
      exportCurrentTextDocumentWord(textExport.closest("[data-eu-form='text']"));
      return;
    }
    const textPrint = event.target.closest("[data-text-print]");
    if (textPrint) {
      printCurrentTextDocument(textPrint.closest("[data-eu-form='text']"));
      return;
    }
    const planSave = event.target.closest("[data-plan-editor-save]");
    if (planSave) {
      saveEuPlanEditor(planSave.closest("[data-eu-form='plan-editor']"), { close: false });
      return;
    }
    const planBack = event.target.closest("[data-plan-editor-back]");
    if (planBack) {
      saveEuPlanEditor(planBack.closest("[data-eu-form='plan-editor']"), { close: true, silent: true });
      return;
    }
    const planExport = event.target.closest("[data-plan-editor-export-word]");
    if (planExport) {
      exportEuPlanWord(planExport.closest("[data-eu-form='plan-editor']"));
      return;
    }
    const planPrint = event.target.closest("[data-plan-editor-print]");
    if (planPrint) {
      printEuPlan(planPrint.closest("[data-eu-form='plan-editor']"));
      return;
    }
    const planAddRow = event.target.closest("[data-plan-row-add]");
    if (planAddRow) {
      addEuPlanRow(planAddRow.dataset.planRowAdd || "actions");
      return;
    }
    const planRemoveRow = event.target.closest("[data-plan-row-remove]");
    if (planRemoveRow) {
      removeEuPlanRow(planRemoveRow.dataset.planRowSection || "actions", planRemoveRow.dataset.planRowRemove || "0");
      return;
    }
    const planTemplateAdd = event.target.closest("[data-plan-template-add]");
    if (planTemplateAdd) {
      applyEuPlanTemplate("add");
      return;
    }
    const planTemplateReplace = event.target.closest("[data-plan-template-replace]");
    if (planTemplateReplace) {
      applyEuPlanTemplate("replace");
      return;
    }
    const planEditorDuplicate = event.target.closest("[data-plan-editor-duplicate]");
    if (planEditorDuplicate) {
      saveEuPlanEditor(planEditorDuplicate.closest("[data-eu-form='plan-editor']"), { silent: true });
      state.euTool = "folder";
      return duplicateEuDocument(state.editingPlanId, "planAction");
    }
    const planEditorMove = event.target.closest("[data-plan-editor-move]");
    if (planEditorMove) {
      saveEuPlanEditor(planEditorMove.closest("[data-eu-form='plan-editor']"), { silent: true });
      state.pendingMoveDocumentId = state.editingPlanId;
      state.pendingMoveDocumentType = "planAction";
      state.editingPlanId = "";
      state.euTool = "documentMove";
      renderEuTecnicoWorkflow();
      return;
    }
    const planEditorDelete = event.target.closest("[data-plan-editor-delete]");
    if (planEditorDelete) {
      saveEuPlanEditor(planEditorDelete.closest("[data-eu-form='plan-editor']"), { silent: true });
      const planId = state.editingPlanId;
      state.editingPlanId = "";
      state.euTool = "folder";
      return trashEuDocument(planId, "planAction");
    }
    const docOpen = event.target.closest("[data-eu-doc-open], [data-eu-recent-open]");
    if (docOpen) {
      recordActivity("Abriu documento no Eu Tecnico", docOpen.dataset.euDocOpen || docOpen.dataset.euRecentOpen || "", { profile: getEuTecnicoWriteProfile() });
      openEuDocument(docOpen.dataset.euDocOpen || docOpen.dataset.euRecentOpen, docOpen.dataset.docType);
      return;
    }
    const docDuplicate = event.target.closest("[data-eu-doc-duplicate-any]");
    if (docDuplicate) return duplicateEuDocument(docDuplicate.dataset.euDocDuplicateAny, docDuplicate.dataset.docType);
    const oldDuplicate = event.target.closest("[data-eu-doc-duplicate]");
    if (oldDuplicate) return duplicateEuDocument(oldDuplicate.dataset.euDocDuplicate, "textDocument");
    const docMove = event.target.closest("[data-eu-doc-move]");
    if (docMove) {
      state.pendingMoveDocumentId = docMove.dataset.euDocMove || "";
      state.pendingMoveDocumentType = docMove.dataset.docType || "";
      state.euTool = "documentMove";
      renderEuTecnicoWorkflow();
      return;
    }
    const docRename = event.target.closest("[data-eu-doc-rename]");
    if (docRename) {
      state.pendingRenameDocumentId = docRename.dataset.euDocRename || "";
      state.pendingRenameDocumentType = docRename.dataset.docType || "";
      state.euTool = "documentRename";
      renderEuTecnicoWorkflow();
      return;
    }
    const docDelete = event.target.closest("[data-eu-doc-delete-any]");
    if (docDelete) return trashEuDocument(docDelete.dataset.euDocDeleteAny, docDelete.dataset.docType);
    const oldDelete = event.target.closest("[data-eu-doc-delete]");
    if (oldDelete) return trashEuDocument(oldDelete.dataset.euDocDelete, "textDocument");
    const restore = event.target.closest("[data-eu-trash-restore]");
    if (restore) return restoreEuDocument(restore.dataset.euTrashRestore, restore.dataset.docType);
    const permanent = event.target.closest("[data-eu-trash-delete]");
    if (permanent) return permanentlyDeleteEuDocument(permanent.dataset.euTrashDelete, permanent.dataset.docType);
    const folderEdit = event.target.closest("[data-eu-folder-edit]");
    if (folderEdit) {
      state.editingFolderId = folderEdit.dataset.euFolderEdit || "";
      state.euTool = "folderEdit";
      renderEuTecnicoWorkflow();
      return;
    }
    const checklistNew = event.target.closest("[data-eu-checklist-new]");
    if (checklistNew) {
      if (!getOwnedFolders(getEuTecnicoWriteProfile()).filter(item => !item.isTrash).length) return showToast("Crie uma pasta antes de adicionar um checklist.", "warning");
      createChecklistPageFromEuTecnico();
      return;
    }
    const checklistGenerate = event.target.closest("[data-eu-checklist-generate]");
    if (checklistGenerate) return generateSavedChecklist(checklistGenerate.dataset.euChecklistGenerate);
    const folderDelete = event.target.closest("[data-eu-folder-delete]");
    if (folderDelete) return deleteEuFolder(folderDelete.dataset.euFolderDelete);
    const planDuplicate = event.target.closest("[data-eu-plan-duplicate]");
    if (planDuplicate) return duplicateEuDocument(planDuplicate.dataset.euPlanDuplicate, "planAction");
    const planDelete = event.target.closest("[data-eu-plan-delete]");
    if (planDelete) return trashEuDocument(planDelete.dataset.euPlanDelete, "planAction");
    const action = event.target.closest("[data-eu-wf]");
    if (!action) return;
    const type = action.dataset.euWf;
    if (type === "folder") { state.euTool = "folder"; resetDocumentActionState(); }
    if (type === "folder-form") state.euTool = "folderForm";
    if (type === "new-plan") { ensureWritableSelection(); state.euTool = "planForm"; }
    if (type === "new-text") { ensureWritableSelection(); state.euTool = "textForm"; state.editingDocumentId = ""; }
    if (type === "checklist") { state.euTool = "checklist"; state.editingDocumentId = ""; }
    if (type === "trash") { state.euTool = "trash"; state.euFolderId = TRASH_WORKFLOW_FOLDER_ID; resetDocumentActionState(); }
    if (type === "move-documents") state.euTool = "bulkMove";
    if (type === "cancel") { state.euTool = "folder"; resetDocumentActionState(); }
    if (type === "save-checklist") return saveChecklist(false);
    renderEuTecnicoWorkflow();
  }

  function ensureWritableSelection() {
    const profile = getEuTecnicoWriteProfile();
    const folders = getOwnedFolders(profile).filter(item => !item.isTrash);
    if (!folders.some(item => item.id === state.euFolderId)) state.euFolderId = folders[0]?.id || "";
  }

  function resetDocumentActionState() {
    state.editingDocumentId = "";
    state.editingFolderId = "";
    state.editingPlanId = "";
    state.pendingMoveDocumentId = "";
    state.pendingMoveDocumentType = "";
    state.pendingRenameDocumentId = "";
    state.pendingRenameDocumentType = "";
  }

  function saveEuFolderEdit(form) {
    const profile = getEuTecnicoWriteProfile();
    const folder = (profile?.folders || []).find(item => item.id === (state.editingFolderId || state.euFolderId));
    if (!profile || !folder || folder.isDefault) return showToast("Esta pasta nao pode ser editada.", "warning");
    const name = getScopedField(form, "#euFolderEditNameInput")?.value.trim();
    const color = getScopedField(form, "#euFolderEditColorInput")?.value || folder.color || "#2563eb";
    if (!name) return showToast("Informe o nome da pasta.", "warning");
    folder.name = name;
    folder.color = color;
    folder.updatedAt = new Date().toISOString();
    state.euFolderId = folder.id;
    state.euTool = "folder";
    recordActivity("Editou pasta", `Editou a pasta ${folder.name}.`, { profile, folder });
    saveApp({ profileId: profile.id });
    showToast("Pasta atualizada.", "success");
    renderEuTecnicoWorkflow();
  }

  function saveEuDocumentMove(form) {
    const targetFolderId = getScopedField(form, "#euDocumentMoveTargetInput")?.value || "";
    moveEuDocument(state.pendingMoveDocumentId, state.pendingMoveDocumentType, targetFolderId);
  }

  function saveEuDocumentRename(form) {
    const title = getScopedField(form, "#euDocumentRenameInput")?.value.trim();
    renameEuDocument(state.pendingRenameDocumentId, state.pendingRenameDocumentType, title);
  }

  function saveEuBulkDocumentMove(form) {
    const profile = getEuTecnicoWriteProfile();
    const targetFolderId = getScopedField(form, "#euBulkMoveTargetInput")?.value || "";
    const currentFolderId = state.euFolderId;
    const targetFolder = getOwnedFolders(profile).find(item => item.id === targetFolderId && !item.isTrash);
    if (!profile || !targetFolder) return showToast("Escolha uma pasta de destino.", "warning");
    const docs = getFolderDocumentsForEuTecnico(currentFolderId, profile);
    docs.forEach(doc => moveRawEuDocument(profile, doc.id, doc.type, targetFolder.id, false));
    state.euFolderId = targetFolder.id;
    state.euTool = "folder";
    recordActivity("Moveu documentos", `Moveu ${docs.length} documento(s) para ${folderDisplayName(profile, targetFolder)}.`, { profile });
    saveApp({ profileId: profile.id });
    showToast("Documentos movidos.", "success");
    renderEuTecnicoWorkflow();
  }

  function duplicateEuDocument(documentId, type) {
    const profile = getEuTecnicoWriteProfile();
    const source = getRawEuDocument(profile, documentId, type);
    if (!profile || !source) return showToast("Documento nao encontrado.", "warning");
    const now = new Date().toISOString();
    const copy = JSON.parse(JSON.stringify(source));
    copy.id = createId();
    copy.title = `Copia de ${source.title || source.name || "documento"}`;
    copy.folderId = type === "planAction" ? folderIdForPlan(source) : (source.folderId || DEFAULT_WORKFLOW_FOLDER_ID);
    copy.createdAt = now;
    copy.updatedAt = now;
    copy.createdBy = normalizeEmail(currentUser()?.email || profile.email || source.createdBy || "");
    copy.ownerEmail = copy.createdBy;
    copy.userEmail = copy.createdBy;
    copy.profileId = profile.id || copy.profileId || "";
    copy.ownerProfileId = profile.id || copy.ownerProfileId || "";
    copy.ownerName = profile.name || currentUser()?.name || copy.ownerName || "";
    copy.deleted = false;
    delete copy.deletedAt;
    delete copy.deletedFromFolderId;
    delete copy.trashExpiresAt;
    if (type === "planAction") {
      profile.plans = Array.isArray(profile.plans) ? profile.plans : [];
      profile.plans.push(copy);
      recordActivity("Duplicou plano", `Duplicou ${source.title || "Plano sem titulo"}.`, { profile, plan: copy });
    } else {
      profile.documents = Array.isArray(profile.documents) ? profile.documents : [];
      profile.documents.push(copy);
      recordActivity(copy.type === "checklist" ? "Duplicou checklist" : "Duplicou documento de texto", `Duplicou ${source.title || "Documento sem titulo"}.`, { profile, document: copy });
    }
    saveApp({ profileId: profile.id });
    showToast("Documento duplicado.", "success");
    renderEuTecnicoWorkflow();
  }

  async function trashEuDocument(documentId, type) {
    const profile = getEuTecnicoWriteProfile();
    const doc = getRawEuDocument(profile, documentId, type);
    if (!profile || !doc) return showToast("Documento nao encontrado.", "warning");
    const ok = await askConfirm(`Mover "${doc.title || doc.name || "documento"}" para a Lixeira?`);
    if (!ok) return;
    const now = new Date();
    doc.deleted = true;
    doc.deletedAt = now.toISOString();
    doc.deletedBy = normalizeEmail(currentUser()?.email || profile.email || "");
    doc.deletedFromFolderId = type === "planAction" ? folderIdForPlan(doc) : (doc.folderId || DEFAULT_WORKFLOW_FOLDER_ID);
    doc.trashExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    doc.updatedAt = now.toISOString();
    recordActivity("Enviou documento para lixeira", `${doc.title || doc.name || "Documento"} foi enviado para a lixeira.`, { profile });
    saveApp({ profileId: profile.id });
    showToast("Documento enviado para a lixeira.", "success");
    renderEuTecnicoWorkflow();
  }

  function restoreEuDocument(documentId, type) {
    const profile = getEuTecnicoWriteProfile();
    const doc = getRawEuDocument(profile, documentId, type);
    if (!profile || !doc) return showToast("Documento nao encontrado.", "warning");
    const folders = getOwnedFolders(profile).filter(item => !item.isTrash);
    const originalFolderId = doc.deletedFromFolderId || doc.originalFolderId || DEFAULT_WORKFLOW_FOLDER_ID;
    const targetFolder = folders.find(item => item.id === originalFolderId) || ensureWritableDefaultFolder(profile);
    doc.deleted = false;
    doc.folderId = targetFolder.id;
    doc.updatedAt = new Date().toISOString();
    delete doc.deletedAt;
    delete doc.deletedBy;
    delete doc.deletedFromFolderId;
    delete doc.trashExpiresAt;
    state.euFolderId = targetFolder.id;
    state.euTool = "folder";
    recordActivity("Restaurou documento", `Restaurou ${doc.title || "documento"} para ${folderDisplayName(profile, targetFolder)}.`, { profile });
    saveApp({ profileId: profile.id });
    showToast("Documento restaurado.", "success");
    renderEuTecnicoWorkflow();
  }

  async function permanentlyDeleteEuDocument(documentId, type) {
    const profile = getEuTecnicoWriteProfile();
    const doc = getRawEuDocument(profile, documentId, type);
    if (!profile || !doc) return showToast("Documento nao encontrado.", "warning");
    const ok = await askConfirm(`Excluir definitivamente "${doc.title || doc.name || "documento"}"? Esta acao nao pode ser desfeita.`);
    if (!ok) return;
    if (type === "planAction") profile.plans = (profile.plans || []).filter(item => item.id !== documentId);
    else profile.documents = (profile.documents || []).filter(item => item.id !== documentId);
    recordActivity("Excluiu definitivamente", `Excluiu definitivamente ${doc.title || "documento"}.`, { profile });
    saveApp({ profileId: profile.id });
    showToast("Documento excluido definitivamente.", "success");
    renderEuTecnicoWorkflow();
  }

  function moveEuDocument(documentId, type, targetFolderId) {
    const profile = getEuTecnicoWriteProfile();
    const targetFolder = getOwnedFolders(profile).find(item => item.id === targetFolderId && !item.isTrash);
    if (!profile || !targetFolder) return showToast("Escolha uma pasta de destino.", "warning");
    if (!moveRawEuDocument(profile, documentId, type, targetFolder.id, true)) return showToast("Documento nao encontrado.", "warning");
    state.euFolderId = targetFolder.id;
    state.euTool = "folder";
    resetDocumentActionState();
    recordActivity("Moveu documento", `Moveu documento para ${folderDisplayName(profile, targetFolder)}.`, { profile });
    saveApp({ profileId: profile.id });
    showToast("Documento movido.", "success");
    renderEuTecnicoWorkflow();
  }

  function moveRawEuDocument(profile, documentId, type, targetFolderId, clearTrash) {
    const doc = getRawEuDocument(profile, documentId, type);
    if (!doc) return false;
    doc.folderId = targetFolderId || DEFAULT_WORKFLOW_FOLDER_ID;
    doc.updatedAt = new Date().toISOString();
    if (clearTrash) {
      doc.deleted = false;
      delete doc.deletedAt;
      delete doc.deletedFromFolderId;
      delete doc.trashExpiresAt;
    }
    return true;
  }

  function renameEuDocument(documentId, type, title) {
    const profile = getEuTecnicoWriteProfile();
    const doc = getRawEuDocument(profile, documentId, type);
    if (!profile || !doc) return showToast("Documento nao encontrado.", "warning");
    if (!title) return showToast("Informe o novo titulo.", "warning");
    doc.title = title;
    doc.updatedAt = new Date().toISOString();
    state.euTool = "folder";
    resetDocumentActionState();
    recordActivity("Renomeou documento", `Renomeou documento para ${title}.`, { profile });
    saveApp({ profileId: profile.id });
    showToast("Documento renomeado.", "success");
    renderEuTecnicoWorkflow();
  }

  function duplicateProfileDocument(documentId) {
    const profile = getEuTecnicoWriteProfile();
    const doc = (profile?.documents || []).find(item => item.id === documentId);
    return duplicateEuDocument(documentId, doc?.type || "textDocument");
  }

  function deleteProfileDocument(documentId) {
    const profile = getEuTecnicoWriteProfile();
    const doc = (profile?.documents || []).find(item => item.id === documentId);
    return trashEuDocument(documentId, doc?.type || "textDocument");
  }

  function duplicatePlanAction(planId) {
    return duplicateEuDocument(planId, "planAction");
  }

  function deletePlanAction(planId) {
    return trashEuDocument(planId, "planAction");
  }

  const TEXT_DOCUMENT_TEMPLATES = [
    { id: "blank", label: "Documento em branco", html: "" },
    {
      id: "clientNotice",
      label: "Comunicado ao cliente",
      html: `
        <h1>COMUNICADO AO CLIENTE</h1>
        <p><strong>Empresa:</strong></p>
        <p><strong>Data:</strong></p>
        <p><strong>Assunto:</strong></p>
        <p>Prezados,</p>
        <p>[texto]</p>
        <p>Atenciosamente,<br>[responsavel]</p>`
    },
    {
      id: "technicalOpinion",
      label: "Parecer tecnico",
      html: `
        <h1>PARECER TECNICO</h1>
        <p><strong>Empresa:</strong></p>
        <p><strong>Setor:</strong></p>
        <p><strong>Data:</strong></p>
        <p><strong>Assunto:</strong></p>
        <h2>1. Situacao verificada</h2>
        <p></p>
        <h2>2. Analise tecnica</h2>
        <p></p>
        <h2>3. Orientacoes / Recomendacoes</h2>
        <p></p>
        <h2>4. Conclusao</h2>
        <p></p>`
    },
    {
      id: "visitRecord",
      label: "Registro de visita",
      html: `
        <h1>REGISTRO DE VISITA TECNICA</h1>
        <p><strong>Empresa:</strong></p>
        <p><strong>Data:</strong></p>
        <p><strong>Responsavel:</strong></p>
        <p><strong>Setores avaliados:</strong></p>
        <h2>1. Objetivo da visita</h2>
        <p></p>
        <h2>2. Pontos observados</h2>
        <p></p>
        <h2>3. Pendencias identificadas</h2>
        <p></p>
        <h2>4. Encaminhamentos</h2>
        <p></p>`
    },
    {
      id: "documentRequest",
      label: "Solicitacao de documentos",
      html: `
        <h1>SOLICITACAO DE DOCUMENTOS</h1>
        <p><strong>Empresa:</strong></p>
        <p><strong>Data:</strong></p>
        <p>Solicitamos o envio dos seguintes documentos:</p>
        <ul><li></li><li></li><li></li></ul>
        <p><strong>Observacoes:</strong></p>`
    },
    {
      id: "companyPending",
      label: "Pendencias para empresa",
      html: `
        <h1>PENDENCIAS IDENTIFICADAS</h1>
        <p><strong>Empresa:</strong></p>
        <p><strong>Data:</strong></p>
        <p><strong>Setor:</strong></p>
        <p><strong>Pendencias:</strong></p>
        <ol><li></li><li></li><li></li></ol>
        <p><strong>Prazo sugerido:</strong></p>
        <p><strong>Responsavel:</strong></p>`
    },
    {
      id: "sstGuidance",
      label: "Orientacao de SST",
      html: `
        <h1>ORIENTACAO DE SST</h1>
        <p><strong>Empresa:</strong></p>
        <p><strong>Data:</strong></p>
        <p><strong>Tema:</strong></p>
        <h2>Orientacao</h2>
        <p></p>
        <h2>Medidas recomendadas</h2>
        <ul><li></li></ul>`
    },
    {
      id: "internalNote",
      label: "Observacao interna",
      html: `
        <h1>OBSERVACAO INTERNA</h1>
        <p><strong>Data:</strong></p>
        <p><strong>Empresa/Pasta:</strong></p>
        <p><strong>Registro:</strong></p>
        <p></p>`
    }
  ];

  function renderTextDocumentForm(profile, folder) {
    const doc = state.editingDocumentId ? (profile.documents || []).find(item => item.id === state.editingDocumentId) : null;
    const folders = getOwnedFolders(profile).filter(item => !item.isTrash);
    const selectedFolderId = doc?.folderId || folder?.id || folders[0]?.id || DEFAULT_WORKFLOW_FOLDER_ID;
    const templateId = doc?.templateId || "blank";
    const content = sanitizeTextDocumentHtml(doc?.content || getTextDocumentTemplateHtml(templateId));
    return `
      <form class="workflow-form text-document-shell" data-eu-form="text">
        <div class="text-document-head">
          <div>
            <p class="section-kicker">Documento de Texto</p>
            <h2>${doc ? "Editar documento" : "Criar documento"}</h2>
            <span data-text-save-status>${doc ? "Salvo" : "Novo documento"}</span>
          </div>
          <div class="text-document-head-actions">
            <button class="button ghost" type="button" data-text-save>Salvar</button>
            <button class="button primary" type="submit">Salvar e fechar</button>
          </div>
        </div>

        <div class="text-document-meta-grid">
          <label>Titulo do documento<input id="euTextTitleInput" type="text" value="${escapeAttr(doc?.title || "")}" required></label>
          <label>Pasta de destino<select id="euTextFolderInput" required>${folders.map(item => `<option value="${escapeAttr(item.id)}" ${item.id === selectedFolderId ? "selected" : ""}>${escapeHtml(folderDisplayName(profile, item))}</option>`).join("")}</select></label>
          <label>Tipo/modelo do documento<select id="euTextTemplateInput">${TEXT_DOCUMENT_TEMPLATES.map(template => `<option value="${escapeAttr(template.id)}" ${template.id === templateId ? "selected" : ""}>${escapeHtml(template.label)}</option>`).join("")}</select></label>
          <button class="button ghost text-template-button" type="button" data-text-apply-template>Aplicar modelo</button>
        </div>

        <div class="text-document-toolbar" aria-label="Ferramentas de texto">
          <button type="button" data-text-command="bold" title="Negrito"><strong>B</strong></button>
          <button type="button" data-text-command="italic" title="Italico"><em>I</em></button>
          <button type="button" data-text-command="underline" title="Sublinhado"><u>U</u></button>
          <button type="button" data-text-command="formatBlock" data-value="H1">Titulo</button>
          <button type="button" data-text-command="formatBlock" data-value="H2">Subtitulo</button>
          <button type="button" data-text-command="insertUnorderedList">Marcadores</button>
          <button type="button" data-text-command="insertOrderedList">Numerada</button>
          <button type="button" data-text-command="justifyLeft">Esquerda</button>
          <button type="button" data-text-command="justifyCenter">Centro</button>
          <button type="button" data-text-command="justifyRight">Direita</button>
          <button type="button" data-text-command="insertTable">Tabela</button>
          <button type="button" data-text-command="clear">Limpar</button>
        </div>

        <div id="euTextEditorInput" class="text-document-editor" contenteditable="true" data-placeholder="Digite seu documento aqui...">${content}</div>

        <div class="modal-actions">
          <button class="button ghost" type="button" data-eu-wf="cancel">Cancelar</button>
          <button class="button ghost" type="button" data-text-export>Exportar Word</button>
          <button class="button ghost" type="button" data-text-print>Imprimir / PDF</button>
          <button class="button" type="button" data-text-save>Salvar</button>
          <button class="button primary" type="submit">Salvar e fechar</button>
        </div>
      </form>`;
  }

  function saveTextDocument(form = null, options = {}) {
    const profile = getEuTecnicoWriteProfile();
    if (!profile) return showToast("Nao encontrei o perfil antigo para salvar o documento.", "warning");
    const data = collectTextDocumentFormData(form);
    if (!data.title || !data.plainText) {
      if (options.silent || options.autosave) return false;
      return showToast("Informe titulo e conteudo.", "warning");
    }

    const now = new Date().toISOString();
    profile.documents = Array.isArray(profile.documents) ? profile.documents : [];
    let doc = state.editingDocumentId ? profile.documents.find(item => item.id === state.editingDocumentId) : null;
    const ownerEmail = normalizeEmail(currentUser()?.email || profile.email || "");
    if (doc) {
      doc.title = data.title;
      doc.content = data.content;
      doc.plainText = data.plainText;
      doc.folderId = data.folderId;
      doc.templateId = data.templateId;
      doc.updatedAt = now;
      doc.updatedBy = ownerEmail;
      doc.createdBy = doc.createdBy || ownerEmail;
      doc.ownerEmail = doc.ownerEmail || ownerEmail;
      doc.ownerProfileId = doc.ownerProfileId || profile.id || "";
      doc.profileId = doc.profileId || profile.id || "";
      doc.deleted = false;
      recordActivity(options.autosave ? "Salvou documento de texto automaticamente" : "Salvou documento de texto", `Salvou ${doc.title}.`, { profile, document: doc });
    } else {
      doc = {
        id: createId(),
        type: "textDocument",
        title: data.title,
        content: data.content,
        plainText: data.plainText,
        folderId: data.folderId,
        templateId: data.templateId,
        createdBy: ownerEmail,
        ownerEmail,
        userEmail: ownerEmail,
        profileId: profile.id || "",
        ownerProfileId: profile.id || "",
        ownerName: profile.name || currentUser()?.name || currentUser()?.email || "",
        createdAt: now,
        updatedAt: now,
        copiedFrom: null
      };
      profile.documents.push(doc);
      state.editingDocumentId = doc.id;
      recordActivity("Criou documento de texto", `Criou ${doc.title}.`, { profile, document: doc });
    }

    state.euFolderId = data.folderId;
    state.textDocumentDirty = false;
    saveApp({ profileId: profile.id });

    if (options.close !== false) {
      state.euTool = "folder";
      state.editingDocumentId = "";
      renderEuTecnicoWorkflow();
      if (!options.silent) showToast("Documento salvo.", "success");
      return true;
    }

    setTextDocumentStatus("Salvo", "saved");
    if (!options.silent) showToast("Documento salvo.", "success");
    return true;
  }

  function collectTextDocumentFormData(form) {
    const title = getScopedField(form, "#euTextTitleInput")?.value.trim() || "";
    const editor = getScopedField(form, "#euTextEditorInput");
    const rawContent = editor?.innerHTML || "";
    const content = sanitizeTextDocumentHtml(rawContent);
    return {
      title,
      content,
      plainText: extractPlainTextFromHtml(content),
      folderId: getScopedField(form, "#euTextFolderInput")?.value || (state.euFolderId === TRASH_WORKFLOW_FOLDER_ID ? DEFAULT_WORKFLOW_FOLDER_ID : state.euFolderId) || DEFAULT_WORKFLOW_FOLDER_ID,
      templateId: getScopedField(form, "#euTextTemplateInput")?.value || "blank"
    };
  }

  function markTextDocumentDirty() {
    state.textDocumentDirty = true;
    setTextDocumentStatus("Alteracoes nao salvas", "dirty");
  }

  function scheduleTextDocumentAutosave(form) {
    if (state.textAutosaveTimer) clearTimeout(state.textAutosaveTimer);
    state.textAutosaveTimer = setTimeout(() => {
      setTextDocumentStatus("Salvando...", "saving");
      const saved = saveTextDocument(form, { close: false, silent: true, autosave: true });
      if (!saved) setTextDocumentStatus("Alteracoes nao salvas", "dirty");
    }, 2600);
  }

  function setTextDocumentStatus(message, tone = "") {
    const target = document.querySelector("[data-text-save-status]");
    if (!target) return;
    target.textContent = message;
    target.dataset.status = tone;
  }

  function runTextDocumentCommand(command, value = "") {
    const editor = document.getElementById("euTextEditorInput");
    if (!editor) return;
    editor.focus();
    if (command === "insertTable") {
      document.execCommand("insertHTML", false, `<table><tbody><tr><th>Campo</th><th>Informacao</th></tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr></tbody></table><p></p>`);
    } else if (command === "clear") {
      document.execCommand("removeFormat", false, null);
    } else if (command === "formatBlock") {
      document.execCommand("formatBlock", false, value || "P");
    } else {
      document.execCommand(command, false, value || null);
    }
    markTextDocumentDirty();
    scheduleTextDocumentAutosave(editor.closest("[data-eu-form='text']"));
  }

  function applySelectedTextDocumentTemplate() {
    const select = document.getElementById("euTextTemplateInput");
    const editor = document.getElementById("euTextEditorInput");
    if (!select || !editor) return;
    const html = getTextDocumentTemplateHtml(select.value || "blank");
    if (!html) {
      editor.innerHTML = "";
      markTextDocumentDirty();
      return;
    }
    const plain = extractPlainTextFromHtml(editor.innerHTML);
    if (plain.length > 10) editor.innerHTML += `<hr>${sanitizeTextDocumentHtml(html)}`;
    else editor.innerHTML = sanitizeTextDocumentHtml(html);
    markTextDocumentDirty();
    scheduleTextDocumentAutosave(editor.closest("[data-eu-form='text']"));
    showToast("Modelo aplicado no editor.", "success");
  }

  function getTextDocumentTemplateHtml(id) {
    return TEXT_DOCUMENT_TEMPLATES.find(template => template.id === id)?.html || "";
  }

  function sanitizeTextDocumentHtml(html) {
    const template = document.createElement("template");
    template.innerHTML = String(html || "");
    const allowed = new Set(["P", "DIV", "BR", "STRONG", "B", "EM", "I", "U", "UL", "OL", "LI", "H1", "H2", "H3", "TABLE", "THEAD", "TBODY", "TR", "TD", "TH", "SPAN", "HR"]);
    const cleanNode = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === Node.COMMENT_NODE) {
          child.remove();
          return;
        }
        if (child.nodeType !== Node.ELEMENT_NODE) return;
        const tag = child.tagName;
        if (!allowed.has(tag)) {
          const fragment = document.createDocumentFragment();
          while (child.firstChild) fragment.appendChild(child.firstChild);
          child.replaceWith(fragment);
          cleanNode(node);
          return;
        }
        [...child.attributes].forEach(attribute => {
          const name = attribute.name.toLowerCase();
          const value = attribute.value || "";
          const isTableSpan = ["colspan", "rowspan"].includes(name) && ["TD", "TH"].includes(tag);
          const isStyle = name === "style";
          if (isTableSpan) return;
          if (isStyle) {
            const align = /text-align\s*:\s*(left|center|right|justify)/i.exec(value)?.[1];
            if (align) child.setAttribute("style", `text-align:${align.toLowerCase()};`);
            else child.removeAttribute(attribute.name);
            return;
          }
          child.removeAttribute(attribute.name);
        });
        cleanNode(child);
      });
    };
    cleanNode(template.content);
    return template.innerHTML.trim();
  }

  function extractPlainTextFromHtml(html) {
    const div = document.createElement("div");
    div.innerHTML = String(html || "");
    return (div.textContent || "").replace(/\s+/g, " ").trim();
  }

  function exportCurrentTextDocumentWord(form = null) {
    const data = collectTextDocumentFormData(form);
    if (!data.title || !data.plainText) return showToast("Informe titulo e conteudo antes de exportar.", "warning");
    const html = buildTextDocumentWordHtml(data.title, data.content);
    const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
    fallbackDownload(blob, `${safeTextDocumentFileName(data.title)}.doc`);
    recordActivity("Exportou documento de texto", `Exportou ${data.title} em Word.`, { profile: getEuTecnicoWriteProfile() });
    showToast("Word gerado.", "success");
  }

  function printCurrentTextDocument(form = null) {
    const data = collectTextDocumentFormData(form);
    if (!data.title || !data.plainText) return showToast("Informe titulo e conteudo antes de imprimir.", "warning");
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return showToast("Nao consegui abrir a previa de impressao. Verifique o bloqueador de pop-ups.", "warning");
    printWindow.document.open();
    printWindow.document.write(buildTextDocumentWordHtml(data.title, data.content));
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
    recordActivity("Imprimiu documento de texto", `Abriu impressao de ${data.title}.`, { profile: getEuTecnicoWriteProfile() });
  }

  function buildTextDocumentWordHtml(title, content) {
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
body { font-family: Arial, sans-serif; font-size: 11pt; color: #111; }
h1, h2, h3 { color: #1f4e79; }
table { border-collapse: collapse; width: 100%; }
td, th { border: 1px solid #666; padding: 6px; }
</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
<p><strong>Data de geracao:</strong> ${escapeHtml(new Date().toLocaleString("pt-BR"))}</p>
${sanitizeTextDocumentHtml(content)}
</body>
</html>`;
  }

  function safeTextDocumentFileName(value) {
    return String(value || "Documento de texto")
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120) || "Documento de texto";
  }

  function normalizeEuDocument(source, type, profile) {
    const data = source || {};
    const title = data.title || data.name || (type === "checklist" ? "Checklist sem titulo" : type === "planAction" ? "Plano sem titulo" : "Documento sem titulo");
    const plainText = data.plainText || extractPlainTextFromHtml(data.content || data.description || "");
    return {
      id: data.id,
      type,
      title,
      folderId: type === "planAction" ? folderIdForPlan(data) : (data.folderId || DEFAULT_WORKFLOW_FOLDER_ID),
      createdAt: data.createdAt || data.createdDate || "",
      updatedAt: data.updatedAt || data.updatedDate || data.createdAt || "",
      createdBy: data.createdBy || data.ownerEmail || profile?.email || "",
      status: data.status || data.progressStatus || "",
      company: data.company || data.companyName || data.checklistData?.companyName || "",
      observations: data.observations || data.notes || data.generalNotes || data.checklistData?.generalNotes || "",
      content: [plainText, data.templateId || "", textDocumentTemplateLabel(data.templateId)].join(" "),
      copiedFrom: data.copiedFrom || null,
      deleted: data.deleted === true,
      deletedAt: data.deletedAt || "",
      deletedFromFolderId: data.deletedFromFolderId || data.originalFolderId || "",
      trashExpiresAt: data.trashExpiresAt || data.expiresAt || "",
      sourceData: data
    };
  }

  function textDocumentTemplateLabel(id) {
    return TEXT_DOCUMENT_TEMPLATES.find(template => template.id === id)?.label || "";
  }

  function renderEuPlanEditor(profile, folder) {
    const plan = (profile?.plans || []).find(item => item.id === state.editingPlanId);
    if (!profile || !plan) return `<div class="empty-state">Plano de Acao nao encontrado.</div>`;
    normalizeEuPlanOwnership(profile, plan);
    ensurePlanDataShape(plan);
    const folders = getOwnedFolders(profile).filter(item => !item.isTrash);
    const selectedFolderId = folderIdForPlan(plan);
    const copiedNote = plan.copiedFrom ? `<span class="received-note">Recebido de ${escapeHtml(plan.copiedFrom.ownerName || plan.copiedFrom.ownerEmail || "companheiro")}</span>` : "";
    return `
      <form class="workflow-form eu-plan-editor" data-eu-form="plan-editor">
        <div class="eu-plan-editor-head">
          <div>
            <p class="section-kicker">Plano de Acao</p>
            <h2>${escapeHtml(plan.title || "Plano sem titulo")}</h2>
            <span>${escapeHtml(folderDisplayName(profile, folder))}</span>
            ${copiedNote}
          </div>
          <div class="eu-plan-editor-actions">
            <button class="button ghost" type="button" data-plan-editor-back>Voltar para pasta</button>
            <button class="button primary" type="button" data-plan-editor-save>Salvar</button>
            <button class="button ghost" type="button" data-plan-editor-export-word>Exportar Word</button>
          </div>
        </div>
        <div class="eu-plan-meta-grid">
          <label>Titulo do plano<input id="euPlanEditorTitle" type="text" value="${escapeAttr(plan.title || "")}" required></label>
          <label>Empresa/Cliente<input id="euPlanEditorCompany" type="text" value="${escapeAttr(getPlanMeta(plan, "company") || plan.company || "")}"></label>
          <label>Documento<select id="euPlanEditorDocumentType">${["PGR", "LTCAT", "PCMSO", "Outro"].map(value => `<option value="${escapeAttr(value)}" ${String(getPlanMeta(plan, "documentName") || plan.documentType || "PGR") === value ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}</select></label>
          <label>Pasta<select id="euPlanEditorFolder">${folders.map(item => `<option value="${escapeAttr(item.id)}" ${item.id === selectedFolderId ? "selected" : ""}>${escapeHtml(folderDisplayName(profile, item))}</option>`).join("")}</select></label>
        </div>
        <div class="eu-plan-template-bar">
          <label>Template<select id="euPlanTemplateApplyInput">${renderActionPlanTemplateOptions()}</select></label>
          <button class="button ghost" type="button" data-plan-template-add>Adicionar ao plano atual</button>
          <button class="button ghost" type="button" data-plan-template-replace>Substituir dados atuais</button>
        </div>
        ${renderPlanRowsSection("actions", "Acoes", getPlanRows(plan, "actions"))}
        ${renderPlanRowsSection("equipment", "Equipamentos de emergencia", getPlanRows(plan, "equipment"))}
        ${renderPlanRowsSection("trainings", "Treinamentos", getPlanRows(plan, "trainings"))}
        <div class="modal-actions">
          <button class="button ghost" type="button" data-plan-editor-duplicate>Duplicar</button>
          <button class="button ghost" type="button" data-plan-editor-move>Mover</button>
          <button class="button danger" type="button" data-plan-editor-delete>Excluir</button>
          <button class="button ghost" type="button" data-plan-editor-print>Imprimir / PDF</button>
          <button class="button primary" type="button" data-plan-editor-save>Salvar</button>
        </div>
      </form>`;
  }

  function renderPlanRowsSection(section, title, rows) {
    return `
      <section class="eu-plan-section" data-plan-section="${escapeAttr(section)}">
        <header><div><h3>${escapeHtml(title)}</h3><span>${rows.length} item(ns)</span></div><button class="button ghost" type="button" data-plan-row-add="${escapeAttr(section)}">Adicionar item</button></header>
        <div class="eu-plan-row-list">${rows.length ? rows.map((row, index) => renderPlanRow(section, row, index)).join("") : `<div class="empty-state compact">Nenhum item cadastrado nesta secao.</div>`}</div>
      </section>`;
  }

  function renderPlanRow(section, row, index) {
    if (section === "actions") {
      return `<article class="eu-plan-row" data-plan-row="${escapeAttr(section)}" data-row-index="${index}" data-row-id="${escapeAttr(row.id || "")}">
        <div class="eu-plan-row-head"><strong>Acao ${index + 1}</strong><button class="button ghost danger" type="button" data-plan-row-remove="${index}" data-plan-row-section="${escapeAttr(section)}">Remover</button></div>
        <label>Acao recomendada<textarea data-plan-field="actionHtml" rows="3">${escapeHtml(row.actionHtml || row.action || row.description || "")}</textarea></label>
        <div class="eu-plan-row-grid"><label>Responsavel<input data-plan-field="responsible" value="${escapeAttr(row.responsible || "")}"></label><label>Quando<input data-plan-field="when" value="${escapeAttr(row.when || row.dueDate || "")}"></label><label>Prioridade<select data-plan-field="priority">${planOptionList(["Alta", "Media", "Baixa"], row.priority)}</select></label><label>Status<select data-plan-field="status">${planOptionList(["Nao iniciado", "Em andamento", "Concluido", "Cancelado"], row.status)}</select></label></div>
        <label>Observacao<textarea data-plan-field="observationHtml" rows="2">${escapeHtml(row.observationHtml || row.observation || "")}</textarea></label>
      </article>`;
    }
    if (section === "equipment") {
      return `<article class="eu-plan-row" data-plan-row="${escapeAttr(section)}" data-row-index="${index}" data-row-id="${escapeAttr(row.id || "")}">
        <div class="eu-plan-row-head"><strong>Equipamento ${index + 1}</strong><button class="button ghost danger" type="button" data-plan-row-remove="${index}" data-plan-row-section="${escapeAttr(section)}">Remover</button></div>
        <label>Descricao<textarea data-plan-field="descriptionHtml" rows="3">${escapeHtml(row.descriptionHtml || row.description || "")}</textarea></label><label>Responsavel<input data-plan-field="responsible" value="${escapeAttr(row.responsible || "")}"></label>
      </article>`;
    }
    return `<article class="eu-plan-row" data-plan-row="${escapeAttr(section)}" data-row-index="${index}" data-row-id="${escapeAttr(row.id || "")}">
      <div class="eu-plan-row-head"><strong>Treinamento ${index + 1}</strong><button class="button ghost danger" type="button" data-plan-row-remove="${index}" data-plan-row-section="${escapeAttr(section)}">Remover</button></div>
      <label>Treinamento<textarea data-plan-field="trainingHtml" rows="3">${escapeHtml(row.trainingHtml || row.training || row.description || "")}</textarea></label><div class="eu-plan-row-grid"><label>Responsavel<input data-plan-field="responsible" value="${escapeAttr(row.responsible || "")}"></label><label>Quando<input data-plan-field="when" value="${escapeAttr(row.when || "")}"></label></div>
    </article>`;
  }

  function planOptionList(values, selected) {
    const current = normalizeText(selected || "");
    return values.map(value => `<option value="${escapeAttr(value)}" ${normalizeText(value) === current ? "selected" : ""}>${escapeHtml(value)}</option>`).join("");
  }

  function saveEuPlanEditor(form = null, options = {}) {
    const profile = getEuTecnicoWriteProfile();
    const plan = (profile?.plans || []).find(item => item.id === state.editingPlanId);
    if (!profile || !plan) return showToast("Plano de Acao nao encontrado.", "warning");
    const data = collectEuPlanEditorData(form);
    if (!data.title) return showToast("Informe o titulo do plano.", "warning");
    normalizeEuPlanOwnership(profile, plan);
    ensurePlanDataShape(plan);
    plan.title = data.title;
    plan.company = data.company;
    plan.documentType = data.documentType;
    plan.folderId = data.folderId || DEFAULT_WORKFLOW_FOLDER_ID;
    plan.type = "planAction";
    plan.updatedAt = new Date().toISOString();
    plan.data.meta.company = data.company;
    plan.data.meta.documentName = data.documentType;
    plan.data.actions = data.actions;
    plan.data.equipment = data.equipment;
    plan.data.trainings = data.trainings;
    state.euFolderId = plan.folderId;
    recordActivity("Salvou Plano de Acao", `Salvou ${plan.title}.`, { profile, plan });
    saveApp({ profileId: profile.id });
    if (options.close) {
      state.euTool = "folder";
      state.editingPlanId = "";
      renderEuTecnicoWorkflow();
      return true;
    }
    if (!options.silent) showToast("Plano salvo.", "success");
    return true;
  }

  function collectEuPlanEditorData(form) {
    const scoped = selector => getScopedField(form, selector);
    const data = { title: scoped("#euPlanEditorTitle")?.value.trim() || "", company: scoped("#euPlanEditorCompany")?.value.trim() || "", documentType: scoped("#euPlanEditorDocumentType")?.value || "PGR", folderId: scoped("#euPlanEditorFolder")?.value || DEFAULT_WORKFLOW_FOLDER_ID, actions: [], equipment: [], trainings: [] };
    (form || document).querySelectorAll("[data-plan-row]").forEach(row => {
      const section = row.dataset.planRow;
      const item = { id: row.dataset.rowId || createId() };
      row.querySelectorAll("[data-plan-field]").forEach(field => { item[field.dataset.planField] = field.value || ""; });
      if (section === "actions") data.actions.push(item);
      if (section === "equipment") data.equipment.push(item);
      if (section === "trainings") data.trainings.push(item);
    });
    return data;
  }

  function addEuPlanRow(section) {
    const profile = getEuTecnicoWriteProfile();
    const plan = (profile?.plans || []).find(item => item.id === state.editingPlanId);
    if (!profile || !plan) return;
    saveEuPlanEditor(document.querySelector("[data-eu-form='plan-editor']"), { silent: true });
    const rows = getPlanRows(plan, section);
    rows.push(defaultPlanRow(section));
    setPlanRows(plan, section, rows);
    plan.updatedAt = new Date().toISOString();
    saveApp({ profileId: profile.id });
    renderEuTecnicoWorkflow();
  }

  async function removeEuPlanRow(section, index) {
    const profile = getEuTecnicoWriteProfile();
    const plan = (profile?.plans || []).find(item => item.id === state.editingPlanId);
    if (!profile || !plan) return;
    const ok = await askConfirm("Remover este item do plano?");
    if (!ok) return;
    saveEuPlanEditor(document.querySelector("[data-eu-form='plan-editor']"), { silent: true });
    const rows = getPlanRows(plan, section);
    rows.splice(Number(index), 1);
    setPlanRows(plan, section, rows);
    plan.updatedAt = new Date().toISOString();
    saveApp({ profileId: profile.id });
    renderEuTecnicoWorkflow();
  }

  function applyEuPlanTemplate(mode) {
    const profile = getEuTecnicoWriteProfile();
    const plan = (profile?.plans || []).find(item => item.id === state.editingPlanId);
    if (!profile || !plan) return;
    const template = getSelectedActionPlanTemplate(document.getElementById("euPlanTemplateApplyInput")?.value || "blank");
    if (!template) return showToast("Escolha um template valido.", "warning");
    saveEuPlanEditor(document.querySelector("[data-eu-form='plan-editor']"), { silent: true });
    const rows = templateToPlanRows(template);
    setPlanRows(plan, "actions", mode === "replace" ? rows.actions : [...getPlanRows(plan, "actions"), ...rows.actions]);
    setPlanRows(plan, "equipment", mode === "replace" ? rows.equipment : [...getPlanRows(plan, "equipment"), ...rows.equipment]);
    setPlanRows(plan, "trainings", mode === "replace" ? rows.trainings : [...getPlanRows(plan, "trainings"), ...rows.trainings]);
    plan.updatedAt = new Date().toISOString();
    recordActivity("Aplicou template", `${template.name || "Template"} em ${plan.title}.`, { profile, plan });
    saveApp({ profileId: profile.id });
    renderEuTecnicoWorkflow();
    showToast(mode === "replace" ? "Template substituiu os dados do plano." : "Template adicionado ao plano.", "success");
  }

  function getSelectedActionPlanTemplate(choice) {
    const app = appState();
    const normalizeTemplates = SATS.core.normalizeActionPlanTemplates || (value => Array.isArray(value) ? value : []);
    const templates = normalizeTemplates(app?.actionPlanTemplates || []);
    if (choice === "template") return templates.find(template => template.systemDefault);
    if (choice.startsWith("tpl:")) return templates.find(template => template.id === choice.slice(4) && template.active);
    return null;
  }

  function templateToPlanRows(template) {
    const clone = rows => Array.isArray(rows) ? rows.map(row => ({ ...JSON.parse(JSON.stringify(row)), id: createId() })) : [];
    return { actions: clone(template.rows), equipment: clone(template.equipmentRows), trainings: clone(template.trainingRows) };
  }

  function ensurePlanDataShape(plan) {
    plan.data = plan.data && typeof plan.data === "object" ? plan.data : {};
    plan.data.meta = plan.data.meta && typeof plan.data.meta === "object" ? plan.data.meta : {};
    plan.data.actions = Array.isArray(plan.data.actions) ? plan.data.actions : Array.isArray(plan.actions) ? plan.actions : [];
    plan.data.equipment = Array.isArray(plan.data.equipment) ? plan.data.equipment : Array.isArray(plan.emergencyEquipments) ? plan.emergencyEquipments : [];
    plan.data.trainings = Array.isArray(plan.data.trainings) ? plan.data.trainings : Array.isArray(plan.trainings) ? plan.trainings : [];
    plan.data.meta.company = plan.data.meta.company || plan.company || "";
    plan.data.meta.documentName = plan.data.meta.documentName || plan.documentType || "PGR";
  }

  function getPlanRows(plan, section) {
    ensurePlanDataShape(plan);
    if (section === "actions") return plan.data.actions;
    if (section === "equipment") return plan.data.equipment;
    return plan.data.trainings;
  }

  function setPlanRows(plan, section, rows) {
    ensurePlanDataShape(plan);
    if (section === "actions") plan.data.actions = rows;
    if (section === "equipment") plan.data.equipment = rows;
    if (section === "trainings") plan.data.trainings = rows;
  }

  function defaultPlanRow(section) {
    if (section === "actions") return { id: createId(), actionHtml: "", responsible: "", when: "", priority: "Media", status: "Nao iniciado", observationHtml: "" };
    if (section === "equipment") return { id: createId(), descriptionHtml: "", responsible: "Empresa" };
    return { id: createId(), trainingHtml: "", responsible: "Empresa/Consultoria", when: "" };
  }

  function getPlanMeta(plan, key) {
    ensurePlanDataShape(plan);
    return plan.data.meta?.[key] || "";
  }

  function normalizeEuPlanOwnership(profile, plan) {
    const ownerEmail = normalizeEmail(currentUser()?.email || profile.email || plan.ownerEmail || plan.createdBy || "");
    plan.type = plan.type || "planAction";
    plan.createdBy = plan.createdBy || ownerEmail;
    plan.ownerEmail = plan.ownerEmail || ownerEmail;
    plan.userEmail = plan.userEmail || ownerEmail;
    plan.profileId = plan.profileId || profile.id || "";
    plan.ownerProfileId = plan.ownerProfileId || profile.id || "";
    plan.ownerName = plan.ownerName || profile.name || currentUser()?.name || "";
  }

  function exportEuPlanWord(form = null) {
    if (form) saveEuPlanEditor(form, { silent: true });
    const profile = getEuTecnicoWriteProfile();
    const plan = (profile?.plans || []).find(item => item.id === state.editingPlanId);
    if (!plan) return showToast("Plano de Acao nao encontrado.", "warning");
    const html = buildEuPlanWordHtml(plan);
    downloadBlob(new Blob([html], { type: "application/msword;charset=utf-8" }), `${sanitizeFileName(plan.title || "plano-de-acao")}.doc`);
    recordActivity("Exportou Word", `Exportou ${plan.title}.`, { profile, plan });
    showToast("Word gerado.", "success");
  }

  function printEuPlan(form = null) {
    if (form) saveEuPlanEditor(form, { silent: true });
    const profile = getEuTecnicoWriteProfile();
    const plan = (profile?.plans || []).find(item => item.id === state.editingPlanId);
    if (!plan) return;
    const win = window.open("", "_blank", "width=1100,height=800");
    if (!win) return showToast("Nao consegui abrir a previa de impressao.", "warning");
    win.document.write(buildEuPlanWordHtml(plan));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  }

  function buildEuPlanWordHtml(plan) {
    ensurePlanDataShape(plan);
    const company = plan.data.meta.company || plan.company || "-";
    const actionRows = getPlanRows(plan, "actions").map((row, index) => [index + 1, richWord(row.actionHtml), plainWord(row.responsible), plainWord(row.when), toneWord(row.priority, "priority"), toneWord(row.status, "status"), richWord(row.observationHtml)]);
    const equipmentRows = getPlanRows(plan, "equipment").map((row, index) => [index + 1, richWord(row.descriptionHtml), plainWord(row.responsible)]);
    const trainingRows = getPlanRows(plan, "trainings").map((row, index) => [index + 1, richWord(row.trainingHtml), plainWord(row.responsible), plainWord(row.when)]);
    return `<!doctype html><html><head><meta charset="utf-8"><style>@page WordSection1{size:29.7cm 21cm;mso-page-orientation:landscape;margin:1cm}div.WordSection1{page:WordSection1}body{font-family:Arial,sans-serif;color:#0f172a;font-size:9pt}table{width:100%;border-collapse:collapse;margin:0 0 12px}th,td{border:1px solid #cbd5e1;padding:5px 6px;vertical-align:top}th{background:#1d4ed8;color:#fff;text-align:left}h1{text-align:center;font-size:20pt;margin:0}h2{border-bottom:2px solid #2563eb;padding-bottom:4px;font-size:13pt}.word-header,.word-header td{border:0;background:#fff}.word-subtitle{text-align:center;color:#475569;margin:4px 0 16px;font-size:10pt}.word-tone-cell{font-weight:700;text-align:center}</style></head><body><div class="WordSection1"><table class="word-header"><tr><td><h1>CRONOGRAMA DE ACOES SST</h1><div class="word-subtitle">${escapeHtml(plan.title || "Plano de Acao")} - ${escapeHtml(company)}</div></td><td style="text-align:right;width:170px"><strong>Atualizado</strong><br>${escapeHtml(formatDateTime(plan.updatedAt))}</td></tr></table>${wordTableHtml("Acoes", ["Item", "Acao recomendada", "Responsavel", "Quando", "Prioridade", "Status", "Observacao"], actionRows)}${wordTableHtml("Equipamentos de emergencia", ["Item", "Descricao", "Responsavel"], equipmentRows)}${wordTableHtml("Treinamentos", ["Item", "Treinamento", "Responsavel", "Quando"], trainingRows)}</div></body></html>`;
  }

  function wordTableHtml(title, headers, rows) {
    if (!rows.length) return `<h2>${escapeHtml(title)}</h2><p>Nenhum registro cadastrado.</p>`;
    return `<h2>${escapeHtml(title)}</h2><table><thead><tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(wordCell).join("")}</tr>`).join("")}</tbody></table>`;
  }

  function wordCell(cell) {
    if (cell && typeof cell === "object") return `<td bgcolor="${escapeAttr(cell.bgcolor || "")}" style="${escapeAttr(cell.style || "")}">${cell.html || "-"}</td>`;
    return `<td>${cell == null || cell === "" ? "-" : cell}</td>`;
  }

  function richWord(value) {
    const raw = String(value || "");
    if (!raw) return "-";
    return /[<>]/.test(raw) ? sanitizeTextDocumentHtml(raw) : plainWord(raw);
  }

  function plainWord(value) {
    return escapeHtml(String(value || "-")).replace(/\n/g, "<br>");
  }

  function toneWord(value, type) {
    const text = String(value || "-");
    const normalized = normalizeText(text);
    let color = "#bfc6d1";
    if (type === "priority" && normalized === "alta") color = "#ff3333";
    else if (type === "priority" && normalized === "media") color = "#ffc928";
    else if (type === "priority" && normalized === "baixa") color = "#16d416";
    else if (type === "status" && normalized === "em andamento") color = "#9fb7d9";
    else if (type === "status" && normalized === "concluido") color = "#16d416";
    else if (type === "status" && (normalized === "cancelado" || normalized === "atrasado")) color = "#ff3333";
    return { html: escapeHtml(text), bgcolor: color, style: `background-color:${color};color:#000;font-weight:600;text-align:center;` };
  }

  function icon(name) {
    const paths = {
      clipboard: '<path d="M9 3h6v2h3v16H6V5h3z"/><path d="m9 13 2 2 4-5"/>',
      checklist: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3 6 1 1 2-2m-3 7 1 1 2-2m-3 7 1 1 2-2"/>',
      folder: '<path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H10l2 2h6.5A2.5 2.5 0 0 1 21 8.5V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
      plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
      search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
      text: '<path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/>'
    };
    return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.text}</svg>`;
  }

  function documentTypeLabel(type) {
    return { planAction: "Plano de Ação", checklist: "Checklist", textDocument: "Documento de texto" }[type] || "Documento";
  }

  function formatDateTime(value) {
    if (!value) return "sem registro";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "sem registro";
    return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  }

  function fallbackDownload(blob, fileName) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
