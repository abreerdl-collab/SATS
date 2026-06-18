(function () {
      "use strict";

      window.SATS = window.SATS || {};
      window.SATS.core = window.SATS.core || {};
      window.SATS.storage = window.SATS.storage || {};
      window.SATS.ui = window.SATS.ui || {};
      window.SATS.router = window.SATS.router || {};
      window.SATS.permissions = window.SATS.permissions || {};
      window.SATS.modules = window.SATS.modules || {};

      const SUPABASE_URL = "https://omyyxdjozumrlgpfexau.supabase.co";
      const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_mjNFpgsW0K1X_7id1RADfA_Hk-A1_7i";
      const APP_VERSION = "sats-2026-06-15-professional-suggestions";
      const EGRESS_DIAG_PREFIX = "[EGRESS-DIAG]";
      const SHARED_STATE_ID = "main";
      const SHARED_STORAGE_KEY = "planoDeAcaoSST.shared.v1";
      const SHARED_UPDATED_AT_CACHE_KEY = "planoDeAcaoSST.sharedUpdatedAt.v1";
      const SYNC_LEADER_KEY = "planoDeAcaoSST.syncLeader.v1";
      const PRESENCE_STORAGE_KEY = "planoDeAcaoSST.presence.v1";
      const LOCAL_MIGRATION_KEY = "planoDeAcaoSST.localMerged.v1";
      const STORAGE_KEY = "planoDeAcaoSST.v2";
      const THEME_KEY = "planoDeAcaoSST.theme.v1";
      const THEME_USER_PREFIX = "planoDeAcaoSST.theme.user.";
      const MAX_ACTIVITY_LOG = 500;
      const RESTRICTED_ATTEMPT_ACTION = "Tentativa de acesso restrito";
      const LOGGED_ACTIVITY_ACTIONS = new Set([
        "Excluiu perfil", "Excluiu pasta", "Excluiu plano", "Copiou plano", "Aplicou vigência",
        "Enviou sugestão", "Enviou sugestão com anexo", "Removeu anexo da sugestão",
        "Resolveu sugestão", "Reabriu sugestão", "Excluiu sugestão", "Rejeitou sugestão",
        "Restaurou sugestão rejeitada", "Salvou rascunho de relatório", "Enviou relatório de sugestão aceita",
        "Visualizou relatório de sugestão aceita", "Limpou ranking semanal", "Removeu estrela",
        "Removeu relatório", "Removeu notificações de sugestão",
        "Criou perfil pela gestão", "Editou perfil", "Ocultou perfil", "Desocultou perfil",
        "Criou pasta pela gestão", "Editou pasta", "Ocultou pasta", "Desocultou pasta",
        "Renomeou plano", "Moveu plano", "Enviou plano para lixeira", "Restaurou plano da lixeira",
        "Excluiu plano permanentemente", "Limpou lixeira", "Excluiu logs", "Limpou logs filtrados", "Limpou todos os logs",
        "Adicionou permissão", "Alterou permissão", "Removeu permissão",
        "Criou rascunho de Procedimentos", "Editou Procedimentos", "Criou risco físico", "Editou risco físico",
        "Duplicou risco físico", "Ativou risco físico", "Desativou risco físico", "Excluiu risco físico",
        "Publicou Procedimentos", "Restaurou versão de Procedimentos", "Importou Procedimentos",
        "Exportou Procedimentos", "Importou risco físico", "Exportou risco físico",
        "Criou template", "Alterou template", "Duplicou template", "Ativou template", "Desativou template",
        "Excluiu template", "Restaurou template padrão", "Aplicou template",
        "Criou cliente", "Editou cliente", "Arquivou cliente", "Criou unidade", "Editou unidade",
        "Arquivou unidade", "Criou setor", "Editou setor", "Arquivou setor", "Alterou vínculo de plano",
        "Adicionou acesso", "Editou acesso", "Removeu acesso", "Criou backup", "Restaurou backup",
        "Importou backup", "Exportou backup", "Alterou configuração", "Ativou modo manutenção",
        "Desativou modo manutenção", "Alterou contrato", "Rodou diagnóstico", "Reparou dados",
        "Acessou Automação de Documentos", "Tentou acessar Automação de Documentos",
        "Criou projeto de automação", "Enviou arquivo SOC", "Extraiu dados do SOC",
        "Editou campos extraídos", "Gerou Word da automação", "Salvou projeto de automação",
        "Excluiu projeto de automação",
        RESTRICTED_ATTEMPT_ACTION
      ]);
      const DEFAULT_FOLDER_ID = "default-folder";
      const RESTORED_FOLDER_NAME = "Restaurados";
      const PLAN_TRASH_RETENTION_MS = 24 * 60 * 60 * 1000;
      const DEFAULT_CLIENT_ID = "default-client";
      const DEFAULT_UNIT_ID = "default-unit";
      const DEFAULT_SECTOR_ID = "default-sector";
      const DEFAULT_ACTION_PLAN_TEMPLATE_ID = "default-action-plan-template";
      const MAX_AUDIT_TRAIL = 1000;
      const MAX_INTERNAL_BACKUPS = 10;
      const CLIENT_STATUSES = ["active", "inactive", "suspended", "archived"];
      const COMMERCIAL_STATUSES = ["trial", "active", "expiring", "expired", "suspended", "cancelled", "none"];
      const ACCESS_ROLES = {
        owner: "Dono",
        admin: "Administrador",
        manager: "Gestor",
        technician: "Técnico",
        client: "Cliente",
        viewer: "Visualizador"
      };
      const PRIORITIES = ["Alta", "Média", "Baixa"];
      const STATUSES = ["Não iniciado", "Em andamento", "Concluído", "Cancelado"];
      const DEFAULT_RESPONSIBLES = ["Empresa", "Empresa/Consultoria", "Consultoria", "RH", "SESMT", "CIPA", "Brigada", "Medicina do Trabalho"];
      const AVATAR_COLORS = ["#2563eb", "#0f766e", "#7c3aed", "#b45309", "#be123c", "#475569", "#0369a1", "#15803d"];
      const FOLDER_COLORS = ["#2563eb", "#0f766e", "#7c3aed", "#b45309", "#be123c", "#475569", "#0891b2", "#16a34a"];
      const AVATAR_CANVAS_SIZE = 160;
      const INACTIVITY_LOGOUT_MS = 60 * 60 * 1000;
      const HIDDEN_SYNC_PAUSE_MS = 10 * 60 * 1000;
      const INACTIVITY_RESET_THROTTLE_MS = 30 * 1000;
      const INACTIVITY_LOG_THROTTLE_MS = 60 * 1000;
      const SYNC_LEADER_TTL_MS = 45 * 1000;
      const SYNC_LEADER_HEARTBEAT_MS = 15 * 1000;
      const DEFAULT_DESCRIPTION = "A execução de cada uma das ações propostas configura um fator relevante para a redução dos riscos identificados, por isso deve ser considerado os responsáveis para que seja possível a aplicação de um ciclo de melhoria contínua (PDCA), onde após a realização de cada ação seja realizada uma nova análise dos riscos trabalhados e então atualizado o inventário de riscos.";
      const RESTRICTED_ADMIN_EMAILS = new Set(["administrativo@protege.med.br"]);
      const IMPROVEMENTS_OWNER_EMAIL = "abner.l@outlook.com";
      const SUPER_ADMIN_EMAIL = "abner.l@outlook.com";
      const DOCUMENT_AUTOMATION_OWNER_EMAIL = "abner.l@outlook.com";
      const DOCUMENT_AUTOMATION_MAX_FILE_BYTES = 10 * 1024 * 1024;
      const MANAGEMENT_PHASE_1_EMAILS = new Set([SUPER_ADMIN_EMAIL, "administrativo@protege.med.br"]);
      const MANAGEMENT_PERMISSION_KEYS = [
        "accessManagement", "phase1View", "manageSuggestions", "viewActivity", "deleteLogs",
        "manageProfiles", "manageFolders", "managePlans", "manageHiddenItems", "managePermissions",
        "manageProcedures", "editProcedureDrafts", "publishProcedures", "restoreProcedureVersions",
        "importProcedureLibrary", "exportProcedureLibrary", "manageActionPlanTemplates",
        "manageBackups",
        "restoreBackups", "viewAuditTrail", "deleteAuditTrail", "manageSystemSettings",
        "manageMaintenanceMode", "runDiagnostics",
        "repairData", "exportFullSystem", "importFullSystem"
      ];
      const MANAGEMENT_PERMISSION_LABELS = {
        accessManagement: "Acessar Gestão SATS",
        phase1View: "Visualizar Fase 1",
        manageSuggestions: "Gerenciar sugestões",
        viewActivity: "Ver atividades",
        deleteLogs: "Excluir logs",
        manageProfiles: "Gerenciar perfis",
        manageFolders: "Gerenciar pastas",
        managePlans: "Gerenciar planos",
        manageHiddenItems: "Gerenciar itens ocultos",
        managePermissions: "Gerenciar permissões",
        manageProcedures: "Gerenciar Procedimentos",
        editProcedureDrafts: "Editar rascunhos de Procedimentos",
        publishProcedures: "Publicar Procedimentos",
        restoreProcedureVersions: "Restaurar versões de Procedimentos",
        importProcedureLibrary: "Importar biblioteca de Procedimentos",
        exportProcedureLibrary: "Exportar biblioteca de Procedimentos",
        manageActionPlanTemplates: "Gerenciar templates do Plano de Ação",
        manageBackups: "Gerenciar backups",
        restoreBackups: "Restaurar backups",
        viewAuditTrail: "Ver auditoria avançada",
        deleteAuditTrail: "Limpar auditoria",
        manageSystemSettings: "Gerenciar configurações globais",
        manageMaintenanceMode: "Gerenciar modo manutenção",
        runDiagnostics: "Executar diagnóstico",
        repairData: "Reparar dados",
        exportFullSystem: "Exportar sistema completo",
        importFullSystem: "Importar sistema completo"
      };
      const ADMIN_MODE_SESSION_KEY = "sats.adminMode.v1";
      const IMPROVEMENT_WIDGET_STATE_KEY = "sats.improvementWidget.v1";
      const RESOLVED_IMPROVEMENTS_STATE_KEY = "sats.resolvedImprovements.v1";
      const MAX_SUGGESTION_ATTACHMENT_BYTES = 3 * 1024 * 1024;
      const SUGGESTION_ATTACHMENT_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);
      const SUGGESTION_STATUSES = new Set(["open", "resolved", "rejected", "archived"]);

      console.info("[APP_VERSION]", APP_VERSION);

      let app = createEmptyApp();
      let supabaseClient = null;
      let currentUser = null;
      let cloudReady = false;
      let isHydrating = true;
      let hydrateUserPromise = null;
      let hydrateUserId = "";
      let saveTimer = null;
      let tabInstanceId = "tab-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
      let inactivityTimer = null;
      let inactivityTimerResetAt = 0;
      let inactivityResetLogAt = 0;
      let hiddenSyncPauseTimer = null;
      let hiddenAt = 0;
      let inactivityLogoutInProgress = false;
      let pendingSignOutMessage = "";
      let authRedirectMessage = "";
      let pendingPasswordRecovery = false;
      let passwordRecoveryMode = false;
      let restrictedAccessLogs = [];
      let teamProfiles = [];
      let pendingProtectedAction = null;
      let syncTimer = null;
      let syncLeaderTimer = null;
      let realtimeChannel = null;
      let lastSharedUpdatedAt = "";
      let lastLocalChangeAt = 0;
      let lastCloudSaveAt = 0;
      let isSavingCloud = false;
      let dirtyProfileIds = new Set();
      let pendingProfileDeletes = new Set();
      let pendingPlanDeletes = new Set();
      let pendingFolderDeletes = new Set();
      let pendingRowDeletes = new Set();
      let pendingHiddenAdds = new Set();
      let pendingHiddenRemoves = new Set();
      let pendingFullSave = false;
      let pendingManagementSave = false;
      let pendingImprovementsSave = false;
      let pendingActivityIds = new Set();
      let onlineUserIds = new Set();
      let selectedActions = new Set();
      let draggingRow = null;
      let draggingPlanId = null;
      const PLAN_UNDO_LIMIT = 50;
      const planEditHistories = new Map();
      let isRestoringPlanHistory = false;
      let selectedFolderForContext = null;
      let selectedProfileColor = AVATAR_COLORS[0];
      let selectedFolderColor = FOLDER_COLORS[0];
      let pendingProfilePhoto = "";
      let profilePhotoEditor = createPhotoEditorState();
      let activeRichEditor = null;
      let activeRichRange = null;
      let selectedRichImage = null;
      let richToolbarUserMoved = false;
      let richToolbarDragState = null;
      let selectedPortalApp = null;
      let activeDocumentAutomationProjectId = "";
      let documentAutomationDraft = null;
      let activeDocumentAutomationStep = "type";
      let adminModeEnabled = sessionStorage.getItem(ADMIN_MODE_SESSION_KEY) === "on";
      let activeManagementTab = "dashboard";
      let activeProcedureAdminView = "overview";
      let activeProcedureCategoryId = "laudos-fisicos";
      let activePhysicalReportId = null;
      let activeFlowPreviewState = {};
      let activeProcedurePreviewSource = "draft";
      let activeProcedureVersionPreviewId = "";
      let activeManagementPlansView = "plans";
      let editingActionPlanTemplateId = "";
      let editingActionPlanTemplateDraft = null;
      // Chaves legadas continuam disponíveis apenas para manter rotinas antigas inofensivas.
      const managementFilters = { profiles: "", folders: "", plans: "", planProfile: "", planFolder: "", templates: "", templateStatus: "all", suggestions: "", suggestionStatus: "all", activity: "", activityAction: "", activityUser: "", audit: "", auditAction: "", auditUser: "", clients: "", units: "", sectors: "", commercialClient: "" };
      let selectedManagementLogIds = new Set();
      let managementPlanEditContext = null;
      let managementFilterRenderTimer = null;
      let defaultProceduresHtmlCache = "";
      let managementFormResolver = null;
      let managementConfirmResolver = null;
      let activeManagementSuggestionView = "open";
      let pendingSuggestionAttachment = null;
      let activeSuggestionNotificationId = "";
      const postponedSuggestionNotificationIds = new Set();

      const els = {
        authScreen: document.getElementById("authScreen"),
        authForm: document.getElementById("authForm"),
        authEmail: document.getElementById("authEmail"),
        authPassword: document.getElementById("authPassword"),
        authMessage: document.getElementById("authMessage"),
        restrictedReadonlyBanner: document.getElementById("restrictedReadonlyBanner"),
        passwordMessage: document.getElementById("passwordMessage"),
        switchUserMessage: document.getElementById("switchUserMessage"),
        appSelectorScreen: document.getElementById("appSelectorScreen"),
        appSelectorUserEmail: document.getElementById("appSelectorUserEmail"),
        managementAppCardMount: document.getElementById("managementAppCardMount"),
        managementScreen: document.getElementById("managementScreen"),
        managementUserEmail: document.getElementById("managementUserEmail"),
        managementAccessBadge: document.getElementById("managementAccessBadge"),
        managementTabs: document.getElementById("managementTabs"),
        managementContent: document.getElementById("managementContent"),
        managementPermissionForm: document.getElementById("managementPermissionForm"),
        managementPermissionCheckboxes: document.getElementById("managementPermissionCheckboxes"),
        actionPlanTemplateForm: document.getElementById("actionPlanTemplateForm"),
        actionPlanTemplateEditorAreas: document.getElementById("actionPlanTemplateEditorAreas"),
        documentAutomationScreen: document.getElementById("documentAutomationScreen"),
        documentAutomationRoot: document.getElementById("documentAutomationRoot"),
        proceduresScreen: document.getElementById("proceduresScreen"),
        proceduresFrame: document.getElementById("proceduresFrame"),
        profileScreen: document.getElementById("profileScreen"),
        themeToggleBtn: document.getElementById("themeToggleBtn"),
        adminModeToggle: document.getElementById("adminModeToggle"),
        folderScreen: document.getElementById("folderScreen"),
        editorScreen: document.getElementById("editorScreen"),
        profileGrid: document.getElementById("profileGrid"),
        improvementWidgetToggle: document.getElementById("improvementWidgetToggle"),
        improvementPanel: document.getElementById("improvementPanel"),
        improvementForm: document.getElementById("improvementForm"),
        improvementText: document.getElementById("improvementText"),
        improvementAttachment: document.getElementById("improvementAttachment"),
        improvementAttachmentPreview: document.getElementById("improvementAttachmentPreview"),
        suggestionWeeklyRanking: document.getElementById("suggestionWeeklyRanking"),
        suggestionWeeklyRankingList: document.getElementById("suggestionWeeklyRankingList"),
        improvementOwnerPanel: document.getElementById("improvementOwnerPanel"),
        improvementList: document.getElementById("improvementList"),
        resolvedImprovementPanel: document.getElementById("resolvedImprovementPanel"),
        resolvedImprovementToggle: document.getElementById("resolvedImprovementToggle"),
        resolvedImprovementCount: document.getElementById("resolvedImprovementCount"),
        resolvedImprovementList: document.getElementById("resolvedImprovementList"),
        activeProfileBadge: document.getElementById("activeProfileBadge"),
        folderList: document.getElementById("folderList"),
        plansGrid: document.getElementById("plansGrid"),
        selectedFolderTitle: document.getElementById("selectedFolderTitle"),
        folderSummary: document.getElementById("folderSummary"),
        planTitleInput: document.getElementById("planTitleInput"),
        saveStatus: document.getElementById("saveStatus"),
        actionsBody: document.getElementById("actionsBody"),
        equipmentBody: document.getElementById("equipmentBody"),
        trainingsBody: document.getElementById("trainingsBody"),
        searchInput: document.getElementById("searchInput"),
        priorityFilter: document.getElementById("priorityFilter"),
        statusFilter: document.getElementById("statusFilter"),
        responsibleFilter: document.getElementById("responsibleFilter"),
        selectAllActions: document.getElementById("selectAllActions"),
        selectionCount: document.getElementById("selectionCount"),
        bulkStatus: document.getElementById("bulkStatus"),
        responsibleSuggestions: document.getElementById("responsibleSuggestions"),
        profileModal: document.getElementById("profileModal"),
        folderModal: document.getElementById("folderModal"),
        planModal: document.getElementById("planModal"),
        profileColorPalette: document.getElementById("profileColorPalette"),
        folderColorPalette: document.getElementById("folderColorPalette"),
        folderContextMenu: document.getElementById("folderContextMenu"),
        folderToggleHiddenAction: document.getElementById("folderToggleHiddenAction"),
        richToolbar: document.getElementById("richToolbar"),
        richImageInput: document.getElementById("richImageInput"),
        suggestionReportForm: document.getElementById("suggestionReportForm"),
        suggestionRejectionForm: document.getElementById("suggestionRejectionForm"),
        suggestionNotificationReport: document.getElementById("suggestionNotificationReport")
      };

      const bodyBySection = {
        actions: els.actionsBody,
        equipment: els.equipmentBody,
        trainings: els.trainingsBody
      };

      const sectionLabels = {
        actions: "ação",
        equipment: "item",
        trainings: "treinamento"
      };

      const icons = {
        edit: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
        copy: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
        trash: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4c0-1 .7-2 2-2h4c1.3 0 2 1 2 2v2"/><path d="M19 6l-1 14c-.1 1.1-.9 2-2 2H8c-1.1 0-1.9-.9-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
        eye: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
        eyeOff: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.4 5.4A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-2.1 3.1"/><path d="M6.6 6.6C3.6 8.5 2 12 2 12s3.5 7 10 7a10.6 10.6 0 0 0 4.2-.9"/></svg>'
      };

      function egressDiag(event, detail = {}) {
        const payload = { at: new Date().toISOString(), ...detail };
        console.info(EGRESS_DIAG_PREFIX, event, payload);
      }

      function egressDiagCaller() {
        try {
          return String(new Error().stack || "")
            .split("\n")
            .slice(2, 7)
            .map(line => line.trim())
            .filter(Boolean)
            .join(" <- ");
        } catch (error) {
          return "";
        }
      }

      function snapshotDiag(snapshot) {
        return {
          fullSave: !!(snapshot && snapshot.fullSave),
          management: !!(snapshot && snapshot.management),
          profiles: snapshot && snapshot.profileIds ? snapshot.profileIds.length : dirtyProfileIds.size,
          deletedProfiles: snapshot && snapshot.deletedProfileIds ? snapshot.deletedProfileIds.length : pendingProfileDeletes.size,
          deletedPlans: snapshot && snapshot.deletedPlanIds ? snapshot.deletedPlanIds.length : pendingPlanDeletes.size,
          deletedFolders: snapshot && snapshot.deletedFolderIds ? snapshot.deletedFolderIds.length : pendingFolderDeletes.size,
          deletedRows: snapshot && snapshot.deletedRows ? snapshot.deletedRows.length : pendingRowDeletes.size,
          improvements: snapshot ? !!snapshot.improvements : pendingImprovementsSave,
          activities: snapshot && snapshot.activityIds ? snapshot.activityIds.length : pendingActivityIds.size,
          hiddenAdds: snapshot && snapshot.hiddenAdds ? snapshot.hiddenAdds.length : pendingHiddenAdds.size,
          hiddenRemoves: snapshot && snapshot.hiddenRemoves ? snapshot.hiddenRemoves.length : pendingHiddenRemoves.size
        };
      }

      function bindSessionLifecycleEvents() {
        ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click", "input"].forEach(eventName => {
          document.addEventListener(eventName, () => resetInactivityTimer(), { passive: true, capture: true });
        });
      }

      init();

      async function init() {
        applyStoredTheme();
        bindGlobalEvents();
        bindSessionLifecycleEvents();
        renderColorPalette(els.profileColorPalette, AVATAR_COLORS, selectedProfileColor, handleProfileColorSelect);
        renderColorPalette(els.folderColorPalette, FOLDER_COLORS, selectedFolderColor, handleFolderColorSelect);
        setupSupabase();
        await handleAuthRedirectParams();
        await hydrateAuthenticatedUser();
        isHydrating = false;
        renderApp();
      }

      function applyStoredTheme() {
        applyTheme(readThemePreference(), { persist: false });
      }

      function readThemePreference() {
        try {
          const userTheme = currentUser ? localStorage.getItem(THEME_USER_PREFIX + currentUser.id) : "";
          const globalTheme = localStorage.getItem(THEME_KEY);
          const stored = userTheme || globalTheme;
          return stored === "dark" ? "dark" : "light";
        } catch (error) {
          return "light";
        }
      }

      function toggleThemePreference() {
        const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        applyTheme(nextTheme, { persist: true });
      }

      function applyTheme(theme, options = {}) {
        const normalized = theme === "dark" ? "dark" : "light";
        document.documentElement.dataset.theme = normalized;
        if (options.persist) {
          try {
            localStorage.setItem(THEME_KEY, normalized);
            if (currentUser) localStorage.setItem(THEME_USER_PREFIX + currentUser.id, normalized);
          } catch (error) {
            console.warn("Não foi possível salvar a preferência de tema:", error);
          }
          recordActivity("Alterou tema", `Tema visual alterado para ${normalized === "dark" ? "modo dark" : "modo light"}.`);
        }
        updateThemeToggle();
      }

      function updateThemeToggle() {
        if (!els.themeToggleBtn) return;
        const isDark = document.documentElement.dataset.theme === "dark";
        els.themeToggleBtn.classList.toggle("is-dark", isDark);
        els.themeToggleBtn.setAttribute("aria-pressed", String(isDark));
        els.themeToggleBtn.title = isDark ? "Alterar para modo claro" : "Alterar para modo escuro";
        const label = els.themeToggleBtn.querySelector("[data-theme-label]");
        if (label) label.textContent = isDark ? "Modo dark" : "Modo light";
      }

      function isRestrictedAdminEmail(email) {
        return RESTRICTED_ADMIN_EMAILS.has(normalizeEmail(email));
      }

      function isRestrictedAdminUser(user = currentUser) {
        if (!user || !isRestrictedAdminEmail(user.email)) return false;
        if (user === currentUser && managementPlanEditContext && canManagePlans(user)
          && selectedPortalApp === "plans" && app.view === "editor"
          && app.activeProfileId === managementPlanEditContext.profileId
          && app.activePlanId === managementPlanEditContext.planId) return false;
        return true;
      }

      function normalizeEmail(email) {
        return String(email || "").trim().toLocaleLowerCase("pt-BR");
      }

      function canAccessDocumentAutomation(user = currentUser) {
        return !!user && normalizeEmail(user.email) === normalizeEmail(DOCUMENT_AUTOMATION_OWNER_EMAIL);
      }

      function canAccessManagementPhase1(user = currentUser) {
        if (!user) return false;
        if (isFullSystemAdmin(user)) return true;
        const email = normalizeEmail(user.email);
        if (MANAGEMENT_PHASE_1_EMAILS.has(email)) return true;
        return hasManagementPermission("accessManagement", user) || hasManagementPermission("phase1View", user);
      }

      function isFullSystemAdmin(user = currentUser) {
        return !!user && normalizeEmail(user.email) === normalizeEmail(SUPER_ADMIN_EMAIL);
      }

      function getManagementPermissionForEmail(email) {
        const normalized = normalizeEmail(email);
        return (app.managementPermissions?.users || []).find(entry => normalizeEmail(entry.email) === normalized) || null;
      }

      function hasManagementPermission(permission, user = currentUser) {
        if (isFullSystemAdmin(user)) return true;
        if (!user || !MANAGEMENT_PERMISSION_KEYS.includes(permission)) return false;
        const record = getManagementPermissionForEmail(user.email);
        return record?.status !== "inactive" && !!record?.permissions?.[permission];
      }

      function canManageSuggestions(user = currentUser) { return isFullSystemAdmin(user) || MANAGEMENT_PHASE_1_EMAILS.has(normalizeEmail(user?.email)) || hasManagementPermission("manageSuggestions", user); }
      function canViewActivity(user = currentUser) { return isFullSystemAdmin(user) || MANAGEMENT_PHASE_1_EMAILS.has(normalizeEmail(user?.email)) || hasManagementPermission("viewActivity", user); }
      function canDeleteLogs(user = currentUser) { return hasManagementPermission("deleteLogs", user); }
      function canManageProfiles(user = currentUser) { return hasManagementPermission("manageProfiles", user); }
      function canManageFolders(user = currentUser) { return hasManagementPermission("manageFolders", user); }
      function canManagePlans(user = currentUser) { return hasManagementPermission("managePlans", user); }
      function canManageHiddenItems(user = currentUser) { return hasManagementPermission("manageHiddenItems", user); }
      function canManagePermissions(user = currentUser) { return hasManagementPermission("managePermissions", user); }
      function canManageProcedures(user = currentUser) { return hasManagementPermission("manageProcedures", user); }
      function canEditProcedureDrafts(user = currentUser) { return hasManagementPermission("editProcedureDrafts", user); }
      function canPublishProcedures(user = currentUser) { return hasManagementPermission("publishProcedures", user); }
      function canRestoreProcedureVersions(user = currentUser) { return hasManagementPermission("restoreProcedureVersions", user); }
      function canImportProcedureLibrary(user = currentUser) { return hasManagementPermission("importProcedureLibrary", user); }
      function canExportProcedureLibrary(user = currentUser) { return hasManagementPermission("exportProcedureLibrary", user); }
      function canManageActionPlanTemplates(user = currentUser) { return hasManagementPermission("manageActionPlanTemplates", user); }
      function canManageClients(user = currentUser) { return hasManagementPermission("manageClients", user); }
      function canManageUnits(user = currentUser) { return hasManagementPermission("manageUnits", user); }
      function canManageSectors(user = currentUser) { return hasManagementPermission("manageSectors", user); }
      function canManageAccessScopes(user = currentUser) { return hasManagementPermission("manageAccessScopes", user); }
      function canManageBackups(user = currentUser) { return hasManagementPermission("manageBackups", user); }
      function canRestoreBackups(user = currentUser) { return hasManagementPermission("restoreBackups", user); }
      function canViewAuditTrail(user = currentUser) { return hasManagementPermission("viewAuditTrail", user); }
      function canDeleteAuditTrail(user = currentUser) { return hasManagementPermission("deleteAuditTrail", user); }
      function canManageSystemSettings(user = currentUser) { return hasManagementPermission("manageSystemSettings", user); }
      function canManageCommercial(user = currentUser) { return hasManagementPermission("manageCommercial", user); }
      function canManageLicenses(user = currentUser) { return hasManagementPermission("manageLicenses", user); }
      function canManageMaintenanceMode(user = currentUser) { return hasManagementPermission("manageMaintenanceMode", user); }
      function canRunDiagnostics(user = currentUser) { return hasManagementPermission("runDiagnostics", user); }
      function canRepairData(user = currentUser) { return hasManagementPermission("repairData", user); }
      function canExportFullSystem(user = currentUser) { return hasManagementPermission("exportFullSystem", user); }
      function canImportFullSystem(user = currentUser) { return hasManagementPermission("importFullSystem", user); }

      function normalizeManagementScope(scope = {}) {
        const ids = value => Array.isArray(value) ? [...new Set(value.filter(Boolean).map(String))] : [];
        return {
          allClients: scope.allClients === true,
          clientIds: ids(scope.clientIds),
          unitIds: ids(scope.unitIds),
          sectorIds: ids(scope.sectorIds),
          profileIds: ids(scope.profileIds),
          folderIds: ids(scope.folderIds),
          planIds: ids(scope.planIds)
        };
      }

      // Escopos empresariais permanecem apenas para leitura de dados legados.
      function canAccessClient(clientId, user = currentUser) { return canAccessManagementPhase1(user); }
      function canAccessUnit(unitId, user = currentUser) {
        return canAccessManagementPhase1(user);
      }
      function canAccessSector(sectorId, user = currentUser) {
        return canAccessManagementPhase1(user);
      }
      function canAccessProfile(profileOrId, user = currentUser) {
        const profile = typeof profileOrId === "string" ? app.profiles?.find(item => item.id === profileOrId) : profileOrId;
        return !!profile && canAccessManagementPhase1(user);
      }
      function canAccessPlan(planOrId, user = currentUser) {
        const profile = typeof planOrId === "string" ? app.profiles?.find(entry => entry.plans?.some(candidate => candidate.id === planOrId)) : app.profiles?.find(entry => entry.plans?.some(candidate => candidate.id === planOrId?.id));
        const plan = typeof planOrId === "string" ? profile?.plans?.find(candidate => candidate.id === planOrId) : planOrId;
        return !!plan && canAccessManagementPhase1(user);
      }
      function canAccessHiddenItems(user = currentUser) {
        if (isFullSystemAdmin(user)) return isSystemAdminUser(user);
        return canManageHiddenItems(user);
      }

      function requireManagementPermission(permission, message = "Você não tem permissão para executar esta ação.") {
        if (hasManagementPermission(permission)) return true;
        showToast(message, "danger");
        return false;
      }

      function requirePermission(checkFn, message = "Você não tem permissão para executar esta ação.") {
        if (typeof checkFn === "function" ? checkFn() : !!checkFn) return true;
        showToast(message, "danger");
        return false;
      }

      function showToast(message, type = "info", timeout = 3500) {
        const stack = document.getElementById("toastStack");
        if (!stack) return;
        const toast = document.createElement("div");
        toast.className = `toast is-${["info", "success", "warning", "danger"].includes(type) ? type : "info"}`;
        toast.innerHTML = `<span>${escapeHtml(String(message || ""))}</span><button type="button" aria-label="Fechar mensagem">&times;</button>`;
        const remove = () => toast.remove();
        toast.querySelector("button").addEventListener("click", remove);
        stack.appendChild(toast);
        if (timeout > 0) setTimeout(remove, timeout);
      }

      function showInlineError(container, message) {
        if (!container) return;
        container.textContent = String(message || "");
        container.classList.toggle("hidden", !message);
      }

      function managementFieldHtml(field) {
        const type = field.type || "text";
        const wide = field.wide || type === "textarea" || type === "multi-email";
        const required = field.required ? " required" : "";
        const placeholder = field.placeholder ? ` placeholder="${escapeAttr(field.placeholder)}"` : "";
        const value = field.value ?? "";
        if (type === "checkbox") {
          return `<label class="field ${wide ? "is-wide" : ""}"><span>${escapeHtml(field.label || field.name)}</span><span class="checkbox-line"><input type="checkbox" name="${escapeAttr(field.name)}" ${value ? "checked" : ""}> ${escapeHtml(field.help || field.label || "")}</span></label>`;
        }
        if (type === "select") {
          const options = (field.options || []).map(option => {
            const optionValue = typeof option === "object" ? option.value : option;
            const optionLabel = typeof option === "object" ? option.label : option;
            return `<option value="${escapeAttr(optionValue)}" ${String(optionValue) === String(value) ? "selected" : ""}>${escapeHtml(optionLabel)}</option>`;
          }).join("");
          return `<label class="field ${wide ? "is-wide" : ""}">${escapeHtml(field.label || field.name)}<select name="${escapeAttr(field.name)}"${required}>${options}</select></label>`;
        }
        if (type === "textarea" || type === "multi-email") {
          return `<label class="field ${wide ? "is-wide" : ""}">${escapeHtml(field.label || field.name)}<textarea name="${escapeAttr(field.name)}" rows="${field.rows || 4}"${required}${placeholder}>${escapeHtml(value)}</textarea></label>`;
        }
        return `<label class="field ${wide ? "is-wide" : ""}">${escapeHtml(field.label || field.name)}<input type="${escapeAttr(type)}" name="${escapeAttr(field.name)}" value="${escapeAttr(value)}"${required}${placeholder}${field.accept ? ` accept="${escapeAttr(field.accept)}"` : ""}></label>`;
      }

      function settleManagementForm(value) {
        if (!managementFormResolver) return;
        const resolve = managementFormResolver;
        managementFormResolver = null;
        closeModal("managementFormModal");
        document.removeEventListener("keydown", handleManagementUtilityEscape);
        resolve(value);
      }

      function settleManagementConfirm(value) {
        if (!managementConfirmResolver) return;
        const resolve = managementConfirmResolver;
        managementConfirmResolver = null;
        closeModal("managementConfirmModal");
        document.removeEventListener("keydown", handleManagementUtilityEscape);
        resolve(value);
      }

      function handleManagementUtilityEscape(event) {
        if (event.key !== "Escape") return;
        if (!document.getElementById("managementConfirmModal").classList.contains("hidden")) settleManagementConfirm(false);
        else if (!document.getElementById("managementFormModal").classList.contains("hidden")) settleManagementForm(null);
      }

      function openManagementFormModal(options = {}) {
        if (managementFormResolver) settleManagementForm(null);
        const form = document.getElementById("managementDynamicForm");
        const fields = Array.isArray(options.fields) ? options.fields : [];
        document.getElementById("managementFormModalTitle").textContent = options.title || "Editar dados";
        const description = document.getElementById("managementFormModalDescription");
        description.textContent = options.description || "";
        description.classList.toggle("hidden", !options.description);
        document.getElementById("managementDynamicFields").innerHTML = fields.map(managementFieldHtml).join("");
        document.getElementById("managementFormSubmitBtn").textContent = options.submitLabel || "Salvar";
        document.getElementById("managementFormCancelBtn").textContent = options.cancelLabel || "Cancelar";
        showInlineError(document.getElementById("managementDynamicError"), "");
        openModal("managementFormModal");
        document.addEventListener("keydown", handleManagementUtilityEscape);
        return new Promise(resolve => {
          managementFormResolver = resolve;
          const cancel = () => settleManagementForm(null);
          document.getElementById("managementFormCancelBtn").onclick = cancel;
          document.getElementById("managementFormModalClose").onclick = cancel;
          form.onsubmit = event => {
            event.preventDefault();
            const values = {};
            fields.forEach(field => {
              const control = form.elements[field.name];
              values[field.name] = field.type === "checkbox" ? !!control?.checked : String(control?.value ?? "").trim();
            });
            const error = typeof options.validate === "function" ? options.validate(values) : "";
            if (error) {
              showInlineError(document.getElementById("managementDynamicError"), error);
              return;
            }
            settleManagementForm(values);
          };
          requestAnimationFrame(() => form.querySelector("input:not([type='checkbox']), select, textarea")?.focus());
        });
      }

      function openConfirmModal(options = {}) {
        if (managementConfirmResolver) settleManagementConfirm(false);
        const requiredText = String(options.requiredText || "");
        document.getElementById("managementConfirmTitle").textContent = options.title || "Confirmar ação";
        document.getElementById("managementConfirmMessage").textContent = options.message || "";
        document.getElementById("managementConfirmCancelBtn").textContent = options.cancelLabel || "Cancelar";
        const submit = document.getElementById("managementConfirmSubmitBtn");
        submit.textContent = options.confirmLabel || "Confirmar";
        submit.className = `button ${options.tone === "primary" ? "primary" : "danger"}`;
        const field = document.getElementById("managementConfirmRequiredField");
        const input = document.getElementById("managementConfirmRequiredInput");
        field.classList.toggle("hidden", !requiredText);
        input.value = "";
        input.placeholder = requiredText;
        submit.disabled = !!requiredText;
        input.oninput = () => { submit.disabled = input.value !== requiredText; };
        openModal("managementConfirmModal");
        document.addEventListener("keydown", handleManagementUtilityEscape);
        return new Promise(resolve => {
          managementConfirmResolver = resolve;
          const cancel = () => settleManagementConfirm(false);
          document.getElementById("managementConfirmCancelBtn").onclick = cancel;
          document.getElementById("managementConfirmClose").onclick = cancel;
          submit.onclick = () => settleManagementConfirm(!requiredText || input.value === requiredText);
          requestAnimationFrame(() => (requiredText ? input : submit).focus());
        });
      }

      function managementConfirm(message, options = {}) {
        return openConfirmModal({ message, ...options });
      }

      async function managementPrompt(message, initialValue = "") {
        const values = await openManagementFormModal({
          title: "Informar dado",
          description: message,
          fields: [{ name: "value", label: "Resposta", value: initialValue, wide: true }],
          submitLabel: "Continuar"
        });
        return values ? values.value : null;
      }

      function isSystemAdminAccount(user = currentUser) {
        return isFullSystemAdmin(user);
      }

      function isSystemAdminUser(user = currentUser) {
        return isSystemAdminAccount(user) && adminModeEnabled;
      }

      function toggleSystemAdminMode() {
        if (!isSystemAdminAccount()) return;
        adminModeEnabled = !adminModeEnabled;
        sessionStorage.setItem(ADMIN_MODE_SESSION_KEY, adminModeEnabled ? "on" : "off");
        if (!adminModeEnabled) enforceHiddenItemVisibility();
        renderApp();
      }

      function updateAdminModeToggle() {
        if (!els.adminModeToggle) return;
        const visible = !!currentUser && isSystemAdminAccount();
        els.adminModeToggle.classList.toggle("hidden", !visible);
        els.adminModeToggle.classList.toggle("is-active", visible && adminModeEnabled);
        els.adminModeToggle.setAttribute("aria-pressed", String(visible && adminModeEnabled));
        const label = adminModeEnabled ? "Desativar modo administrador" : "Ativar modo administrador";
        els.adminModeToggle.title = label;
        els.adminModeToggle.setAttribute("aria-label", label);
        syncProceduresAdminMode();
      }

      function syncProceduresAdminMode() {
        if (!els.proceduresFrame || !els.proceduresFrame.contentWindow) return;
        els.proceduresFrame.contentWindow.postMessage({
          type: "sats:set-admin-mode",
          active: isSystemAdminUser()
        }, "*");
      }

      function enforceRestrictedAdminView() {
        if (!isRestrictedAdminUser()) return false;
        selectedActions.clear();
        ["profileModal", "folderModal", "planModal", "logModal", "switchUserModal"].forEach(id => {
          const modal = document.getElementById(id);
          if (modal) modal.classList.add("hidden");
        });
        hideFolderContextMenu();
        hideRichToolbar();
        return true;
      }

      function warnRestrictedAdminAccess() {
        if (!isRestrictedAdminUser()) return false;
        return true;
      }

      function blockRestrictedAdminAccess(detail = "Tentativa bloqueada de executar ação restrita.") {
        if (!isRestrictedAdminUser()) return false;
        recordRestrictedAttempt(detail);
        enforceRestrictedAdminView();
        saveApp({ localOnly: true });
        renderApp();
        return true;
      }

      function recordRestrictedAttempt(detail) {
        if (!isRestrictedAdminUser()) return null;
        const profile = currentProfile();
        const plan = currentPlan();
        const entry = {
          id: createId(),
          at: new Date().toISOString(),
          action: RESTRICTED_ATTEMPT_ACTION,
          detail: detail || "Tentativa bloqueada no modo somente leitura operacional.",
          userId: currentUser ? currentUser.id : "",
          userEmail: currentUser ? currentUser.email || "" : "",
          userName: "",
          profileId: profile ? profile.id || "" : "",
          profileName: profile ? profile.name || "" : "",
          planId: plan ? plan.id || "" : "",
          planTitle: plan ? plan.title || "" : ""
        };
        restrictedAccessLogs = normalizeActivityLog([entry, ...restrictedAccessLogs]);
        saveRestrictedAccessAttempt(entry).catch(error => console.warn("Não foi possível registrar a tentativa restrita:", error));
        return entry;
      }

      async function saveRestrictedAccessAttempt(entry) {
        if (!supabaseClient || !currentUser || !entry) return;
        const { error } = await supabaseClient
          .from("restricted_access_logs")
          .insert({
            user_id: entry.userId,
            user_email: entry.userEmail,
            detail: entry.detail,
            profile_id: entry.profileId,
            profile_name: entry.profileName,
            plan_id: entry.planId,
            plan_title: entry.planTitle,
            created_at: entry.at
          });
        if (error) throw error;
      }

      async function loadRestrictedAccessLogs() {
        if (!supabaseClient || !currentUser || isRestrictedAdminUser()) {
          restrictedAccessLogs = [];
          return;
        }
        const { data, error } = await supabaseClient
          .from("restricted_access_logs")
          .select("id, created_at, user_id, user_email, detail, profile_id, profile_name, plan_id, plan_title")
          .order("created_at", { ascending: false })
          .limit(120);
        if (error) {
          console.warn("Log de acessos restritos indisponível:", error);
          restrictedAccessLogs = [];
          return;
        }
        restrictedAccessLogs = normalizeActivityLog((data || []).map(row => ({
          id: row.id || createId(),
          at: row.created_at || new Date().toISOString(),
          action: RESTRICTED_ATTEMPT_ACTION,
          detail: row.detail || "",
          userId: row.user_id || "",
          userEmail: row.user_email || "",
          userName: "",
          profileId: row.profile_id || "",
          profileName: row.profile_name || "",
          planId: row.plan_id || "",
          planTitle: row.plan_title || ""
        })));
      }

      function updateRestrictedAdminUi() {
        const restricted = isRestrictedAdminUser() && selectedPortalApp !== "management";
        document.body.classList.toggle("restricted-readonly", restricted);
        if (els.restrictedReadonlyBanner) {
          els.restrictedReadonlyBanner.classList.toggle("hidden", !restricted);
        }
      }

      function recordActivity(action, detail = "", context = {}) {
        if (!LOGGED_ACTIVITY_ACTIONS.has(action)) return null;
        if (!app || !Array.isArray(app.activityLog)) app.activityLog = [];
        const targetProfile = context.profile || currentProfile() || null;
        const actorProfile = currentUserOwnProfile();
        const plan = context.plan || currentPlan() || null;
        const entry = {
          id: createId(),
          at: new Date().toISOString(),
          action,
          detail,
          userId: currentUser ? currentUser.id : "",
          userEmail: currentUser ? currentUser.email || "" : "",
          userName: actorProfile ? actorProfile.name || "" : "",
          profileId: targetProfile ? targetProfile.id || "" : "",
          profileName: targetProfile ? targetProfile.name || "" : "",
          planId: plan ? plan.id || "" : context.planId || "",
          planTitle: plan ? plan.title || "" : context.planTitle || ""
        };
        app.activityLog.unshift(entry);
        app.activityLog = normalizeActivityLog(app.activityLog);
        recordAudit({
          action,
          entityType: plan ? "plan" : targetProfile ? "profile" : "system",
          entityId: plan?.id || targetProfile?.id || SHARED_STATE_ID,
          entityLabel: plan?.title || targetProfile?.name || "SATS",
          clientId: plan?.clientId || targetProfile?.clientId || "",
          profileId: targetProfile?.id || "",
          planId: plan?.id || "",
          summary: detail,
          source: "activity"
        });
        saveApp({ activityId: entry.id });
        const logModal = document.getElementById("logModal");
        if (logModal && !logModal.classList.contains("hidden")) renderActivityLog();
        return entry;
      }

      function recordAudit(entry = {}) {
        if (!app || !Array.isArray(app.auditTrail)) app.auditTrail = [];
        const recent = app.auditTrail[0];
        if (recent && recent.action === entry.action && recent.entityId === String(entry.entityId || "") && recent.summary === String(entry.summary || "") && Date.now() - new Date(recent.at).getTime() < 2000) return recent;
        const normalized = normalizeAuditTrail([{
          id: entry.id || createId(),
          at: entry.at || new Date().toISOString(),
          actorEmail: entry.actorEmail || currentUser?.email || "",
          actorName: entry.actorName || currentUserOwnProfile()?.name || "",
          action: entry.action || "Atividade administrativa",
          entityType: entry.entityType || "",
          entityId: entry.entityId || "",
          entityLabel: entry.entityLabel || "",
          clientId: entry.clientId || "",
          profileId: entry.profileId || "",
          folderId: entry.folderId || "",
          planId: entry.planId || "",
          before: entry.before || null,
          after: entry.after || null,
          summary: entry.summary || "",
          source: entry.source || "management",
          severity: entry.severity || "info"
        }])[0];
        app.auditTrail.unshift(normalized);
        app.auditTrail = normalizeAuditTrail(app.auditTrail);
        return normalized;
      }

      function pruneSystemStorage() {
        if (!app) return;
        if (!Array.isArray(app.auditTrail)) app.auditTrail = [];
        if (app.auditTrail.length > MAX_AUDIT_TRAIL) app.auditTrail = app.auditTrail.slice(0, MAX_AUDIT_TRAIL);
        if (!Array.isArray(app.activityLog)) app.activityLog = [];
        if (app.activityLog.length > MAX_ACTIVITY_LOG) app.activityLog = app.activityLog.slice(0, MAX_ACTIVITY_LOG);
        app.suggestionNotifications = normalizeSuggestionNotifications(app.suggestionNotifications).slice(0, 500);
        app.suggestionWeeklyRanking = normalizeSuggestionWeeklyRanking(app.suggestionWeeklyRanking);
        if (!app.backupCenter || !Array.isArray(app.backupCenter.snapshots) || !app.backupCenter.settings) {
          app.backupCenter = normalizeBackupCenter(app.backupCenter);
        }
        const maxSnapshots = Math.max(1, Number(app.backupCenter.settings.maxSnapshots) || MAX_INTERNAL_BACKUPS);
        if (app.backupCenter.snapshots.length > maxSnapshots) {
          app.backupCenter.snapshots = app.backupCenter.snapshots.slice(0, maxSnapshots);
        }
      }

      function renderActivityLog() {
        const list = document.getElementById("activityLogList");
        if (!list) return;
        const entries = normalizeActivityLog([...(app.activityLog || []), ...restrictedAccessLogs])
          .filter(entry => LOGGED_ACTIVITY_ACTIONS.has(entry.action))
          .slice(0, 120);
        if (!entries.length) {
          list.innerHTML = '<div class="empty-state">Nenhum registro de exclusão ou acesso restrito ainda.</div>';
          return;
        }
        list.innerHTML = entries.map(entry => `
          <div class="activity-entry">
            <strong>${escapeHtml(entry.action)}</strong>
            <span>${escapeHtml(activityActor(entry))} - ${escapeHtml(formatDateTime(entry.at))}</span>
            ${entry.detail ? `<small>${escapeHtml(entry.detail)}</small>` : ""}
            ${entry.profileName || entry.planTitle ? `<small>${escapeHtml([entry.profileName ? "Perfil: " + entry.profileName : "", entry.planTitle ? "Plano: " + entry.planTitle : ""].filter(Boolean).join(" | "))}</small>` : ""}
          </div>
        `).join("");
      }

      function activityActor(entry) {
        if (entry.userName && entry.userEmail) return `${entry.userName} (${entry.userEmail})`;
        return entry.userName || entry.userEmail || "Usuário";
      }

      function bindGlobalEvents() {
        const favicon = document.getElementById("satsFavicon");
        const satsLogo = document.querySelector(".auth-logo");
        if (favicon && satsLogo) favicon.href = satsLogo.src;
        els.authForm.addEventListener("submit", handleLogin);
        document.getElementById("forgotPasswordBtn").addEventListener("click", handleForgotPassword);
        document.getElementById("appSelectorLogoutBtn").addEventListener("click", logout);
        document.getElementById("backToAppSelectorBtn").addEventListener("click", showAppSelector);
        document.getElementById("managementBackBtn").addEventListener("click", showAppSelector);
        window.addEventListener("message", handlePortalMessage);
        if (els.proceduresFrame) els.proceduresFrame.addEventListener("load", syncProceduresAdminMode);
        document.querySelectorAll("[data-app-choice]").forEach(button => {
          button.addEventListener("click", handleAppChoice);
        });
        document.getElementById("settingsBtn").addEventListener("click", openSettingsModal);
        document.getElementById("settingsChangePasswordBtn").addEventListener("click", () => {
          closeModal("settingsModal");
          openPasswordModal();
        });
        document.getElementById("settingsLogBtn").addEventListener("click", async () => {
          if (blockRestrictedAdminAccess("Tentou consultar o log do sistema.")) return;
          closeModal("settingsModal");
          await syncSharedStateFromCloud({ force: true, allowWhileEditing: true, source: "open-log-modal" });
          await loadRestrictedAccessLogs();
          renderActivityLog();
          openModal("logModal");
        });
        document.getElementById("settingsLogoutBtn").addEventListener("click", () => {
          closeModal("settingsModal");
          logout();
        });
        document.getElementById("passwordForm").addEventListener("submit", handlePasswordChange);
        document.querySelectorAll("[data-toggle-password]").forEach(button => {
          button.addEventListener("click", togglePasswordVisibility);
        });
        document.getElementById("switchUserForm").addEventListener("submit", handleSwitchUserLogin);
        if (els.themeToggleBtn) els.themeToggleBtn.addEventListener("click", toggleThemePreference);
        if (els.adminModeToggle) els.adminModeToggle.addEventListener("click", toggleSystemAdminMode);
        if (els.managementTabs) els.managementTabs.addEventListener("click", handleManagementTabClick);
        if (els.managementContent) {
          els.managementContent.addEventListener("click", handleManagementClick);
          els.managementContent.addEventListener("input", handleManagementFilterInput);
          els.managementContent.addEventListener("change", handleManagementFilterInput);
          els.managementContent.addEventListener("input", handleManagementProcedureInput);
          els.managementContent.addEventListener("change", handleManagementProcedureInput);
        }
        if (els.managementPermissionForm) els.managementPermissionForm.addEventListener("submit", saveManagementPermissionFromModal);
        if (els.managementPermissionCheckboxes) els.managementPermissionCheckboxes.addEventListener("change", enforcePermissionDependencies);
        if (els.actionPlanTemplateForm) els.actionPlanTemplateForm.addEventListener("submit", saveActionPlanTemplateFromModal);
        if (els.actionPlanTemplateEditorAreas) els.actionPlanTemplateEditorAreas.addEventListener("click", handleActionPlanTemplateEditorClick);
        document.getElementById("logoutBtn").addEventListener("click", logout);
        document.getElementById("logoutBtnEditor").addEventListener("click", logout);
        document.getElementById("switchProfileBtn").addEventListener("click", () => showProfiles());
        document.getElementById("newPlanBtn").addEventListener("click", openPlanModal);
        document.getElementById("newFolderBtn").addEventListener("click", () => openFolderModal());
        document.getElementById("backToFoldersBtn").addEventListener("click", () => showFolders());
        document.getElementById("profileForm").addEventListener("submit", saveProfileFromModal);
        document.getElementById("profileDeleteBtn").addEventListener("click", deleteProfileFromModal);
        document.getElementById("folderForm").addEventListener("submit", saveFolderFromModal);
        document.getElementById("planForm").addEventListener("submit", createPlanFromModal);
        document.getElementById("profilePhotoInput").addEventListener("change", handleProfilePhoto);
        document.getElementById("profilePhotoZoomInput").addEventListener("input", handleProfilePhotoZoom);
        document.getElementById("profilePhotoResetBtn").addEventListener("click", resetProfilePhotoCrop);
        document.getElementById("profilePhotoCancelBtn").addEventListener("click", cancelProfilePhotoCrop);
        document.getElementById("profilePhotoApplyBtn").addEventListener("click", applyProfilePhotoCrop);
        const photoCanvas = document.getElementById("profilePhotoCanvas");
        photoCanvas.addEventListener("pointerdown", handleProfilePhotoPointerDown);
        photoCanvas.addEventListener("pointermove", handleProfilePhotoPointerMove);
        photoCanvas.addEventListener("pointerup", handleProfilePhotoPointerUp);
        photoCanvas.addEventListener("pointercancel", handleProfilePhotoPointerUp);
        document.getElementById("refreshLogBtn").addEventListener("click", async () => {
          if (blockRestrictedAdminAccess()) return;
          await syncSharedStateFromCloud({ force: true, allowWhileEditing: true, source: "refresh-log" });
          await loadRestrictedAccessLogs();
          renderActivityLog();
        });
        document.querySelectorAll("[data-close-modal]").forEach(button => {
          button.addEventListener("click", () => closeModal(button.dataset.closeModal));
        });

        els.profileGrid.addEventListener("click", handleProfileGridClick);
        els.improvementWidgetToggle.addEventListener("click", toggleImprovementWidget);
        els.improvementForm.addEventListener("submit", submitImprovementSuggestion);
        els.improvementAttachment.addEventListener("change", handleSuggestionAttachmentSelect);
        els.improvementAttachmentPreview.addEventListener("click", handlePendingSuggestionAttachmentClick);
        els.improvementList.addEventListener("click", handleImprovementListClick);
        els.resolvedImprovementToggle.addEventListener("click", toggleResolvedImprovements);
        els.resolvedImprovementList.addEventListener("click", handleImprovementListClick);
        els.suggestionReportForm.addEventListener("submit", sendSuggestionResolutionReport);
        document.getElementById("saveSuggestionReportDraftBtn").addEventListener("click", saveSuggestionResolutionDraft);
        els.suggestionRejectionForm.addEventListener("submit", submitSuggestionRejection);
        document.getElementById("suggestionNotificationSeenBtn").addEventListener("click", acknowledgeSuggestionNotification);
        document.getElementById("suggestionNotificationLaterBtn").addEventListener("click", postponeSuggestionNotification);
        els.folderList.addEventListener("click", handleFolderClick);
        els.folderList.addEventListener("dblclick", handleFolderDoubleClick);
        els.folderList.addEventListener("contextmenu", handleFolderContext);
        els.folderList.addEventListener("dragover", handleFolderDragOver);
        els.folderList.addEventListener("dragleave", handleFolderDragLeave);
        els.folderList.addEventListener("drop", handleFolderDrop);
        els.plansGrid.addEventListener("click", handlePlanClick);
        els.plansGrid.addEventListener("change", handlePlanMove);
        els.plansGrid.addEventListener("dragstart", handlePlanDragStart);
        els.plansGrid.addEventListener("dragend", handlePlanDragEnd);
        els.folderContextMenu.addEventListener("click", handleFolderContextAction);
        document.addEventListener("click", event => {
          if (!event.target.closest("#folderContextMenu")) hideFolderContextMenu();
          if (!event.target.closest("#richToolbar") && !event.target.closest(".rich-editor")) scheduleToolbarHide();
        });

        els.planTitleInput.addEventListener("input", () => {
          if (isRestrictedAdminUser()) {
            const plan = currentPlan();
            if (plan) els.planTitleInput.value = plan.title;
            return;
          }
          const plan = currentPlan();
          if (!plan) return;
          pushPlanUndoState("Alterou o título do plano", { coalesceKey: "plan-title" });
          plan.title = els.planTitleInput.value || "Plano sem nome";
          touchPlan(plan);
          saveApp();
          markSaved();
        });

        document.querySelectorAll("[data-meta]").forEach(field => {
          field.addEventListener("input", handleMetaInput);
        });
        document.getElementById("templateActionSelect").addEventListener("change", applyTemplateChoiceToCurrentPlan);
        document.getElementById("addValidityBtn").addEventListener("click", openValidityModal);
        document.getElementById("validityForm").addEventListener("submit", applyValidityToCurrentPlan);
        document.getElementById("companyLogoUploadBtn").addEventListener("click", () => {
          if (!blockRestrictedAdminAccess()) document.getElementById("companyLogoInput").click();
        });
        document.getElementById("companyLogoRemoveBtn").addEventListener("click", removeCompanyLogo);
        document.getElementById("companyLogoInput").addEventListener("change", handleCompanyLogoUpload);
        document.getElementById("undoPlanBtn").addEventListener("click", undoCurrentPlanChange);
        document.getElementById("redoPlanBtn").addEventListener("click", redoCurrentPlanChange);
        document.getElementById("printBtn").addEventListener("click", exportExecutivePdf);
        document.getElementById("exportWordBtn").addEventListener("click", exportExecutiveWord);
        document.getElementById("exportJpegBtn").addEventListener("click", exportExecutiveJpeg);
        document.getElementById("exportJsonBtn").addEventListener("click", exportJson);
        document.getElementById("importJsonBtn").addEventListener("click", () => {
          if (blockRestrictedAdminAccess()) return;
          document.getElementById("importJsonInput").click();
        });
        document.getElementById("importJsonInput").addEventListener("change", importJson);
        document.querySelectorAll("[data-add-section]").forEach(button => {
          button.addEventListener("click", () => addRow(button.dataset.addSection));
        });

        [els.searchInput, els.priorityFilter, els.statusFilter, els.responsibleFilter].forEach(control => {
          control.addEventListener("input", renderEditorTables);
          control.addEventListener("change", renderEditorTables);
        });

        els.selectAllActions.addEventListener("change", toggleAllVisibleActions);
        document.getElementById("applyBulkStatus").addEventListener("click", applyBulkStatus);
        document.getElementById("deleteSelected").addEventListener("click", deleteSelectedActions);

        Object.values(bodyBySection).forEach(tbody => {
          tbody.addEventListener("input", handleTableInput);
          tbody.addEventListener("change", handleTableChange);
          tbody.addEventListener("click", handleTableClick);
          tbody.addEventListener("paste", handleRichPaste);
          tbody.addEventListener("drop", handleRichDrop);
          tbody.addEventListener("dragover", handleRichDragOver);
          tbody.addEventListener("focusin", handleRichFocus);
          tbody.addEventListener("keyup", handleRichKeyup);
          tbody.addEventListener("mouseup", handleRichMouseup);
          tbody.addEventListener("dragstart", handleRowDragStart);
          tbody.addEventListener("dragover", handleRowDragOver);
          tbody.addEventListener("drop", handleRowDrop);
          tbody.addEventListener("dragend", handleRowDragEnd);
        });

        els.richToolbar.addEventListener("mousedown", event => {
          if (!event.target.closest("select")) event.preventDefault();
        });
        els.richToolbar.addEventListener("pointerdown", handleRichToolbarDragStart);
        els.richToolbar.addEventListener("dblclick", resetRichToolbarPosition);
        els.richToolbar.addEventListener("click", handleRichToolbarClick);
        document.getElementById("richBlockSelect").addEventListener("change", applyRichBlock);
        document.getElementById("richSizeSelect").addEventListener("change", applyRichSize);
        document.getElementById("richImageBtn").addEventListener("click", () => els.richImageInput.click());
        els.richImageInput.addEventListener("change", handleRichImageUpload);
        document.addEventListener("selectionchange", updateRichToolbarPosition);
        document.addEventListener("keydown", handleGlobalDeleteImage);
        document.addEventListener("keydown", handlePlanHistoryShortcut);
        window.addEventListener("pagehide", () => {
          const ownProfile = updateOwnLastAccess();
          if (currentUser && cloudReady) recordActivity("Saiu do sistema", "Aba fechada, recarregada ou sessão encerrada.");
          if (ownProfile) saveApp({ profileId: ownProfile.id });
          if (saveTimer) {
            clearTimeout(saveTimer);
            saveTimer = null;
          }
          saveAppToCloud({ source: "pagehide" });
          stopSharedSync();
          clearSessionLifecycleTimers();
          if (supabaseClient) supabaseClient.auth.signOut();
        });
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("storage", handleCrossTabStorage);
        window.addEventListener("focus", () => {
          if (!currentUser || !cloudReady) return;
          startSharedSync({ source: "window-focus", steal: true });
          syncSharedStateFromCloud({ source: "window-focus", force: true, allowWhileEditing: true });
        });
      }

      function resetInactivityTimer(options = {}) {
        if (!currentUser || !cloudReady || inactivityLogoutInProgress) return;
        const now = Date.now();
        const force = !!options.force;
        if (!force && inactivityTimer && now - inactivityTimerResetAt < INACTIVITY_RESET_THROTTLE_MS) return;
        if (inactivityTimer) clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
          handleInactivityLogout().catch(error => console.warn("Falha ao encerrar por inatividade:", error));
        }, INACTIVITY_LOGOUT_MS);
        inactivityTimerResetAt = now;
        if (force || now - inactivityResetLogAt >= INACTIVITY_LOG_THROTTLE_MS) {
          inactivityResetLogAt = now;
          egressDiag("inactivity timer resetado", { timeoutMs: INACTIVITY_LOGOUT_MS });
        }
      }

      function clearInactivityTimer() {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        inactivityTimer = null;
        inactivityTimerResetAt = 0;
      }

      function clearHiddenSyncPauseTimer() {
        if (hiddenSyncPauseTimer) clearTimeout(hiddenSyncPauseTimer);
        hiddenSyncPauseTimer = null;
        hiddenAt = 0;
      }

      function clearSessionLifecycleTimers() {
        clearInactivityTimer();
        clearHiddenSyncPauseTimer();
      }

      function readSyncLeader() {
        const raw = localStorage.getItem(SYNC_LEADER_KEY);
        if (!raw) return null;
        try {
          return JSON.parse(raw);
        } catch (error) {
          console.warn("Controle de aba lider invalido ignorado:", error);
          localStorage.removeItem(SYNC_LEADER_KEY);
          return null;
        }
      }

      function writeSyncLeader(reason = "heartbeat") {
        if (!currentUser) return;
        localStorage.setItem(SYNC_LEADER_KEY, JSON.stringify({
          tabId: tabInstanceId,
          userId: currentUser.id,
          updatedAt: Date.now(),
          appVersion: APP_VERSION,
          reason
        }));
      }

      function isFreshSyncLeader(leader, now = Date.now()) {
        return !!leader
          && !!leader.tabId
          && !!leader.userId
          && Number.isFinite(Number(leader.updatedAt))
          && now - Number(leader.updatedAt) < SYNC_LEADER_TTL_MS;
      }

      function isCurrentSyncLeader() {
        if (!currentUser) return false;
        const leader = readSyncLeader();
        return !!leader
          && leader.tabId === tabInstanceId
          && leader.userId === currentUser.id
          && isFreshSyncLeader(leader);
      }

      function ensureSyncLeader(options = {}) {
        if (!currentUser || !cloudReady) return false;
        const reason = options.reason || "unknown";
        const now = Date.now();
        const leader = readSyncLeader();
        const ownLeader = leader && leader.tabId === tabInstanceId && leader.userId === currentUser.id;
        const staleLeader = !isFreshSyncLeader(leader, now);
        const canClaim = ownLeader
          || staleLeader
          || !!options.steal
          || !leader
          || leader.userId !== currentUser.id;

        if (!canClaim || (!ownLeader && document.visibilityState !== "visible" && !options.allowHidden)) {
          egressDiag("aba secundaria sem Supabase ativo", {
            reason,
            leaderAgeMs: leader && leader.updatedAt ? now - Number(leader.updatedAt) : null,
            hasLeader: !!leader
          });
          return false;
        }

        writeSyncLeader(reason);
        startSyncLeaderHeartbeat();
        if (!ownLeader) egressDiag("aba assumiu sync Supabase", { reason, previousLeaderAgeMs: leader && leader.updatedAt ? now - Number(leader.updatedAt) : null });
        return true;
      }

      function startSyncLeaderHeartbeat() {
        if (syncLeaderTimer) return;
        syncLeaderTimer = setInterval(() => {
          if (!currentUser || !cloudReady || document.visibilityState !== "visible" || !isCurrentSyncLeader()) {
            stopSyncLeaderHeartbeat();
            return;
          }
          writeSyncLeader("heartbeat");
        }, SYNC_LEADER_HEARTBEAT_MS);
      }

      function stopSyncLeaderHeartbeat() {
        if (syncLeaderTimer) clearInterval(syncLeaderTimer);
        syncLeaderTimer = null;
      }

      function releaseSyncLeadership() {
        stopSyncLeaderHeartbeat();
        const leader = readSyncLeader();
        if (leader && leader.tabId === tabInstanceId) {
          localStorage.removeItem(SYNC_LEADER_KEY);
          egressDiag("lideranca de sync liberada");
        }
      }

      function handleCrossTabStorage(event) {
        if (!currentUser || !cloudReady) return;
        if (event.key === SYNC_LEADER_KEY) {
          const leader = readSyncLeader();
          const currentOwnsLeader = leader && leader.tabId === tabInstanceId && leader.userId === currentUser.id;
          if ((syncTimer || realtimeChannel) && !currentOwnsLeader) {
            egressDiag("outra aba assumiu sync; Supabase local removido", {
              hasLeader: !!leader
            });
            stopSharedSync({ releaseLeadership: false });
            return;
          }
          if (!leader && document.visibilityState === "visible") {
            startSharedSync({ source: "leader-released", steal: true });
          }
          return;
        }

        if (event.key === PRESENCE_STORAGE_KEY) {
          applyPresenceCacheFromAnotherTab();
          return;
        }
        if (event.key !== SHARED_STORAGE_KEY && event.key !== SHARED_UPDATED_AT_CACHE_KEY) return;
        if (isCurrentSyncLeader()) return;
        applySharedCacheFromAnotherTab();
      }

      function writePresenceCache() {
        if (!currentUser || !isCurrentSyncLeader()) return;
        localStorage.setItem(PRESENCE_STORAGE_KEY, JSON.stringify({
          updatedAt: Date.now(),
          userIds: Array.from(onlineUserIds)
        }));
      }

      function applyPresenceCacheFromAnotherTab() {
        if (!currentUser || !cloudReady || isCurrentSyncLeader()) return;
        const raw = localStorage.getItem(PRESENCE_STORAGE_KEY);
        if (!raw) return;
        try {
          const data = JSON.parse(raw);
          onlineUserIds = new Set(Array.isArray(data.userIds) ? data.userIds.filter(Boolean) : []);
          if (app.view === "profiles") renderProfiles();
        } catch (error) {
          console.warn("Cache local de presenca ignorado:", error);
        }
      }

      function applySharedCacheFromAnotherTab() {
        if (!currentUser || !cloudReady || hasPendingCloudChanges() || isUserEditing()) return;
        const cachedUpdatedAt = readLocalSharedUpdatedAt();
        if (cachedUpdatedAt && cachedUpdatedAt === lastSharedUpdatedAt) return;
        const cached = readLocalSharedCache();
        if (!cached) return;
        app = restoreLocalNavigation(cached, captureLocalNavigation());
        if (cachedUpdatedAt) lastSharedUpdatedAt = cachedUpdatedAt;
        selectedActions.clear();
        renderApp();
        if (app.view === "editor") markSaved();
        egressDiag("cache compartilhado aplicado de outra aba", { cachedUpdatedAt });
      }

      async function handleInactivityLogout() {
        if (!currentUser || inactivityLogoutInProgress) return;
        inactivityLogoutInProgress = true;
        try {
          egressDiag("sessão encerrada por inatividade", {
            hasPendingCloudChanges: hasPendingCloudChanges(),
            readonly: isRestrictedAdminUser()
          });
          if (saveTimer) {
            clearTimeout(saveTimer);
            saveTimer = null;
          }
          if (!isRestrictedAdminUser() && hasPendingCloudChanges()) {
            await saveAppToCloud({ source: "inactivity-logout" });
          }
          if (saveTimer) {
            clearTimeout(saveTimer);
            saveTimer = null;
          }
          pendingSignOutMessage = "Sessão encerrada por inatividade.";
          stopSharedSync();
          clearSessionLifecycleTimers();
          if (supabaseClient) {
            await supabaseClient.auth.signOut();
          } else {
            currentUser = null;
            cloudReady = false;
            app = createEmptyApp();
            selectedActions.clear();
            renderApp();
            setAuthMessage("Sessão encerrada por inatividade.", "");
          }
        } finally {
          if (currentUser) inactivityLogoutInProgress = false;
        }
      }

      function handleVisibilityChange() {
        if (document.visibilityState === "hidden") {
          handleTabHidden();
          return;
        }
        handleTabVisible().catch(error => console.warn("Falha ao retomar sincronização:", error));
      }

      function handleTabHidden() {
        egressDiag("aba oculta, sync pausado", { pauseAfterMs: HIDDEN_SYNC_PAUSE_MS });
        stopSyncLeaderHeartbeat();
        const ownProfile = updateOwnLastAccess();
        if (ownProfile) {
          saveApp({ profileId: ownProfile.id });
          flushCloudSave();
        }
        if (hiddenSyncPauseTimer) clearTimeout(hiddenSyncPauseTimer);
        hiddenAt = Date.now();
        hiddenSyncPauseTimer = setTimeout(() => {
          hiddenSyncPauseTimer = null;
          if (document.visibilityState !== "hidden") return;
          egressDiag("aba oculta há 10min, realtime removido", {
            hiddenForMs: Date.now() - hiddenAt
          });
          stopSharedSync();
        }, HIDDEN_SYNC_PAUSE_MS);
      }

      async function handleTabVisible() {
        clearHiddenSyncPauseTimer();
        egressDiag("aba visível, sync retomado");
        if (!supabaseClient || !currentUser || inactivityLogoutInProgress) return;
        resetInactivityTimer({ force: true });
        const { data, error } = await supabaseClient.auth.getSession();
        if (error || !data.session || !data.session.user) {
          pendingSignOutMessage = "Sessão encerrada.";
          stopSharedSync();
          clearSessionLifecycleTimers();
          currentUser = null;
          cloudReady = false;
          app = createEmptyApp();
          selectedActions.clear();
          renderApp();
          setAuthMessage(pendingSignOutMessage, "");
          pendingSignOutMessage = "";
          return;
        }
        if (cloudReady) {
          startSharedSync({ source: "tab-visible", steal: true });
          await syncSharedStateFromCloud({ force: true, allowWhileEditing: true, source: "tab-visible" });
        }
      }

      function setupSupabase() {
        if (!window.supabase || !window.supabase.createClient) {
          setAuthMessage("Não foi possível carregar o Supabase. Verifique sua conexão.", "error");
          return;
        }
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: true
          }
        });
        supabaseClient.auth.onAuthStateChange((event, session) => {
          if (event === "PASSWORD_RECOVERY") {
            pendingPasswordRecovery = true;
            if (session && session.user) {
              hydrateUser(session.user).then(() => {
                openPasswordModal({ recovery: true });
                setPasswordMessage("Digite uma nova senha para concluir a redefinição.", "");
              });
            }
            return;
          }
          if (event === "SIGNED_OUT") {
            stopSharedSync();
            clearSessionLifecycleTimers();
            currentUser = null;
            cloudReady = false;
            app = createEmptyApp();
            selectedActions.clear();
            renderApp();
            const message = pendingSignOutMessage || authRedirectMessage || "Sessão encerrada.";
            const tone = pendingSignOutMessage ? "" : (authRedirectMessage ? "error" : "ok");
            pendingSignOutMessage = "";
            inactivityLogoutInProgress = false;
            setAuthMessage(message, tone);
            return;
          }
          if (session && session.user && (!currentUser || currentUser.id !== session.user.id)) {
            hydrateUser(session.user);
          }
        });
      }

      async function handleAuthRedirectParams() {
        const params = new URLSearchParams((window.location.hash || "").replace(/^#/, ""));
        const query = new URLSearchParams(window.location.search || "");
        const error = params.get("error") || query.get("error");
        const errorCode = params.get("error_code") || query.get("error_code");
        const errorDescription = params.get("error_description") || query.get("error_description");
        const type = params.get("type") || query.get("type");

        if (type === "recovery") {
          pendingPasswordRecovery = true;
          cleanAuthUrl();
          return;
        }

        if (!error && !errorCode && !errorDescription) return;
        authRedirectMessage = errorCode === "otp_expired"
          ? "O link de redefinição expirou ou já foi usado. Peça um novo link em \"Esqueci minha senha\"."
          : decodeURIComponent((errorDescription || error || "Não foi possível validar o link de acesso.").replace(/\+/g, " "));
        cleanAuthUrl();
        if (supabaseClient) await supabaseClient.auth.signOut();
        currentUser = null;
        cloudReady = false;
        app = createEmptyApp();
        setAuthMessage(authRedirectMessage, "error");
      }

      function cleanAuthUrl() {
        if (!window.history || !window.history.replaceState) return;
        window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
      }

      async function hydrateAuthenticatedUser() {
        if (!supabaseClient) return;
        if (!authRedirectMessage) setAuthMessage("Verificando sessão...", "");
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) {
          setAuthMessage(error.message, "error");
          return;
        }
        if (data.session && data.session.user) {
          await hydrateUser(data.session.user);
        } else {
          app = createEmptyApp();
          currentUser = null;
          cloudReady = false;
          if (authRedirectMessage) setAuthMessage(authRedirectMessage, "error");
          else setAuthMessage("Entre ou crie um usuário para começar.", "");
        }
      }

      async function hydrateUser(user) {
        if (currentUser && currentUser.id === user.id && cloudReady) return;
        if (hydrateUserPromise && hydrateUserId === user.id) {
          egressDiag("hydrateUser reutilizando hidratação em andamento", { userId: user.id });
          return hydrateUserPromise;
        }
        hydrateUserId = user.id;
        hydrateUserPromise = (async () => {
          if (currentUser && currentUser.id !== user.id) stopSharedSync();
          currentUser = user;
          postponedSuggestionNotificationIds.clear();
          applyStoredTheme();
          cloudReady = false;
          setAuthMessage("Carregando seus dados do banco...", "");
          try {
            app = await loadAppFromCloud(user);
            await publishOwnProfileIfNeeded();
            await loadTeamProfiles();
            app.view = "profiles";
            app.activeProfileId = null;
            app.activeFolderId = DEFAULT_FOLDER_ID;
            app.activePlanId = null;
            cloudReady = true;
            startSharedSync();
            resetInactivityTimer({ force: true });
            const ownProfile = isRestrictedAdminUser(user) ? null : updateOwnLastAccess();
            recordActivity("Entrou no sistema", `Login realizado por ${user.email || "usuário"}.`, { profile: ownProfile || null });
            if (ownProfile) saveApp({ profileId: ownProfile.id });
            else saveApp({ localOnly: true });
            renderApp();
            setAuthMessage(`Conectado como ${user.email || "usuário"}.`, "ok");
            if (pendingPasswordRecovery) {
              pendingPasswordRecovery = false;
              openPasswordModal({ recovery: true });
              setPasswordMessage("Digite uma nova senha para concluir a redefinição.", "");
            }
          } catch (error) {
            console.error(error);
            app = createEmptyApp();
            cloudReady = false;
            stopSharedSync();
            renderApp();
            setAuthMessage("Login aceito, mas o banco compartilhado não abriu. Verifique a tabela shared_states, as políticas RLS e a conexão antes de usar.", "error");
            if (pendingPasswordRecovery) {
              pendingPasswordRecovery = false;
              openPasswordModal({ recovery: true });
              setPasswordMessage("Digite uma nova senha para concluir a redefinição.", "");
            }
          } finally {
            hydrateUserPromise = null;
            hydrateUserId = "";
          }
        })();
        return hydrateUserPromise;
      }

      async function handleLogin(event) {
        event.preventDefault();
        if (!supabaseClient) return setAuthMessage("Supabase não carregou. Atualize a página.", "error");
        const email = els.authEmail.value.trim();
        const password = els.authPassword.value;
        if (!email || !password) return setAuthMessage("Informe e-mail e senha.", "error");
        setAuthMessage("Entrando...", "");
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) return setAuthMessage(error.message, "error");
        await hydrateUser(data.user);
      }

      async function handleForgotPassword() {
        if (!supabaseClient) return setAuthMessage("Supabase não carregou. Atualize a página.", "error");
        const email = els.authEmail.value.trim();
        if (!email) return setAuthMessage("Informe seu e-mail para receber o link de redefinição.", "error");
        setAuthMessage("Enviando e-mail de redefinição...", "");
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + window.location.pathname
        });
        if (error) return setAuthMessage(error.message, "error");
        setAuthMessage("E-mail enviado. Abra o link recebido para criar uma nova senha.", "ok");
      }

      function openSettingsModal() {
        document.getElementById("settingsUserEmail").textContent = currentUser && currentUser.email ? currentUser.email : "Usuário conectado";
        document.getElementById("settingsLogBtn").classList.toggle("hidden", isRestrictedAdminUser());
        if (isRestrictedAdminUser()) {
          const list = document.getElementById("activityLogList");
          if (list) list.innerHTML = "";
        } else {
          renderActivityLog();
        }
        openModal("settingsModal");
      }

      function openPasswordModal(options = {}) {
        passwordRecoveryMode = !!options.recovery;
        const currentField = document.getElementById("currentPasswordField");
        const currentInput = document.getElementById("currentPasswordInput");
        document.getElementById("passwordForm").dataset.mode = passwordRecoveryMode ? "recovery" : "change";
        currentField.classList.toggle("hidden", passwordRecoveryMode);
        currentInput.required = !passwordRecoveryMode;
        currentInput.value = "";
        document.getElementById("newPasswordInput").value = "";
        document.getElementById("confirmPasswordInput").value = "";
        document.querySelectorAll("[data-toggle-password]").forEach(button => {
          const input = document.getElementById(button.dataset.togglePassword);
          if (input) input.type = "password";
          button.classList.remove("is-visible");
          button.setAttribute("aria-pressed", "false");
          button.title = "Mostrar senha";
        });
        setPasswordMessage("", "");
        openModal("passwordModal");
        setTimeout(() => document.getElementById(passwordRecoveryMode ? "newPasswordInput" : "currentPasswordInput").focus(), 30);
      }

      function togglePasswordVisibility(event) {
        const button = event.currentTarget;
        const input = document.getElementById(button.dataset.togglePassword);
        if (!input) return;
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        button.classList.toggle("is-visible", show);
        button.setAttribute("aria-pressed", String(show));
        button.title = show ? "Ocultar senha" : "Mostrar senha";
        button.setAttribute("aria-label", show ? "Ocultar senha" : "Mostrar senha");
      }

      async function handlePasswordChange(event) {
        event.preventDefault();
        if (!supabaseClient) return setPasswordMessage("Supabase não carregou. Atualize a página.", "error");
        const currentPassword = document.getElementById("currentPasswordInput").value;
        const password = document.getElementById("newPasswordInput").value;
        const confirmPassword = document.getElementById("confirmPasswordInput").value;
        const isRecovery = document.getElementById("passwordForm").dataset.mode === "recovery" || passwordRecoveryMode;
        if (!isRecovery && !currentPassword) return setPasswordMessage("Confirme sua senha atual.", "error");
        if (password.length < 6) return setPasswordMessage("A senha precisa ter pelo menos 6 caracteres.", "error");
        if (password !== confirmPassword) return setPasswordMessage("As senhas não conferem.", "error");
        setPasswordMessage("Atualizando senha...", "");
        if (!isRecovery) {
          const email = currentUser && currentUser.email ? currentUser.email : "";
          if (!email) return setPasswordMessage("Não foi possível identificar o e-mail do usuário conectado.", "error");
          const { data: verifyData, error: verifyError } = await supabaseClient.auth.signInWithPassword({ email, password: currentPassword });
          if (verifyError) return setPasswordMessage("Senha atual incorreta.", "error");
          if (!verifyData.user || verifyData.user.id !== currentUser.id) {
            return setPasswordMessage("A senha atual não pertence ao usuário conectado.", "error");
          }
          currentUser = verifyData.user;
        }
        const updatePayload = isRecovery ? { password } : { password, currentPassword };
        const { error } = await supabaseClient.auth.updateUser(updatePayload);
        if (error) return setPasswordMessage(error.message, "error");
        recordActivity("Alterou senha", "Senha do usuário conectado foi alterada.");
        setPasswordMessage("Senha alterada com sucesso.", "ok");
        setTimeout(() => closeModal("passwordModal"), 900);
      }

      async function handleSwitchUserLogin(event) {
        event.preventDefault();
        if (!supabaseClient) return setSwitchUserMessage("Supabase não carregou. Atualize a página.", "error");
        const email = document.getElementById("switchUserEmailInput").value.trim();
        const password = document.getElementById("switchUserPasswordInput").value;
        if (!email || !password) return setSwitchUserMessage("Informe a senha.", "error");
        if (!pendingProtectedAction) return setSwitchUserMessage("Nenhuma ação protegida em andamento.", "error");
        const action = pendingProtectedAction;
        const targetProfile = app.profiles.find(profile => profile.id === action.profileId);
        if (!targetProfile || normalizeText(targetProfile.email) !== normalizeText(email)) {
          return setSwitchUserMessage("Este perfil não está vinculado a este e-mail.", "error");
        }
        setSwitchUserMessage("Confirmando senha do perfil...", "");
        await flushCloudSave();
        const verifierClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
          }
        });
        const { data, error } = await verifierClient.auth.signInWithPassword({ email, password });
        await verifierClient.auth.signOut();
        if (error) return setSwitchUserMessage("Senha incorreta.", "error");
        if (!data.user || normalizeText(data.user.email) !== normalizeText(targetProfile.email)) {
          return setSwitchUserMessage("A senha informada não pertence a este perfil.", "error");
        }
        await syncSharedStateFromCloud({ force: true, allowWhileEditing: true, source: "protected-action-verified" });
        pendingProtectedAction = null;
        closeModal("switchUserModal");
        if (action.action === "edit") openProfileModal(action.profileId);
        if (action.action === "delete") await deleteProfile(action.profileId);
      }

      async function logout() {
        const ownProfile = updateOwnLastAccess();
        recordActivity("Saiu do sistema", "Logout realizado pelo usuário.");
        if (ownProfile) saveApp({ profileId: ownProfile.id });
        await flushCloudSave();
        adminModeEnabled = false;
        managementPlanEditContext = null;
        selectedManagementLogIds.clear();
        sessionStorage.removeItem(ADMIN_MODE_SESSION_KEY);
        if (supabaseClient) await supabaseClient.auth.signOut();
      }

      function setAuthMessage(message, tone) {
        els.authMessage.textContent = message || "";
        els.authMessage.classList.toggle("is-error", tone === "error");
        els.authMessage.classList.toggle("is-ok", tone === "ok");
      }

      function setPasswordMessage(message, tone) {
        els.passwordMessage.textContent = message || "";
        els.passwordMessage.classList.toggle("is-error", tone === "error");
        els.passwordMessage.classList.toggle("is-ok", tone === "ok");
      }

      function setSwitchUserMessage(message, tone) {
        els.switchUserMessage.textContent = message || "";
        els.switchUserMessage.classList.toggle("is-error", tone === "error");
        els.switchUserMessage.classList.toggle("is-ok", tone === "ok");
      }

      async function loadAppFromCloud(user) {
        const localCache = readLocalSharedCache();
        const cachedUpdatedAt = readLocalSharedUpdatedAt();
        const migrationDone = isRestrictedAdminUser(user) || !!localStorage.getItem(`${LOCAL_MIGRATION_KEY}.${user.id}`);
        egressDiag("loadAppFromCloud chamada", {
          hasLocalCache: !!localCache,
          cachedUpdatedAt,
          migrationDone
        });
        const remoteUpdatedAt = await fetchSharedStateUpdatedAt({ source: "loadAppFromCloud", throwOnError: true });
        if (remoteUpdatedAt && localCache && cachedUpdatedAt === remoteUpdatedAt && migrationDone) {
          lastSharedUpdatedAt = remoteUpdatedAt;
          egressDiag("loadAppFromCloud usando cache local; data remoto não baixado", { remoteUpdatedAt });
          return localCache;
        }

        if (remoteUpdatedAt) {
          egressDiag("loadAppFromCloud baixando data completo", { remoteUpdatedAt, cachedUpdatedAt });
          const row = await fetchSharedStateFull({ source: "loadAppFromCloud", throwOnError: true });
          if (row && row.data) {
            lastSharedUpdatedAt = row.updated_at || "";
            const merged = await mergeLocalCacheIntoCloud(normalizeApp(row.data), localCache);
            writeLocalSharedCache(merged, lastSharedUpdatedAt);
            return merged;
          }
          throw new Error("Linha shared_states/main não retornou data.");
        }

        const initial = createEmptyApp();
        const { data: created, error: createError } = await supabaseClient
          .from("shared_states")
          .upsert({
            id: SHARED_STATE_ID,
            data: initial,
            updated_at: new Date().toISOString()
          }, { onConflict: "id" })
          .select("updated_at")
          .single();
        if (createError) throw createError;
        lastSharedUpdatedAt = created && created.updated_at ? created.updated_at : "";
        const merged = await mergeLocalCacheIntoCloud(normalizeApp(initial), localCache);
        writeLocalSharedCache(merged, lastSharedUpdatedAt);
        return merged;
      }

      function readLocalSharedCache() {
        const saved = localStorage.getItem(SHARED_STORAGE_KEY);
        if (!saved) return null;
        try {
          return normalizeApp(JSON.parse(saved));
        } catch (error) {
          console.warn("Cache local antigo ignorado:", error);
          return null;
        }
      }

      function readLocalSharedUpdatedAt() {
        return localStorage.getItem(SHARED_UPDATED_AT_CACHE_KEY) || "";
      }

      function writeLocalSharedCache(data, updatedAt = lastSharedUpdatedAt) {
        localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(data));
        if (updatedAt) localStorage.setItem(SHARED_UPDATED_AT_CACHE_KEY, updatedAt);
      }

      async function mergeLocalCacheIntoCloud(cloudApp, localApp) {
        if (!currentUser || isRestrictedAdminUser() || !localApp || !Array.isArray(localApp.profiles) || !localApp.profiles.length) return cloudApp;
        const migrationKey = `${LOCAL_MIGRATION_KEY}.${currentUser.id}`;
        if (localStorage.getItem(migrationKey)) return cloudApp;

        const merged = normalizeApp(cloudApp);
        let changed = false;
        localApp.hiddenUserProfileIds.forEach(userId => {
          if (userId && !merged.hiddenUserProfileIds.includes(userId)) {
            merged.hiddenUserProfileIds.push(userId);
            changed = true;
          }
        });

        localApp.profiles.forEach(localProfile => {
          const profile = normalizeProfile(localProfile);
          const currentEmail = normalizeText(currentUser.email || "");
          const profileEmail = normalizeText(profile.email || "");
          if (!profile.userId && profileEmail && profileEmail === currentEmail) {
            profile.userId = currentUser.id;
            profile.id = currentUser.id;
          }
          if (profile.userId && merged.hiddenUserProfileIds.includes(profile.userId)) return;
          const existing = merged.profiles.find(item => {
            const itemEmail = normalizeText(item.email || "");
            return (profile.userId && item.userId === profile.userId)
              || item.id === profile.id
              || (profileEmail && itemEmail && itemEmail === profileEmail && item.userId === profile.userId);
          });
          if (!existing) {
            merged.profiles.push(profile);
            changed = true;
            return;
          }

          const folderIds = new Set(existing.folders.map(folder => folder.id));
          profile.folders.forEach(folder => {
            if (!folderIds.has(folder.id)) {
              existing.folders.push(folder);
              changed = true;
            }
          });
          const planIds = new Set(existing.plans.map(plan => plan.id));
          profile.plans.forEach(plan => {
            if (!planIds.has(plan.id)) {
              existing.plans.push(plan);
              changed = true;
            }
          });
          if (profile.avatarPhoto && !existing.avatarPhoto) {
            existing.avatarPhoto = profile.avatarPhoto;
            changed = true;
          }
          if (profile.name && (!existing.name || existing.name === "Perfil sem nome")) {
            existing.name = profile.name;
            changed = true;
          }
        });

        if (!changed) {
          localStorage.setItem(migrationKey, new Date().toISOString());
          return merged;
        }

        egressDiag("mergeLocalCacheIntoCloud enviando migração local", { changed });
        const { data, error } = await supabaseClient
          .from("shared_states")
          .upsert({
            id: SHARED_STATE_ID,
            data: sharedAppData(merged),
            updated_at: new Date().toISOString()
          }, { onConflict: "id" })
          .select("updated_at")
          .single();
        if (error) {
          console.warn("Não foi possível migrar o cache local para o banco:", error);
          return cloudApp;
        }
        localStorage.setItem(migrationKey, new Date().toISOString());
        lastSharedUpdatedAt = data && data.updated_at ? data.updated_at : lastSharedUpdatedAt;
        const normalized = normalizeApp(sharedAppData(merged));
        writeLocalSharedCache(normalized, lastSharedUpdatedAt);
        return normalized;
      }

      function ensureSinglePrivateProfile() {
        if (!currentUser) return null;
        if (isRestrictedAdminUser()) return null;
        if (app.hiddenUserProfileIds.includes(currentUser.id)) return null;
        const userEmail = normalizeText(currentUser.email || "");
        let profile = app.profiles.find(item => item.userId === currentUser.id)
          || app.profiles.find(item => item.id === currentUser.id)
          || app.profiles.find(item => userEmail && normalizeText(item.email || "") === userEmail);

        if (!profile) {
          profile = normalizeProfile({
            id: currentUser.id,
            userId: currentUser.id,
            name: currentUser.email ? currentUser.email.split("@")[0] : "Meu perfil",
            role: "",
            company: "",
            email: currentUser.email || "",
            avatarColor: pickColor(currentUser.email || currentUser.id),
            avatarPhoto: "",
            createdAt: new Date().toISOString(),
            lastAccess: "",
            folders: [createDefaultFolder()],
            plans: []
          });
          app.profiles.push(profile);
          dirtyProfileIds.add(profile.id);
        } else {
          Object.assign(profile, normalizeProfile({
            ...profile,
            userId: currentUser.id,
            email: currentUser.email || profile.email || ""
          }));
        }

        ensureDefaultFolder(profile);
        if (!app.activeFolderId) app.activeFolderId = DEFAULT_FOLDER_ID;
        return profile;
      }

      async function loadTeamProfiles() {
        if (!supabaseClient || !currentUser) {
          teamProfiles = [];
          return;
        }
        const own = isRestrictedAdminUser() ? null : ensureSinglePrivateProfile();
        try {
          egressDiag("user_profiles select lista", { source: "loadTeamProfiles" });
          const { data, error } = await supabaseClient
            .from("user_profiles")
            .select("user_id, display_name, role, company, email, avatar_color, avatar_photo, updated_at")
            .order("display_name", { ascending: true });
          if (error) throw error;
          teamProfiles = (data || []).map(row => publicProfileFromRow(row));
        } catch (error) {
          console.warn("Perfis públicos indisponíveis:", error);
          teamProfiles = [];
        }
        if (own && !teamProfiles.some(profile => profile.userId === currentUser.id)) {
          teamProfiles.unshift(publicProfileFromPrivate(own));
        }
      }

      function publicProfileFromRow(row) {
        return {
          userId: row.user_id,
          name: row.display_name || row.email || "Usuário",
          role: row.role || "",
          company: row.company || "",
          email: row.email || "",
          avatarColor: row.avatar_color || pickColor(row.email || row.user_id),
          avatarPhoto: row.avatar_photo || "",
          updatedAt: row.updated_at || ""
        };
      }

      function publicProfileFromPrivate(profile) {
        return {
          userId: currentUser.id,
          name: profile.name || currentUser.email || "Meu perfil",
          role: profile.role || "",
          company: profile.company || "",
          email: currentUser.email || profile.email || "",
          avatarColor: profile.avatarColor || pickColor(currentUser.email || currentUser.id),
          avatarPhoto: profile.avatarPhoto || "",
          updatedAt: new Date().toISOString()
        };
      }

      async function getOwnPublicProfileRow() {
        if (!supabaseClient || !currentUser) return null;
        egressDiag("user_profiles select próprio perfil", { userId: currentUser.id });
        const { data, error } = await supabaseClient
          .from("user_profiles")
          .select("avatar_photo, avatar_color, display_name, role, company")
          .eq("user_id", currentUser.id)
          .maybeSingle();
        if (error) {
          console.warn("Não foi possível ler o perfil público atual:", error);
          return null;
        }
        return data || null;
      }

      function publicProfileRowMatches(row, nextRow) {
        if (!row || !nextRow) return false;
        return String(row.display_name || "") === String(nextRow.display_name || "")
          && String(row.role || "") === String(nextRow.role || "")
          && String(row.company || "") === String(nextRow.company || "")
          && String(row.avatar_color || "") === String(nextRow.avatar_color || "")
          && String(row.avatar_photo || "") === String(nextRow.avatar_photo || "");
      }

      async function syncOwnPublicProfile(profile) {
        if (!supabaseClient || !currentUser || isRestrictedAdminUser()) return;
        const row = {
          user_id: currentUser.id,
          display_name: profile.name,
          role: profile.role || "",
          company: profile.company || "",
          email: currentUser.email || "",
          avatar_color: profile.avatarColor || pickColor(profile.name),
          avatar_photo: profile.avatarPhoto || "",
          updated_at: new Date().toISOString()
        };
        egressDiag("user_profiles upsert próprio perfil", { source: "syncOwnPublicProfile", userId: currentUser.id });
        const { error } = await supabaseClient
          .from("user_profiles")
          .upsert(row, { onConflict: "user_id" });
        if (error) {
          console.warn("Não foi possível salvar o perfil público:", error);
          return;
        }
        await loadTeamProfiles();
      }

      async function publishOwnProfileIfNeeded() {
        if (isRestrictedAdminUser()) return null;
        const profile = ensureSinglePrivateProfile();
        if (!supabaseClient || !currentUser || !profile) return profile;
        const existing = await getOwnPublicProfileRow();
        if (existing) {
          if (!profile.avatarPhoto && existing.avatar_photo) profile.avatarPhoto = existing.avatar_photo;
          if (!profile.avatarColor && existing.avatar_color) profile.avatarColor = existing.avatar_color;
          if ((!profile.role || !profile.company) && (existing.role || existing.company)) {
            profile.role = profile.role || existing.role || "";
            profile.company = profile.company || existing.company || "";
          }
        }
        const row = {
          user_id: currentUser.id,
          display_name: profile.name || (currentUser.email ? currentUser.email.split("@")[0] : "Usuário"),
          role: profile.role || "",
          company: profile.company || "",
          email: currentUser.email || "",
          avatar_color: profile.avatarColor || pickColor(currentUser.email || currentUser.id),
          avatar_photo: profile.avatarPhoto || "",
          updated_at: new Date().toISOString()
        };
        if (existing && publicProfileRowMatches(existing, row)) {
          egressDiag("publishOwnProfileIfNeeded pulou upsert sem alteração", { userId: currentUser.id });
          return profile;
        }
        egressDiag("user_profiles upsert próprio perfil", { source: "publishOwnProfileIfNeeded", userId: currentUser.id });
        const { error } = await supabaseClient
          .from("user_profiles")
          .upsert(row, { onConflict: "user_id" });
        if (error) console.warn("Perfil público ainda não disponível:", error);
        return profile;
      }

      function createDefaultActionPlanTemplate() {
        const now = new Date().toISOString();
        const data = createPlanData({ useTemplate: true, company: "", documentType: "PGR" });
        return {
          id: DEFAULT_ACTION_PLAN_TEMPLATE_ID,
          name: "Template padrão",
          description: "Modelo padrão do SATS para novos planos de ação.",
          category: "Geral",
          type: "mixed",
          active: true,
          systemDefault: true,
          order: 1,
          rows: data.actions,
          equipmentRows: data.equipment,
          trainingRows: data.trainings,
          createdAt: now,
          updatedAt: now,
          createdBy: "SATS",
          updatedBy: "SATS"
        };
      }

      function normalizeTemplateRows(rows) {
        return Array.isArray(rows) ? rows.map(row => normalizeRow(row, "actions")) : [];
      }

      function normalizeTemplateEquipmentRows(rows) {
        return Array.isArray(rows) ? rows.map(row => normalizeRow(row, "equipment")) : [];
      }

      function normalizeTemplateTrainingRows(rows) {
        return Array.isArray(rows) ? rows.map(row => normalizeRow(row, "trainings")) : [];
      }

      function normalizeActionPlanTemplate(template = {}, index = 0) {
        const now = new Date().toISOString();
        const rows = normalizeTemplateRows(template.rows || template.actions);
        const equipmentRows = normalizeTemplateEquipmentRows(template.equipmentRows || template.equipment);
        const trainingRows = normalizeTemplateTrainingRows(template.trainingRows || template.trainings);
        const areas = [rows.length, equipmentRows.length, trainingRows.length].filter(Boolean).length;
        return {
          id: template.id || createId(),
          name: String(template.name || `Template ${index + 1}`),
          description: String(template.description || ""),
          category: String(template.category || "Geral"),
          type: areas > 1 ? "mixed" : String(template.type || (equipmentRows.length ? "equipment" : trainingRows.length ? "training" : "actions")),
          active: template.active !== false,
          systemDefault: template.systemDefault === true || template.id === DEFAULT_ACTION_PLAN_TEMPLATE_ID,
          order: Number(template.order) || index + 1,
          rows,
          equipmentRows,
          trainingRows,
          createdAt: template.createdAt || now,
          updatedAt: template.updatedAt || template.createdAt || now,
          createdBy: String(template.createdBy || ""),
          updatedBy: String(template.updatedBy || "")
        };
      }

      function normalizeActionPlanTemplates(raw) {
        const templates = (Array.isArray(raw) ? raw : []).map(normalizeActionPlanTemplate);
        if (!templates.some(template => template.systemDefault || template.id === DEFAULT_ACTION_PLAN_TEMPLATE_ID)) templates.unshift(createDefaultActionPlanTemplate());
        return templates.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "pt-BR"));
      }

      function cloneTemplateRows(rows) {
        return normalizeTemplateRows(rows).map(row => ({ ...deepClone(row), id: createId(), lastEdited: new Date().toISOString() }));
      }

      function cloneTemplateEquipmentRows(rows) {
        return normalizeTemplateEquipmentRows(rows).map(row => ({ ...deepClone(row), id: createId(), lastEdited: new Date().toISOString() }));
      }

      function cloneTemplateTrainingRows(rows) {
        return normalizeTemplateTrainingRows(rows).map(row => ({ ...deepClone(row), id: createId(), lastEdited: new Date().toISOString() }));
      }

      function normalizeClientUnit(unit = {}, clientId = DEFAULT_CLIENT_ID) {
        const now = new Date().toISOString();
        return { id: unit.id || createId(), clientId, name: String(unit.name || "Nova unidade"), city: String(unit.city || ""), state: String(unit.state || ""), address: String(unit.address || ""), status: CLIENT_STATUSES.includes(unit.status) ? unit.status : "active", notes: String(unit.notes || ""), createdAt: unit.createdAt || now, updatedAt: unit.updatedAt || unit.createdAt || now };
      }

      function normalizeClientSector(sector = {}, clientId = DEFAULT_CLIENT_ID) {
        const now = new Date().toISOString();
        return { id: sector.id || createId(), clientId, unitId: sector.unitId || "", name: String(sector.name || "Novo setor"), description: String(sector.description || ""), status: CLIENT_STATUSES.includes(sector.status) ? sector.status : "active", notes: String(sector.notes || ""), createdAt: sector.createdAt || now, updatedAt: sector.updatedAt || sector.createdAt || now };
      }

      function normalizeClientCommercial(raw = {}) {
        return { planName: String(raw.planName || ""), monthlyValue: String(raw.monthlyValue || ""), startDate: String(raw.startDate || ""), endDate: String(raw.endDate || ""), status: COMMERCIAL_STATUSES.includes(raw.status) ? raw.status : "none", maxUsers: String(raw.maxUsers || ""), maxPlans: String(raw.maxPlans || ""), maxUnits: String(raw.maxUnits || ""), notes: String(raw.notes || "") };
      }

      function normalizeClient(client = {}) {
        const now = new Date().toISOString();
        const id = client.id || createId();
        return {
          id,
          name: String(client.name || "Novo cliente"),
          legalName: String(client.legalName || ""),
          cnpj: String(client.cnpj || client.document || ""),
          status: CLIENT_STATUSES.includes(client.status) ? client.status : "active",
          contractStatus: COMMERCIAL_STATUSES.includes(client.contractStatus) ? client.contractStatus : "none",
          contractStart: String(client.contractStart || ""),
          contractEnd: String(client.contractEnd || ""),
          contactName: String(client.contactName || ""),
          contactEmail: String(client.contactEmail || client.email || ""),
          contactPhone: String(client.contactPhone || client.phone || ""),
          notes: String(client.notes || ""),
          units: (Array.isArray(client.units) ? client.units : []).map(unit => normalizeClientUnit(unit, id)),
          sectors: (Array.isArray(client.sectors) ? client.sectors : []).map(sector => normalizeClientSector(sector, id)),
          commercial: normalizeClientCommercial(client.commercial),
          createdAt: client.createdAt || now,
          updatedAt: client.updatedAt || client.createdAt || now,
          createdBy: String(client.createdBy || ""),
          updatedBy: String(client.updatedBy || "")
        };
      }

      function normalizeClientRegistry(raw) {
        const clients = (raw && Array.isArray(raw.clients) ? raw.clients : []).map(normalizeClient);
        return { clients, updatedAt: raw?.updatedAt || "", updatedBy: String(raw?.updatedBy || "") };
      }

      function createDefaultSystemSettings() {
        return {
          branding: { appName: "SATS", subtitle: "", logoDataUrl: "", accentColor: "#2563eb" },
          maintenance: { enabled: false, message: "Sistema em manutenção. Tente novamente mais tarde.", allowedEmails: [SUPER_ADMIN_EMAIL] },
          security: { requireAdminModeForHiddenItems: true, allowClientPortal: false },
          exports: { defaultFormat: "pdf", includeLogo: true, includeRevision: true },
          commercial: { licenseEnforcementEnabled: false, expirationWarningDays: 15 },
          updatedAt: "",
          updatedBy: ""
        };
      }

      function normalizeSystemSettings(raw = {}) {
        const fallback = createDefaultSystemSettings();
        const allowedEmails = Array.isArray(raw.maintenance?.allowedEmails) ? raw.maintenance.allowedEmails.map(normalizeEmail).filter(Boolean) : fallback.maintenance.allowedEmails;
        if (!allowedEmails.includes(normalizeEmail(SUPER_ADMIN_EMAIL))) allowedEmails.unshift(normalizeEmail(SUPER_ADMIN_EMAIL));
        return {
          branding: { ...fallback.branding, ...(raw.branding || {}) },
          maintenance: { ...fallback.maintenance, ...(raw.maintenance || {}), enabled: raw.maintenance?.enabled === true, allowedEmails },
          security: { ...fallback.security, ...(raw.security || {}) },
          exports: { ...fallback.exports, ...(raw.exports || {}) },
          commercial: { ...fallback.commercial, ...(raw.commercial || {}) },
          updatedAt: String(raw.updatedAt || ""),
          updatedBy: String(raw.updatedBy || "")
        };
      }

      function normalizeBackupCenter(raw = {}) {
        const maxSnapshots = Math.max(1, Number(raw.settings?.maxSnapshots) || MAX_INTERNAL_BACKUPS);
        return {
          snapshots: (Array.isArray(raw.snapshots) ? raw.snapshots : []).map(snapshot => ({ id: snapshot.id || createId(), type: snapshot.type || "full", label: String(snapshot.label || "Backup SATS"), createdAt: snapshot.createdAt || new Date().toISOString(), createdBy: String(snapshot.createdBy || ""), clientId: String(snapshot.clientId || ""), profileId: String(snapshot.profileId || ""), planId: String(snapshot.planId || ""), size: Number(snapshot.size) || 0, data: snapshot.data || {} })).slice(0, maxSnapshots),
          settings: { autoBackupBeforeDestructiveAction: raw.settings?.autoBackupBeforeDestructiveAction !== false, maxSnapshots }
        };
      }

      function normalizeAuditTrail(raw) {
        return (Array.isArray(raw) ? raw : []).map(entry => ({
          id: entry.id || createId(), at: entry.at || new Date().toISOString(), actorEmail: String(entry.actorEmail || entry.userEmail || ""), actorName: String(entry.actorName || ""), action: String(entry.action || "Atividade"), entityType: String(entry.entityType || ""), entityId: String(entry.entityId || ""), entityLabel: String(entry.entityLabel || ""), clientId: String(entry.clientId || ""), profileId: String(entry.profileId || ""), folderId: String(entry.folderId || ""), planId: String(entry.planId || ""), before: entry.before || null, after: entry.after || null, summary: String(entry.summary || entry.detail || ""), source: String(entry.source || "management"), severity: String(entry.severity || "info")
        })).sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, MAX_AUDIT_TRAIL);
      }

      function ensureDefaultClientStructure(appData) {
        // Legado preservado, sem criar ou exigir novos vínculos de cliente, unidade ou setor.
        appData.clientRegistry = normalizeClientRegistry(appData.clientRegistry);
        (appData.profiles || []).forEach(profile => {
          profile.clientId = String(profile.clientId || "");
          profile.unitId = String(profile.unitId || "");
          profile.sectorId = String(profile.sectorId || "");
          profile.accessRole = ACCESS_ROLES[profile.accessRole] ? profile.accessRole : "technician";
          (profile.folders || []).forEach(folder => {
            folder.clientId = String(folder.clientId || "");
            folder.unitId = String(folder.unitId || "");
            folder.sectorId = String(folder.sectorId || "");
          });
          (profile.plans || []).forEach(plan => {
            plan.clientId = String(plan.clientId || "");
            plan.unitId = String(plan.unitId || "");
            plan.sectorId = String(plan.sectorId || "");
            plan.visibility = String(plan.visibility || "");
            plan.documentStatus = String(plan.documentStatus || "");
          });
        });
        return appData;
      }

      function createEmptyApp() {
        return {
          version: 2,
          view: "profiles",
          activeProfileId: null,
          activeFolderId: DEFAULT_FOLDER_ID,
          activePlanId: null,
          hiddenUserProfileIds: [],
          activityLog: [],
          improvementSuggestions: [],
          suggestionNotifications: [],
          suggestionWeeklyRanking: normalizeSuggestionWeeklyRanking(),
          managementPermissions: { users: [] },
          procedureLibrary: createDefaultProcedureLibrary(),
          actionPlanTemplates: normalizeActionPlanTemplates([]),
          clientRegistry: normalizeClientRegistry(),
          backupCenter: normalizeBackupCenter(),
          auditTrail: [],
          systemSettings: createDefaultSystemSettings(),
          documentAutomation: normalizeDocumentAutomation(),
          profiles: []
        };
      }

      function normalizeApp(raw) {
        const appData = {
          version: 2,
          view: "profiles",
          activeProfileId: raw.activeProfileId || null,
          activeFolderId: raw.activeFolderId || DEFAULT_FOLDER_ID,
          activePlanId: raw.activePlanId || null,
          hiddenUserProfileIds: Array.isArray(raw.hiddenUserProfileIds) ? raw.hiddenUserProfileIds : [],
          activityLog: normalizeActivityLog(raw.activityLog || raw.activity_log || []),
          improvementSuggestions: normalizeImprovementSuggestions(raw.improvementSuggestions || raw.improvement_suggestions || []),
          suggestionNotifications: normalizeSuggestionNotifications(raw.suggestionNotifications || raw.suggestion_notifications || []),
          suggestionWeeklyRanking: normalizeSuggestionWeeklyRanking(raw.suggestionWeeklyRanking || raw.suggestion_weekly_ranking),
          managementPermissions: normalizeManagementPermissions(raw.managementPermissions || raw.management_permissions),
          procedureLibrary: normalizeProcedureLibrary(raw.procedureLibrary || raw.procedure_library),
          actionPlanTemplates: normalizeActionPlanTemplates(raw.actionPlanTemplates || raw.action_plan_templates),
          clientRegistry: normalizeClientRegistry(raw.clientRegistry || raw.client_registry),
          backupCenter: normalizeBackupCenter(raw.backupCenter || raw.backup_center),
          auditTrail: normalizeAuditTrail(raw.auditTrail || raw.audit_trail),
          systemSettings: normalizeSystemSettings(raw.systemSettings || raw.system_settings),
          documentAutomation: normalizeDocumentAutomation(raw.documentAutomation || raw.document_automation),
          profiles: Array.isArray(raw.profiles) ? raw.profiles : []
        };

        appData.profiles = appData.profiles.map(profile => normalizeProfile(profile));
        return ensureDefaultClientStructure(appData);
      }

      function normalizeDocumentAutomation(raw = {}) {
        const settings = raw.settings || {};
        return {
          schemaVersion: Number(raw.schemaVersion || raw.schema_version || 1),
          projects: Array.isArray(raw.projects) ? raw.projects.map(normalizeDocumentAutomationProject) : [],
          templates: Array.isArray(raw.templates) ? raw.templates : [],
          settings: {
            activeDocumentTypes: Array.isArray(settings.activeDocumentTypes) ? settings.activeDocumentTypes : ["ltcat"],
            maxFileSizeMb: Number(settings.maxFileSizeMb || 10),
            allowDocxGeneration: settings.allowDocxGeneration !== false,
            allowHtmlWordFallback: settings.allowHtmlWordFallback !== false
          }
        };
      }

      function normalizeDocumentAutomationProject(project = {}) {
        const now = new Date().toISOString();
        const sourceFiles = project.sourceFiles || {};
        const validation = project.validation || {};
        const generated = project.generated || {};
        return {
          ...project,
          id: project.id || createId(),
          type: project.type || "ltcat",
          status: ["draft", "review", "generated", "archived"].includes(project.status) ? project.status : "draft",
          title: project.title || "",
          companyName: project.companyName || project.company || project.extractedData?.companyName || "",
          unitName: project.unitName || project.extractedData?.unitName || "",
          createdAt: project.createdAt || now,
          updatedAt: project.updatedAt || project.createdAt || now,
          createdBy: project.createdBy || "",
          updatedBy: project.updatedBy || "",
          sourceFiles: {
            socFile: normalizeDocumentAutomationFile(sourceFiles.socFile),
            templateFile: normalizeDocumentAutomationFile(sourceFiles.templateFile),
            previousDocumentFile: normalizeDocumentAutomationFile(sourceFiles.previousDocumentFile),
            companyLogo: normalizeDocumentAutomationFile(sourceFiles.companyLogo)
          },
          extractedData: normalizeLtcatExtractedData(project.extractedData || {}),
          manualFields: normalizeLtcatManualFields(project.manualFields || {}),
          validation: {
            missingFields: Array.isArray(validation.missingFields) ? validation.missingFields : [],
            warnings: Array.isArray(validation.warnings) ? validation.warnings : [],
            confidence: validation.confidence && typeof validation.confidence === "object" ? validation.confidence : {}
          },
          generated: {
            htmlPreview: generated.htmlPreview || "",
            lastGeneratedAt: generated.lastGeneratedAt || "",
            fileName: generated.fileName || ""
          }
        };
      }

      function normalizeDocumentAutomationFile(file) {
        if (!file) return null;
        return {
          id: file.id || createId(),
          name: file.name || "",
          type: file.type || "",
          size: Number(file.size || 0),
          dataUrl: file.dataUrl || "",
          text: file.text || "",
          uploadedAt: file.uploadedAt || new Date().toISOString(),
          uploadedBy: file.uploadedBy || ""
        };
      }

      function normalizeLtcatExtractedData(data = {}) {
        return {
          companyName: data.companyName || "",
          unitName: data.unitName || "",
          cnpj: data.cnpj || "",
          address: data.address || "",
          cep: data.cep || "",
          city: data.city || "",
          state: data.state || "",
          cnae: data.cnae || "",
          riskDegree: data.riskDegree || "",
          issueDate: data.issueDate || "",
          documentType: data.documentType || "LTCAT",
          technicalResponsible: data.technicalResponsible || "",
          hierarchy: {
            sectors: Array.isArray(data.hierarchy?.sectors) ? data.hierarchy.sectors : [],
            roles: Array.isArray(data.hierarchy?.roles) ? data.hierarchy.roles : []
          },
          risks: Array.isArray(data.risks) ? data.risks.map(normalizeLtcatRisk) : [],
          synthesis: Array.isArray(data.synthesis) ? data.synthesis : [],
          rawSocText: data.rawSocText || data.rawText || "",
          rawRiskSection: data.rawRiskSection || "",
          riskSectorBlocks: Array.isArray(data.riskSectorBlocks) ? data.riskSectorBlocks.map(normalizeLtcatRawRiskSectorBlock) : [],
          synthesisRawText: data.synthesisRawText || "",
          rawRiskWarning: data.rawRiskWarning || "",
          riskExtractionWarnings: Array.isArray(data.riskExtractionWarnings) ? data.riskExtractionWarnings : [],
          extractionDebug: data.extractionDebug && typeof data.extractionDebug === "object" ? data.extractionDebug : {},
          rawText: data.rawText || ""
        };
      }

      function normalizeLtcatRawRiskSectorBlock(block = {}, index = 0) {
        return {
          id: block.id || createId(),
          title: block.title || `Setor ${index + 1}`,
          rawText: block.rawText || "",
          order: Number(block.order || index + 1),
          extractedAt: block.extractedAt || ""
        };
      }

      function normalizeLtcatRisk(risk = {}) {
        const medicao = risk.medicao || {};
        return {
          setor: risk.setor || "",
          cargo: risk.cargo || "",
          grupo: risk.grupo || "",
          codigoESocial: risk.codigoESocial || "",
          perigo: risk.perigo || risk.risco || "",
          descricao: risk.descricao || "",
          fundamentacaoLegal: risk.fundamentacaoLegal || "",
          possiveisLesoes: risk.possiveisLesoes || "",
          fontesCircunstancias: risk.fontesCircunstancias || "",
          meioPropagacao: risk.meioPropagacao || "",
          criterioAvaliacao: risk.criterioAvaliacao || "",
          perfilExposicao: risk.perfilExposicao || "",
          probabilidade: risk.probabilidade || "",
          gravidade: risk.gravidade || "",
          nivelRisco: risk.nivelRisco || "",
          classificacao: risk.classificacao || "",
          medicao: {
            empresa: medicao.empresa || "",
            tecnica: medicao.tecnica || "",
            equipamento: medicao.equipamento || "",
            data: medicao.data || "",
            valor: medicao.valor || "",
            nivelAcao: medicao.nivelAcao || "",
            limiteTolerancia: medicao.limiteTolerancia || ""
          },
          prevencaoControle: risk.prevencaoControle || "",
          parecerTecnico: risk.parecerTecnico || "",
          conclusaoAposentadoria: risk.conclusaoAposentadoria || ""
        };
      }

      function normalizeLtcatManualFields(fields = {}) {
        return {
          finalCompanyName: fields.finalCompanyName || "",
          unitName: fields.unitName || "",
          emissionMonth: fields.emissionMonth || "",
          emissionYear: fields.emissionYear || "",
          city: fields.city || "",
          elaboratedBy: fields.elaboratedBy || "",
          responsibleRole: fields.responsibleRole || "",
          councilNumber: fields.councilNumber || "",
          cpf: fields.cpf || "",
          specialty: fields.specialty || "",
          generalNotes: fields.generalNotes || "",
          generalConclusion: fields.generalConclusion || "",
          revisionDescription: fields.revisionDescription || "",
          currentRevisionDate: fields.currentRevisionDate || "",
          revisionHistory: Array.isArray(fields.revisionHistory) && fields.revisionHistory.length
            ? fields.revisionHistory.map(item => ({
              revision: item.revision || "",
              date: item.date || "",
              description: item.description || ""
            }))
            : [{ revision: "00", date: "", description: "Emissão inicial do LTCAT." }]
        };
      }

      function normalizeManagementPermissions(raw) {
        const users = raw && Array.isArray(raw.users) ? raw.users : [];
        const byEmail = new Map();
        users.map(normalizeManagementPermissionUser).forEach(entry => {
          if (!entry.email || entry.email === normalizeEmail(SUPER_ADMIN_EMAIL)) return;
          const current = byEmail.get(entry.email);
          if (!current || String(entry.updatedAt) >= String(current.updatedAt)) byEmail.set(entry.email, entry);
        });
        return { users: Array.from(byEmail.values()) };
      }

      function normalizeManagementPermissionUser(entry = {}) {
        // Campos antigos ficam preservados no estado, mas apenas as permissões úteis são exibidas e aplicadas.
        const permissions = { ...(entry.permissions || {}) };
        MANAGEMENT_PERMISSION_KEYS.forEach(key => {
          permissions[key] = entry.permissions && entry.permissions[key] === true;
        });
        if (MANAGEMENT_PERMISSION_KEYS.some(key => key !== "accessManagement" && key !== "phase1View" && permissions[key])) {
          permissions.accessManagement = true;
          permissions.phase1View = true;
        }
        if (["editProcedureDrafts", "publishProcedures", "restoreProcedureVersions", "importProcedureLibrary", "exportProcedureLibrary"].some(key => permissions[key])) {
          permissions.manageProcedures = true;
        }
        if (permissions.publishProcedures) permissions.editProcedureDrafts = true;
        return {
          id: entry.id || createId(),
          email: normalizeEmail(entry.email),
          name: String(entry.name || ""),
          role: entry.role === "owner" ? "admin" : ACCESS_ROLES[entry.role] ? entry.role : "viewer",
          status: entry.status === "inactive" ? "inactive" : "active",
          scope: normalizeManagementScope(entry.scope),
          permissions,
          createdAt: entry.createdAt || new Date().toISOString(),
          updatedAt: entry.updatedAt || entry.createdAt || new Date().toISOString(),
          createdBy: String(entry.createdBy || "")
        };
      }

      function createProcedureResultNode(id, title, text, tone = "info") {
        return {
          id,
          type: "result",
          title,
          text: "",
          note: "",
          noteTone: "normal",
          status: title,
          tone,
          options: [],
          blocks: [{
            id: `${id}-block`,
            title: "Conclusão técnica",
            text,
            copyable: true,
            order: 1
          }]
        };
      }

      function createQuantitativePhysicalReport(id, title, order, reference) {
        const safeId = id.replace(/[^a-z0-9-]/g, "");
        const nodes = {};
        nodes.medicao = {
          id: "medicao",
          type: "question",
          title: "Medição quantitativa",
          text: "FOI REALIZADA MEDIÇÃO QUANTITATIVA?",
          note: `Avalie a exposição e os critérios técnicos aplicáveis a ${title}.`,
          noteTone: "warning",
          options: [
            { id: "sim", label: "SIM", tone: "success", nextNodeId: "acima-lt" },
            { id: "nao", label: "NÃO", tone: "danger", nextNodeId: "sem-medicao" }
          ]
        };
        nodes["acima-lt"] = {
          id: "acima-lt",
          type: "question",
          title: "Resultado da avaliação",
          text: "O RESULTADO FICOU ACIMA DO LIMITE DE TOLERÂNCIA?",
          note: "",
          noteTone: "normal",
          options: [
            { id: "sim", label: "SIM", tone: "danger", nextNodeId: "controle" },
            { id: "nao", label: "NÃO", tone: "success", nextNodeId: "abaixo-lt" }
          ]
        };
        nodes.controle = {
          id: "controle",
          type: "question",
          title: "Medidas de controle",
          text: "AS MEDIDAS DE CONTROLE E A GESTÃO DE EPI NEUTRALIZAM A EXPOSIÇÃO?",
          note: "Considere a efetividade real, registros, uso habitual e critérios da NR-06.",
          noteTone: "info",
          options: [
            { id: "sim", label: "SIM", tone: "success", nextNodeId: "neutralizado" },
            { id: "nao", label: "NÃO", tone: "danger", nextNodeId: "enquadramento" }
          ]
        };
        nodes["sem-medicao"] = {
          id: "sem-medicao",
          type: "info",
          title: "Ausência de medição",
          text: "Não há medição quantitativa suficiente para concluir o enquadramento.",
          note: "Escolha o encaminhamento técnico mais adequado ao caso analisado.",
          noteTone: "warning",
          options: [
            { id: "preventivo", label: "POSSIBILIDADE 1", tone: "warning", nextNodeId: "preventivo" },
            { id: "inconclusivo", label: "POSSIBILIDADE 2", tone: "info", nextNodeId: "inconclusivo" },
            { id: "observacao", label: "OBSERVAÇÃO", tone: "muted", nextNodeId: "irrelevante" }
          ]
        };
        nodes["abaixo-lt"] = createProcedureResultNode("abaixo-lt", "Resultado: Abaixo do limite de tolerância", `A avaliação quantitativa de ${title} resultou abaixo do Limite de Tolerância aplicável. Diante dos dados disponíveis, não se caracteriza enquadramento por este agente. Referência técnica: ${reference}.`, "success");
        nodes.neutralizado = createProcedureResultNode("neutralizado", "Resultado: Exposição neutralizada", `Foram identificadas medidas de controle eficazes e gestão adequada dos equipamentos de proteção aplicáveis a ${title}, reduzindo a exposição a condições aceitáveis. Referência técnica: ${reference}.`, "success");
        nodes.enquadramento = createProcedureResultNode("enquadramento", "Resultado: Reconhecimento do enquadramento", `A avaliação de ${title} ficou acima do limite aplicável e não foram comprovadas medidas eficazes de neutralização. Recomenda-se reconhecer o enquadramento e adotar medidas corretivas. Referência técnica: ${reference}.`, "danger");
        nodes.preventivo = createProcedureResultNode("preventivo", "Resultado: Enquadramento preventivo", `Na ausência de medição conclusiva de ${title}, e havendo exposição tecnicamente relevante, recomenda-se tratamento preventivo até que seja realizada avaliação quantitativa representativa.`, "warning");
        nodes.inconclusivo = createProcedureResultNode("inconclusivo", "Resultado: Laudo inconclusivo", `Não é possível concluir o enquadramento de ${title} sem avaliação quantitativa representativa. Recomenda-se realizar medição conforme metodologia aplicável.`, "info");
        nodes.irrelevante = createProcedureResultNode("irrelevante", "Observação: Exposição irrelevante", `Quando a análise preliminar demonstrar exposição muito baixa, eventual ou irrelevante a ${title}, o agente não deve ser inserido como risco ocupacional relevante sem justificativa técnica.`, "muted");
        return {
          id: safeId,
          title,
          subtitle: reference,
          description: `Fluxo técnico editável para análise de ${title}.`,
          tags: [title, reference, "laudo físico"],
          active: true,
          deleted: false,
          order,
          rootNodeId: "medicao",
          nodes,
          adminNote: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          updatedBy: ""
        };
      }

      function createQualitativePhysicalReport(id, title, order, exposureQuestion, reference) {
        const report = createQuantitativePhysicalReport(id, title, order, reference);
        report.nodes = {
          exposicao: {
            id: "exposicao",
            type: "question",
            title: "Análise da exposição",
            text: exposureQuestion,
            note: `Considere habitualidade, permanência e condições reais de trabalho relacionadas a ${title}.`,
            noteTone: "info",
            options: [
              { id: "sim", label: "SIM", tone: "danger", nextNodeId: "controle" },
              { id: "nao", label: "NÃO", tone: "success", nextNodeId: "nao-enquadra" }
            ]
          },
          controle: {
            id: "controle",
            type: "question",
            title: "Medidas de controle",
            text: "AS MEDIDAS DE CONTROLE OU EPIS ELIMINAM A EXPOSIÇÃO?",
            note: "Avalie a efetividade prática e os registros disponíveis.",
            noteTone: "warning",
            options: [
              { id: "sim", label: "SIM", tone: "success", nextNodeId: "neutralizado" },
              { id: "nao", label: "NÃO", tone: "danger", nextNodeId: "enquadramento" }
            ]
          },
          "nao-enquadra": createProcedureResultNode("nao-enquadra", "Resultado: Não enquadramento", `Não foi identificada exposição habitual e relevante a ${title}. Diante da análise qualitativa, não se caracteriza enquadramento. Referência técnica: ${reference}.`, "success"),
          neutralizado: createProcedureResultNode("neutralizado", "Resultado: Exposição controlada", `A exposição a ${title} é controlada por medidas eficazes, não caracterizando enquadramento nas condições analisadas. Referência técnica: ${reference}.`, "success"),
          enquadramento: createProcedureResultNode("enquadramento", "Resultado: Reconhecimento do enquadramento", `Foi identificada exposição habitual e relevante a ${title}, sem comprovação de neutralização eficaz. Recomenda-se o reconhecimento do enquadramento e a adoção de controles. Referência técnica: ${reference}.`, "danger")
        };
        report.rootNodeId = "exposicao";
        return report;
      }

      function createDefaultPhysicalReports() {
        const noise = createQuantitativePhysicalReport("ruido-continuo", "Ruído contínuo", 1, "NR-15, Anexo 1");
        noise.nodes.medicao.note = "Caso a análise preliminar indique ruído muito baixo ou exposição irrelevante, não insira o risco. Quando houver exposição expressiva sem dosimetria, siga as orientações do fluxo.";
        return [
          noise,
          createQuantitativePhysicalReport("calor", "Calor", 2, "NR-15, Anexo 3"),
          createQualitativePhysicalReport("umidade", "Umidade", 3, "HÁ CONTATO HABITUAL E PERMANENTE COM LOCAIS ALAGADOS, ENCHARCADOS OU UMIDADE EXCESSIVA?", "NR-15, Anexo 10"),
          createQuantitativePhysicalReport("vibracao-corpo-inteiro", "Vibração de corpo inteiro", 4, "NR-15, Anexo 8"),
          createQuantitativePhysicalReport("vibracao-mao-braco", "Vibração localizada / mão-braço", 5, "NR-15, Anexo 8"),
          createQualitativePhysicalReport("radiacao-nao-ionizante", "Radiação não ionizante", 6, "EXISTE EXPOSIÇÃO HABITUAL À RADIAÇÃO NÃO IONIZANTE?", "NR-15, Anexo 7"),
          createQualitativePhysicalReport("radiacao-ionizante", "Radiação ionizante", 7, "EXISTE EXPOSIÇÃO OCUPACIONAL HABITUAL À RADIAÇÃO IONIZANTE?", "NR-15, Anexo 5"),
          createQualitativePhysicalReport("frio", "Frio", 8, "EXISTE EXPOSIÇÃO HABITUAL A CÂMARA FRIA OU LOCAL COM CONDIÇÃO SIMILAR?", "NR-15, Anexo 9")
        ];
      }

      function createDefaultProcedureLibrary() {
        const now = new Date().toISOString();
        const published = {
          id: createId(),
          title: "Biblioteca de Procedimentos SATS",
          versionLabel: "v1",
          publishedAt: now,
          publishedBy: "SATS",
          changeSummary: "Biblioteca inicial editável",
          categories: [{
            id: "laudos-fisicos",
            title: "Laudos Físicos",
            type: "physicalReports",
            description: "Fluxos técnicos para enquadramento de riscos físicos.",
            active: true,
            order: 1,
            items: createDefaultPhysicalReports()
          }, {
            id: "laudos-quimicos",
            title: "Laudos Químicos",
            type: "physicalReports",
            description: "Categoria preparada para expansão futura.",
            active: false,
            order: 2,
            items: []
          }, {
            id: "laudos-biologicos",
            title: "Laudos Biológicos",
            type: "physicalReports",
            description: "Categoria preparada para expansão futura.",
            active: false,
            order: 3,
            items: []
          }, {
            id: "laudos-ergonomicos",
            title: "Laudos Ergonômicos",
            type: "physicalReports",
            description: "Categoria preparada para expansão futura.",
            active: false,
            order: 4,
            items: []
          }, {
            id: "procedimentos-gerais",
            title: "Procedimentos Gerais",
            type: "general",
            description: "Categoria preparada para expansão futura.",
            active: false,
            order: 5,
            items: []
          }]
        };
        return {
          schemaVersion: 1,
          activePublishedVersionId: published.id,
          draft: null,
          published,
          versions: [],
          updatedAt: now,
          updatedBy: "SATS"
        };
      }

      function normalizeResultBlock(raw = {}, index = 0) {
        return {
          id: raw.id || createId(),
          title: String(raw.title || "Conclusão"),
          text: String(raw.text || raw.content || ""),
          copyable: raw.copyable !== false,
          order: Number.isFinite(Number(raw.order)) ? Number(raw.order) : index + 1
        };
      }

      function normalizeFlowOption(raw = {}, index = 0) {
        return {
          id: raw.id || createId(),
          label: String(raw.label || `Opção ${index + 1}`),
          tone: ["success", "danger", "warning", "info", "muted"].includes(raw.tone) ? raw.tone : "info",
          nextNodeId: String(raw.nextNodeId || raw.next || "")
        };
      }

      function normalizeFlowNode(raw = {}, fallbackId = "") {
        const type = ["question", "info", "result"].includes(raw.type) ? raw.type : "question";
        return {
          id: String(raw.id || fallbackId || createId()),
          type,
          title: String(raw.title || ""),
          text: String(raw.text || ""),
          note: String(raw.note || ""),
          noteTone: ["normal", "info", "warning", "danger", "success"].includes(raw.noteTone) ? raw.noteTone : "normal",
          status: String(raw.status || ""),
          tone: ["success", "danger", "warning", "info", "muted"].includes(raw.tone) ? raw.tone : "info",
          options: type === "result" ? [] : (Array.isArray(raw.options) ? raw.options.map(normalizeFlowOption) : []),
          blocks: type === "result" ? (Array.isArray(raw.blocks) ? raw.blocks.map(normalizeResultBlock) : []) : []
        };
      }

      function normalizePhysicalReport(raw = {}, index = 0) {
        if ((!raw.nodes || !Object.keys(raw.nodes).length) && (Array.isArray(raw.steps) || Array.isArray(raw.scenarios))) {
          raw = convertLegacyPhysicalReportToFlow(raw, index);
        }
        const sourceNodes = raw.nodes && typeof raw.nodes === "object" ? raw.nodes : {};
        const nodes = {};
        Object.entries(sourceNodes).forEach(([key, value]) => {
          const node = normalizeFlowNode(value, key);
          if (!nodes[node.id]) nodes[node.id] = node;
        });
        return {
          id: String(raw.id || createId()),
          title: String(raw.title || "Novo risco físico"),
          subtitle: String(raw.subtitle || ""),
          description: String(raw.description || ""),
          tags: Array.isArray(raw.tags) ? raw.tags.map(String) : String(raw.tags || "").split(",").map(item => item.trim()).filter(Boolean),
          active: raw.active !== false,
          deleted: raw.deleted === true,
          order: Number.isFinite(Number(raw.order)) ? Number(raw.order) : index + 1,
          rootNodeId: String(raw.rootNodeId || Object.keys(nodes)[0] || ""),
          nodes,
          adminNote: String(raw.adminNote || ""),
          createdAt: raw.createdAt || new Date().toISOString(),
          updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString(),
          updatedBy: String(raw.updatedBy || "")
        };
      }

      function convertLegacyPhysicalReportToFlow(legacyReport = {}, index = 0) {
        const scenarios = Array.isArray(legacyReport.scenarios) ? legacyReport.scenarios : [];
        const nodes = {
          "analise-tecnica": {
            id: "analise-tecnica",
            type: "info",
            title: "Análise técnica / Outros cenários",
            text: legacyReport.intro || legacyReport.description || "Selecione o cenário técnico aplicável.",
            note: "Conteúdo convertido da estrutura anterior. Revise as conexões no editor.",
            noteTone: "warning",
            options: scenarios.map((scenario, scenarioIndex) => ({
              id: `cenario-${scenarioIndex + 1}`,
              label: scenario.title || scenario.status || `CENÁRIO ${scenarioIndex + 1}`,
              tone: scenario.tone || "info",
              nextNodeId: `resultado-${scenarioIndex + 1}`
            }))
          }
        };
        scenarios.forEach((scenario, scenarioIndex) => {
          const blocks = [
            { title: "Parecer trabalhista", text: scenario.labor || scenario.trabalhista || "" },
            { title: "Parecer previdenciário", text: scenario.previd || scenario.previdenciario || "" },
            { title: "Observação", text: scenario.obs || scenario.observation || scenario.text || "" }
          ].filter(block => block.text);
          nodes[`resultado-${scenarioIndex + 1}`] = {
            id: `resultado-${scenarioIndex + 1}`,
            type: "result",
            title: scenario.title || scenario.status || `Resultado ${scenarioIndex + 1}`,
            status: scenario.status || "",
            tone: scenario.tone || "info",
            blocks: blocks.map((block, blockIndex) => normalizeResultBlock({ ...block, copyable: true }, blockIndex))
          };
        });
        if (!scenarios.length) {
          nodes["analise-tecnica"].options = [{ id: "conclusao", label: "ANÁLISE TÉCNICA", tone: "info", nextNodeId: "resultado-1" }];
          nodes["resultado-1"] = createProcedureResultNode("resultado-1", "Conclusão técnica", legacyReport.text || legacyReport.description || "Texto técnico a revisar.");
        }
        return {
          ...legacyReport,
          id: legacyReport.id || `risco-convertido-${index + 1}`,
          title: legacyReport.title || legacyReport.name || "Risco convertido",
          rootNodeId: "analise-tecnica",
          nodes
        };
      }

      function normalizeProcedureCategory(raw = {}, index = 0) {
        return {
          id: String(raw.id || createId()),
          title: String(raw.title || "Categoria"),
          type: String(raw.type || "general"),
          description: String(raw.description || ""),
          active: raw.active !== false,
          order: Number.isFinite(Number(raw.order)) ? Number(raw.order) : index + 1,
          items: Array.isArray(raw.items) ? raw.items.map(normalizePhysicalReport) : []
        };
      }

      function normalizeProcedureSnapshot(raw = {}) {
        return {
          id: raw.id || createId(),
          title: String(raw.title || "Biblioteca de Procedimentos SATS"),
          versionLabel: String(raw.versionLabel || ""),
          status: raw.status === "draft" ? "draft" : "published",
          baseVersionId: String(raw.baseVersionId || ""),
          createdAt: raw.createdAt || new Date().toISOString(),
          updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString(),
          updatedBy: String(raw.updatedBy || ""),
          publishedAt: String(raw.publishedAt || ""),
          publishedBy: String(raw.publishedBy || ""),
          changeSummary: String(raw.changeSummary || ""),
          categories: Array.isArray(raw.categories) ? raw.categories.map(normalizeProcedureCategory) : []
        };
      }

      function normalizeProcedureVersion(raw = {}) {
        return {
          id: raw.id || createId(),
          versionLabel: String(raw.versionLabel || "versão"),
          publishedAt: raw.publishedAt || new Date().toISOString(),
          publishedBy: String(raw.publishedBy || ""),
          changeSummary: String(raw.changeSummary || ""),
          snapshot: normalizeProcedureSnapshot(raw.snapshot || {})
        };
      }

      function normalizeProcedureLibrary(raw) {
        if (!raw || typeof raw !== "object") return createDefaultProcedureLibrary();
        const published = raw.published ? normalizeProcedureSnapshot(raw.published) : createDefaultProcedureLibrary().published;
        const draft = raw.draft ? normalizeProcedureSnapshot({ ...raw.draft, status: "draft" }) : null;
        return {
          schemaVersion: 1,
          activePublishedVersionId: String(raw.activePublishedVersionId || published.id),
          draft,
          published,
          versions: (Array.isArray(raw.versions) ? raw.versions.map(normalizeProcedureVersion) : []).slice(-25),
          updatedAt: raw.updatedAt || published.publishedAt || new Date().toISOString(),
          updatedBy: String(raw.updatedBy || published.publishedBy || "")
        };
      }

      function normalizeSuggestionAttachment(raw = {}) {
        return {
          id: raw.id || createId(),
          name: String(raw.name || "anexo"),
          type: String(raw.type || ""),
          size: Math.max(0, Number(raw.size) || 0),
          dataUrl: String(raw.dataUrl || raw.data_url || ""),
          uploadedAt: raw.uploadedAt || raw.uploaded_at || new Date().toISOString(),
          uploadedBy: String(raw.uploadedBy || raw.uploaded_by || "")
        };
      }

      function normalizeSuggestionResolutionReport(raw, suggestion = {}) {
        if (!raw || typeof raw !== "object") return null;
        const status = ["draft", "sent", "seen"].includes(raw.status) ? raw.status : "draft";
        return {
          id: raw.id || createId(),
          suggestionId: String(raw.suggestionId || suggestion.id || ""),
          requestDate: String(raw.requestDate || ""),
          requestWeekday: String(raw.requestWeekday || ""),
          requestTime: String(raw.requestTime || ""),
          requesterName: String(raw.requesterName || suggestion.requesterName || ""),
          requesterEmail: String(raw.requesterEmail || suggestion.requesterEmail || ""),
          requesterProfileId: String(raw.requesterProfileId || suggestion.requesterProfileId || ""),
          originalSuggestionText: String(raw.originalSuggestionText || suggestion.text || ""),
          technicalMessage: String(raw.technicalMessage || ""),
          resolvedAt: String(raw.resolvedAt || ""),
          resolvedDate: String(raw.resolvedDate || ""),
          resolvedWeekday: String(raw.resolvedWeekday || ""),
          resolvedTime: String(raw.resolvedTime || ""),
          resolvedBy: String(raw.resolvedBy || ""),
          sentAt: String(raw.sentAt || ""),
          sentTo: String(raw.sentTo || ""),
          seenAt: String(raw.seenAt || ""),
          status
        };
      }

      function normalizeSuggestionRejectionReport(raw, suggestion = {}) {
        if (!raw || typeof raw !== "object") return null;
        return {
          id: raw.id || createId(),
          suggestionId: String(raw.suggestionId || suggestion.id || ""),
          reason: String(raw.reason || ""),
          technicalMessage: String(raw.technicalMessage || ""),
          rejectedAt: String(raw.rejectedAt || ""),
          rejectedBy: String(raw.rejectedBy || ""),
          notifyRequester: raw.notifyRequester === true
        };
      }

      function normalizeImprovementSuggestions(entries) {
        if (!Array.isArray(entries)) return [];
        return entries
          .map(raw => {
            const legacyStatus = raw.status === "Resolvida" ? "resolved" : raw.status === "Nova" ? "open" : raw.status;
            const requesterEmail = String(raw.requesterEmail || raw.userEmail || raw.email || "");
            const requesterName = String(raw.requesterName || raw.userName || raw.profileName || "");
            const requesterProfileId = String(raw.requesterProfileId || raw.profileId || "");
            const suggestion = {
              id: raw.id || createId(),
              text: String(raw.text || "").trim(),
              status: SUGGESTION_STATUSES.has(legacyStatus) ? legacyStatus : "open",
              requesterEmail,
              requesterName,
              requesterProfileId,
              createdAt: raw.createdAt || raw.at || new Date().toISOString(),
              createdBy: String(raw.createdBy || requesterEmail),
              updatedAt: raw.updatedAt || raw.createdAt || raw.at || new Date().toISOString(),
              attachments: (Array.isArray(raw.attachments) ? raw.attachments : []).map(normalizeSuggestionAttachment).slice(0, 1),
              resolutionReport: null,
              rejectionReport: null,
              resolvedAt: String(raw.resolvedAt || raw.resolved_at || ""),
              resolvedBy: String(raw.resolvedBy || ""),
              rejectedAt: String(raw.rejectedAt || ""),
              rejectedBy: String(raw.rejectedBy || ""),
              userEmail: requesterEmail,
              userName: requesterName,
              userId: String(raw.userId || "")
            };
            suggestion.resolutionReport = normalizeSuggestionResolutionReport(raw.resolutionReport, suggestion);
            suggestion.rejectionReport = normalizeSuggestionRejectionReport(raw.rejectionReport, suggestion);
            return suggestion;
          })
          .filter(entry => entry.text)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      function normalizeSuggestionNotifications(entries) {
        if (!Array.isArray(entries)) return [];
        return entries.map(raw => ({
          id: raw.id || createId(),
          type: String(raw.type || "suggestion-accepted"),
          suggestionId: String(raw.suggestionId || ""),
          reportId: String(raw.reportId || ""),
          toEmail: String(raw.toEmail || ""),
          toProfileId: String(raw.toProfileId || ""),
          title: String(raw.title || "Sua Sugestão foi Aceita e Aplicada"),
          subtitle: String(raw.subtitle || "Obrigado por ajudar a melhorar meu sistema"),
          reportText: String(raw.reportText || ""),
          createdAt: raw.createdAt || new Date().toISOString(),
          seenAt: String(raw.seenAt || ""),
          dismissedAt: String(raw.dismissedAt || "")
        })).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      }

      function getCurrentSuggestionWeekKey(date = new Date()) {
        const value = new Date(date);
        value.setHours(0, 0, 0, 0);
        value.setDate(value.getDate() + 3 - ((value.getDay() + 6) % 7));
        const weekOne = new Date(value.getFullYear(), 0, 4);
        const week = 1 + Math.round(((value - weekOne) / 86400000 - 3 + ((weekOne.getDay() + 6) % 7)) / 7);
        return `${value.getFullYear()}-W${String(week).padStart(2, "0")}`;
      }

      function normalizeSuggestionWeeklyRanking(raw = {}) {
        const currentWeek = getCurrentSuggestionWeekKey();
        const entries = raw.weekKey === currentWeek && Array.isArray(raw.entries) ? raw.entries : [];
        return {
          weekKey: currentWeek,
          entries: entries.map(entry => ({
            email: String(entry.email || ""),
            profileId: String(entry.profileId || ""),
            name: String(entry.name || ""),
            count: Math.max(0, Number(entry.count) || 0),
            lastAcceptedAt: String(entry.lastAcceptedAt || "")
          })).filter(entry => entry.email || entry.profileId).sort((a, b) => b.count - a.count || String(b.lastAcceptedAt).localeCompare(String(a.lastAcceptedAt)))
        };
      }

      function mergeSuggestionNotifications(remoteEntries, localEntries) {
        const merged = new Map();
        [...normalizeSuggestionNotifications(remoteEntries), ...normalizeSuggestionNotifications(localEntries)].forEach(entry => {
          const current = merged.get(entry.id);
          if (!current || String(entry.seenAt || entry.createdAt) >= String(current.seenAt || current.createdAt)) merged.set(entry.id, entry);
        });
        return normalizeSuggestionNotifications([...merged.values()]);
      }

      function mergeImprovementSuggestions(remoteEntries, localEntries) {
        const merged = new Map();
        [...normalizeImprovementSuggestions(remoteEntries), ...normalizeImprovementSuggestions(localEntries)].forEach(entry => {
          const current = merged.get(entry.id);
          if (!current || new Date(entry.updatedAt) >= new Date(current.updatedAt)) merged.set(entry.id, entry);
        });
        return normalizeImprovementSuggestions(Array.from(merged.values()));
      }

      function mergeAuditTrails(remoteEntries, localEntries) {
        const merged = new Map();
        [...normalizeAuditTrail(remoteEntries), ...normalizeAuditTrail(localEntries)].forEach(entry => {
          const current = merged.get(entry.id);
          if (!current || String(entry.at) >= String(current.at)) merged.set(entry.id, entry);
        });
        return normalizeAuditTrail(Array.from(merged.values()));
      }

      function mergeBackupCenters(remoteCenter, localCenter) {
        const remote = normalizeBackupCenter(remoteCenter);
        const local = normalizeBackupCenter(localCenter);
        const snapshots = new Map();
        [...remote.snapshots, ...local.snapshots].forEach(snapshot => snapshots.set(snapshot.id, snapshot));
        return normalizeBackupCenter({ settings: local.settings, snapshots: [...snapshots.values()].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))) });
      }

      function normalizeActivityLog(entries) {
        if (!Array.isArray(entries)) return [];
        return entries
          .map(entry => ({
            id: entry.id || createId(),
            at: entry.at || entry.createdAt || new Date().toISOString(),
            action: String(entry.action || "Atividade"),
            detail: String(entry.detail || ""),
            userId: entry.userId || "",
            userEmail: entry.userEmail || "",
            userName: entry.userName || "",
            profileId: entry.profileId || "",
            profileName: entry.profileName || "",
            planId: entry.planId || "",
            planTitle: entry.planTitle || ""
          }))
          .filter(entry => LOGGED_ACTIVITY_ACTIONS.has(entry.action))
          .sort((a, b) => String(b.at).localeCompare(String(a.at)))
          .slice(0, MAX_ACTIVITY_LOG);
      }

      function normalizeProfile(profile) {
        const folders = Array.isArray(profile.folders) ? profile.folders : [];
        const plans = Array.isArray(profile.plans) ? profile.plans : [];
        if (!folders.some(folder => folder.id === DEFAULT_FOLDER_ID)) {
          folders.unshift(createDefaultFolder());
        }
        return {
          id: profile.id || createId(),
          userId: profile.userId || profile.user_id || "",
          name: profile.name || "Perfil sem nome",
          role: profile.role || "",
          company: profile.company || "",
          email: profile.email || "",
          clientId: profile.clientId || "",
          unitId: profile.unitId || "",
          sectorId: profile.sectorId || "",
          accessRole: normalizeEmail(profile.email) === normalizeEmail(SUPER_ADMIN_EMAIL)
            ? "owner"
            : profile.accessRole === "owner"
              ? "admin"
              : ACCESS_ROLES[profile.accessRole] ? profile.accessRole : "technician",
          avatarColor: profile.avatarColor || pickColor(profile.name || ""),
          avatarPhoto: profile.avatarPhoto || "",
          hidden: profile.hidden === true,
          createdAt: profile.createdAt || new Date().toISOString(),
          lastAccess: profile.lastAccess || "",
          folders: folders.map(folder => normalizeFolder(folder)),
          plans: plans.map(plan => normalizePlan(plan))
        };
      }

      function normalizeFolder(folder) {
        return {
          id: folder.id || createId(),
          name: folder.id === DEFAULT_FOLDER_ID ? "Sem pasta" : folder.name || "Nova pasta",
          color: folder.color || "#2563eb",
          isDefault: folder.id === DEFAULT_FOLDER_ID || !!folder.isDefault,
          hidden: folder.id === DEFAULT_FOLDER_ID ? false : folder.hidden === true,
          clientId: folder.clientId || "",
          unitId: folder.unitId || "",
          sectorId: folder.sectorId || "",
          createdAt: folder.createdAt || new Date().toISOString()
        };
      }

      function normalizePlan(plan) {
        const now = new Date().toISOString();
        const deleted = plan.deleted === true;
        const deletedAt = plan.deletedAt || "";
        const trashExpiresAt = plan.trashExpiresAt || (deleted && deletedAt ? trashExpiryFrom(new Date(deletedAt)) : "");
        return {
          id: plan.id || createId(),
          title: plan.title || "Plano sem nome",
          company: plan.company || (plan.data && plan.data.meta && plan.data.meta.company) || "",
          documentType: plan.documentType || (plan.data && plan.data.meta && plan.data.meta.documentName) || "PGR",
          folderId: plan.folderId || DEFAULT_FOLDER_ID,
          clientId: plan.clientId || "",
          unitId: plan.unitId || "",
          sectorId: plan.sectorId || "",
          visibility: plan.visibility || "",
          documentStatus: plan.documentStatus || "",
          deleted,
          deletedAt,
          deletedBy: plan.deletedBy || "",
          deletedFromProfileId: plan.deletedFromProfileId || "",
          deletedFromFolderId: plan.deletedFromFolderId || "",
          trashExpiresAt,
          createdAt: plan.createdAt || now,
          updatedAt: plan.updatedAt || now,
          data: normalizePlanData(plan.data || createPlanData({ useTemplate: true }))
        };
      }

      function normalizePlanData(data) {
        const fallback = createPlanData({ useTemplate: false });
        return {
          meta: { ...fallback.meta, ...(data.meta || {}) },
          actions: Array.isArray(data.actions) ? data.actions.map(row => normalizeRow(row, "actions")) : [],
          equipment: Array.isArray(data.equipment) ? data.equipment.map(row => normalizeRow(row, "equipment")) : [],
          trainings: Array.isArray(data.trainings) ? data.trainings.map(row => normalizeRow(row, "trainings")) : []
        };
      }

      function normalizeRow(row, section) {
        const now = new Date().toISOString();
        const base = {
          id: row.id || createId(),
          lastEdited: row.lastEdited || now,
          responsible: row.responsible || "",
          status: normalizeStatus(row.status),
          observationHtml: richFromAny(row.observationHtml || row.observation || "")
        };
        if (section === "actions") {
          return {
            ...base,
            actionHtml: richFromAny(row.actionHtml || row.action || ""),
            when: row.when || "",
            priority: normalizePriority(row.priority),
            progress: clampProgress(row.progress)
          };
        }
        if (section === "equipment") {
          return {
            ...base,
            descriptionHtml: richFromAny(row.descriptionHtml || row.description || "")
          };
        }
        return {
          ...base,
          trainingHtml: richFromAny(row.trainingHtml || row.training || row.description || ""),
          when: row.when || ""
        };
      }

      function createAppFromLegacy(legacy) {
        const profile = {
          id: createId(),
          name: "Perfil Padrão",
          role: "",
          company: legacy.meta && legacy.meta.company ? legacy.meta.company : "",
          email: "",
          avatarColor: "#2563eb",
          avatarPhoto: "",
          createdAt: new Date().toISOString(),
          lastAccess: "",
          folders: [createDefaultFolder()],
          plans: [{
            id: createId(),
            title: "Plano migrado",
            company: legacy.meta && legacy.meta.company ? legacy.meta.company : "Empresa",
            documentType: legacy.meta && legacy.meta.documentName ? legacy.meta.documentName : "PGR",
            folderId: DEFAULT_FOLDER_ID,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: normalizePlanData(legacy)
          }]
        };
        return normalizeApp({
          version: 2,
          view: "profiles",
          activeProfileId: null,
          activeFolderId: DEFAULT_FOLDER_ID,
          activePlanId: null,
          hiddenUserProfileIds: [],
          activityLog: [],
          improvementSuggestions: [],
          managementPermissions: { users: [] },
          procedureLibrary: createDefaultProcedureLibrary(),
          profiles: [normalizeProfile(profile)]
        });
      }

      function createDefaultFolder() {
        return {
          id: DEFAULT_FOLDER_ID,
          name: "Sem pasta",
          color: "#64748b",
          isDefault: true,
          hidden: false,
          clientId: "",
          unitId: "",
          sectorId: "",
          createdAt: new Date().toISOString()
        };
      }

      function createPlanData(options) {
        const now = new Date().toISOString();
        const meta = {
          companyLogo: options.company || "Nome da Empresa",
          companyLogoImage: "",
          companyLogoImageName: "",
          description: DEFAULT_DESCRIPTION,
          documentName: options.documentType || "PGR",
          company: options.company || "Empresa",
          technicalOwner: "SESMT / Consultoria",
          revisionDate: formatDateForMeta(new Date())
        };

        if (!options.useTemplate) {
          return { meta, actions: [], equipment: [], trainings: [] };
        }

        return {
          meta,
          actions: [
            { actionHtml: plainToRich("Implementar Ordem de Serviço (OS)"), responsible: "Empresa", when: "jan/26", priority: "Alta", progress: 0, status: "Não iniciado", observationHtml: "" },
            { actionHtml: plainToRich("Implementação ficha de EPI: fornecimento de luvas para proteção contra agentes químicos (luva látex) e registro em ficha de EPI. Estudar possibilidade de fornecimento de calçado de segurança."), responsible: "Empresa", when: "jan/26-jan/27", priority: "Alta", progress: 0, status: "Não iniciado", observationHtml: "" },
            { actionHtml: plainToRich("Revisão da Ordem de Serviço (atualizar conforme mudanças no ambiente de trabalho, processos e atividades. Recomenda-se revisão anual.)"), responsible: "Empresa/Consultoria", when: "", priority: "Alta", progress: 0, status: "Não iniciado", observationHtml: "" },
            { actionHtml: plainToRich("CIPA - segundo dimensionamento do Quadro I da NR-05"), responsible: "Empresa", when: "jan/26-jan/27", priority: "Alta", progress: 0, status: "Não iniciado", observationHtml: "" },
            { actionHtml: plainToRich("ASOs vigentes e atualizados dos funcionários"), responsible: "Empresa", when: "Segundo periodicidade do PCMSO", priority: "Alta", progress: 35, status: "Em andamento", observationHtml: "" },
            { actionHtml: plainToRich("Projeto AEP (Avaliação Ergonômica Preliminar + Fatores Psicossociais)"), responsible: "Empresa/Consultoria", when: "Implantação até mai/26", priority: "Alta", progress: 45, status: "Em andamento", observationHtml: "" },
            { actionHtml: plainToRich("Brigada / Prevenção contra Incêndios: manter observação das medidas de prevenção previstas na legislação e normas do corpo de bombeiros. Informar trabalhadores sobre uso de extintores, evacuação e alarmes. Manter extintores inspecionados e em suporte adequado."), responsible: "Empresa", when: "Inspeção/checklist periódico", priority: "Média", progress: 40, status: "Em andamento", observationHtml: "" },
            { actionHtml: plainToRich("Risco de queda (NR-18): proibições de uso de escada portátil conforme itens 18.8.6.8 a 18.8.6.12, incluindo uso de sapatas antiderrapantes, apoio em três pontos e isolamento de área."), responsible: "Empresa", when: "jan/26-jan/27", priority: "Média", progress: 40, status: "Em andamento", observationHtml: "" },
            { actionHtml: plainToRich("Gestão de documentação de Terceiros Contratados: cobrar PGR, PCMSO, ASOs, certificados de treinamentos, ficha de registro, Ordem de Serviço, comprovante de EPI."), responsible: "Empresa", when: "Sempre que houver novos serviços de terceiros", priority: "Média", progress: 40, status: "Em andamento", observationHtml: "" },
            { actionHtml: plainToRich("Ergonomia: para atividades em pé, recomendar pausas periódicas, alternância de postura e disponibilização de assento durante intervalos."), responsible: "Empresa", when: "Gestão ativa / Inspeção trimestral", priority: "Média", progress: 40, status: "Em andamento", observationHtml: "" },
            { actionHtml: plainToRich("Sinalização de Segurança (proibições, alertas, avisos, uso de EPIs)"), responsible: "Empresa", when: "jan/26-jan/27", priority: "Média", progress: 40, status: "Em andamento", observationHtml: "" },
            { actionHtml: plainToRich("Realização do mapa de risco por setor, em local visível."), responsible: "Empresa", when: "jan/26-jan/27", priority: "Baixa", progress: 0, status: "Não iniciado", observationHtml: "" }
          ].map(row => withBaseFields(row, now)),
          equipment: [
            { descriptionHtml: plainToRich("Cones ou sinalizadores para sinalizar a área em caso de emergência (rota de fuga, extintores, saída)"), responsible: "Empresa", status: "Não iniciado", observationHtml: "" },
            { descriptionHtml: plainToRich("Manual de procedimentos de emergência atualizado e acessível"), responsible: "Empresa", status: "Não iniciado", observationHtml: "" },
            { descriptionHtml: plainToRich("Kit de primeiros socorros"), responsible: "Empresa", status: "Não iniciado", observationHtml: "" }
          ].map(row => withBaseFields(row, now)),
          trainings: [
            { trainingHtml: plainToRich("Integração de novos funcionários"), responsible: "RH", when: "Na admissão", status: "Não iniciado", observationHtml: "" },
            { trainingHtml: plainToRich("Treinamento NR-06: Equipamentos de Proteção Individual, quando aplicável"), responsible: "Empresa/Consultoria", when: "Conforme aplicabilidade", status: "Não iniciado", observationHtml: "" },
            { trainingHtml: plainToRich("Treinamento CIPA"), responsible: "Empresa/Consultoria", when: "Conforme dimensionamento", status: "Não iniciado", observationHtml: "" }
          ].map(row => withBaseFields(row, now))
        };
      }

      function withBaseFields(row, editedAt) {
        return { id: createId(), lastEdited: editedAt, ...row };
      }

      function getDefaultProceduresHtml() {
        if (defaultProceduresHtmlCache) return defaultProceduresHtmlCache;
        const payload = (window.SATS_PROCEDURES_PAYLOAD || document.getElementById("satsProceduresPayload")?.textContent || "").trim();
        if (!payload) return "";
        const bytes = Uint8Array.from(atob(payload), char => char.charCodeAt(0));
        defaultProceduresHtmlCache = new TextDecoder("utf-8").decode(bytes);
        return defaultProceduresHtmlCache;
      }

      function buildProceduresFrameHtml(snapshot) {
        return getDefaultProceduresHtml();
      }

      function loadProceduresFrame(forceReload = false) {
        if (!els.proceduresFrame) return;
        if (forceReload) els.proceduresFrame.dataset.loaded = "";
        if (els.proceduresFrame.dataset.loaded) return;
        els.proceduresFrame.srcdoc = getDefaultProceduresHtml();
        els.proceduresFrame.dataset.loaded = "main";
      }

      function isMaintenanceModeActive() {
        return normalizeSystemSettings(app.systemSettings).maintenance.enabled === true;
      }

      function canBypassMaintenance(user = currentUser) {
        if (!user || isFullSystemAdmin(user)) return !!user && isFullSystemAdmin(user);
        return normalizeSystemSettings(app.systemSettings).maintenance.allowedEmails.includes(normalizeEmail(user.email));
      }

      function renderMaintenanceGate() {
        const active = isMaintenanceModeActive() && currentUser && !canBypassMaintenance();
        let overlay = document.getElementById("systemMaintenanceOverlay");
        if (!active) {
          if (overlay) overlay.remove();
          return false;
        }
        if (!overlay) {
          overlay = document.createElement("section");
          overlay.id = "systemMaintenanceOverlay";
          overlay.className = "system-maintenance-overlay";
          document.body.appendChild(overlay);
        }
        overlay.innerHTML = `<article class="system-maintenance-card"><h1>Sistema em manutenção</h1><p>${escapeHtml(app.systemSettings.maintenance.message)}</p><button class="button danger" type="button" id="maintenanceLogoutBtn">Sair</button></article>`;
        overlay.querySelector("#maintenanceLogoutBtn").addEventListener("click", logout);
        return true;
      }

      function applySystemBranding() {
        const branding = normalizeSystemSettings(app.systemSettings).branding;
        document.title = branding.appName || "SATS";
        if (/^#[0-9a-f]{6}$/i.test(branding.accentColor)) {
          document.documentElement.style.setProperty("--blue", branding.accentColor);
        }
        if (branding.logoDataUrl && /^data:image\//.test(branding.logoDataUrl)) {
          const logo = document.querySelector(".auth-logo");
          if (logo) logo.src = branding.logoDataUrl;
          const favicon = document.getElementById("satsFavicon");
          if (favicon) favicon.href = branding.logoDataUrl;
        }
      }

      function renderApp() {
        const showAuth = !currentUser;
        applySystemBranding();
        updateRestrictedAdminUi();
        updateAdminModeToggle();
        els.authScreen.classList.toggle("hidden", !showAuth);
        if (showAuth) {
          selectedPortalApp = null;
          els.appSelectorScreen.classList.add("hidden");
          els.documentAutomationScreen.classList.add("hidden");
          els.proceduresScreen.classList.add("hidden");
          els.managementScreen.classList.add("hidden");
          els.profileScreen.classList.add("hidden");
          els.folderScreen.classList.add("hidden");
          els.editorScreen.classList.add("hidden");
          return;
        }
        if (renderMaintenanceGate()) {
          [els.appSelectorScreen, els.documentAutomationScreen, els.proceduresScreen, els.managementScreen, els.profileScreen, els.folderScreen, els.editorScreen].forEach(screen => screen.classList.add("hidden"));
          return;
        }

        const showSelector = !selectedPortalApp;
        const showDocumentAutomation = selectedPortalApp === "documentAutomation";
        const showProcedures = selectedPortalApp === "procedures";
        const showManagement = selectedPortalApp === "management";
        els.appSelectorScreen.classList.toggle("hidden", !showSelector);
        els.documentAutomationScreen.classList.toggle("hidden", !showDocumentAutomation);
        els.proceduresScreen.classList.toggle("hidden", !showProcedures);
        els.managementScreen.classList.toggle("hidden", !showManagement);
        if (showSelector) {
          els.profileScreen.classList.add("hidden");
          els.folderScreen.classList.add("hidden");
          els.editorScreen.classList.add("hidden");
          hideFolderContextMenu();
          hideRichToolbar();
          renderAppSelector();
          return;
        }

        if (showProcedures) {
          els.documentAutomationScreen.classList.add("hidden");
          els.managementScreen.classList.add("hidden");
          els.profileScreen.classList.add("hidden");
          els.folderScreen.classList.add("hidden");
          els.editorScreen.classList.add("hidden");
          hideFolderContextMenu();
          hideRichToolbar();
          loadProceduresFrame();
          return;
        }

        if (showManagement) {
          if (!canAccessManagementPhase1()) {
            selectedPortalApp = null;
            renderApp();
            return;
          }
          els.profileScreen.classList.add("hidden");
          els.documentAutomationScreen.classList.add("hidden");
          els.folderScreen.classList.add("hidden");
          els.editorScreen.classList.add("hidden");
          hideFolderContextMenu();
          hideRichToolbar();
          renderManagement();
          return;
        }

        if (showDocumentAutomation) {
          els.managementScreen.classList.add("hidden");
          els.profileScreen.classList.add("hidden");
          els.folderScreen.classList.add("hidden");
          els.editorScreen.classList.add("hidden");
          hideFolderContextMenu();
          hideRichToolbar();
          renderDocumentAutomation();
          return;
        }

        enforceRestrictedAdminView();
        enforceHiddenItemVisibility();
        els.profileScreen.classList.toggle("hidden", app.view !== "profiles");
        els.folderScreen.classList.toggle("hidden", !["folders", "trash"].includes(app.view));
        els.editorScreen.classList.toggle("hidden", app.view !== "editor");
        hideFolderContextMenu();
        hideRichToolbar();
        if (app.view === "profiles") renderProfiles();
        if (app.view === "folders" || app.view === "trash") renderFoldersScreen();
        if (app.view === "editor") renderEditor();
        updateThemeToggle();
      }

      function enforceHiddenItemVisibility() {
        if (canAccessHiddenItems()) return;
        const profile = currentProfile();
        if (profile && profile.hidden) {
          app.activeProfileId = null;
          app.activeFolderId = DEFAULT_FOLDER_ID;
          app.activePlanId = null;
          app.view = "profiles";
          return;
        }
        if (!profile) return;
        const activeFolder = profile.folders.find(folder => folder.id === app.activeFolderId);
        const activePlan = profile.plans.find(plan => plan.id === app.activePlanId);
        const planFolder = activePlan && profile.folders.find(folder => folder.id === activePlan.folderId);
        if ((activeFolder && activeFolder.hidden) || (planFolder && planFolder.hidden)) {
          app.activeFolderId = DEFAULT_FOLDER_ID;
          app.activePlanId = null;
          app.view = "folders";
        }
      }

      function renderAppSelector() {
        els.appSelectorUserEmail.textContent = currentUser && currentUser.email
          ? `Conectado como ${currentUser.email}`
          : "Usuário conectado";
        updateThemeToggle();
        renderManagementAppCard();
        renderAppSelectorImprovements();
        maybeShowPendingSuggestionNotification();
      }

      function renderManagementAppCard() {
        if (!els.managementAppCardMount) return;
        const grid = els.managementAppCardMount.closest(".app-selector-grid");
        els.managementAppCardMount.innerHTML = "";
        grid?.classList.toggle("has-management", canAccessManagementPhase1());
        if (!canAccessManagementPhase1()) return;

        const card = document.createElement("button");
        card.className = "app-choice-card";
        card.type = "button";
        card.dataset.appChoice = "management";
        card.innerHTML = `
          <span class="app-choice-icon" aria-hidden="true">
            <svg class="icon" viewBox="0 0 24 24"><path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M22 19H2"/><path d="m3 7 6-4 6 6 6-5"/></svg>
          </span>
          <strong>Gestão SATS</strong>
          <p>Painel administrativo para acompanhar perfis, planos, sugestões e atividades do sistema.</p>
          <span class="app-choice-open">Abrir aplicativo <span aria-hidden="true">→</span></span>`;
        card.addEventListener("click", handleAppChoice);
        els.managementAppCardMount.appendChild(card);
      }

      function getDocumentAutomation() {
        app.documentAutomation = normalizeDocumentAutomation(app.documentAutomation);
        return app.documentAutomation;
      }

      function createDocumentAutomationProject(seed = {}) {
        const now = new Date().toISOString();
        return normalizeDocumentAutomationProject({
          id: createId(),
          type: seed.type || "ltcat",
          status: "draft",
          title: seed.title || "Novo LTCAT automatizado",
          companyName: seed.companyName || "",
          unitName: seed.unitName || "",
          createdAt: now,
          updatedAt: now,
          createdBy: currentUser?.email || "",
          updatedBy: currentUser?.email || "",
          sourceFiles: {},
          extractedData: {},
          manualFields: {},
          validation: {},
          generated: {}
        });
      }

      function getActiveDocumentAutomationProject() {
        const state = getDocumentAutomation();
        if (activeDocumentAutomationProjectId) {
          const saved = state.projects.find(project => project.id === activeDocumentAutomationProjectId);
          if (saved) {
            documentAutomationDraft = JSON.parse(JSON.stringify(saved));
            return documentAutomationDraft;
          }
        }
        if (!documentAutomationDraft) documentAutomationDraft = createDocumentAutomationProject();
        return documentAutomationDraft;
      }

      function setDocumentAutomationDraft(project) {
        documentAutomationDraft = normalizeDocumentAutomationProject(project);
        activeDocumentAutomationProjectId = documentAutomationDraft.id;
        return documentAutomationDraft;
      }

      function renderDocumentAutomation() {
        if (!els.documentAutomationRoot) return;
        if (!canAccessDocumentAutomation()) {
          renderDocumentAutomationBlocked();
          return;
        }
        const project = getActiveDocumentAutomationProject();
        els.documentAutomationRoot.innerHTML = `
          <section class="document-automation-shell">
            <header class="document-automation-topbar">
              <div class="document-automation-title">
                <span class="document-automation-badge">LTCAT Beta</span>
                <h1>Automação de Documentos</h1>
                <p>Transforme documentos brutos do SOC em modelos prontos da eProtege.</p>
              </div>
              <div class="document-automation-actions">
                <button class="button" type="button" data-doc-action="new-project">Novo projeto</button>
                <button class="button" type="button" data-doc-action="save-project">Salvar projeto</button>
                <button class="button primary" type="button" data-doc-action="generate-word">Gerar Word</button>
                <button class="button" type="button" data-doc-action="back-apps">Voltar aos aplicativos</button>
              </div>
            </header>
            <div class="document-automation-layout">
              <aside class="document-automation-sidebar">
                ${renderDocumentAutomationProjects()}
                ${renderDocumentAutomationQuickStats(project)}
              </aside>
              <section class="document-automation-main">
                ${renderDocumentAutomationStepper()}
                ${renderDocumentAutomationStepContent(project)}
              </section>
            </div>
          </section>`;
        bindDocumentAutomationEvents();
      }

      function renderDocumentAutomationBlocked() {
        els.documentAutomationRoot.innerHTML = `
          <section class="document-automation-blocked">
            <span class="document-automation-badge">Beta</span>
            <h1>Automação de Documentos</h1>
            <h2>Em Desenvolvimento, volte mais tarde.</h2>
            <p>Esta função está sendo testada e será liberada futuramente.</p>
            <button class="button primary" type="button" data-doc-action="back-apps">Voltar aos aplicativos</button>
          </section>`;
        bindDocumentAutomationEvents();
      }

      function renderDocumentAutomationProjects() {
        const projects = getDocumentAutomation().projects
          .slice()
          .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
        return `
          <section class="document-automation-card">
            <div class="management-panel-head">
              <div><h2>Meus documentos automatizados</h2><small>${projects.length} projeto(s) salvo(s)</small></div>
            </div>
            <div class="document-automation-project-list">
              ${projects.map(project => `
                <article class="document-automation-project-card ${project.id === activeDocumentAutomationProjectId ? "document-automation-yellow-card" : ""}">
                  <h3>${escapeHtml(project.title || "LTCAT sem título")}</h3>
                  <p>${escapeHtml(project.companyName || project.extractedData.companyName || "Empresa não informada")}</p>
                  <small>${escapeHtml(project.type.toUpperCase())} · ${escapeHtml(project.status)} · ${escapeHtml(formatDateTime(project.updatedAt))}</small>
                  <div class="document-automation-project-actions">
                    <button class="button" type="button" data-doc-action="open-project" data-project-id="${escapeAttr(project.id)}">Continuar</button>
                    <button class="button" type="button" data-doc-action="duplicate-project" data-project-id="${escapeAttr(project.id)}">Duplicar</button>
                    <button class="button danger" type="button" data-doc-action="delete-project" data-project-id="${escapeAttr(project.id)}">Excluir</button>
                  </div>
                </article>`).join("") || '<div class="document-automation-empty">Nenhum projeto salvo ainda.</div>'}
            </div>
          </section>`;
      }

      function renderDocumentAutomationQuickStats(project) {
        const risks = project.extractedData?.risks || [];
        const missing = project.validation?.missingFields || [];
        return `
          <section class="document-automation-card">
            <h2>Resumo do projeto</h2>
            <p><strong>Tipo:</strong> ${escapeHtml(project.type.toUpperCase())}</p>
            <p><strong>Empresa:</strong> ${escapeHtml(project.companyName || project.extractedData.companyName || "-")}</p>
            <p><strong>Riscos extraídos:</strong> ${risks.length}</p>
            <p><strong>Pendências:</strong> ${missing.length}</p>
          </section>`;
      }

      function renderDocumentAutomationStepper() {
        const steps = [
          ["type", "1. Tipo"],
          ["upload", "2. Upload"],
          ["extract", "3. Extração"],
          ["review", "4. Revisão"],
          ["complements", "5. Complementos"],
          ["preview", "6. Prévia"],
          ["generate", "7. Gerar Word"]
        ];
        return `<nav class="document-automation-stepper" aria-label="Etapas da Automação">${steps.map(([id, label]) => `
          <button class="document-automation-step ${activeDocumentAutomationStep === id ? "is-active" : ""}" type="button" data-doc-step="${id}">${escapeHtml(label)}</button>
        `).join("")}</nav>`;
      }

      function renderDocumentAutomationStepContent(project) {
        if (activeDocumentAutomationStep === "type") return renderDocumentAutomationTypeStep(project);
        if (activeDocumentAutomationStep === "upload") return renderDocumentAutomationUploadStep(project);
        if (activeDocumentAutomationStep === "extract") return renderDocumentAutomationExtractStep(project);
        if (activeDocumentAutomationStep === "review") return renderDocumentAutomationReviewStep(project);
        if (activeDocumentAutomationStep === "complements") return renderDocumentAutomationComplementsStep(project);
        if (activeDocumentAutomationStep === "preview") return renderDocumentAutomationPreviewStep(project);
        return renderDocumentAutomationGenerateStep(project);
      }

      function renderDocumentAutomationTypeStep(project) {
        return `
          <section class="document-automation-panel">
            <div class="management-panel-head"><div><h2>Tipo de documento</h2><small>Fase 1 liberada apenas para LTCAT.</small></div></div>
            <div class="document-automation-type-grid">
              <button class="document-automation-type-card is-available" type="button" data-doc-action="select-type" data-doc-type="ltcat">
                <span class="document-automation-badge">Disponível</span>
                <strong>LTCAT</strong>
                <p>Gere o Laudo Técnico das Condições Ambientais do Trabalho a partir do documento bruto do SOC.</p>
              </button>
              <button class="document-automation-type-card is-locked" type="button" data-doc-action="locked-type">
                <span class="document-automation-badge">Em breve</span>
                <strong>PGR</strong>
                <p>Estrutura preparada para fase futura.</p>
              </button>
              <button class="document-automation-type-card is-locked" type="button" data-doc-action="locked-type">
                <span class="document-automation-badge">Em breve</span>
                <strong>PCMSO</strong>
                <p>Estrutura preparada para fase futura.</p>
              </button>
            </div>
          </section>`;
      }

      function renderDocumentAutomationUploadStep(project) {
        const files = project.sourceFiles || {};
        return `
          <section class="document-automation-panel">
            <div class="management-panel-head"><div><h2>Upload dos arquivos</h2><small>Limite de 10 MB por arquivo. Arquivos são tratados como dados, sem execução.</small></div></div>
            <div class="document-automation-upload-grid">
              ${renderDocumentAutomationUpload("socFile", "Documento bruto gerado pelo SOC", "Envie aqui o arquivo que vem direto da plataforma SOC.", ".rtf,.doc,.docx,.txt,text/plain,application/rtf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document", files.socFile, true)}
              ${renderDocumentAutomationUpload("templateFile", "Modelo interno de LTCAT", "Modelo usado pela empresa para montar o documento final. Na fase 1 fica salvo como referência.", ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document", files.templateFile)}
              ${renderDocumentAutomationUpload("previousDocumentFile", "Documento do ano anterior", "Use para puxar datas, histórico de revisão e informações recorrentes, quando possível.", ".docx,.doc,.pdf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document", files.previousDocumentFile)}
              ${renderDocumentAutomationUpload("companyLogo", "Logo da empresa", "PNG ou JPEG para capa e cabeçalho do Word.", ".png,.jpg,.jpeg,image/png,image/jpeg", files.companyLogo)}
            </div>
            <div class="document-automation-actions" style="margin-top:14px">
              <button class="button primary" type="button" data-doc-action="extract-soc">Extrair dados do SOC</button>
              <button class="button" type="button" data-doc-step="review">Ir para revisão</button>
            </div>
          </section>`;
      }

      function renderDocumentAutomationUpload(key, label, description, accept, file, required = false) {
        return `
          <label class="document-automation-upload ${key === "socFile" ? "is-wide" : ""}">
            <strong>${escapeHtml(label)}${required ? " *" : ""}</strong>
            <span>${escapeHtml(description)}</span>
            <input type="file" data-doc-file="${escapeAttr(key)}" accept="${escapeAttr(accept)}">
            ${file ? `<div class="document-automation-file-row"><span>${escapeHtml(file.name)} · ${escapeHtml(formatFileSize(file.size))}</span><button class="button" type="button" data-doc-action="remove-file" data-doc-file-key="${escapeAttr(key)}">Remover</button></div>` : ""}
          </label>`;
      }

      function renderDocumentAutomationExtractStep(project) {
        const data = project.extractedData || normalizeLtcatExtractedData();
        const text = data.rawSocText || data.rawText || "";
        const blocks = data.riskSectorBlocks || [];
        return `
          <section class="document-automation-panel">
            <div class="management-panel-head"><div><h2>Extração automática</h2><small>Campos básicos são lidos por rótulo; riscos são copiados de SETOR até antes de Síntese.</small></div></div>
            ${renderDocumentAutomationValidation(project)}
            <div class="document-automation-preview is-wide">
              <h3>Texto extraído do SOC</h3>
              <pre style="white-space:pre-wrap; font:inherit; line-height:1.6; margin:0">${escapeHtml(text ? text.slice(0, 12000) : "Envie o RTF do SOC e clique em Extrair dados do SOC.")}</pre>
            </div>
            <div class="document-automation-preview is-wide">
              <h3>Bloco técnico extraído do SOC</h3>
              <p>${blocks.length ? `${blocks.length} setor(es) encontrado(s).` : "Nenhum setor extraído ainda."}</p>
            </div>
            ${renderLtcatExtractionDebug(data)}
            <div class="document-automation-actions" style="margin-top:14px">
              <button class="button primary" type="button" data-doc-action="extract-soc">Reprocessar extração</button>
              <button class="button" type="button" data-doc-action="extract-risk-blocks">Extrair riscos do SOC</button>
              <button class="button" type="button" data-doc-step="review">Revisar dados</button>
            </div>
          </section>`;
      }

      function renderDocumentAutomationReviewStep(project) {
        const data = project.extractedData || normalizeLtcatExtractedData();
        return `
          <section class="document-automation-panel">
            <div class="management-panel-head"><div><h2>Revisão dos dados extraídos</h2><small>Edite os campos antes de gerar o Word.</small></div></div>
            ${renderDocumentAutomationValidation(project)}
            <div class="document-automation-field-grid">
              ${renderAutomationTextField("companyName", "Empresa", data.companyName, project)}
              ${renderAutomationTextField("unitName", "Unidade", data.unitName, project)}
              ${renderAutomationTextField("cnpj", "CNPJ", data.cnpj, project)}
              ${renderAutomationTextField("address", "Endereço", data.address, project)}
              ${renderAutomationTextField("cep", "CEP", data.cep, project)}
              ${renderAutomationTextField("city", "Cidade", data.city, project)}
              ${renderAutomationTextField("state", "Estado", data.state, project)}
              ${renderAutomationTextField("cnae", "CNAE", data.cnae, project)}
              ${renderAutomationTextField("riskDegree", "Grau de risco", data.riskDegree, project)}
              ${renderAutomationTextField("issueDate", "Data de emissão SOC", data.issueDate, project)}
              ${renderAutomationTextField("technicalResponsible", "Responsável técnico", data.technicalResponsible, project, true)}
            </div>
            <h3>Setores e cargos</h3>
            <div class="document-automation-field-grid">
              <label class="field is-wide">Setores encontrados<textarea data-doc-array="hierarchy.sectors" rows="3">${escapeHtml((data.hierarchy?.sectors || []).join("\\n"))}</textarea></label>
              <label class="field is-wide">Cargos encontrados<textarea data-doc-array="hierarchy.roles" rows="3">${escapeHtml((data.hierarchy?.roles || []).join("\\n"))}</textarea></label>
            </div>
            ${renderLtcatRawRiskBlocksEditor(data.riskSectorBlocks || [])}
          </section>`;
      }

      function renderLtcatRawRiskBlocksEditor(blocks) {
        const count = blocks.length;
        return `
          <section class="document-automation-preview is-wide">
            <div class="management-panel-head">
              <div>
                <h3>Bloco técnico extraído do SOC</h3>
                <small>${count ? `${count} setor(es) encontrado(s). Revise o texto bruto antes de gerar o Word.` : "Nenhum bloco iniciado por SETOR foi extraído ainda."}</small>
              </div>
              <div class="management-item-actions">
                <button class="button" type="button" data-doc-action="extract-risk-blocks">${count ? "Extrair riscos novamente" : "Extrair riscos do SOC"}</button>
                <button class="button primary" type="button" data-doc-action="save-risk-review">Salvar revisão dos riscos</button>
              </div>
            </div>
            <div class="document-automation-risk-list">
              ${blocks.map((block, index) => `
                <section class="document-automation-risk-raw-block">
                  <header>
                    <div>
                      <strong>Setor: ${escapeHtml(block.title || `Setor ${index + 1}`)}</strong>
                      <span>Bloco ${index + 1} de ${count}</span>
                    </div>
                    <div class="document-automation-risk-raw-actions">
                      <button class="button" type="button" data-doc-action="move-risk-block-up" data-risk-index="${index}" ${index === 0 ? "disabled" : ""}>Subir</button>
                      <button class="button" type="button" data-doc-action="move-risk-block-down" data-risk-index="${index}" ${index === count - 1 ? "disabled" : ""}>Descer</button>
                      <button class="button" type="button" data-doc-action="duplicate-risk-block" data-risk-index="${index}">Duplicar</button>
                      <button class="button danger" type="button" data-doc-action="delete-risk-block" data-risk-index="${index}">Excluir</button>
                    </div>
                  </header>
                  <textarea data-doc-raw-risk="${index}" rows="14">${escapeHtml(block.rawText || "")}</textarea>
                </section>`).join("") || '<div class="document-automation-empty">Use o botão "Extrair riscos do SOC" para copiar o trecho entre SETOR e antes de Síntese.</div>'}
            </div>
          </section>`;
      }

      function renderLtcatExtractionDebug(data = {}) {
        const debug = data.extractionDebug || {};
        const warnings = Array.isArray(data.riskExtractionWarnings) ? data.riskExtractionWarnings : [];
        const sectorNames = Array.isArray(debug.sectorNames) ? debug.sectorNames : (data.riskSectorBlocks || []).map(block => block.title).filter(Boolean);
        if (!Object.keys(debug).length && !warnings.length && !sectorNames.length) return "";
        return `
          <section class="document-automation-validation">
            <strong>Debug da extração LTCAT</strong>
            <div class="document-automation-validation-list">
              <span>UNIDADE: ${debug.unidadeIndex >= 0 ? `linha ${debug.unidadeIndex + 1}` : "não encontrada"}</span>
              <span>SETOR real: ${debug.startIndex >= 0 ? `linha ${debug.startIndex + 1}` : "não encontrado"}</span>
              <span>Síntese: ${debug.sinteseIndex >= 0 ? `linha ${debug.sinteseIndex + 1}` : "não encontrada"}</span>
              <span>Setores: ${Number(debug.sectorCount || sectorNames.length || 0)}</span>
              ${debug.ignoredHierarchyHeader ? "<span>Cabeçalho Setor/Cargo/Funcionários ignorado</span>" : ""}
              ${sectorNames.length ? `<span>${escapeHtml(sectorNames.join(" · "))}</span>` : ""}
              ${warnings.map(warning => `<span>${escapeHtml(warning)}</span>`).join("")}
            </div>
          </section>`;
      }

      function renderAutomationTextField(name, label, value, project, wide = false) {
        const confidence = project.validation?.confidence?.[name] || (value ? "medium" : "missing");
        return `<label class="field ${wide ? "is-wide" : ""}">${escapeHtml(label)}
          <span class="document-automation-confidence" data-confidence="${escapeAttr(confidence)}">${escapeHtml(confidenceLabel(confidence))}</span>
          <input data-doc-extracted="${escapeAttr(name)}" value="${escapeAttr(value || "")}">
        </label>`;
      }

      function renderAutomationRiskField(risk, index, field) {
        const isLong = ["parecerTecnico", "conclusaoAposentadoria"].includes(field);
        const className = isLong ? "field is-wide" : "field";
        const value = risk[field] || "";
        return `<label class="${className}">${escapeHtml(ltcatRiskFieldLabel(field))}
          ${isLong
            ? `<textarea data-doc-risk="${index}" data-doc-risk-field="${escapeAttr(field)}" rows="3">${escapeHtml(value)}</textarea>`
            : `<input data-doc-risk="${index}" data-doc-risk-field="${escapeAttr(field)}" value="${escapeAttr(value)}">`}
        </label>`;
      }

      function renderAutomationRisks(risks) {
        if (!risks.length) return '<div class="document-automation-empty">Nenhum risco encontrado automaticamente. Você poderá complementar o documento manualmente.</div>';
        return risks.map((risk, index) => `
          <article class="document-automation-risk-card">
            <div class="management-panel-head">
              <div><h3>${escapeHtml(risk.perigo || `Risco ${index + 1}`)}</h3><small>${escapeHtml([risk.setor, risk.cargo].filter(Boolean).join(" · ") || "Setor/cargo não identificados")}</small></div>
            </div>
            <div class="document-automation-risk-meta">
              <span>${escapeHtml(risk.grupo || "Grupo não identificado")}</span>
              <span>eSocial: ${escapeHtml(risk.codigoESocial || "-")}</span>
              <span>Nível: ${escapeHtml(risk.nivelRisco || "-")}</span>
            </div>
            <div class="document-automation-field-grid">
              ${["setor", "cargo", "grupo", "codigoESocial", "perigo", "criterioAvaliacao", "perfilExposicao", "parecerTecnico", "conclusaoAposentadoria"].map(field => renderAutomationRiskField(risk, index, field)).join("")}
            </div>
          </article>`).join("");
      }

      function renderDocumentAutomationComplementsStep(project) {
        const fields = project.manualFields || normalizeLtcatManualFields();
        return `
          <section class="document-automation-panel">
            <div class="management-panel-head"><div><h2>Complementos manuais</h2><small>Esses campos complementam ou sobrescrevem os dados extraídos.</small></div></div>
            <div class="document-automation-field-grid">
              ${renderManualField("finalCompanyName", "Nome final da empresa", fields.finalCompanyName)}
              ${renderManualField("unitName", "Unidade", fields.unitName)}
              ${renderManualField("emissionMonth", "Mês de emissão", fields.emissionMonth)}
              ${renderManualField("emissionYear", "Ano de emissão", fields.emissionYear)}
              ${renderManualField("city", "Cidade", fields.city)}
              ${renderManualField("elaboratedBy", "Elaborado por", fields.elaboratedBy)}
              ${renderManualField("responsibleRole", "Cargo do responsável", fields.responsibleRole)}
              ${renderManualField("councilNumber", "Número do conselho", fields.councilNumber)}
              ${renderManualField("cpf", "CPF", fields.cpf)}
              ${renderManualField("specialty", "Especialidade", fields.specialty)}
              ${renderManualField("currentRevisionDate", "Data da revisão atual", fields.currentRevisionDate)}
              ${renderManualField("revisionDescription", "Descrição da revisão", fields.revisionDescription, true)}
              ${renderManualField("generalNotes", "Observações gerais", fields.generalNotes, true)}
              ${renderManualField("generalConclusion", "Conclusão geral complementar", fields.generalConclusion, true)}
            </div>
            <h3>Histórico de revisões</h3>
            <div class="document-automation-revision-list">
              ${(fields.revisionHistory || []).map((row, index) => `
                <div class="document-automation-field-grid">
                  <label class="field">Revisão<input data-doc-revision="${index}" data-doc-revision-field="revision" value="${escapeAttr(row.revision)}"></label>
                  <label class="field">Data<input data-doc-revision="${index}" data-doc-revision-field="date" value="${escapeAttr(row.date)}"></label>
                  <label class="field is-wide">Descrição<input data-doc-revision="${index}" data-doc-revision-field="description" value="${escapeAttr(row.description)}"></label>
                  <button class="button danger" type="button" data-doc-action="remove-revision" data-revision-index="${index}">Remover revisão</button>
                </div>`).join("")}
            </div>
            <div class="document-automation-actions" style="margin-top:14px"><button class="button" type="button" data-doc-action="add-revision">Adicionar revisão</button></div>
          </section>`;
      }

      function renderManualField(name, label, value, wide = false) {
        return `<label class="field ${wide ? "is-wide" : ""}">${escapeHtml(label)}${wide ? `<textarea data-doc-manual="${escapeAttr(name)}" rows="4">${escapeHtml(value || "")}</textarea>` : `<input data-doc-manual="${escapeAttr(name)}" value="${escapeAttr(value || "")}">`}</label>`;
      }

      function renderDocumentAutomationPreviewStep(project) {
        const preview = buildLtcatWordHtml(project, { preview: true });
        project.generated.htmlPreview = preview;
        return `
          <section class="document-automation-panel">
            <div class="management-panel-head"><div><h2>Prévia do LTCAT</h2><small>Confira capa, dados, histórico e riscos antes de baixar.</small></div></div>
            ${renderDocumentAutomationValidation(project)}
            <div class="document-automation-actions" style="margin-bottom:14px">
              <button class="button" type="button" data-doc-step="review">Voltar para revisão</button>
              <button class="button" type="button" data-doc-action="save-project">Salvar projeto</button>
              <button class="button" type="button" data-doc-action="download-json">Baixar dados extraídos JSON</button>
              <button class="button primary" type="button" data-doc-action="generate-word">Gerar Word</button>
            </div>
            <div class="document-automation-preview">${preview}</div>
          </section>`;
      }

      function renderDocumentAutomationGenerateStep(project) {
        return `
          <section class="document-automation-panel">
            <div class="management-panel-head"><div><h2>Gerar Word</h2><small>O arquivo será gerado como .doc compatível com Microsoft Word, editável e sem RTF.</small></div></div>
            ${renderDocumentAutomationValidation(project)}
            <div class="document-automation-actions">
              <button class="button" type="button" data-doc-action="download-json">Baixar JSON extraído</button>
              <button class="button" type="button" data-doc-action="save-project">Salvar projeto</button>
              <button class="button" type="button" data-doc-action="clear-project">Limpar projeto</button>
              <button class="button primary" type="button" data-doc-action="generate-word">Gerar Word</button>
            </div>
          </section>`;
      }

      function renderDocumentAutomationValidation(project) {
        updateDocumentAutomationValidation(project);
        const missing = project.validation?.missingFields || [];
        const warnings = project.validation?.warnings || [];
        if (!missing.length && !warnings.length) return "";
        return `<div class="document-automation-validation"><strong>Validação</strong><div class="document-automation-validation-list">${missing.map(item => `<span>${escapeHtml(item)}</span>`).join("")}${warnings.map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div></div>`;
      }

      function bindDocumentAutomationEvents() {
        const root = els.documentAutomationRoot;
        if (!root) return;
        root.onclick = handleDocumentAutomationClick;
        root.onchange = handleDocumentAutomationChange;
        root.oninput = handleDocumentAutomationInput;
      }

      async function handleDocumentAutomationClick(event) {
        const stepButton = event.target.closest("[data-doc-step]");
        if (stepButton) {
          activeDocumentAutomationStep = stepButton.dataset.docStep || "type";
          renderDocumentAutomation();
          return;
        }
        const button = event.target.closest("[data-doc-action]");
        if (!button) return;
        const action = button.dataset.docAction;
        const project = getActiveDocumentAutomationProject();
        if (action === "back-apps") return showAppSelector();
        if (action === "locked-type") return showToast("PGR e PCMSO entram em fases futuras.", "info");
        if (action === "select-type") {
          project.type = button.dataset.docType || "ltcat";
          activeDocumentAutomationStep = "upload";
          renderDocumentAutomation();
          return;
        }
        if (action === "new-project") {
          documentAutomationDraft = createDocumentAutomationProject();
          activeDocumentAutomationProjectId = documentAutomationDraft.id;
          activeDocumentAutomationStep = "type";
          renderDocumentAutomation();
          return;
        }
        if (action === "open-project") {
          const saved = getDocumentAutomation().projects.find(item => item.id === button.dataset.projectId);
          if (!saved) return showToast("Projeto não encontrado.", "warning");
          activeDocumentAutomationProjectId = saved.id;
          documentAutomationDraft = JSON.parse(JSON.stringify(saved));
          activeDocumentAutomationStep = "review";
          renderDocumentAutomation();
          return;
        }
        if (action === "duplicate-project") return duplicateDocumentAutomationProject(button.dataset.projectId);
        if (action === "delete-project") return deleteDocumentAutomationProject(button.dataset.projectId);
        if (action === "remove-file") {
          const key = button.dataset.docFileKey;
          if (key && project.sourceFiles) project.sourceFiles[key] = null;
          touchDocumentAutomationProject(project);
          renderDocumentAutomation();
          return;
        }
        if (action === "extract-soc") return extractCurrentDocumentAutomationProject();
        if (action === "extract-risk-blocks") return extractLtcatRawRisksForCurrentProject();
        if (action === "save-risk-review") {
          recordActivity("Editou campos extraídos", "Salvou revisão manual dos riscos brutos do LTCAT.");
          return saveDocumentAutomationProject(project);
        }
        if (action === "move-risk-block-up" || action === "move-risk-block-down") {
          const index = Number(button.dataset.riskIndex);
          const blocks = project.extractedData.riskSectorBlocks || [];
          const target = action === "move-risk-block-up" ? index - 1 : index + 1;
          if (blocks[index] && blocks[target]) {
            [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
            blocks.forEach((block, blockIndex) => block.order = blockIndex + 1);
            touchDocumentAutomationProject(project);
            renderDocumentAutomation();
          }
          return;
        }
        if (action === "duplicate-risk-block") {
          const index = Number(button.dataset.riskIndex);
          const blocks = project.extractedData.riskSectorBlocks || [];
          if (blocks[index]) {
            blocks.splice(index + 1, 0, normalizeLtcatRawRiskSectorBlock({
              ...blocks[index],
              id: createId(),
              title: `${blocks[index].title || `Setor ${index + 1}`} - cópia`,
              order: index + 2,
              extractedAt: new Date().toISOString()
            }, index + 1));
            blocks.forEach((block, blockIndex) => block.order = blockIndex + 1);
            touchDocumentAutomationProject(project);
            renderDocumentAutomation();
          }
          return;
        }
        if (action === "delete-risk-block") {
          const index = Number(button.dataset.riskIndex);
          const blocks = project.extractedData.riskSectorBlocks || [];
          if (!blocks[index]) return;
          if (!await openConfirmModal({ title: "Excluir setor extraído", message: `O bloco "${blocks[index].title || `Setor ${index + 1}`}" será removido da revisão de riscos.`, confirmLabel: "Excluir bloco", tone: "danger" })) return;
          blocks.splice(index, 1);
          blocks.forEach((block, blockIndex) => block.order = blockIndex + 1);
          touchDocumentAutomationProject(project);
          renderDocumentAutomation();
          return;
        }
        if (action === "save-project") return saveDocumentAutomationProject(project);
        if (action === "download-json") return downloadDocumentAutomationJson(project);
        if (action === "generate-word") return generateLtcatDocument(project);
        if (action === "clear-project") {
          if (!await openConfirmModal({ title: "Limpar projeto", message: "Os dados não salvos deste projeto serão descartados.", confirmLabel: "Limpar projeto", tone: "warning" })) return;
          documentAutomationDraft = createDocumentAutomationProject();
          activeDocumentAutomationProjectId = documentAutomationDraft.id;
          activeDocumentAutomationStep = "type";
          renderDocumentAutomation();
          return;
        }
        if (action === "add-revision") {
          project.manualFields.revisionHistory.push({ revision: "", date: "", description: "" });
          touchDocumentAutomationProject(project);
          renderDocumentAutomation();
          return;
        }
        if (action === "remove-revision") {
          const index = Number(button.dataset.revisionIndex);
          if (Number.isInteger(index)) project.manualFields.revisionHistory.splice(index, 1);
          if (!project.manualFields.revisionHistory.length) project.manualFields.revisionHistory.push({ revision: "00", date: "", description: "Emissão inicial do LTCAT." });
          touchDocumentAutomationProject(project);
          renderDocumentAutomation();
        }
      }

      async function handleDocumentAutomationChange(event) {
        const fileInput = event.target.closest("[data-doc-file]");
        if (fileInput) {
          await handleDocumentAutomationFile(fileInput.dataset.docFile, fileInput.files && fileInput.files[0]);
          fileInput.value = "";
          return;
        }
        handleDocumentAutomationInput(event);
      }

      function handleDocumentAutomationInput(event) {
        const project = getActiveDocumentAutomationProject();
        const extracted = event.target.closest("[data-doc-extracted]");
        if (extracted) {
          project.extractedData[extracted.dataset.docExtracted] = extracted.value;
          if (["companyName", "unitName"].includes(extracted.dataset.docExtracted)) {
            project[extracted.dataset.docExtracted] = extracted.value;
          }
          touchDocumentAutomationProject(project, false);
          return;
        }
        const manual = event.target.closest("[data-doc-manual]");
        if (manual) {
          project.manualFields[manual.dataset.docManual] = manual.value;
          touchDocumentAutomationProject(project, false);
          return;
        }
        const arrayField = event.target.closest("[data-doc-array]");
        if (arrayField) {
          const values = String(arrayField.value || "").split(/\n+/).map(item => item.trim()).filter(Boolean);
          if (arrayField.dataset.docArray === "hierarchy.sectors") project.extractedData.hierarchy.sectors = values;
          if (arrayField.dataset.docArray === "hierarchy.roles") project.extractedData.hierarchy.roles = values;
          touchDocumentAutomationProject(project, false);
          return;
        }
        const riskField = event.target.closest("[data-doc-risk]");
        if (riskField) {
          const index = Number(riskField.dataset.docRisk);
          const field = riskField.dataset.docRiskField;
          if (project.extractedData.risks[index] && field) project.extractedData.risks[index][field] = riskField.value;
          touchDocumentAutomationProject(project, false);
          return;
        }
        const rawRiskField = event.target.closest("[data-doc-raw-risk]");
        if (rawRiskField) {
          const index = Number(rawRiskField.dataset.docRawRisk);
          const block = project.extractedData.riskSectorBlocks[index];
          if (block) {
            block.rawText = rawRiskField.value;
            block.title = extractLtcatSectorTitleFromBlock(block.rawText, index) || block.title;
            touchDocumentAutomationProject(project, false);
          }
          return;
        }
        const revisionField = event.target.closest("[data-doc-revision]");
        if (revisionField) {
          const index = Number(revisionField.dataset.docRevision);
          const field = revisionField.dataset.docRevisionField;
          if (project.manualFields.revisionHistory[index] && field) project.manualFields.revisionHistory[index][field] = revisionField.value;
          touchDocumentAutomationProject(project, false);
        }
      }

      async function handleDocumentAutomationFile(key, file) {
        if (!file) return;
        if (!canAccessDocumentAutomation()) return showToast("Você não tem permissão para usar esta função.", "danger");
        if (file.size > DOCUMENT_AUTOMATION_MAX_FILE_BYTES) {
          return showToast("Arquivo muito grande. Envie arquivos com até 10 MB.", "warning");
        }
        const project = getActiveDocumentAutomationProject();
        try {
          const stored = await readDocumentAutomationFile(file, key);
          project.sourceFiles[key] = stored;
          if (key === "socFile") recordActivity("Enviou arquivo SOC", file.name);
          touchDocumentAutomationProject(project);
          if (key === "socFile" && !stored.text) {
            showToast("Arquivo salvo como referência. Para extração automática nesta fase, envie o RTF ou TXT do SOC.", "warning", 5200);
          } else {
            showToast("Arquivo carregado com sucesso.", "success");
          }
          renderDocumentAutomation();
        } catch (error) {
          console.error(error);
          showToast("Não foi possível ler o arquivo selecionado.", "danger");
        }
      }

      function readDocumentAutomationFile(file, key) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = reject;
          reader.onload = () => {
            const base = {
              id: createId(),
              name: file.name,
              type: file.type || inferFileMime(file.name),
              size: file.size,
              uploadedAt: new Date().toISOString(),
              uploadedBy: currentUser?.email || ""
            };
            const shouldReadAsText = key === "socFile" && /\.(rtf|txt)$/i.test(file.name);
            if (shouldReadAsText) {
              base.text = String(reader.result || "");
              resolve(base);
            } else {
              base.dataUrl = String(reader.result || "");
              resolve(base);
            }
          };
          if (key === "socFile" && /\.rtf$/i.test(file.name)) reader.readAsText(file, "windows-1252");
          else if (key === "socFile" && /\.txt$/i.test(file.name)) reader.readAsText(file, "utf-8");
          else reader.readAsDataURL(file);
        });
      }

      function inferFileMime(name = "") {
        if (/\.pdf$/i.test(name)) return "application/pdf";
        if (/\.docx$/i.test(name)) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        if (/\.doc$/i.test(name)) return "application/msword";
        if (/\.png$/i.test(name)) return "image/png";
        if (/\.jpe?g$/i.test(name)) return "image/jpeg";
        if (/\.rtf$/i.test(name)) return "application/rtf";
        return "application/octet-stream";
      }

      function touchDocumentAutomationProject(project, regenerateValidation = true) {
        project.updatedAt = new Date().toISOString();
        project.updatedBy = currentUser?.email || "";
        if (regenerateValidation) updateDocumentAutomationValidation(project);
      }

      function parseSocRtfToText(fileText = "") {
        let text = String(fileText || "");
        if (!/[{}\\][a-z0-9*'-]+/i.test(text)) return normalizeSocText(text);
        text = stripRtfBinaryPayloads(text);
        text = removeRtfDestinationGroups(text);
        text = text.replace(/\\'[0-9a-fA-F]{2}/g, match => {
          const byte = parseInt(match.slice(2), 16);
          try {
            return new TextDecoder("windows-1252").decode(new Uint8Array([byte]));
          } catch (error) {
            return String.fromCharCode(byte);
          }
        });
        text = text
          .replace(/\\u(-?\d+)(?: ?(?![\\{}]).)?/g, (_, code) => {
            const value = Number(code);
            return Number.isFinite(value) ? String.fromCharCode(value < 0 ? value + 65536 : value) : "";
          })
          .replace(/\\pard\b/g, "")
          .replace(/\\par\b/g, "\n")
          .replace(/\\line/g, "\n")
          .replace(/\\tab/g, "    ")
          .replace(/\\cell/g, "\t")
          .replace(/\\row/g, "\n")
          .replace(/\\page/g, "\n\n")
          .replace(/\\~|~/g, " ")
          .replace(/\\[-_{}]/g, "")
          .replace(/\\[a-zA-Z*]+-?\d* ?/g, "")
          .replace(/[{}]/g, "");
        return normalizeSocText(text);
      }

      function stripRtfBinaryPayloads(value = "") {
        const text = String(value || "");
        let output = "";
        let index = 0;
        while (index < text.length) {
          const rest = text.slice(index);
          const match = rest.match(/^\\bin(-?\d+) ?/i);
          if (match) {
            const count = Math.max(0, Number(match[1]) || 0);
            index += match[0].length + count;
            output += " ";
            continue;
          }
          output += text[index];
          index += 1;
        }
        return output;
      }

      function removeRtfDestinationGroups(value = "") {
        const text = String(value || "");
        const destinations = new Set(["fonttbl", "colortbl", "stylesheet", "info", "pict", "object", "shp", "shpinst", "shppict", "themedata", "datastore", "xmlnstbl", "generator"]);
        let output = "";
        let skipDepth = 0;
        for (let index = 0; index < text.length; index += 1) {
          const char = text[index];
          if (char === "{") {
            if (skipDepth > 0) {
              skipDepth += 1;
              continue;
            }
            const destination = readRtfGroupDestination(text, index + 1);
            if (destination && destinations.has(destination)) {
              skipDepth = 1;
              continue;
            }
          }
          if (char === "}" && skipDepth > 0) {
            skipDepth -= 1;
            continue;
          }
          if (skipDepth === 0) output += char;
        }
        return output;
      }

      function readRtfGroupDestination(text, startIndex) {
        let index = startIndex;
        while (/\s/.test(text[index] || "")) index += 1;
        if (text[index] !== "\\") return "";
        index += 1;
        if (text[index] === "*") {
          index += 1;
          if (text[index] === "\\") index += 1;
        }
        const match = text.slice(index).match(/^([a-zA-Z]+)/);
        return match ? match[1].toLowerCase() : "";
      }

      function normalizeSocText(text = "") {
        return String(text || "")
          .replace(/\r/g, "\n")
          .replace(/\u0000/g, "")
          .replace(/\bx\d{4,}(?=[A-Za-zÀ-ÿ])/g, "")
          .replace(/\bx\d{4,}\b/g, "")
          .replace(/[ \t]+\n/g, "\n")
          .replace(/\n[ \t]+/g, "\n")
          .replace(/[ \t]{2,}/g, " ")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
      }

      function normalizeSocTextForRiskExtraction(text = "") {
        return String(text || "")
          .replace(/\r\n?/g, "\n")
          .replace(/\u00a0/g, " ")
          .replace(/\u0000/g, "")
          .replace(/\bx\d{4,}(?=[A-Za-zÀ-ÿ])/g, "")
          .replace(/\bx\d{4,}\b/g, "")
          .replace(/[ \t]+\n/g, "\n")
          .replace(/\n[ \t]+/g, "\n")
          .replace(/[ \t]{2,}/g, " ")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
      }

      function normalizeSocPlainText(text = "") {
        return normalizeSocTextForRiskExtraction(text);
      }

      function extractLtcatRawRiskBlocksFromSocText(text = "") {
        const core = extractLtcatSocRiskCore(text);
        return {
          error: core.success ? "" : core.error,
          warnings: core.warnings || [],
          rawRiskSection: core.rawRiskCore || "",
          synthesisRawText: core.synthesisRawText || "",
          riskSectorBlocks: core.sectors || [],
          companyData: core.companyData || {},
          debug: core.debug || {}
        };
      }

      function extractLtcatSocRiskCore(text = "") {
        const normalized = normalizeSocPlainText(text);
        const lines = normalized.split("\n");
        const warnings = [];
        const unidadeIndex = findLineIndex(lines, line => /\bunidade\b/i.test(normalizeText(line)));
        const headerIndex = findLineIndex(lines, (_line, index) => isHierarchyHeaderSectorLine(lines, index), unidadeIndex >= 0 ? unidadeIndex + 1 : 0);
        const startIndex = findFirstRealSetorAfter(lines, unidadeIndex >= 0 ? unidadeIndex + 1 : 0);
        if (startIndex < 0) {
          return {
            success: false,
            error: headerIndex >= 0
              ? "Foi encontrada a tabela de hierarquia, mas nenhum SETOR real de riscos foi localizado depois dela."
              : "Não foi possível encontrar o primeiro SETOR real após UNIDADE. Verifique se o RTF do SOC está correto.",
            companyData: extractLtcatCompanyDataFromSocText(normalized),
            rawRiskCore: "",
            sectors: [],
            debug: { unidadeIndex, startIndex: -1, sinteseIndex: -1, sectorCount: 0, ignoredHierarchyHeader: headerIndex >= 0 },
            warnings
          };
        }

        let sinteseIndex = findLineIndexAfter(lines, startIndex + 1, line => /^\s*sintese\b/i.test(normalizeText(line)));
        let endIndex = sinteseIndex;
        let synthesisRawText = "";
        if (sinteseIndex > startIndex) {
          synthesisRawText = lines.slice(sinteseIndex).join("\n").trim();
        } else {
          endIndex = findLineIndexAfter(lines, startIndex + 1, line => /^(conclusao|assinatura|anexos|termo)\b/i.test(normalizeText(line).trim()));
          warnings.push("Síntese não encontrada. O sistema extraiu o bloco até o fim do documento. Revise antes de gerar.");
          if (endIndex < 0) endIndex = lines.length;
          sinteseIndex = -1;
        }

        const rawRiskCoreLines = lines.slice(startIndex, endIndex);
        const sectors = splitRawRiskCoreByRealSetor(rawRiskCoreLines);
        const debug = {
          unidadeIndex,
          headerIndex,
          startIndex,
          sinteseIndex,
          endIndex,
          sectorCount: sectors.length,
          sectorNames: sectors.map(sector => sector.title).filter(Boolean),
          ignoredHierarchyHeader: headerIndex >= 0 && headerIndex < startIndex,
          first300Chars: rawRiskCoreLines.join("\n").trim().slice(0, 300),
          last300Chars: rawRiskCoreLines.join("\n").trim().slice(-300)
        };
        return {
          success: sectors.length > 0,
          error: sectors.length ? "" : "Nenhum bloco iniciado por SETOR foi encontrado após UNIDADE.",
          companyData: extractLtcatCompanyDataFromSocText(normalized),
          rawRiskCore: rawRiskCoreLines.join("\n").trim(),
          sectors,
          synthesisRawText,
          debug,
          warnings
        };
      }

      function findLineIndex(lines, predicate, startIndex = 0) {
        for (let index = Math.max(0, startIndex || 0); index < lines.length; index += 1) {
          if (predicate(lines[index], index)) return index;
        }
        return -1;
      }

      function findLineIndexAfter(lines, startIndex, predicate) {
        return findLineIndex(lines, predicate, startIndex);
      }

      function findFirstRealSetorAfter(lines, startIndex = 0) {
        return findLineIndex(lines, (_line, index) => isRealRiskSectorStart(lines, index), startIndex);
      }

      function isRealRiskSectorStart(lines, index) {
        const line = String(lines[index] || "").trim();
        const match = line.match(/^\s*SETOR\b\s*:?\s*(.*)$/i);
        if (!match) return false;
        if (isHierarchyHeaderSectorLine(lines, index)) return false;
        const inlineTitle = String(match[1] || "").trim();
        if (inlineTitle) {
          const normalizedInline = normalizeText(inlineTitle).trim();
          if (/cargo|funcionario|funcionarios|funcao|função|quantidade/.test(normalizedInline)) return false;
          if (hasRecentStandaloneSetor(lines, index)) return false;
          return true;
        }
        const next = getNextNonEmptyLines(lines, index, 4);
        if (!next.length) return false;
        const first = normalizeText(next[0]).trim();
        if (/^(cargo|funcionario|funcionarios|funcao|função|quantidade)$/.test(first)) return false;
        return true;
      }

      function isHierarchyHeaderSectorLine(lines, index) {
        const line = normalizeText(String(lines[index] || "").replace(/\s+/g, " ").trim());
        if (/^setor\s+cargo\s+funcionarios?$/.test(line)) return true;
        if (line !== "setor") return false;
        const next = getNextNonEmptyLines(lines, index, 4).map(value => normalizeText(value).trim());
        return next[0] === "cargo" && /^funcionarios?$/.test(next[1] || "");
      }

      function hasRecentStandaloneSetor(lines, index) {
        let checked = 0;
        for (let cursor = index - 1; cursor >= 0 && checked < 4; cursor -= 1) {
          const value = String(lines[cursor] || "").trim();
          if (!value) continue;
          checked += 1;
          if (/^\s*SETOR\b\s*:?\s*$/i.test(value)) return true;
          if (/^\s*CARGO\b/i.test(value)) return false;
        }
        return false;
      }

      function getNextNonEmptyLines(lines, index, limit = 4) {
        const values = [];
        for (let cursor = index + 1; cursor < lines.length && values.length < limit; cursor += 1) {
          const value = String(lines[cursor] || "").trim();
          if (value) values.push(value);
        }
        return values;
      }

      function splitRawRiskCoreByRealSetor(lines) {
        const sourceLines = Array.isArray(lines) ? lines : String(lines || "").split("\n");
        const starts = [];
        for (let index = 0; index < sourceLines.length; index += 1) {
          if (isRealRiskSectorStart(sourceLines, index)) starts.push(index);
        }
        const now = new Date().toISOString();
        return starts.map((start, sectorIndex) => {
          const end = starts[sectorIndex + 1] == null ? sourceLines.length : starts[sectorIndex + 1];
          const rawText = sourceLines.slice(start, end).join("\n").trim();
          return normalizeLtcatRawRiskSectorBlock({
            id: createId(),
            title: extractLtcatSectorTitleFromBlock(rawText, sectorIndex),
            rawText,
            order: sectorIndex + 1,
            extractedAt: now
          }, sectorIndex);
        });
      }

      function extractLtcatSectorTitleFromBlock(rawText = "", index = 0) {
        const lines = String(rawText || "").split(/\n+/).map(line => line.trim()).filter(Boolean);
        const first = lines[0] || "";
        const inlineTitle = first.replace(/^setor\s*:?\s*/i, "").trim();
        if (inlineTitle && normalizeText(inlineTitle) !== "setor") return inlineTitle;
        const title = (lines[1] || "").trim();
        if (title && !/^(cargo|funcao|função|gfip|descricao|descrição)\b/i.test(normalizeText(title))) return title;
        return `Setor ${index + 1}`;
      }

      function extractLtcatCompanyDataFromSocText(text = "") {
        const clean = normalizeSocText(text);
        const lines = clean.split("\n");
        const cnpjMatch = clean.match(/\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/);
        const cepMatch = clean.match(/\b\d{5}-?\d{3}\b/);
        const address = extractAddress(clean);
        const unitName = extractUnitName(clean);
        const companyName = extractCompanyName(clean) || unitName;
        const cityState = extractCityStateFromAddress(address);
        return {
          companyName,
          unitName,
          cnpj: cnpjMatch ? cnpjMatch[0] : "",
          address,
          cep: cepMatch ? cepMatch[0] : "",
          city: cityState.city,
          state: cityState.state,
          cnae: extractCnae(clean),
          riskDegree: extractRiskGrade(clean),
          issueDate: findDateNear(clean, ["Emitido em", "Data de emissão", "Emissão", "Data do documento"]),
          technicalResponsible: findSocValue(clean, ["Responsável Técnico", "Responsável pela elaboração", "Elaborado por"]),
          hierarchy: extractLtcatHierarchy(lines)
        };
      }

      function extractCompanyName(text = "") {
        const lines = normalizeSocText(text).split("\n").map(line => line.trim()).filter(Boolean);
        const cnpjIndex = lines.findIndex(line => /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/.test(line));
        if (cnpjIndex > 0) {
          for (let index = cnpjIndex - 1; index >= Math.max(0, cnpjIndex - 8); index -= 1) {
            const candidate = lines[index];
            if (candidate && !/^(cnpj|endere[cç]o|unidade|ltcat|laudo|emitido|-|\.)$/i.test(candidate)) return candidate;
          }
        }
        return extractByLabel(text, "Empresa") || extractByLabel(text, "Razão Social") || "";
      }

      function extractUnitName(text = "") {
        const lines = normalizeSocText(text).split("\n");
        const unidadeIndex = findLineIndex(lines, line => /\bunidade\b/i.test(normalizeText(line)));
        if (unidadeIndex >= 0) {
          const next = getNextNonEmptyLines(lines, unidadeIndex, 8).find(value => !/^(cnpj|endere[cç]o|cnae|grau de risco|-|\.)$/i.test(value.trim()));
          if (next) return next.trim();
        }
        return extractByLabel(text, "Unidade") || extractByLabel(text, "Estabelecimento") || "";
      }

      function extractCnpj(text = "") {
        return (String(text || "").match(/\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/) || [""])[0];
      }

      function extractCnae(text = "") {
        const clean = normalizeSocText(text);
        const direct = clean.match(/\b\d{4}-\d\/\d{2}\s*-\s*[^\n]{2,180}/);
        if (direct) return direct[0].trim();
        const compact = clean.match(/\b\d{4}-\d\/\d{2}\b/);
        if (compact) return compact[0].trim();
        return extractValueAfterStandaloneLabel(clean, "CNAE") || extractByLabel(clean, "CNAE") || "";
      }

      function extractAddress(text = "") {
        return extractValueAfterStandaloneLabel(text, "Endereço") || extractValueAfterStandaloneLabel(text, "Endereco") || extractByLabel(text, "Endereço") || extractByLabel(text, "Logradouro") || "";
      }

      function extractRiskGrade(text = "") {
        const direct = String(text || "").match(/Grau\s+de\s+Risco\s*:?\s*([0-4]\b|[^\n]{1,40})/i);
        if (direct) return direct[0].replace(/^Grau\s+de\s+Risco\s*:?\s*/i, "Grau de Risco ").trim();
        return findSocValue(text, ["Grau de Risco", "Grau risco"]);
      }

      function extractValueAfterStandaloneLabel(text = "", label = "") {
        const lines = normalizeSocText(text).split("\n").map(line => line.trim());
        const target = normalizeText(label).trim();
        for (let index = 0; index < lines.length; index += 1) {
          const current = lines[index];
          const normalized = normalizeText(current).replace(/:$/, "").trim();
          if (normalized === target) {
            const next = getNextNonEmptyLines(lines, index, 8).find(value => !/^[-.]$/.test(value.trim()));
            if (next) return next.trim();
          }
          if (normalized.startsWith(`${target}:`)) {
            const value = current.replace(new RegExp(`^${label}\\s*:?\\s*`, "i"), "").trim();
            if (value) return value;
          }
        }
        return "";
      }

      function extractCityStateFromAddress(address = "") {
        const text = String(address || "");
        const slash = text.match(/([A-Za-zÀ-ÿ\s.'-]+)\/([A-Z]{2})\b/);
        if (slash) return { city: slash[1].split("-").pop().trim(), state: slash[2].toUpperCase() };
        return { city: "", state: "" };
      }

      function extractLtcatHierarchy(lines = []) {
        const sectors = [];
        const roles = [];
        const headerIndex = findLineIndex(lines, (_line, index) => isHierarchyHeaderSectorLine(lines, index));
        const firstRealSetor = findFirstRealSetorAfter(lines, headerIndex >= 0 ? headerIndex + 1 : 0);
        if (headerIndex >= 0) {
          const end = firstRealSetor > headerIndex ? firstRealSetor : Math.min(lines.length, headerIndex + 120);
          for (let index = headerIndex + 3; index < end; index += 2) {
            const sector = String(lines[index] || "").trim();
            const role = String(lines[index + 1] || "").trim();
            if (sector && !/^[-.]$/.test(sector)) sectors.push(sector);
            if (role && !/^[-.]$/.test(role) && !/^\d+$/.test(role)) roles.push(role);
          }
        }
        const riskCoreStart = firstRealSetor >= 0 ? firstRealSetor : 0;
        for (let index = riskCoreStart; index < lines.length; index += 1) {
          if (/^\s*CARGO\b\s*:?\s*$/i.test(lines[index] || "")) {
            const title = getNextNonEmptyLines(lines, index, 4)[0] || "";
            if (title) roles.push(title);
          }
        }
        return {
          sectors: uniqueStrings(sectors),
          roles: uniqueStrings(roles)
        };
      }

      function extractLtcatCargoNamesFromRiskCore(rawRiskCore = "") {
        const lines = String(rawRiskCore || "").split("\n");
        const roles = [];
        for (let index = 0; index < lines.length; index += 1) {
          if (/^\s*CARGO\b\s*:?\s*$/i.test(lines[index] || "")) {
            const title = getNextNonEmptyLines(lines, index, 4)[0] || "";
            if (title && !/^(gfip|descri[cç][aã]o|especifica[cç][aã]o|-|\.)$/i.test(title.trim())) roles.push(title.trim());
          }
        }
        return uniqueStrings(roles);
      }

      function extractCurrentDocumentAutomationProject() {
        const project = getActiveDocumentAutomationProject();
        const file = project.sourceFiles?.socFile;
        if (!file || !file.text) {
          activeDocumentAutomationStep = "upload";
          renderDocumentAutomation();
          return showToast("Envie o documento bruto do SOC antes de extrair.", "warning");
        }
        const text = parseSocRtfToText(file.text);
        const extracted = extractLtcatDataFromSocText(text);
        const currentBlocks = project.extractedData?.riskSectorBlocks || [];
        if (currentBlocks.length) {
          extracted.rawRiskSection = project.extractedData.rawRiskSection || "";
          extracted.riskSectorBlocks = currentBlocks;
          extracted.synthesisRawText = project.extractedData.synthesisRawText || "";
          extracted.riskExtractionWarnings = project.extractedData.riskExtractionWarnings || [];
          extracted.extractionDebug = project.extractedData.extractionDebug || {};
          extracted.rawRiskWarning = "Os blocos de riscos editados manualmente foram preservados. Use Extrair riscos novamente para substituir.";
        } else {
          const rawRiskResult = extractLtcatSocRiskCore(text);
          Object.assign(extracted, rawRiskResult.companyData || {});
          extracted.rawRiskSection = rawRiskResult.rawRiskCore || "";
          extracted.riskSectorBlocks = rawRiskResult.sectors || [];
          extracted.synthesisRawText = "";
          extracted.rawRiskWarning = rawRiskResult.error || rawRiskResult.warnings.join(" ");
          extracted.riskExtractionWarnings = rawRiskResult.warnings || [];
          extracted.extractionDebug = rawRiskResult.debug || {};
          extracted.hierarchy = {
            sectors: rawRiskResult.sectors.map(block => block.title).filter(Boolean),
            roles: extractLtcatCargoNamesFromRiskCore(rawRiskResult.rawRiskCore || "")
          };
        }
        project.extractedData = extracted;
        project.companyName = extracted.companyName || project.companyName;
        project.unitName = extracted.unitName || project.unitName;
        project.title = buildDocumentAutomationTitle(project);
        project.status = "review";
        touchDocumentAutomationProject(project);
        recordActivity("Extraiu dados do SOC", `Extração processada para ${project.companyName || file.name}.`);
        activeDocumentAutomationStep = "review";
        showToast("Dados extraídos. Revise antes de gerar o Word.", "success");
        renderDocumentAutomation();
      }

      async function extractLtcatRawRisksForCurrentProject() {
        const project = getActiveDocumentAutomationProject();
        const file = project.sourceFiles?.socFile;
        if (!file || !file.text) {
          activeDocumentAutomationStep = "upload";
          renderDocumentAutomation();
          return showToast("Envie o RTF ou TXT do SOC antes de extrair os riscos.", "warning");
        }
        const currentBlocks = project.extractedData?.riskSectorBlocks || [];
        if (currentBlocks.length) {
          const confirmed = await openConfirmModal({
            title: "Extrair riscos novamente",
            message: "Isso substituirá os blocos de riscos editados manualmente. Deseja continuar?",
            confirmLabel: "Extrair novamente",
            tone: "warning",
            requiredText: "EXTRAIR"
          });
          if (!confirmed) return;
        }
        const text = parseSocRtfToText(file.text);
        const result = extractLtcatSocRiskCore(text);
        const companyData = result.companyData || {};
        Object.assign(project.extractedData, Object.fromEntries(Object.entries(companyData).filter(([, value]) => value)));
        project.extractedData.rawSocText = text;
        project.extractedData.rawText = text;
        project.extractedData.rawRiskSection = result.rawRiskCore || "";
        project.extractedData.riskSectorBlocks = result.sectors || [];
        project.extractedData.synthesisRawText = "";
        project.extractedData.riskExtractionWarnings = result.warnings || [];
        project.extractedData.extractionDebug = result.debug || {};
        project.extractedData.rawRiskWarning = result.error || result.warnings.join(" ");
        if (result.sectors.length) {
          project.extractedData.hierarchy.sectors = result.sectors.map(block => block.title).filter(Boolean);
          project.extractedData.hierarchy.roles = extractLtcatCargoNamesFromRiskCore(result.rawRiskCore || "");
        }
        touchDocumentAutomationProject(project);
        activeDocumentAutomationStep = "review";
        if (result.error) showToast(result.error, "warning", 5200);
        else showToast(`${result.sectors.length} setor(es) extraído(s) do SOC.`, result.warnings.length ? "warning" : "success", 5200);
        renderDocumentAutomation();
      }

      function extractLtcatDataFromSocText(text = "") {
        const clean = normalizeSocText(text);
        const data = normalizeLtcatExtractedData({ rawText: clean, rawSocText: clean });
        const companyData = extractLtcatCompanyDataFromSocText(clean);
        Object.assign(data, companyData);
        const cityState = findSocValue(clean, ["Cidade/UF", "Município/UF", "Cidade"]);
        if (cityState) {
          const parts = cityState.split(/[-/]/).map(part => part.trim()).filter(Boolean);
          data.city = parts[0] || "";
          data.state = (parts[1] || "").slice(0, 2).toUpperCase();
        }
        data.hierarchy = companyData.hierarchy || data.hierarchy;
        data.risks = [];
        return data;
      }

      function extractByLabel(text, label) {
        return findSocValue(text, [label]);
      }

      function findSocValue(text, labels) {
        for (const label of labels) {
          const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const match = text.match(new RegExp(`${escaped}\\s*[:\\-]?\\s*([^\\n\\t]{2,160})`, "i"));
          if (match) return match[1].trim().replace(/\s{2,}/g, " ");
        }
        return "";
      }

      function findDateNear(text, labels) {
        for (const label of labels) {
          const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const match = text.match(new RegExp(`${escaped}[^\\n]{0,80}?(\\d{2}\\/\\d{2}\\/\\d{4}|\\d{4}-\\d{2}-\\d{2})`, "i"));
          if (match) return match[1];
        }
        return (text.match(/\b\d{2}\/\d{2}\/\d{4}\b/) || [""])[0];
      }

      function extractLtcatRisksFromSocLines(lines, fullText) {
        const risks = [];
        let currentSetor = "";
        let currentCargo = "";
        lines.forEach((line, index) => {
          const normalized = normalizeText(line);
          if (/^setor\b/.test(normalized)) currentSetor = line.replace(/^setor\s*:?\s*/i, "");
          if (/^(cargo|funcao)\b/.test(normalized)) currentCargo = line.replace(/^(cargo|função|funcao)\s*:?\s*/i, "");
          const riskName = detectRiskName(line);
          if (!riskName) return;
          const context = lines.slice(Math.max(0, index - 4), Math.min(lines.length, index + 12)).join("\n");
          risks.push(normalizeLtcatRisk({
            setor: currentSetor,
            cargo: currentCargo,
            grupo: detectRiskGroup(riskName, context),
            codigoESocial: (context.match(/\b\d{2}\.\d{2}\.\d{3}\b|\b\d{2,3}-\d{2}-\d\b/) || [""])[0],
            perigo: riskName,
            descricao: pickContextValue(context, ["Descrição", "Descricão", "Perigo/Fator de Risco"]) || context.slice(0, 500),
            fundamentacaoLegal: pickContextValue(context, ["Fundamentação legal", "Fundamentacao legal", "Legislação"]),
            possiveisLesoes: pickContextValue(context, ["Possíveis lesões", "Possiveis lesoes", "Agravos"]),
            fontesCircunstancias: pickContextValue(context, ["Fontes", "Circunstâncias", "Circunstancias"]),
            criterioAvaliacao: pickContextValue(context, ["Critério", "Criterio", "Avaliação", "Avaliacao"]),
            perfilExposicao: pickContextValue(context, ["Perfil de exposição", "Perfil de exposicao", "Exposição", "Exposicao"]),
            probabilidade: pickContextValue(context, ["Probabilidade"]),
            gravidade: pickContextValue(context, ["Gravidade"]),
            nivelRisco: pickContextValue(context, ["Nível de risco", "Nivel de risco"]),
            prevencaoControle: pickContextValue(context, ["Prevenção", "Prevencao", "Controle", "Medidas"]),
            parecerTecnico: pickContextValue(context, ["Parecer técnico", "Parecer tecnico"]),
            conclusaoAposentadoria: pickContextValue(context, ["Conclusão", "Conclusao", "Aposentadoria"])
          }));
        });
        return dedupeLtcatRisks(risks).slice(0, 200);
      }

      function detectRiskName(line) {
        const candidates = [
          "Ruído", "Calor", "Frio", "Umidade", "Vibração", "Radiação", "Poeira", "Fumos", "Névoas", "Vapores",
          "Agentes químicos", "Agentes biológicos", "Bactérias", "Fungos", "Vírus", "Óleos", "Graxa", "Solvente",
          "Benzeno", "Sílica", "Asbesto", "Cromo", "Manganês", "Chumbo"
        ];
        const normalizedLine = normalizeText(line);
        if (!/(risco|agente|perigo|fator|ruido|calor|quimic|biologic|poeira|vibrac|radiac|umidade|frio)/.test(normalizedLine)) return "";
        const found = candidates.find(item => normalizedLine.includes(normalizeText(item)));
        if (found) return found;
        const cleaned = line.replace(/^(risco|agente|perigo|fator de risco)\s*:?\s*/i, "").trim();
        return cleaned.length >= 3 && cleaned.length <= 120 ? cleaned : "";
      }

      function detectRiskGroup(riskName, context = "") {
        const text = normalizeText(`${riskName} ${context}`);
        if (/ruido|calor|frio|umidade|vibrac|radiac/.test(text)) return "Físico";
        if (/quimic|poeira|fumos|nevoa|vapor|oleo|graxa|solvente|benzeno|silica|asbesto|cromo|chumbo|manganes/.test(text)) return "Químico";
        if (/biologic|bacteria|fungo|virus|parasita/.test(text)) return "Biológico";
        return "Inespecífico";
      }

      function pickContextValue(context, labels) {
        for (const label of labels) {
          const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const match = context.match(new RegExp(`${escaped}\\s*[:\\-]?\\s*([^\\n]{2,360})`, "i"));
          if (match) return match[1].trim();
        }
        return "";
      }

      function uniqueStrings(values) {
        const seen = new Set();
        return values.map(value => String(value || "").trim()).filter(value => {
          const key = normalizeText(value);
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }

      function dedupeLtcatRisks(risks) {
        const seen = new Set();
        return risks.filter(risk => {
          const key = normalizeText([risk.setor, risk.cargo, risk.perigo].join("|"));
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }

      function updateDocumentAutomationValidation(project) {
        const data = project.extractedData || {};
        const missing = [];
        const warnings = [];
        const confidence = {};
        [
          ["companyName", "Empresa não encontrada"],
          ["cnpj", "CNPJ não encontrado"],
          ["cnae", "CNAE não encontrado"],
          ["address", "Endereço não encontrado"],
          ["city", "Cidade não encontrada"]
        ].forEach(([field, label]) => {
          confidence[field] = data[field] ? "high" : "missing";
          if (!data[field]) warnings.push(`${label}. O documento será gerado mesmo assim.`);
        });
        if (!data.riskSectorBlocks || !data.riskSectorBlocks.length) missing.push("Nenhum bloco iniciado por SETOR foi extraído do SOC");
        if (data.rawRiskWarning) warnings.push(data.rawRiskWarning);
        if (!data.hierarchy?.sectors?.length) warnings.push("Nenhum setor encontrado");
        if (!project.sourceFiles?.companyLogo) warnings.push("Logo da empresa não enviada");
        if (!project.sourceFiles?.previousDocumentFile) warnings.push("Documento anterior não enviado");
        if (!project.manualFields?.revisionHistory?.length) warnings.push("Histórico de revisão vazio");
        project.validation = { missingFields: missing, warnings, confidence };
        return project.validation;
      }

      function confidenceLabel(value) {
        if (value === "high") return "alta";
        if (value === "medium") return "revisar";
        if (value === "low") return "baixa";
        return "não encontrado";
      }

      function ltcatRiskFieldLabel(field) {
        const labels = {
          setor: "Setor",
          cargo: "Cargo",
          grupo: "Grupo",
          codigoESocial: "Código eSocial",
          perigo: "Perigo/Fator de Risco",
          criterioAvaliacao: "Critério de avaliação",
          perfilExposicao: "Perfil de exposição",
          parecerTecnico: "Parecer técnico",
          conclusaoAposentadoria: "Conclusão da aposentadoria especial"
        };
        return labels[field] || field;
      }

      function buildDocumentAutomationTitle(project) {
        const data = project?.extractedData || {};
        const fields = project?.manualFields || {};
        const company = fields.finalCompanyName || project?.companyName || data.companyName || "Empresa";
        const unit = fields.unitName || project?.unitName || data.unitName || "";
        const parts = ["LTCAT", company];
        if (unit && normalizeText(unit) !== normalizeText(company)) parts.push(unit);
        return parts.filter(Boolean).join(" - ");
      }

      function saveDocumentAutomationProject(project) {
        if (!canAccessDocumentAutomation()) return showToast("Você não tem permissão para usar esta função.", "danger");
        const state = getDocumentAutomation();
        const normalized = normalizeDocumentAutomationProject({
          ...project,
          title: buildDocumentAutomationTitle(project),
          companyName: project.companyName || project.extractedData?.companyName || "",
          unitName: project.unitName || project.extractedData?.unitName || ""
        });
        touchDocumentAutomationProject(normalized);
        const index = state.projects.findIndex(item => item.id === normalized.id);
        const isNew = index < 0;
        if (isNew) state.projects.unshift(normalized);
        else state.projects[index] = normalized;
        activeDocumentAutomationProjectId = normalized.id;
        documentAutomationDraft = JSON.parse(JSON.stringify(normalized));
        app.documentAutomation = normalizeDocumentAutomation(state);
        recordActivity(isNew ? "Criou projeto de automação" : "Salvou projeto de automação", normalized.title);
        saveApp({ fullSave: true });
        showToast("Projeto salvo com sucesso.", "success");
        renderDocumentAutomation();
      }

      function duplicateDocumentAutomationProject(projectId) {
        if (!canAccessDocumentAutomation()) return showToast("Você não tem permissão para usar esta função.", "danger");
        const state = getDocumentAutomation();
        const source = state.projects.find(project => project.id === projectId);
        if (!source) return showToast("Projeto não encontrado.", "warning");
        const now = new Date().toISOString();
        const copy = normalizeDocumentAutomationProject({
          ...JSON.parse(JSON.stringify(source)),
          id: createId(),
          title: `${source.title || "LTCAT"} - cópia`,
          status: "draft",
          createdAt: now,
          updatedAt: now,
          createdBy: currentUser?.email || "",
          updatedBy: currentUser?.email || "",
          generated: {
            htmlPreview: "",
            lastGeneratedAt: "",
            fileName: ""
          }
        });
        state.projects.unshift(copy);
        activeDocumentAutomationProjectId = copy.id;
        documentAutomationDraft = JSON.parse(JSON.stringify(copy));
        app.documentAutomation = normalizeDocumentAutomation(state);
        recordActivity("Criou projeto de automação", `Duplicou ${source.title || "projeto de automação"}.`);
        saveApp({ fullSave: true });
        showToast("Projeto duplicado.", "success");
        renderDocumentAutomation();
      }

      async function deleteDocumentAutomationProject(projectId) {
        if (!canAccessDocumentAutomation()) return showToast("Você não tem permissão para usar esta função.", "danger");
        const state = getDocumentAutomation();
        const project = state.projects.find(item => item.id === projectId);
        if (!project) return showToast("Projeto não encontrado.", "warning");
        const confirmed = await openConfirmModal({
          title: "Excluir projeto de automação",
          message: `O projeto "${project.title || "LTCAT"}" será removido da lista de documentos automatizados.`,
          confirmLabel: "Excluir projeto",
          tone: "danger",
          requiredText: "EXCLUIR"
        });
        if (!confirmed) return;
        state.projects = state.projects.filter(item => item.id !== projectId);
        if (activeDocumentAutomationProjectId === projectId) {
          documentAutomationDraft = createDocumentAutomationProject();
          activeDocumentAutomationProjectId = documentAutomationDraft.id;
          activeDocumentAutomationStep = "type";
        }
        app.documentAutomation = normalizeDocumentAutomation(state);
        recordActivity("Excluiu projeto de automação", project.title || projectId);
        saveApp({ fullSave: true });
        showToast("Projeto excluído.", "success");
        renderDocumentAutomation();
      }

      function downloadDocumentAutomationJson(project) {
        if (!canAccessDocumentAutomation()) return showToast("Você não tem permissão para usar esta função.", "danger");
        const payload = {
          exportedAt: new Date().toISOString(),
          app: "SATS",
          module: "Automação de Documentos",
          type: project.type,
          title: project.title,
          companyName: project.companyName,
          unitName: project.unitName,
          extraction: {
            companyData: project.extractedData ? {
              companyName: project.extractedData.companyName || "",
              unitName: project.extractedData.unitName || "",
              cnpj: project.extractedData.cnpj || "",
              address: project.extractedData.address || "",
              cep: project.extractedData.cep || "",
              city: project.extractedData.city || "",
              state: project.extractedData.state || "",
              cnae: project.extractedData.cnae || "",
              riskDegree: project.extractedData.riskDegree || ""
            } : {},
            rawRiskCore: project.extractedData?.rawRiskSection || "",
            sectors: project.extractedData?.riskSectorBlocks || [],
            debug: project.extractedData?.extractionDebug || {},
            warnings: project.extractedData?.riskExtractionWarnings || []
          },
          extractedData: project.extractedData,
          manualFields: project.manualFields,
          validation: project.validation,
          sourceFiles: Object.fromEntries(Object.entries(project.sourceFiles || {}).map(([key, file]) => [
            key,
            file ? {
              id: file.id,
              name: file.name,
              type: file.type,
              size: file.size,
              uploadedAt: file.uploadedAt,
              uploadedBy: file.uploadedBy
            } : null
          ]))
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
        downloadBlob(blob, `${sanitizeFileName(project.title || "ltcat-dados-extraidos") || "ltcat-dados-extraidos"}.json`);
        showToast("JSON extraído baixado.", "success");
      }

      function generateLtcatDocument(project) {
        if (!canAccessDocumentAutomation()) return showToast("Você não tem permissão para usar esta função.", "danger");
        const normalized = normalizeDocumentAutomationProject(project);
        updateDocumentAutomationValidation(normalized);
        if (!normalized.extractedData?.riskSectorBlocks?.length) {
          documentAutomationDraft = normalized;
          activeDocumentAutomationStep = "review";
          renderDocumentAutomation();
          return showToast("Não foi possível gerar o Word: extraia primeiro o bloco real de SETOR do SOC.", "warning", 5200);
        }
        const wordHtml = buildLtcatWordHtml(normalized);
        const fileName = ltcatWordFileName(normalized);
        const blob = new Blob(["\ufeff", wordHtml], { type: "application/msword;charset=utf-8" });
        downloadBlob(blob, fileName);
        normalized.status = "generated";
        normalized.generated = {
          htmlPreview: buildLtcatWordHtml(normalized, { preview: true }),
          lastGeneratedAt: new Date().toISOString(),
          fileName
        };
        touchDocumentAutomationProject(normalized);
        documentAutomationDraft = normalized;
        activeDocumentAutomationProjectId = normalized.id;
        recordActivity("Gerou Word da automação", fileName);
        const state = getDocumentAutomation();
        const index = state.projects.findIndex(item => item.id === normalized.id);
        if (index < 0) state.projects.unshift(normalized);
        else state.projects[index] = normalized;
        app.documentAutomation = normalizeDocumentAutomation(state);
        saveApp({ fullSave: true });
        showToast("Word do LTCAT gerado com sucesso.", "success");
        renderDocumentAutomation();
      }

      function ltcatWordFileName(project) {
        const fields = project.manualFields || {};
        const data = project.extractedData || {};
        const company = fields.finalCompanyName || project.companyName || data.companyName || "Empresa";
        const unit = fields.unitName || project.unitName || data.unitName || "";
        const parts = ["LTCAT", company];
        if (unit && normalizeText(unit) !== normalizeText(company)) parts.push(unit);
        const safe = sanitizeFileName(parts.filter(Boolean).join(" - ")) || "LTCAT";
        return `${safe}.doc`;
      }

      function getLtcatEprotegeLogoDataUrl() {
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIsAAACGCAIAAABi5e52AAAAAXNSR0IArs4c6QAAAAlwSFlzAAAOwwAADsQBiC4+owAANBZJREFUeF7tfQlgVOW1/9x7Z8lsyWRfSEIICYQtiGyyCIKACk9F616t1uW5VFvtpn31vaf2tbX12VZrrX0utWpr3RVXWhWsIAjIvpOQEMi+ZzL7zL3/3znfnRAgkJmQhLR/rjFMZr773e9+5zvn/M7vnPuNpGma4fQxhGdAHsJjOz00moHTEhrq6+C0hE5LaKjPwFAf32kdOi2hoT4DQ318p3XotISG+gwM9fGd1qHTEhrqMzDUx3dah05LaKjPwFAf32kdOi2hoT4DQ318g6FD4UgkFI4M9ZkYquMbDAmVHaiva+4YqjMw1Mc10BKi9OCOyvpOX/BkZiKiGVQ+X8N/p/YY9ISnNMA5VtyQ9Mgra5dMHTGuMLNvc9vasCXY+LlkTrdmLnAmpvatkx7Paml3t/sCssSy1yQc9C9GzO+Ig19K+C/ZluB02Prx6jF2NdASMoTC6j3Prr59YfG4wqwYx9TVzOsLNDRUByp+mR1+STOkHbD8IGXE4vSMPIvZGG9XR7VXI5E15YferGmqV4NGOaIYJFmTZEmGSYGcFP6N1/hRJEWRJIgvy2g6Lzdj7LB0XWonOYKYTx9oK2fo9PmaPaE4bQOZsrq6gzW7frln5bcbKtYmGOxmY6h8/V9aN/+gdutzPl8o5hvssaH2VWXNryqr1oQ6DqmhQ5FwdSRco4Vr1BB+6tVQnRquV8ONWrhBizRo9E6jGtwe8HxU3djq9pzcpeM+e8Al1Nrhb/GF1Pjch9RYu9e39z+yOp+0eHZ6fG0RYyQiG5rbq63hTemtv6ze9Yzf7437XqMneLyBD2saa6WwRZLNkmIyKIpBxo9Jki2SZJYM+DFJBmiS0aAZJYNRxp+SUVYPBP0761phCPt86T6cOOASauzwtbkDgXAcd+V2d7ZXPJYefNcWVsOSIkdkoypLmiIDbaiKZGxKaX6o+cDHcfR45MR4guFyv9cIa4b/IAZJM8qQhKZoGqQCiwezht/UQCZDJ2skLYgwoqnN/pAaEahlkI6Bl5A76POGvYE44qH6g1+4fCtlgxKRDC6HmuZkFVTDuekRkzkgqSaT5A3Uf9ja2t7HSYJaYN6jWkK+BjKCGskMFggnCNQAz2SUZfghmd9AEzkMf9XHq/bxtIGWkAYd8oYM/kA4xgFifWodq21qAyQUDGujsz1FuaEQUHYkNG2immz1GyKKSTM51I31NZsRC8fY7VHNMN9G0hVWIEkysTWDgEgIJBiGCfQbCILg3OE/Bx3xD7CEVLXVH/aFDU2tsbqNSERNlnZoajiiaWEFKIt+IoBbqmwF7lJVvFYNkilcK/k2qmqsgj9KQiwbMmiE1gwa/qQXGikWBAObRr8lOCdIi0QEUeFPvMmmdVC1aGAlFFE1XwjhptTQ0kmLL4YjHFJNmlsjM6QYNUXF7GiyokFEWoSmlIwPJkwxhC2aP7Yue7gqRKJ7GlIUjS2eMGSsLjBt+J+MHdk00iQol4RmpF4x3kgM9xpTk4GVkKppMG+4q+omD0KQXkcUjqh1FatUd5UaDuNMiCAUigQRUvkNwVDIHwkGg5EIfkIRSfWaOr5orNnRa589NoBUsAZIe0iBoBw087p9g6CgTPgxkHjgl4SG0ZusT4N8DKyEYLLcgZBiMm6raq+qbe313sLhSHn9obUd+bt9xe1aQsgQMYQ0iA3+Rg3KhoBkALpTtUPh7E2e0o1thv01h3rt8zgSkk0MpoXtYtUhpECqA+NGb+I8+gRQQZAOAHhoz+BuUKU0sBIChQJDZzApNS3+nRXNvc5mKBJ5rWrE9/fc8r2y7zxc/c2VvpmdcjqmTjKqJsyUbGk2ZXzomXf/wdu+U/Ht75XfuqolV1N7V82jYQJjNfwvXI7wOuyBaO6ZUFAR9JDpY0iHN8gn6Tii15vo5wYDKyEaLGCYIncGtZ0He6e3OwORnW2y25hfEx73ftPin5Tf9MOqbzzR9PWXWq/8v46v/aL5mu9V3v7T6tvWBma2SsVuc+72DtnnC/RhSiALkgf9sAyIi2N4LWRHfwroTdCSuR+SonCCg3wMrIRwV0aTbDAislG2VLZ0enwnvr1ARPOHJaOmGhQVmtci5axxn/9s/RWPVl/9RPU1LzRduskzx2dIR8AvySGjFmkPKt54YuGuq5OuEFQjMZEmwb6RljCW05ECS4U+5TiJRUN/DrqIBlZCuL8Ek1E2KWazcc9Bz/pdNSeWENBeWFbhoFVe3opC4aKiJEimREVJNCsJmFQ4cSAsDSG/JoU1YJE+rGniC/jOST8YWAvYrSsVYWt+TSuMXjOUIyxHFu9fCsvhtky0FGXZqLi9kY/WHggGT0R6mhDE0wzw7LFr4H8Y4cI3wPywtSFTRMyLZjcbLETcxHugG1xDpw1YPCQhyjuwlRMGkFC4iF7hkEjJuuQa7+VOqv3A6hCgkSOB8FHYSA54xa6Wv6/bf4KMlMMkFzgQOOpJGZpI4QrEPfISBvLgVA7N3KhE2W4192UC2M8QpaPrCoU+ujDoOlBSMoO8RljPCPiRkPqwHPoyvG7nDKyEYODT7GbYOdWkYK7rvepT7+2uaxJ8Wg/mKcluuWCkCxwZcc3ksNkGCa6MgxHIBv3gVUSSnCbD+UUpijH+XBH3KDgetmDCzQgSSLwgn6TLjGMlkiXBbh1YnOSkx3X6wEoIN55utxhlKULOHYhB2V3r++DL/eBBe0RFWLWLxmRk2OUwiB3+r+sAuUCyEflOgxRRI5PTTRPy+phyFZaM7SfkgZUgXkQZU34h8DfzPbQ8kOvkZRVnIiUuafTUeKAlZMhJNBtNBinBEjLKCaDvFeOzn1YuW73vOP5Wy81w3TwhMdUUCRs0yjlAmDQ9gnNhEkbS/JLhnCzl3ulZLpulLzPA7AATCsyMkhqRp2GpkLoYDQhUkXkQOQjKsVJjWXJISprFBPTSl4v29ZwBl1BGktVqlIxmc8iMKJ6SYzVtkUeWlW3YWR0dc3dzR6v3+rMK7prkssqhoKqqPIWqAoBHVSQwbgFNO8MZuX927rjh6Xq4H+fNd5GkTMSRHkHL4W/QDXwguR/2PUYQCvTD3lCS7ZpxVnLSGXmZg+yMBlxCqYk2VwIoUEW2JSBSx39mWapq9D345s6d++tYk472vorJdN304Q+elTrFpZoMxPiEgxqyd0gNOQzhxdnGxxbml+QmHyEXmCD0dPgHfx7nh12gTimwBWP/z+JhI0cwL5p9gNLCrEGvHJplTnrqpILsQVYggkYDXOtDtTPXvbDpH7VBU2fAWN2AdDLMV1CWQ4o8Md9+zeyCJZNykxJFDc2R0tK0Qw3tqyvbdnWE3EFa5klmbZzLdM6ojCSnXnPT1O5e39Bc7fEKZEzzznFlV4AZ9WUkAgE4AA08wdAWr8cPs0USUlkwdCIFSfRDRo/MnU57SymSZVpyYmleRqvP/2HFwcYAKEK6L3Zf7MSoUIguRSuEpStQe4QNKfiqPIf9rMz0ZAz7qEqiGLR/wCWEMTzw9ubnd/rkcEQ61GgOhYgPkKWQUfIilDXJi0a77pxXMLkoEwRrTwMmVRD4m6HuYYWDeB7ftnelxw0DCMTNCQX6beIAlFwIZxA4ptFkTKKgD1gYiqIY4Wt4hpnDRnYd53JMwG0YzuHfsMOgLMhIG52b2dbR+cDGbX9saYDBhaOCzIkQRBdsGOHL9NFF0SBx55zMxW+nZFrscv1wYonTZo1BKEc0UR544IF4z4mnPa0wFJyurvYjyxMOBJRgxEgLToNHwSQEZWl3S+DzvU2tbm+SyeBMMJpNNEvdLiEAloC53bFd5L09Fe92dARkzYwcqcGiGsxh1eYLJ/hCRr9f8QaVjoDSGVB8IfwYwzBdshmCkdHeCPwP509UOQ0CgmGHFNUhCSUl7I1I5KMttqkjsnHy01t2/76u1g+fShE4J2NJjAzC8YL/E9S4ScHCo9dYIlAggA7cbHMgOMnhGJbkiGf2qO1g6NCOAw23vFNZg3wbTEtNsw05PUmDlQsajQGjgp+QLJuNyrAkZVKWdXahqyjLmZlod4IvosWp1wUAnkcMEvKBbn+o3Ruq6/C9VtW2K4jskaqFpUjQIIc1Ddly5AtxCn4TIYRCB3AR5JE4xJJMFsnhNKUkW1IdBpspnGiDqKBgQPIM2JjXoWnH/JPKqSma+fxhGbmZKavLDnxrx54yLZCgyaosw3yRA+c1QyCDUB+F0RRdEcuHZUDJdbzJppJ016JJ9wzLuWpckTAFsR+DISGfz3frq7s/rg3aFDlQ12xtcZsR0ACVmYwhRQopSgjWBeU2WOGKbDUZ7WbJbjNbbSaIDUIChapKCsSDvLgfybxQGNVdQRIyuXcJcA9GUKV8AaTCryn/htcGJCY0TSUSQlUiYFgxs5gd+thkMZlMWnaWqTDfkWIDVxsibK0QRcUqTBqHf6fZbWcXD69qaL113aY1YT+xqJoaImloRpYR2TZmU6mcASMl06pQbZCeZSdFhD6hQ5NBviMj87oJoxjbx3HE1zqOjrs1tVoTRqbZyVkjMnfaIhAGwQJa5MTgIOyhSeQ8DZhTzeAOy3Uetbwtsqc5tL0lvK1V3dKhbetUd7vVQx6tJSD7NdQrCNPP3p9tIM0pv4aUVES0ciSi4DfJA0taVRRYNHxKpQf4zB/xd0bKyzyr1jYfqEUVVgIUg1ADwzoOjmE8laLMNIj81fLK9UE/PkLPQfoFUE5ehyNeXZfQM2ghAVKYbyWIKCynuC8jMSICDcV3DIaEcC9j0s1OoDhZlRKt4YQEDDOkoAgBU8XWhON1EhjDAoJVmCAYCiQuiEvVErAG0Q6ipVwGS4ZngmN9nE6IWMAp6o49FiyWonIdnEpBDsmGZEq9E3UEuVH5gxToDH21pWHrPr83ZBXlc4JHwO80g8FlMTd1epe3tUHFcBXGbGzKiFwneADbS/YTSUqDgtgW8ZMZfohNHxYGVUNShxwC0yrqIbToVVyDIyHDzIKk4cnGELgBZH5SHCEJnp18jJEyQTDt8B8wSkypkJyIWaHpEKQpwBOZMp5a1pdogk2XhwBRRHtjaZPPgeTRA+sTbB3B+zBWvyKHzEoEJlOhd0LgjUJoh6qhkLxtR/M/1je1dFB5KSE8eHfNOMJhs1lMW5pby/w+6BebVEIQXLFAL2HnSG8oqgUyZDDJvkcASIgHoQUBB42gB173SHQNFQkNS0uckmWEG6cAPskRTrRj8jCNWJpYzCj2JC/CVo9+4X8WFfkSyImdCq15IS+OOURsSlajy++y96B2WAdc/hbRImZ7KDNHmjDeMeOs5DmzUufOTsPPnBmuqWfYxxdZclJlG9YIhiGZauoja7ahohSQAfMbschKHqI0zbCmvqHVoMJGcVKEqUG2qSwGkgT5HgHuBV7gWgaoESsNmTu8wG8mJuPDCEJ4g6RDuIUzc5NNKmIIIlDVFKfXSB4VikJyIlGRSMDy0CFcFMsGH9Ff0ARCAeSuhEi6m3NBeLO0yAxRsYcWMSZ05g43TipNPWOca/gwY5pLTrRrDlvY5dQyU82jCpzTSlMWzkw9d0ZS6Whrkl01K1p1befGPS2qIQESSjKbslNcLZ3eL1vaAWo4huUgiATEiVaqIiYg2JWhoGiMnCHx4sIJUZkxpwdZmUTAEPcxSBLCuCZkOXOdMuwLTX+SLZzs4FwpHeRFOSPHzogjVMYOgrmBsaeZ5xieBXPMfbIBYd0Ci44ZChcUKlMnJo4vNKXZg4oWYNGShSRPTo4LYwiFwz5k54elJ0wfn3TR3KwLZrnOGJVaVtmy94DbZLLhGRTgyC+r67cGfCQYTu0KK6czFwzYgNCgOly1yuUo5HvwDjPipD0K7Jte1qqRhsUtn0HTIYxsRKptdi5cvvC2ijE1CVwqyhHIeUOHyKCxVRPqE9UnuidWMtI2qnynF8AFwtYI9yNsHVlMiMikjixMKMkzJlpIkmTxyOvrdTxMKyCeIZ9lVMyKjJIIykQ5rWphtm3OmckXzBoZCoUUv1rgSEC3/2hqaTKEoRnEdhD8prWAiJtrUSk4JQBC4tGTe6LMmBWI6ljNrD1cwk+DGNJWDjdoslgWjUxymeCcJYT4qs3iS3YCAVsiiCsJb8HBG/AjKC9Be7F4dAaU/JDuitjIsGS68ButcXweHJ6rFGYiyUEhK5ECuhDFawHyeJZ1cMyKS7JnNVPV/HSltDhxmN2Sn5ES8oc2+z0ANJAHSpMZ3+mQBC/4EQm92kSMhZVJVBqzVrEyUdDK2iO4viGtQxjclIK0mZlIuJIaIUAxZaYGMlwwIqjEJkTHZkzSML9cICIwHVAcYzz8liKCMKD7ZGTH8QicAU9KRA3lZkmFWTIkDbkoBpB/XGjAC1y81itG9DpFITYkfphW1UhsEBKIs5FOu9li3lBdt9fvBXrmLKvI9gkWjgTAvJEwbqTGbNOIlu1CcYQRGOxBq9CMsVwfwqHBQgpi7STarZePddkVNYDlh8lOMEk5qRGnjbyEyuGRgAW6iSPggDfYxLFzEkiBcuHCoXCnDGJDUtjuDBblyBaKhoHHVEVOoDkUVfNCPLpWkS8RBeBi4rkPSuDhLLyXo5hGZiRHwpEXK6raQPZB9phoMs1cYs/2SsSh9FAL03PokGpg2BhaZMlsQFQkUeQGEZLRo2CI8ut9wtuDhxSEkKYNT85zAdPxDOM5BqNRzkgJI9QjqEaTQE6Gn6BiqKDHsfRaqBFHnITBOebUS000Q0KCNKHQ7sDE0DTCbHL2QFg2LotndSPGDFQmeWzi4gS+Yq/O0Qx0xWqQx2Qmm0zGypb2T714IBKLQRA7XDZMOE13QkJI9K4gsAncsbejOjFm2Um5RRJdVL6wssWPFQZbQolOx8wsi7ArHKKqhiS7NiydiDDm1ihMJYcEBUJMKdg2imfpbZJKhAMj4V64JocEoqYnGdIswGzEmKPIjnM8YTZiTGVGf3M+gs4jPloUhkB7EJ8CAhrwzIU83m7PcyW2ub1P79xXLYWgHhCRnpLgpANak06w1xEPG0FLKPgi4encAQwaFxuT+kL27IdIVKSr8XuiwZUQe//LSlyFiAUx57IhBAuNGc1IimSnYlVbIqqJCr2J7tQDIzZ57McF3UCqw7Qo0zxs2BMsSn4qWRUSjx5XUl4O80imjPGEiEvESufXLB/d0BGTZzEYx9ntk/LT4Qef2L73T60tNtIrgvFsn6g9PdBKIqHZx+qg7JwuKtIb2EM8BguBEQvHbkkHDswsEGYhkijuY3AlxHNakp2yMM8MeA1fQZPKFI8xI1nNcCG7ZwSDraM5HdWx5yGhUBwDVoKcEzELEBLRcaqU7FRSbRAi+RJa1bpxY13RZUOOmot7qRHFNCxbRsx0FadqgfacmZtuNBrf3FPxbEO9D4/lcSyqOyow71xfye9R0EpkD5c5ije5okGk7EhalBkS9lCviUT0KiWaIMS4JzzuE+JeA8ecgAq3RUVpSVhviEUo3SJQl5yQmSpnp2ADCsAy1hiBD6LQm3kX4Z6Ec+cQlVi4ZKtXoVQELXY2nywAYc0EJhcUODNrUYghwk8F9OAIs3N2RvLUAqBA5W97Kh+tOtAmAdFxhMpnkJ2MPn7MGqwzoGy2mMcirC8EKopS9PCLzua1ADmlm0xFqa4+WLnByA8dK9RAIPDD5eVvHIxgkjiApIoerMcQNKXFHaprpmIOJPD4MCJniQIoo6JRGgnEp4KMEUr16c5VcN7+hcVythXzHzDIqBGm7gRDg2XLVYnk3tnciSw4HQn0YL6aaTIWpiZlJDoSLCYkuZ/dUf50Y32jAekRWrjs34VO6MAaf7oMigtJVGaWmBVlYTD+Bi4nIK4XoghwT7QQ4EuW0Tw3O600N5Pz8vEdp0ZCGOOasrpbVzS0himNzOkDGjrxCrin+tZQcwf+1cxmEzLXiP8hG5ORJQRSlF6HKDoBSNDOsAYfmpGSZMVcdeGkHkwJrXx9Zkg3rGZTssNqtYE4kCKh0JoDtc9XVX/Q1hYAUQMRR1l0JkP18mD4HuRJL3ckXZqHih9aVQwsWVt1ZdMv0XUtsqCkVXKa0+ZKjDv/LcZ7yiTk8QXu+tv+j+qgQgBMAGEycBgymBFOIWN3i0CrG8NDmtpo5ppcTApKTSAeeqFAsoTbItpV2dqji4shw/hWJsHDSIc/sLeh+e2q2rfaW5rgDrtIN7aGUA4uWOAsCYNys2q4Kyvn5jNKdEYjvkv2sXXcStfH6xx9moaK+FvHuUodagDZG3LYRDQwr0ZPp8jJTmtWislmIVBHJAPFQIToaJcsKkMQvAK0aGQKHlmJ7y7cXt/j67bevmbjJavWXLF16+9bG2qBN7gIRIAtNlBcSs9xLgqJ8Bo8Hz0igAszNRX/EX8opA8m/kv1xxnkZacXZl4+MtGKp4qRfiWjoUYk5NokE57OxywkmM3JDpPDSvCAsANKSYhYFblYSlgwU5dqAwCOT0KeQPitmtrnG+rWBrxthO6oKId8CXt4DIx5HdpEJgoFRcxL5k+nIPoyBfGHQqdUQuLi8pJi17RkbJhA803ZFJUqEPS8AwIiwFmH1WTF/jtEXDPsproGpu+AAVWkuO3m+KuoOQ5KkI1WyQi/I3hqoDEkYmHcmIpmcMG0BCXiKAbiyhJy9H3hBfoi0Og58a2+k7lSj+dmpSbeNC4lBYAOZTmYDlIOKgOBNUN1FT/wq0kWk2JBWQeGKug5ooIER4fpQ0FVH0bF2SIKLRlwcM8c/DCBRtGl2LFEkDeC1CF0KaA6J8QH7TjFEsIUnVuUckkecmkRbD2C+ikyaMRno4SAdh/huiqqKaGAnigbdgO6hKB4faJ+RTUPKwfHuFy7Am6GUztM2BA6QMzKXLXYUCZaQDpokhkaOkSLETz/HZMzRiWoKgWdgkeg3wQFmOqmv0lmjGUZLBAAZRaVd9SI328LmMwuh5E1ZQ2YGSLOm2Ma/VEvikBF6Q+JkATGkdWgHqdWh/S7zU1Puq00JR16BIfEWiLQG5HZVLFFpTssLebqsOOPPyj5Q3gMDLtftPvj30GV5SNyAYLbppQo57OFDnG2guMw4ZOoIowCUjNRiYN9DP4Ve7xD6bKJmd8cbTVFAijA1yNAznpSHVbUpkFCgudWg+GIxxdp71TdvhY3qo3jVCMWEAuJk3hE3upEN2uPMG6C+iQgQWkeKocDN6ozQYMppSEiIaxe4w2Tc64emYBNfLA1DAU9R+bu4J9IgaKVQFC3kD/gb/dW1rmRbYtryqIaxClRZuei9k1ktXXxcKwqiBz+zYm4wUZyg1lJ0uskJic57pw54qxMBWhBI9TAto4Ew3pDfxKSQN5IlJtAn0Kh8M66zg5v3IYO5g08M9ABRMRKwxqjm70o4NbrdajUzcxJIH2LwF7vpF8bDBUdEjeVk+r49XkFE5MUevBOL5vTM0VcrMAiA10TFvlxcvZ7WwL76zvimhPKk4sSeK4gJTwXTTXgDaQXo0wP5XvAewoIzpibjOOgYu0hpUNilvMzXffOyhxll8KAAZTJI43RyxohF+gWJYlEio8sYYtX3deIzeviODDLqNRlAXOSVS/ZIT6dE4B68QmHsqLen/Z6PlxrEMel+qHp0NIhcUNzxuXcNzc336phMzPxgEm0CJVxOENuUW6CV4GQur68JYJHx+M5BMFDP/QggyitEjQ211IhBmByQfxQYEQPU3L2fdCPoSghuINFE7KfuLhwQR4qIGk/TRQs6DCBqhdEeESBLeVpJWnlnrYtZfXRqYvJCFFuBxUEuoOJAjadStBBAe3pHM1n095perXpYAtpaEqIGDA82frwRUVLCiz0UBXJh4IlopXpH9g5Lv1BBk9TD7SHl20Rj5Xj6H0GmZbjohxOONBO21y4xcibEAGgAZXGMx3HRfH8PBCXjvTee38r2RCVkLjN7DTX/1w09vpSlw20Jh6CpBiWCxS6VTJwcYj29x2NG3dWxTg5kCQJA+GnsGlUI081C2JTdK4+FBWKxJ1zlZZIpOoPt8Z4lf5qNqQlhJtMT3Hef+HYZy8vmpdrNgFd82NGFMMS+8DbcFOZjlbRGPyPv2zZuq82lnkxYz8oRYGnYTEwac0ioapEoHASkoxsEGsS5IfkoEKVi5qKT22M/mK5Sn+1UQb4WfB+GKfJaCzMTJpT6MpKiLS6/XVuQnmiBscciRgpYYGIVarriLS3tk8rTnFQbvtEB5xKfXvnFl8nFbNxmQ7V9wJYI1EUZU5FEY/gTEWEC7+VJJvnZaZmuJz9cFcxdzHoEoom8RHx7C6r3Lf/YENTs8NutVhOsAkZneO0J0wtypg13IltSepbPHgiXAupUhhEGTKjILkjmOiqOo+nw3NmcWpCwom2NEMglGsxNbR6qsl0EjSEDPSKeA019AhgqXKCdEt4NmbB7QbzdKdzTuFgb0tyCuoUfP7AsuWfvfjq+xUHqgMhPLyopKYmnT9v5k3XLB2WndHr2kJKdvfBpg37W/ZUu/c3ePfXdbZ4sIOtasSjSRFUMKizRyddeU7h7EkjLLyT0PGOxnb3hqa2pgC2SaVIiJ6AoGeydPpaFKqITBDlJlB1mWAdlepMGvSvIBpsCTU2tz7wyB9eW/Z32K5RI/MLC/Lw9Q2bd+xta3ePKR7xs/vvnDtjcq9CijZQOzq85bWt++s8dc2eduwbHcbWW/gqJ/PwDNu8qUX23sxdzBc63JCTFYPqh7rVDB6uHhyoVz6//+Z7HkoZdc78S29dvuILd6cHxJrP59+yY88d9/48c9yCSedevXXXvj5dnugGooPwBEvXQ2J96mionTSoEvrz6x+kj5k/75JbyisPHjUReGjxgUeeSiuZf+N3HvAHsEPZ6UOfgcFD23A/r737MTIx9337xsLhuUcykChTVL57+3WTJ47524o1ZRUH+2B/jnfK1p37Vq/bjBXQj30OZleDIyFyuGWVB/ftrzqzdMz0M8cLiNTtPum10267YP5MfzC4dsO2fpyCX//hz/f+5LGWPn9ZUT8OpU9dDY6ESACNTa2NTS0jhw9LOn597KQJowF/q6pjCjxjvF9KrfPOJzG2H2rN+lLK1OM91DU0bdq+B1qCnTww0WNGFSYcGeL4/QEYOjz+cYIpoMengJkxpRH1jy+/M6m0ZHLpGI/Xt3n7nm07yzw+X0nRiCULZ3f1QBm8vRUbt+5s7+jMz82Cghbk5RzVP4IZlH+/89Fnn65aB10Oh8PFhfn//f1buw/P6/Pv3LN/++4yGEN8WjqmOCU56XjjPFRdv2XXvuaWNmuCBbc5siAXL47EeDpDiOHtKa/cumNfm7sTS7N07KjsTOxFE9/RDxLCOF545d0/vPRmWcUhbGMBGgZI+oL5s3545/UlxSO6hhN9yuRE49tTVoGbS05ytrs7f/KrZ26+dml7h/sPf3pj5RdfgTrFd9ssWXB2l4TKKw/96vcvYuoDwSA9hhRRszJSr718ye3XX5aUdETYj087vd6GphYw1NiS3ZXoFGV34oD4f/H48yu+WA8kSAVxmlo6btQdN1x+2YULjhorsiH/9+IbT/3p9Zq6RjyOATrXbDafM3Pyd++4bvKEksN3yrnaiqrqR373wrKPPvNjT0fsEaBqBbk5//6NS2646iKsmNildLLxENTiwf/9w3N/eadw+LCF58woGTkcGPrztZs/W7NhWE7WEz/74dRJ48Ro3nz/k+vv/O+br73k1z/5Xo/jw9xdfet9q9dtefWZX44bXTjn4pvNJpPb4wHvfN78GVMmjsnNziwemZ8/jL7XdduuMgB0CGn2tDPmnz0tJzNt/4Hq9z9etXHbrgsXnP2bn/7AFRXS9Xf9F6DHX576GQRDdXIovlNkh90uxvD52o33/OejdY3N82dPnTZpPMgIrLMPP1nV3NJ+501Xfv+Ob9BjF3xgov/rl0/+6eV3S0YVXnHhgnElI7GMPvr0iw8+XoWef/vwvXPOOrPrvnbtq7j9Bz/bW141Y+qEmVMnQnUw1A8/Xl1WeejqS897+P67rAm9UFOHp6ivqFbfmOL/XnwTAPqKW+6tPFjd1RVM/3MvvzOsdNHCy2/HzYv3//Ta+44Rs+6+/3+Pd8UXX3s/Z8KixVff5fF66xtbxp99edbYBRPnXfXxZ2uPOgUu7d++/p2c0kVPv/QW5Nr1aVNL613/8YvU0fMQFGMM4v1v3PmfM5fcUFvfdOx1a+oaZiy+vnDKhX9966Pun+7cu3/JNd/OGrfgtWUfd73/zJ/fzhgz/8a7H4QCdW/84Serx8y6dO7SmxGMi/db2jqWXn8P7uV3f3wV+2d0NT5YXXfNrT9KLp7z22f+Gvu0n1Q81NzaNu2862YuvqG6tv7YS/7i8T+mjj7nDy+8IT564fgSghd54dX3iqdfPHLaRZ9+vg6Na+sax87+Wu7E8196/YNje/7jy8sQOT306NNHfkSLBl1dfN3d6Ap6011CR02riGp/9tizCJ+fev71Yy+x/8ChkpmXLLr8DkTZNOngZBddO+fim/Ciq3F09xTt+ZeXZYw594lnXxEf/fXt5ej2Rz/97bHdNjW3zlt6y5SFX688WBOjkE7KD23bua/iYM2Pvv3NnCzi0w7VNjz53Csh7DjLXCP+hIlYtW7zDVdeKCwvEVyKXN/U/Nc3l+O70xKddrgQrO7tu8o3bN6RkGD56Y++NW/2VLREzS7SqgibLlky72hnEIl88vm6tFTXdZctPvIjQmvo88avL73p7gfXfbUdPvz45l7q9HhXf7llVGH+0gvmimavvL38y43b8NAfXsO54h4qq6q3bN87ffKE9Zt34nYe+MGtya7Erj670OHZM87MyUpf+cWGG6++CNsdLl+xBt8gDn8jWsIMYsD0GCE9S4CNCSP7Kw9t2rZ7eG728Yd3+JOTkhCYaeRnzpo8QfTX2t4Bu4w750cE6Mne1OQklFMBIAkJUepMkcsrDj30q6fFbhNYhnC/4LZnTpt42/WXLZx7VtfQAOcmTyyxHWOvUR0H3DgiL6cg/2jYJs6dOHYU4uJdZRUnvn8YpdqGxknjSzLSU2lsmrZp25633l+ZlOQA0sHSgXtPTE7E05P4FBqJr68YP6aoxz5B+MI7gghubu0AsIP+FRXk50ZZ4O27y9/+YAX2aBDnAs1mpKc0NbfFIh5qH2O7Hpv5AgFMMbAmf6qVjCx49ZlfoPqja3Hhtu12q8162CsCL02aUPLwj79dXdcAPUvE9rnZGcWFeUUj8pwO3XuLa+HcLm9/xNWRWDMao42jyYzuLfhx416/jUo8fwwtF6XY+PXd26+9/qoLLfiuJGy9Gg5DjbCwMtNS8CmIKCSI8GRtj/MAEj0nO31fRRW+ThENgCodiVZ+zJwOINKLzptDBa7dntTMSI8Vdvc5YiW0mp1J+/rvLT/AI5GwTIpG5JcUFYyO/gBt5+Vk6dXonIaB7YJEb7nuElgMBCX33Pb1Ky5eCJkdJR6esp5nGeKBfThwsCZEX2XUQxxaXdsANwOzc+LFl+R0InauqcM2meKbxaSMtBTw6wClCK1gIUuKC/AaKwyfQU6ImaqqRb1KD8UqGBWbdjqgTwAFwH5iACmuJMwD5qTbzIxARHHi4XV92mcJ0WBAo8Huv/3hih6/WxjG94KrvgUIIC6GllCLGId1gmYwodPOHH+oruGjlWuObYZLYDwoOjhrsuCWjntgjsYWF27evnvrjr3HNkJ0/P0Hfn3jdx7scJOVm3rGOIwf0C4U7nlZwMJ3fV/4jCmlVdV1IBiPFSf08uePPXvpN78H7jjGqeizhHix5GRdfP45n36+/rk/v33U9RCv3f/z3yG2mDhulPgIpgO/+4V7WTh3ek5m+sOP/3Gfrr6HL/7m+5++/NbyuTPPBL9w4inAir9i6ULY5Icfe64Wz+h3OxCK/urJFxGZwnZhmxt8Mqpo+HnnzPj7Z2tfeu3DHrvF0rPgSTR+onbRvJnwNI88+eKO3fgenyPu+KU3PnjkyZeSkxIFtorlOKksOEwcsnBrNmwDaQ3kneJKBEJDsPLZFxsgHsRr9951w4Xn6UgJhNDr736MiTt//sxeRwYvAkgNm9MdO3SdhVlzOGxIA378+TrYTPA3CJyxbBE4//yx59LTUx594Lu5OZmiPVQKAcoVFy8Cvjrqunk5mZ2d3rc+WPnF+q12G3b6NuJP+PlHnnjhuZeXIRb+yX23O+z6WaOLC9Zt3PbGe5+0t7vRFW4TXkoEnh2dHnBUiYmOr1+2BIPBPMBov/Phik9WrUMWEe+AuKqoqgEcRySUl5356EPfBf3R6yToDWJE5Sdotn1X2UXfuBvR3LDS8yYvuKZk1tcQBo06a+nvnn0lGk5S5LDso5WmnKl33veLWK5YXdeYN2nxd//r0Z4aU2/wZxDhuLMvQ+SBgHH6+deNmLIkrWTe3KW3rFm/pftZV9/2oymLrmXn1MPR6fFAqAVT/i1t9Lwxs782+dyrEWhnjjv32jt+LEIWLu/nfzVt1779l1x/D+40vWQefv/yiT+JHt9d/o/s0kX/+fCTopxcHAiSxs+5LG30OaNnXjJ54TV5Z5yfOnr+eVd+a8PmnbHMQFebk9IhIWQ42KUXzIMnZBAk5+dkXrrkXKy+8+fPElovNB15bpSOzJo+sQudn2ARYUY2bd0zY2opQMQxzQT0ks4YP3rROdMRGNGTwEYFvOSdN111/903FhXmdz8FQBmrePGC2QmWHr5OCsTS7OmToKmuJAcu6nDYZ0wuBaN4979fI8jTKClOF01LSV66eH7puGJSOJP5nFlTwP1s27Xvhw/+BojwJ/d9Kz01uevSGN7ic2ejE4BAu9WKG/nWN6/48d03HS9ION5snCwvd1S/UJrj0IJUCA8iSxilXvwRw1JgJ0Bh/gKw3u0BGnfH9N1PAALGDxj3XnuBBgBkA20ft6WmNbe2e3z09QJgmHCzYBEBhVCu9PMf3/WNKy883okYAJZCrwPosUF/Sainitzu+L/vGKGniCd6K/xZ9wYnaty3Cep+FpDYN7/zADAqppvZgTCQOrA1WJUrl553nP5Pdnj9JaGTv/1/gh6gZE889wr4JMpySQYwQKVjiubOnIKwaeBGf1pCAze3/dPzyUoIhhsQAPDSZFICgRBoN6AFpFM3bNnpSkoEpeD2eOF4gD4RY3d0dsImAYx2ZVrF6Yj1kpMTu1tqkHuw3YgbcBYQMDKY6diczSA1tbShKzgm8BcIk4EX4IFCwXBKciKgP3pD9T0cIc7CRf3+IPI9WPhNLe2oRIQDBCjHp/T1alHnBura3elFn3CQaNna1pGaAoCguz6wnC2tHeiZqZAESqirqkAQSCfC0GGvvI4ON6yfy+XEV/HA4wHMITDy+gIYACUMQ7QHPDZgCwbDeKeltQ1ghO80VoN8UlgOkkDW5PO1mzAUpJ/feO/jbbvKwXC8/NZHC+ae9dXmnTv27n/93U83btkFUAcg9/Ibyw9UVYMZElQKji+/2o70BLJbIFq6WDikmp56/o1tu8vR54rVG5D6O1hTn5mR9vyr78LCIOu6e98BNN6yYy9S0W+9vwKkMjAIEtJvvvcp6PYxo0b8+qmXgDDXbd6BCf3zGx+s27jd7fYg+/e7517FLA/PPUy5vr7sY2BlBDoIsN5b/vmnq9eXVxycMLYY3CuGB0Lhxdc/eOu9Ffv2H2jv8Hz06eqVa77CzY7Iz3n6xbewtrKz0h5/5q8rVuFrPdpKxxYjWAYHBoL1hVffRUCGWOqrrTsBJkEvgfAGj7Bs+T/Wb9qBEdqssX7d2klxCkJj0lJcVqtlT9kBhK7LV67BzTQ0tuAO65ta6uqbZkwef8NVF67buKPyQI27szMrK90Z/Z5BTAHi3Jbm1iyg1G48FR7ONltMmekp0BLwZgj3hudmbdy6OyXJiUTAoZqGQ7X1mOi2NjcWOHhu5AVAkOPFqi83/e2zNYjPoGGvv/sJ6rBWrNqQnppyz23XLpo3Y+XqDbv3Vb727iegQbsMEILZS/9t/gXnznr6xTeRKUdStbq2EUMVDRKdzhuvvjgzMwUZ8fElhVgouDpUCtUHSOa+9cGn1TUNVYdqMADoK1JQazZs/eCTVcin4DXvDGHwev1vvr8CmUaMbW/ZgbtuvgrLbtXazbFbwJPSIWh3TW0DkloYWUeHB3EyyCus645OLxgEWAwsZLxAQghOFV+jgDt02u2YbkGl4MCC3b6nHHXbIGEhJfFmW4e7pa0d2gDZwK6AqLfbbelpyes373C7vSAlwalAw8D2jxo5HG1GDs/FxiZ1Dc1IEKCX8qrqgtyssaMLX3nnbwvmTNu4dQ9o6vID1RgJ2qNzh82K3ICuxBu3QSTgEaAWSAcjAXiwuv7cs6fZuKIYVhQl/xu27ppCHJJW39BckJdtt9mQdsHNIhhoaGq1mMxnThwDVUE6NSnRifVahzxdeycgeCs2Hfb5kBkCgdnS6oYhQQ8Ie6dNGtcrsdslwpPyQwhxNm3fDVJr/OiRsLyYFKz6HbvLwOZ+tXXXhDHFiFFQTYipR/oHUT0WNbJC0yaNhTzECJCH/nLTDjiGCTCOUUSEtQxeAA+GTJ8yHmfBpmHZzpp2BpbCtt1lo0bkF+QP+3ztV6nJLgSMWLD4c/2mbQhIRXj7xfotWekpw/NzoHbjS0YiHfX0S29feN7ZWLzIccA0QQXHl+iZnh17ynftqcgblol6CsgJuRwUKnU3gxAMkuI4F2sFUz4sK/OL9ZuRUgIjBbcHggAOCapcMmoEzAnqhDCAjVt3gREAzYOlUDQyH891ZKQnV1bVYh4wG7nDMieNHx179HFSEopdVU9tSxSZwGaCCDi1w+jb1f+/kFDfpmaInHVSSGGI3MO/9jBOS2ioy/e0hP6ZJNQPKeqhfrv/LOPrJopTjBSwlUW/FC8cNfO8Q0Y/SwNEECgd0D793C+K/dEtb5GHIYMzT7VZiJeN7glwWEKPb9jhC4a7MlZd48BpiI6D/P1ZsR+xzDtqpgJ48j6ezabEV0T1egRpA7QY2kU7iqVTSAjdYlcuimR7HQE3iPFr1YL0dCeNFuLPT3LcN2NiSrf6tcMS+v4nazuD9M3MR02BzvDFvPkd2iPhiG8B5Eepe5mmuB7rwdgs2CoxhumJockRc5xAXz8eyxHLxaP9SAYbfWVFL9udRaeXzoL002yWi4qHO7o9HHFYQh0oP9PXXWyjPc4dsYTw3Rn9j0Fo274B6DYWyZzCNqfYD53COx/8S8Pyo/grtuvy7visX4cl9MIn67yBUKcvQNuD9X5QASltsByDucfI3L4AtuQ5MmN9/GvQU1Zk/3o1km6vv3sR8olGzTdM3rE3A4Gb78RE0HeQxnDwBPQ6TupIM6BP/pLMXg++Ms+v/qXC4oyzv/+bFrePH/iMZWx0JZgyW08FNEcNgV0bT04MHaMdKEg7b/ty4uY8M7ENln0BvCO67a3PrsvGMJM8QDhoh7WXbsWExDq1ojFGixwglXtHhVrT3C7wz/Hu4dikIGZcVJL270HfOEf+5hjQ0vNlYh0vj1ZspNTLccL05zEfktPth0mgTWr0cek6JL6o6rQf6k1cPXx+jJBiMV29XQdltkhnCK0UbUWvhyX0P48+7/H4TqCJSGt2ur0xGVJ9NLEERWT+kGBGiClsRm83Ih4a7LUVNUOBA578jsm28nz07lDY5OBBXaR0YxlqdKJjGC6CIX6sU1i47rd3WEKzz78VmSj9i0R6n4HeW+CpGiT/e2/XbdX03lgzIJHqcFrZJPRbsIWOYK6TXI5YgE/viyh6G/C8yKsmOuwwrr1L6Tj9nrZyva+KU9ui/+PKU3s//3pXPy2hoS7T0xI6LaGhPgNDfXz/DzNGHaftDBOCAAAAAElFTkSuQmCC";
      }

      function getLtcatCoverCompanyNames(company = "", unit = "") {
        const normalizeCoverValue = value => {
          const text = String(value || "").trim();
          return text === "-" ? "" : text;
        };
        const companyText = normalizeCoverValue(company);
        const unitText = normalizeCoverValue(unit);
        if (unitText && normalizeText(unitText) !== normalizeText(companyText)) {
          return { company: companyText || unitText, unit: unitText };
        }
        const split = companyText.split(/\s+-\s+/).map(part => part.trim()).filter(Boolean);
        if (split.length > 1) return { company: split[0], unit: split.slice(1).join(" - ") };
        return { company: companyText || unitText || "Empresa", unit: "" };
      }

      function formatLtcatCoverDate(city, month, year) {
        const cleanCity = city && city !== "-" ? city : "Curitiba";
        const cleanMonth = String(month || new Date().toLocaleString("pt-BR", { month: "long" })).trim();
        const monthLabel = cleanMonth ? cleanMonth.charAt(0).toUpperCase() + cleanMonth.slice(1).toLowerCase() : "";
        return `${cleanCity}, ${monthLabel} de ${year || new Date().getFullYear()}`;
      }

      function buildLtcatWordHtml(project, options = {}) {
        const data = normalizeLtcatExtractedData(project.extractedData || {});
        const fields = normalizeLtcatManualFields(project.manualFields || {});
        const company = fields.finalCompanyName || project.companyName || data.companyName || "-";
        const unit = fields.unitName || project.unitName || data.unitName || "-";
        const city = fields.city || data.city || "-";
        const year = fields.emissionYear || new Date().getFullYear();
        const month = fields.emissionMonth || new Date().toLocaleString("pt-BR", { month: "long" });
        const companyLogo = project.sourceFiles?.companyLogo?.dataUrl && /^data:image\/(png|jpe?g)/i.test(project.sourceFiles.companyLogo.dataUrl)
          ? `<img class="ltcat-company-logo" src="${escapeAttr(project.sourceFiles.companyLogo.dataUrl)}" alt="Logo da empresa">`
          : '<div class="ltcat-company-logo-placeholder">&nbsp;</div>';
        const eprotegeLogo = getLtcatEprotegeLogoDataUrl()
          ? `<img class="ltcat-eprotege-logo" src="${escapeAttr(getLtcatEprotegeLogoDataUrl())}" alt="eProtege">`
          : "";
        const revisions = (fields.revisionHistory || []).filter(row => row.revision || row.date || row.description);
        const sectorBlocks = data.riskSectorBlocks || [];
        const coverNames = getLtcatCoverCompanyNames(company, unit);
        const elaboratedBy = fields.elaboratedBy || "Beatriz de S. Fraresso Pintor";
        const responsibleRole = fields.responsibleRole || "Eng. de Segurança do Trabalho";
        const coverDate = formatLtcatCoverDate(city, month, year);
        const companyLabel = [company, unit].filter(Boolean).filter((value, index, array) => index === 0 || normalizeText(value) !== normalizeText(array[0])).join(" - ") || company || unit || "Empresa";
        const modelText = buildLtcatModelText(companyLabel, fields);
        const body = `
          <div class="ltcat-document">
            <section class="ltcat-cover">
              <div class="ltcat-cover-topbar"><span></span></div>
              <div class="ltcat-cover-title-block">
                <h1>LTCAT</h1>
                <h2>LAUDO TÉCNICO DAS CONDIÇÕES AMBIENTAIS<br>DO TRABALHO</h2>
                <p>Decreto n 3.048/99</p>
              </div>
              <div class="ltcat-cover-company">
                ${companyLogo}
                <h3>${wordPlainHtml(coverNames.company)}</h3>
                ${coverNames.unit ? `<p>${wordPlainHtml(coverNames.unit)}</p>` : ""}
              </div>
              <div class="ltcat-cover-elaborated">
                <p class="ltcat-elaborated-label">ELABORADO PELA:</p>
                ${eprotegeLogo}
                <p class="ltcat-elaborated-name">${wordPlainHtml(elaboratedBy)}</p>
                <p class="ltcat-elaborated-role">${wordPlainHtml(responsibleRole)}</p>
                <p class="ltcat-elaborated-date">${wordPlainHtml(coverDate)}</p>
              </div>
              <div class="ltcat-cover-footer">
                <strong>ePROTEGE Medicina e Segurança do Trabalho</strong><br>
                Rua Professor Fernando Moreira, 357<br>
                Centro - Curitiba / PR<br>
                Telefone: (41) 3278-1663<br>
                <strong>www.protege.med.br</strong>
              </div>
            </section>

            ${ltcatWordSection("Histórico de revisões", ltcatWordTable(["Revisão", "Data", "Descrição da revisão"], revisions.length ? revisions.map(row => [row.revision || "-", row.date || "-", row.description || "-"]) : [["00", fields.currentRevisionDate || data.issueDate || "-", fields.revisionDescription || "Emissão inicial do LTCAT."]]))}
            ${ltcatWordSection("Sumário", ltcatWordTable(["Item", "Seção"], [
              ["1", "Identificação da empresa"],
              ["2", "Apresentação"],
              ["3", "Objetivo"],
              ["4", "Período de Vigência"],
              ["5", "Metodologia"],
              ["6", "Matriz de Risco"],
              ["7", "Enquadramento de Aposentadoria Especial"],
              ["8", "Conclusão Geral"],
              ["9", "Termo de Encerramento"],
              ["10", "Referências Bibliográficas"],
              ["11", "Anexos"]
            ]))}
            ${ltcatWordSection("Identificação da empresa", ltcatWordTable(["Campo", "Informação"], [
              ["Empresa", company],
              ["Unidade", unit],
              ["CNPJ", data.cnpj || "-"],
              ["Endereço", data.address || "-"],
              ["CEP", data.cep || "-"],
              ["Cidade/UF", [city, data.state].filter(Boolean).join(" / ") || "-"],
              ["CNAE", data.cnae || "-"],
              ["Grau de risco", data.riskDegree || "-"]
            ]))}
            ${ltcatWordSection("Hierarquia", ltcatWordTable(["Setores identificados", "Cargos identificados"], [[(data.hierarchy?.sectors || []).join("\n") || "-", (data.hierarchy?.roles || []).join("\n") || "-"]]))}
            ${ltcatWordSection("Apresentação", ltcatParagraph(modelText.presentation))}
            ${ltcatWordSection("Objetivo", ltcatParagraph(modelText.objective))}
            ${ltcatWordSection("Período de vigência", ltcatParagraph(modelText.validity))}
            ${ltcatWordSection("Metodologia", ltcatParagraph(modelText.methodology))}
            ${ltcatWordSection("Matriz de risco", ltcatParagraph(modelText.riskMatrix))}
            ${ltcatWordSection("Enquadramento de aposentadoria especial", ltcatParagraph(modelText.specialRetirement))}
            ${ltcatWordSection("Enquadramento Previdenciário", ltcatParagraph("Os setores da empresa foram avaliados de forma qualitativa e com medições quantitativas conforme foram notadas demandas, sendo consideradas as exposições de riscos no ambiente de trabalho por funções. A documentação técnica abaixo foi extraída do relatório LTCAT gerado pelo SOC e preservada para revisão e assinatura no Word."))}
            ${sectorBlocks.length ? renderLtcatRawRiskSectorBlocks(sectorBlocks) : ltcatWordSection("Blocos de riscos por setor", ltcatParagraph("Nenhum bloco iniciado por SETOR foi extraído automaticamente. Retorne à revisão e use o botão Extrair riscos do SOC."))}
            ${ltcatWordSection("Conclusão geral", ltcatParagraph(fields.generalConclusion || modelText.generalConclusion))}
            ${fields.generalNotes ? ltcatWordSection("Observações gerais", ltcatParagraph(fields.generalNotes)) : ""}
            ${ltcatWordSection("Termo de encerramento", ltcatParagraph(modelText.closingTerm))}
            ${ltcatWordSection("Referências bibliográficas", ltcatParagraph(modelText.references))}
            ${ltcatWordSection("Anexos", ltcatParagraph("Inserir anexos técnicos, certificados, medições, evidências fotográficas e demais documentos de apoio, quando aplicável."))}
            <div class="ltcat-footer">SATS - Automação de Documentos | LTCAT Beta</div>
          </div>`;

        const styles = `
          <style>
            @page WordSection1 { size: 21cm 29.7cm; margin: 1.2cm 1.25cm; }
            div.WordSection1 { page: WordSection1; }
            body { font-family: "Times New Roman", Times, serif; color: #000000; font-size: 11pt; line-height: 1.45; }
            .ltcat-document { max-width: none; margin: 0 auto; background: #ffffff; color: #000000; }
            .ltcat-cover { position: relative; height: 25.7cm; min-height: 25.7cm; page-break-after: always; break-after: page; overflow: hidden; }
            .ltcat-cover-topbar { position: relative; height: 0.92cm; background: #1f3b61; margin: 0 0 1.35cm; }
            .ltcat-cover-topbar span { position: absolute; right: 0; bottom: -0.18cm; display: block; width: 6.1cm; height: 0.38cm; background: #9db3d8; }
            .ltcat-cover-title-block { text-align: center; color: #000000; }
            .ltcat-cover-title-block h1 { margin: 0 0 0.16cm; font-family: "Century Gothic", Arial, sans-serif; font-size: 32pt; font-weight: 700; text-decoration: underline; letter-spacing: 0; }
            .ltcat-cover-title-block h2 { margin: 0; font-family: "Century Gothic", Arial, sans-serif; font-size: 24pt; font-weight: 700; line-height: 1.18; text-decoration: underline; letter-spacing: 0; }
            .ltcat-cover-title-block p { margin: 0.18cm 0 0; font-family: "Times New Roman", Times, serif; font-size: 10pt; font-weight: 700; }
            .ltcat-cover-company { margin: 3.05cm 0 0; text-align: center; font-family: "Times New Roman", Times, serif; color: #000000; }
            .ltcat-company-logo { display: block; width: auto; max-width: 3.45cm; max-height: 3.45cm; margin: 0 auto 0.15cm; }
            .ltcat-company-logo-placeholder { width: 3.45cm; height: 3.1cm; margin: 0 auto 0.15cm; }
            .ltcat-cover-company h3 { margin: 0.04cm 0 0; font-size: 18pt; line-height: 1.18; font-weight: 700; color: #000000; }
            .ltcat-cover-company p { margin: 0.28cm 0 0; font-size: 18pt; line-height: 1.18; font-weight: 700; color: #000000; }
            .ltcat-cover-elaborated { margin-top: 3.45cm; text-align: center; font-family: Arial, sans-serif; color: #000000; }
            .ltcat-elaborated-label { margin: 0 0 0.25cm; font-size: 9pt; font-weight: 400; }
            .ltcat-eprotege-logo { display: block; width: 3.1cm; height: auto; margin: 0 auto 0.08cm; }
            .ltcat-elaborated-name, .ltcat-elaborated-role { margin: 0; font-size: 10.5pt; line-height: 1.15; font-weight: 700; }
            .ltcat-elaborated-date { margin: 0.44cm 0 0; font-size: 10.5pt; font-weight: 400; }
            .ltcat-cover-footer { position: absolute; left: 0; right: 0; bottom: 0; min-height: 2.15cm; box-sizing: border-box; padding: 0.24cm 0.4cm 0.18cm; background: #1f3b61; color: #ffffff; text-align: center; font-family: Arial, sans-serif; font-size: 10.5pt; line-height: 1.16; }
            .ltcat-cover-footer strong { font-weight: 700; }
            .ltcat-info-table, .ltcat-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
            .ltcat-section h2 { margin: 22px 0 8px; padding: 7px 9px; background: #1f3b61; color: #fff; font-family: Arial, sans-serif; font-size: 12pt; }
            .ltcat-section p { margin: 0 0 8px; text-align: justify; }
            .ltcat-info-table th, .ltcat-info-table td, .ltcat-table th, .ltcat-table td { border: 1px solid #cbd5e1; padding: 6px 7px; vertical-align: top; }
            .ltcat-info-table th, .ltcat-table th { background: #dbeafe; color: #1e3a8a; font-weight: 700; text-align: left; }
            .ltcat-sector-page { page-break-before: always; break-before: page; margin: 0 0 16px; }
            .ltcat-sector-page:first-child { page-break-before: always; break-before: page; }
            .ltcat-sector-page h2 { margin: 0 0 10px; padding: 7px 9px; background: #1f3b61; color: #fff; font-family: Arial, sans-serif; font-size: 12pt; }
            .ltcat-soc-table { width: 100%; border-collapse: collapse; table-layout: fixed; margin: 0 0 10px; page-break-inside: avoid; }
            .ltcat-soc-table td { border: 1px solid #111827; padding: 4px 6px; vertical-align: top; font-size: 8.5pt; line-height: 1.25; color: #111827; }
            .ltcat-soc-table .ltcat-soc-band td { background: #e5e7eb; color: #111827; font-weight: 700; text-transform: uppercase; }
            .ltcat-soc-table .ltcat-soc-title td { background: #f3f4f6; color: #111827; font-weight: 700; font-size: 11pt; }
            .ltcat-soc-table .ltcat-soc-subtitle td { background: #f8fafc; color: #111827; font-weight: 700; }
            .ltcat-soc-table .ltcat-soc-label td:first-child { background: #f8fafc; font-weight: 700; }
            .ltcat-soc-spacer { height: 8px; line-height: 8px; font-size: 1pt; }
            .ltcat-footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #cbd5e1; color: #64748b; text-align: center; font-size: 8pt; }
          </style>`;

        if (options.preview) return `${styles}<div class="WordSection1">${body}</div>`;
        return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(buildDocumentAutomationTitle(project))}</title>
  ${styles}
</head>
<body>
  <div class="WordSection1">${body}</div>
</body>
</html>`;
      }

      function buildLtcatModelText(companyName, fields = {}) {
        const company = companyName || "Empresa";
        const revisionDate = fields.currentRevisionDate || "";
        return {
          presentation: "O Laudo Técnico de Condições Ambientais do Trabalho, daqui para a frente chamado apenas de LTCAT, é o documento oficial para caracterizar as condições ambientais de trabalho para fins de aposentadoria especial.\n\nQuando a atividade especial é caracterizada através do LTCAT, é possível aposentar-se após cumprir 25, 20 ou 15 anos de contribuição, conforme o caso, sujeito a condições especiais que prejudiquem a saúde ou a integridade física. Além do tempo de contribuição, é necessário que o segurado cumpra os demais requisitos exigidos na legislação previdenciária.",
          objective: `O LTCAT tem por objetivo analisar e verificar a existência de agentes nocivos à saúde do trabalhador, para fins de obtenção de aposentadoria especial, conforme Art. 58 da Lei 8.213/91.\n\nDeste modo, para elaboração deste documento iremos realizar análise qualitativa e/ou quantitativa, quando se fizer necessário, dos riscos físicos, químicos e biológicos existentes nos postos e setores de trabalho em que os trabalhadores da empresa ${company} exercem suas tarefas cotidianas.\n\nO LTCAT é a fonte oficial de informações para preenchimento do Perfil Profissiográfico Previdenciário - PPP.`,
          validity: revisionDate
            ? `As informações registradas neste documento foram revisadas em ${revisionDate} e podem se manter atuais por período indeterminado, ou até que ocorram modificações no ambiente de trabalho, novos atendimentos à legislação, incorporação de novas atividades, alteração de metodologias ou melhorias do processo produtivo.`
            : "As informações registradas neste documento podem se manter atuais por período indeterminado, ou até que ocorram modificações no ambiente de trabalho, novos atendimentos à legislação, incorporação de novas atividades, alteração de metodologias ou melhorias do processo produtivo.",
          methodology: `No presente LTCAT serão informados os agentes nocivos constatados e que podem implicar em aposentadoria especial para os trabalhadores da empresa ${company}.\n\nForam considerados os dados técnicos disponíveis no relatório do SOC, a hierarquia de setores e cargos, as avaliações qualitativas e quantitativas informadas, os registros de medições, as medidas de prevenção e controle e os pareceres técnicos apresentados no documento base.`,
          riskMatrix: "Para aplicação da Matriz de Risco, neste documento estaremos nos referenciando na metodologia de MULHAUSEN & DAMIANO (1998) e pelo apêndice D da BS 8800 (BSI, 1996). A relação se dá através da Probabilidade (P) x Gravidade (G), devendo a classificação ser conferida tecnicamente conforme as informações do ambiente avaliado.",
          specialRetirement: "Em relação à avaliação qualitativa, a descrição das circunstâncias de exposição ocupacional, fontes de liberação, meios de contato, intensidade, frequência e duração da exposição deve ser considerada para confirmação do enquadramento previdenciário. Quando houver avaliação quantitativa, devem ser observados os limites de tolerância, metodologias de avaliação e legislação previdenciária aplicável.",
          generalConclusion: `Para as avaliações realizadas neste LTCAT que determinam os direitos previdenciários, foram analisadas as exposições dos riscos físicos, químicos e biológicos por função no ambiente de trabalho, onde foram verificados primeiramente os riscos de forma qualitativa, seguidas de medições pontuais quantitativas quando aplicáveis, registradas de forma mais abrangente no levantamento de riscos para elaboração do Programa de Gerenciamento de Riscos (PGR) da ${company}. O Laudo Previdenciário deve ser utilizado no preenchimento do Perfil Profissiográfico Previdenciário (PPP) dos funcionários.\n\nO presente Laudo cita as funções atuais da empresa e, portanto, é considerado um laudo técnico coletivo e deve ser reavaliado sempre que novas medidas de controle administrativas ou medidas de proteção coletiva sejam instaladas, ou ocorra mudança de espaço físico, equipamentos, atividades, processo de trabalho ou outras alterações que venham a modificar as condições ambientais de riscos dos funcionários.\n\nDeve ser implementado o Mapa de Risco em cada setor da empresa, assim como a lista de Equipamentos de Proteção Individual (EPI) que devem ser utilizados em cada setor, a fim de proporcionar a melhoria da informação e gestão dos riscos existentes.\n\nAs recomendações previstas neste Laudo Técnico das Condições de Ambiente de Trabalho NÃO desobrigam a empresa a cumprir outras disposições que, com relação à matéria, estejam incluídas em Códigos de Obras do Município, Regulamentos Sanitários dos Estados ou outras oriundas de convenções e acordos coletivos de trabalho.`,
          closingTerm: "Havendo concluído este Laudo, segue assinatura do Responsável Técnico pela elaboração.",
          references: "ABNT. Manual de normas técnicas.\nBRASIL. Consolidação das Leis do Trabalho - CLT.\nBRASIL. Lei nº 8.212, de 24 de julho de 1991.\nBRASIL. Lei nº 8.213, de 24 de julho de 1991.\nBRASIL. Decreto nº 3.048, de 06 de maio de 1999.\nBRASIL. Instrução Normativa nº 77, de 21 de janeiro de 2015.\nFUNDACENTRO. Normas de Higiene Ocupacional aplicáveis.\nNormas Regulamentadoras do Ministério do Trabalho aplicáveis."
        };
      }

      function ltcatWordSection(title, content) {
        return `<section class="ltcat-section"><h2>${escapeHtml(title)}</h2>${content}</section>`;
      }

      function ltcatParagraph(value) {
        const parts = String(value || "-").split(/\n+/).map(part => part.trim()).filter(Boolean);
        return parts.map(part => `<p>${wordPlainHtml(part)}</p>`).join("") || "<p>-</p>";
      }

      function ltcatWordTable(headers, rows) {
        return `<table class="ltcat-table">
          <thead><tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
          <tbody>${(rows || []).map(row => `<tr>${row.map(cell => `<td>${cell == null || cell === "" ? "-" : wordPlainHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>`;
      }

      function renderLtcatRawRiskSectorBlocks(sectorBlocks) {
        return (sectorBlocks || []).map((block, index) => `
          <section class="ltcat-sector-page">
            <h2>${escapeHtml(block.title || `Setor ${index + 1}`)}</h2>
            ${renderLtcatSocSectorTables(block.rawText || "")}
          </section>
        `).join("");
      }

      function renderLtcatSocSectorTables(rawText = "") {
        const lines = String(rawText || "").replace(/\r\n?/g, "\n").split("\n");
        const tables = [];
        let rows = [];
        const flush = () => {
          if (!rows.length) return;
          tables.push(renderLtcatSocTable(rows));
          rows = [];
        };
        lines.forEach(line => {
          const cleaned = String(line || "").replace(/\u00a0/g, " ").trim();
          if (!cleaned) {
            flush();
            return;
          }
          if (/^\.$/.test(cleaned)) {
            flush();
            tables.push('<div class="ltcat-soc-spacer">&nbsp;</div>');
            return;
          }
          const cells = splitLtcatSocRowCells(line);
          if (!cells.length) {
            flush();
            return;
          }
          rows.push(cells);
        });
        flush();
        return tables.join("") || `<p>${wordPlainHtml(rawText || "-")}</p>`;
      }

      function splitLtcatSocRowCells(line = "") {
        const source = String(line || "").replace(/\u00a0/g, " ");
        const pieces = source.includes("\t")
          ? source.split(/\t+/)
          : source.split(/\s{3,}/);
        const cells = pieces.map(value => value.trim()).filter(Boolean);
        return cells.length ? cells : [source.trim()].filter(Boolean);
      }

      function renderLtcatSocTable(rows = []) {
        const maxCells = Math.max(1, ...rows.map(row => row.length));
        const colgroup = renderLtcatSocColgroup(maxCells);
        const body = rows.map((row, index) => {
          const rowClass = ltcatSocRowClass(row, index);
          return `<tr class="${rowClass}">${row.map((cell, cellIndex) => {
            const colspan = ltcatSocCellColspan(row, cellIndex, maxCells);
            return `<td${colspan > 1 ? ` colspan="${colspan}"` : ""}>${wordPlainHtml(cell)}</td>`;
          }).join("")}</tr>`;
        }).join("");
        return `<table class="ltcat-soc-table">${colgroup}<tbody>${body}</tbody></table>`;
      }

      function renderLtcatSocColgroup(maxCells = 1) {
        if (maxCells <= 1) return "<colgroup><col style=\"width:100%\"></colgroup>";
        if (maxCells === 2) return "<colgroup><col style=\"width:28%\"><col style=\"width:72%\"></colgroup>";
        if (maxCells === 3) return "<colgroup><col style=\"width:25%\"><col style=\"width:25%\"><col style=\"width:50%\"></colgroup>";
        if (maxCells === 4) return "<colgroup><col style=\"width:25%\"><col style=\"width:25%\"><col style=\"width:25%\"><col style=\"width:25%\"></colgroup>";
        return `<colgroup>${Array.from({ length: maxCells }, () => `<col style="width:${(100 / maxCells).toFixed(2)}%">`).join("")}</colgroup>`;
      }

      function ltcatSocCellColspan(row, cellIndex, maxCells) {
        if (!Array.isArray(row) || row.length >= maxCells) return 1;
        if (row.length === 1) return maxCells;
        if (cellIndex === row.length - 1) return Math.max(1, maxCells - row.length + 1);
        return 1;
      }

      function ltcatSocRowClass(row = [], index = 0) {
        const first = normalizeText(row[0] || "").trim();
        const joined = normalizeText(row.join(" ")).trim();
        if (/^(setor|cargo|identificacao|avaliação|avaliacao|criterio|medicao|prevenção e controle|prevencao e controle|parecer tecnico|conclusao da aposentadoria especial)$/.test(first)) {
          return "ltcat-soc-band";
        }
        if (/^especificacao dos perigos|^especificação dos perigos/.test(joined)) return "ltcat-soc-title";
        if (index <= 2 && row.length === 1) return "ltcat-soc-title";
        if (row.length === 2 && /^(descricao|fundamentacao legal|possiveis lesoes|fontes ou circunstancias|meio de propagacao|perfil de exposicao|acoes necessarias|parecer tecnico)$/.test(first)) {
          return "ltcat-soc-label";
        }
        if (/^(grupo|codigo esocial|perigo|probabilidade|gravidade|nivel de risco|empresa|tecnica utilizada|data da medicao|medicao|nivel de acao|lt)$/.test(first)) {
          return "ltcat-soc-subtitle";
        }
        return "";
      }

      function ltcatRiskWordBlock(risk, index) {
        const rows = [
          ["Grupo", risk.grupo || "-"],
          ["Código eSocial", risk.codigoESocial || "-"],
          ["Perigo/Fator de Risco", risk.perigo || "-"],
          ["Descrição", risk.descricao || "-"],
          ["Fundamentação legal", risk.fundamentacaoLegal || "-"],
          ["Possíveis lesões ou agravos à saúde", risk.possiveisLesoes || "-"],
          ["Fontes ou circunstâncias", risk.fontesCircunstancias || "-"],
          ["Meio de propagação", risk.meioPropagacao || "-"],
          ["Critério de avaliação", risk.criterioAvaliacao || "-"],
          ["Perfil de exposição", risk.perfilExposicao || "-"],
          ["Probabilidade", risk.probabilidade || "-"],
          ["Gravidade", risk.gravidade || "-"],
          ["Nível de risco", risk.nivelRisco || "-"],
          ["Medição", ltcatMeasurementText(risk.medicao)],
          ["Prevenção e controle", risk.prevencaoControle || "-"],
          ["Parecer técnico", risk.parecerTecnico || "-"],
          ["Conclusão da aposentadoria especial", risk.conclusaoAposentadoria || "-"]
        ];
        return `
          <h3 class="ltcat-risk-title">${index + 1}. ${wordPlainHtml(risk.perigo || "Risco sem título")}</h3>
          <p class="ltcat-risk-subtitle"><strong>Setor:</strong> ${wordPlainHtml(risk.setor || "-")} | <strong>Cargo:</strong> ${wordPlainHtml(risk.cargo || "-")}</p>
          ${ltcatWordTable(["Campo", "Informação"], rows)}`;
      }

      function ltcatMeasurementText(measurement = {}) {
        const parts = [
          ["Empresa", measurement.empresa],
          ["Técnica", measurement.tecnica],
          ["Equipamento", measurement.equipamento],
          ["Data", measurement.data],
          ["Valor", measurement.valor],
          ["Nível de ação", measurement.nivelAcao],
          ["Limite de tolerância", measurement.limiteTolerancia]
        ].filter(([, value]) => value);
        return parts.length ? parts.map(([label, value]) => `${label}: ${value}`).join("\n") : "-";
      }

      function getAllManagementProfiles() {
        return Array.isArray(app.profiles)
          ? app.profiles.filter(profile => (canAccessHiddenItems() || !profile.hidden) && canAccessProfile(profile))
          : [];
      }

      function getManagementFolders(profile) {
        return (profile?.folders || []).filter(folder => folder.isDefault || canAccessHiddenItems() || !folder.hidden);
      }

      function getManagementPlansForProfile(profile) {
        return getActivePlans(profile).filter(plan => {
          const folder = (profile.folders || []).find(item => item.id === plan.folderId);
          return !folder?.hidden || canAccessHiddenItems();
        });
      }

      function getAllManagementPlans() {
        return getAllManagementProfiles().flatMap(profile => getManagementPlansForProfile(profile).filter(plan => canAccessPlan(plan)).map(plan => {
          const folder = (profile.folders || []).find(item => item.id === plan.folderId);
          const stats = getPlanStats(plan);
          return {
            profile,
            plan,
            folderName: folder ? folder.name : "Sem pasta",
            progress: stats.progress,
            actionsCount: (plan.data?.actions || []).length
          };
        }));
      }

      function getClientRegistry() {
        app.clientRegistry = normalizeClientRegistry(app.clientRegistry);
        return app.clientRegistry;
      }

      function getManagementClients() {
        return getClientRegistry().clients.filter(client => canAccessClient(client.id));
      }

      function findClient(clientId) { return getClientRegistry().clients.find(client => client.id === clientId) || null; }
      function findUnit(unitId) {
        for (const client of getClientRegistry().clients) {
          const unit = client.units.find(item => item.id === unitId);
          if (unit) return { client, unit };
        }
        return null;
      }
      function findSector(sectorId) {
        for (const client of getClientRegistry().clients) {
          const sector = client.sectors.find(item => item.id === sectorId);
          if (sector) return { client, sector, unit: client.units.find(unit => unit.id === sector.unitId) || null };
        }
        return null;
      }
      function countProfileActions(profile) {
        return getManagementPlansForProfile(profile).reduce((total, plan) => total + (plan.data?.actions || []).length, 0);
      }

      function countProfileCompletedActions(profile) {
        return getManagementPlansForProfile(profile).reduce((total, plan) => total + (plan.data?.actions || []).filter(row => row.status === "Concluído").length, 0);
      }

      function managementDeadlineDate(value) {
        const text = String(value || "").trim().toLowerCase();
        let match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 23, 59, 59);
        match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
        if (match) {
          const year = Number(match[3]) < 100 ? 2000 + Number(match[3]) : Number(match[3]);
          return new Date(year, Number(match[2]) - 1, Number(match[1]), 23, 59, 59);
        }
        const months = { jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11 };
        match = text.match(/(?:^|-)(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\/(\d{2,4})$/);
        if (match) {
          const year = Number(match[2]) < 100 ? 2000 + Number(match[2]) : Number(match[2]);
          return new Date(year, months[match[1]] + 1, 0, 23, 59, 59);
        }
        return null;
      }

      function getManagementStats() {
        const profiles = getAllManagementProfiles();
        const plans = getAllManagementPlans();
        const suggestions = normalizeImprovementSuggestions(app.improvementSuggestions);
        const procedureLibrary = normalizeProcedureLibrary(app.procedureLibrary);
        const physicalCategory = procedureLibrary.published.categories.find(category => category.id === "laudos-fisicos");
        const physicalReports = physicalCategory?.items || [];
        const allActions = plans.flatMap(item => item.plan.data?.actions || []);
        const templates = normalizeActionPlanTemplates(app.actionPlanTemplates);
        const backups = normalizeBackupCenter(app.backupCenter).snapshots;
        const now = Date.now();
        const overdueActions = allActions.filter(row => {
          const deadline = managementDeadlineDate(row.when);
          return row.status !== "Concluído" && row.status !== "Cancelado" && deadline && deadline.getTime() < now;
        });
        const latestPlan = [...plans].sort((a, b) => String(b.plan.updatedAt || "").localeCompare(String(a.plan.updatedAt || "")))[0];
        const latestSuggestion = [...suggestions].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))[0];
        return {
          profiles: profiles.length,
          folders: profiles.reduce((total, profile) => total + getManagementFolders(profile).length, 0),
          plans: plans.length,
          actions: allActions.length,
          completed: allActions.filter(row => row.status === "Concluído").length,
          inProgress: allActions.filter(row => row.status === "Em andamento").length,
          pendingActions: allActions.filter(row => row.status !== "Concluído" && row.status !== "Cancelado").length,
          overdueActions: overdueActions.length,
          highPriorityActions: allActions.filter(row => row.priority === "Alta" && row.status !== "Concluído" && row.status !== "Cancelado").length,
          recentlyUpdatedPlans: plans.filter(item => now - new Date(item.plan.updatedAt || 0).getTime() <= 30 * 24 * 60 * 60 * 1000).length,
          newSuggestions: suggestions.filter(item => item.status === "open").length,
          resolvedSuggestions: suggestions.filter(item => item.status === "resolved").length,
          activities: (app.activityLog || []).length + restrictedAccessLogs.length,
          templates: templates.length,
          activeTemplates: templates.filter(template => template.active).length,
          audits: normalizeAuditTrail(app.auditTrail).length,
          backups: backups.length,
          latestBackup: backups[0] || null,
          storageSizeKb: Math.round(new Blob([JSON.stringify(sharedAppData(app))]).size / 1024),
          syncStatus: cloudReady ? "Nuvem conectada" : "Modo local",
          maintenanceMode: normalizeSystemSettings(app.systemSettings).maintenance.enabled,
          publishedProcedureVersion: procedureLibrary.published.versionLabel || "-",
          activePhysicalReports: physicalReports.filter(item => item.active && !item.deleted).length,
          inactivePhysicalReports: physicalReports.filter(item => !item.active && !item.deleted).length,
          hasProcedureDraft: !!procedureLibrary.draft,
          procedureUpdatedBy: procedureLibrary.updatedBy || procedureLibrary.published.publishedBy || "-",
          procedurePublishedAt: procedureLibrary.published.publishedAt || "",
          latestPlan,
          latestSuggestion
        };
      }

      function canAccessManagementTab(tab) {
        // Legado desativado: clientes, unidades, setores, comercial e escopos empresariais.
        if (["clients", "units", "sectors", "accesses", "commercial"].includes(tab)) return false;
        const checks = {
          permissions: canManagePermissions,
          activity: canViewActivity,
          procedures: canManageProcedures,
          backups: () => canManageBackups() || canRestoreBackups() || canExportFullSystem() || canImportFullSystem(),
          audit: canViewAuditTrail,
          settings: canManageSystemSettings,
          diagnostics: canRunDiagnostics
        };
        return checks[tab] ? checks[tab]() : canAccessManagementPhase1();
      }

      function renderManagement() {
        if (!canAccessManagementPhase1()) {
          showAppSelector();
          return;
        }
        if (!canAccessManagementTab(activeManagementTab)) activeManagementTab = "dashboard";
        els.managementUserEmail.textContent = currentUser?.email || "Usuário conectado";
        els.managementAccessBadge.textContent = isFullSystemAdmin()
          ? "Administrador total"
          : getManagementPermissionForEmail(currentUser?.email)
            ? "Gestão Fase 2"
            : "Gestão Fase 1";
        els.managementTabs.querySelectorAll("[data-management-tab]").forEach(button => {
          const allowed = canAccessManagementTab(button.dataset.managementTab);
          button.classList.toggle("hidden", !allowed);
          button.classList.toggle("is-active", button.dataset.managementTab === activeManagementTab);
        });
        if (activeManagementTab === "profiles") return renderManagementProfiles();
        if (activeManagementTab === "folders") return renderManagementFolders();
        if (activeManagementTab === "plans") return renderManagementPlans();
        if (activeManagementTab === "procedures") return renderManagementProcedures();
        if (activeManagementTab === "suggestions") return renderManagementSuggestions();
        if (activeManagementTab === "activity") return renderManagementActivity();
        if (activeManagementTab === "permissions") return renderManagementPermissions();
        if (activeManagementTab === "backups") return renderManagementBackups();
        if (activeManagementTab === "audit") return renderManagementAuditTrail();
        if (activeManagementTab === "settings") return renderManagementSettings();
        if (activeManagementTab === "diagnostics") return renderManagementDiagnostics();
        renderManagementDashboard();
      }

      function saveManagementChanges() {
        saveApp({ management: true, fullSave: true });
      }

      function managementMetric(label, value, detail = "") {
        return `<article class="management-metric-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>${detail ? `<small>${escapeHtml(detail)}</small>` : ""}</article>`;
      }

      function renderManagementDashboard() {
        const stats = getManagementStats();
        els.managementContent.innerHTML = `
          <section class="management-dashboard-grid">
            ${managementMetric("Total de perfis", stats.profiles)}
            ${managementMetric("Total de pastas", stats.folders)}
            ${managementMetric("Planos de ação", stats.plans)}
            ${managementMetric("Templates ativos", stats.activeTemplates, `${stats.templates} no total`)}
            ${managementMetric("Ações pendentes", stats.pendingActions)}
            ${managementMetric("Ações vencidas", stats.overdueActions)}
            ${managementMetric("Prioridade alta em aberto", stats.highPriorityActions)}
            ${managementMetric("Planos atualizados recentemente", stats.recentlyUpdatedPlans, "últimos 30 dias")}
            ${managementMetric("Sugestões novas", stats.newSuggestions)}
            ${managementMetric("Logs recentes", stats.activities)}
            ${managementMetric("Último backup", stats.latestBackup ? formatDateTime(stats.latestBackup.createdAt) : "Nenhum")}
            ${managementMetric("Sincronização", stats.syncStatus)}
            ${managementMetric("Tamanho aproximado", `${stats.storageSizeKb} KB`)}
            ${managementMetric("Procedimentos publicados", stats.publishedProcedureVersion, `${stats.activePhysicalReports} laudo(s) ativo(s)`)}
            ${managementMetric("Último plano editado", stats.latestPlan?.plan.title || "Nenhum", stats.latestPlan ? formatDateTime(stats.latestPlan.plan.updatedAt) : "")}
          </section>
          <section class="management-panel">
            <div class="management-panel-head"><h2>Saúde operacional</h2><span class="management-status-badge">${stats.maintenanceMode ? "Manutenção ativa" : "Operação normal"}</span></div>
            <div class="management-health-grid">
              <article class="management-health-card" data-health="${stats.maintenanceMode ? "warning" : "ok"}"><h3>Disponibilidade</h3><p>${stats.maintenanceMode ? "Acesso regular temporariamente bloqueado." : "Sistema disponível aos usuários."}</p></article>
              <article class="management-health-card" data-health="${stats.overdueActions ? "warning" : "ok"}"><h3>Cronogramas</h3><p>${stats.overdueActions ? `${stats.overdueActions} ação(ões) com prazo vencido.` : "Nenhuma ação vencida identificada."}</p></article>
              <article class="management-health-card" data-health="${stats.backups ? "ok" : "warning"}"><h3>Proteção de dados</h3><p>${stats.backups ? `${stats.backups} snapshot(s) interno(s).` : "Nenhum snapshot interno criado."}</p></article>
            </div>
          </section>`;
      }

      // Legado desativado: mantido somente para abrir estados antigos sem perda de dados.
      function renderManagementClients() {
        const term = normalizeText(managementFilters.clients);
        const clients = getManagementClients().filter(client => !term || normalizeText(`${client.name} ${client.legalName} ${client.cnpj} ${client.contactEmail}`).includes(term));
        els.managementContent.innerHTML = `
          <section class="management-panel">
            <div class="management-panel-head"><h2>Clientes</h2><div class="management-item-actions">${canManageClients() ? '<button class="button primary" data-management-action="new-client">Novo cliente</button>' : ""}<span class="management-status-badge">${clients.length} cliente(s)</span></div></div>
            <div class="management-filters"><div class="management-filter"><label>Buscar cliente</label><input data-management-filter="clients" value="${escapeAttr(managementFilters.clients)}" placeholder="Nome, CNPJ ou contato..."></div></div>
            <div class="management-client-grid">${clients.map(client => {
              const profiles = app.profiles.filter(profile => profile.clientId === client.id).length;
              const plans = app.profiles.reduce((sum, profile) => sum + profile.plans.filter(plan => plan.clientId === client.id).length, 0);
              return `<article class="management-client-card"><h3>${escapeHtml(client.name)}</h3><p>${escapeHtml(client.legalName || "Razão social não informada")}</p><p>CNPJ: ${escapeHtml(client.cnpj || "-")}</p><p>Status: <strong>${escapeHtml(client.status)}</strong> · Contrato: <strong>${escapeHtml(client.contractStatus)}</strong></p><p>${client.units.length} unidade(s) · ${client.sectors.length} setor(es) · ${profiles} perfil(is) · ${plans} plano(s)</p><div class="management-item-actions">${canManageClients() ? `<button class="button" data-management-action="edit-client" data-client-id="${escapeAttr(client.id)}">Editar</button><button class="button" data-management-action="export-client" data-client-id="${escapeAttr(client.id)}">Exportar</button>${client.id !== DEFAULT_CLIENT_ID ? `<button class="button danger" data-management-action="archive-client" data-client-id="${escapeAttr(client.id)}">Arquivar</button>` : ""}` : ""}</div></article>`;
            }).join("") || '<div class="management-empty">Nenhum cliente encontrado.</div>'}</div>
          </section>`;
      }

      function renderManagementUnits() {
        const term = normalizeText(managementFilters.units);
        const items = getManagementClients().flatMap(client => client.units.filter(unit => canAccessUnit(unit.id)).map(unit => ({ client, unit }))).filter(item => !term || normalizeText(`${item.unit.name} ${item.unit.city} ${item.client.name}`).includes(term));
        els.managementContent.innerHTML = `
          <section class="management-panel"><div class="management-panel-head"><h2>Unidades</h2><div class="management-item-actions">${canManageUnits() ? '<button class="button primary" data-management-action="new-unit">Nova unidade</button>' : ""}<span class="management-status-badge">${items.length} unidade(s)</span></div></div>
          <div class="management-filters"><div class="management-filter"><label>Buscar unidade</label><input data-management-filter="units" value="${escapeAttr(managementFilters.units)}" placeholder="Unidade, cidade ou cliente..."></div></div>
          <div class="management-table-wrap"><table class="management-table"><thead><tr><th>Unidade</th><th>Cliente</th><th>Localidade</th><th>Status</th><th>Ações</th></tr></thead><tbody>${items.map(({ client, unit }) => `<tr><td><strong>${escapeHtml(unit.name)}</strong><small>${escapeHtml(unit.address || "")}</small></td><td>${escapeHtml(client.name)}</td><td>${escapeHtml([unit.city, unit.state].filter(Boolean).join(" / ") || "-")}</td><td>${escapeHtml(unit.status)}</td><td><div class="management-item-actions">${canManageUnits() ? `<button class="button" data-management-action="edit-unit" data-client-id="${escapeAttr(client.id)}" data-unit-id="${escapeAttr(unit.id)}">Editar</button>${unit.id !== DEFAULT_UNIT_ID ? `<button class="button danger" data-management-action="archive-unit" data-client-id="${escapeAttr(client.id)}" data-unit-id="${escapeAttr(unit.id)}">Arquivar</button>` : ""}` : ""}</div></td></tr>`).join("") || '<tr><td colspan="5"><div class="management-empty">Nenhuma unidade encontrada.</div></td></tr>'}</tbody></table></div></section>`;
      }

      function renderManagementSectors() {
        const term = normalizeText(managementFilters.sectors);
        const items = getManagementClients().flatMap(client => client.sectors.filter(sector => canAccessSector(sector.id)).map(sector => ({ client, sector, unit: client.units.find(unit => unit.id === sector.unitId) }))).filter(item => !term || normalizeText(`${item.sector.name} ${item.unit?.name} ${item.client.name}`).includes(term));
        els.managementContent.innerHTML = `
          <section class="management-panel"><div class="management-panel-head"><h2>Setores</h2><div class="management-item-actions">${canManageSectors() ? '<button class="button primary" data-management-action="new-sector">Novo setor</button>' : ""}<span class="management-status-badge">${items.length} setor(es)</span></div></div>
          <div class="management-filters"><div class="management-filter"><label>Buscar setor</label><input data-management-filter="sectors" value="${escapeAttr(managementFilters.sectors)}" placeholder="Setor, unidade ou cliente..."></div></div>
          <div class="management-table-wrap"><table class="management-table"><thead><tr><th>Setor</th><th>Unidade</th><th>Cliente</th><th>Status</th><th>Ações</th></tr></thead><tbody>${items.map(({ client, sector, unit }) => `<tr><td><strong>${escapeHtml(sector.name)}</strong><small>${escapeHtml(sector.description || "")}</small></td><td>${escapeHtml(unit?.name || "-")}</td><td>${escapeHtml(client.name)}</td><td>${escapeHtml(sector.status)}</td><td><div class="management-item-actions">${canManageSectors() ? `<button class="button" data-management-action="edit-sector" data-client-id="${escapeAttr(client.id)}" data-sector-id="${escapeAttr(sector.id)}">Editar</button>${sector.id !== DEFAULT_SECTOR_ID ? `<button class="button danger" data-management-action="archive-sector" data-client-id="${escapeAttr(client.id)}" data-sector-id="${escapeAttr(sector.id)}">Arquivar</button>` : ""}` : ""}</div></td></tr>`).join("") || '<tr><td colspan="5"><div class="management-empty">Nenhum setor encontrado.</div></td></tr>'}</tbody></table></div></section>`;
      }

      function renderManagementAccesses() {
        const users = app.managementPermissions?.users || [];
        els.managementContent.innerHTML = `
          <section class="management-panel"><div class="management-panel-head"><h2>Acessos por escopo</h2><span class="management-status-badge">${users.length + 1} acesso(s)</span></div><p>O administrador total possui acesso permanente. Demais usuários podem ser limitados por cliente, unidade, setor, perfil, pasta ou plano.</p>
          <div class="management-table-wrap"><table class="management-table"><thead><tr><th>Usuário</th><th>Papel</th><th>Status</th><th>Escopo</th><th>Ação</th></tr></thead><tbody><tr><td><strong>${escapeHtml(SUPER_ADMIN_EMAIL)}</strong></td><td>owner · ${ACCESS_ROLES.owner}</td><td>Ativo permanente</td><td>Todos os clientes</td><td>-</td></tr>${users.map(entry => `<tr><td><strong>${escapeHtml(entry.name || entry.email)}</strong><small>${escapeHtml(entry.email)}</small></td><td>${escapeHtml(entry.role)} · ${escapeHtml(ACCESS_ROLES[entry.role] || "")}</td><td>${entry.status === "inactive" ? "Inativo" : "Ativo"}</td><td>${entry.scope?.allClients ? "Todos os clientes" : `${entry.scope?.clientIds?.length || 0} cliente(s), ${entry.scope?.planIds?.length || 0} plano(s)`}</td><td>${canManageAccessScopes() ? `<button class="button" data-management-action="edit-access-scope" data-permission-id="${escapeAttr(entry.id)}">Editar escopo</button>` : ""}</td></tr>`).join("")}</tbody></table></div></section>`;
      }

      function renderManagementBackups() {
        const center = normalizeBackupCenter(app.backupCenter);
        const snapshots = center.snapshots;
        els.managementContent.innerHTML = `
          <section class="management-panel"><div class="management-panel-head"><h2>Central de backups</h2><div class="management-item-actions">${canManageBackups() ? '<button class="button primary" data-management-action="create-full-backup">Backup completo</button><button class="button" data-management-action="create-plan-backup">Por plano</button><button class="button" data-management-action="create-template-backup">Templates</button><button class="button" data-management-action="create-procedure-backup">Procedimentos</button>' : ""}${canExportFullSystem() ? '<button class="button" data-management-action="export-full-system">Baixar sistema completo</button>' : ""}${canImportFullSystem() || canManageBackups() ? '<button class="button" data-management-action="import-full-system">Importar JSON</button>' : ""}</div></div>
          <div class="management-table-wrap"><table class="management-table"><thead><tr><th>Backup</th><th>Tipo</th><th>Data</th><th>Tamanho</th><th>Ações</th></tr></thead><tbody>${snapshots.map(snapshot => `<tr><td><strong>${escapeHtml(snapshot.label)}</strong><small>${escapeHtml(snapshot.createdBy || "-")}</small></td><td>${escapeHtml(snapshot.type)}</td><td>${escapeHtml(formatDateTime(snapshot.createdAt))}</td><td>${Math.round(snapshot.size / 1024)} KB</td><td><div class="management-item-actions">${canManageBackups() || canExportFullSystem() ? `<button class="button" data-management-action="download-backup" data-backup-id="${escapeAttr(snapshot.id)}">Baixar JSON</button>` : ""}${canRestoreBackups() ? `<button class="button danger" data-management-action="restore-backup" data-backup-id="${escapeAttr(snapshot.id)}">Restaurar</button>` : ""}${canManageBackups() ? `<button class="button danger" data-management-action="delete-backup" data-backup-id="${escapeAttr(snapshot.id)}">Excluir</button>` : ""}</div></td></tr>`).join("") || '<tr><td colspan="5"><div class="management-empty">Nenhum snapshot interno criado.</div></td></tr>'}</tbody></table></div></section>`;
      }

      function renderManagementAuditTrail() {
        const term = normalizeText(managementFilters.audit);
        const allEntries = normalizeAuditTrail(app.auditTrail);
        const actions = [...new Set(allEntries.map(entry => entry.action).filter(Boolean))].sort();
        const users = [...new Set(allEntries.map(entry => entry.actorEmail).filter(Boolean))].sort();
        const entries = allEntries.filter(entry => (!term || normalizeText(`${entry.action} ${entry.summary} ${entry.actorEmail} ${entry.entityLabel}`).includes(term)) && (!managementFilters.auditAction || entry.action === managementFilters.auditAction) && (!managementFilters.auditUser || entry.actorEmail === managementFilters.auditUser));
        els.managementContent.innerHTML = `
          <section class="management-panel"><div class="management-panel-head"><h2>Auditoria avançada</h2><div class="management-item-actions">${canDeleteAuditTrail() ? '<button class="button danger" data-management-action="clear-audit">Limpar auditoria</button>' : ""}<span class="management-status-badge">${entries.length} registro(s)</span></div></div>
          <div class="management-filters"><div class="management-filter"><label>Buscar auditoria</label><input data-management-filter="audit" value="${escapeAttr(managementFilters.audit)}" placeholder="Ação, usuário ou entidade..."></div><div class="management-filter"><label>Ação</label><select data-management-filter="auditAction"><option value="">Todas</option>${actions.map(action => `<option value="${escapeAttr(action)}" ${managementFilters.auditAction === action ? "selected" : ""}>${escapeHtml(action)}</option>`).join("")}</select></div><div class="management-filter"><label>Usuário</label><select data-management-filter="auditUser"><option value="">Todos</option>${users.map(user => `<option value="${escapeAttr(user)}" ${managementFilters.auditUser === user ? "selected" : ""}>${escapeHtml(user)}</option>`).join("")}</select></div></div>
          <div class="management-table-wrap"><table class="management-table"><thead><tr><th>Data</th><th>Ação</th><th>Resumo</th><th>Usuário</th><th>Entidade</th><th>Severidade</th></tr></thead><tbody>${entries.map(entry => `<tr><td>${escapeHtml(formatDateTime(entry.at))}</td><td><strong>${escapeHtml(entry.action)}</strong></td><td>${escapeHtml(entry.summary || "-")}</td><td>${escapeHtml(entry.actorEmail || "-")}</td><td>${escapeHtml([entry.entityType, entry.entityLabel].filter(Boolean).join(": ") || "-")}</td><td>${escapeHtml(entry.severity)}</td></tr>`).join("") || '<tr><td colspan="6"><div class="management-empty">Nenhuma auditoria registrada.</div></td></tr>'}</tbody></table></div></section>`;
      }

      function renderManagementSettings() {
        const settings = normalizeSystemSettings(app.systemSettings);
        const stats = getManagementStats();
        const storageSize = Math.round(new Blob([JSON.stringify(sharedAppData(app))]).size / 1024);
        const lastBackup = normalizeBackupCenter(app.backupCenter).snapshots[0];
        els.managementContent.innerHTML = `
          <section class="management-panel">
            <div class="management-panel-head"><div><h2>Configurações globais</h2><p>Edite e salve cada seção sem sair da Gestão SATS.</p></div><span class="management-status-badge">${settings.maintenance.enabled ? "Manutenção ativa" : "Operação normal"}</span></div>
            <div class="management-settings-layout">
              <section class="management-settings-section">
                <div><h3>Identidade do sistema</h3><p>Nome, subtítulo, logo e cor usados na interface.</p></div>
                <div class="management-settings-grid">
                  <label class="field">Nome do sistema<input id="systemBrandingAppName" value="${escapeAttr(settings.branding.appName)}" ${canManageSystemSettings() ? "" : "disabled"}></label>
                  <label class="field">Subtítulo<input id="systemBrandingSubtitle" value="${escapeAttr(settings.branding.subtitle)}" ${canManageSystemSettings() ? "" : "disabled"}></label>
                  <label class="field">Cor principal<input type="color" id="systemBrandingAccent" value="${escapeAttr(settings.branding.accentColor)}" ${canManageSystemSettings() ? "" : "disabled"}></label>
                  <label class="field">Logo do sistema<input type="file" id="systemBrandingLogo" accept="image/png,image/jpeg" ${canManageSystemSettings() ? "" : "disabled"}></label>
                  <label class="field is-wide"><span>Logo atual</span><span class="checkbox-line"><input type="checkbox" id="systemBrandingRemoveLogo" ${canManageSystemSettings() ? "" : "disabled"}> Remover logo personalizada ao salvar</span></label>
                </div>
                ${canManageSystemSettings() ? '<div class="management-settings-footer"><button class="button primary" data-management-action="save-system-branding">Salvar identidade</button></div>' : ""}
              </section>

              <section class="management-settings-section">
                <div><h3>Modo manutenção</h3><p>Controle o acesso durante intervenções técnicas. O administrador principal nunca será bloqueado.</p></div>
                <div class="management-settings-grid">
                  <label class="field is-wide"><span>Estado</span><span class="checkbox-line"><input type="checkbox" id="systemMaintenanceEnabled" ${settings.maintenance.enabled ? "checked" : ""} ${canManageMaintenanceMode() ? "" : "disabled"}> Ativar modo manutenção</span></label>
                  <label class="field is-wide">Mensagem de manutenção<textarea id="systemMaintenanceMessage" rows="3" ${canManageMaintenanceMode() ? "" : "disabled"}>${escapeHtml(settings.maintenance.message)}</textarea></label>
                  <label class="field is-wide">E-mails liberados durante manutenção<textarea id="systemMaintenanceEmails" rows="3" ${canManageMaintenanceMode() ? "" : "disabled"}>${escapeHtml(settings.maintenance.allowedEmails.join(", "))}</textarea></label>
                </div>
                ${canManageMaintenanceMode() ? '<div class="management-settings-footer"><button class="button primary" data-management-action="save-system-maintenance">Salvar manutenção</button></div>' : ""}
              </section>

              <section class="management-settings-section">
                <div><h3>Exportações</h3><p>Preferências padrão para documentos gerados pelo SATS.</p></div>
                <div class="management-settings-grid">
                  <label class="field">Formato padrão<select id="systemExportsFormat" ${canManageSystemSettings() ? "" : "disabled"}><option value="pdf" ${settings.exports.defaultFormat === "pdf" ? "selected" : ""}>PDF</option><option value="jpeg" ${settings.exports.defaultFormat === "jpeg" ? "selected" : ""}>JPEG</option><option value="rtf" ${settings.exports.defaultFormat === "rtf" ? "selected" : ""}>RTF</option></select></label>
                  <label class="field"><span>Conteúdo</span><span class="checkbox-line"><input type="checkbox" id="systemExportsLogo" ${settings.exports.includeLogo ? "checked" : ""} ${canManageSystemSettings() ? "" : "disabled"}> Incluir logo</span></label>
                  <label class="field"><span>Revisão</span><span class="checkbox-line"><input type="checkbox" id="systemExportsRevision" ${settings.exports.includeRevision ? "checked" : ""} ${canManageSystemSettings() ? "" : "disabled"}> Incluir revisão</span></label>
                </div>
                ${canManageSystemSettings() ? '<div class="management-settings-footer"><button class="button primary" data-management-action="save-system-exports">Salvar exportações</button></div>' : ""}
              </section>

              <section class="management-settings-section">
                <div><h3>Segurança</h3><p>Regras globais de visibilidade e acesso administrativo.</p></div>
                <div class="management-settings-grid">
                  <label class="field"><span>Itens ocultos</span><span class="checkbox-line"><input type="checkbox" id="systemSecurityAdminHidden" ${settings.security.requireAdminModeForHiddenItems ? "checked" : ""} ${canManageSystemSettings() ? "" : "disabled"}> Exigir modo administrador</span></label>
                </div>
                ${canManageSystemSettings() ? '<div class="management-settings-footer"><button class="button primary" data-management-action="save-system-security">Salvar segurança</button></div>' : ""}
              </section>

              <section class="management-settings-section">
                <div><h3>Dados do sistema</h3><p>Visão rápida da versão, armazenamento e sincronização.</p></div>
                <div class="management-data-stats">
                  <article class="management-data-stat"><small>Versão</small><strong>${escapeHtml(APP_VERSION)}</strong></article>
                  <article class="management-data-stat"><small>Perfis / planos</small><strong>${stats.profiles} / ${stats.plans}</strong></article>
                  <article class="management-data-stat"><small>Templates / logs</small><strong>${stats.templates} / ${stats.activities}</strong></article>
                  <article class="management-data-stat"><small>Dados aproximados</small><strong>${storageSize} KB</strong></article>
                  <article class="management-data-stat"><small>Último salvamento</small><strong>${escapeHtml(formatDateTime(app.updatedAt || settings.updatedAt) || "-")}</strong></article>
                  <article class="management-data-stat"><small>Último backup</small><strong>${escapeHtml(lastBackup ? formatDateTime(lastBackup.createdAt) : "Nenhum")}</strong></article>
                </div>
                <div class="management-settings-footer">${canManageBackups() ? '<button class="button" data-management-action="create-full-backup">Criar backup rápido</button>' : ""}${canExportFullSystem() ? '<button class="button" data-management-action="export-full-system">Exportar dados</button>' : ""}${canRunDiagnostics() ? '<button class="button primary" data-management-action="run-diagnostics">Rodar diagnóstico</button>' : ""}</div>
              </section>
            </div>
          </section>`;
      }

      function renderManagementCommercial() {
        const allClients = getManagementClients();
        const clients = allClients.filter(client => !managementFilters.commercialClient || client.id === managementFilters.commercialClient);
        const revenue = clients.reduce((sum, client) => sum + (Number(String(client.commercial.monthlyValue).replace(",", ".")) || 0), 0);
        els.managementContent.innerHTML = `
          <section class="management-dashboard-grid">${managementMetric("Clientes ativos", clients.filter(client => client.status === "active").length)}${managementMetric("Contratos vencendo", clients.filter(client => client.contractStatus === "expiring").length)}${managementMetric("Contratos vencidos", clients.filter(client => client.contractStatus === "expired").length)}${managementMetric("Receita mensal estimada", revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }))}</section>
          <section class="management-panel"><div class="management-panel-head"><h2>Comercial manual</h2></div><div class="management-filters"><div class="management-filter"><label>Cliente</label><select data-management-filter="commercialClient"><option value="">Todos</option>${allClients.map(client => `<option value="${escapeAttr(client.id)}" ${managementFilters.commercialClient === client.id ? "selected" : ""}>${escapeHtml(client.name)}</option>`).join("")}</select></div></div><div class="management-table-wrap"><table class="management-table"><thead><tr><th>Cliente</th><th>Plano</th><th>Status</th><th>Valor mensal</th><th>Limites</th><th>Ação</th></tr></thead><tbody>${clients.map(client => `<tr><td><strong>${escapeHtml(client.name)}</strong></td><td>${escapeHtml(client.commercial.planName || "-")}</td><td>${escapeHtml(client.commercial.status)}</td><td>${escapeHtml(client.commercial.monthlyValue || "-")}</td><td>${escapeHtml(`${client.commercial.maxUsers || "-"} usuários · ${client.commercial.maxPlans || "-"} planos · ${client.commercial.maxUnits || "-"} unidades`)}</td><td>${canManageCommercial() || canManageLicenses() ? `<button class="button" data-management-action="edit-commercial" data-client-id="${escapeAttr(client.id)}">Editar</button>` : ""}</td></tr>`).join("")}</tbody></table></div></section>`;
      }

      function runDataDiagnostics() {
        const allIds = [];
        const plans = getAllManagementPlans();
        const allActions = plans.flatMap(item => item.plan.data?.actions || []);
        app.profiles.forEach(profile => {
          allIds.push(profile.id);
          profile.folders.forEach(folder => allIds.push(folder.id));
          profile.plans.forEach(plan => {
            allIds.push(plan.id);
            ["actions", "equipment", "trainings"].forEach(section => (plan.data?.[section] || []).forEach(row => allIds.push(row.id)));
          });
        });
        const duplicateIds = [...new Set(allIds.filter((id, index) => allIds.indexOf(id) !== index))];
        const orphanPlans = app.profiles.flatMap(profile => profile.plans.filter(plan => !profile.folders.some(folder => folder.id === plan.folderId)));
        const plansWithoutTitle = plans.filter(item => !String(item.plan.title || "").trim());
        const plansWithoutActions = plans.filter(item => !(item.plan.data?.actions || []).length);
        const actionsWithoutResponsible = allActions.filter(row => !String(row.responsible || "").trim());
        const actionsWithoutDeadline = allActions.filter(row => !String(row.when || "").trim());
        const overdueActions = allActions.filter(row => {
          const deadline = managementDeadlineDate(row.when);
          return row.status !== "Concluído" && row.status !== "Cancelado" && deadline && deadline.getTime() < Date.now();
        });
        const invalidActionStatus = allActions.filter(row => !STATUSES.includes(row.status));
        const brokenPermissions = (app.managementPermissions?.users || []).filter(entry => !normalizeEmail(entry.email).includes("@") || !entry.permissions);
        const invalidTemplates = normalizeActionPlanTemplates(app.actionPlanTemplates).filter(template => !template.name || (!template.rows.length && !template.equipmentRows.length && !template.trainingRows.length));
        const inactiveTemplates = normalizeActionPlanTemplates(app.actionPlanTemplates).filter(template => !template.active);
        const procedureValidation = validateProcedureLibrary(normalizeProcedureLibrary(app.procedureLibrary).published);
        const size = new Blob([JSON.stringify(sharedAppData(app))]).size;
        const heavyImages = app.profiles.reduce((total, profile) => total + (String(profile.avatarPhoto || "").length > 500000 ? 1 : 0) + profile.plans.reduce((planTotal, plan) => {
          const logoSize = String(plan.data?.meta?.companyLogoImage || "").length;
          const rowImages = ["actions", "equipment", "trainings"].flatMap(section => plan.data?.[section] || []).reduce((sum, row) => sum + Object.values(row).filter(value => typeof value === "string" && value.startsWith("data:image/") && value.length > 500000).length, 0);
          return planTotal + (logoSize > 500000 ? 1 : 0) + rowImages;
        }, 0), 0);
        return {
          duplicateIds, orphanPlans, plansWithoutTitle, plansWithoutActions, actionsWithoutResponsible,
          actionsWithoutDeadline, overdueActions, invalidActionStatus, brokenPermissions, invalidTemplates,
          inactiveTemplates, procedureErrors: procedureValidation.errors.length, heavyImages,
          logsTooLarge: (app.activityLog || []).length > 1000, backupMissing: !(app.backupCenter?.snapshots || []).length, size
        };
      }

      function renderManagementDiagnostics() {
        const diagnostic = runDataDiagnostics();
        const issues = diagnostic.duplicateIds.length + diagnostic.orphanPlans.length + diagnostic.plansWithoutTitle.length + diagnostic.plansWithoutActions.length + diagnostic.actionsWithoutResponsible.length + diagnostic.actionsWithoutDeadline.length + diagnostic.overdueActions.length + diagnostic.invalidActionStatus.length + diagnostic.brokenPermissions.length + diagnostic.invalidTemplates.length + diagnostic.procedureErrors + diagnostic.heavyImages + Number(diagnostic.logsTooLarge) + Number(diagnostic.backupMissing);
        els.managementContent.innerHTML = `
          <section class="management-panel"><div class="management-panel-head"><h2>Diagnóstico do sistema</h2><div class="management-item-actions">${canRepairData() ? '<button class="button primary" data-management-action="repair-data">Reparar dados</button>' : ""}<button class="button" data-management-action="run-diagnostics">Atualizar diagnóstico</button><span class="management-status-badge">${issues ? `${issues} questão(ões)` : "Saudável"}</span></div></div>
          <div class="management-diagnostic-grid">
          ${[["Planos sem título", diagnostic.plansWithoutTitle.length], ["Planos sem ações", diagnostic.plansWithoutActions.length], ["Planos sem pasta válida", diagnostic.orphanPlans.length], ["Ações sem responsável", diagnostic.actionsWithoutResponsible.length], ["Ações sem prazo", diagnostic.actionsWithoutDeadline.length], ["Ações vencidas", diagnostic.overdueActions.length], ["Ações com status inválido", diagnostic.invalidActionStatus.length], ["IDs duplicados", diagnostic.duplicateIds.length], ["Permissões quebradas", diagnostic.brokenPermissions.length], ["Templates inválidos", diagnostic.invalidTemplates.length], ["Templates inativos", diagnostic.inactiveTemplates.length], ["Procedimentos inválidos", diagnostic.procedureErrors], ["Imagens muito pesadas", diagnostic.heavyImages], ["Logs acima do recomendado", diagnostic.logsTooLarge ? 1 : 0], ["Backup ausente", diagnostic.backupMissing ? 1 : 0], ["Tamanho dos dados", `${Math.round(diagnostic.size / 1024)} KB`]].map(([label, value]) => `<article class="management-health-card" data-health="${Number(value) ? "warning" : "ok"}"><h3>${escapeHtml(label)}</h3><p>${escapeHtml(value)}</p></article>`).join("")}
          </div></section>`;
      }

      function renderManagementProfiles() {
        const term = normalizeText(managementFilters.profiles);
        const profiles = getAllManagementProfiles().filter(profile => !term || normalizeText(`${profile.name} ${profile.email} ${profile.company}`).includes(term));
        els.managementContent.innerHTML = `
          <section class="management-panel">
            <div class="management-panel-head"><h2>Lista geral de perfis</h2><div class="management-item-actions">${canManageProfiles() ? '<button class="button primary" type="button" data-management-action="new-profile">Novo perfil</button>' : ""}<span class="management-status-badge">${profiles.length} perfil(is)</span></div></div>
            <div class="management-filters">
              <div class="management-filter"><label for="managementProfileSearch">Buscar por nome, e-mail ou empresa</label><input id="managementProfileSearch" data-management-filter="profiles" value="${escapeAttr(managementFilters.profiles)}" placeholder="Buscar perfil..."></div>
            </div>
            <div class="management-table-wrap"><table class="management-table"><thead><tr><th>Perfil</th><th>Empresa / função</th><th>Pastas</th><th>Planos</th><th>Ações</th><th>Concluídas</th><th>Último acesso</th><th>Ação segura</th></tr></thead>
            <tbody>${profiles.map(profile => `
              <tr>
                <td><strong>${escapeHtml(profile.name || "Sem nome")} ${profileHasSuggestionStar(profile) ? "⭐" : ""}</strong><small>${escapeHtml(profile.email || "Sem e-mail")}${profile.hidden ? " · Oculto" : ""}</small></td>
                <td>${escapeHtml(profile.company || "-")}<small>${escapeHtml(profile.role || "-")}</small></td>
                <td>${getManagementFolders(profile).length}</td><td>${getManagementPlansForProfile(profile).length}</td><td>${countProfileActions(profile)}</td><td>${countProfileCompletedActions(profile)}</td>
                <td>${escapeHtml(profile.lastAccess ? formatDateTime(profile.lastAccess) : "-")}</td>
                <td><div class="management-item-actions">
                  <button class="button" type="button" data-management-action="${canManageProfiles() ? "open-profile" : "locate-profile"}" data-profile-id="${escapeAttr(profile.id)}">${canManageProfiles() ? "Abrir" : "Localizar"}</button>
                  ${canManageProfiles() ? `<button class="button" type="button" data-management-action="edit-profile" data-profile-id="${escapeAttr(profile.id)}">Editar</button><button class="button danger" type="button" data-management-action="delete-profile" data-profile-id="${escapeAttr(profile.id)}">Excluir</button>` : ""}
                  ${canManageHiddenItems() ? `<button class="button" type="button" data-management-action="toggle-profile-hidden" data-profile-id="${escapeAttr(profile.id)}">${profile.hidden ? "Desocultar" : "Ocultar"}</button>` : ""}
                </div></td>
              </tr>`).join("") || '<tr><td colspan="8"><div class="management-empty">Nenhum perfil encontrado.</div></td></tr>'}</tbody></table></div>
          </section>`;
      }

      function renderManagementPlans() {
        if (activeManagementPlansView === "templates") return renderManagementActionPlanTemplates();
        const term = normalizeText(managementFilters.plans);
        const profiles = getAllManagementProfiles();
        const folders = [...new Set(profiles.flatMap(profile => (profile.folders || []).map(folder => folder.name)))].sort();
        const plans = getAllManagementPlans().filter(item => {
          if (term && !normalizeText(`${item.plan.title} ${item.plan.company} ${item.profile.name} ${item.folderName}`).includes(term)) return false;
          if (managementFilters.planProfile && item.profile.id !== managementFilters.planProfile) return false;
          if (managementFilters.planFolder && item.folderName !== managementFilters.planFolder) return false;
          return true;
        });
        els.managementContent.innerHTML = `${managementPlansSubtabs()}
          <section class="management-panel">
            <div class="management-panel-head"><h2>Lista geral de planos</h2><span class="management-status-badge">${plans.length} plano(s)</span></div>
            <div class="management-filters">
              <div class="management-filter"><label for="managementPlanSearch">Buscar plano</label><input id="managementPlanSearch" data-management-filter="plans" value="${escapeAttr(managementFilters.plans)}" placeholder="Título, empresa, perfil ou pasta..."></div>
              <div class="management-filter"><label for="managementPlanProfile">Perfil</label><select id="managementPlanProfile" data-management-filter="planProfile"><option value="">Todos</option>${profiles.map(profile => `<option value="${escapeAttr(profile.id)}" ${managementFilters.planProfile === profile.id ? "selected" : ""}>${escapeHtml(profile.name)}</option>`).join("")}</select></div>
              <div class="management-filter"><label for="managementPlanFolder">Pasta</label><select id="managementPlanFolder" data-management-filter="planFolder"><option value="">Todas</option>${folders.map(folder => `<option value="${escapeAttr(folder)}" ${managementFilters.planFolder === folder ? "selected" : ""}>${escapeHtml(folder)}</option>`).join("")}</select></div>
            </div>
            <div class="management-table-wrap"><table class="management-table"><thead><tr><th>Plano</th><th>Perfil</th><th>Pasta</th><th>Criado</th><th>Última edição</th><th>Ações</th><th>Conclusão</th><th>Ação segura</th></tr></thead>
            <tbody>${plans.map(item => `
              <tr>
                <td><strong>${escapeHtml(item.plan.title || "Sem título")}</strong><small>${escapeHtml(item.plan.company || item.plan.data?.meta?.company || "-")}</small></td>
                <td>${escapeHtml(item.profile.name || "-")}</td><td>${escapeHtml(item.folderName)}</td><td>${escapeHtml(formatDateTime(item.plan.createdAt))}</td><td>${escapeHtml(formatDateTime(item.plan.updatedAt))}</td>
                <td>${item.actionsCount}</td><td>${item.progress}%</td>
                <td><div class="management-item-actions">
                  <button class="button" type="button" data-management-action="${canManagePlans() ? "open-plan" : "locate-plan"}" data-profile-id="${escapeAttr(item.profile.id)}" data-plan-id="${escapeAttr(item.plan.id)}">${canManagePlans() ? "Abrir" : "Localizar"}</button>
                  ${canManagePlans() ? `<button class="button" type="button" data-management-action="rename-plan" data-profile-id="${escapeAttr(item.profile.id)}" data-plan-id="${escapeAttr(item.plan.id)}">Renomear</button><button class="button" type="button" data-management-action="duplicate-plan" data-profile-id="${escapeAttr(item.profile.id)}" data-plan-id="${escapeAttr(item.plan.id)}">Duplicar</button><button class="button" type="button" data-management-action="copy-plan" data-profile-id="${escapeAttr(item.profile.id)}" data-plan-id="${escapeAttr(item.plan.id)}">Copiar</button><button class="button" type="button" data-management-action="move-plan" data-profile-id="${escapeAttr(item.profile.id)}" data-plan-id="${escapeAttr(item.plan.id)}">Mover</button><button class="button danger" type="button" data-management-action="delete-plan" data-profile-id="${escapeAttr(item.profile.id)}" data-plan-id="${escapeAttr(item.plan.id)}">Excluir</button>` : ""}
                </div></td>
              </tr>`).join("") || '<tr><td colspan="8"><div class="management-empty">Nenhum plano encontrado.</div></td></tr>'}</tbody></table></div>
          </section>`;
      }

      function managementPlansSubtabs() {
        return `<nav class="management-subtabs" aria-label="Áreas de Planos"><button class="management-subtab ${activeManagementPlansView === "plans" ? "is-active" : ""}" data-management-action="plans-view" data-plans-view="plans">Planos</button><button class="management-subtab ${activeManagementPlansView === "templates" ? "is-active" : ""}" data-management-action="plans-view" data-plans-view="templates">Templates</button></nav>`;
      }

      function renderManagementActionPlanTemplates() {
        const term = normalizeText(managementFilters.templates);
        const status = managementFilters.templateStatus;
        const templates = normalizeActionPlanTemplates(app.actionPlanTemplates).filter(template => {
          if (term && !normalizeText(`${template.name} ${template.description} ${template.category}`).includes(term)) return false;
          if (status === "active" && !template.active) return false;
          if (status === "inactive" && template.active) return false;
          return true;
        });
        els.managementContent.innerHTML = `${managementPlansSubtabs()}
          <section class="management-panel">
            <div class="management-panel-head"><h2>Templates do Plano de Ação</h2><div class="management-item-actions">${canManageActionPlanTemplates() ? '<button class="button primary" data-management-action="new-action-template">Novo template</button>' : ""}<span class="management-status-badge">${templates.length} template(s)</span></div></div>
            <div class="management-filters">
              <div class="management-filter"><label>Buscar template</label><input data-management-filter="templates" value="${escapeAttr(managementFilters.templates)}" placeholder="Nome, categoria ou descrição..."></div>
              <div class="management-filter"><label>Status</label><select data-management-filter="templateStatus"><option value="all">Todos</option><option value="active" ${status === "active" ? "selected" : ""}>Ativos</option><option value="inactive" ${status === "inactive" ? "selected" : ""}>Inativos</option></select></div>
            </div>
            <div class="management-table-wrap"><table class="management-table"><thead><tr><th>Template</th><th>Categoria</th><th>Ações</th><th>Equipamentos</th><th>Treinamentos</th><th>Última edição</th><th>Ações</th></tr></thead><tbody>${templates.map(template => `
              <tr><td><strong>${escapeHtml(template.name)}</strong><small>${escapeHtml(template.description || "")}${template.systemDefault ? " · Padrão do sistema" : ""}${template.active ? "" : " · Inativo"}</small></td><td>${escapeHtml(template.category)}</td><td>${template.rows.length}</td><td>${template.equipmentRows.length}</td><td>${template.trainingRows.length}</td><td>${escapeHtml(formatDateTime(template.updatedAt))}</td><td><div class="management-item-actions">
                ${canManageActionPlanTemplates() ? `<button class="button" data-management-action="edit-action-template" data-template-id="${escapeAttr(template.id)}">Alterar</button><button class="button" data-management-action="duplicate-action-template" data-template-id="${escapeAttr(template.id)}">Duplicar</button><button class="button" data-management-action="toggle-action-template" data-template-id="${escapeAttr(template.id)}">${template.active ? "Desativar" : "Ativar"}</button>${template.systemDefault ? `<button class="button" data-management-action="restore-default-action-template" data-template-id="${escapeAttr(template.id)}">Restaurar padrão</button>` : `<button class="button danger" data-management-action="delete-action-template" data-template-id="${escapeAttr(template.id)}">Excluir</button>`}` : ""}
              </div></td></tr>`).join("") || '<tr><td colspan="7"><div class="management-empty">Nenhum template encontrado.</div></td></tr>'}</tbody></table></div>
          </section>`;
      }

      function renderManagementFolders() {
        const term = normalizeText(managementFilters.folders);
        const folders = getAllManagementProfiles().flatMap(profile => getManagementFolders(profile).map(folder => ({
          profile,
          folder,
          plansCount: (profile.plans || []).filter(plan => plan.folderId === folder.id).length
        }))).filter(item => !term || normalizeText(`${item.folder.name} ${item.profile.name}`).includes(term));
        els.managementContent.innerHTML = `
          <section class="management-panel">
            <div class="management-panel-head"><h2>Lista geral de pastas</h2><div class="management-item-actions">${canManageFolders() ? '<button class="button primary" type="button" data-management-action="new-folder">Nova pasta</button>' : ""}<span class="management-status-badge">${folders.length} pasta(s)</span></div></div>
            <div class="management-filters"><div class="management-filter"><label>Buscar pasta</label><input data-management-filter="folders" value="${escapeAttr(managementFilters.folders)}" placeholder="Pasta ou perfil..."></div></div>
            <div class="management-table-wrap"><table class="management-table"><thead><tr><th>Pasta</th><th>Perfil dono</th><th>Planos</th><th>Visibilidade</th><th>Ações</th></tr></thead>
            <tbody>${folders.map(item => `
              <tr>
                <td><strong>${escapeHtml(item.folder.name)}</strong><small>${item.folder.isDefault ? "Pasta padrão" : escapeHtml(item.folder.id)}</small></td>
                <td>${escapeHtml(item.profile.name || "-")}<small>${escapeHtml(item.profile.email || "-")}</small></td>
                <td>${item.plansCount}</td><td>${item.folder.hidden ? "Oculta" : "Visível"}</td>
                <td><div class="management-item-actions">
                  ${canManageFolders() ? `<button class="button" type="button" data-management-action="open-folder" data-profile-id="${escapeAttr(item.profile.id)}" data-folder-id="${escapeAttr(item.folder.id)}">Abrir</button>` : ""}
                  ${canManageFolders() && !item.folder.isDefault ? `<button class="button" type="button" data-management-action="edit-folder" data-profile-id="${escapeAttr(item.profile.id)}" data-folder-id="${escapeAttr(item.folder.id)}">Editar</button><button class="button danger" type="button" data-management-action="delete-folder" data-profile-id="${escapeAttr(item.profile.id)}" data-folder-id="${escapeAttr(item.folder.id)}">Excluir</button>` : ""}
                  ${canManageHiddenItems() && !item.folder.isDefault ? `<button class="button" type="button" data-management-action="toggle-folder-hidden" data-profile-id="${escapeAttr(item.profile.id)}" data-folder-id="${escapeAttr(item.folder.id)}">${item.folder.hidden ? "Desocultar" : "Ocultar"}</button>` : ""}
                </div></td>
              </tr>`).join("") || '<tr><td colspan="5"><div class="management-empty">Nenhuma pasta encontrada.</div></td></tr>'}</tbody></table></div>
          </section>`;
      }

      function getProcedureLibrary() {
        app.procedureLibrary = normalizeProcedureLibrary(app.procedureLibrary);
        return app.procedureLibrary;
      }

      function getProcedureCategory(snapshot, categoryId = activeProcedureCategoryId) {
        return snapshot?.categories?.find(category => category.id === categoryId) || null;
      }

      function ensureProcedureDraft() {
        if (!canEditProcedureDrafts()) {
          showToast("Você não tem permissão para editar procedimentos.", "danger");
          return null;
        }
        const library = getProcedureLibrary();
        if (!library.draft) {
          const now = new Date().toISOString();
          library.draft = normalizeProcedureSnapshot({
            ...deepClone(library.published),
            id: createId(),
            status: "draft",
            versionLabel: "",
            baseVersionId: library.published.id,
            createdAt: now,
            updatedAt: now,
            updatedBy: currentUser?.email || "",
            publishedAt: "",
            publishedBy: "",
            changeSummary: ""
          });
          library.updatedAt = now;
          library.updatedBy = currentUser?.email || "";
          recordActivity("Criou rascunho de Procedimentos", `Rascunho criado a partir de ${library.published.versionLabel || "versão publicada"}.`);
          saveManagementChanges();
        }
        return library.draft;
      }

      function touchProcedureDraft() {
        const library = getProcedureLibrary();
        if (!library.draft) return;
        const now = new Date().toISOString();
        library.draft.updatedAt = now;
        library.draft.updatedBy = currentUser?.email || "";
        library.updatedAt = now;
        library.updatedBy = currentUser?.email || "";
      }

      function getProcedurePhysicalReports(snapshot, includeDeleted = false) {
        return (getProcedureCategory(snapshot, "laudos-fisicos")?.items || []).filter(report => includeDeleted || !report.deleted).sort((a, b) => a.order - b.order);
      }

      function getProcedureReport(snapshot, reportId = activePhysicalReportId) {
        return getProcedurePhysicalReports(snapshot).find(report => report.id === reportId) || null;
      }

      function getProcedurePreviewSnapshot(library = getProcedureLibrary()) {
        if (activeProcedurePreviewSource === "published") return library.published;
        if (activeProcedurePreviewSource === "version") return library.versions.find(item => item.id === activeProcedureVersionPreviewId)?.snapshot || library.published;
        return library.draft || library.published;
      }

      function validatePhysicalReportFlow(report) {
        const errors = [];
        const warnings = [];
        if (!report?.title?.trim()) errors.push("O risco precisa ter título.");
        const nodes = report?.nodes || {};
        const ids = Object.keys(nodes);
        if (!report?.rootNodeId) errors.push("Defina o nó inicial.");
        else if (!nodes[report.rootNodeId]) errors.push("O nó inicial não existe.");
        ids.forEach(id => {
          const node = nodes[id];
          if (!node.id || node.id !== id) errors.push(`O nó ${id} possui ID inconsistente.`);
          if (!["question", "info", "result"].includes(node.type)) errors.push(`O nó ${id} possui tipo inválido.`);
          if (node.type === "result") {
            if (!(node.blocks || []).some(block => block.text.trim())) errors.push(`O resultado ${id} precisa de ao menos um bloco com texto.`);
          } else {
            if (!node.text.trim()) warnings.push(`O nó ${id} não possui texto principal.`);
            if (!(node.options || []).length) warnings.push(`O nó ${id} não possui opções.`);
            (node.options || []).forEach(option => {
              if (!option.label.trim()) errors.push(`Há uma opção sem rótulo no nó ${id}.`);
              if (!option.nextNodeId || !nodes[option.nextNodeId]) errors.push(`A opção "${option.label || "sem rótulo"}" do nó ${id} aponta para um nó inexistente.`);
            });
          }
        });
        if (nodes[report?.rootNodeId]) {
          const reached = new Set();
          const visiting = new Set();
          let cycle = false;
          const walk = id => {
            if (visiting.has(id)) {
              cycle = true;
              return;
            }
            if (reached.has(id) || !nodes[id]) return;
            reached.add(id);
            visiting.add(id);
            (nodes[id].options || []).forEach(option => walk(option.nextNodeId));
            visiting.delete(id);
          };
          walk(report.rootNodeId);
          ids.filter(id => !reached.has(id)).forEach(id => warnings.push(`O nó ${id} está órfão e não é alcançado pelo fluxo inicial.`));
          if (cycle) warnings.push("O fluxo possui ciclo. Revise para evitar navegação infinita.");
        }
        return { errors, warnings };
      }

      function validateProcedureLibrary(snapshot) {
        const errors = [];
        const warnings = [];
        if (!snapshot?.title?.trim()) errors.push("A biblioteca precisa ter título.");
        if (!snapshot?.categories?.length) errors.push("A biblioteca precisa ter ao menos uma categoria.");
        (snapshot?.categories || []).forEach(category => {
          if (!category.title.trim()) errors.push(`A categoria ${category.id} precisa ter título.`);
          (category.items || []).filter(report => !report.deleted).forEach(report => {
            const result = validatePhysicalReportFlow(report);
            result.errors.forEach(message => errors.push(`${report.title}: ${message}`));
            result.warnings.forEach(message => warnings.push(`${report.title}: ${message}`));
          });
        });
        return { errors, warnings };
      }

      function renderProcedureValidation(result) {
        const messages = [
          ...result.errors.map(message => ({ message, error: true })),
          ...result.warnings.map(message => ({ message, error: false }))
        ];
        if (!messages.length) return '<div class="management-empty">Validação concluída sem erros ou avisos.</div>';
        return `<ul class="procedure-validation-list">${messages.map(item => `<li class="${item.error ? "is-error" : ""}">${escapeHtml(item.error ? "Erro: " : "Aviso: ")}${escapeHtml(item.message)}</li>`).join("")}</ul>`;
      }

      function renderManagementProcedures() {
        if (!canManageProcedures()) {
          activeManagementTab = "dashboard";
          return renderManagementDashboard();
        }
        const views = [
          ["overview", "Visão geral"],
          ["physical", "Laudos Físicos"],
          ["preview", "Prévia"],
          ["publish", "Publicação"],
          ["versions", "Histórico / Versões"],
          ["backup", "Backup"]
        ];
        const body = activeProcedureAdminView === "physical" ? renderProcedurePhysicalReportsEditor()
          : activeProcedureAdminView === "preview" ? renderProcedurePreview()
          : activeProcedureAdminView === "publish" ? renderProcedurePublication()
          : activeProcedureAdminView === "versions" ? renderProcedureVersions()
          : activeProcedureAdminView === "backup" ? renderProcedureBackup()
          : renderProcedureOverview();
        els.managementContent.innerHTML = `
          <section class="management-panel">
            <div class="management-panel-head"><div><h2>Procedimentos</h2><small>Biblioteca publicada, rascunhos e fluxos técnicos.</small></div><span class="management-status-badge">Fase 3</span></div>
            <nav class="procedure-admin-subtabs">${views.map(([id, label]) => `<button class="management-tab ${activeProcedureAdminView === id ? "is-active" : ""}" type="button" data-management-action="procedure-view" data-procedure-view="${id}">${label}</button>`).join("")}</nav>
            ${body}
          </section>`;
      }

      function renderProcedureOverview() {
        const library = getProcedureLibrary();
        const publishedReports = getProcedurePhysicalReports(library.published);
        return `<div class="procedure-admin-layout">
          ${library.draft ? '<div class="procedure-admin-card procedure-danger-zone"><strong>Existem alterações em rascunho ainda não publicadas.</strong></div>' : ""}
          <div class="management-dashboard-grid">
            ${managementMetric("Versão publicada", library.published.versionLabel || "-")}
            ${managementMetric("Última publicação", library.published.publishedAt ? formatDateTime(library.published.publishedAt) : "-")}
            ${managementMetric("Publicado por", library.published.publishedBy || "-")}
            ${managementMetric("Rascunho pendente", library.draft ? "Sim" : "Não")}
            ${managementMetric("Categorias", library.published.categories.length)}
            ${managementMetric("Riscos ativos", publishedReports.filter(report => report.active).length)}
            ${managementMetric("Riscos inativos", publishedReports.filter(report => !report.active).length)}
            ${managementMetric("Versões salvas", library.versions.length)}
          </div>
          <div class="procedure-admin-card"><div class="management-item-actions">
            ${canEditProcedureDrafts() ? `<button class="button primary" type="button" data-management-action="${library.draft ? "procedure-view" : "create-procedure-draft"}" ${library.draft ? 'data-procedure-view="physical"' : ""}>${library.draft ? "Editar rascunho" : "Criar rascunho"}</button>` : ""}
            <button class="button" type="button" data-management-action="preview-published-procedures">Pré-visualizar publicado</button>
            ${library.draft ? '<button class="button" type="button" data-management-action="preview-draft-procedures">Pré-visualizar rascunho</button>' : ""}
            ${library.draft && canPublishProcedures() ? '<button class="button primary" type="button" data-management-action="publish-procedure-draft">Publicar alterações</button>' : ""}
            ${canExportProcedureLibrary() ? '<button class="button" type="button" data-management-action="export-procedure-all">Exportar JSON</button>' : ""}
            ${canImportProcedureLibrary() ? '<button class="button" type="button" data-management-action="import-procedure-library">Importar JSON</button>' : ""}
          </div></div>
        </div>`;
      }

      function renderProcedurePhysicalReportsEditor() {
        const library = getProcedureLibrary();
        const draft = library.draft;
        if (!draft) return `<div class="management-empty">Crie um rascunho para editar Laudos Físicos.${canEditProcedureDrafts() ? '<br><button class="button primary" type="button" data-management-action="create-procedure-draft">Criar rascunho</button>' : ""}</div>`;
        const reports = getProcedurePhysicalReports(draft, true);
        if (!activePhysicalReportId || !reports.some(report => report.id === activePhysicalReportId)) activePhysicalReportId = reports[0]?.id || null;
        const activeReport = getProcedureReport(draft);
        return `<div class="procedure-admin-layout">
          <div class="management-panel-head"><div class="management-item-actions">
            ${canEditProcedureDrafts() ? '<button class="button primary" type="button" data-management-action="new-physical-report">Novo risco físico</button>' + (canImportProcedureLibrary() ? '<button class="button" type="button" data-management-action="import-physical-report">Importar risco JSON</button>' : "") + '<button class="button" type="button" data-management-action="save-procedure-draft">Salvar rascunho</button>' : ""}
          </div><span class="management-status-badge">${reports.length} risco(s)</span></div>
          <div class="procedure-admin-list">${reports.map(report => {
            const validation = validatePhysicalReportFlow(report);
            return `<article class="procedure-admin-card ${report.id === activePhysicalReportId ? "is-selected" : ""}">
              <div class="management-panel-head"><div><strong>${escapeHtml(report.title)}</strong><small>${report.deleted ? "Na lixeira do rascunho" : report.active ? "Ativo" : "Inativo"} · ${Object.keys(report.nodes).length} nós · ${validation.errors.length} erro(s)</small></div>
                <div class="management-item-actions">
                  <button class="button" type="button" data-management-action="edit-physical-report" data-report-id="${escapeAttr(report.id)}">Editar fluxo</button>
                  ${canExportProcedureLibrary() ? `<button class="button" type="button" data-management-action="export-physical-report" data-report-id="${escapeAttr(report.id)}">Exportar</button>` : ""}
                  ${canEditProcedureDrafts() ? report.deleted ? `<button class="button" type="button" data-management-action="restore-physical-report" data-report-id="${escapeAttr(report.id)}">Restaurar risco</button>` : `<button class="button" type="button" data-management-action="duplicate-physical-report" data-report-id="${escapeAttr(report.id)}">Duplicar</button><button class="button" type="button" data-management-action="toggle-physical-report" data-report-id="${escapeAttr(report.id)}">${report.active ? "Desativar" : "Ativar"}</button><button class="button" type="button" data-management-action="move-physical-report-up" data-report-id="${escapeAttr(report.id)}">↑</button><button class="button" type="button" data-management-action="move-physical-report-down" data-report-id="${escapeAttr(report.id)}">↓</button><button class="button danger" type="button" data-management-action="delete-physical-report" data-report-id="${escapeAttr(report.id)}">Excluir</button>` : ""}
                </div>
              </div>
            </article>`;
          }).join("") || '<div class="management-empty">Nenhum risco cadastrado.</div>'}</div>
          ${activeReport ? renderPhysicalReportEditor(activeReport) : ""}
        </div>`;
      }

      function renderPhysicalReportEditor(report) {
        const nodeIds = Object.keys(report.nodes);
        const validation = validatePhysicalReportFlow(report);
        const disabled = canEditProcedureDrafts() ? "" : "disabled";
        return `<section class="procedure-admin-card procedure-admin-editor" data-procedure-report-id="${escapeAttr(report.id)}">
          <div class="management-panel-head"><h3>Editar fluxo: ${escapeHtml(report.title)}</h3><div class="management-item-actions"><button class="button" type="button" data-management-action="preview-report-flow" data-report-id="${escapeAttr(report.id)}">Pré-visualizar fluxo</button>${canEditProcedureDrafts() ? '<button class="button primary" type="button" data-management-action="save-procedure-draft">Salvar rascunho</button><button class="button" type="button" data-management-action="add-flow-node">Adicionar nó</button>' : ""}</div></div>
          <div class="procedure-admin-grid">
            ${procedureField("Título", "title", report.title, "input", disabled)}
            ${procedureField("Subtítulo", "subtitle", report.subtitle, "input", disabled)}
            ${procedureField("Descrição", "description", report.description, "textarea", disabled, true)}
            ${procedureField("Tags separadas por vírgula", "tags", report.tags.join(", "), "input", disabled)}
            ${procedureField("Nó inicial", "rootNodeId", report.rootNodeId, "select", disabled, false, nodeIds)}
            ${procedureField("Observação administrativa", "adminNote", report.adminNote, "textarea", disabled, true)}
          </div>
          <div class="procedure-node-list">${nodeIds.map(nodeId => renderProcedureNodeEditor(report, report.nodes[nodeId], nodeIds, disabled)).join("")}</div>
          <div><h3>Validação do fluxo</h3>${renderProcedureValidation(validation)}</div>
        </section>`;
      }

      function procedureField(label, field, value, type = "input", disabled = "", wide = false, options = []) {
        const attrs = `data-procedure-report-field="${field}" ${disabled}`;
        const control = type === "textarea"
          ? `<textarea ${attrs}>${escapeHtml(value)}</textarea>`
          : type === "select"
            ? `<select ${attrs}>${options.map(option => `<option value="${escapeAttr(option)}" ${option === value ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select>`
            : `<input ${attrs} value="${escapeAttr(value)}">`;
        return `<div class="procedure-field ${wide ? "is-wide" : ""}"><label>${escapeHtml(label)}</label>${control}</div>`;
      }

      function renderProcedureNodeEditor(report, node, nodeIds, disabled) {
        return `<article class="procedure-node-card ${report.rootNodeId === node.id ? "is-root" : ""}" data-procedure-node-id="${escapeAttr(node.id)}">
          <div class="management-panel-head"><div><strong>${escapeHtml(node.title || node.id)}</strong><small>${escapeHtml(node.id)} · ${escapeHtml(node.type)}${report.rootNodeId === node.id ? " · Nó inicial" : ""}</small></div>
            ${canEditProcedureDrafts() ? `<div class="management-item-actions"><button class="button" type="button" data-management-action="move-flow-node-up" data-node-id="${escapeAttr(node.id)}">↑</button><button class="button" type="button" data-management-action="move-flow-node-down" data-node-id="${escapeAttr(node.id)}">↓</button><button class="button" type="button" data-management-action="set-root-node" data-node-id="${escapeAttr(node.id)}">Definir inicial</button><button class="button" type="button" data-management-action="duplicate-flow-node" data-node-id="${escapeAttr(node.id)}">Duplicar</button><button class="button danger" type="button" data-management-action="delete-flow-node" data-node-id="${escapeAttr(node.id)}">Excluir</button></div>` : ""}
          </div>
          <div class="procedure-node-grid">
            <div class="procedure-field"><label>ID técnico</label><input data-procedure-node-id-field value="${escapeAttr(node.id)}" ${disabled}></div>
            <div class="procedure-field"><label>Tipo</label><select data-procedure-node-field="type" ${disabled}>${["question", "info", "result"].map(type => `<option value="${type}" ${node.type === type ? "selected" : ""}>${type}</option>`).join("")}</select></div>
            <div class="procedure-field"><label>Título</label><input data-procedure-node-field="title" value="${escapeAttr(node.title)}" ${disabled}></div>
            <div class="procedure-field"><label>Tom</label><select data-procedure-node-field="${node.type === "result" ? "tone" : "noteTone"}" ${disabled}>${["normal", "info", "warning", "danger", "success", "muted"].map(tone => `<option value="${tone}" ${(node.type === "result" ? node.tone : node.noteTone) === tone ? "selected" : ""}>${tone}</option>`).join("")}</select></div>
            <div class="procedure-field is-wide"><label>Texto principal</label><textarea data-procedure-node-field="text" ${disabled}>${escapeHtml(node.text)}</textarea></div>
            ${node.type !== "result" ? `<div class="procedure-field is-wide"><label>Nota / orientação</label><textarea data-procedure-node-field="note" ${disabled}>${escapeHtml(node.note)}</textarea></div>` : ""}
          </div>
          ${node.type === "result" ? `<div class="procedure-result-grid">${node.blocks.map((block, index) => `<div class="procedure-result-block" data-result-index="${index}">
            <div class="procedure-field"><label>Título do bloco</label><input data-result-field="title" value="${escapeAttr(block.title)}" ${disabled}></div>
            <div class="procedure-field is-wide"><label>Texto final</label><textarea data-result-field="text" ${disabled}>${escapeHtml(block.text)}</textarea></div>
            <label class="checkbox-line"><input type="checkbox" data-result-field="copyable" ${block.copyable ? "checked" : ""} ${disabled}> Copiável</label>
            ${canEditProcedureDrafts() ? `<button class="button danger" type="button" data-management-action="delete-result-block" data-node-id="${escapeAttr(node.id)}" data-result-index="${index}">Excluir bloco</button>` : ""}
          </div>`).join("")}</div>${canEditProcedureDrafts() ? `<button class="button" type="button" data-management-action="add-result-block" data-node-id="${escapeAttr(node.id)}">Adicionar bloco final</button>` : ""}`
          : `<div class="procedure-admin-list">${node.options.map((option, index) => `<div class="procedure-option-row" data-option-index="${index}">
            <div class="procedure-field"><label>Botão / resposta</label><input data-option-field="label" value="${escapeAttr(option.label)}" ${disabled}></div>
            <div class="procedure-field"><label>Tom</label><select data-option-field="tone" ${disabled}>${["success", "danger", "warning", "info", "muted"].map(tone => `<option value="${tone}" ${option.tone === tone ? "selected" : ""}>${tone}</option>`).join("")}</select></div>
            <div class="procedure-field"><label>Próximo nó</label><select data-option-field="nextNodeId" ${disabled}><option value="">Selecione...</option>${nodeIds.map(id => `<option value="${escapeAttr(id)}" ${option.nextNodeId === id ? "selected" : ""}>${escapeHtml(id)}</option>`).join("")}</select></div>
            ${canEditProcedureDrafts() ? `<button class="button danger" type="button" data-management-action="delete-flow-option" data-node-id="${escapeAttr(node.id)}" data-option-index="${index}">Excluir opção</button>` : ""}
          </div>`).join("")}</div>${canEditProcedureDrafts() ? `<button class="button" type="button" data-management-action="add-flow-option" data-node-id="${escapeAttr(node.id)}">Adicionar opção</button>` : ""}`}
        </article>`;
      }

      function renderProcedurePreview() {
        const library = getProcedureLibrary();
        const snapshot = getProcedurePreviewSnapshot(library);
        const reports = getProcedurePhysicalReports(snapshot);
        if (!activePhysicalReportId || !reports.some(report => report.id === activePhysicalReportId)) activePhysicalReportId = reports[0]?.id || null;
        const report = getProcedureReport(snapshot);
        if (!report) return '<div class="management-empty">Nenhum risco disponível para prévia.</div>';
        const path = activeFlowPreviewState[report.id] || [report.rootNodeId];
        const nodeId = path[path.length - 1];
        const node = report.nodes[nodeId] || report.nodes[report.rootNodeId];
        return `<div class="procedure-preview-shell">
          <div class="management-panel-head"><div><h3>Prévia: ${escapeHtml(report.title)}</h3><small>${activeProcedurePreviewSource === "published" ? "Publicado" : activeProcedurePreviewSource === "version" ? "Versão histórica" : "Rascunho"}</small></div><div class="management-item-actions"><select data-procedure-preview-report>${reports.map(item => `<option value="${escapeAttr(item.id)}" ${item.id === report.id ? "selected" : ""}>${escapeHtml(item.title)}</option>`).join("")}</select><button class="button" type="button" data-management-action="preview-flow-back" ${path.length <= 1 ? "disabled" : ""}>Voltar</button><button class="button" type="button" data-management-action="preview-flow-reset">Reiniciar</button></div></div>
          ${renderProcedurePreviewNode(report, node)}
        </div>`;
      }

      function renderProcedurePreviewNode(report, node) {
        if (!node) return '<div class="management-empty">Nó não encontrado.</div>';
        return `<article class="procedure-preview-node" data-node-type="${escapeAttr(node.type)}">
          <h3>${escapeHtml(node.title || report.title)}</h3>
          ${node.text ? `<p>${escapeHtml(node.text)}</p>` : ""}
          ${node.note ? `<p><strong>${escapeHtml(node.note)}</strong></p>` : ""}
          ${node.type === "result" ? node.blocks.filter(block => block.text).map((block, index) => `<div class="procedure-result-block"><strong>${escapeHtml(block.title)}</strong><p>${escapeHtml(block.text)}</p>${block.copyable ? `<button class="button" type="button" data-management-action="copy-preview-result" data-block-index="${index}">Copiar texto</button>` : ""}</div>`).join("")
            : `<div class="management-item-actions">${node.options.map(option => `<button class="button" type="button" data-management-action="preview-flow-choice" data-next-node-id="${escapeAttr(option.nextNodeId)}">${escapeHtml(option.label)}</button>`).join("")}</div>`}
        </article>`;
      }

      function renderProcedurePublication() {
        const library = getProcedureLibrary();
        const validation = library.draft ? validateProcedureLibrary(library.draft) : { errors: [], warnings: [] };
        const publishedIds = new Set(getProcedurePhysicalReports(library.published).map(report => report.id));
        const publishedMap = new Map(getProcedurePhysicalReports(library.published).map(report => [report.id, report]));
        const draftReports = library.draft ? getProcedurePhysicalReports(library.draft) : [];
        const added = draftReports.filter(report => !publishedIds.has(report.id)).length;
        const removed = getProcedurePhysicalReports(library.published).filter(report => !draftReports.some(item => item.id === report.id)).length;
        const changed = draftReports.filter(report => publishedMap.has(report.id) && JSON.stringify(report) !== JSON.stringify(publishedMap.get(report.id))).length;
        const deactivated = draftReports.filter(report => !report.active && publishedMap.get(report.id)?.active).length;
        return `<div class="procedure-admin-layout">
          <div class="procedure-admin-card"><strong>Publicação atual: ${escapeHtml(library.published.versionLabel || "-")}</strong><p>${escapeHtml(library.published.changeSummary || "Sem resumo.")}</p></div>
          ${library.draft ? `<div class="procedure-admin-card"><div class="procedure-admin-grid">${managementMetric("Riscos adicionados", added)}${managementMetric("Riscos alterados", changed)}${managementMetric("Riscos desativados", deactivated)}${managementMetric("Riscos removidos", removed)}${managementMetric("Riscos no rascunho", draftReports.length)}</div><div class="procedure-field"><label>Resumo da alteração</label><textarea id="procedureChangeSummary" placeholder="Descreva o que mudou..."></textarea></div>${renderProcedureValidation(validation)}${canPublishProcedures() ? '<button class="button primary" type="button" data-management-action="publish-procedure-draft">Publicar alterações</button>' : ""}</div>` : '<div class="management-empty">Não há rascunho para publicar.</div>'}
        </div>`;
      }

      function renderProcedureVersions() {
        const versions = [...getProcedureLibrary().versions].sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
        return `<div class="procedure-version-list">${versions.map(version => `<article class="procedure-version-card">
          <div class="management-panel-head"><div><strong>${escapeHtml(version.versionLabel)}</strong><small>${escapeHtml(formatDateTime(version.publishedAt))} · ${escapeHtml(version.publishedBy || "-")}</small></div><div class="management-item-actions"><button class="button" type="button" data-management-action="preview-procedure-version" data-version-id="${escapeAttr(version.id)}">Visualizar</button><button class="button" type="button" data-management-action="export-procedure-version" data-version-id="${escapeAttr(version.id)}">Exportar</button>${canRestoreProcedureVersions() ? `<button class="button" type="button" data-management-action="restore-procedure-version" data-version-id="${escapeAttr(version.id)}">Restaurar como rascunho</button>` : ""}${canRestoreProcedureVersions() && canPublishProcedures() ? `<button class="button primary" type="button" data-management-action="restore-publish-procedure-version" data-version-id="${escapeAttr(version.id)}">Restaurar e publicar</button>` : ""}</div></div>
          <p>${escapeHtml(version.changeSummary || "Sem resumo.")}</p>
        </article>`).join("") || '<div class="management-empty">Nenhuma versão histórica salva ainda.</div>'}</div>`;
      }

      function renderProcedureBackup() {
        const library = getProcedureLibrary();
        return `<div class="procedure-admin-layout">
          <div class="procedure-admin-card"><h3>Exportar</h3><p>Baixe dados publicados, rascunho ou o backup completo com histórico.</p><div class="management-item-actions">${canExportProcedureLibrary() ? '<button class="button" type="button" data-management-action="export-procedure-published">Exportar publicado</button><button class="button" type="button" data-management-action="export-procedure-draft" ' + (library.draft ? "" : "disabled") + '>Exportar rascunho</button><button class="button primary" type="button" data-management-action="export-procedure-all">Exportar backup completo</button>' : ""}</div></div>
          <div class="procedure-admin-card"><h3>Importar</h3><p>A importação sempre é aplicada como rascunho e nunca publica automaticamente.</p>${canImportProcedureLibrary() ? '<button class="button primary" type="button" data-management-action="import-procedure-library">Importar biblioteca JSON</button>' : ""}</div>
          ${library.draft && canEditProcedureDrafts() ? '<div class="procedure-admin-card procedure-danger-zone"><h3>Descartar rascunho</h3><p>A versão publicada continuará intacta.</p><button class="button danger" type="button" data-management-action="discard-procedure-draft">Descartar rascunho</button></div>' : ""}
        </div>`;
      }

      function handleManagementProcedureInput(event) {
        if (activeManagementTab !== "procedures") return;
        if (event.target.matches("[data-procedure-preview-report]")) {
          activePhysicalReportId = event.target.value;
          const library = getProcedureLibrary();
          const snapshot = getProcedurePreviewSnapshot(library);
          const report = getProcedureReport(snapshot, activePhysicalReportId);
          activeFlowPreviewState[activePhysicalReportId] = report ? [report.rootNodeId] : [];
          renderManagementProcedures();
          return;
        }
        if (!canEditProcedureDrafts()) return;
        const draft = getProcedureLibrary().draft;
        if (!draft) return;
        const reportElement = event.target.closest("[data-procedure-report-id]");
        const report = reportElement && getProcedureReport(draft, reportElement.dataset.procedureReportId);
        if (!report) return;
        const reportField = event.target.dataset.procedureReportField;
        if (reportField) {
          report[reportField] = reportField === "tags"
            ? event.target.value.split(",").map(item => item.trim()).filter(Boolean)
            : event.target.value;
          if (reportField === "rootNodeId") activeFlowPreviewState[report.id] = [];
        }
        const nodeElement = event.target.closest("[data-procedure-node-id]");
        const node = nodeElement && report.nodes[nodeElement.dataset.procedureNodeId];
        if (node && event.target.matches("[data-procedure-node-id-field]")) {
          const oldId = node.id;
          const nextId = event.target.value.trim().replace(/\s+/g, "-");
          if (!nextId || (nextId !== oldId && report.nodes[nextId])) {
            event.target.value = oldId;
            return showToast("Use um ID técnico único.");
          }
          if (nextId !== oldId) {
            delete report.nodes[oldId];
            node.id = nextId;
            report.nodes[nextId] = node;
            if (report.rootNodeId === oldId) report.rootNodeId = nextId;
            Object.values(report.nodes).forEach(item => (item.options || []).forEach(option => {
              if (option.nextNodeId === oldId) option.nextNodeId = nextId;
            }));
            activePhysicalReportId = report.id;
            touchProcedureDraft();
            renderManagementProcedures();
            return;
          }
        }
        if (node && event.target.dataset.procedureNodeField) {
          const field = event.target.dataset.procedureNodeField;
          node[field] = event.target.value;
          if (field === "type") {
            if (node.type === "result") {
              node.options = [];
              if (!node.blocks.length) node.blocks = [normalizeResultBlock({ title: "Conclusão", text: "" })];
            } else {
              node.blocks = [];
              if (!node.options.length) node.options = [normalizeFlowOption({ label: "PRÓXIMO", tone: "info", nextNodeId: "" })];
            }
            touchProcedureDraft();
            renderManagementProcedures();
            return;
          }
        }
        const optionElement = event.target.closest("[data-option-index]");
        if (node && optionElement && event.target.dataset.optionField) {
          const option = node.options[Number(optionElement.dataset.optionIndex)];
          if (option) option[event.target.dataset.optionField] = event.target.value;
        }
        const resultElement = event.target.closest("[data-result-index]");
        if (node && resultElement && event.target.dataset.resultField) {
          const block = node.blocks[Number(resultElement.dataset.resultIndex)];
          if (block) block[event.target.dataset.resultField] = event.target.dataset.resultField === "copyable" ? event.target.checked : event.target.value;
        }
        report.updatedAt = new Date().toISOString();
        report.updatedBy = currentUser?.email || "";
        touchProcedureDraft();
      }

      function saveProcedureDraft() {
        if (!canEditProcedureDrafts()) return showToast("Você não tem permissão para editar procedimentos.");
        const draft = getProcedureLibrary().draft;
        if (!draft) return showToast("Crie um rascunho antes de salvar.");
        touchProcedureDraft();
        const validation = validateProcedureLibrary(draft);
        recordActivity("Editou Procedimentos", `Salvou o rascunho com ${validation.errors.length} erro(s) e ${validation.warnings.length} aviso(s).`);
        saveManagementChanges();
        renderManagementProcedures();
        showToast(validation.errors.length ? "Rascunho salvo. Revise os erros antes de publicar." : "Rascunho salvo.");
      }

      function createNewPhysicalReport() {
        const draft = ensureProcedureDraft();
        if (!draft) return;
        const category = getProcedureCategory(draft, "laudos-fisicos");
        const report = createQualitativePhysicalReport(`novo-risco-${Date.now().toString(36)}`, "Novo risco físico", category.items.length + 1, "HÁ EXPOSIÇÃO HABITUAL E RELEVANTE AO AGENTE?", "Referência técnica a definir");
        report.updatedBy = currentUser?.email || "";
        category.items.push(report);
        activePhysicalReportId = report.id;
        touchProcedureDraft();
        recordActivity("Criou risco físico", report.title);
        saveManagementChanges();
        renderManagementProcedures();
      }

      function duplicatePhysicalReport(report) {
        if (!canEditProcedureDrafts()) return showToast("Você não tem permissão para editar procedimentos.");
        const draft = ensureProcedureDraft();
        if (!draft || !report) return;
        const category = getProcedureCategory(draft, "laudos-fisicos");
        const copy = normalizePhysicalReport(deepClone(report), category.items.length);
        copy.id = `${report.id}-copia-${Date.now().toString(36)}`;
        copy.title = `${report.title} (cópia)`;
        copy.order = category.items.length + 1;
        copy.createdAt = new Date().toISOString();
        copy.updatedAt = copy.createdAt;
        copy.updatedBy = currentUser?.email || "";
        category.items.push(copy);
        activePhysicalReportId = copy.id;
        touchProcedureDraft();
        recordActivity("Duplicou risco físico", copy.title);
        saveManagementChanges();
        renderManagementProcedures();
      }

      function movePhysicalReport(report, direction) {
        if (!canEditProcedureDrafts()) return showToast("Você não tem permissão para editar procedimentos.");
        const category = getProcedureCategory(getProcedureLibrary().draft, "laudos-fisicos");
        if (!category || !report) return;
        const visible = category.items.filter(item => !item.deleted).sort((a, b) => a.order - b.order);
        const index = visible.findIndex(item => item.id === report.id);
        const target = direction === "up" ? index - 1 : index + 1;
        if (index < 0 || !visible[target]) return;
        [visible[index].order, visible[target].order] = [visible[target].order, visible[index].order];
        touchProcedureDraft();
        saveManagementChanges();
        renderManagementProcedures();
      }

      function addFlowNode(report) {
        if (!canEditProcedureDrafts()) return showToast("Você não tem permissão para editar procedimentos.");
        let id = `novo-no-${Object.keys(report.nodes).length + 1}`;
        while (report.nodes[id]) id += "-novo";
        report.nodes[id] = normalizeFlowNode({ id, type: "question", title: "Nova pergunta", text: "Digite a pergunta", options: [] }, id);
        touchProcedureDraft();
        renderManagementProcedures();
      }

      function moveProcedureNode(report, nodeId, direction) {
        if (!canEditProcedureDrafts()) return showToast("Você não tem permissão para editar procedimentos.");
        const entries = Object.entries(report.nodes);
        const index = entries.findIndex(([id]) => id === nodeId);
        const target = direction === "up" ? index - 1 : index + 1;
        if (index < 0 || !entries[target]) return;
        [entries[index], entries[target]] = [entries[target], entries[index]];
        report.nodes = Object.fromEntries(entries);
        touchProcedureDraft();
        renderManagementProcedures();
      }

      async function publishProcedureDraft(changeSummary = "") {
        if (!canPublishProcedures()) return showToast("Você não tem permissão para publicar procedimentos.");
        const library = getProcedureLibrary();
        if (!library.draft) return showToast("Não há rascunho para publicar.");
        const validation = validateProcedureLibrary(library.draft);
        if (validation.errors.length) {
          activeProcedureAdminView = "publish";
          renderManagementProcedures();
          return showToast("A publicação foi bloqueada. Corrija os erros críticos indicados.");
        }
        if (validation.warnings.length && !await managementConfirm(`O rascunho possui ${validation.warnings.length} aviso(s). Deseja publicar mesmo assim?`)) return;
        const summary = changeSummary.trim() || await managementPrompt("Resumo da alteração:", "") || "Publicação de Procedimentos";
        const now = new Date().toISOString();
        if (library.published) {
          library.versions.push(normalizeProcedureVersion({
            id: createId(),
            versionLabel: library.published.versionLabel || "versão anterior",
            publishedAt: library.published.publishedAt || now,
            publishedBy: library.published.publishedBy || "",
            changeSummary: library.published.changeSummary || "",
            snapshot: deepClone(library.published)
          }));
          library.versions = library.versions.slice(-25);
        }
        const currentNumber = Number(String(library.published?.versionLabel || "v0").replace(/\D/g, "")) || 0;
        const published = normalizeProcedureSnapshot({
          ...deepClone(library.draft),
          id: createId(),
          status: "published",
          versionLabel: `v${currentNumber + 1}`,
          publishedAt: now,
          publishedBy: currentUser?.email || "",
          updatedAt: now,
          updatedBy: currentUser?.email || "",
          changeSummary: summary
        });
        library.published = published;
        library.activePublishedVersionId = published.id;
        library.draft = null;
        library.updatedAt = now;
        library.updatedBy = currentUser?.email || "";
        recordActivity("Publicou Procedimentos", `${published.versionLabel}: ${summary}`);
        saveManagementChanges();
        loadProceduresFrame(true);
        activeProcedureAdminView = "overview";
        renderManagementProcedures();
        showToast(`Procedimentos publicados como ${published.versionLabel}.`);
      }

      async function restoreProcedureVersionAsDraft(versionId, publishAfter = false) {
        if (!canRestoreProcedureVersions()) return showToast("Você não tem permissão para restaurar versões.");
        const library = getProcedureLibrary();
        const version = library.versions.find(item => item.id === versionId);
        if (!version) return;
        if (library.draft && !await managementConfirm("Substituir o rascunho atual pela versão selecionada?")) return;
        const now = new Date().toISOString();
        library.draft = normalizeProcedureSnapshot({
          ...deepClone(version.snapshot),
          id: createId(),
          status: "draft",
          versionLabel: "",
          baseVersionId: version.snapshot.id,
          createdAt: now,
          updatedAt: now,
          updatedBy: currentUser?.email || "",
          publishedAt: "",
          publishedBy: ""
        });
        touchProcedureDraft();
        recordActivity("Restaurou versão de Procedimentos", `Restaurou ${version.versionLabel} como rascunho.`);
        saveManagementChanges();
        if (publishAfter) return publishProcedureDraft(`Restauração da versão ${version.versionLabel}`);
        activeProcedureAdminView = "physical";
        renderManagementProcedures();
      }

      function exportProcedureJson(payload, fileName, action = "Exportou Procedimentos") {
        if (!canExportProcedureLibrary()) return showToast("Você não tem permissão para exportar Procedimentos.");
        downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" }), fileName);
        recordActivity(action, fileName);
        saveApp({ activityId: app.activityLog[0]?.id });
      }

      function importProcedureJson(mode = "library") {
        if (!canImportProcedureLibrary()) return showToast("Você não tem permissão para importar Procedimentos.");
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json,.json";
        input.addEventListenerasync ("change", async () => {
          const file = input.files?.[0];
          if (!file) return;
          try {
            const raw = JSON.parse(await file.text());
            if (mode === "report") {
              const draft = ensureProcedureDraft();
              const category = getProcedureCategory(draft, "laudos-fisicos");
              const report = normalizePhysicalReport(raw.report || raw);
              if (!await managementConfirm(`Importar o risco "${report.title}" como rascunho?`)) return;
              if (category.items.some(item => item.id === report.id)) report.id = `${report.id}-importado-${Date.now().toString(36)}`;
              report.order = category.items.length + 1;
              category.items.push(report);
              activePhysicalReportId = report.id;
              touchProcedureDraft();
              recordActivity("Importou risco físico", report.title);
            } else {
              const snapshot = raw.published || raw.draft || raw.snapshot || raw;
              const normalized = normalizeProcedureSnapshot({ ...snapshot, status: "draft" });
              const validation = validateProcedureLibrary(normalized);
              if (validation.errors.length && !await managementConfirm(`O arquivo possui ${validation.errors.length} erro(s). Importar como rascunho para correção?`)) return;
              if (!validation.errors.length && !await managementConfirm(`Importar ${normalized.categories.length} categoria(s) como rascunho?`)) return;
              const library = getProcedureLibrary();
              library.draft = normalized;
              library.draft.id = createId();
              library.draft.baseVersionId = library.published.id;
              library.draft.updatedBy = currentUser?.email || "";
              touchProcedureDraft();
              recordActivity("Importou Procedimentos", file.name);
            }
            saveManagementChanges();
            activeProcedureAdminView = "physical";
            renderManagementProcedures();
            showToast("Importação aplicada como rascunho.");
          } catch (error) {
            console.error(error);
            showToast("Não foi possível importar o JSON.");
          }
        }, { once: true });
        input.click();
      }

      function suggestionDateParts(value) {
        const date = new Date(value || Date.now());
        return {
          date: date.toLocaleDateString("pt-BR"),
          weekday: date.toLocaleDateString("pt-BR", { weekday: "long" }),
          time: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        };
      }

      function refreshSuggestionSurfaces() {
        if (selectedPortalApp === "management" && activeManagementTab === "suggestions") {
          renderManagementSuggestions();
          return;
        }
        renderAppSelectorImprovements();
      }

      function suggestionStatusLabel(status) {
        return ({ open: "Pendente", resolved: "Resolvida", rejected: "Rejeitada", archived: "Arquivada" })[status] || status;
      }

      function suggestionReportStatusLabel(status) {
        return ({ draft: "Rascunho", sent: "Enviado", seen: "Visto" })[status] || status;
      }

      function defaultSuggestionTechnicalMessage(suggestion) {
        const applied = suggestionDateParts(new Date());
        return `Parecer técnico:

Após análise da sugestão encaminhada, foi verificado que a melhoria proposta é pertinente para o funcionamento do SATS e foi aceita para implementação.

A sugestão foi aplicada ao sistema com o objetivo de melhorar a experiência de uso, organização das informações e eficiência no fluxo de trabalho.

Data da aplicação: ${applied.date}
Dia: ${applied.weekday}
Horário da aplicação: ${applied.time}
Responsável pela aplicação: ${currentUser?.email || "Administrador SATS"}

Agradecemos pela contribuição. A participação dos usuários ajuda diretamente na evolução do sistema.`;
      }

      function buildSuggestionResolutionReport(suggestion, technicalMessage = "") {
        const requested = suggestionDateParts(suggestion.createdAt);
        const resolved = suggestionDateParts(new Date());
        const previous = suggestion.resolutionReport || {};
        return normalizeSuggestionResolutionReport({
          ...previous,
          id: previous.id || createId(),
          suggestionId: suggestion.id,
          requestDate: requested.date,
          requestWeekday: requested.weekday,
          requestTime: requested.time,
          requesterName: suggestion.requesterName,
          requesterEmail: suggestion.requesterEmail,
          requesterProfileId: suggestion.requesterProfileId,
          originalSuggestionText: suggestion.text,
          technicalMessage: technicalMessage || previous.technicalMessage || defaultSuggestionTechnicalMessage(suggestion),
          resolvedDate: resolved.date,
          resolvedWeekday: resolved.weekday,
          resolvedTime: resolved.time,
          resolvedBy: currentUser?.email || ""
        }, suggestion);
      }

      function openSuggestionResolutionReport(suggestion) {
        if (!canManageSuggestions()) return showToast("Você não tem permissão para gerenciar sugestões.", "danger");
        const report = buildSuggestionResolutionReport(suggestion);
        const request = suggestionDateParts(suggestion.createdAt);
        document.getElementById("suggestionReportSuggestionId").value = suggestion.id;
        document.getElementById("suggestionReportMessage").value = report.technicalMessage;
        document.getElementById("suggestionReportRequestHeader").innerHTML = `
          <div><span>Data da solicitação</span><strong>${escapeHtml(request.date)} · ${escapeHtml(request.weekday)} · ${escapeHtml(request.time)}</strong></div>
          <div><span>Solicitante</span><strong>${escapeHtml(suggestion.requesterName || "Sem perfil")} · ${escapeHtml(suggestion.requesterEmail || "E-mail não informado")}</strong></div>
          <div style="grid-column:1/-1"><span>Texto original</span><strong>${escapeHtml(suggestion.text)}</strong></div>
          ${suggestion.attachments[0] ? `<div style="grid-column:1/-1"><span>Anexo</span>${suggestionAttachmentHtml(suggestion.attachments[0])}</div>` : ""}`;
        openModal("suggestionReportModal");
      }

      function saveSuggestionResolutionDraft() {
        const suggestion = app.improvementSuggestions.find(item => item.id === document.getElementById("suggestionReportSuggestionId").value);
        if (!suggestion || !canManageSuggestions()) return showToast("Sugestão não encontrada ou acesso negado.", "danger");
        suggestion.resolutionReport = buildSuggestionResolutionReport(suggestion, document.getElementById("suggestionReportMessage").value.trim());
        suggestion.resolutionReport.status = "draft";
        suggestion.updatedAt = new Date().toISOString();
        recordActivity("Salvou rascunho de relatório", suggestion.text.slice(0, 180));
        saveApp({ improvements: true });
        closeModal("suggestionReportModal");
        refreshSuggestionSurfaces();
        showToast("Rascunho do relatório salvo.", "success");
      }

      function awardSuggestionRankingPoint(suggestion, acceptedAt) {
        const ranking = normalizeSuggestionWeeklyRanking(app.suggestionWeeklyRanking);
        const profile = suggestionProfile(suggestion);
        const email = suggestion.requesterEmail || profile?.email || "";
        const existing = ranking.entries.find(entry => (suggestion.requesterProfileId && entry.profileId === suggestion.requesterProfileId) || normalizeEmail(entry.email) === normalizeEmail(email));
        if (existing) {
          existing.count += 1;
          existing.lastAcceptedAt = acceptedAt;
          existing.name = suggestion.requesterName || profile?.name || existing.name;
          existing.profileId = suggestion.requesterProfileId || profile?.id || existing.profileId;
        } else {
          ranking.entries.push({ email, profileId: suggestion.requesterProfileId || profile?.id || "", name: suggestion.requesterName || profile?.name || "", count: 1, lastAcceptedAt: acceptedAt });
        }
        app.suggestionWeeklyRanking = normalizeSuggestionWeeklyRanking(ranking);
      }

      function sendSuggestionResolutionReport(event) {
        event.preventDefault();
        const suggestion = app.improvementSuggestions.find(item => item.id === document.getElementById("suggestionReportSuggestionId").value);
        if (!suggestion || !canManageSuggestions()) return showToast("Sugestão não encontrada ou acesso negado.", "danger");
        const now = new Date().toISOString();
        const firstAcceptance = suggestion.status !== "resolved" || !suggestion.resolutionReport?.sentAt;
        const report = buildSuggestionResolutionReport(suggestion, document.getElementById("suggestionReportMessage").value.trim());
        report.status = "sent";
        report.resolvedAt = now;
        report.sentAt = now;
        report.sentTo = suggestion.requesterEmail;
        report.seenAt = "";
        suggestion.resolutionReport = report;
        suggestion.status = "resolved";
        suggestion.resolvedAt = now;
        suggestion.resolvedBy = currentUser?.email || "";
        suggestion.rejectedAt = "";
        suggestion.rejectedBy = "";
        suggestion.rejectionReport = null;
        suggestion.updatedAt = now;
        app.suggestionNotifications = normalizeSuggestionNotifications(app.suggestionNotifications);
        const notification = app.suggestionNotifications.find(item => item.suggestionId === suggestion.id) || {
          id: createId(),
          suggestionId: suggestion.id
        };
        Object.assign(notification, {
          type: "suggestion-accepted",
          suggestionId: suggestion.id,
          reportId: report.id,
          toEmail: suggestion.requesterEmail,
          toProfileId: suggestion.requesterProfileId,
          title: "Sua Sugestão foi Aceita e Aplicada",
          subtitle: "Obrigado por ajudar a melhorar meu sistema",
          reportText: report.technicalMessage,
          createdAt: now,
          seenAt: "",
          dismissedAt: ""
        });
        if (!app.suggestionNotifications.some(item => item.id === notification.id)) app.suggestionNotifications.unshift(notification);
        if (firstAcceptance) awardSuggestionRankingPoint(suggestion, now);
        recordActivity("Resolveu sugestão", suggestion.text.slice(0, 180));
        recordActivity("Enviou relatório de sugestão aceita", suggestion.requesterEmail || suggestion.text.slice(0, 180));
        saveApp({ improvements: true });
        closeModal("suggestionReportModal");
        refreshSuggestionSurfaces();
        showToast("Relatório enviado e sugestão resolvida.", "success");
      }

      function openSuggestionRejection(suggestion) {
        if (!canManageSuggestions()) return showToast("Você não tem permissão para gerenciar sugestões.", "danger");
        document.getElementById("suggestionRejectionSuggestionId").value = suggestion.id;
        document.getElementById("suggestionRejectionReason").value = suggestion.rejectionReport?.reason || "";
        document.getElementById("suggestionRejectionMessage").value = suggestion.rejectionReport?.technicalMessage || "";
        document.getElementById("suggestionRejectionNotify").checked = suggestion.rejectionReport?.notifyRequester === true;
        openModal("suggestionRejectionModal");
      }

      function submitSuggestionRejection(event) {
        event.preventDefault();
        const suggestion = app.improvementSuggestions.find(item => item.id === document.getElementById("suggestionRejectionSuggestionId").value);
        if (!suggestion || !canManageSuggestions()) return showToast("Sugestão não encontrada ou acesso negado.", "danger");
        const reason = document.getElementById("suggestionRejectionReason").value.trim();
        if (!reason) return showToast("Informe o motivo da rejeição.", "warning");
        const now = new Date().toISOString();
        suggestion.status = "rejected";
        suggestion.rejectedAt = now;
        suggestion.rejectedBy = currentUser?.email || "";
        suggestion.rejectionReport = normalizeSuggestionRejectionReport({
          id: suggestion.rejectionReport?.id || createId(),
          suggestionId: suggestion.id,
          reason,
          technicalMessage: document.getElementById("suggestionRejectionMessage").value.trim(),
          rejectedAt: now,
          rejectedBy: currentUser?.email || "",
          notifyRequester: document.getElementById("suggestionRejectionNotify").checked
        }, suggestion);
        suggestion.updatedAt = now;
        recordActivity("Rejeitou sugestão", suggestion.text.slice(0, 180));
        saveApp({ improvements: true });
        closeModal("suggestionRejectionModal");
        activeManagementSuggestionView = "rejected";
        refreshSuggestionSurfaces();
        showToast("Sugestão movida para Rejeitadas.", "success");
      }

      function suggestionManagementCard(item) {
        const report = item.resolutionReport;
        const rejected = item.rejectionReport;
        return `<article class="management-suggestion" data-improvement-id="${escapeAttr(item.id)}">
          <div class="management-panel-head"><span class="suggestion-status-badge" data-status="${escapeAttr(item.status)}">${escapeHtml(suggestionStatusLabel(item.status))}</span><span>${escapeHtml(formatDateTime(item.createdAt))}</span></div>
          <p>${escapeHtml(item.text)}</p>
          <small>${escapeHtml(item.requesterName || "Sem perfil")} · ${escapeHtml(item.requesterEmail || "E-mail não informado")}</small>
          ${item.attachments[0] ? suggestionAttachmentHtml(item.attachments[0], { actions: true }) : ""}
          ${rejected ? `<p><strong>Motivo:</strong> ${escapeHtml(rejected.reason)}</p>` : ""}
          ${report ? `<small>Relatório: ${escapeHtml(suggestionReportStatusLabel(report.status))}${report.sentAt ? ` · enviado em ${escapeHtml(formatDateTime(report.sentAt))}` : ""}${report.seenAt ? ` · visto em ${escapeHtml(formatDateTime(report.seenAt))}` : ""}</small>` : ""}
          <div class="management-item-actions">
            <button class="button" type="button" data-management-action="copy-suggestion">Copiar</button>
            ${item.status === "open" && canManageSuggestions() ? '<button class="button primary" type="button" data-management-action="resolve-suggestion">Resolver sugestão</button><button class="button danger" type="button" data-management-action="reject-suggestion">Rejeitar sugestão</button>' : ""}
            ${item.status === "resolved" && canManageSuggestions() ? `<button class="button" type="button" data-management-action="view-suggestion-report">Visualizar / editar relatório</button>${report ? '<button class="button" type="button" data-management-action="copy-suggestion-report">Copiar relatório</button>' : ""}<button class="button" type="button" data-management-action="${report?.seenAt ? "mark-suggestion-report-unseen" : "mark-suggestion-report-seen"}">${report?.seenAt ? "Marcar como não visto" : "Marcar como visto"}</button><button class="button" type="button" data-management-action="reopen-suggestion">Reabrir</button><button class="button" type="button" data-management-action="remove-suggestion-star">Remover estrela</button><button class="button danger" type="button" data-management-action="remove-suggestion-report">Remover relatório</button>` : ""}
            ${item.status === "rejected" && canManageSuggestions() ? '<button class="button" type="button" data-management-action="restore-rejected-suggestion">Restaurar para pendente</button><button class="button" type="button" data-management-action="copy-rejection-reason">Copiar motivo</button>' : ""}
            ${canManageSuggestions() ? '<button class="button danger" type="button" data-management-action="delete-suggestion">Excluir</button>' : ""}
          </div>
        </article>`;
      }

      function renderManagementSuggestions() {
        const term = normalizeText(managementFilters.suggestions);
        const all = normalizeImprovementSuggestions(app.improvementSuggestions);
        const suggestions = all.filter(item => !term || normalizeText(`${item.text} ${item.requesterName} ${item.requesterEmail}`).includes(term));
        const attachmentBytes = all.flatMap(item => item.attachments).reduce((total, attachment) => total + attachment.size, 0);
        const tabs = [
          ["open", "Pendentes"], ["resolved", "Resolvidas"], ["rejected", "Rejeitadas"],
          ["reports", "Relatórios enviados"], ["ranking", "Ranking semanal"]
        ];
        let content = "";
        if (activeManagementSuggestionView === "ranking") {
          const ranking = normalizeSuggestionWeeklyRanking(app.suggestionWeeklyRanking);
          content = `<div class="suggestion-ranking-list">${ranking.entries.map((entry, index) => `<article class="suggestion-ranking-card"><span class="suggestion-ranking-position">${index + 1}º</span><span aria-hidden="true">⭐</span><div><strong>${escapeHtml(entry.name || entry.email || "Usuário")}</strong><small>${entry.count} sugestão(ões) aplicada(s)</small><div class="management-item-actions">${canManageSuggestions() ? `<button class="button danger" data-management-action="remove-ranking-entry" data-ranking-email="${escapeAttr(entry.email)}" data-ranking-profile-id="${escapeAttr(entry.profileId)}">Remover estrela</button>` : ""}</div></div></article>`).join("") || '<div class="management-empty">Nenhuma sugestão aplicada nesta semana ainda.</div>'}</div>${canManageSuggestions() ? '<div class="management-item-actions"><button class="button danger" data-management-action="clear-suggestion-ranking">Zerar ranking da semana</button><button class="button danger" data-management-action="clear-suggestion-notifications">Excluir notificações enviadas</button></div>' : ""}`;
        } else if (activeManagementSuggestionView === "reports") {
          const reports = suggestions.filter(item => item.resolutionReport?.status === "sent" || item.resolutionReport?.status === "seen");
          content = `<div class="management-suggestion-list">${reports.map(suggestionManagementCard).join("") || '<div class="management-empty">Nenhum relatório enviado.</div>'}</div>`;
        } else {
          const filtered = suggestions.filter(item => item.status === activeManagementSuggestionView);
          content = `<div class="management-suggestion-list">${filtered.map(suggestionManagementCard).join("") || '<div class="management-empty">Nenhuma sugestão nesta categoria.</div>'}</div>`;
        }
        els.managementContent.innerHTML = `
          <section class="management-panel">
            <div class="management-panel-head"><div><h2>Central de sugestões</h2><small>Armazenamento de anexos: ${escapeHtml(formatFileSize(attachmentBytes))}</small></div><div class="management-item-actions"><span class="management-status-badge">${all.length} sugestão(ões)</span>${canManageSuggestions() ? '<button class="button danger" data-management-action="clear-suggestion-center">Limpar tudo</button>' : ""}</div></div>
            <div class="suggestion-management-tabs">${tabs.map(([key, label]) => `<button class="button suggestion-management-tab ${activeManagementSuggestionView === key ? "is-active" : ""}" data-management-action="suggestion-view" data-suggestion-view="${key}">${label}</button>`).join("")}</div>
            <div class="management-filters"><div class="management-filter"><label for="managementSuggestionSearch">Buscar sugestão</label><input id="managementSuggestionSearch" data-management-filter="suggestions" value="${escapeAttr(managementFilters.suggestions)}" placeholder="Texto, nome ou e-mail..."></div></div>
            ${content}
          </section>`;
      }

      function openSuggestionAttachment(attachment) {
        if (!attachment?.dataUrl) return showToast("Anexo indisponível.", "warning");
        const link = document.createElement("a");
        link.href = attachment.dataUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.click();
      }

      function downloadSuggestionAttachment(attachment) {
        if (!attachment?.dataUrl) return showToast("Anexo indisponível.", "warning");
        downloadBlob(dataUrlToBlob(attachment.dataUrl), attachment.name || "anexo");
      }

      function removeSuggestionRankingEntry(email, profileId) {
        const ranking = normalizeSuggestionWeeklyRanking(app.suggestionWeeklyRanking);
        ranking.entries = ranking.entries.filter(entry => !((profileId && entry.profileId === profileId) || (email && normalizeEmail(entry.email) === normalizeEmail(email))));
        app.suggestionWeeklyRanking = normalizeSuggestionWeeklyRanking(ranking);
      }

      function decrementSuggestionRankingEntry(email, profileId) {
        const ranking = normalizeSuggestionWeeklyRanking(app.suggestionWeeklyRanking);
        const entry = ranking.entries.find(item => (profileId && item.profileId === profileId) || (email && normalizeEmail(item.email) === normalizeEmail(email)));
        if (entry) entry.count = Math.max(0, entry.count - 1);
        ranking.entries = ranking.entries.filter(item => item.count > 0);
        app.suggestionWeeklyRanking = normalizeSuggestionWeeklyRanking(ranking);
      }

      function getFilteredManagementActivityEntries() {
        const term = normalizeText(managementFilters.activity);
        return normalizeActivityLog([...(app.activityLog || []), ...restrictedAccessLogs]).filter(entry => {
          if (term && !normalizeText(`${entry.action} ${entry.detail} ${entry.userEmail} ${entry.userName} ${entry.profileName} ${entry.planTitle}`).includes(term)) return false;
          if (managementFilters.activityAction && entry.action !== managementFilters.activityAction) return false;
          if (managementFilters.activityUser && normalizeEmail(entry.userEmail) !== managementFilters.activityUser) return false;
          return true;
        });
      }

      function renderManagementActivity() {
        if (!canViewActivity()) return renderManagementDashboard();
        const entries = getFilteredManagementActivityEntries();
        const actions = [...new Set(entries.map(entry => entry.action).filter(Boolean))].sort();
        const users = [...new Set(entries.map(entry => normalizeEmail(entry.userEmail)).filter(Boolean))].sort();
        const localIds = new Set((app.activityLog || []).map(entry => entry.id));
        const selectedLocalCount = [...selectedManagementLogIds].filter(id => localIds.has(id)).length;
        els.managementContent.innerHTML = `
          <section class="management-panel">
            <div class="management-panel-head"><h2>Atividades recentes</h2><div class="management-item-actions"><button class="button" type="button" data-management-action="copy-log">Copiar log</button>${canDeleteLogs() ? '<button class="button danger" type="button" data-management-action="delete-filtered-logs">Limpar logs filtrados</button><button class="button danger" type="button" data-management-action="clear-all-logs">Limpar todos os logs</button>' : ""}</div></div>
            <div class="management-filters">
              <div class="management-filter"><label for="managementActivitySearch">Buscar atividade</label><input id="managementActivitySearch" data-management-filter="activity" value="${escapeAttr(managementFilters.activity)}" placeholder="Ação, detalhe, usuário..."></div>
              <div class="management-filter"><label for="managementActivityAction">Ação</label><select id="managementActivityAction" data-management-filter="activityAction"><option value="">Todas</option>${actions.map(action => `<option value="${escapeAttr(action)}" ${managementFilters.activityAction === action ? "selected" : ""}>${escapeHtml(action)}</option>`).join("")}</select></div>
              <div class="management-filter"><label for="managementActivityUser">Usuário</label><select id="managementActivityUser" data-management-filter="activityUser"><option value="">Todos</option>${users.map(email => `<option value="${escapeAttr(email)}" ${managementFilters.activityUser === email ? "selected" : ""}>${escapeHtml(email)}</option>`).join("")}</select></div>
            </div>
            ${canDeleteLogs() ? `<div class="management-log-selection"><label class="checkbox-line"><input type="checkbox" data-management-action="select-all-logs" ${entries.filter(entry => localIds.has(entry.id)).length && entries.filter(entry => localIds.has(entry.id)).every(entry => selectedManagementLogIds.has(entry.id)) ? "checked" : ""}> Selecionar logs filtrados locais</label><button class="button danger" type="button" data-management-action="delete-selected-logs" ${selectedLocalCount ? "" : "disabled"}>Excluir selecionados (${selectedLocalCount})</button></div>` : ""}
            <div class="management-table-wrap"><table class="management-table"><thead><tr>${canDeleteLogs() ? "<th>Selecionar</th>" : ""}<th>Data/hora</th><th>Ação</th><th>Detalhe</th><th>Usuário</th><th>Referência</th></tr></thead>
            <tbody>${entries.map(entry => `<tr>${canDeleteLogs() ? `<td>${localIds.has(entry.id) ? `<input type="checkbox" data-management-action="select-log" data-log-id="${escapeAttr(entry.id)}" ${selectedManagementLogIds.has(entry.id) ? "checked" : ""}>` : "<small>Externo</small>"}</td>` : ""}<td>${escapeHtml(formatDateTime(entry.at))}</td><td><strong>${escapeHtml(entry.action || "-")}</strong></td><td>${escapeHtml(entry.detail || "-")}</td><td>${escapeHtml(activityActor(entry))}</td><td>${escapeHtml([entry.profileName, entry.planTitle].filter(Boolean).join(" · ") || "-")}</td></tr>`).join("") || `<tr><td colspan="${canDeleteLogs() ? 6 : 5}"><div class="management-empty">Nenhuma atividade encontrada.</div></td></tr>`}</tbody></table></div>
          </section>`;
      }

      function activePermissionLabels(entry) {
        return MANAGEMENT_PERMISSION_KEYS.filter(key => entry.permissions?.[key]).map(key => MANAGEMENT_PERMISSION_LABELS[key]);
      }

      function renderManagementPermissions() {
        if (!canManagePermissions()) {
          activeManagementTab = "dashboard";
          return renderManagementDashboard();
        }
        const users = app.managementPermissions?.users || [];
        els.managementContent.innerHTML = `
          <section class="management-permission-grid">
            <article class="management-permission-card"><strong>Administrador total</strong><p>${escapeHtml(SUPER_ADMIN_EMAIL)}</p><small>Acesso total e permanente.</small></article>
            <article class="management-permission-card"><strong>Gestão Fase 1</strong><p>${escapeHtml([...MANAGEMENT_PHASE_1_EMAILS].join(", "))}</p><small>Acesso básico preservado.</small></article>
            <article class="management-permission-card"><strong>Permissões específicas</strong><p>${users.length} usuário(s) configurado(s)</p><small>Liberações granulares por e-mail.</small></article>
          </section>
          <section class="management-panel">
            <div class="management-panel-head"><h2>Usuários com permissões específicas</h2><button class="button primary" type="button" data-management-action="new-permission">Adicionar acesso</button></div>
            <div class="management-table-wrap"><table class="management-table"><thead><tr><th>Usuário</th><th>Permissões ativas</th><th>Criado em</th><th>Atualizado em</th><th>Criado por</th><th>Ações</th></tr></thead>
            <tbody>${users.map(entry => `<tr>
              <td><strong>${escapeHtml(entry.email)}</strong><small>${escapeHtml(entry.name || "Sem apelido")}</small></td>
              <td>${escapeHtml(activePermissionLabels(entry).join(", ") || "Nenhuma")}</td><td>${escapeHtml(formatDateTime(entry.createdAt))}</td><td>${escapeHtml(formatDateTime(entry.updatedAt))}</td><td>${escapeHtml(entry.createdBy || "-")}</td>
              <td><div class="management-item-actions"><button class="button" type="button" data-management-action="copy-permission-email" data-permission-id="${escapeAttr(entry.id)}">Copiar e-mail</button><button class="button" type="button" data-management-action="edit-permission" data-permission-id="${escapeAttr(entry.id)}">Editar</button><button class="button danger" type="button" data-management-action="delete-permission" data-permission-id="${escapeAttr(entry.id)}">Remover acesso</button></div></td>
            </tr>`).join("") || '<tr><td colspan="6"><div class="management-empty">Nenhuma permissão específica cadastrada.</div></td></tr>'}</tbody></table></div>
          </section>`;
      }

      function openManagementPermissionModal(permissionId = "") {
        if (!requireManagementPermission("managePermissions", "Você não tem permissão para gerenciar permissões.")) return;
        const entry = (app.managementPermissions?.users || []).find(item => item.id === permissionId) || null;
        document.getElementById("managementPermissionModalTitle").textContent = entry ? "Editar permissões" : "Adicionar acesso";
        document.getElementById("managementPermissionId").value = entry?.id || "";
        document.getElementById("managementPermissionEmail").value = entry?.email || "";
        document.getElementById("managementPermissionName").value = entry?.name || "";
        els.managementPermissionCheckboxes.innerHTML = MANAGEMENT_PERMISSION_KEYS.map(key => `
          <label class="management-checkbox-option"><input type="checkbox" data-permission-key="${key}" ${entry?.permissions?.[key] ? "checked" : ""}> ${escapeHtml(MANAGEMENT_PERMISSION_LABELS[key])}</label>
        `).join("");
        openModal("managementPermissionModal");
      }

      function enforcePermissionDependencies(event) {
        const checkbox = event.target.closest("[data-permission-key]");
        if (!checkbox || !checkbox.checked || checkbox.dataset.permissionKey === "accessManagement" || checkbox.dataset.permissionKey === "phase1View") return;
        ["accessManagement", "phase1View"].forEach(key => {
          const dependency = els.managementPermissionCheckboxes.querySelector(`[data-permission-key="${key}"]`);
          if (dependency) dependency.checked = true;
        });
        const key = checkbox.dataset.permissionKey;
        const dependencies = key === "publishProcedures"
          ? ["manageProcedures", "editProcedureDrafts"]
          : ["restoreProcedureVersions", "editProcedureDrafts", "importProcedureLibrary", "exportProcedureLibrary"].includes(key)
            ? ["manageProcedures"]
            : [];
        dependencies.forEach(dependencyKey => {
          const dependency = els.managementPermissionCheckboxes.querySelector(`[data-permission-key="${dependencyKey}"]`);
          if (dependency) dependency.checked = true;
        });
      }

      function saveManagementPermissionFromModal(event) {
        event.preventDefault();
        if (!requireManagementPermission("managePermissions", "Você não tem permissão para gerenciar permissões.")) return;
        const id = document.getElementById("managementPermissionId").value;
        const email = normalizeEmail(document.getElementById("managementPermissionEmail").value);
        if (!email || !email.includes("@")) return showToast("Informe um e-mail válido.");
        if (email === normalizeEmail(SUPER_ADMIN_EMAIL)) return showToast("O administrador total é permanente e não pode ser alterado.");
        const duplicate = (app.managementPermissions.users || []).find(item => item.email === email && item.id !== id);
        if (duplicate) return showToast("Este e-mail já possui um registro de permissões.");
        const permissions = {};
        MANAGEMENT_PERMISSION_KEYS.forEach(key => {
          permissions[key] = !!els.managementPermissionCheckboxes.querySelector(`[data-permission-key="${key}"]`)?.checked;
        });
        const now = new Date().toISOString();
        const existing = (app.managementPermissions.users || []).find(item => item.id === id);
        if (existing) {
          existing.email = email;
          existing.name = document.getElementById("managementPermissionName").value.trim();
          existing.permissions = normalizeManagementPermissionUser({ permissions }).permissions;
          existing.updatedAt = now;
          recordActivity("Alterou permissão", `Permissões atualizadas para ${email}.`);
        } else {
          app.managementPermissions.users.push(normalizeManagementPermissionUser({
            id: createId(),
            email,
            name: document.getElementById("managementPermissionName").value.trim(),
            permissions,
            createdAt: now,
            updatedAt: now,
            createdBy: currentUser?.email || ""
          }));
          recordActivity("Adicionou permissão", `Acesso configurado para ${email}.`);
        }
        closeModal("managementPermissionModal");
        saveManagementChanges();
        renderManagementPermissions();
      }

      function handleManagementTabClick(event) {
        if (!canAccessManagementPhase1()) return showAppSelector();
        const button = event.target.closest("[data-management-tab]");
        if (!button) return;
        if (!canAccessManagementTab(button.dataset.managementTab)) return showToast("Você não tem permissão para acessar esta área.");
        activeManagementTab = button.dataset.managementTab;
        renderManagement();
      }

      function handleManagementFilterInput(event) {
        if (!canAccessManagementPhase1()) return;
        const key = event.target.dataset.managementFilter;
        if (!key || !(key in managementFilters)) return;
        managementFilters[key] = event.target.value;
        const activeId = event.target.id;
        const cursor = event.target.selectionStart;
        const renderAndRestoreFocus = () => {
          renderManagement();
          requestAnimationFrame(() => {
            const field = document.getElementById(activeId);
            if (!field) return;
            field.focus();
            if (typeof cursor === "number" && field.setSelectionRange) field.setSelectionRange(cursor, cursor);
          });
        };
        clearTimeout(managementFilterRenderTimer);
        if (event.type === "change") {
          renderAndRestoreFocus();
          return;
        }
        managementFilterRenderTimer = setTimeout(renderAndRestoreFocus, 180);
      }

      async function createManagementProfile() {
        if (!requireManagementPermission("manageProfiles", "Você não tem permissão para criar perfis.")) return;
        const values = await openManagementFormModal({
          title: "Novo perfil",
          fields: [
            { name: "name", label: "Nome completo", required: true },
            { name: "email", label: "E-mail", type: "email" },
            { name: "role", label: "Função / cargo" },
            { name: "company", label: "Empresa / consultoria" },
            ...(canManageHiddenItems() ? [{ name: "hidden", label: "Visibilidade", type: "checkbox", help: "Criar como perfil oculto", value: false }] : [])
          ],
          validate: data => !data.name ? "Informe o nome completo." : data.email && !data.email.includes("@") ? "Informe um e-mail válido." : app.profiles.some(profile => normalizeEmail(profile.email) === normalizeEmail(data.email)) ? "Já existe um perfil com este e-mail." : ""
        });
        if (!values) return;
        const profile = normalizeProfile({
          id: createId(),
          userId: "",
          ...values,
          email: normalizeEmail(values.email),
          clientId: "",
          avatarColor: pickColor(values.name),
          avatarPhoto: "",
          createdAt: new Date().toISOString(),
          lastAccess: "",
          folders: [createDefaultFolder()],
          plans: []
        });
        app.profiles.push(profile);
        recordActivity("Criou perfil pela gestão", `Criou o perfil ${profile.name}.`, { profile });
        saveManagementChanges();
        showToast("Perfil criado com sucesso.", "success");
        renderManagementProfiles();
      }

      async function editManagementProfile(profile) {
        if (!requireManagementPermission("manageProfiles", "Você não tem permissão para editar perfis.")) return;
        const values = await openManagementFormModal({
          title: `Editar perfil: ${profile.name}`,
          fields: [
            { name: "name", label: "Nome completo", value: profile.name, required: true },
            { name: "email", label: "E-mail", type: "email", value: profile.email },
            { name: "role", label: "Função / cargo", value: profile.role },
            { name: "company", label: "Empresa / consultoria", value: profile.company },
            ...(canManageHiddenItems() ? [{ name: "hidden", label: "Visibilidade", type: "checkbox", help: "Manter perfil oculto", value: profile.hidden }] : [])
          ],
          validate: data => !data.name ? "Informe o nome completo." : data.email && !data.email.includes("@") ? "Informe um e-mail válido." : app.profiles.some(item => item.id !== profile.id && normalizeEmail(item.email) === normalizeEmail(data.email)) ? "Já existe outro perfil com este e-mail." : ""
        });
        if (!values) return;
        Object.assign(profile, values, { email: normalizeEmail(values.email) });
        recordActivity("Editou perfil", `Editou o perfil ${profile.name}.`, { profile });
        saveManagementChanges();
        showToast("Perfil atualizado.", "success");
        renderManagementProfiles();
      }

      function toggleManagementProfileHidden(profile) {
        if (!requireManagementPermission("manageHiddenItems", "Você não tem permissão para gerenciar itens ocultos.")) return;
        profile.hidden = !profile.hidden;
        recordActivity(profile.hidden ? "Ocultou perfil" : "Desocultou perfil", `${profile.hidden ? "Ocultou" : "Desocultou"} o perfil ${profile.name}.`, { profile });
        saveManagementChanges();
        renderManagementProfiles();
      }

      async function deleteManagementProfile(profile) {
        if (!requireManagementPermission("manageProfiles", "Você não tem permissão para excluir perfis.")) return;
        if (profile.userId && profile.userId === currentUser?.id) return showToast("O perfil do usuário conectado não pode ser excluído por esta tela.");
        const planCount = (profile.plans || []).length;
        if (!await openConfirmModal({ title: "Excluir perfil", message: `O perfil "${profile.name}" possui ${planCount} plano(s). Esta ação é definitiva.`, requiredText: "EXCLUIR", confirmLabel: "Excluir perfil" })) return;
        createInternalBackup(`Antes de excluir perfil ${profile.name}`, { automatic: true, profileId: profile.id });
        app.profiles = app.profiles.filter(item => item.id !== profile.id);
        if (profile.userId) app.hiddenUserProfileIds = app.hiddenUserProfileIds.filter(id => id !== profile.userId);
        recordActivity("Excluiu perfil", `Excluiu o perfil ${profile.name}, com ${planCount} plano(s).`, { profile });
        saveManagementChanges();
        renderManagementProfiles();
      }

      async function createManagementFolder() {
        if (!requireManagementPermission("manageFolders", "Você não tem permissão para criar pastas.")) return;
        const profiles = getAllManagementProfiles();
        const values = await openManagementFormModal({
          title: "Nova pasta",
          fields: [
            { name: "profileId", label: "Perfil", type: "select", value: profiles[0]?.id || "", options: profiles.map(profile => ({ value: profile.id, label: profile.name })), required: true },
            { name: "name", label: "Nome da pasta", required: true },
            ...(canManageHiddenItems() ? [{ name: "hidden", label: "Visibilidade", type: "checkbox", help: "Criar como pasta oculta", value: false }] : [])
          ],
          validate: data => !data.profileId || !data.name ? "Selecione o perfil e informe o nome da pasta." : ""
        });
        if (!values) return;
        const profile = app.profiles.find(item => item.id === values.profileId);
        if (!profile) return showToast("Perfil não encontrado.", "danger");
        const folder = normalizeFolder({
          id: createId(),
          name: values.name,
          color: FOLDER_COLORS[(profile.folders || []).length % FOLDER_COLORS.length],
          hidden: !!values.hidden,
          clientId: profile.clientId || "",
          unitId: profile.unitId || "",
          sectorId: profile.sectorId || "",
          createdAt: new Date().toISOString()
        });
        profile.folders.push(folder);
        recordActivity("Criou pasta pela gestão", `Criou a pasta ${folder.name} no perfil ${profile.name}.`, { profile });
        saveManagementChanges();
        showToast("Pasta criada com sucesso.", "success");
        renderManagementFolders();
      }

      async function editManagementFolder(profile, folder) {
        if (!requireManagementPermission("manageFolders", "Você não tem permissão para editar pastas.")) return;
        if (folder.isDefault) return showToast("A pasta padrão não pode ser editada.");
        const values = await openManagementFormModal({ title: `Editar pasta: ${folder.name}`, fields: [{ name: "name", label: "Nome da pasta", value: folder.name, required: true }, ...(canManageHiddenItems() ? [{ name: "hidden", label: "Visibilidade", type: "checkbox", help: "Manter pasta oculta", value: folder.hidden }] : [])], validate: data => !data.name ? "Informe o nome da pasta." : "" });
        if (!values) return;
        Object.assign(folder, values);
        recordActivity("Editou pasta", `Editou a pasta ${folder.name} do perfil ${profile.name}.`, { profile });
        saveManagementChanges();
        showToast("Pasta atualizada.", "success");
        renderManagementFolders();
      }

      function toggleManagementFolderHidden(profile, folder) {
        if (!requireManagementPermission("manageHiddenItems", "Você não tem permissão para gerenciar itens ocultos.")) return;
        if (folder.isDefault) return showToast("A pasta padrão não pode ser ocultada.");
        folder.hidden = !folder.hidden;
        recordActivity(folder.hidden ? "Ocultou pasta" : "Desocultou pasta", `${folder.hidden ? "Ocultou" : "Desocultou"} a pasta ${folder.name}.`, { profile });
        saveManagementChanges();
        renderManagementFolders();
      }

      async function deleteManagementFolder(profile, folder) {
        if (!requireManagementPermission("manageFolders", "Você não tem permissão para excluir pastas.")) return;
        if (folder.isDefault) return showToast("A pasta padrão não pode ser excluída.");
        const affectedPlans = (profile.plans || []).filter(plan => plan.folderId === folder.id);
        if (!await openConfirmModal({ title: "Excluir pasta", message: `${affectedPlans.length} plano(s) serão movidos para "Sem pasta".`, requiredText: affectedPlans.length ? "EXCLUIR" : "", confirmLabel: "Excluir pasta" })) return;
        createInternalBackup(`Antes de excluir pasta ${folder.name}`, { automatic: true, profileId: profile.id });
        affectedPlans.forEach(plan => {
          plan.folderId = DEFAULT_FOLDER_ID;
          touchPlan(plan);
        });
        profile.folders = profile.folders.filter(item => item.id !== folder.id);
        recordActivity("Excluiu pasta", `Excluiu a pasta ${folder.name}; ${affectedPlans.length} plano(s) movido(s) para Sem pasta.`, { profile });
        saveManagementChanges();
        renderManagementFolders();
      }

      function managementDestinationOptions() {
        return getAllManagementProfiles().flatMap(profile => getManagementFolders(profile).map(folder => ({
          value: `${profile.id}::${folder.id}`,
          label: `${profile.name} / ${folder.name}`
        })));
      }

      function parseManagementDestination(value) {
        const [profileId, folderId] = String(value || "").split("::");
        const profile = app.profiles.find(item => item.id === profileId);
        const folder = profile?.folders.find(item => item.id === folderId);
        return profile && folder ? { profile, folder } : null;
      }

      async function renameManagementPlan(profile, plan) {
        if (!requireManagementPermission("managePlans", "Você não tem permissão para renomear planos.")) return;
        const values = await openManagementFormModal({ title: "Renomear plano", fields: [{ name: "title", label: "Novo título", value: plan.title, required: true }], validate: data => !data.title ? "Informe o novo título." : "" });
        if (!values) return;
        const title = values.title;
        if (!title || title === plan.title) return;
        const previous = plan.title;
        plan.title = title;
        touchPlan(plan);
        recordActivity("Renomeou plano", `Renomeou o plano ${previous} para ${title}.`, { profile, plan });
        saveManagementChanges();
        showToast("Plano renomeado.", "success");
        renderManagementPlans();
      }

      async function copyManagementPlan(profile, plan) {
        if (!requireManagementPermission("managePlans", "Você não tem permissão para copiar planos.")) return;
        const values = await openManagementFormModal({
          title: "Copiar plano",
          fields: [
            { name: "title", label: "Título da cópia", value: `${plan.title} (cópia)`, required: true },
            { name: "destination", label: "Perfil / pasta de destino", type: "select", options: managementDestinationOptions(), required: true }
          ],
          validate: data => !data.title || !data.destination ? "Informe o título e o destino." : ""
        });
        if (!values) return;
        const destination = parseManagementDestination(values.destination);
        if (!destination) return;
        const copy = duplicatePlanObject(plan, destination.folder.id);
        copy.title = values.title;
        destination.profile.plans.push(copy);
        recordActivity("Copiou plano", `Copiou o plano ${plan.title} para ${destination.profile.name} / ${destination.folder.name}.`, { profile: destination.profile, plan: copy });
        saveManagementChanges();
        showToast("Plano copiado com sucesso.", "success");
        renderManagementPlans();
      }

      function duplicateManagementPlan(profile, plan) {
        if (!requireManagementPermission("managePlans", "Você não tem permissão para duplicar planos.")) return;
        const copy = duplicatePlanObject(plan, plan.folderId || DEFAULT_FOLDER_ID);
        profile.plans.push(copy);
        recordActivity("Copiou plano", `Duplicou o plano ${plan.title} na mesma pasta.`, { profile, plan: copy });
        saveManagementChanges();
        renderManagementPlans();
      }

      async function moveManagementPlan(profile, plan) {
        if (!requireManagementPermission("managePlans", "Você não tem permissão para mover planos.")) return;
        const values = await openManagementFormModal({ title: "Mover plano", fields: [{ name: "destination", label: "Perfil / pasta de destino", type: "select", options: managementDestinationOptions(), required: true }] });
        if (!values) return;
        const destination = parseManagementDestination(values.destination);
        if (!destination) return;
        if (destination.profile.id === profile.id && destination.folder.id === plan.folderId) return showToast("O plano já está nesta pasta.");
        profile.plans = profile.plans.filter(item => item.id !== plan.id);
        plan.folderId = destination.folder.id;
        touchPlan(plan);
        destination.profile.plans.push(plan);
        recordActivity("Moveu plano", `Moveu o plano ${plan.title} para ${destination.profile.name} / ${destination.folder.name}.`, { profile: destination.profile, plan });
        saveManagementChanges();
        showToast("Plano movido com sucesso.", "success");
        renderManagementPlans();
      }

      async function deleteManagementPlan(profile, plan) {
        if (!requireManagementPermission("managePlans", "Você não tem permissão para excluir planos.")) return;
        if (!await openConfirmModal({
          title: "Mover plano para a lixeira",
          message: `O plano "${plan.title}" ficará restaurável por 24 horas antes da exclusão permanente.`,
          confirmLabel: "Mover para lixeira",
          tone: "warning"
        })) return;
        createInternalBackup(`Antes de mover plano ${plan.title} para a lixeira`, { automatic: true, profileId: profile.id, planId: plan.id });
        movePlanToTrash(plan.id, profile);
        renderManagementPlans();
      }

      async function deleteSelectedManagementLogs() {
        if (!requireManagementPermission("deleteLogs", "Você não tem permissão para excluir logs.")) return;
        const ids = new Set([...selectedManagementLogIds]);
        const count = (app.activityLog || []).filter(entry => ids.has(entry.id)).length;
        if (!count || !await managementConfirm(`Excluir ${count} log(s) selecionado(s)?`)) return;
        app.activityLog = (app.activityLog || []).filter(entry => !ids.has(entry.id));
        selectedManagementLogIds.clear();
        recordActivity("Excluiu logs", `Excluiu ${count} log(s) selecionado(s).`);
        saveManagementChanges();
        renderManagementActivity();
      }

      async function deleteFilteredManagementLogs() {
        if (!requireManagementPermission("deleteLogs", "Você não tem permissão para excluir logs.")) return;
        const localIds = new Set((app.activityLog || []).map(entry => entry.id));
        const filteredIds = new Set(getFilteredManagementActivityEntries().filter(entry => localIds.has(entry.id)).map(entry => entry.id));
        if (!filteredIds.size || !await managementConfirm("Tem certeza que deseja excluir todos os logs filtrados?")) return;
        app.activityLog = (app.activityLog || []).filter(entry => !filteredIds.has(entry.id));
        filteredIds.forEach(id => selectedManagementLogIds.delete(id));
        recordActivity("Limpou logs filtrados", `Excluiu ${filteredIds.size} log(s) filtrado(s).`);
        saveManagementChanges();
        renderManagementActivity();
      }

      async function clearAllManagementLogs() {
        if (!requireManagementPermission("deleteLogs", "Você não tem permissão para excluir logs.")) return;
        if (!await openConfirmModal({ title: "Limpar todos os logs", message: "Todos os logs locais serão removidos e um novo registro da limpeza será criado.", requiredText: "LIMPAR LOGS", confirmLabel: "Limpar logs" })) return;
        const count = (app.activityLog || []).length;
        app.activityLog = [];
        selectedManagementLogIds.clear();
        recordActivity("Limpou todos os logs", `Limpou ${count} log(s) locais.`);
        saveManagementChanges();
        renderManagementActivity();
      }

      function emptyTemplateRow(section) {
        const now = new Date().toISOString();
        if (section === "rows") return normalizeRow({ id: createId(), lastEdited: now, actionHtml: "", responsible: "", when: "", priority: "Média", status: "Não iniciado", progress: 0, observationHtml: "" }, "actions");
        if (section === "equipmentRows") return normalizeRow({ id: createId(), lastEdited: now, descriptionHtml: "", responsible: "", status: "Não iniciado", observationHtml: "" }, "equipment");
        return normalizeRow({ id: createId(), lastEdited: now, trainingHtml: "", responsible: "", when: "", status: "Não iniciado", observationHtml: "" }, "trainings");
      }

      function openActionPlanTemplateModal(templateId = "") {
        if (!requirePermission(canManageActionPlanTemplates, "Você não tem permissão para gerenciar templates.")) return;
        const existing = app.actionPlanTemplates.find(template => template.id === templateId);
        editingActionPlanTemplateId = existing?.id || "";
        editingActionPlanTemplateDraft = existing ? deepClone(existing) : normalizeActionPlanTemplate({ id: createId(), name: "", category: "Geral", rows: [], equipmentRows: [], trainingRows: [], createdBy: currentUser?.email || "" });
        document.getElementById("actionPlanTemplateModalTitle").textContent = existing ? `Alterar template: ${existing.name}` : "Novo template";
        document.getElementById("actionPlanTemplateName").value = existing?.name || "";
        document.getElementById("actionPlanTemplateCategory").value = existing?.category || "Geral";
        document.getElementById("actionPlanTemplateDescription").value = existing?.description || "";
        renderActionPlanTemplateEditor();
        openModal("actionPlanTemplateModal");
      }

      function templateEditorRowHtml(row, section, index) {
        const contentKey = section === "rows" ? "actionHtml" : section === "equipmentRows" ? "descriptionHtml" : "trainingHtml";
        const contentLabel = section === "rows" ? "Ação" : section === "equipmentRows" ? "Equipamento" : "Treinamento";
        return `<article class="template-editor-row" data-template-row data-template-section="${section}" data-template-index="${index}">
          <label class="field">${contentLabel}<textarea data-template-row-field="${contentKey}">${escapeHtml(row[contentKey] || "")}</textarea></label>
          <label class="field">Responsável<input data-template-row-field="responsible" value="${escapeAttr(row.responsible || "")}"></label>
          ${section !== "equipmentRows" ? `<label class="field">Quando<input data-template-row-field="when" value="${escapeAttr(row.when || "")}"></label>` : ""}
          ${section === "rows" ? `<label class="field">Prioridade<select data-template-row-field="priority">${PRIORITIES.map(value => `<option ${row.priority === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label class="field">Progresso<input type="number" min="0" max="100" data-template-row-field="progress" value="${clampProgress(row.progress)}"></label>` : ""}
          <label class="field">Status<select data-template-row-field="status">${STATUSES.map(value => `<option ${row.status === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
          <label class="field">Observação<textarea data-template-row-field="observationHtml">${escapeHtml(row.observationHtml || "")}</textarea></label>
          <div class="template-editor-row-actions"><button class="button icon-only" type="button" data-template-editor-action="move-up" title="Mover para cima">↑</button><button class="button icon-only" type="button" data-template-editor-action="move-down" title="Mover para baixo">↓</button><button class="button" type="button" data-template-editor-action="duplicate">Duplicar</button><button class="button danger" type="button" data-template-editor-action="delete">Excluir</button></div>
        </article>`;
      }

      function renderActionPlanTemplateEditor() {
        if (!editingActionPlanTemplateDraft || !els.actionPlanTemplateEditorAreas) return;
        const sections = [
          ["rows", "Ações"],
          ["equipmentRows", "Equipamentos de emergência"],
          ["trainingRows", "Treinamentos"]
        ];
        els.actionPlanTemplateEditorAreas.innerHTML = sections.map(([section, label]) => `
          <section class="template-editor-section"><div class="template-editor-section-head"><h3>${label}</h3><button class="button primary" type="button" data-template-editor-action="add" data-template-section="${section}">Adicionar linha</button></div>
          <div class="template-editor-list">${editingActionPlanTemplateDraft[section].map((row, index) => templateEditorRowHtml(row, section, index)).join("") || '<div class="management-empty">Nenhuma linha nesta área.</div>'}</div></section>`).join("");
      }

      function syncActionPlanTemplateDraftFromDom() {
        if (!editingActionPlanTemplateDraft || !els.actionPlanTemplateEditorAreas) return;
        ["rows", "equipmentRows", "trainingRows"].forEach(section => {
          const dataSection = section === "rows" ? "actions" : section === "equipmentRows" ? "equipment" : "trainings";
          editingActionPlanTemplateDraft[section] = [...els.actionPlanTemplateEditorAreas.querySelectorAll(`[data-template-row][data-template-section="${section}"]`)].map((container, index) => {
            const previous = editingActionPlanTemplateDraft[section][index] || emptyTemplateRow(section);
            const row = { ...previous };
            container.querySelectorAll("[data-template-row-field]").forEach(field => {
              row[field.dataset.templateRowField] = field.dataset.templateRowField === "progress" ? clampProgress(field.value) : field.value;
            });
            return normalizeRow(row, dataSection);
          });
        });
      }

      function handleActionPlanTemplateEditorClick(event) {
        const button = event.target.closest("[data-template-editor-action]");
        if (!button || !editingActionPlanTemplateDraft) return;
        syncActionPlanTemplateDraftFromDom();
        const row = button.closest("[data-template-row]");
        const section = button.dataset.templateSection || row?.dataset.templateSection;
        const index = Number(row?.dataset.templateIndex);
        const list = editingActionPlanTemplateDraft[section];
        if (!Array.isArray(list)) return;
        const action = button.dataset.templateEditorAction;
        if (action === "add") list.push(emptyTemplateRow(section));
        if (action === "delete" && Number.isInteger(index)) list.splice(index, 1);
        if (action === "duplicate" && Number.isInteger(index)) list.splice(index + 1, 0, { ...deepClone(list[index]), id: createId(), lastEdited: new Date().toISOString() });
        if (action === "move-up" && index > 0) [list[index - 1], list[index]] = [list[index], list[index - 1]];
        if (action === "move-down" && index >= 0 && index < list.length - 1) [list[index], list[index + 1]] = [list[index + 1], list[index]];
        renderActionPlanTemplateEditor();
      }

      function saveActionPlanTemplateFromModal(event) {
        event.preventDefault();
        if (!requirePermission(canManageActionPlanTemplates, "Você não tem permissão para gerenciar templates.")) return;
        syncActionPlanTemplateDraftFromDom();
        const name = document.getElementById("actionPlanTemplateName").value.trim();
        if (!name) return showToast("Informe o nome do template.");
        const before = editingActionPlanTemplateId ? deepClone(app.actionPlanTemplates.find(template => template.id === editingActionPlanTemplateId)) : null;
        const now = new Date().toISOString();
        Object.assign(editingActionPlanTemplateDraft, {
          name,
          category: document.getElementById("actionPlanTemplateCategory").value.trim() || "Geral",
          description: document.getElementById("actionPlanTemplateDescription").value.trim(),
          updatedAt: now,
          updatedBy: currentUser?.email || "",
          createdAt: editingActionPlanTemplateDraft.createdAt || now,
          createdBy: editingActionPlanTemplateDraft.createdBy || currentUser?.email || ""
        });
        const normalized = normalizeActionPlanTemplate(editingActionPlanTemplateDraft);
        const index = app.actionPlanTemplates.findIndex(template => template.id === editingActionPlanTemplateId);
        if (index >= 0) app.actionPlanTemplates[index] = normalized;
        else app.actionPlanTemplates.push(normalized);
        app.actionPlanTemplates = normalizeActionPlanTemplates(app.actionPlanTemplates);
        const action = before ? "Alterou template" : "Criou template";
        recordActivity(action, normalized.name);
        recordAudit({ action, entityType: "action-plan-template", entityId: normalized.id, entityLabel: normalized.name, before, after: normalized });
        closeModal("actionPlanTemplateModal");
        saveManagementChanges();
        renderManagementActionPlanTemplates();
      }

      function duplicateActionPlanTemplate(template) {
        if (!template || !requirePermission(canManageActionPlanTemplates, "Você não tem permissão para duplicar templates.")) return;
        const copy = normalizeActionPlanTemplate({ ...deepClone(template), id: createId(), name: `${template.name} (cópia)`, systemDefault: false, rows: cloneTemplateRows(template.rows), equipmentRows: cloneTemplateEquipmentRows(template.equipmentRows), trainingRows: cloneTemplateTrainingRows(template.trainingRows), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: currentUser?.email || "", updatedBy: currentUser?.email || "" });
        app.actionPlanTemplates.push(copy);
        recordActivity("Duplicou template", copy.name);
        recordAudit({ action: "Duplicou template", entityType: "action-plan-template", entityId: copy.id, entityLabel: copy.name, after: copy });
        saveManagementChanges();
        renderManagementActionPlanTemplates();
      }

      function toggleActionPlanTemplate(template) {
        if (!template || !requirePermission(canManageActionPlanTemplates, "Você não tem permissão para alterar templates.")) return;
        template.active = !template.active;
        template.updatedAt = new Date().toISOString();
        template.updatedBy = currentUser?.email || "";
        recordActivity(template.active ? "Ativou template" : "Desativou template", template.name);
        recordAudit({ action: template.active ? "Ativou template" : "Desativou template", entityType: "action-plan-template", entityId: template.id, entityLabel: template.name, after: template });
        saveManagementChanges();
        renderManagementActionPlanTemplates();
      }

      async function deleteActionPlanTemplate(template) {
        if (!template || template.systemDefault || !requirePermission(canManageActionPlanTemplates, "Você não tem permissão para excluir templates.")) return;
        if (!await openConfirmModal({ title: "Excluir template", message: `O template "${template.name}" será removido definitivamente.`, requiredText: "EXCLUIR TEMPLATE", confirmLabel: "Excluir template" })) return;
        createInternalBackup(`Antes de excluir template ${template.name}`, { automatic: true });
        app.actionPlanTemplates = app.actionPlanTemplates.filter(item => item.id !== template.id);
        recordActivity("Excluiu template", template.name);
        recordAudit({ action: "Excluiu template", entityType: "action-plan-template", entityId: template.id, entityLabel: template.name, before: template, severity: "warning" });
        saveManagementChanges();
        renderManagementActionPlanTemplates();
      }

      async function restoreDefaultActionPlanTemplate(template) {
        if (!template?.systemDefault || !requirePermission(canManageActionPlanTemplates, "Você não tem permissão para restaurar templates.")) return;
        if (!await managementConfirm("Restaurar o template padrão original do SATS?")) return;
        const restored = createDefaultActionPlanTemplate();
        const index = app.actionPlanTemplates.findIndex(item => item.id === template.id);
        app.actionPlanTemplates[index] = restored;
        recordActivity("Restaurou template padrão", restored.name);
        recordAudit({ action: "Restaurou template padrão", entityType: "action-plan-template", entityId: restored.id, entityLabel: restored.name, before: template, after: restored });
        saveManagementChanges();
        renderManagementActionPlanTemplates();
      }

      function touchClientRegistry() {
        app.clientRegistry.updatedAt = new Date().toISOString();
        app.clientRegistry.updatedBy = currentUser?.email || "";
      }

      function clientManagementFields(client = {}) {
        return [
          { name: "name", label: "Nome fantasia", value: client.name || "", required: true },
          { name: "legalName", label: "Razão social", value: client.legalName || "" },
          { name: "cnpj", label: "CNPJ", value: client.cnpj || "" },
          { name: "status", label: "Status", type: "select", value: client.status || "active", options: CLIENT_STATUSES },
          { name: "contractStatus", label: "Status do contrato", type: "select", value: client.contractStatus || "active", options: COMMERCIAL_STATUSES },
          { name: "contactName", label: "Contato principal", value: client.contactName || "" },
          { name: "contactEmail", label: "E-mail de contato", type: "email", value: client.contactEmail || "" },
          { name: "contactPhone", label: "Telefone", value: client.contactPhone || "" },
          { name: "notes", label: "Observações", type: "textarea", value: client.notes || "", wide: true }
        ];
      }

      async function createManagementClient() {
        if (!requirePermission(canManageClients, "Você não tem permissão para criar clientes.")) return;
        const values = await openManagementFormModal({ title: "Novo cliente", description: "Cadastre a empresa e seus dados principais.", fields: clientManagementFields(), validate: data => !data.name ? "Informe o nome fantasia." : data.contactEmail && !data.contactEmail.includes("@") ? "Informe um e-mail de contato válido." : "" });
        if (!values) return;
        const client = normalizeClient({ id: createId(), ...values, createdBy: currentUser?.email || "", updatedBy: currentUser?.email || "" });
        getClientRegistry().clients.push(client);
        touchClientRegistry();
        recordActivity("Criou cliente", client.name);
        recordAudit({ action: "Criou cliente", entityType: "client", entityId: client.id, entityLabel: client.name, clientId: client.id, after: client });
        saveManagementChanges();
        showToast("Cliente criado com sucesso.", "success");
        renderManagementClients();
      }

      async function editManagementClient(client) {
        if (!client || !requirePermission(canManageClients, "Você não tem permissão para editar clientes.")) return;
        const values = await openManagementFormModal({ title: `Editar cliente: ${client.name}`, fields: clientManagementFields(client), validate: data => !data.name ? "Informe o nome fantasia." : data.contactEmail && !data.contactEmail.includes("@") ? "Informe um e-mail de contato válido." : "" });
        if (!values) return;
        const before = deepClone(client);
        Object.assign(client, values);
        client.updatedAt = new Date().toISOString();
        client.updatedBy = currentUser?.email || "";
        touchClientRegistry();
        recordActivity("Editou cliente", client.name);
        recordAudit({ action: "Editou cliente", entityType: "client", entityId: client.id, entityLabel: client.name, clientId: client.id, before, after: client });
        saveManagementChanges();
        showToast("Cliente atualizado.", "success");
        renderManagementClients();
      }

      async function archiveManagementClient(client) {
        if (!client || client.id === DEFAULT_CLIENT_ID || !requirePermission(canManageClients, "Você não tem permissão para arquivar clientes.")) return;
        if (!await openConfirmModal({ title: "Arquivar cliente", message: `O cliente "${client.name}" deixará de aparecer como ativo.`, requiredText: "ARQUIVAR CLIENTE", confirmLabel: "Arquivar" })) return;
        createInternalBackup(`Antes de arquivar cliente ${client.name}`, { automatic: true, clientId: client.id });
        const before = deepClone(client);
        client.status = "archived";
        client.updatedAt = new Date().toISOString();
        client.updatedBy = currentUser?.email || "";
        recordActivity("Arquivou cliente", client.name);
        recordAudit({ action: "Arquivou cliente", entityType: "client", entityId: client.id, entityLabel: client.name, clientId: client.id, before, after: client, severity: "warning" });
        saveManagementChanges();
        renderManagementClients();
      }

      function exportManagementClient(client) {
        if (!client || !canAccessClient(client.id)) return;
        const profiles = app.profiles.filter(profile => profile.clientId === client.id);
        downloadBlob(new Blob([JSON.stringify({ type: "sats-client-backup", exportedAt: new Date().toISOString(), client, profiles }, null, 2)], { type: "application/json;charset=utf-8" }), `sats-cliente-${sanitizeFileName(client.name)}.json`);
        recordActivity("Exportou backup", `Cliente ${client.name}.`);
      }

      async function createManagementUnit() {
        if (!requirePermission(canManageUnits, "Você não tem permissão para criar unidades.")) return;
        const clients = getManagementClients();
        const values = await openManagementFormModal({
          title: "Nova unidade",
          fields: [
            { name: "clientId", label: "Cliente", type: "select", value: clients[0]?.id || "", options: clients.map(client => ({ value: client.id, label: client.name })), required: true },
            { name: "name", label: "Nome da unidade", required: true },
            { name: "city", label: "Cidade" },
            { name: "state", label: "Estado / UF" },
            { name: "address", label: "Endereço", wide: true },
            { name: "notes", label: "Observações", type: "textarea", wide: true }
          ],
          validate: data => !data.clientId || !data.name ? "Selecione o cliente e informe o nome da unidade." : ""
        });
        if (!values) return;
        const client = findClient(values.clientId);
        if (!client) return showToast("Cliente não encontrado.", "danger");
        const unit = normalizeClientUnit(values, client.id);
        client.units.push(unit);
        touchClientRegistry();
        recordActivity("Criou unidade", `${client.name} / ${unit.name}`);
        recordAudit({ action: "Criou unidade", entityType: "unit", entityId: unit.id, entityLabel: unit.name, clientId: client.id, after: unit });
        saveManagementChanges();
        showToast("Unidade criada com sucesso.", "success");
        renderManagementUnits();
      }

      async function editManagementUnit(client, unit) {
        if (!client || !unit || !requirePermission(canManageUnits, "Você não tem permissão para editar unidades.")) return;
        const values = await openManagementFormModal({
          title: `Editar unidade: ${unit.name}`,
          fields: [
            { name: "name", label: "Nome da unidade", value: unit.name, required: true },
            { name: "status", label: "Status", type: "select", value: unit.status, options: CLIENT_STATUSES },
            { name: "city", label: "Cidade", value: unit.city },
            { name: "state", label: "Estado / UF", value: unit.state },
            { name: "address", label: "Endereço", value: unit.address, wide: true },
            { name: "notes", label: "Observações", type: "textarea", value: unit.notes, wide: true }
          ],
          validate: data => !data.name ? "Informe o nome da unidade." : ""
        });
        if (!values) return;
        const before = deepClone(unit);
        Object.assign(unit, values);
        unit.updatedAt = new Date().toISOString();
        touchClientRegistry();
        recordActivity("Editou unidade", unit.name);
        recordAudit({ action: "Editou unidade", entityType: "unit", entityId: unit.id, entityLabel: unit.name, clientId: client.id, before, after: unit });
        saveManagementChanges();
        showToast("Unidade atualizada.", "success");
        renderManagementUnits();
      }

      async function archiveManagementUnit(client, unit) {
        if (!client || !unit || unit.id === DEFAULT_UNIT_ID || !requirePermission(canManageUnits, "Você não tem permissão para arquivar unidades.")) return;
        if (!await managementConfirm(`Arquivar a unidade "${unit.name}"?`)) return;
        unit.status = "archived";
        unit.updatedAt = new Date().toISOString();
        recordActivity("Arquivou unidade", unit.name);
        recordAudit({ action: "Arquivou unidade", entityType: "unit", entityId: unit.id, entityLabel: unit.name, clientId: client.id, after: unit, severity: "warning" });
        saveManagementChanges();
        renderManagementUnits();
      }

      async function createManagementSector() {
        if (!requirePermission(canManageSectors, "Você não tem permissão para criar setores.")) return;
        const units = getManagementClients().flatMap(client => client.units.map(unit => ({ client, unit })));
        const values = await openManagementFormModal({
          title: "Novo setor",
          fields: [
            { name: "unitId", label: "Cliente / unidade", type: "select", value: units[0]?.unit.id || "", options: units.map(item => ({ value: item.unit.id, label: `${item.client.name} / ${item.unit.name}` })), required: true },
            { name: "name", label: "Nome do setor", required: true },
            { name: "description", label: "Descrição", type: "textarea", wide: true },
            { name: "notes", label: "Observações", type: "textarea", wide: true }
          ],
          validate: data => !data.unitId || !data.name ? "Selecione a unidade e informe o nome do setor." : ""
        });
        if (!values) return;
        const found = findUnit(values.unitId);
        if (!found) return showToast("Unidade não encontrada.", "danger");
        const sector = normalizeClientSector(values, found.client.id);
        found.client.sectors.push(sector);
        touchClientRegistry();
        recordActivity("Criou setor", `${found.client.name} / ${sector.name}`);
        recordAudit({ action: "Criou setor", entityType: "sector", entityId: sector.id, entityLabel: sector.name, clientId: found.client.id, after: sector });
        saveManagementChanges();
        showToast("Setor criado com sucesso.", "success");
        renderManagementSectors();
      }

      async function editManagementSector(client, sector) {
        if (!client || !sector || !requirePermission(canManageSectors, "Você não tem permissão para editar setores.")) return;
        const values = await openManagementFormModal({
          title: `Editar setor: ${sector.name}`,
          fields: [
            { name: "name", label: "Nome do setor", value: sector.name, required: true },
            { name: "status", label: "Status", type: "select", value: sector.status, options: CLIENT_STATUSES },
            { name: "description", label: "Descrição", type: "textarea", value: sector.description, wide: true },
            { name: "notes", label: "Observações", type: "textarea", value: sector.notes, wide: true }
          ],
          validate: data => !data.name ? "Informe o nome do setor." : ""
        });
        if (!values) return;
        const before = deepClone(sector);
        Object.assign(sector, values);
        sector.updatedAt = new Date().toISOString();
        touchClientRegistry();
        recordActivity("Editou setor", sector.name);
        recordAudit({ action: "Editou setor", entityType: "sector", entityId: sector.id, entityLabel: sector.name, clientId: client.id, before, after: sector });
        saveManagementChanges();
        showToast("Setor atualizado.", "success");
        renderManagementSectors();
      }

      async function archiveManagementSector(client, sector) {
        if (!client || !sector || sector.id === DEFAULT_SECTOR_ID || !requirePermission(canManageSectors, "Você não tem permissão para arquivar setores.")) return;
        if (!await managementConfirm(`Arquivar o setor "${sector.name}"?`)) return;
        sector.status = "archived";
        sector.updatedAt = new Date().toISOString();
        recordActivity("Arquivou setor", sector.name);
        recordAudit({ action: "Arquivou setor", entityType: "sector", entityId: sector.id, entityLabel: sector.name, clientId: client.id, after: sector, severity: "warning" });
        saveManagementChanges();
        renderManagementSectors();
      }

      async function editManagementAccessScope(permission) {
        if (!permission || !requirePermission(canManageAccessScopes, "Você não tem permissão para editar escopos.")) return;
        const values = await openManagementFormModal({
          title: `Editar escopo: ${permission.email}`,
          description: "Defina o papel e os clientes que este acesso poderá consultar.",
          fields: [
            { name: "role", label: "Papel", type: "select", value: permission.role, options: Object.entries(ACCESS_ROLES).filter(([key]) => key !== "owner").map(([value, label]) => ({ value, label })) },
            { name: "status", label: "Status", type: "select", value: permission.status || "active", options: [{ value: "active", label: "Ativo" }, { value: "inactive", label: "Inativo" }] },
            { name: "allClients", label: "Todos os clientes", type: "checkbox", value: permission.scope?.allClients, help: "Liberar acesso a todos os clientes cadastrados", wide: true },
            { name: "clientIds", label: "IDs de clientes específicos, separados por vírgula", type: "textarea", value: permission.scope?.clientIds?.join(", ") || "", wide: true }
          ]
        });
        if (!values) return;
        const before = deepClone(permission);
        permission.role = ACCESS_ROLES[values.role] && values.role !== "owner" ? values.role : permission.role;
        permission.status = values.status;
        const clientIds = values.allClients ? [] : values.clientIds.split(",").map(value => value.trim()).filter(Boolean);
        permission.scope = normalizeManagementScope({ ...permission.scope, allClients: values.allClients, clientIds });
        permission.updatedAt = new Date().toISOString();
        recordActivity("Editou acesso", permission.email);
        recordAudit({ action: "Editou acesso", entityType: "permission", entityId: permission.id, entityLabel: permission.email, before, after: permission });
        saveManagementChanges();
        showToast("Escopo de acesso atualizado.", "success");
        renderManagementAccesses();
      }

      function backupDataWithoutSnapshots(source = app) {
        const data = deepClone(sharedAppData(source));
        data.backupCenter = { ...data.backupCenter, snapshots: [] };
        return data;
      }

      function buildBackupSnapshotData(options = {}) {
        const type = options.type || "full";
        if (type === "client") {
          const client = findClient(options.clientId);
          return {
            client: client ? deepClone(client) : null,
            profiles: deepClone(app.profiles.filter(profile => profile.clientId === options.clientId))
          };
        }
        if (type === "plan") {
          const profile = app.profiles.find(item => item.id === options.profileId);
          const plan = profile?.plans.find(item => item.id === options.planId);
          const folder = profile?.folders.find(item => item.id === plan?.folderId);
          return {
            profile: profile ? deepClone({ ...profile, plans: [] }) : null,
            folder: folder ? deepClone(folder) : null,
            plan: plan ? deepClone(plan) : null
          };
        }
        if (type === "procedures") {
          return { procedureLibrary: deepClone(app.procedureLibrary) };
        }
        if (type === "templates") {
          return { actionPlanTemplates: deepClone(app.actionPlanTemplates) };
        }
        return backupDataWithoutSnapshots();
      }

      function createInternalBackup(label = "", options = {}) {
        if (!options.automatic && !requirePermission(canManageBackups, "Você não tem permissão para criar backups.")) return null;
        if (options.automatic && app.backupCenter?.settings?.autoBackupBeforeDestructiveAction === false) return null;
        const data = buildBackupSnapshotData(options);
        const snapshot = { id: createId(), type: options.type || "full", label: label || `Backup ${formatDateTime(new Date().toISOString())}`, createdAt: new Date().toISOString(), createdBy: currentUser?.email || "", clientId: options.clientId || "", profileId: options.profileId || "", planId: options.planId || "", size: new Blob([JSON.stringify(data)]).size, data };
        app.backupCenter.snapshots.unshift(snapshot);
        pruneSystemStorage();
        recordActivity("Criou backup", snapshot.label);
        recordAudit({ action: "Criou backup", entityType: "backup", entityId: snapshot.id, entityLabel: snapshot.label, summary: snapshot.type });
        if (!options.automatic) {
          saveManagementChanges();
          renderManagementBackups();
        }
        return snapshot;
      }

      async function createScopedBackup(type) {
        if (!requirePermission(canManageBackups, "Você não tem permissão para criar backups.")) return;
        if (type === "procedures") return createInternalBackup("Backup de Procedimentos", { type: "procedures" });
        if (type === "templates") return createInternalBackup("Backup de Templates", { type: "templates" });
        if (type === "plan") {
          const plans = getAllManagementPlans();
          const values = await openManagementFormModal({ title: "Backup por plano", fields: [{ name: "planId", label: "Plano", type: "select", value: plans[0]?.plan.id || "", options: plans.map(item => ({ value: item.plan.id, label: `${item.profile.name} / ${item.plan.title}` })), required: true }] });
          if (!values) return;
          const item = plans.find(entry => entry.plan.id === values.planId);
          if (!item) return showToast("Plano não encontrado.", "danger");
          return createInternalBackup(`Backup do plano ${item.plan.title}`, { type: "plan", clientId: item.plan.clientId, profileId: item.profile.id, planId: item.plan.id });
        }
      }

      async function createFullBackupFromManagement() {
        if (!requirePermission(canManageBackups, "Você não tem permissão para criar backups.")) return;
        const values = await openManagementFormModal({ title: "Criar backup completo", description: "O backup ficará disponível na Central de backups e poderá ser baixado em JSON.", fields: [{ name: "label", label: "Nome do backup", value: `Backup completo ${new Date().toLocaleDateString("pt-BR")}`, required: true }], validate: data => !data.label ? "Informe o nome do backup." : "" });
        if (!values) return;
        createInternalBackup(values.label, { type: "full" });
        showToast("Backup criado com sucesso.", "success");
        if (activeManagementTab === "settings") renderManagementSettings();
      }

      async function restoreInternalBackup(snapshot) {
        if (!snapshot || !requirePermission(canRestoreBackups, "Você não tem permissão para restaurar backups.")) return;
        if (!await openConfirmModal({ title: "Restaurar backup", message: `O estado atual será substituído pelos dados de "${snapshot.label}". Um backup automático será criado antes.`, requiredText: "RESTAURAR BACKUP", confirmLabel: "Restaurar backup" })) return;
        createInternalBackup(`Antes de restaurar ${snapshot.label}`, { automatic: true });
        const preservedBackupCenter = deepClone(app.backupCenter);
        const legacyFullSnapshot = Array.isArray(snapshot.data?.profiles) && !!snapshot.data?.clientRegistry;
        if (legacyFullSnapshot && (snapshot.type === "client" || snapshot.type === "plan")) {
          app = normalizeApp(deepClone(snapshot.data));
        } else if (snapshot.type === "client") {
          const client = snapshot.data?.client ? normalizeClient(deepClone(snapshot.data.client)) : null;
          if (!client) return showToast("Este backup de cliente não possui dados válidos.");
          app.clientRegistry.clients = app.clientRegistry.clients.filter(item => item.id !== client.id);
          app.clientRegistry.clients.push(client);
          app.profiles = app.profiles.filter(profile => profile.clientId !== client.id);
          app.profiles.push(...(snapshot.data.profiles || []).map(normalizeProfile));
          app = normalizeApp(app);
        } else if (snapshot.type === "plan") {
          const restoredPlan = snapshot.data?.plan ? normalizePlan(deepClone(snapshot.data.plan)) : null;
          if (!restoredPlan) return showToast("Este backup de plano não possui dados válidos.");
          let profile = app.profiles.find(item => item.id === snapshot.profileId || item.id === snapshot.data?.profile?.id);
          if (!profile && snapshot.data?.profile) {
            profile = normalizeProfile({ ...deepClone(snapshot.data.profile), plans: [] });
            app.profiles.push(profile);
          }
          if (!profile) return showToast("O perfil vinculado ao plano não foi encontrado.");
          const folder = snapshot.data?.folder ? normalizeFolder(deepClone(snapshot.data.folder)) : null;
          if (folder && !profile.folders.some(item => item.id === folder.id)) profile.folders.push(folder);
          const planIndex = profile.plans.findIndex(item => item.id === restoredPlan.id);
          if (planIndex >= 0) profile.plans[planIndex] = restoredPlan;
          else profile.plans.push(restoredPlan);
          app = normalizeApp(app);
        } else if (snapshot.type === "procedures") {
          app.procedureLibrary = normalizeProcedureLibrary(deepClone(snapshot.data?.procedureLibrary));
        } else if (snapshot.type === "templates") {
          app.actionPlanTemplates = normalizeActionPlanTemplates(deepClone(snapshot.data?.actionPlanTemplates));
        } else {
          app = normalizeApp(deepClone(snapshot.data));
        }
        app.backupCenter = mergeBackupCenters(preservedBackupCenter, app.backupCenter);
        recordActivity("Restaurou backup", snapshot.label);
        recordAudit({ action: "Restaurou backup", entityType: "backup", entityId: snapshot.id, entityLabel: snapshot.label, severity: "warning" });
        saveManagementChanges();
        renderApp();
      }

      function exportFullSystemBackup() {
        if (!requirePermission(canExportFullSystem, "Você não tem permissão para exportar o sistema completo.")) return;
        const payload = { type: "sats-full-backup", version: APP_VERSION, exportedAt: new Date().toISOString(), exportedBy: currentUser?.email || "", data: backupDataWithoutSnapshots() };
        downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" }), `sats-backup-completo-${new Date().toISOString().slice(0, 10)}.json`);
        recordActivity("Exportou backup", "Backup completo do sistema.");
        recordAudit({ action: "Exportou backup", entityType: "system", entityId: SHARED_STATE_ID, summary: "Backup completo JSON." });
        saveManagementChanges();
      }

      function exportInternalBackup(snapshot) {
        if (!snapshot || !requirePermission(() => canManageBackups() || canExportFullSystem(), "Você não tem permissão para baixar backups.")) return;
        const payload = { type: "sats-internal-backup", version: APP_VERSION, exportedAt: new Date().toISOString(), exportedBy: currentUser?.email || "", snapshot: deepClone(snapshot) };
        downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" }), `${sanitizeFileName(snapshot.label || "backup-sats")}.json`);
        recordActivity("Exportou backup", snapshot.label);
        recordAudit({ action: "Exportou backup", entityType: "backup", entityId: snapshot.id, entityLabel: snapshot.label, summary: snapshot.type });
        saveManagementChanges();
      }

      function importFullSystemBackup() {
        if (!requirePermission(() => canImportFullSystem() || canManageBackups(), "Você não tem permissão para importar backups.")) return;
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json,.json";
        input.addEventListenerasync ("change", async () => {
          const file = input.files?.[0];
          if (!file) return;
          try {
            const parsed = JSON.parse(await file.text());
            if (parsed.type === "sats-internal-backup" && parsed.snapshot) {
              if (!canManageBackups()) throw new Error("Você não tem permissão para importar snapshots.");
              const imported = normalizeBackupCenter({ snapshots: [parsed.snapshot], settings: app.backupCenter.settings }).snapshots[0];
              if (!imported) throw new Error("Snapshot incompatível.");
              imported.id = createId();
              imported.label = `${imported.label} (importado)`;
              app.backupCenter.snapshots.unshift(imported);
              pruneSystemStorage();
              recordActivity("Importou backup", file.name);
              recordAudit({ action: "Importou backup", entityType: "backup", entityId: imported.id, entityLabel: imported.label, summary: imported.type });
              saveManagementChanges();
              renderManagementBackups();
              return;
            }
            const data = parsed.type === "sats-full-backup" ? parsed.data : parsed;
            if (!data || !Array.isArray(data.profiles)) throw new Error("Arquivo incompatível.");
            if (!canImportFullSystem()) throw new Error("Você não tem permissão para importar o sistema completo.");
            if (!await openConfirmModal({ title: "Importar sistema completo", message: "Os dados atuais serão substituídos pelo arquivo selecionado. Um backup automático será criado antes.", requiredText: "IMPORTAR SISTEMA", confirmLabel: "Importar sistema" })) return;
            createInternalBackup("Antes da importação completa", { automatic: true });
            const preservedBackupCenter = deepClone(app.backupCenter);
            app = normalizeApp(data);
            app.backupCenter = mergeBackupCenters(preservedBackupCenter, app.backupCenter);
            recordActivity("Importou backup", file.name);
            recordAudit({ action: "Importou backup", entityType: "system", entityId: SHARED_STATE_ID, summary: file.name, severity: "warning" });
            saveManagementChanges();
            renderApp();
          } catch (error) {
            showToast(`Não foi possível importar: ${error.message}`, "danger");
          }
        }, { once: true });
        input.click();
      }

      function touchSystemSettings() {
        app.systemSettings.updatedAt = new Date().toISOString();
        app.systemSettings.updatedBy = currentUser?.email || "";
      }

      async function saveSystemSettingsSection(section) {
        if (section === "maintenance") {
          if (!requirePermission(canManageMaintenanceMode, "Você não tem permissão para gerenciar manutenção.")) return;
        } else if (!requirePermission(canManageSystemSettings, "Você não tem permissão para alterar configurações.")) return;
        app.systemSettings = normalizeSystemSettings(app.systemSettings);
        const before = deepClone(app.systemSettings[section === "security" ? "security" : section]);
        if (section === "branding") {
          const name = document.getElementById("systemBrandingAppName")?.value.trim();
          if (!name) return showToast("Informe o nome do sistema.", "warning");
          app.systemSettings.branding.appName = name;
          app.systemSettings.branding.subtitle = document.getElementById("systemBrandingSubtitle")?.value.trim() || "";
          app.systemSettings.branding.accentColor = document.getElementById("systemBrandingAccent")?.value || "#2563eb";
          if (document.getElementById("systemBrandingRemoveLogo")?.checked) app.systemSettings.branding.logoDataUrl = "";
          const file = document.getElementById("systemBrandingLogo")?.files?.[0];
          if (file) {
            if (!/^image\/(png|jpe?g)$/i.test(file.type)) return showToast("Selecione uma imagem PNG ou JPEG.", "warning");
            try {
              app.systemSettings.branding.logoDataUrl = await compressImageFileToDataUrl(file, { maxWidth: 480, maxHeight: 240, quality: 0.88 });
            } catch (error) {
              console.error(error);
              return showToast("Não foi possível processar a logo selecionada.", "danger");
            }
          }
        } else if (section === "maintenance") {
          const enabled = !!document.getElementById("systemMaintenanceEnabled")?.checked;
          const message = document.getElementById("systemMaintenanceMessage")?.value.trim();
          if (enabled && !message) return showToast("Informe a mensagem de manutenção.", "warning");
          app.systemSettings.maintenance.enabled = enabled;
          app.systemSettings.maintenance.message = message || createDefaultSystemSettings().maintenance.message;
          const emails = String(document.getElementById("systemMaintenanceEmails")?.value || "").split(/[,;\n]+/).map(normalizeEmail).filter(Boolean);
          app.systemSettings.maintenance.allowedEmails = [...new Set([normalizeEmail(SUPER_ADMIN_EMAIL), ...emails])];
        } else if (section === "exports") {
          app.systemSettings.exports.defaultFormat = document.getElementById("systemExportsFormat")?.value || "pdf";
          app.systemSettings.exports.includeLogo = !!document.getElementById("systemExportsLogo")?.checked;
          app.systemSettings.exports.includeRevision = !!document.getElementById("systemExportsRevision")?.checked;
        } else if (section === "security") {
          app.systemSettings.security.requireAdminModeForHiddenItems = !!document.getElementById("systemSecurityAdminHidden")?.checked;
          touchSystemSettings();
          recordActivity("Alterou configuração", "Segurança.");
          recordAudit({ action: "Alterou configuração", entityType: "settings", entityId: "security", before, after: app.systemSettings.security });
          saveManagementChanges();
          showToast("Segurança salva.", "success");
          renderManagementSettings();
          return;
        }
        touchSystemSettings();
        const labels = { branding: "Identidade visual", maintenance: "Modo manutenção", exports: "Preferências de exportação" };
        const action = section === "maintenance" ? (app.systemSettings.maintenance.enabled ? "Ativou modo manutenção" : "Desativou modo manutenção") : "Alterou configuração";
        recordActivity(action, labels[section] || section);
        recordAudit({ action, entityType: "settings", entityId: section, before, after: app.systemSettings[section], severity: section === "maintenance" && app.systemSettings.maintenance.enabled ? "warning" : "info" });
        saveManagementChanges();
        showToast(`${labels[section] || "Configuração"} salva com sucesso.`, "success");
        if (section === "maintenance") renderApp();
        else {
          applySystemBranding();
          renderManagementSettings();
        }
      }

      async function editCommercialData(client) {
        if (!client || !requirePermission(() => canManageCommercial() || canManageLicenses(), "Você não tem permissão para alterar dados comerciais.")) return;
        const values = await openManagementFormModal({
          title: `Comercial: ${client.name}`,
          fields: [
            { name: "planName", label: "Plano comercial", value: client.commercial.planName },
            { name: "monthlyValue", label: "Valor mensal", value: client.commercial.monthlyValue },
            { name: "status", label: "Status", type: "select", value: client.commercial.status, options: COMMERCIAL_STATUSES },
            { name: "startDate", label: "Início", type: "date", value: client.commercial.startDate },
            { name: "endDate", label: "Fim", type: "date", value: client.commercial.endDate },
            { name: "maxUsers", label: "Limite de usuários", type: "number", value: client.commercial.maxUsers },
            { name: "maxPlans", label: "Limite de planos", type: "number", value: client.commercial.maxPlans },
            { name: "maxUnits", label: "Limite de unidades", type: "number", value: client.commercial.maxUnits },
            { name: "notes", label: "Observações comerciais", type: "textarea", value: client.commercial.notes, wide: true }
          ]
        });
        if (!values) return;
        const before = deepClone(client.commercial);
        Object.assign(client.commercial, values);
        client.contractStatus = client.commercial.status;
        client.updatedAt = new Date().toISOString();
        touchClientRegistry();
        recordActivity("Alterou contrato", client.name);
        recordAudit({ action: "Alterou contrato", entityType: "client", entityId: client.id, entityLabel: client.name, clientId: client.id, before, after: client.commercial });
        saveManagementChanges();
        showToast("Dados comerciais atualizados.", "success");
        renderManagementCommercial();
      }

      async function repairCommonDataIssues() {
        if (!requirePermission(canRepairData, "Você não tem permissão para reparar dados.")) return;
        if (!await openConfirmModal({ title: "Reparar dados", message: "Um backup automático será criado antes do reparo.", requiredText: "REPARAR DADOS", confirmLabel: "Reparar" })) return;
        createInternalBackup("Antes do reparo de dados", { automatic: true });
        const before = runDataDiagnostics();
        app = normalizeApp(app);
        app.profiles.forEach(profile => profile.plans.forEach(plan => {
          if (!profile.folders.some(folder => folder.id === plan.folderId)) plan.folderId = DEFAULT_FOLDER_ID;
        }));
        recordActivity("Reparou dados", "Reparo seguro executado.");
        recordAudit({ action: "Reparou dados", entityType: "system", entityId: SHARED_STATE_ID, summary: `${before.orphanPlans.length} plano(s) sem pasta válida normalizado(s).`, severity: "warning" });
        saveManagementChanges();
        renderManagementDiagnostics();
      }

      async function handleManagementClick(event) {
        if (!canAccessManagementPhase1()) return showAppSelector();
        const button = event.target.closest("[data-management-action]");
        if (!button) return;
        const action = button.dataset.managementAction;
        const profile = app.profiles.find(item => item.id === button.dataset.profileId);
        const plan = profile?.plans.find(item => item.id === button.dataset.planId);
        const folder = profile?.folders.find(item => item.id === button.dataset.folderId);
        const suggestionCard = button.closest("[data-improvement-id]");
        const suggestionId = suggestionCard?.dataset.improvementId || button.dataset.suggestionId || "";
        const suggestion = suggestionId ? app.improvementSuggestions.find(item => item.id === suggestionId) : null;
        const permission = (app.managementPermissions?.users || []).find(item => item.id === button.dataset.permissionId);
        const actionPlanTemplate = (app.actionPlanTemplates || []).find(item => item.id === button.dataset.templateId);
        const client = button.dataset.clientId ? findClient(button.dataset.clientId) : null;
        const unit = button.dataset.unitId ? client?.units?.find(item => item.id === button.dataset.unitId) || findUnit(button.dataset.unitId)?.unit || null : null;
        const sector = button.dataset.sectorId ? client?.sectors?.find(item => item.id === button.dataset.sectorId) || findSector(button.dataset.sectorId)?.sector || null : null;
        const backup = (app.backupCenter?.snapshots || []).find(item => item.id === button.dataset.backupId);
        const procedureLibrary = getProcedureLibrary();
        const procedureDraft = procedureLibrary.draft;
        const procedureReportId = button.dataset.reportId || activePhysicalReportId;
        const procedureReport = procedureDraft && getProcedureCategory(procedureDraft, "laudos-fisicos")?.items?.find(item => item.id === procedureReportId);
        const procedureNode = procedureReport && procedureReport.nodes[button.dataset.nodeId];
        const procedureEditActions = new Set(["new-physical-report", "duplicate-physical-report", "toggle-physical-report", "delete-physical-report", "restore-physical-report", "move-physical-report-up", "move-physical-report-down", "add-flow-node", "move-flow-node-up", "move-flow-node-down", "set-root-node", "duplicate-flow-node", "delete-flow-node", "add-flow-option", "delete-flow-option", "add-result-block", "delete-result-block", "discard-procedure-draft"]);
        if (procedureEditActions.has(action) && !canEditProcedureDrafts()) return showToast("Você não tem permissão para editar procedimentos.");

        if (action === "procedure-view") {
          activeProcedureAdminView = button.dataset.procedureView || "overview";
          return renderManagementProcedures();
        }
        if (action === "create-procedure-draft") {
          ensureProcedureDraft();
          activeProcedureAdminView = "physical";
          return renderManagementProcedures();
        }
        if (action === "save-procedure-draft") return saveProcedureDraft();
        if (action === "new-physical-report") return createNewPhysicalReport();
        if (action === "edit-physical-report" && button.dataset.reportId) {
          activePhysicalReportId = button.dataset.reportId;
          activeProcedureAdminView = "physical";
          return renderManagementProcedures();
        }
        if (action === "duplicate-physical-report" && procedureReport) return duplicatePhysicalReport(procedureReport);
        if (action === "toggle-physical-report" && procedureReport) {
          if (!canEditProcedureDrafts()) return showToast("Você não tem permissão para editar procedimentos.");
          procedureReport.active = !procedureReport.active;
          procedureReport.updatedAt = new Date().toISOString();
          procedureReport.updatedBy = currentUser?.email || "";
          touchProcedureDraft();
          recordActivity(procedureReport.active ? "Ativou risco físico" : "Desativou risco físico", procedureReport.title);
          saveManagementChanges();
          return renderManagementProcedures();
        }
        if (action === "delete-physical-report" && procedureReport) {
          if (!canEditProcedureDrafts()) return showToast("Você não tem permissão para editar procedimentos.");
          if (!await openConfirmModal({ title: "Excluir risco físico", message: `O risco "${procedureReport.title}" será movido para a lixeira do rascunho.`, requiredText: "EXCLUIR RISCO", confirmLabel: "Excluir risco" })) return;
          procedureReport.deleted = true;
          procedureReport.active = false;
          touchProcedureDraft();
          recordActivity("Excluiu risco físico", procedureReport.title);
          saveManagementChanges();
          activePhysicalReportId = null;
          return renderManagementProcedures();
        }
        if (action === "restore-physical-report" && procedureReport) {
          procedureReport.deleted = false;
          procedureReport.active = true;
          procedureReport.updatedAt = new Date().toISOString();
          procedureReport.updatedBy = currentUser?.email || "";
          touchProcedureDraft();
          recordActivity("Ativou risco físico", `Restaurou ${procedureReport.title} na lixeira do rascunho.`);
          saveManagementChanges();
          activePhysicalReportId = procedureReport.id;
          return renderManagementProcedures();
        }
        if (action === "move-physical-report-up" && procedureReport) return movePhysicalReport(procedureReport, "up");
        if (action === "move-physical-report-down" && procedureReport) return movePhysicalReport(procedureReport, "down");
        if (action === "add-flow-node" && procedureReport) return addFlowNode(procedureReport);
        if (action === "move-flow-node-up" && procedureNode) return moveProcedureNode(procedureReport, procedureNode.id, "up");
        if (action === "move-flow-node-down" && procedureNode) return moveProcedureNode(procedureReport, procedureNode.id, "down");
        if (action === "set-root-node" && procedureNode) {
          if (!canEditProcedureDrafts()) return showToast("Você não tem permissão para editar procedimentos.");
          procedureReport.rootNodeId = procedureNode.id;
          touchProcedureDraft();
          return renderManagementProcedures();
        }
        if (action === "duplicate-flow-node" && procedureNode) {
          if (!canEditProcedureDrafts()) return showToast("Você não tem permissão para editar procedimentos.");
          let id = `${procedureNode.id}-copia`;
          while (procedureReport.nodes[id]) id += "-nova";
          procedureReport.nodes[id] = normalizeFlowNode({ ...deepClone(procedureNode), id }, id);
          touchProcedureDraft();
          return renderManagementProcedures();
        }
        if (action === "delete-flow-node" && procedureNode) {
          if (!canEditProcedureDrafts()) return showToast("Você não tem permissão para editar procedimentos.");
          if (!await managementConfirm(`Excluir o nó "${procedureNode.id}"?`)) return;
          delete procedureReport.nodes[procedureNode.id];
          if (procedureReport.rootNodeId === procedureNode.id) procedureReport.rootNodeId = Object.keys(procedureReport.nodes)[0] || "";
          touchProcedureDraft();
          return renderManagementProcedures();
        }
        if (action === "add-flow-option" && procedureNode) {
          procedureNode.options.push(normalizeFlowOption({ label: "NOVA OPÇÃO", tone: "info", nextNodeId: "" }, procedureNode.options.length));
          touchProcedureDraft();
          return renderManagementProcedures();
        }
        if (action === "delete-flow-option" && procedureNode) {
          procedureNode.options.splice(Number(button.dataset.optionIndex), 1);
          touchProcedureDraft();
          return renderManagementProcedures();
        }
        if (action === "add-result-block" && procedureNode) {
          procedureNode.blocks.push(normalizeResultBlock({ title: "Novo bloco", text: "", copyable: true }, procedureNode.blocks.length));
          touchProcedureDraft();
          return renderManagementProcedures();
        }
        if (action === "delete-result-block" && procedureNode) {
          procedureNode.blocks.splice(Number(button.dataset.resultIndex), 1);
          touchProcedureDraft();
          return renderManagementProcedures();
        }
        if (action === "preview-report-flow" && procedureReport) {
          activePhysicalReportId = procedureReport.id;
          activeProcedurePreviewSource = "draft";
          activeFlowPreviewState[procedureReport.id] = [procedureReport.rootNodeId];
          activeProcedureAdminView = "preview";
          return renderManagementProcedures();
        }
        if (action === "preview-published-procedures") {
          activeProcedurePreviewSource = "published";
          activePhysicalReportId = null;
          activeProcedureAdminView = "preview";
          return renderManagementProcedures();
        }
        if (action === "preview-draft-procedures") {
          activeProcedurePreviewSource = "draft";
          activePhysicalReportId = null;
          activeProcedureAdminView = "preview";
          return renderManagementProcedures();
        }
        if (action === "preview-procedure-version") {
          activeProcedurePreviewSource = "version";
          activeProcedureVersionPreviewId = button.dataset.versionId || "";
          activePhysicalReportId = null;
          activeProcedureAdminView = "preview";
          return renderManagementProcedures();
        }
        if (action === "preview-flow-choice") {
          const snapshot = getProcedurePreviewSnapshot(procedureLibrary);
          const report = getProcedureReport(snapshot);
          if (!report || !report.nodes[button.dataset.nextNodeId]) return;
          const path = activeFlowPreviewState[report.id] || [report.rootNodeId];
          path.push(button.dataset.nextNodeId);
          activeFlowPreviewState[report.id] = path;
          return renderManagementProcedures();
        }
        if (action === "preview-flow-back" || action === "preview-flow-reset") {
          const snapshot = getProcedurePreviewSnapshot(procedureLibrary);
          const report = getProcedureReport(snapshot);
          if (!report) return;
          const path = activeFlowPreviewState[report.id] || [report.rootNodeId];
          activeFlowPreviewState[report.id] = action === "preview-flow-reset" ? [report.rootNodeId] : path.slice(0, -1);
          if (!activeFlowPreviewState[report.id].length) activeFlowPreviewState[report.id] = [report.rootNodeId];
          return renderManagementProcedures();
        }
        if (action === "copy-preview-result") {
          const snapshot = getProcedurePreviewSnapshot(procedureLibrary);
          const report = getProcedureReport(snapshot);
          const path = report && (activeFlowPreviewState[report.id] || [report.rootNodeId]);
          const node = report && report.nodes[path[path.length - 1]];
          const block = node?.blocks?.[Number(button.dataset.blockIndex)];
          if (block) await copyTextToClipboard(block.text);
          return;
        }
        if (action === "publish-procedure-draft") return publishProcedureDraft(document.getElementById("procedureChangeSummary")?.value || "");
        if (action === "discard-procedure-draft") {
          if (!canEditProcedureDrafts()) return showToast("Você não tem permissão para editar procedimentos.");
          if (!await openConfirmModal({ title: "Descartar rascunho", message: "Todas as alterações ainda não publicadas serão descartadas.", requiredText: "DESCARTAR", confirmLabel: "Descartar rascunho" })) return;
          procedureLibrary.draft = null;
          activePhysicalReportId = null;
          saveManagementChanges();
          activeProcedureAdminView = "overview";
          return renderManagementProcedures();
        }
        if (action === "restore-procedure-version") return restoreProcedureVersionAsDraft(button.dataset.versionId, false);
        if (action === "restore-publish-procedure-version") return restoreProcedureVersionAsDraft(button.dataset.versionId, true);
        if (action === "export-procedure-all") return exportProcedureJson(procedureLibrary, `sats-procedimentos-backup-${new Date().toISOString().slice(0, 10)}.json`);
        if (action === "export-procedure-published") return exportProcedureJson(procedureLibrary.published, `sats-procedimentos-publicado-${new Date().toISOString().slice(0, 10)}.json`);
        if (action === "export-procedure-draft" && procedureLibrary.draft) return exportProcedureJson(procedureLibrary.draft, `sats-procedimentos-rascunho-${new Date().toISOString().slice(0, 10)}.json`);
        if (action === "export-procedure-version") {
          const version = procedureLibrary.versions.find(item => item.id === button.dataset.versionId);
          if (version) return exportProcedureJson(version, `sats-procedimentos-${version.versionLabel}.json`);
        }
        if (action === "export-physical-report" && procedureReport) return exportProcedureJson(procedureReport, `sats-risco-${procedureReport.id}.json`, "Exportou risco físico");
        if (action === "import-procedure-library") return importProcedureJson("library");
        if (action === "import-physical-report") return importProcedureJson("report");
        if (action === "plans-view") {
          activeManagementPlansView = button.dataset.plansView === "templates" ? "templates" : "plans";
          return renderManagementPlans();
        }
        if (action === "new-action-template") return openActionPlanTemplateModal();
        if (action === "edit-action-template" && actionPlanTemplate) return openActionPlanTemplateModal(actionPlanTemplate.id);
        if (action === "duplicate-action-template" && actionPlanTemplate) return duplicateActionPlanTemplate(actionPlanTemplate);
        if (action === "toggle-action-template" && actionPlanTemplate) return toggleActionPlanTemplate(actionPlanTemplate);
        if (action === "delete-action-template" && actionPlanTemplate) return deleteActionPlanTemplate(actionPlanTemplate);
        if (action === "restore-default-action-template" && actionPlanTemplate) return restoreDefaultActionPlanTemplate(actionPlanTemplate);
        if (action === "new-client") return createManagementClient();
        if (action === "edit-client" && client) return editManagementClient(client);
        if (action === "archive-client" && client) return archiveManagementClient(client);
        if (action === "export-client" && client) return exportManagementClient(client);
        if (action === "new-unit") return createManagementUnit();
        if (action === "edit-unit" && client && unit) return editManagementUnit(client, unit);
        if (action === "archive-unit" && client && unit) return archiveManagementUnit(client, unit);
        if (action === "new-sector") return createManagementSector();
        if (action === "edit-sector" && client && sector) return editManagementSector(client, sector);
        if (action === "archive-sector" && client && sector) return archiveManagementSector(client, sector);
        if (action === "edit-access-scope" && permission) return editManagementAccessScope(permission);
        if (action === "create-full-backup") return createFullBackupFromManagement();
        if (action === "create-plan-backup") return createScopedBackup("plan");
        if (action === "create-template-backup") return createScopedBackup("templates");
        if (action === "create-procedure-backup") return createScopedBackup("procedures");
        if (action === "download-backup" && backup) return exportInternalBackup(backup);
        if (action === "restore-backup" && backup) return restoreInternalBackup(backup);
        if (action === "delete-backup" && backup) {
          if (!requirePermission(canManageBackups, "Você não tem permissão para excluir backups.")) return;
          if (!await openConfirmModal({ title: "Excluir backup", message: `O backup "${backup.label}" será removido definitivamente.`, requiredText: "EXCLUIR BACKUP", confirmLabel: "Excluir backup" })) return;
          app.backupCenter.snapshots = app.backupCenter.snapshots.filter(item => item.id !== backup.id);
          saveManagementChanges();
          return renderManagementBackups();
        }
        if (action === "export-full-system") return exportFullSystemBackup();
        if (action === "import-full-system") return importFullSystemBackup();
        if (action === "clear-audit") {
          if (!requirePermission(canDeleteAuditTrail, "Você não tem permissão para limpar a auditoria.")) return;
          if (!await openConfirmModal({ title: "Limpar auditoria", message: "Os registros atuais de auditoria serão removidos.", requiredText: "LIMPAR AUDITORIA", confirmLabel: "Limpar auditoria" })) return;
          app.auditTrail = [];
          recordAudit({ action: "Limpou auditoria", entityType: "system", entityId: SHARED_STATE_ID, severity: "warning" });
          saveManagementChanges();
          return renderManagementAuditTrail();
        }
        if (action === "save-system-branding") return saveSystemSettingsSection("branding");
        if (action === "save-system-maintenance") return saveSystemSettingsSection("maintenance");
        if (action === "save-system-exports") return saveSystemSettingsSection("exports");
        if (action === "save-system-security") return saveSystemSettingsSection("security");
        if (action === "edit-commercial" && client) return editCommercialData(client);
        if (action === "run-diagnostics") {
          if (!requirePermission(canRunDiagnostics, "Você não tem permissão para executar diagnóstico.")) return;
          recordActivity("Rodou diagnóstico", "Executou diagnóstico geral.");
          recordAudit({ action: "Rodou diagnóstico", entityType: "system", entityId: SHARED_STATE_ID });
          return renderManagementDiagnostics();
        }
        if (action === "repair-data") return repairCommonDataIssues();

        if (action === "locate-profile" && profile) return showToast(`Perfil: ${profile.name}\nEmpresa: ${profile.company || "-"}\nPlanos: ${getManagementPlansForProfile(profile).length}`);
        if (action === "locate-plan" && profile && plan) {
          const planFolder = (profile.folders || []).find(item => item.id === plan.folderId);
          return showToast(`Plano: ${plan.title}\nPerfil: ${profile.name}\nPasta: ${planFolder?.name || "Sem pasta"}`);
        }
        if (action === "new-profile") return createManagementProfile();
        if (action === "edit-profile" && profile) return editManagementProfile(profile);
        if (action === "delete-profile" && profile) return deleteManagementProfile(profile);
        if (action === "toggle-profile-hidden" && profile) return toggleManagementProfileHidden(profile);
        if (action === "open-profile" && profile) return openManagementProfile(profile);
        if (action === "new-folder") return createManagementFolder();
        if (action === "open-folder" && profile && folder) return openManagementFolder(profile, folder);
        if (action === "edit-folder" && profile && folder) return editManagementFolder(profile, folder);
        if (action === "delete-folder" && profile && folder) return deleteManagementFolder(profile, folder);
        if (action === "toggle-folder-hidden" && profile && folder) return toggleManagementFolderHidden(profile, folder);
        if (action === "open-plan" && profile && plan) return openManagementPlan(profile, plan);
        if (action === "rename-plan" && profile && plan) return renameManagementPlan(profile, plan);
        if (action === "duplicate-plan" && profile && plan) return duplicateManagementPlan(profile, plan);
        if (action === "copy-plan" && profile && plan) return copyManagementPlan(profile, plan);
        if (action === "move-plan" && profile && plan) return moveManagementPlan(profile, plan);
        if (action === "delete-plan" && profile && plan) return deleteManagementPlan(profile, plan);
        if (action === "copy-suggestion" && suggestion) {
          await copyTextToClipboard(suggestion.text);
          return showToast("Sugestão copiada.");
        }
        if (action === "copy-suggestion-report" && suggestion?.resolutionReport) {
          await copyTextToClipboard(suggestion.resolutionReport.technicalMessage);
          return showToast("Relatório copiado.", "success");
        }
        if (action === "suggestion-view") {
          activeManagementSuggestionView = button.dataset.suggestionView || "open";
          return renderManagementSuggestions();
        }
        if ((action === "resolve-suggestion" || action === "view-suggestion-report") && suggestion) {
          return openSuggestionResolutionReport(suggestion);
        }
        if (action === "reject-suggestion" && suggestion) return openSuggestionRejection(suggestion);
        if ((action === "reopen-suggestion" || action === "restore-rejected-suggestion") && suggestion) {
          if (!canManageSuggestions()) return showToast("Você não tem permissão para gerenciar sugestões.", "danger");
          const restoredRejected = action === "restore-rejected-suggestion";
          suggestion.status = "open";
          suggestion.resolvedAt = "";
          suggestion.resolvedBy = "";
          suggestion.rejectedAt = "";
          suggestion.rejectedBy = "";
          if (restoredRejected) suggestion.rejectionReport = null;
          suggestion.updatedAt = new Date().toISOString();
          recordActivity(restoredRejected ? "Restaurou sugestão rejeitada" : "Reabriu sugestão", suggestion.text.slice(0, 180));
          saveApp({ improvements: true });
          activeManagementSuggestionView = "open";
          return renderManagementSuggestions();
        }
        if (action === "copy-rejection-reason" && suggestion?.rejectionReport) {
          await copyTextToClipboard([suggestion.rejectionReport.reason, suggestion.rejectionReport.technicalMessage].filter(Boolean).join("\n\n"));
          return showToast("Motivo copiado.", "success");
        }
        if (["view-suggestion-attachment", "download-suggestion-attachment", "remove-suggestion-attachment"].includes(action) && suggestion?.attachments?.[0]) {
          const attachment = suggestion.attachments[0];
          if (action === "view-suggestion-attachment") return openSuggestionAttachment(attachment);
          if (action === "download-suggestion-attachment") return downloadSuggestionAttachment(attachment);
          if (!canManageSuggestions()) return showToast("Você não tem permissão para remover anexos.", "danger");
          if (!await openConfirmModal({ title: "Remover anexo", message: `O arquivo "${attachment.name}" será removido da sugestão.`, confirmLabel: "Remover anexo" })) return;
          suggestion.attachments = [];
          suggestion.updatedAt = new Date().toISOString();
          recordActivity("Removeu anexo da sugestão", attachment.name);
          saveApp({ improvements: true });
          return renderManagementSuggestions();
        }
        if (action === "remove-suggestion-star" && suggestion) {
          removeSuggestionRankingEntry(suggestion.requesterEmail, suggestion.requesterProfileId);
          recordActivity("Removeu estrela", suggestion.requesterEmail || suggestion.requesterName);
          saveApp({ improvements: true });
          return renderManagementSuggestions();
        }
        if (action === "remove-ranking-entry") {
          if (!canManageSuggestions()) return showToast("Você não tem permissão para editar o ranking.", "danger");
          removeSuggestionRankingEntry(button.dataset.rankingEmail, button.dataset.rankingProfileId);
          recordActivity("Removeu estrela", button.dataset.rankingEmail || button.dataset.rankingProfileId);
          saveApp({ improvements: true });
          return renderManagementSuggestions();
        }
        if (action === "clear-suggestion-ranking") {
          if (!canManageSuggestions()) return showToast("Você não tem permissão para limpar o ranking.", "danger");
          if (!await openConfirmModal({ title: "Limpar ranking semanal", message: "Todas as estrelas e pontuações da semana atual serão removidas.", requiredText: "LIMPAR RANKING", confirmLabel: "Limpar ranking" })) return;
          app.suggestionWeeklyRanking = normalizeSuggestionWeeklyRanking();
          recordActivity("Limpou ranking semanal", getCurrentSuggestionWeekKey());
          saveApp({ improvements: true });
          return renderManagementSuggestions();
        }
        if (action === "clear-suggestion-notifications") {
          if (!canManageSuggestions()) return showToast("Você não tem permissão para excluir notificações.", "danger");
          if (!await openConfirmModal({ title: "Excluir notificações enviadas", message: "Todas as notificações internas de sugestões serão removidas.", requiredText: "EXCLUIR NOTIFICAÇÕES", confirmLabel: "Excluir notificações" })) return;
          app.suggestionNotifications = [];
          recordActivity("Removeu notificações de sugestão", "Removeu todas as notificações internas.");
          saveManagementChanges();
          return renderManagementSuggestions();
        }
        if (action === "clear-suggestion-center") {
          if (!canManageSuggestions()) return showToast("Você não tem permissão para limpar sugestões.", "danger");
          if (!await openConfirmModal({ title: "Limpar central de sugestões", message: "Todas as sugestões, anexos, relatórios, notificações e estrelas serão removidos.", requiredText: "LIMPAR SUGESTÕES", confirmLabel: "Limpar tudo" })) return;
          app.improvementSuggestions = [];
          app.suggestionNotifications = [];
          app.suggestionWeeklyRanking = normalizeSuggestionWeeklyRanking();
          recordActivity("Excluiu sugestão", "Limpou toda a central de sugestões.");
          saveManagementChanges();
          activeManagementSuggestionView = "open";
          return renderManagementSuggestions();
        }
        if ((action === "mark-suggestion-report-seen" || action === "mark-suggestion-report-unseen") && suggestion?.resolutionReport) {
          if (!canManageSuggestions()) return showToast("Você não tem permissão para editar relatórios.", "danger");
          const seenAt = action === "mark-suggestion-report-seen" ? new Date().toISOString() : "";
          suggestion.resolutionReport.seenAt = seenAt;
          suggestion.resolutionReport.status = seenAt ? "seen" : "sent";
          app.suggestionNotifications.filter(item => item.suggestionId === suggestion.id).forEach(item => { item.seenAt = seenAt; });
          suggestion.updatedAt = new Date().toISOString();
          saveApp({ improvements: true });
          return renderManagementSuggestions();
        }
        if (action === "remove-suggestion-report" && suggestion?.resolutionReport) {
          if (!canManageSuggestions()) return showToast("Você não tem permissão para remover relatórios.", "danger");
          if (!await openConfirmModal({ title: "Remover relatório", message: "O relatório enviado e suas notificações serão removidos. A sugestão voltará para pendente.", requiredText: "REMOVER RELATÓRIO", confirmLabel: "Remover relatório" })) return;
          app.suggestionNotifications = app.suggestionNotifications.filter(item => item.suggestionId !== suggestion.id);
          suggestion.resolutionReport = null;
          suggestion.status = "open";
          suggestion.resolvedAt = "";
          suggestion.resolvedBy = "";
          suggestion.updatedAt = new Date().toISOString();
          recordActivity("Removeu relatório", suggestion.text.slice(0, 180));
          saveManagementChanges();
          activeManagementSuggestionView = "open";
          return renderManagementSuggestions();
        }
        if (action === "delete-suggestion" && suggestion) {
          if (!canManageSuggestions()) return showToast("Você não tem permissão para excluir sugestões.", "danger");
          if (!await openConfirmModal({ title: "Excluir sugestão", message: "A sugestão, anexo, relatório e notificações relacionadas serão removidos.", requiredText: "EXCLUIR SUGESTÃO", confirmLabel: "Excluir sugestão" })) return;
          app.improvementSuggestions = app.improvementSuggestions.filter(item => item.id !== suggestion.id);
          app.suggestionNotifications = app.suggestionNotifications.filter(item => item.suggestionId !== suggestion.id);
          if (suggestion.status === "resolved") decrementSuggestionRankingEntry(suggestion.requesterEmail, suggestion.requesterProfileId);
          recordActivity("Excluiu sugestão", suggestion.text.slice(0, 180));
          saveManagementChanges();
          renderManagementSuggestions();
          return;
        }
        if (action === "copy-log") {
          if (!canViewActivity()) return showToast("Você não tem permissão para visualizar atividades.");
          const entries = normalizeActivityLog([...(app.activityLog || []), ...restrictedAccessLogs]);
          await copyTextToClipboard(entries.map(entry => `${formatDateTime(entry.at)} | ${entry.action} | ${activityActor(entry)} | ${entry.detail || ""}`).join("\n"));
          return showToast("Log copiado.");
        }
        if (action === "select-log") {
          if (!canDeleteLogs()) return showToast("Você não tem permissão para excluir logs.");
          if (button.checked) selectedManagementLogIds.add(button.dataset.logId);
          else selectedManagementLogIds.delete(button.dataset.logId);
          return renderManagementActivity();
        }
        if (action === "select-all-logs") {
          if (!canDeleteLogs()) return showToast("Você não tem permissão para excluir logs.");
          const localIds = new Set((app.activityLog || []).map(entry => entry.id));
          const filteredIds = getFilteredManagementActivityEntries().filter(entry => localIds.has(entry.id)).map(entry => entry.id);
          if (button.checked) filteredIds.forEach(id => selectedManagementLogIds.add(id));
          else filteredIds.forEach(id => selectedManagementLogIds.delete(id));
          return renderManagementActivity();
        }
        if (action === "delete-selected-logs") return deleteSelectedManagementLogs();
        if (action === "delete-filtered-logs") return deleteFilteredManagementLogs();
        if (action === "clear-all-logs") return clearAllManagementLogs();
        if (action === "new-permission") return openManagementPermissionModal();
        if (action === "edit-permission" && permission) return openManagementPermissionModal(permission.id);
        if (action === "copy-permission-email" && permission) {
          await copyTextToClipboard(permission.email);
          return showToast("E-mail copiado.");
        }
        if (action === "delete-permission" && permission) {
          if (!requireManagementPermission("managePermissions", "Você não tem permissão para remover acessos.")) return;
          if (!await managementConfirm(`Remover as permissões específicas de ${permission.email}?`)) return;
          app.managementPermissions.users = app.managementPermissions.users.filter(item => item.id !== permission.id);
          recordActivity("Removeu permissão", `Removeu as permissões específicas de ${permission.email}.`);
          saveManagementChanges();
          renderManagementPermissions();
        }
      }

      function openManagementProfile(profile) {
        if (!canManageProfiles()) return showToast("Você não tem permissão para abrir perfis pela Gestão.");
        if (profile.hidden && !canAccessHiddenItems()) return showToast("Ative o modo administrador ou solicite permissão para abrir este perfil oculto.");
        managementPlanEditContext = null;
        selectedPortalApp = "plans";
        app.activeProfileId = profile.id;
        app.activeFolderId = DEFAULT_FOLDER_ID;
        app.activePlanId = null;
        app.view = "folders";
        saveApp({ localOnly: true });
        renderApp();
      }

      function openManagementFolder(profile, folder) {
        if (!canManageFolders()) return showToast("Você não tem permissão para abrir pastas pela Gestão.");
        if ((profile.hidden || folder.hidden) && !canAccessHiddenItems()) return showToast("Ative o modo administrador ou solicite permissão para abrir este item oculto.");
        managementPlanEditContext = null;
        selectedPortalApp = "plans";
        app.activeProfileId = profile.id;
        app.activeFolderId = folder.id;
        app.activePlanId = null;
        app.view = "folders";
        saveApp({ localOnly: true });
        renderApp();
      }

      function openManagementPlan(profile, plan) {
        if (!canManagePlans()) return showToast("Você não tem permissão para abrir planos pela Gestão.");
        const folder = (profile.folders || []).find(item => item.id === plan.folderId);
        if ((profile.hidden || folder?.hidden) && !canAccessHiddenItems()) return showToast("Ative o modo administrador ou solicite permissão para abrir este item oculto.");
        managementPlanEditContext = { profileId: profile.id, planId: plan.id };
        selectedPortalApp = "plans";
        app.activeProfileId = profile.id;
        app.activeFolderId = plan.folderId || DEFAULT_FOLDER_ID;
        app.activePlanId = plan.id;
        app.view = "editor";
        saveApp({ localOnly: true });
        renderApp();
      }

      function handleAppChoice(event) {
        const choice = event.currentTarget.dataset.appChoice;
        if (choice === "procedures") {
          selectedPortalApp = "procedures";
          renderApp();
          return;
        }
        if (choice === "documentAutomation") {
          selectedPortalApp = "documentAutomation";
          if (canAccessDocumentAutomation()) {
            recordActivity("Acessou Automação de Documentos", "Abriu o módulo beta de automação.");
          } else {
            recordActivity("Tentou acessar Automação de Documentos", `Acesso bloqueado para ${currentUser?.email || "usuário"}.`);
          }
          renderApp();
          return;
        }
        if (choice === "plans") {
          selectedPortalApp = "plans";
          showProfiles();
          return;
        }
        if (choice === "management") {
          if (!canAccessManagementPhase1()) return;
          selectedPortalApp = "management";
          renderApp();
        }
      }

      function showAppSelector() {
        selectedPortalApp = null;
        activeManagementTab = "dashboard";
        managementPlanEditContext = null;
        selectedActions.clear();
        renderApp();
      }

      function handlePortalMessage(event) {
        if (event.source !== els.proceduresFrame.contentWindow) return;
        if (!event.data) return;
        if (event.data.type === "sats:show-app-selector") return showAppSelector();
      }

      function showProfiles() {
        managementPlanEditContext = null;
        app.view = "profiles";
        app.activePlanId = null;
        selectedActions.clear();
        saveApp({ localOnly: true });
        renderApp();
      }

      function showFolders() {
        const profile = currentProfile();
        if (!profile) return showProfiles();
        managementPlanEditContext = null;
        app.view = "folders";
        app.activePlanId = null;
        if (!getVisibleFolders(profile).some(folder => folder.id === app.activeFolderId)) app.activeFolderId = DEFAULT_FOLDER_ID;
        saveApp({ localOnly: true });
        renderApp();
      }

      function showEditor(planId) {
        app.activePlanId = planId;
        app.view = "editor";
        selectedActions.clear();
        saveApp({ localOnly: true });
        renderApp();
      }

      function renderProfiles() {
        els.profileGrid.innerHTML = "";
        const directory = getVisibleTeamProfiles();
        if (!directory.length) {
          els.profileGrid.insertAdjacentHTML("beforeend", '<div class="empty-state">Nenhum perfil sincronizado ainda.</div>');
        }

        directory.forEach(profile => {
          const isRealProfile = !!profile.id && app.profiles.some(item => item.id === profile.id);
          const privateProfile = isRealProfile ? app.profiles.find(item => item.id === profile.id) : null;
          const card = document.createElement("article");
          card.className = "profile-card" + (profile.hidden ? " is-hidden-item" : "");
          card.dataset.profileId = profile.id || "";
          card.dataset.profileUserId = profile.userId || "";
          const foldersCount = privateProfile ? privateProfile.folders.length : "-";
          const plansCount = privateProfile ? privateProfile.plans.length : "-";
          const presenceUserId = profile.userId || (privateProfile ? privateProfile.userId : "") || profile.id || "";
          const isOnline = presenceUserId && onlineUserIds.has(presenceUserId);
          const lastAccessText = privateProfile && privateProfile.lastAccess ? formatDateTime(privateProfile.lastAccess) : "sem registro";
          const lastAccessHtml = isOnline ? "" : `<div class="last-access">Último acesso: ${escapeHtml(lastAccessText)}</div>`;
          const adminActionsHtml = isSystemAdminUser() ? `
                <button class="button icon-only" type="button" data-profile-action="toggle-hidden" title="${profile.hidden ? "Mostrar perfil" : "Ocultar perfil"}" aria-label="${profile.hidden ? "Mostrar perfil" : "Ocultar perfil"}">${profile.hidden ? icons.eye : icons.eyeOff}</button>
                <button class="button icon-only danger" type="button" data-profile-action="delete" title="Excluir perfil" aria-label="Excluir perfil">${icons.trash}</button>
              ` : "";
          const profileActionsHtml = isRestrictedAdminUser() ? "" : `
              <div class="profile-actions">
                <button class="button icon-only" type="button" data-profile-action="edit" title="Editar perfil" aria-label="Editar perfil">${icons.edit}</button>
                ${adminActionsHtml}
              </div>
            `;
          card.innerHTML = `
            <div class="profile-top">
              ${profile.avatarPhoto ? `<button class="profile-photo-open" type="button" data-profile-photo title="Ampliar foto de ${escapeAttr(profile.name)}" aria-label="Ampliar foto de ${escapeAttr(profile.name)}">${avatarHtml(profile)}</button>` : avatarHtml(profile)}
              ${profileActionsHtml}
            </div>
            <div>
              <h2 class="profile-name">${escapeHtml(profile.name)} ${profileHasSuggestionStar(profile) ? '<span class="suggestion-star-badge" title="Sugestão aceita nesta semana">⭐ Sugestão aceita</span>' : ""}</h2>
              <p class="profile-role">${escapeHtml(profile.role || profile.company || "Sem função informada")}</p>
              ${profile.hidden ? '<span class="hidden-item-badge">Oculto</span>' : ""}
            </div>
            <div class="profile-stats">
              <div class="stat-box"><strong>${foldersCount}</strong><span>pastas</span></div>
              <div class="stat-box"><strong>${plansCount}</strong><span>planos</span></div>
            </div>
            <div class="profile-presence ${isOnline ? "is-online" : "is-offline"}"><span class="presence-dot"></span><span>Status: ${isOnline ? "Online" : "Offline"}</span></div>
            ${lastAccessHtml}
          `;
          els.profileGrid.appendChild(card);
        });

        if (currentUser && !isRestrictedAdminUser() && (isSystemAdminUser() || !currentUserOwnProfile())) {
          const createCard = document.createElement("button");
          createCard.className = "new-profile-card";
          createCard.type = "button";
          createCard.innerHTML = `<span class="plus">+</span><strong>${isSystemAdminUser() ? "Criar perfil" : "Criar meu perfil"}</strong>`;
          createCard.addEventListener("click", isSystemAdminUser() ? () => openProfileModal() : createCurrentUserProfile);
          els.profileGrid.appendChild(createCard);
        }

      }

      function isImprovementsOwnerUser() {
        return normalizeText(currentUser && currentUser.email) === normalizeText(IMPROVEMENTS_OWNER_EMAIL);
      }

      function toggleProfileHidden(profileId) {
        if (!isSystemAdminUser()) return;
        const profile = app.profiles.find(item => item.id === profileId);
        if (!profile) return;
        profile.hidden = !profile.hidden;
        saveApp({ profileId: profile.id });
        renderProfiles();
      }

      function renderAppSelectorImprovements() {
        if (!currentUser) return;
        const widgetOpen = localStorage.getItem(IMPROVEMENT_WIDGET_STATE_KEY) === "open";
        els.improvementPanel.classList.toggle("hidden", !widgetOpen);
        els.improvementWidgetToggle.setAttribute("aria-expanded", String(widgetOpen));
        renderSuggestionAttachmentPreview();
        renderSuggestionWeeklyRanking();

        if (!isImprovementsOwnerUser()) {
          els.improvementOwnerPanel.hidden = true;
          els.resolvedImprovementPanel.hidden = true;
          els.improvementList.innerHTML = "";
          els.resolvedImprovementList.innerHTML = "";
          return;
        }

        const suggestions = normalizeImprovementSuggestions(app.improvementSuggestions);
        const pending = suggestions.filter(suggestion => suggestion.status === "open");
        const resolved = suggestions.filter(suggestion => suggestion.status === "resolved");
        els.improvementOwnerPanel.hidden = false;
        els.resolvedImprovementPanel.hidden = false;
        els.improvementList.innerHTML = pending.length
          ? pending.map(suggestion => improvementSuggestionHtml(suggestion, false)).join("")
          : '<div class="empty-state">Nenhuma sugestão pendente.</div>';
        els.resolvedImprovementCount.textContent = `Sugestões resolvidas (${resolved.length})`;
        const resolvedOpen = localStorage.getItem(RESOLVED_IMPROVEMENTS_STATE_KEY) === "open";
        els.resolvedImprovementToggle.setAttribute("aria-expanded", String(resolvedOpen));
        els.resolvedImprovementList.classList.toggle("hidden", !resolvedOpen);
        els.resolvedImprovementList.innerHTML = resolved.length
          ? resolved.map(suggestion => improvementSuggestionHtml(suggestion, true)).join("")
          : '<div class="empty-state">Nenhuma sugestão resolvida.</div>';
      }

      function improvementSuggestionHtml(suggestion, resolved) {
        const resolvedMeta = resolved && suggestion.resolvedAt
          ? `<div class="improvement-suggestion-meta">Resolvida em ${escapeHtml(formatDateTime(suggestion.resolvedAt))}</div>`
          : "";
        return `
          <article class="improvement-suggestion ${resolved ? "is-resolved" : ""}" data-improvement-id="${escapeAttr(suggestion.id)}">
            <div class="improvement-suggestion-head">
              <strong>${escapeHtml(suggestionStatusLabel(suggestion.status))}</strong>
              <span class="improvement-suggestion-meta">${escapeHtml(formatDateTime(suggestion.createdAt))}</span>
            </div>
            <p class="improvement-suggestion-text">${escapeHtml(suggestion.text)}</p>
            <div class="improvement-suggestion-meta">${escapeHtml(suggestion.userName || "Sem perfil")} · ${escapeHtml(suggestion.userEmail || "E-mail não informado")}</div>
            ${resolvedMeta}
            ${suggestion.attachments[0] ? suggestionAttachmentHtml(suggestion.attachments[0], { compact: true }) : ""}
            <div class="improvement-suggestion-actions">
              <button class="button" type="button" data-improvement-action="copy">${icons.copy} Copiar</button>
              ${resolved ? "" : '<button class="button" type="button" data-improvement-action="resolve">Resolver sugestão</button>'}
              ${isSystemAdminUser() ? '<button class="button danger" type="button" data-improvement-action="delete">Excluir</button>' : ""}
            </div>
          </article>
        `;
      }

      function toggleImprovementWidget() {
        const opening = els.improvementPanel.classList.contains("hidden");
        localStorage.setItem(IMPROVEMENT_WIDGET_STATE_KEY, opening ? "open" : "closed");
        renderAppSelectorImprovements();
      }

      function toggleResolvedImprovements() {
        if (!isImprovementsOwnerUser()) return;
        const opening = els.resolvedImprovementList.classList.contains("hidden");
        localStorage.setItem(RESOLVED_IMPROVEMENTS_STATE_KEY, opening ? "open" : "closed");
        renderAppSelectorImprovements();
      }

      function formatFileSize(bytes) {
        const size = Math.max(0, Number(bytes) || 0);
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
      }

      function suggestionAttachmentHtml(attachment, options = {}) {
        if (!attachment) return "";
        const image = /^image\//.test(attachment.type);
        return `<div class="suggestion-attachment-preview" data-suggestion-attachment-id="${escapeAttr(attachment.id)}">
          ${image ? `<img src="${escapeAttr(attachment.dataUrl)}" alt="Prévia do anexo">` : '<strong aria-hidden="true">PDF</strong>'}
          <div><strong>${escapeHtml(attachment.name)}</strong><small>${escapeHtml(attachment.type || "arquivo")} · ${escapeHtml(formatFileSize(attachment.size))}</small></div>
          ${options.pending ? '<button class="button danger" type="button" data-pending-attachment-action="remove">Remover</button>' : ""}
          ${options.actions ? `<div class="management-item-actions"><button class="button" type="button" data-management-action="view-suggestion-attachment">Visualizar</button><button class="button" type="button" data-management-action="download-suggestion-attachment">Baixar</button>${canManageSuggestions() ? '<button class="button danger" type="button" data-management-action="remove-suggestion-attachment">Remover</button>' : ""}</div>` : ""}
        </div>`;
      }

      function renderSuggestionAttachmentPreview() {
        if (!els.improvementAttachmentPreview) return;
        els.improvementAttachmentPreview.classList.toggle("hidden", !pendingSuggestionAttachment);
        els.improvementAttachmentPreview.innerHTML = pendingSuggestionAttachment
          ? suggestionAttachmentHtml(pendingSuggestionAttachment, { pending: true })
          : "";
      }

      async function handleSuggestionAttachmentSelect(event) {
        const file = event.target.files?.[0];
        pendingSuggestionAttachment = null;
        if (!file) return renderSuggestionAttachmentPreview();
        if (!SUGGESTION_ATTACHMENT_TYPES.has(file.type) || !/\.(pdf|jpe?g|png)$/i.test(file.name)) {
          event.target.value = "";
          renderSuggestionAttachmentPreview();
          return showToast("Envie um arquivo PDF, JPEG ou PNG.", "warning");
        }
        if (file.size > MAX_SUGGESTION_ATTACHMENT_BYTES) {
          event.target.value = "";
          renderSuggestionAttachmentPreview();
          return showToast("Arquivo muito grande. Envie PDF, JPEG ou PNG com até 3 MB.", "warning");
        }
        try {
          pendingSuggestionAttachment = normalizeSuggestionAttachment({
            id: createId(),
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: await readFileAsDataUrl(file),
            uploadedAt: new Date().toISOString(),
            uploadedBy: currentUser?.email || ""
          });
          renderSuggestionAttachmentPreview();
        } catch (error) {
          event.target.value = "";
          showToast("Não foi possível preparar o anexo.", "danger");
        }
      }

      function handlePendingSuggestionAttachmentClick(event) {
        if (!event.target.closest("[data-pending-attachment-action='remove']")) return;
        pendingSuggestionAttachment = null;
        els.improvementAttachment.value = "";
        renderSuggestionAttachmentPreview();
      }

      async function submitImprovementSuggestion(event) {
        event.preventDefault();
        if (!currentUser) return;
        const text = String(els.improvementText.value || "").trim();
        if (!text) return showToast("Escreva sua sugestão antes de enviar.", "warning");
        const profile = currentUserOwnProfile();
        const now = new Date().toISOString();
        app.improvementSuggestions.unshift({
          id: createId(),
          text,
          status: "open",
          requesterEmail: currentUser.email || "",
          requesterName: profile ? profile.name : "",
          requesterProfileId: profile ? profile.id : "",
          createdAt: now,
          createdBy: currentUser.email || "",
          updatedAt: now,
          userEmail: currentUser.email || "",
          userName: profile ? profile.name : "",
          userId: currentUser.id || "",
          attachments: pendingSuggestionAttachment ? [pendingSuggestionAttachment] : [],
          resolutionReport: null,
          rejectionReport: null,
          resolvedAt: "",
          resolvedBy: "",
          rejectedAt: "",
          rejectedBy: ""
        });
        recordActivity(pendingSuggestionAttachment ? "Enviou sugestão com anexo" : "Enviou sugestão", text.slice(0, 180), { profile });
        els.improvementText.value = "";
        els.improvementAttachment.value = "";
        pendingSuggestionAttachment = null;
        saveApp({ improvements: true });
        renderAppSelectorImprovements();
        showToast("Sugestão enviada. Obrigado por ajudar a melhorar o SATS!", "success");
      }

      async function handleImprovementListClick(event) {
        if (!isImprovementsOwnerUser()) return;
        const button = event.target.closest("[data-improvement-action]");
        const card = event.target.closest("[data-improvement-id]");
        if (!button || !card) return;
        const suggestion = app.improvementSuggestions.find(item => item.id === card.dataset.improvementId);
        if (!suggestion) return;
        if (button.dataset.improvementAction === "copy") {
          await copyTextToClipboard(suggestion.text);
          showToast("Sugestão copiada.");
          return;
        }
        if (button.dataset.improvementAction === "resolve") {
          return openSuggestionResolutionReport(suggestion);
        }
        if (button.dataset.improvementAction === "delete") {
          if (!isSystemAdminUser()) return showToast("Ative o modo administrador para excluir sugestões.");
          if (!await openConfirmModal({ title: "Excluir sugestão", message: "A sugestão e seus relatórios serão removidos definitivamente.", requiredText: "EXCLUIR SUGESTÃO", confirmLabel: "Excluir sugestão" })) return;
          app.improvementSuggestions = app.improvementSuggestions.filter(item => item.id !== suggestion.id);
          app.suggestionNotifications = app.suggestionNotifications.filter(item => item.suggestionId !== suggestion.id);
          if (suggestion.status === "resolved") decrementSuggestionRankingEntry(suggestion.requesterEmail, suggestion.requesterProfileId);
          recordActivity("Excluiu sugestão", suggestion.text.slice(0, 180));
          saveManagementChanges();
          renderAppSelectorImprovements();
        }
      }

      function suggestionProfile(suggestion) {
        return app.profiles.find(profile => profile.id === suggestion?.requesterProfileId)
          || app.profiles.find(profile => normalizeEmail(profile.email) === normalizeEmail(suggestion?.requesterEmail))
          || null;
      }

      function renderSuggestionWeeklyRanking() {
        if (!els.suggestionWeeklyRanking || !els.suggestionWeeklyRankingList) return;
        app.suggestionWeeklyRanking = normalizeSuggestionWeeklyRanking(app.suggestionWeeklyRanking);
        const entries = app.suggestionWeeklyRanking.entries.slice(0, 5);
        els.suggestionWeeklyRanking.classList.toggle("hidden", !entries.length);
        els.suggestionWeeklyRankingList.innerHTML = entries.map((entry, index) => {
          const profile = app.profiles.find(item => item.id === entry.profileId) || app.profiles.find(item => normalizeEmail(item.email) === normalizeEmail(entry.email));
          return `<article class="suggestion-ranking-card"><span class="suggestion-ranking-position">${index + 1}º</span>${profile ? avatarHtml(profile, 42) : '<span class="avatar avatar-sm">★</span>'}<div><strong>${escapeHtml(entry.name || profile?.name || entry.email || "Usuário")}</strong><small>⭐ ${entry.count} sugestão(ões) aplicada(s)</small></div></article>`;
        }).join("");
      }

      function profileHasSuggestionStar(profile) {
        const ranking = normalizeSuggestionWeeklyRanking(app.suggestionWeeklyRanking);
        return ranking.entries.some(entry => (entry.profileId && entry.profileId === profile?.id) || normalizeEmail(entry.email) === normalizeEmail(profile?.email));
      }

      function maybeShowPendingSuggestionNotification() {
        if (!currentUser || !els.appSelectorScreen || els.appSelectorScreen.classList.contains("hidden")) return;
        const modal = document.getElementById("suggestionNotificationModal");
        if (!modal?.classList.contains("hidden")) return;
        const notification = normalizeSuggestionNotifications(app.suggestionNotifications).find(item => item.type === "suggestion-accepted" && !item.seenAt && !postponedSuggestionNotificationIds.has(item.id) && normalizeEmail(item.toEmail) === normalizeEmail(currentUser.email));
        if (!notification) return;
        activeSuggestionNotificationId = notification.id;
        document.getElementById("suggestionNotificationTitle").textContent = notification.title;
        els.suggestionNotificationReport.textContent = notification.reportText;
        openModal("suggestionNotificationModal");
        launchSuggestionConfetti();
      }

      function launchSuggestionConfetti() {
        const layer = document.createElement("div");
        layer.className = "suggestion-confetti-layer";
        const colors = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#0891b2", "#7c3aed"];
        for (let index = 0; index < 44; index += 1) {
          const piece = document.createElement("i");
          piece.className = "suggestion-confetti-piece";
          piece.style.left = `${5 + Math.random() * 90}%`;
          piece.style.background = colors[index % colors.length];
          piece.style.setProperty("--confetti-x", `${-180 + Math.random() * 360}px`);
          piece.style.setProperty("--confetti-r", `${-540 + Math.random() * 1080}deg`);
          piece.style.animationDelay = `${Math.random() * 0.35}s`;
          layer.appendChild(piece);
        }
        document.body.appendChild(layer);
        setTimeout(() => layer.remove(), 3000);
      }

      function acknowledgeSuggestionNotification() {
        const notification = app.suggestionNotifications.find(item => item.id === activeSuggestionNotificationId);
        if (!notification) return closeModal("suggestionNotificationModal");
        notification.seenAt = new Date().toISOString();
        const suggestion = app.improvementSuggestions.find(item => item.id === notification.suggestionId);
        if (suggestion?.resolutionReport) {
          suggestion.resolutionReport.seenAt = notification.seenAt;
          suggestion.resolutionReport.status = "seen";
          suggestion.updatedAt = notification.seenAt;
        }
        recordActivity("Visualizou relatório de sugestão aceita", suggestion?.text?.slice(0, 180) || notification.title);
        saveApp({ improvements: true });
        activeSuggestionNotificationId = "";
        closeModal("suggestionNotificationModal");
      }

      function postponeSuggestionNotification() {
        const notification = app.suggestionNotifications.find(item => item.id === activeSuggestionNotificationId);
        if (notification) {
          notification.dismissedAt = new Date().toISOString();
          postponedSuggestionNotificationIds.add(notification.id);
          saveApp({ improvements: true });
        }
        activeSuggestionNotificationId = "";
        closeModal("suggestionNotificationModal");
      }

      async function copyTextToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
          return;
        }
        const field = document.createElement("textarea");
        field.value = text;
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        document.execCommand("copy");
        field.remove();
      }

      function currentUserOwnProfile() {
        if (!currentUser) return null;
        if (isRestrictedAdminUser()) return null;
        const email = normalizeText(currentUser.email || "");
        return app.profiles.find(profile => {
          if (profile.userId && app.hiddenUserProfileIds.includes(profile.userId)) return false;
          return profile.userId === currentUser.id
            || profile.id === currentUser.id
            || (email && normalizeText(profile.email || "") === email);
        }) || null;
      }

      function updateOwnLastAccess() {
        const profile = currentUserOwnProfile();
        if (!profile) return null;
        profile.lastAccess = new Date().toISOString();
        dirtyProfileIds.add(profile.id);
        return profile;
      }

      async function createCurrentUserProfile() {
        if (!currentUser) return;
        if (blockRestrictedAdminAccess()) return;
        app.hiddenUserProfileIds = app.hiddenUserProfileIds.filter(userId => userId !== currentUser.id);
        const profile = ensureSinglePrivateProfile();
        if (!profile) {
          showToast("Não foi possível criar o perfil deste usuário. Atualize a página e tente novamente.");
          return;
        }
        profile.lastAccess = new Date().toISOString();
        app.activeProfileId = profile.id;
        app.activeFolderId = DEFAULT_FOLDER_ID;
        app.activePlanId = null;
        app.view = "folders";
        await syncOwnPublicProfile(profile);
        recordActivity("Criou perfil", `Perfil criado para ${profile.email || profile.name}.`, { profile });
        saveApp({ profileId: profile.id, hiddenRemove: currentUser.id });
        await flushCloudSave();
        renderApp();
      }

      function getVisibleTeamProfiles() {
        const hiddenProfileUserIds = new Set(app.profiles.filter(profile => profile.hidden).map(profile => profile.userId).filter(Boolean));
        const hiddenProfileEmails = new Set(app.profiles.filter(profile => profile.hidden).map(profile => normalizeText(profile.email)).filter(Boolean));
        const profileCards = app.profiles
          .filter(profile => (isSystemAdminUser() || !isRestrictedAdminEmail(profile.email))
            && (!profile.userId || !app.hiddenUserProfileIds.includes(profile.userId))
            && (canAccessHiddenItems() || !profile.hidden))
          .map(profile => ({
          id: profile.id,
          userId: profile.userId || profile.id,
          name: profile.name,
          role: profile.role,
          company: profile.company,
          email: profile.email || "",
          avatarColor: profile.avatarColor,
          avatarPhoto: profile.avatarPhoto,
          hidden: profile.hidden === true,
          updatedAt: profile.lastEdited || profile.createdAt
        }));
        teamProfiles.forEach(publicProfile => {
          const hiddenForCommonUser = !canAccessHiddenItems()
            && (hiddenProfileUserIds.has(publicProfile.userId) || hiddenProfileEmails.has(normalizeText(publicProfile.email)));
          if (!hiddenForCommonUser && (isSystemAdminUser() || !isRestrictedAdminEmail(publicProfile.email)) && !app.hiddenUserProfileIds.includes(publicProfile.userId) && !profileCards.some(profile => profile.userId && profile.userId === publicProfile.userId)) {
            profileCards.push(publicProfile);
          }
        });
        return profileCards.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "pt-BR"));
      }

      function handleProfileGridClick(event) {
        const card = event.target.closest(".profile-card");
        if (!card) return;
        const profileId = card.dataset.profileId;
        const userId = card.dataset.profileUserId;
        const photoButton = event.target.closest("[data-profile-photo]");
        if (photoButton) {
          event.stopPropagation();
          const image = photoButton.querySelector("img");
          if (!image) return;
          const title = `Foto de ${card.querySelector(".profile-name")?.textContent || "perfil"}`;
          document.getElementById("profilePhotoViewerTitle").textContent = title;
          const viewerImage = document.getElementById("profilePhotoViewerImage");
          viewerImage.src = image.src;
          viewerImage.alt = title;
          openModal("profilePhotoViewerModal");
          return;
        }
        const action = event.target.closest("[data-profile-action]");
        if (action) {
          event.stopPropagation();
          if (blockRestrictedAdminAccess()) return;
          if (action.dataset.profileAction === "toggle-hidden" && isSystemAdminUser()) {
            const adminProfile = app.profiles.find(item => item.id === profileId) || getOrCreateSharedProfile(profileId, userId);
            toggleProfileHidden(adminProfile.id);
            return;
          }
          if (isSystemAdminUser() && action.dataset.profileAction === "edit") {
            const adminProfile = app.profiles.find(item => item.id === profileId) || getOrCreateSharedProfile(profileId, userId);
            openProfileModal(adminProfile.id);
            return;
          }
          if (isSystemAdminUser() && action.dataset.profileAction === "delete") {
            const adminProfile = app.profiles.find(item => item.id === profileId) || getOrCreateSharedProfile(profileId, userId);
            deleteProfile(adminProfile.id);
            return;
          }
          requirePasswordForProfileAction(action.dataset.profileAction, profileId || userId);
          return;
        }
        warnRestrictedAdminAccess();
        const profile = getOrCreateSharedProfile(profileId, userId);
        app.activeProfileId = profile.id;
        app.activeFolderId = DEFAULT_FOLDER_ID;
        app.view = "folders";
        recordActivity("Acessou perfil", `Abriu o perfil ${profile.name}.`, { profile });
        saveApp({ localOnly: true });
        renderApp();
      }

      function getOrCreateSharedProfile(profileId, userId) {
        let profile = app.profiles.find(item => item.id === profileId) || app.profiles.find(item => item.userId && item.userId === userId);
        if (profile) return profile;
        const publicProfile = teamProfiles.find(item => item.userId === userId) || {};
        profile = normalizeProfile({
          id: userId || createId(),
          userId: userId || "",
          name: publicProfile.name || "Perfil",
          role: publicProfile.role || "",
          company: publicProfile.company || "",
          email: publicProfile.email || "",
          avatarColor: publicProfile.avatarColor || pickColor(publicProfile.email || publicProfile.name || ""),
          avatarPhoto: publicProfile.avatarPhoto || "",
          createdAt: new Date().toISOString(),
          lastAccess: "",
          folders: [createDefaultFolder()],
          plans: []
        });
        app.profiles.push(profile);
        saveApp({ profileId: profile.id });
        return profile;
      }

      function requirePasswordForProfileAction(action, profileId) {
        if (blockRestrictedAdminAccess()) return;
        const profile = app.profiles.find(item => item.id === profileId) || getOrCreateSharedProfile(profileId, profileId);
        if (!profile.email) {
          showToast("Este perfil não tem e-mail vinculado. Edite o perfil e vincule um e-mail antes de proteger por senha.");
          return;
        }
        pendingProtectedAction = { action, profileId: profile.id };
        document.getElementById("switchUserTitle").textContent = action === "delete" ? "Confirmar exclusão" : "Confirmar edição";
        document.getElementById("switchUserEmailInput").value = profile.email || "";
        document.getElementById("switchUserPasswordInput").value = "";
        setSwitchUserMessage(`Digite a senha do perfil ${profile.name} para continuar.`, "");
        openModal("switchUserModal");
        setTimeout(() => document.getElementById("switchUserPasswordInput").focus(), 30);
      }

      function openProfileModal(profileId) {
        if (blockRestrictedAdminAccess()) return;
        const profile = profileId ? app.profiles.find(item => item.id === profileId) : null;
        document.getElementById("profileModalTitle").textContent = profile ? "Editar Perfil" : "Configurar Perfil";
        document.getElementById("profileIdInput").value = profile ? profile.id : "";
        document.getElementById("profileNameInput").value = profile ? profile.name : "";
        document.getElementById("profileRoleInput").value = profile ? profile.role : "";
        document.getElementById("profileCompanyInput").value = profile ? profile.company : "";
        const profileEmailInput = document.getElementById("profileEmailDisplayInput");
        profileEmailInput.value = profile ? profile.email || "" : isSystemAdminUser() ? "" : currentUser ? currentUser.email || "" : "";
        profileEmailInput.readOnly = !isSystemAdminUser();
        document.getElementById("profileHiddenField").classList.toggle("hidden", !isSystemAdminUser());
        document.getElementById("profileHiddenInput").checked = !!(profile && profile.hidden);
        document.getElementById("profilePhotoInput").value = "";
        const deleteButton = document.getElementById("profileDeleteBtn");
        deleteButton.classList.toggle("hidden", !profile);
        deleteButton.dataset.profileId = profile ? profile.id : "";
        pendingProfilePhoto = profile ? profile.avatarPhoto : "";
        closeProfilePhotoAdjuster();
        selectedProfileColor = profile ? profile.avatarColor : AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
        renderColorPalette(els.profileColorPalette, AVATAR_COLORS, selectedProfileColor, handleProfileColorSelect);
        renderProfilePhotoPreview();
        openModal("profileModal");
        setTimeout(() => document.getElementById("profileNameInput").focus(), 30);
      }

      async function saveProfileFromModal(event) {
        event.preventDefault();
        if (blockRestrictedAdminAccess()) return;
        const id = document.getElementById("profileIdInput").value;
        const previousProfile = id ? deepClone(app.profiles.find(item => item.id === id) || {}) : null;
        const name = document.getElementById("profileNameInput").value.trim();
        if (!name) {
          showToast("Informe o nome completo do perfil.");
          return;
        }
        const photoAdjuster = document.getElementById("profilePhotoAdjuster");
        if (profilePhotoEditor.image && photoAdjuster && !photoAdjuster.classList.contains("hidden")) {
          pendingProfilePhoto = exportProfilePhotoCrop();
          closeProfilePhotoAdjuster();
          renderProfilePhotoPreview();
        }
        const payload = {
          name,
          role: document.getElementById("profileRoleInput").value.trim(),
          company: document.getElementById("profileCompanyInput").value.trim(),
          email: document.getElementById("profileEmailDisplayInput").value.trim(),
          avatarColor: selectedProfileColor,
          avatarPhoto: pendingProfilePhoto,
          hidden: isSystemAdminUser() && document.getElementById("profileHiddenInput").checked
        };
        let savedProfile = null;
        if (id) {
          const profile = app.profiles.find(item => item.id === id);
          if (!profile) {
            showToast("Perfil não encontrado. Atualize a página e tente novamente.");
            return;
          }
          Object.assign(profile, payload);
          if (currentUser && normalizeText(profile.email || "") === normalizeText(currentUser.email || "")) {
            profile.userId = currentUser.id;
          }
          savedProfile = profile;
        } else {
          const belongsToCurrentUser = currentUser && normalizeText(payload.email) === normalizeText(currentUser.email);
          savedProfile = normalizeProfile({
            id: belongsToCurrentUser ? currentUser.id : createId(),
            userId: belongsToCurrentUser ? currentUser.id : "",
            ...payload,
            createdAt: new Date().toISOString(),
            lastAccess: "",
            folders: [createDefaultFolder()],
            plans: []
          });
          app.profiles.push(savedProfile);
        }
        recordProfileActivity(previousProfile, savedProfile);
        saveApp({ profileId: savedProfile.id });
        if (savedProfile && currentUser && savedProfile.userId === currentUser.id) {
          await syncOwnPublicProfile(savedProfile);
        }
        await flushCloudSave();
        closeModal("profileModal");
        renderProfiles();
      }

      function recordProfileActivity(previousProfile, savedProfile) {
        if (!savedProfile) return;
        if (!previousProfile || !previousProfile.id) {
          recordActivity("Criou perfil", `Criou o perfil ${savedProfile.name}.`, { profile: savedProfile });
          return;
        }
        const changes = [];
        if (previousProfile.name !== savedProfile.name) changes.push(`nome: ${previousProfile.name || "-"} -> ${savedProfile.name || "-"}`);
        if (previousProfile.role !== savedProfile.role) changes.push("cargo/função");
        if (previousProfile.company !== savedProfile.company) changes.push("empresa/consultoria");
        if (previousProfile.avatarColor !== savedProfile.avatarColor) changes.push("cor do avatar");
        if ((previousProfile.avatarPhoto || "") !== (savedProfile.avatarPhoto || "")) {
          changes.push(savedProfile.avatarPhoto ? "foto de perfil alterada" : "foto de perfil removida");
          recordActivity(savedProfile.avatarPhoto ? "Trocou foto de perfil" : "Removeu foto de perfil", `Perfil ${savedProfile.name}.`, { profile: savedProfile });
        }
        recordActivity("Editou perfil", changes.length ? `Alterações: ${changes.join(", ")}.` : `Perfil ${savedProfile.name} salvo sem alterações visíveis.`, { profile: savedProfile });
      }

      async function deleteProfileFromModal() {
        if (blockRestrictedAdminAccess()) return;
        const profileId = document.getElementById("profileDeleteBtn").dataset.profileId || document.getElementById("profileIdInput").value;
        if (!profileId) return;
        const deleted = await deleteProfile(profileId);
        if (deleted) closeModal("profileModal");
      }

      async function deleteProfile(profileId) {
        if (blockRestrictedAdminAccess()) return false;
        const profile = app.profiles.find(item => item.id === profileId);
        if (!profile) return false;
        if (!await openConfirmModal({ title: "Excluir perfil", message: `O perfil "${profile.name}" e todos os seus planos serão excluídos.`, requiredText: "EXCLUIR", confirmLabel: "Excluir perfil" })) return false;
        createInternalBackup(`Antes de excluir perfil ${profile.name}`, { automatic: true, profileId: profile.id });
        recordActivity("Excluiu perfil", `Excluiu o perfil ${profile.name} com ${profile.plans.length} plano(s).`, { profile });
        if (profile.userId && !app.hiddenUserProfileIds.includes(profile.userId)) {
          app.hiddenUserProfileIds.push(profile.userId);
        }
        app.profiles = app.profiles.filter(item => item.id !== profileId);
        if (app.activeProfileId === profileId) {
          app.activeProfileId = null;
          app.activeFolderId = DEFAULT_FOLDER_ID;
          app.activePlanId = null;
          app.view = "profiles";
        }
        saveApp({ deleteProfileId: profile.id, hiddenAdd: profile.userId || "" });
        await flushCloudSave();
        renderApp();
        return true;
      }

      function createPhotoEditorState() {
        return {
          image: null,
          source: "",
          zoomBase: 1,
          zoomFactor: 1,
          zoom: 1,
          offsetX: 0,
          offsetY: 0,
          dragging: false,
          pointerId: null,
          startX: 0,
          startY: 0,
          startOffsetX: 0,
          startOffsetY: 0
        };
      }

      async function handleProfilePhoto(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
          showToast("Selecione um arquivo de imagem.");
          return;
        }
        try {
          const dataUrl = await readFileAsDataUrl(file);
          await openProfilePhotoAdjuster(dataUrl);
        } catch (error) {
          console.error(error);
          showToast("Não foi possível carregar a imagem. Tente outro arquivo JPEG ou PNG.");
        }
      }

      function renderProfilePhotoPreview() {
        const preview = document.getElementById("profilePhotoPreview");
        if (!pendingProfilePhoto) {
          preview.innerHTML = "<span>Nenhuma foto selecionada. O avatar usará as iniciais.</span>";
          return;
        }
        preview.innerHTML = `<span class="avatar small"><img src="${escapeAttr(pendingProfilePhoto)}" alt=""></span><span>Foto carregada e salva no navegador.</span><button class="button" type="button" id="adjustProfilePhoto">Ajustar foto</button><button class="button" type="button" id="removeProfilePhoto">Remover foto</button>`;
        document.getElementById("adjustProfilePhoto").addEventListener("click", () => {
          openProfilePhotoAdjuster(pendingProfilePhoto).catch(error => {
            console.error(error);
            showToast("Não foi possível abrir o ajuste desta foto.");
          });
        });
        document.getElementById("removeProfilePhoto").addEventListener("click", () => {
          pendingProfilePhoto = "";
          closeProfilePhotoAdjuster();
          document.getElementById("profilePhotoInput").value = "";
          renderProfilePhotoPreview();
        });
      }

      async function openProfilePhotoAdjuster(source) {
        const image = await loadImageElement(source);
        profilePhotoEditor = createPhotoEditorState();
        profilePhotoEditor.image = image;
        profilePhotoEditor.source = source;
        document.getElementById("profilePhotoAdjuster").classList.remove("hidden");
        resetProfilePhotoCrop();
      }

      function closeProfilePhotoAdjuster() {
        const adjuster = document.getElementById("profilePhotoAdjuster");
        const canvas = document.getElementById("profilePhotoCanvas");
        if (adjuster) adjuster.classList.add("hidden");
        if (canvas) canvas.classList.remove("is-dragging");
        profilePhotoEditor = createPhotoEditorState();
      }

      function resetProfilePhotoCrop() {
        const state = profilePhotoEditor;
        if (!state || !state.image) return;
        state.zoomBase = Math.max(AVATAR_CANVAS_SIZE / state.image.naturalWidth, AVATAR_CANVAS_SIZE / state.image.naturalHeight);
        state.zoomFactor = 1;
        state.zoom = state.zoomBase;
        state.offsetX = (AVATAR_CANVAS_SIZE - state.image.naturalWidth * state.zoom) / 2;
        state.offsetY = (AVATAR_CANVAS_SIZE - state.image.naturalHeight * state.zoom) / 2;
        document.getElementById("profilePhotoZoomInput").value = "100";
        clampProfilePhotoCrop();
        renderProfilePhotoCrop();
      }

      function cancelProfilePhotoCrop() {
        document.getElementById("profilePhotoInput").value = "";
        closeProfilePhotoAdjuster();
      }

      function applyProfilePhotoCrop() {
        if (!profilePhotoEditor.image) return;
        pendingProfilePhoto = exportProfilePhotoCrop();
        document.getElementById("profilePhotoInput").value = "";
        closeProfilePhotoAdjuster();
        renderProfilePhotoPreview();
      }

      function handleProfilePhotoZoom(event) {
        const state = profilePhotoEditor;
        if (!state || !state.image) return;
        const oldZoom = state.zoom || state.zoomBase || 1;
        const focusX = AVATAR_CANVAS_SIZE / 2;
        const focusY = AVATAR_CANVAS_SIZE / 2;
        const imageFocusX = (focusX - state.offsetX) / oldZoom;
        const imageFocusY = (focusY - state.offsetY) / oldZoom;
        state.zoomFactor = Number(event.target.value || 100) / 100;
        state.zoom = state.zoomBase * state.zoomFactor;
        state.offsetX = focusX - imageFocusX * state.zoom;
        state.offsetY = focusY - imageFocusY * state.zoom;
        clampProfilePhotoCrop();
        renderProfilePhotoCrop();
      }

      function handleProfilePhotoPointerDown(event) {
        const state = profilePhotoEditor;
        if (!state || !state.image) return;
        event.preventDefault();
        const point = profilePhotoCanvasPoint(event);
        state.dragging = true;
        state.pointerId = event.pointerId;
        state.startX = point.x;
        state.startY = point.y;
        state.startOffsetX = state.offsetX;
        state.startOffsetY = state.offsetY;
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.classList.add("is-dragging");
      }

      function handleProfilePhotoPointerMove(event) {
        const state = profilePhotoEditor;
        if (!state || !state.image || !state.dragging) return;
        event.preventDefault();
        const point = profilePhotoCanvasPoint(event);
        state.offsetX = state.startOffsetX + point.x - state.startX;
        state.offsetY = state.startOffsetY + point.y - state.startY;
        clampProfilePhotoCrop();
        renderProfilePhotoCrop();
      }

      function handleProfilePhotoPointerUp(event) {
        const state = profilePhotoEditor;
        if (!state || !state.dragging) return;
        state.dragging = false;
        state.pointerId = null;
        event.currentTarget.classList.remove("is-dragging");
        try {
          event.currentTarget.releasePointerCapture(event.pointerId);
        } catch (error) {
          // O navegador pode liberar a captura automaticamente.
        }
      }

      function profilePhotoCanvasPoint(event) {
        const canvas = document.getElementById("profilePhotoCanvas");
        const rect = canvas.getBoundingClientRect();
        return {
          x: (event.clientX - rect.left) * (canvas.width / rect.width),
          y: (event.clientY - rect.top) * (canvas.height / rect.height)
        };
      }

      function clampProfilePhotoCrop() {
        const state = profilePhotoEditor;
        if (!state || !state.image) return;
        const scaledWidth = state.image.naturalWidth * state.zoom;
        const scaledHeight = state.image.naturalHeight * state.zoom;
        state.offsetX = scaledWidth <= AVATAR_CANVAS_SIZE
          ? (AVATAR_CANVAS_SIZE - scaledWidth) / 2
          : Math.min(0, Math.max(AVATAR_CANVAS_SIZE - scaledWidth, state.offsetX));
        state.offsetY = scaledHeight <= AVATAR_CANVAS_SIZE
          ? (AVATAR_CANVAS_SIZE - scaledHeight) / 2
          : Math.min(0, Math.max(AVATAR_CANVAS_SIZE - scaledHeight, state.offsetY));
      }

      function renderProfilePhotoCrop() {
        const state = profilePhotoEditor;
        const canvas = document.getElementById("profilePhotoCanvas");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, AVATAR_CANVAS_SIZE, AVATAR_CANVAS_SIZE);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, AVATAR_CANVAS_SIZE, AVATAR_CANVAS_SIZE);
        if (!state || !state.image) return;
        drawProfilePhotoImage(ctx, state);
        ctx.save();
        ctx.fillStyle = "rgba(15, 23, 42, 0.48)";
        ctx.fillRect(0, 0, AVATAR_CANVAS_SIZE, AVATAR_CANVAS_SIZE);
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(AVATAR_CANVAS_SIZE / 2, AVATAR_CANVAS_SIZE / 2, AVATAR_CANVAS_SIZE / 2 - 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(AVATAR_CANVAS_SIZE / 2, AVATAR_CANVAS_SIZE / 2, AVATAR_CANVAS_SIZE / 2 - 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      function drawProfilePhotoImage(ctx, state) {
        const width = state.image.naturalWidth * state.zoom;
        const height = state.image.naturalHeight * state.zoom;
        ctx.drawImage(state.image, state.offsetX, state.offsetY, width, height);
      }

      function exportProfilePhotoCrop() {
        const canvas = document.createElement("canvas");
        canvas.width = AVATAR_CANVAS_SIZE;
        canvas.height = AVATAR_CANVAS_SIZE;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, AVATAR_CANVAS_SIZE, AVATAR_CANVAS_SIZE);
        drawProfilePhotoImage(ctx, profilePhotoEditor);
        return canvas.toDataURL("image/jpeg", 0.62);
      }

      function loadImageElement(source) {
        return new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error("Imagem inválida"));
          image.src = source;
        });
      }

      function renderFoldersScreen() {
        const profile = currentProfile();
        if (!profile) return showProfiles();
        const isTrashView = app.view === "trash";
        const purged = purgeExpiredTrashPlans({ trackDeletes: true });
        if (purged.length) saveApp({ profileId: profile.id });
        document.getElementById("newPlanBtn").classList.toggle("hidden", isRestrictedAdminUser() || isTrashView);
        document.getElementById("newFolderBtn").classList.toggle("hidden", isRestrictedAdminUser() || isTrashView);
        ensureDefaultFolder(profile);
        if (!isTrashView && !getVisibleFolders(profile).some(folder => folder.id === app.activeFolderId)) app.activeFolderId = DEFAULT_FOLDER_ID;
        renderActiveProfile(profile);
        renderFolders(profile);
        if (isTrashView) {
          renderProfileTrash(profile);
          return;
        }
        renderPlans(profile);
      }

      function renderActiveProfile(profile) {
        els.activeProfileBadge.innerHTML = `
          ${avatarHtml(profile, "small")}
          <div>
            <strong>${escapeHtml(profile.name)}</strong>
            <span>${escapeHtml(profile.role || profile.company || "Perfil ativo")}</span>
          </div>
        `;
      }

      function renderFolders(profile) {
        els.folderList.innerHTML = "";
        getVisibleFolders(profile).forEach(folder => {
          const count = getActivePlans(profile).filter(plan => plan.folderId === folder.id).length;
          const item = document.createElement("div");
          item.className = "folder-item"
            + (app.view !== "trash" && folder.id === app.activeFolderId ? " is-active" : "")
            + (folder.hidden ? " is-hidden-item" : "");
          item.dataset.folderId = folder.id;
          item.innerHTML = `
            <span class="folder-dot" style="background:${escapeAttr(folder.color)}"></span>
            <span class="folder-name"><span data-folder-name>${escapeHtml(folder.name)}</span>${folder.hidden ? '<span class="hidden-item-badge">Oculta</span>' : ""}</span>
            <span class="folder-count">${count}</span>
          `;
          els.folderList.appendChild(item);
        });
        const trashCount = getTrashPlansByProfile(profile.id).length;
        const trashItem = document.createElement("div");
        trashItem.className = "folder-item folder-trash-item" + (app.view === "trash" ? " is-active" : "");
        trashItem.dataset.folderAction = "trash";
        trashItem.innerHTML = `
          <span class="folder-dot folder-trash-dot"></span>
          <span class="folder-name"><span>Lixeira</span></span>
          <span class="folder-count">${trashCount}</span>
        `;
        els.folderList.appendChild(trashItem);
      }

      function renderPlans(profile) {
        const folder = getActiveFolder(profile);
        if (!folder) return;
        const plans = getActivePlans(profile).filter(plan => plan.folderId === folder.id);
        const visibleFolders = getVisibleFolders(profile);
        els.selectedFolderTitle.textContent = folder.name;
        els.folderSummary.textContent = `${plans.length} plano${plans.length === 1 ? "" : "s"} nesta pasta`;
        els.plansGrid.innerHTML = "";
        if (!plans.length) {
          els.plansGrid.innerHTML = '<div class="empty-state">Nenhum plano nesta pasta. Crie um novo plano ou arraste planos de outra pasta.</div>';
          return;
        }
        plans.forEach(plan => {
          const stats = getPlanStats(plan);
          const readOnly = isRestrictedAdminUser();
          const card = document.createElement("article");
          card.className = "plan-card";
          card.dataset.planId = plan.id;
          card.draggable = !readOnly;
          const planActionsHtml = readOnly
            ? '<button class="button primary" type="button" data-plan-action="open">Abrir</button>'
            : `
              <button class="button primary" type="button" data-plan-action="open">Abrir</button>
              <button class="button" type="button" data-plan-action="duplicate">Duplicar</button>
              <select data-plan-move aria-label="Mover para pasta">
                <option value="">Mover para pasta...</option>
                ${visibleFolders.map(folder => `<option value="${escapeAttr(folder.id)}">${escapeHtml(folder.name)}</option>`).join("")}
              </select>
              <select data-plan-copy aria-label="Copiar para pasta">
                <option value="">Copiar para...</option>
                ${visibleFolders.map(folder => `<option value="${escapeAttr(folder.id)}">${escapeHtml(folder.name)}</option>`).join("")}
              </select>
              <button class="button danger" type="button" data-plan-action="delete">Excluir</button>
            `;
          card.innerHTML = `
            <div>
              <h3 class="plan-title">${escapeHtml(plan.title)}</h3>
              <div class="plan-meta">
                <span>Empresa: ${escapeHtml(plan.company || "-")}</span>
                <span>Documento: ${escapeHtml(plan.documentType || "-")}</span>
                <span>Criado: ${escapeHtml(formatDateTime(plan.createdAt))}</span>
                <span>Última edição: ${escapeHtml(formatDateTime(plan.updatedAt))}</span>
              </div>
            </div>
            <div>
              <div class="badge-row" style="justify-content:space-between">
                <strong>${stats.progress}% concluído</strong>
              </div>
              <div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:${stats.progress}%;background:${progressColor(stats.progress)}"></div></div>
            </div>
            <div class="badge-row">
              <span class="mini-badge badge-not-started">${stats.notStarted} não iniciadas</span>
              <span class="mini-badge badge-progress">${stats.inProgress} em andamento</span>
              <span class="mini-badge badge-done">${stats.done} concluídas</span>
            </div>
            <div class="plan-actions">
              ${planActionsHtml}
            </div>
          `;
          els.plansGrid.appendChild(card);
        });
      }

      function renderProfileTrash(profile) {
        const trashPlans = getTrashPlansByProfile(profile.id);
        els.selectedFolderTitle.textContent = "Lixeira do perfil";
        els.folderSummary.textContent = `${trashPlans.length} plano${trashPlans.length === 1 ? "" : "s"} aguardando exclusão permanente`;
        els.plansGrid.innerHTML = `
          <div class="trash-notice">
            Os planos excluídos permanecem nesta lixeira por 24 horas. Após esse período, serão apagados permanentemente.
          </div>
        `;
        if (!trashPlans.length) {
          els.plansGrid.insertAdjacentHTML("beforeend", '<div class="empty-state">A lixeira deste perfil está vazia.</div>');
          return;
        }
        trashPlans.forEach(plan => {
          const sourceFolder = (profile.folders || []).find(folder => folder.id === plan.deletedFromFolderId);
          const card = document.createElement("article");
          card.className = "plan-card trash-plan-card";
          card.dataset.trashPlanId = plan.id;
          card.innerHTML = `
            <div>
              <h3 class="plan-title">${escapeHtml(plan.title)}</h3>
              <div class="plan-meta">
                <span>Pasta de origem: ${escapeHtml(sourceFolder ? sourceFolder.name : "Pasta não encontrada")}</span>
                <span>Excluído em: ${escapeHtml(formatDateTime(plan.deletedAt))}</span>
                <span>Excluído por: ${escapeHtml(plan.deletedBy || "-")}</span>
              </div>
            </div>
            <div class="trash-expiry-badge">${escapeHtml(formatTrashRemaining(plan))}</div>
            <div class="plan-actions">
              <button class="button primary" type="button" data-trash-action="restore">Restaurar</button>
              <button class="button danger" type="button" data-trash-action="permanent-delete">Excluir permanentemente</button>
            </div>
          `;
          els.plansGrid.appendChild(card);
        });
      }

      function handleFolderClick(event) {
        const item = event.target.closest(".folder-item");
        if (!item || event.target.closest("[contenteditable='true']")) return;
        warnRestrictedAdminAccess();
        if (item.dataset.folderAction === "trash") {
          app.view = "trash";
          saveApp({ localOnly: true });
          renderFoldersScreen();
          return;
        }
        app.view = "folders";
        app.activeFolderId = item.dataset.folderId;
        saveApp({ localOnly: true });
        renderFoldersScreen();
      }

      function handleFolderDoubleClick(event) {
        if (blockRestrictedAdminAccess()) return;
        const nameEl = event.target.closest("[data-folder-name]");
        const item = event.target.closest(".folder-item");
        if (!nameEl || !item) return;
        if (item.dataset.folderAction === "trash") return;
        if (item.dataset.folderId === DEFAULT_FOLDER_ID) return;
        enableInlineFolderRename(nameEl, item.dataset.folderId);
      }

      function enableInlineFolderRename(nameEl, folderId) {
        const profile = currentProfile();
        const folder = profile.folders.find(item => item.id === folderId);
        if (!folder) return;
        const oldName = folder.name;
        nameEl.contentEditable = "true";
        nameEl.focus();
        selectElementText(nameEl);
        const finish = () => {
          nameEl.contentEditable = "false";
          const name = nameEl.textContent.trim();
          if (name) folder.name = name;
          if (folder.name !== oldName) recordActivity("Renomeou pasta", `Pasta ${oldName} alterada para ${folder.name}.`, { profile });
          saveApp();
          renderFoldersScreen();
        };
        nameEl.addEventListener("blur", finish, { once: true });
        nameEl.addEventListener("keydown", event => {
          if (event.key === "Enter") {
            event.preventDefault();
            nameEl.blur();
          }
          if (event.key === "Escape") {
            nameEl.textContent = folder.name;
            nameEl.blur();
          }
        });
      }

      function handleFolderContext(event) {
        if (blockRestrictedAdminAccess()) return;
        const item = event.target.closest(".folder-item");
        if (!item) return;
        if (item.dataset.folderAction === "trash") return;
        event.preventDefault();
        selectedFolderForContext = item.dataset.folderId;
        const profile = currentProfile();
        const folder = profile && profile.folders.find(entry => entry.id === selectedFolderForContext);
        els.folderToggleHiddenAction.classList.toggle("hidden", !isSystemAdminUser() || !folder || folder.isDefault);
        els.folderToggleHiddenAction.textContent = folder && folder.hidden ? "Mostrar pasta" : "Ocultar pasta";
        els.folderContextMenu.style.left = event.clientX + "px";
        els.folderContextMenu.style.top = event.clientY + "px";
        els.folderContextMenu.classList.remove("hidden");
      }

      function handleFolderContextAction(event) {
        if (blockRestrictedAdminAccess()) return;
        const action = event.target.dataset.folderContext;
        if (!action || !selectedFolderForContext) return;
        hideFolderContextMenu();
        if (action === "rename") openFolderModal(selectedFolderForContext);
        if (action === "duplicate") duplicateFolder(selectedFolderForContext);
        if (action === "toggle-hidden") toggleFolderHidden(selectedFolderForContext);
        if (action === "delete") deleteFolder(selectedFolderForContext);
      }

      function hideFolderContextMenu() {
        els.folderContextMenu.classList.add("hidden");
      }

      function handleFolderDragOver(event) {
        if (isRestrictedAdminUser()) return;
        const item = event.target.closest(".folder-item");
        if (!item || !draggingPlanId) return;
        if (item.dataset.folderAction === "trash") return;
        event.preventDefault();
        item.classList.add("is-drop-target");
      }

      function handleFolderDragLeave(event) {
        const item = event.target.closest(".folder-item");
        if (item) item.classList.remove("is-drop-target");
      }

      function handleFolderDrop(event) {
        if (blockRestrictedAdminAccess()) return;
        const item = event.target.closest(".folder-item");
        if (!item || !draggingPlanId) return;
        if (item.dataset.folderAction === "trash") return;
        event.preventDefault();
        const profile = currentProfile();
        const plan = profile.plans.find(plan => plan.id === draggingPlanId);
        if (plan) {
          const oldFolder = profile.folders.find(folder => folder.id === plan.folderId);
          const newFolder = profile.folders.find(folder => folder.id === item.dataset.folderId);
          plan.folderId = item.dataset.folderId;
          touchPlan(plan);
          app.activeFolderId = item.dataset.folderId;
          recordActivity("Moveu plano", `Plano ${plan.title} movido de ${oldFolder ? oldFolder.name : "-"} para ${newFolder ? newFolder.name : "-"}.`, { profile, plan });
          saveApp();
          renderFoldersScreen();
        }
      }

      function openFolderModal(folderId) {
        if (blockRestrictedAdminAccess()) return;
        const profile = currentProfile();
        const folder = profile && profile.folders.find(item => item.id === folderId);
        if (folder && folder.isDefault) {
          showToast("A pasta padrão Sem pasta não pode ser editada.");
          return;
        }
        document.getElementById("folderModalTitle").textContent = folder ? "Editar Pasta" : "Nova Pasta";
        document.getElementById("folderIdInput").value = folder ? folder.id : "";
        document.getElementById("folderNameInput").value = folder ? folder.name : "";
        document.getElementById("folderHiddenField").classList.toggle("hidden", !isSystemAdminUser());
        document.getElementById("folderHiddenInput").checked = !!(folder && folder.hidden);
        selectedFolderColor = folder ? folder.color : FOLDER_COLORS[0];
        renderColorPalette(els.folderColorPalette, FOLDER_COLORS, selectedFolderColor, handleFolderColorSelect);
        openModal("folderModal");
      }

      function saveFolderFromModal(event) {
        event.preventDefault();
        if (blockRestrictedAdminAccess()) return;
        const profile = currentProfile();
        if (!profile) return;
        const id = document.getElementById("folderIdInput").value;
        const name = document.getElementById("folderNameInput").value.trim();
        if (!name) return showToast("Informe o nome da pasta.");
        if (id) {
          const folder = profile.folders.find(item => item.id === id);
          if (folder && !folder.isDefault) {
            const oldName = folder.name;
            folder.name = name;
            folder.color = selectedFolderColor;
            if (isSystemAdminUser()) folder.hidden = document.getElementById("folderHiddenInput").checked;
            recordActivity("Editou pasta", `Pasta ${oldName} alterada para ${folder.name}.`, { profile });
          }
        } else {
          const folder = {
            id: createId(),
            name,
            color: selectedFolderColor,
            isDefault: false,
            hidden: isSystemAdminUser() && document.getElementById("folderHiddenInput").checked,
            clientId: profile.clientId || "",
            unitId: profile.unitId || "",
            sectorId: profile.sectorId || "",
            createdAt: new Date().toISOString()
          };
          profile.folders.push(folder);
          recordActivity("Criou pasta", `Criou a pasta ${folder.name}.`, { profile });
        }
        saveApp();
        closeModal("folderModal");
        renderFoldersScreen();
      }

      function duplicateFolder(folderId) {
        if (blockRestrictedAdminAccess()) return;
        const profile = currentProfile();
        const folder = profile.folders.find(item => item.id === folderId);
        if (!folder) return;
        const newFolderId = createId();
        profile.folders.push({
          id: newFolderId,
          name: `${folder.name} (cópia)`,
          color: folder.color,
          isDefault: false,
          hidden: folder.hidden === true,
          clientId: folder.clientId || profile.clientId || "",
          unitId: folder.unitId || profile.unitId || "",
          sectorId: folder.sectorId || profile.sectorId || "",
          createdAt: new Date().toISOString()
        });
        const copies = profile.plans
          .filter(plan => plan.folderId === folderId)
          .map(plan => duplicatePlanObject(plan, newFolderId));
        profile.plans.push(...copies);
        app.activeFolderId = newFolderId;
        recordActivity("Duplicou pasta", `Duplicou a pasta ${folder.name} com ${copies.length} plano(s).`, { profile });
        saveApp();
        renderFoldersScreen();
      }

      async function deleteFolder(folderId) {
        if (blockRestrictedAdminAccess()) return;
        const profile = currentProfile();
        const folder = profile.folders.find(item => item.id === folderId);
        if (!folder) return;
        if (folder.isDefault) {
          showToast("A pasta padrão Sem pasta não pode ser excluída.");
          return;
        }
        if (!await managementConfirm("Excluir esta pasta? Os planos dentro dela serão movidos para Sem pasta.")) return;
        createInternalBackup(`Antes de excluir pasta ${folder.name}`, { automatic: true, profileId: profile.id });
        profile.plans.forEach(plan => {
          if (plan.folderId === folderId) {
            plan.folderId = DEFAULT_FOLDER_ID;
            touchPlan(plan);
          }
        });
        profile.folders = profile.folders.filter(item => item.id !== folderId);
        if (app.activeFolderId === folderId) app.activeFolderId = DEFAULT_FOLDER_ID;
        recordActivity("Excluiu pasta", `Excluiu a pasta ${folder.name}; planos movidos para Sem pasta.`, { profile });
        saveApp({ deleteFolderId: folderId });
        renderFoldersScreen();
      }

      function toggleFolderHidden(folderId) {
        if (!isSystemAdminUser()) return;
        const profile = currentProfile();
        const folder = profile && profile.folders.find(item => item.id === folderId);
        if (!folder || folder.isDefault) return;
        folder.hidden = !folder.hidden;
        saveApp({ profileId: profile.id });
        renderFoldersScreen();
      }

      function openPlanModal() {
        if (blockRestrictedAdminAccess()) return;
        const profile = currentProfile();
        if (!profile) return;
        document.getElementById("planNameInput").value = "";
        document.getElementById("planCompanyInput").value = "";
        document.getElementById("planDocumentTypeInput").value = "PGR";
        const planTemplateInput = document.getElementById("planTemplateInput");
        const customTemplates = normalizeActionPlanTemplates(app.actionPlanTemplates).filter(template => template.active && !template.systemDefault);
        planTemplateInput.innerHTML = `<option value="template">Carregar template padrão</option><option value="blank">Iniciar do zero</option>${customTemplates.map(template => `<option value="tpl:${escapeAttr(template.id)}">${escapeHtml(template.name)}</option>`).join("")}`;
        planTemplateInput.value = "template";
        document.getElementById("planFolderInput").innerHTML = getVisibleFolders(profile).map(folder => `<option value="${escapeAttr(folder.id)}" ${folder.id === app.activeFolderId ? "selected" : ""}>${escapeHtml(folder.name)}</option>`).join("");
        openModal("planModal");
        setTimeout(() => document.getElementById("planNameInput").focus(), 30);
      }

      function createPlanFromModal(event) {
        event.preventDefault();
        if (blockRestrictedAdminAccess()) return;
        const profile = currentProfile();
        if (!profile) return;
        const title = document.getElementById("planNameInput").value.trim();
        const company = document.getElementById("planCompanyInput").value.trim();
        const documentType = document.getElementById("planDocumentTypeInput").value;
        const folderId = document.getElementById("planFolderInput").value || DEFAULT_FOLDER_ID;
        const templateChoice = document.getElementById("planTemplateInput").value;
        const useTemplate = templateChoice === "template";
        const selectedTemplate = useTemplate
          ? app.actionPlanTemplates.find(template => template.systemDefault)
          : templateChoice.startsWith("tpl:") ? app.actionPlanTemplates.find(template => template.id === templateChoice.slice(4) && template.active) : null;
        if (!title || !company) return showToast("Informe o nome do plano e a empresa/cliente.");
        const now = new Date().toISOString();
        const plan = normalizePlan({
          id: createId(),
          title,
          company,
          documentType,
          folderId,
          createdAt: now,
          updatedAt: now,
          clientId: profile.clientId || "",
          unitId: profile.unitId || "",
          sectorId: profile.sectorId || "",
          data: selectedTemplate ? {
            meta: createPlanData({ useTemplate: false, company, documentType }).meta,
            actions: cloneTemplateRows(selectedTemplate.rows),
            equipment: cloneTemplateEquipmentRows(selectedTemplate.equipmentRows),
            trainings: cloneTemplateTrainingRows(selectedTemplate.trainingRows)
          } : createPlanData({ useTemplate, company, documentType })
        });
        profile.plans.push(plan);
        app.activeFolderId = folderId;
        closeModal("planModal");
        recordActivity("Criou plano", `Criou o plano ${plan.title} para ${plan.company || "empresa não informada"}.`, { profile, plan });
        if (selectedTemplate) recordActivity("Aplicou template", `Aplicou ${selectedTemplate.name} ao criar ${plan.title}.`, { profile, plan });
        saveApp();
        showEditor(plan.id);
      }

      async function handlePlanClick(event) {
        const trashCard = event.target.closest("[data-trash-plan-id]");
        if (trashCard) {
          await handleTrashPlanClick(event, trashCard);
          return;
        }
        const card = event.target.closest(".plan-card");
        if (!card) return;
        const action = event.target.closest("[data-plan-action]");
        if (!action) return;
        const profile = currentProfile();
        const plan = profile.plans.find(item => item.id === card.dataset.planId);
        if (!plan) return;
        if (action.dataset.planAction === "open") {
          warnRestrictedAdminAccess();
          recordActivity("Abriu plano", `Abriu o plano ${plan.title}.`, { profile, plan });
          showEditor(plan.id);
          return;
        }
        if (blockRestrictedAdminAccess()) return;
        if (action.dataset.planAction === "duplicate") {
          const copy = duplicatePlanObject(plan, plan.folderId);
          profile.plans.push(copy);
          recordActivity("Duplicou plano", `Duplicou o plano ${plan.title}.`, { profile, plan: copy });
          saveApp();
          renderFoldersScreen();
        }
        if (action.dataset.planAction === "delete") {
          if (!await openConfirmModal({
            title: "Mover plano para a lixeira",
            message: `O plano "${plan.title}" ficará disponível para restauração por 24 horas antes de ser apagado permanentemente.`,
            confirmLabel: "Mover para lixeira",
            tone: "warning"
          })) return;
          createInternalBackup(`Antes de mover plano ${plan.title} para a lixeira`, { automatic: true, profileId: profile.id, planId: plan.id });
          movePlanToTrash(plan.id, profile);
          renderFoldersScreen();
        }
      }

      async function handleTrashPlanClick(event, card) {
        if (blockRestrictedAdminAccess()) return;
        const action = event.target.closest("[data-trash-action]");
        if (!action) return;
        const profile = currentProfile();
        const planId = card.dataset.trashPlanId;
        if (!profile || !planId) return;
        if (action.dataset.trashAction === "restore") {
          restorePlanFromTrash(planId, profile);
          app.view = "folders";
          renderFoldersScreen();
          return;
        }
        if (action.dataset.trashAction === "permanent-delete") {
          const plan = (profile.plans || []).find(item => item.id === planId);
          if (!plan) return;
          if (!await openConfirmModal({
            title: "Excluir permanentemente",
            message: `O plano "${plan.title}" será removido definitivamente e não poderá ser restaurado.`,
            requiredText: "EXCLUIR",
            confirmLabel: "Excluir definitivamente",
            tone: "danger"
          })) return;
          createInternalBackup(`Antes de excluir permanentemente ${plan.title}`, { automatic: true, profileId: profile.id, planId: plan.id });
          deletePlanPermanently(planId, profile);
          renderFoldersScreen();
        }
      }

      function handlePlanMove(event) {
        if (blockRestrictedAdminAccess()) return;
        const copySelect = event.target.closest("[data-plan-copy]");
        if (copySelect && copySelect.value) {
          copyPlanToFolder(copySelect);
          return;
        }
        const select = event.target.closest("[data-plan-move]");
        if (!select || !select.value) return;
        const card = select.closest(".plan-card");
        const profile = currentProfile();
        const plan = profile.plans.find(item => item.id === card.dataset.planId);
        if (plan) {
          const oldFolder = profile.folders.find(folder => folder.id === plan.folderId);
          const newFolder = profile.folders.find(folder => folder.id === select.value);
          plan.folderId = select.value;
          touchPlan(plan);
          recordActivity("Moveu plano", `Plano ${plan.title} movido de ${oldFolder ? oldFolder.name : "-"} para ${newFolder ? newFolder.name : "-"}.`, { profile, plan });
          saveApp();
          renderFoldersScreen();
        }
      }

      function copyPlanToFolder(select) {
        const card = select.closest(".plan-card");
        const profile = currentProfile();
        const plan = profile && profile.plans.find(item => item.id === card.dataset.planId);
        const destination = profile && profile.folders.find(folder => folder.id === select.value);
        if (!plan || !destination) return;
        const copy = duplicatePlanObject(plan, destination.id);
        profile.plans.push(copy);
        recordActivity("Copiou plano", `Copiou o plano ${plan.title} para a pasta ${destination.name}.`, { profile, plan: copy });
        saveApp();
        renderFoldersScreen();
        showToast(`Plano copiado para "${destination.name}".`);
      }

      function handlePlanDragStart(event) {
        if (isRestrictedAdminUser()) {
          event.preventDefault();
          return;
        }
        const card = event.target.closest(".plan-card");
        if (!card) return;
        draggingPlanId = card.dataset.planId;
        card.classList.add("is-dragging");
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", draggingPlanId);
      }

      function handlePlanDragEnd() {
        draggingPlanId = null;
        document.querySelectorAll(".plan-card.is-dragging").forEach(card => card.classList.remove("is-dragging"));
        document.querySelectorAll(".folder-item.is-drop-target").forEach(item => item.classList.remove("is-drop-target"));
      }

      function duplicatePlanObject(plan, folderId) {
        const copy = deepClone(plan);
        copy.id = createId();
        copy.title = `${plan.title} (cópia)`;
        copy.folderId = folderId;
        copy.deleted = false;
        copy.deletedAt = "";
        copy.deletedBy = "";
        copy.deletedFromProfileId = "";
        copy.deletedFromFolderId = "";
        copy.trashExpiresAt = "";
        copy.createdAt = new Date().toISOString();
        copy.updatedAt = new Date().toISOString();
        ["actions", "equipment", "trainings"].forEach(section => {
          copy.data[section].forEach(row => {
            row.id = createId();
            row.lastEdited = new Date().toISOString();
          });
        });
        return copy;
      }

      function renderEditor() {
        const plan = currentPlan();
        if (!plan) return showFolders();
        els.planTitleInput.value = plan.title;
        els.planTitleInput.readOnly = isRestrictedAdminUser();
        renderRestrictedEditorUi();
        renderMetaFields();
        renderTemplateActionOptions();
        renderResponsibleControls();
        renderEditorTables();
        updatePlanUndoButtons();
        markSaved();
      }

      function getPlanEditHistory(planId = currentPlan() && currentPlan().id) {
        if (!planId) return null;
        if (!planEditHistories.has(planId)) {
          planEditHistories.set(planId, {
            undo: [],
            redo: [],
            lastCoalesceKey: "",
            lastCoalesceAt: 0
          });
        }
        return planEditHistories.get(planId);
      }

      // Guarda o estado anterior somente em memória para desfazer alterações do editor.
      function pushPlanUndoState(label, options = {}) {
        const plan = currentPlan();
        if (!plan || isRestoringPlanHistory || isRestrictedAdminUser()) return;
        const history = getPlanEditHistory(plan.id);
        const now = Date.now();
        const coalesceKey = String(options.coalesceKey || "");
        if (coalesceKey && history.lastCoalesceKey === coalesceKey && now - history.lastCoalesceAt < 900) {
          history.lastCoalesceAt = now;
          return;
        }
        const snapshot = deepClone(plan);
        const hash = JSON.stringify(snapshot);
        const previous = history.undo[history.undo.length - 1];
        if (!previous || previous.hash !== hash) {
          history.undo.push({ label: label || "Alteração no plano", snapshot, hash });
          if (history.undo.length > PLAN_UNDO_LIMIT) history.undo.splice(0, history.undo.length - PLAN_UNDO_LIMIT);
        }
        history.redo = [];
        history.lastCoalesceKey = coalesceKey;
        history.lastCoalesceAt = now;
        updatePlanUndoButtons();
      }

      function restoreCurrentPlanHistorySnapshot(snapshot) {
        const profile = currentProfile();
        const current = currentPlan();
        if (!profile || !current || !snapshot) return false;
        const index = profile.plans.findIndex(plan => plan.id === current.id);
        if (index < 0) return false;
        isRestoringPlanHistory = true;
        profile.plans[index] = deepClone(snapshot);
        app.activePlanId = snapshot.id;
        selectedActions.clear();
        isRestoringPlanHistory = false;
        saveApp();
        renderEditor();
        markSaved();
        return true;
      }

      function undoCurrentPlanChange() {
        if (blockRestrictedAdminAccess()) return;
        const plan = currentPlan();
        const history = plan && getPlanEditHistory(plan.id);
        if (!plan || !history || !history.undo.length) return;
        const entry = history.undo.pop();
        const currentSnapshot = deepClone(plan);
        history.redo.push({ label: entry.label, snapshot: currentSnapshot, hash: JSON.stringify(currentSnapshot) });
        history.lastCoalesceKey = "";
        if (restoreCurrentPlanHistorySnapshot(entry.snapshot)) {
          showToast(`Desfeito: ${entry.label}.`, "info");
          updatePlanUndoButtons();
        }
      }

      function redoCurrentPlanChange() {
        if (blockRestrictedAdminAccess()) return;
        const plan = currentPlan();
        const history = plan && getPlanEditHistory(plan.id);
        if (!plan || !history || !history.redo.length) return;
        const entry = history.redo.pop();
        const currentSnapshot = deepClone(plan);
        history.undo.push({ label: entry.label, snapshot: currentSnapshot, hash: JSON.stringify(currentSnapshot) });
        history.lastCoalesceKey = "";
        if (restoreCurrentPlanHistorySnapshot(entry.snapshot)) {
          showToast(`Refeito: ${entry.label}.`, "info");
          updatePlanUndoButtons();
        }
      }

      function updatePlanUndoButtons() {
        const plan = currentPlan();
        const history = plan && getPlanEditHistory(plan.id);
        const undo = document.getElementById("undoPlanBtn");
        const redo = document.getElementById("redoPlanBtn");
        if (undo) {
          undo.disabled = !history || !history.undo.length || isRestrictedAdminUser();
          undo.title = history && history.undo.length ? `Desfazer: ${history.undo[history.undo.length - 1].label}` : "Nada para desfazer";
        }
        if (redo) {
          redo.disabled = !history || !history.redo.length || isRestrictedAdminUser();
          redo.title = history && history.redo.length ? `Refazer: ${history.redo[history.redo.length - 1].label}` : "Nada para refazer";
        }
      }

      function handlePlanHistoryShortcut(event) {
        if (!(event.ctrlKey || event.metaKey) || selectedPortalApp !== "plans" || app.view !== "editor") return;
        const target = event.target;
        if (target && target.closest && target.closest("input, textarea, select, .rich-editor, .when-editor, [contenteditable='true']")) return;
        const key = String(event.key || "").toLowerCase();
        const redo = key === "y" || (key === "z" && event.shiftKey);
        if (key !== "z" && key !== "y") return;
        event.preventDefault();
        if (redo) redoCurrentPlanChange();
        else undoCurrentPlanChange();
      }

      function renderRestrictedEditorUi() {
        const readOnly = isRestrictedAdminUser();
        ["templateActionField", "addValidityBtn", "companyLogoUploadBtn", "companyLogoRemoveBtn", "undoPlanBtn", "redoPlanBtn", "exportJsonBtn", "importJsonBtn", "applyBulkStatus", "deleteSelected"].forEach(id => {
          const element = document.getElementById(id);
          if (element) element.classList.toggle("hidden", readOnly);
        });
        if (els.bulkStatus) els.bulkStatus.classList.toggle("hidden", readOnly);
        if (els.selectAllActions) els.selectAllActions.disabled = readOnly;
        document.querySelectorAll("[data-add-section]").forEach(button => {
          button.classList.toggle("hidden", readOnly);
        });
      }

      function renderMetaFields() {
        const plan = currentPlan();
        if (!plan) return;
        const readOnly = isRestrictedAdminUser();
        document.querySelectorAll("[data-meta]").forEach(field => {
          const key = field.dataset.meta;
          if (field.classList && field.classList.contains("editable-text")) {
            field.textContent = plan.data.meta[key] || "";
            field.contentEditable = readOnly ? "false" : "true";
          } else {
            field.value = plan.data.meta[key] || "";
            field.disabled = readOnly;
          }
        });
        renderCompanyLogo();
      }

      function renderCompanyLogo() {
        const plan = currentPlan();
        if (!plan) return;
        const preview = document.getElementById("companyLogoPreview");
        const image = document.getElementById("companyLogoImagePreview");
        const removeButton = document.getElementById("companyLogoRemoveBtn");
        const source = plan.data.meta.companyLogoImage || "";
        preview.style.display = source ? "grid" : "none";
        image.hidden = !source;
        if (source) image.src = source;
        else image.removeAttribute("src");
        removeButton.hidden = !source || isRestrictedAdminUser();
      }

      async function handleCompanyLogoUpload(event) {
        if (blockRestrictedAdminAccess()) return;
        const file = event.target.files && event.target.files[0];
        event.target.value = "";
        if (!file) return;
        if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
          showToast("Selecione uma imagem PNG ou JPEG.");
          return;
        }
        try {
          const plan = currentPlan();
          if (!plan) return;
          pushPlanUndoState("Anexou a logo da empresa");
          plan.data.meta.companyLogoImage = await compressCompanyLogoFile(file);
          plan.data.meta.companyLogoImageName = file.name || "logo";
          touchPlan(plan);
          saveApp();
          renderCompanyLogo();
          markSaved();
        } catch (error) {
          console.error(error);
          showToast("Não foi possível processar a logo selecionada.");
        }
      }

      function removeCompanyLogo() {
        if (blockRestrictedAdminAccess()) return;
        const plan = currentPlan();
        if (!plan || !plan.data.meta.companyLogoImage) return;
        pushPlanUndoState("Removeu a logo da empresa");
        plan.data.meta.companyLogoImage = "";
        plan.data.meta.companyLogoImageName = "";
        touchPlan(plan);
        saveApp();
        renderCompanyLogo();
        markSaved();
      }

      function compressCompanyLogoFile(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const image = new Image();
            image.onload = () => {
              const ratio = Math.min(1, 240 / image.naturalWidth, 120 / image.naturalHeight);
              const width = Math.max(1, Math.round(image.naturalWidth * ratio));
              const height = Math.max(1, Math.round(image.naturalHeight * ratio));
              const canvas = document.createElement("canvas");
              canvas.width = width;
              canvas.height = height;
              const context = canvas.getContext("2d");
              context.drawImage(image, 0, 0, width, height);
              const type = file.type === "image/png" ? "image/png" : "image/jpeg";
              resolve(canvas.toDataURL(type, 0.82));
            };
            image.onerror = reject;
            image.src = reader.result;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      function openValidityModal() {
        if (blockRestrictedAdminAccess()) return;
        document.getElementById("validityMonthInput").value = String(new Date().getMonth());
        openModal("validityModal");
      }

      // Aplica a mesma vigência anual nas ações e nos treinamentos.
      async function applyValidityToCurrentPlan(event) {
        event.preventDefault();
        if (blockRestrictedAdminAccess()) return;
        if (!await managementConfirm("Aplicar a vigência e substituir todos os valores existentes da coluna Quando?", { tone: "primary" })) return;
        const plan = currentPlan();
        const data = currentPlanData();
        if (!plan || !data) return;
        pushPlanUndoState("Aplicou vigência");
        const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
        const month = months[Number(document.getElementById("validityMonthInput").value)] || months[0];
        const currentYear = new Date().getFullYear();
        const validity = `${month}/${String(currentYear).slice(-2)}-${month}/${String(currentYear + 1).slice(-2)}`;
        [...data.actions, ...data.trainings].forEach(row => {
          row.when = validity;
          touchRow(row);
        });
        touchPlan(plan);
        recordActivity("Aplicou vigência", `Aplicou a vigência ${validity} no plano ${plan.title}.`, { profile: currentProfile(), plan });
        saveApp();
        renderEditorTables();
        markSaved();
        closeModal("validityModal");
      }

      function handleMetaInput(event) {
        if (isRestrictedAdminUser()) return;
        const plan = currentPlan();
        if (!plan) return;
        const field = event.currentTarget;
        const key = field.dataset.meta;
        pushPlanUndoState(`Alterou ${key}`, { coalesceKey: `meta:${key}` });
        plan.data.meta[key] = field.isContentEditable ? field.textContent.trim() : field.value;
        if (key === "company") plan.company = plan.data.meta[key];
        if (key === "documentName") plan.documentType = plan.data.meta[key];
        touchPlan(plan);
        saveApp();
        markSaved();
      }

      function renderEditorTables() {
        const data = currentPlanData();
        if (!data) return;
        renderSection("actions");
        renderSection("equipment");
        renderSection("trainings");
        renderDashboard();
        updateSelectionUi();
        renderResponsibleControls();
      }

      function renderSection(section) {
        const rows = currentPlanData()[section];
        const tbody = bodyBySection[section];
        tbody.innerHTML = "";
        const filteredRows = rows.filter(row => matchesFilters(row, section));
        if (!filteredRows.length) {
          const colspan = section === "actions" ? 8 : section === "equipment" ? 6 : 7;
          tbody.innerHTML = `<tr><td class="empty-row" colspan="${colspan}">Nenhum registro encontrado com os filtros atuais.</td></tr>`;
          return;
        }
        filteredRows.forEach(row => {
          const index = rows.findIndex(item => item.id === row.id) + 1;
          tbody.appendChild(createRow(section, row, index));
        });
      }

      function createRow(section, row, index) {
        const tr = document.createElement("tr");
        tr.dataset.section = section;
        tr.dataset.id = row.id;
        tr.draggable = false;
        tr.innerHTML = section === "actions" ? actionRowHtml(row, index) : section === "equipment" ? equipmentRowHtml(row, index) : trainingRowHtml(row, index);
        return tr;
      }

      function itemCellHtml(row, index, selectable, section) {
        const readOnly = isRestrictedAdminUser();
        const checkbox = selectable && !readOnly ? `<input class="row-check" type="checkbox" data-select-row ${selectedActions.has(row.id) ? "checked" : ""} aria-label="Selecionar item ${index}">` : "";
        const rows = currentPlanData()[section] || [];
        const moveControl = `
          <span class="row-move-control">
            <button class="row-move-btn" type="button" data-row-move="up" title="Mover ação para cima" aria-label="Mover ação para cima" ${readOnly || index <= 1 ? "disabled" : ""}>&#9650;</button>
            <button class="row-drag-dot" type="button" draggable="${readOnly ? "false" : "true"}" data-drag-handle title="Arrastar ação" aria-label="Arrastar ação" ${readOnly ? "disabled" : ""}>&bull;</button>
            <button class="row-move-btn" type="button" data-row-move="down" title="Mover ação para baixo" aria-label="Mover ação para baixo" ${readOnly || index >= rows.length ? "disabled" : ""}>&#9660;</button>
          </span>`;
        return `
          <div class="item-cell ${selectable ? "" : "no-checkbox"}">
            ${checkbox}
            ${moveControl}
            <span class="item-number">${index}</span>
          </div>
        `;
      }

      function richEditorHtml(field, value, placeholder) {
        return `<div class="rich-editor" contenteditable="${isRestrictedAdminUser() ? "false" : "true"}" spellcheck="true" data-field="${field}" data-placeholder="${escapeAttr(placeholder)}">${sanitizeRichHtml(value || "")}</div>`;
      }

      function actionRowHtml(row, index) {
        return `
          <td>${itemCellHtml(row, index, true, "actions")}</td>
          <td>${richEditorHtml("actionHtml", row.actionHtml, "Descreva a ação recomendada. Cole ou arraste imagens aqui.")}</td>
          <td><input class="table-input" data-field="responsible" list="responsibleSuggestions" value="${escapeAttr(row.responsible)}" ${isRestrictedAdminUser() ? "readonly" : ""}></td>
          <td>${whenCellHtml(row.when)}</td>
          <td>${selectHtml("priority", row.priority, PRIORITIES, "priority-select " + priorityClass(row.priority))}</td>
          <td>${selectHtml("status", row.status, STATUSES, "status-select " + statusClass(row.status))}</td>
          <td>${richEditorHtml("observationHtml", row.observationHtml, "Observações, evidências e imagens.")}</td>
          <td class="no-print">${rowActionButtons(row)}</td>
        `;
      }

      function equipmentRowHtml(row, index) {
        return `
          <td>${itemCellHtml(row, index, false, "equipment")}</td>
          <td>${richEditorHtml("descriptionHtml", row.descriptionHtml, "Descreva o equipamento. Cole imagens aqui.")}</td>
          <td><input class="table-input" data-field="responsible" list="responsibleSuggestions" value="${escapeAttr(row.responsible)}" ${isRestrictedAdminUser() ? "readonly" : ""}></td>
          <td>${selectHtml("status", row.status, STATUSES, "status-select " + statusClass(row.status))}</td>
          <td>${richEditorHtml("observationHtml", row.observationHtml, "Observações e imagens.")}</td>
          <td class="no-print">${rowActionButtons(row)}</td>
        `;
      }

      function trainingRowHtml(row, index) {
        return `
          <td>${itemCellHtml(row, index, false, "trainings")}</td>
          <td>${richEditorHtml("trainingHtml", row.trainingHtml, "Descreva o treinamento. Cole imagens aqui.")}</td>
          <td><input class="table-input" data-field="responsible" list="responsibleSuggestions" value="${escapeAttr(row.responsible)}" ${isRestrictedAdminUser() ? "readonly" : ""}></td>
          <td>${whenCellHtml(row.when)}</td>
          <td>${selectHtml("status", row.status, STATUSES, "status-select " + statusClass(row.status))}</td>
          <td>${richEditorHtml("observationHtml", row.observationHtml, "Observações e imagens.")}</td>
          <td class="no-print">${rowActionButtons(row)}</td>
        `;
      }

      function whenCellHtml(value) {
        const readOnly = isRestrictedAdminUser();
        return `
          <div class="when-cell">
            <div class="when-editor" contenteditable="${readOnly ? "false" : "true"}" spellcheck="true" data-field="when" data-placeholder="jan/26, jan/26-jan/27...">${escapeHtml(value || "")}</div>
            <input class="date-picker ${readOnly ? "hidden" : ""}" type="date" data-date-picker title="Selecionar data" ${readOnly ? "disabled" : ""}>
          </div>
        `;
      }

      function selectHtml(field, value, options, className) {
        const optionHtml = options.map(option => `<option value="${escapeAttr(option)}" ${option === value ? "selected" : ""}>${escapeHtml(option)}</option>`).join("");
        const disabled = isRestrictedAdminUser() ? "disabled" : "";
        if (field === "status") {
          const display = value === "Em andamento" ? "Em<br>Andamento" : escapeHtml(value || "-");
          return `
            <div class="select-shell status-shell ${statusClass(value)}">
              <span class="select-display">${display}</span>
              <select class="table-select ${className}" data-field="${field}" aria-label="${escapeAttr(value || field)}" ${disabled}>${optionHtml}</select>
            </div>
          `;
        }
        return `<select class="table-select ${className}" data-field="${field}" aria-label="${escapeAttr(value || field)}" ${disabled}>${optionHtml}</select>`;
      }

      function rowActionButtons(row) {
        if (isRestrictedAdminUser()) {
          return `<div class="row-actions"><div class="last-edit" title="${escapeAttr(formatDateTime(row.lastEdited))}">Editado: ${escapeHtml(formatDateTime(row.lastEdited))}</div></div>`;
        }
        return `
          <div class="row-actions">
            <button class="button icon-only" type="button" data-action="duplicate" title="Duplicar linha" aria-label="Duplicar linha">${icons.copy}</button>
            <button class="button icon-only danger" type="button" data-action="delete" title="Excluir linha" aria-label="Excluir linha">${icons.trash}</button>
            <div class="last-edit" title="${escapeAttr(formatDateTime(row.lastEdited))}">Editado: ${escapeHtml(formatDateTime(row.lastEdited))}</div>
          </div>
        `;
      }

      function handleTableInput(event) {
        if (isRestrictedAdminUser()) return;
        const target = event.target;
        if (target.classList && target.classList.contains("rich-editor")) {
          saveRichEditor(target);
          return;
        }
        if (target.classList && target.classList.contains("when-editor")) {
          savePlainEditor(target);
          return;
        }
        if (!target.dataset.field) return;
        const { row, section } = getRowFromElement(target);
        if (!row) return;
        pushPlanUndoState(`Editou ${sectionLabels[section] || "linha"}`, { coalesceKey: `row:${section}:${row.id}:${target.dataset.field}` });
        const value = target.dataset.field === "progress" ? clampProgress(target.value) : target.value;
        row[target.dataset.field] = value;
        touchRowAndPlan(row);
        if (target.dataset.field === "progress") updateProgressControl(target.closest(".progress-control"), value);
        saveApp();
        renderDashboard();
        if (target.dataset.field === "responsible") renderResponsibleControls();
        if (section === "actions") updateSelectionUi();
        markSaved();
      }

      function handleTableChange(event) {
        if (isRestrictedAdminUser()) return;
        const target = event.target;
        if (target.dataset.selectRow !== undefined) {
          const tr = target.closest("tr");
          if (!tr) return;
          if (target.checked) selectedActions.add(tr.dataset.id);
          else selectedActions.delete(tr.dataset.id);
          updateSelectionUi();
          return;
        }

        if (target.dataset.datePicker !== undefined) {
          const input = target.closest(".when-cell").querySelector("[data-field='when']");
          if (target.value && input) {
            const formatted = formatDateFromInput(target.value);
            if (input.isContentEditable) input.textContent = formatted;
            else input.value = formatted;
            input.dispatchEvent(new Event("input", { bubbles: true }));
          }
          target.value = "";
          return;
        }

        if (!target.dataset.field) return;
        const { row } = getRowFromElement(target);
        if (!row) return;
        row[target.dataset.field] = target.dataset.field === "progress" ? clampProgress(target.value) : target.value;
        if (target.dataset.field === "status" && row.status === "Concluído" && "progress" in row) row.progress = 100;
        touchRowAndPlan(row);
        saveApp();
        renderEditorTables();
        markSaved();
      }

      function handleTableClick(event) {
        if (isRestrictedAdminUser()) return;
        const moveButton = event.target.closest("[data-row-move]");
        if (moveButton) {
          const { row, section } = getRowFromElement(moveButton);
          if (row) moveRow(section, row.id, moveButton.dataset.rowMove);
          return;
        }
        const imageWrap = event.target.closest(".rt-image-wrap");
        if (imageWrap) {
          selectRichImage(imageWrap);
          return;
        }
        if (selectedRichImage && !event.target.closest(".rich-toolbar")) clearSelectedRichImage();
        const button = event.target.closest("[data-action]");
        if (!button) return;
        const { row, section } = getRowFromElement(button);
        if (!row) return;
        if (button.dataset.action === "delete") deleteRow(section, row.id);
        if (button.dataset.action === "duplicate") duplicateRow(section, row.id);
      }

      function saveRichEditor(editor) {
        if (isRestrictedAdminUser()) return;
        const { row, section } = getRowFromElement(editor);
        if (!row) return;
        pushPlanUndoState(`Editou ${sectionLabels[section] || "linha"}`, { coalesceKey: `rich:${section}:${row.id}:${editor.dataset.field}` });
        const persist = () => {
          row[editor.dataset.field] = sanitizeRichHtml(editor.innerHTML);
          touchRowAndPlan(row);
          saveApp();
          renderDashboard();
          markSaved();
        };
        compressRichEditorImages(editor).then(persist).catch(error => {
          console.error(error);
          persist();
        });
      }

      function savePlainEditor(editor) {
        if (isRestrictedAdminUser()) return;
        const { row, section } = getRowFromElement(editor);
        if (!row) return;
        pushPlanUndoState(`Editou ${sectionLabels[section] || "linha"}`, { coalesceKey: `plain:${section}:${row.id}:${editor.dataset.field}` });
        row[editor.dataset.field] = (editor.innerText || editor.textContent || "").replace(/\u00a0/g, " ");
        touchRowAndPlan(row);
        saveApp();
        markSaved();
      }

      function addRow(section) {
        if (blockRestrictedAdminAccess()) return;
        pushPlanUndoState(`Adicionou ${sectionLabels[section] || "linha"}`);
        const now = new Date().toISOString();
        const base = { id: createId(), lastEdited: now, responsible: "", status: "Não iniciado", observationHtml: "" };
        const row = section === "actions"
          ? { ...base, actionHtml: "", when: "", priority: "Média", progress: 0 }
          : section === "equipment"
            ? { ...base, descriptionHtml: "" }
            : { ...base, trainingHtml: "", when: "" };
        currentPlanData()[section].push(row);
        touchPlan(currentPlan());
        recordActivity("Adicionou linha", `Adicionou ${sectionLabels[section] || "linha"} em ${currentPlan().title}.`, { plan: currentPlan() });
        saveApp();
        renderEditorTables();
        focusNewRow(section, row.id);
      }

      function focusNewRow(section, id) {
        requestAnimationFrame(() => {
          const row = bodyBySection[section].querySelector(`tr[data-id="${CSS.escape(id)}"]`);
          const field = row && row.querySelector(".rich-editor, .when-editor, input");
          if (field) field.focus();
        });
      }

      function duplicateRow(section, id) {
        if (blockRestrictedAdminAccess()) return;
        const rows = currentPlanData()[section];
        const index = rows.findIndex(row => row.id === id);
        if (index < 0) return;
        pushPlanUndoState(`Duplicou ${sectionLabels[section] || "linha"}`);
        const copy = deepClone(rows[index]);
        copy.id = createId();
        copy.lastEdited = new Date().toISOString();
        rows.splice(index + 1, 0, copy);
        touchPlan(currentPlan());
        recordActivity("Duplicou linha", `Duplicou ${sectionLabels[section] || "linha"} no plano ${currentPlan().title}.`, { plan: currentPlan() });
        saveApp();
        renderEditorTables();
      }

      async function deleteRow(section, id) {
        if (blockRestrictedAdminAccess()) return;
        const label = sectionLabels[section] || "linha";
        if (!await managementConfirm(`Excluir esta ${label}? Esta ação não pode ser desfeita.`)) return;
        pushPlanUndoState(`Excluiu ${label}`);
        currentPlanData()[section] = currentPlanData()[section].filter(row => row.id !== id);
        selectedActions.delete(id);
        touchPlan(currentPlan());
        recordActivity("Excluiu linha", `Excluiu ${label} do plano ${currentPlan().title}.`, { plan: currentPlan() });
        saveApp({ rowDelete: { section, rowId: id } });
        renderEditorTables();
      }

      function handleRowDragStart(event) {
        if (isRestrictedAdminUser()) {
          event.preventDefault();
          return;
        }
        const handle = event.target.closest("[data-drag-handle]");
        if (!handle) {
          event.preventDefault();
          return;
        }
        const tr = handle.closest("tr[data-id]");
        if (!tr) return;
        clearRowDropIndicators();
        draggingRow = { section: tr.dataset.section, id: tr.dataset.id, position: "before" };
        tr.classList.add("is-dragging");
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", tr.dataset.id);
      }

      function handleRowDragOver(event) {
        const tr = event.target.closest("tr[data-id]");
        if (!tr || !draggingRow || tr.dataset.section !== draggingRow.section || tr.dataset.id === draggingRow.id) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        const bounds = tr.getBoundingClientRect();
        const position = event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";
        clearRowDropIndicators(tr);
        tr.classList.toggle("drag-insert-before", position === "before");
        tr.classList.toggle("drag-insert-after", position === "after");
        draggingRow.position = position;
      }

      function handleRowDrop(event) {
        if (blockRestrictedAdminAccess()) return;
        const tr = event.target.closest("tr[data-id]");
        if (!tr || !draggingRow || tr.dataset.section !== draggingRow.section || tr.dataset.id === draggingRow.id) return;
        event.preventDefault();
        const rows = currentPlanData()[draggingRow.section];
        const from = rows.findIndex(row => row.id === draggingRow.id);
        const targetBeforeRemoval = rows.findIndex(row => row.id === tr.dataset.id);
        if (from < 0 || targetBeforeRemoval < 0) return;
        pushPlanUndoState(`Reordenou ${sectionLabels[draggingRow.section] || "linha"}`);
        const [moved] = rows.splice(from, 1);
        let insertAt = rows.findIndex(row => row.id === tr.dataset.id);
        if (insertAt < 0) {
          rows.splice(from, 0, moved);
          clearRowDropIndicators();
          return;
        }
        if (draggingRow.position === "after") insertAt += 1;
        rows.splice(insertAt, 0, moved);
        touchRowAndPlan(moved);
        recordActivity("Reordenou item", `Reordenou um item na seção ${draggingRow.section} do plano ${currentPlan().title}.`, { plan: currentPlan() });
        saveApp();
        clearRowDropIndicators();
        renderEditorTables();
      }

      function handleRowDragEnd() {
        document.querySelectorAll("tr.is-dragging").forEach(row => row.classList.remove("is-dragging"));
        clearRowDropIndicators();
        draggingRow = null;
      }

      // Move uma linha uma posição para cima ou para baixo, preservando seus dados.
      function moveRow(section, id, direction) {
        if (blockRestrictedAdminAccess()) return;
        const rows = currentPlanData()[section];
        if (!Array.isArray(rows)) return;
        const currentIndex = rows.findIndex(row => row.id === id);
        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
        if (currentIndex < 0 || targetIndex < 0 || targetIndex >= rows.length) return;
        pushPlanUndoState(`Reordenou ${sectionLabels[section] || "linha"}`);
        const [moved] = rows.splice(currentIndex, 1);
        rows.splice(targetIndex, 0, moved);
        touchRowAndPlan(moved);
        recordActivity("Reordenou item", `Moveu um item para ${direction === "up" ? "cima" : "baixo"} na seção ${section} do plano ${currentPlan().title}.`, { plan: currentPlan() });
        saveApp();
        renderEditorTables();
      }

      // Remove a linha indicadora usada durante o arrastar e soltar.
      function clearRowDropIndicators(exceptRow = null) {
        document.querySelectorAll("tr.drag-insert-before, tr.drag-insert-after").forEach(row => {
          if (row === exceptRow) return;
          row.classList.remove("drag-insert-before", "drag-insert-after");
        });
      }

      function getRowFromElement(element) {
        const tr = element.closest("tr[data-section][data-id]");
        if (!tr) return {};
        const section = tr.dataset.section;
        return { section, row: currentPlanData()[section].find(row => row.id === tr.dataset.id) };
      }

      function toggleAllVisibleActions() {
        if (isRestrictedAdminUser()) return;
        const visibleIds = currentPlanData().actions.filter(row => matchesFilters(row, "actions")).map(row => row.id);
        if (els.selectAllActions.checked) visibleIds.forEach(id => selectedActions.add(id));
        else visibleIds.forEach(id => selectedActions.delete(id));
        renderSection("actions");
        updateSelectionUi();
      }

      function applyBulkStatus() {
        if (blockRestrictedAdminAccess()) return;
        const status = els.bulkStatus.value;
        if (!status || !selectedActions.size) return;
        pushPlanUndoState("Alterou status em lote");
        currentPlanData().actions.forEach(row => {
          if (selectedActions.has(row.id)) {
            row.status = status;
            if (status === "Concluído") row.progress = 100;
            touchRowAndPlan(row);
          }
        });
        recordActivity("Alterou status em lote", `${selectedActions.size} ação(ões) alteradas para ${status} no plano ${currentPlan().title}.`, { plan: currentPlan() });
        els.bulkStatus.value = "";
        saveApp();
        renderEditorTables();
      }

      async function deleteSelectedActions() {
        if (blockRestrictedAdminAccess()) return;
        if (!selectedActions.size) return;
        if (!await managementConfirm(`Excluir ${selectedActions.size} ações selecionadas? Esta ação não pode ser desfeita.`)) return;
        pushPlanUndoState("Excluiu ações em lote");
        const rowDeletes = Array.from(selectedActions).map(rowId => ({ section: "actions", rowId }));
        recordActivity("Excluiu ações em lote", `Excluiu ${selectedActions.size} ação(ões) selecionadas no plano ${currentPlan().title}.`, { plan: currentPlan() });
        currentPlanData().actions = currentPlanData().actions.filter(row => !selectedActions.has(row.id));
        selectedActions.clear();
        touchPlan(currentPlan());
        saveApp({ rowDeletes });
        renderEditorTables();
      }

      function renderDashboard() {
        const data = currentPlanData();
        const total = data.actions.length;
        const notStarted = countByStatus("Não iniciado");
        const inProgress = countByStatus("Em andamento");
        const done = countByStatus("Concluído");
        const progress = total ? Math.round((done / total) * 100) : 0;
        const highOpen = data.actions.filter(row => row.priority === "Alta" && row.status !== "Concluído" && row.status !== "Cancelado").length;

        setText("metricTotal", total);
        setText("metricNotStarted", notStarted);
        setText("metricNotStartedPct", pct(notStarted, total));
        setText("metricInProgress", inProgress);
        setText("metricInProgressPct", pct(inProgress, total));
        setText("metricDone", done);
        setText("metricDonePct", pct(done, total));
        setText("metricProgress", progress + "%");
        setText("metricHighOpen", highOpen);
        const fill = document.getElementById("metricProgressFill");
        fill.style.width = progress + "%";
        fill.style.background = progressColor(progress);
      }

      function countByStatus(status) {
        return currentPlanData().actions.filter(row => row.status === status).length;
      }

      function renderResponsibleControls() {
        const options = getResponsibleOptions();
        const current = els.responsibleFilter.value;
        els.responsibleFilter.innerHTML = '<option value="">Todos</option>' + options.map(value => `<option value="${escapeAttr(value)}">${escapeHtml(value)}</option>`).join("");
        if (options.includes(current)) els.responsibleFilter.value = current;
        els.responsibleSuggestions.innerHTML = options.map(value => `<option value="${escapeAttr(value)}"></option>`).join("");
      }

      function getResponsibleOptions() {
        const found = new Set(DEFAULT_RESPONSIBLES);
        const data = currentPlanData();
        if (data) {
          ["actions", "equipment", "trainings"].forEach(section => {
            data[section].forEach(row => {
              if (row.responsible && row.responsible.trim()) found.add(row.responsible.trim());
            });
          });
        }
        return [...found].sort((a, b) => a.localeCompare(b, "pt-BR"));
      }

      function matchesFilters(row, section) {
        const query = normalizeText(els.searchInput.value);
        const priority = els.priorityFilter.value;
        const status = els.statusFilter.value;
        const responsible = els.responsibleFilter.value;

        if (query && !normalizeText(stripHtml(Object.values(row).join(" "))).includes(query)) return false;
        if (priority && section === "actions" && row.priority !== priority) return false;
        if (status && row.status !== status) return false;
        if (responsible && row.responsible !== responsible) return false;
        return true;
      }

      function updateSelectionUi() {
        const data = currentPlanData();
        if (!data) return;
        selectedActions = new Set([...selectedActions].filter(id => data.actions.some(row => row.id === id)));
        const count = selectedActions.size;
        els.selectionCount.textContent = count === 1 ? "1 selecionada" : `${count} selecionadas`;
        const visibleIds = data.actions.filter(row => matchesFilters(row, "actions")).map(row => row.id);
        els.selectAllActions.checked = visibleIds.length > 0 && visibleIds.every(id => selectedActions.has(id));
        els.selectAllActions.indeterminate = visibleIds.some(id => selectedActions.has(id)) && !els.selectAllActions.checked;
      }

      function handleRichFocus(event) {
        if (isRestrictedAdminUser()) return;
        const editor = event.target.closest(".rich-editor");
        if (!editor) return;
        activeRichEditor = editor;
        saveRichSelection();
        showRichToolbar(editor);
      }

      function handleRichMouseup(event) {
        if (isRestrictedAdminUser()) return;
        const editor = event.target.closest(".rich-editor");
        if (!editor) return;
        activeRichEditor = editor;
        saveRichSelection();
        showRichToolbar(editor);
      }

      function handleRichKeyup(event) {
        if (isRestrictedAdminUser()) return;
        const editor = event.target.closest(".rich-editor");
        if (!editor) return;
        activeRichEditor = editor;
        saveRichSelection();
        showRichToolbar(editor);
      }

      function handleRichPaste(event) {
        if (isRestrictedAdminUser()) {
          event.preventDefault();
          return;
        }
        const plainEditor = event.target.closest(".when-editor");
        if (plainEditor) {
          event.preventDefault();
          const text = event.clipboardData ? event.clipboardData.getData("text/plain") : "";
          document.execCommand("insertText", false, text);
          setTimeout(() => savePlainEditor(plainEditor), 0);
          return;
        }
        const editor = event.target.closest(".rich-editor");
        if (!editor) return;
        const items = event.clipboardData && event.clipboardData.items ? [...event.clipboardData.items] : [];
        const imageItem = items.find(item => item.type && item.type.startsWith("image/"));
        if (!imageItem) {
          setTimeout(() => saveRichEditor(editor), 0);
          return;
        }
        event.preventDefault();
        activeRichEditor = editor;
        saveRichSelection();
        const file = imageItem.getAsFile();
        insertImageFileIntoEditor(file, editor);
      }

      function handleRichDragOver(event) {
        if (isRestrictedAdminUser()) return;
        const editor = event.target.closest(".rich-editor");
        if (!editor) return;
        const files = event.dataTransfer && event.dataTransfer.files ? [...event.dataTransfer.files] : [];
        if (files.some(file => file.type.startsWith("image/"))) {
          event.preventDefault();
        }
      }

      function handleRichDrop(event) {
        if (isRestrictedAdminUser()) return;
        const editor = event.target.closest(".rich-editor");
        if (!editor) return;
        const files = event.dataTransfer && event.dataTransfer.files ? [...event.dataTransfer.files] : [];
        const imageFiles = files.filter(file => file.type.startsWith("image/"));
        if (!imageFiles.length) return;
        event.preventDefault();
        activeRichEditor = editor;
        setCaretFromPoint(event.clientX, event.clientY, editor);
        imageFiles.forEach(file => insertImageFileIntoEditor(file, editor));
      }

      function handleRichToolbarClick(event) {
        if (isRestrictedAdminUser()) return;
        const commandButton = event.target.closest("[data-rich-command]");
        const colorButton = event.target.closest("[data-rich-color]");
        const clearFormatButton = event.target.closest("[data-rich-clear-format]");
        const clearButton = event.target.closest("[data-rich-clear]");
        if (!activeRichEditor) return;
        restoreRichSelection();
        if (clearButton) {
          clearActiveRichEditor();
          return;
        }
        if (clearFormatButton) {
          document.execCommand("removeFormat", false, null);
          saveRichEditor(activeRichEditor);
          showRichToolbar(activeRichEditor);
          return;
        }
        if (colorButton) {
          document.execCommand("foreColor", false, colorButton.dataset.richColor);
          saveRichEditor(activeRichEditor);
          showRichToolbar(activeRichEditor);
          return;
        }
        if (commandButton) {
          document.execCommand(commandButton.dataset.richCommand, false, null);
          saveRichEditor(activeRichEditor);
          showRichToolbar(activeRichEditor);
        }
      }

      function clearActiveRichEditor() {
        if (isRestrictedAdminUser()) return;
        if (!activeRichEditor) return;
        if (selectedRichImage) {
          const editor = selectedRichImage.closest(".rich-editor");
          selectedRichImage.remove();
          selectedRichImage = null;
          if (editor) {
            activeRichEditor = editor;
            saveRichEditor(editor);
            showRichToolbar(editor);
          }
          return;
        }
        activeRichEditor.innerHTML = "";
        saveRichEditor(activeRichEditor);
        activeRichEditor.focus();
        showRichToolbar(activeRichEditor);
      }

      function applyRichSize(event) {
        if (isRestrictedAdminUser()) return;
        if (!activeRichEditor || !event.target.value) return;
        restoreRichSelection();
        document.execCommand("fontSize", false, event.target.value);
        event.target.value = "";
        saveRichEditor(activeRichEditor);
        showRichToolbar(activeRichEditor);
      }

      function applyRichBlock(event) {
        if (isRestrictedAdminUser()) return;
        if (!activeRichEditor || !event.target.value) return;
        restoreRichSelection();
        document.execCommand("formatBlock", false, event.target.value);
        event.target.value = "";
        saveRichEditor(activeRichEditor);
        showRichToolbar(activeRichEditor);
      }

      function handleRichImageUpload(event) {
        if (isRestrictedAdminUser()) {
          event.target.value = "";
          return;
        }
        const file = event.target.files && event.target.files[0];
        if (!file || !activeRichEditor) return;
        insertImageFileIntoEditor(file, activeRichEditor);
        event.target.value = "";
      }

      function insertImageFileIntoEditor(file, editor) {
        if (isRestrictedAdminUser()) return;
        if (!file || !file.type.startsWith("image/")) return;
        compressImageFileToDataUrl(file).then(dataUrl => {
          restoreRichSelection();
          insertHtmlAtCursor(`<span class="rt-image-wrap" contenteditable="false" style="width:260px"><img src="${escapeAttr(dataUrl)}" alt="Imagem anexada" data-sst-compressed="true"></span>&nbsp;`, editor);
          saveRichEditor(editor);
          showRichToolbar(editor);
        }).catch(error => {
          console.error(error);
          showToast("Não foi possível inserir a imagem. Tente outro arquivo JPEG ou PNG.");
        });
      }

      function saveRichSelection() {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount || !activeRichEditor) return;
        const range = selection.getRangeAt(0);
        if (activeRichEditor.contains(range.commonAncestorContainer)) {
          activeRichRange = range.cloneRange();
        }
      }

      function restoreRichSelection() {
        if (!activeRichRange || !activeRichEditor) {
          if (activeRichEditor) activeRichEditor.focus();
          return;
        }
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(activeRichRange);
        activeRichEditor.focus();
      }

      function insertHtmlAtCursor(html, editor) {
        editor.focus();
        const selection = window.getSelection();
        let range = activeRichRange;
        if (!range || !editor.contains(range.commonAncestorContainer)) {
          range = document.createRange();
          range.selectNodeContents(editor);
          range.collapse(false);
        }
        selection.removeAllRanges();
        selection.addRange(range);
        range.deleteContents();
        const template = document.createElement("template");
        template.innerHTML = html;
        const fragment = template.content;
        const lastNode = fragment.lastChild;
        range.insertNode(fragment);
        if (lastNode) {
          range.setStartAfter(lastNode);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          activeRichRange = range.cloneRange();
        }
      }

      function setCaretFromPoint(x, y, editor) {
        let range = null;
        if (document.caretRangeFromPoint) {
          range = document.caretRangeFromPoint(x, y);
        } else if (document.caretPositionFromPoint) {
          const position = document.caretPositionFromPoint(x, y);
          if (position) {
            range = document.createRange();
            range.setStart(position.offsetNode, position.offset);
          }
        }
        if (range && editor.contains(range.commonAncestorContainer)) {
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          activeRichRange = range.cloneRange();
        }
      }

      function showRichToolbar(editor) {
        if (isRestrictedAdminUser()) return;
        const rect = getSelectionRect() || editor.getBoundingClientRect();
        els.richToolbar.classList.add("is-visible");
        if (richToolbarUserMoved) {
          keepRichToolbarInViewport();
          return;
        }
        const toolbarWidth = Math.min(els.richToolbar.offsetWidth || 720, window.innerWidth - 16);
        const topOffset = window.innerWidth <= 760 ? 58 : 44;
        const top = Math.max(8, rect.top - topOffset);
        const left = Math.min(window.innerWidth - toolbarWidth - 8, Math.max(8, rect.left));
        els.richToolbar.style.top = top + "px";
        els.richToolbar.style.left = left + "px";
      }

      function handleRichToolbarDragStart(event) {
        const handle = event.target.closest("[data-rich-toolbar-drag]");
        if (!handle || !els.richToolbar.classList.contains("is-visible")) return;
        event.preventDefault();
        const rect = els.richToolbar.getBoundingClientRect();
        richToolbarUserMoved = true;
        richToolbarDragState = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          left: rect.left,
          top: rect.top
        };
        els.richToolbar.classList.add("is-dragging");
        if (handle.setPointerCapture) handle.setPointerCapture(event.pointerId);
        document.addEventListener("pointermove", handleRichToolbarDragMove);
        document.addEventListener("pointerup", handleRichToolbarDragEnd, { once: true });
        document.addEventListener("pointercancel", handleRichToolbarDragEnd, { once: true });
      }

      function handleRichToolbarDragMove(event) {
        if (!richToolbarDragState) return;
        event.preventDefault();
        setRichToolbarPosition(
          richToolbarDragState.left + event.clientX - richToolbarDragState.startX,
          richToolbarDragState.top + event.clientY - richToolbarDragState.startY
        );
      }

      function handleRichToolbarDragEnd() {
        richToolbarDragState = null;
        els.richToolbar.classList.remove("is-dragging");
        document.removeEventListener("pointermove", handleRichToolbarDragMove);
        document.removeEventListener("pointerup", handleRichToolbarDragEnd);
        document.removeEventListener("pointercancel", handleRichToolbarDragEnd);
        keepRichToolbarInViewport();
      }

      function resetRichToolbarPosition(event) {
        if (!event.target.closest("[data-rich-toolbar-drag]")) return;
        event.preventDefault();
        richToolbarUserMoved = false;
        if (activeRichEditor) showRichToolbar(activeRichEditor);
      }

      function keepRichToolbarInViewport() {
        const rect = els.richToolbar.getBoundingClientRect();
        const left = Number.parseFloat(els.richToolbar.style.left) || rect.left || 8;
        const top = Number.parseFloat(els.richToolbar.style.top) || rect.top || 8;
        setRichToolbarPosition(left, top);
      }

      function setRichToolbarPosition(left, top) {
        const rect = els.richToolbar.getBoundingClientRect();
        const width = rect.width || els.richToolbar.offsetWidth || 320;
        const height = rect.height || els.richToolbar.offsetHeight || 42;
        const maxLeft = Math.max(8, window.innerWidth - width - 8);
        const maxTop = Math.max(8, window.innerHeight - height - 8);
        els.richToolbar.style.left = Math.min(maxLeft, Math.max(8, left)) + "px";
        els.richToolbar.style.top = Math.min(maxTop, Math.max(8, top)) + "px";
      }

      function updateRichToolbarPosition() {
        if (!activeRichEditor || !els.richToolbar.classList.contains("is-visible")) return;
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        if (activeRichEditor.contains(range.commonAncestorContainer)) {
          activeRichRange = range.cloneRange();
          showRichToolbar(activeRichEditor);
        }
      }

      function scheduleToolbarHide() {
        setTimeout(() => {
          if (!document.activeElement || !document.activeElement.closest || !document.activeElement.closest(".rich-editor")) {
            hideRichToolbar();
          }
        }, 120);
      }

      function hideRichToolbar() {
        els.richToolbar.classList.remove("is-visible");
      }

      function getSelectionRect() {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return null;
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        return rect && rect.width !== 0 ? rect : null;
      }

      function selectRichImage(wrapper) {
        if (isRestrictedAdminUser()) return;
        clearSelectedRichImage();
        selectedRichImage = wrapper;
        wrapper.classList.add("is-selected");
        activeRichEditor = wrapper.closest(".rich-editor");
        showRichToolbar(activeRichEditor);
      }

      function clearSelectedRichImage() {
        if (selectedRichImage) selectedRichImage.classList.remove("is-selected");
        selectedRichImage = null;
      }

      function handleGlobalDeleteImage(event) {
        if (isRestrictedAdminUser()) return;
        if (!selectedRichImage) return;
        if (event.key !== "Delete" && event.key !== "Backspace") return;
        event.preventDefault();
        const editor = selectedRichImage.closest(".rich-editor");
        selectedRichImage.remove();
        selectedRichImage = null;
        if (editor) saveRichEditor(editor);
      }

      async function applyTemplateChoiceToCurrentPlan(event) {
        if (blockRestrictedAdminAccess()) return;
        const plan = currentPlan();
        if (!plan) return;
        const choice = event.target.value;
        event.target.value = "";
        if (!choice) return;
        const customId = choice.startsWith("tpl:") ? choice.slice(4) : "";
        const useTemplate = choice === "template";
        const template = useTemplate ? app.actionPlanTemplates.find(item => item.systemDefault) : customId ? app.actionPlanTemplates.find(item => item.id === customId && item.active) : null;
        if (customId && !template) return showToast("Template não encontrado ou inativo.");
        const label = template ? `o template "${template.name}"` : "um plano em branco";
        if (!await managementConfirm(`Gerar ${label} e substituir os dados do plano atual?`, { tone: "primary" })) return;
        pushPlanUndoState(template ? `Aplicou o template ${template.name}` : "Gerou plano em branco");
        if (template) {
          const currentMeta = deepClone(plan.data.meta);
          plan.data = {
            meta: currentMeta,
            actions: cloneTemplateRows(template.rows),
            equipment: cloneTemplateEquipmentRows(template.equipmentRows),
            trainings: cloneTemplateTrainingRows(template.trainingRows)
          };
        } else {
          plan.data = createPlanData({ useTemplate, company: plan.company, documentType: plan.documentType });
        }
        touchPlan(plan);
        recordActivity(template ? "Aplicou template" : "Gerou plano em branco", `Gerou ${label} no plano ${plan.title}.`, { plan });
        if (template) recordAudit({ action: "Aplicou template", entityType: "plan", entityId: plan.id, entityLabel: plan.title, planId: plan.id, summary: template.name });
        saveApp();
        renderEditor();
      }

      function renderTemplateActionOptions() {
        const select = document.getElementById("templateActionSelect");
        if (!select) return;
        const templates = normalizeActionPlanTemplates(app.actionPlanTemplates).filter(template => template.active && !template.systemDefault);
        select.innerHTML = `<option value="">Escolher modelo</option><option value="blank">Plano em branco</option><option value="template">Template padrão</option>${templates.map(template => `<option value="tpl:${escapeAttr(template.id)}">${escapeHtml(template.name)}</option>`).join("")}`;
      }

      async function exportExecutivePdf() {
        const plan = currentPlan();
        if (!plan) return showToast("Abra um plano de ação antes de exportar o PDF.");
        const PdfCtor = window.jspdf && window.jspdf.jsPDF;
        if (!PdfCtor) {
          showToast("A biblioteca de PDF ainda não carregou. Atualize a página e tente novamente.");
          return;
        }

        const doc = new PdfCtor({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
        if (typeof doc.autoTable !== "function") {
          showToast("A biblioteca de tabelas do PDF ainda não carregou. Atualize a página e tente novamente.");
          return;
        }

        const meta = plan.data && plan.data.meta ? plan.data.meta : {};
        const fileName = executivePdfFileName(meta.company || plan.company || plan.title);
        const button = document.getElementById("printBtn");
        const originalLabel = button ? button.innerHTML : "";
        if (button) {
          button.disabled = true;
          button.innerHTML = "Gerando PDF...";
        }

        try {
          await buildExecutivePdf(doc, plan);
          doc.save(fileName);
        } catch (error) {
          console.error(error);
          showToast("Não foi possível gerar o PDF. Verifique se há imagens muito grandes e tente novamente.");
        } finally {
          if (button) {
            button.disabled = false;
            button.innerHTML = originalLabel;
          }
        }
      }

      async function buildExecutivePdf(doc, plan) {
        const data = plan.data || { meta: {}, actions: [], equipment: [], trainings: [] };
        const meta = data.meta || {};
        const stats = getExecutiveStats(plan);
        const generatedAt = new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
        const company = meta.company || plan.company || "-";
        const documentName = meta.documentName || plan.documentType || "-";

        doc.setProperties({
          title: `CRONOGRAMA DE AÇÕES - ${company}`,
          subject: "Relatório executivo de cronograma de ações SST",
          creator: "SATS"
        });

        let y = await drawPdfHeader(doc, plan, meta, generatedAt);
        y = drawPdfMetaGrid(doc, [
          ["Empresa", company],
          ["Documento", documentName],
          ["Criação / Revisão", meta.revisionDate || "-"],
          ["Responsável técnico / setor", meta.technicalOwner || "-"]
        ], y);
        y = drawPdfDescription(doc, richContentForPdf(meta.description || DEFAULT_DESCRIPTION).text, y);
        y = drawPdfSummaryGrid(doc, stats, plan, y);
        y = drawPdfActionsTable(doc, data.actions || [], y);
        y = drawPdfEquipmentTable(doc, data.equipment || [], y);
        y = drawPdfTrainingsTable(doc, data.trainings || [], y);
        addPdfPageFooters(doc);
      }

      async function drawPdfHeader(doc, plan, meta, generatedAt) {
        const width = pdfPageWidth(doc);
        const margin = 10;
        let titleX = margin + 18;
        const logo = meta.companyLogoImage ? await loadPdfImage(meta.companyLogoImage) : null;
        let logoDrawn = false;
        if (logo) {
          try {
            const fit = fitPdfImage(logo.width, logo.height, 22, 15);
            doc.addImage(meta.companyLogoImage, logo.format, margin, 9, fit.width, fit.height);
            titleX = margin + 27;
            logoDrawn = true;
          } catch (error) {
            console.warn("Logo da empresa indisponível para o PDF:", error);
          }
        }
        if (!logoDrawn) {
          doc.setFillColor(37, 99, 235);
          doc.roundedRect(margin, 9, 13, 13, 2, 2, "F");
        }
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("RELATÓRIO EXECUTIVO", titleX, 12.5);
        doc.setFontSize(17);
        doc.text("CRONOGRAMA DE AÇÕES SST", titleX, 19);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        doc.text(pdfTrim(`${plan.title || "Plano de ação"}${meta.company ? " - " + meta.company : ""}`, 95), titleX, 24);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("Gerado em", width - margin, 13, { align: "right" });
        doc.setFont("helvetica", "normal");
        doc.text(generatedAt, width - margin, 18, { align: "right" });
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(0.7);
        doc.line(margin, 29, width - margin, 29);
        return 34;
      }

      function drawPdfMetaGrid(doc, items, startY) {
        const margin = 10;
        const gap = 4;
        const width = (pdfPageWidth(doc) - margin * 2 - gap * 3) / 4;
        items.forEach((item, index) => {
          drawPdfInfoBox(doc, margin + index * (width + gap), startY, width, 17, item[0], item[1]);
        });
        return startY + 22;
      }

      function drawPdfDescription(doc, text, startY) {
        const margin = 10;
        const width = pdfPageWidth(doc) - margin * 2;
        const lines = doc.splitTextToSize(pdfText(text), width - 8);
        const visibleLines = lines.slice(0, 6);
        const boxHeight = Math.max(15, 8 + visibleLines.length * 3.8);
        let y = ensurePdfSpace(doc, startY, boxHeight + 4);
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(margin, y, width, boxHeight, 2, 2, "FD");
        doc.setTextColor(51, 65, 85);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(visibleLines, margin + 4, y + 6);
        return y + boxHeight + 6;
      }

      function drawPdfSummaryGrid(doc, stats, plan, startY) {
        const items = [
          ["Total de ações", stats.total],
          ["Não iniciadas", `${stats.notStarted} (${pct(stats.notStarted, stats.total)})`],
          ["Em andamento", `${stats.inProgress} (${pct(stats.inProgress, stats.total)})`],
          ["Concluídas", `${stats.done} (${pct(stats.done, stats.total)})`],
          ["Progresso geral", `${stats.progress}%`],
          ["Alta prioridade aberta", stats.highOpen]
        ];
        const margin = 10;
        const gap = 3;
        const width = (pdfPageWidth(doc) - margin * 2 - gap * 5) / 6;
        let y = ensurePdfSpace(doc, startY, 20);
        items.forEach((item, index) => {
          drawPdfInfoBox(doc, margin + index * (width + gap), y, width, 16, item[0], item[1]);
        });
        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text(`Última edição do plano: ${formatDateTime(plan.updatedAt)}`, margin, y + 22);
        return y + 27;
      }

      function drawPdfActionsTable(doc, rows, startY) {
        const body = rows.map((row, index) => {
          const observation = richContentForPdf(row.observationHtml, { imagePlaceholder: false });
          return [
            String(index + 1),
            richContentForPdf(row.actionHtml).text,
            row.responsible || "-",
            row.when || "-",
            row.priority || "-",
            row.status || "-",
            pdfCellWithImages(observation)
          ];
        });
        return drawPdfTable(doc, "Ações", ["Item", "Ação recomendada para implementar/manter", "Responsável", "Quando", "Prioridade", "Status", "Observação"], body, startY, {
          emptyText: "Nenhuma ação cadastrada.",
          priorityColumn: 4,
          statusColumn: 5,
          imageColumn: 6,
          columnStyles: {
            0: { cellWidth: 11, halign: "center" },
            1: { cellWidth: 84 },
            2: { cellWidth: 31 },
            3: { cellWidth: 36 },
            4: { cellWidth: 22, halign: "center" },
            5: { cellWidth: 28, halign: "center" },
            6: { cellWidth: 65 }
          }
        });
      }

      function drawPdfEquipmentTable(doc, rows, startY) {
        const body = rows.map((row, index) => {
          const observation = richContentForPdf(row.observationHtml, { imagePlaceholder: false });
          return [
            String(index + 1),
            richContentForPdf(row.descriptionHtml).text,
            row.responsible || "-",
            row.status || "-",
            pdfCellWithImages(observation)
          ];
        });
        return drawPdfTable(doc, "Equipamentos de emergência", ["Item", "Descrição", "Responsável", "Status", "Observação"], body, startY, {
          emptyText: "Nenhum equipamento cadastrado.",
          statusColumn: 3,
          imageColumn: 4,
          columnStyles: {
            0: { cellWidth: 12, halign: "center" },
            1: { cellWidth: 115 },
            2: { cellWidth: 40 },
            3: { cellWidth: 35, halign: "center" },
            4: { cellWidth: 75 }
          }
        });
      }

      function drawPdfTrainingsTable(doc, rows, startY) {
        const body = rows.map((row, index) => {
          const observation = richContentForPdf(row.observationHtml, { imagePlaceholder: false });
          return [
            String(index + 1),
            richContentForPdf(row.trainingHtml).text,
            row.responsible || "-",
            row.when || "-",
            row.status || "-",
            pdfCellWithImages(observation)
          ];
        });
        return drawPdfTable(doc, "Treinamentos", ["Item", "Treinamento", "Responsável", "Quando", "Status", "Observação"], body, startY, {
          emptyText: "Nenhum treinamento cadastrado.",
          statusColumn: 4,
          imageColumn: 5,
          columnStyles: {
            0: { cellWidth: 12, halign: "center" },
            1: { cellWidth: 94 },
            2: { cellWidth: 38 },
            3: { cellWidth: 44 },
            4: { cellWidth: 31, halign: "center" },
            5: { cellWidth: 58 }
          }
        });
      }

      function pdfCellWithImages(rich) {
        if (!rich || !rich.images || !rich.images.length) return rich && rich.text ? rich.text : "-";
        return {
          content: rich.text === "-" ? "" : rich.text,
          images: rich.images
        };
      }

      function pdfCellImages(raw) {
        return raw && typeof raw === "object" && Array.isArray(raw.images) ? raw.images : [];
      }

      function pdfCellContent(raw) {
        return raw && typeof raw === "object" && "content" in raw ? raw.content : raw;
      }

      function drawPdfCellImages(doc, data, images) {
        if (!images.length) return;
        const padding = 1.6;
        const gap = 1.6;
        const columns = images.length > 1 ? 2 : 1;
        const usableWidth = Math.max(8, data.cell.width - padding * 2);
        const thumbWidth = (usableWidth - gap * (columns - 1)) / columns;
        const textLines = (data.cell.text || []).filter(Boolean);
        const textHeight = textLines.length ? textLines.length * 3.1 + 1.5 : 0;
        let imageY = data.cell.y + padding + textHeight;

        images.slice(0, 4).forEach((src, index) => {
          const column = index % columns;
          const row = Math.floor(index / columns);
          const imageX = data.cell.x + padding + column * (thumbWidth + gap);
          const rowY = imageY + row * 18.5;
          try {
            const props = doc.getImageProperties(src);
            const fit = fitPdfImage(props.width, props.height, thumbWidth, 17);
            doc.addImage(src, pdfImageFormat(src), imageX + Math.max(0, (thumbWidth - fit.width) / 2), rowY, fit.width, fit.height);
          } catch (error) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(6);
            doc.setTextColor(100, 116, 139);
            doc.text("Imagem não suportada.", imageX, rowY + 5);
          }
        });
      }

      function drawPdfTable(doc, title, head, body, startY, options) {
        let y = drawPdfSectionTitle(doc, title, startY);
        if (!body.length) return drawPdfEmptyBox(doc, options.emptyText, y);
        doc.autoTable({
          startY: y,
          head: [head],
          body,
          theme: "grid",
          margin: { left: 10, right: 10 },
          tableWidth: "wrap",
          styles: {
            font: "helvetica",
            fontSize: 7,
            cellPadding: 1.5,
            overflow: "linebreak",
            valign: "top",
            lineColor: [203, 213, 225],
            lineWidth: 0.15,
            textColor: [15, 23, 42]
          },
          headStyles: {
            fillColor: [234, 242, 255],
            textColor: [15, 23, 42],
            fontStyle: "bold",
            halign: "center",
            fontSize: 7.2
          },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          columnStyles: options.columnStyles,
          didParseCell: data => {
            if (data.section !== "body") return;
            if (data.column.index === options.priorityColumn) applyPdfTone(data.cell, pdfPriorityTone(data.cell.raw));
            if (data.column.index === options.statusColumn) applyPdfTone(data.cell, pdfStatusTone(data.cell.raw));
            if (data.column.index === options.imageColumn) {
              const images = pdfCellImages(data.cell.raw);
              if (images.length) {
                const textLines = Array.isArray(data.cell.text)
                  ? data.cell.text.filter(Boolean).length
                  : String(pdfCellContent(data.cell.raw) || "").split(/\n+/).filter(Boolean).length;
                const imageRows = Math.ceil(Math.min(images.length, 4) / (images.length > 1 ? 2 : 1));
                data.cell.styles.minCellHeight = Math.max(data.cell.styles.minCellHeight || 0, 5 + textLines * 3.2 + imageRows * 18.5);
              }
            }
          },
          didDrawCell: data => {
            if (data.section !== "body" || data.column.index !== options.imageColumn) return;
            drawPdfCellImages(doc, data, pdfCellImages(data.cell.raw));
          }
        });
        return doc.lastAutoTable.finalY + 7;
      }

      function richContentForPdf(value, options = {}) {
        const template = document.createElement("template");
        template.innerHTML = sanitizeRichHtml(value || "");
        const useImagePlaceholder = options.imagePlaceholder !== false;
        const images = [...template.content.querySelectorAll("img")]
          .map(image => image.getAttribute("src"))
          .filter(src => /^data:image\//i.test(src || ""));
        template.content.querySelectorAll("img").forEach(image => {
          image.replaceWith(useImagePlaceholder ? document.createTextNode("[imagem anexada]") : document.createTextNode(""));
        });
        template.content.querySelectorAll("br").forEach(br => br.replaceWith(document.createTextNode("\n")));
        template.content.querySelectorAll("p, div, li").forEach(node => node.appendChild(document.createTextNode("\n")));
        const text = (template.content.textContent || "")
          .replace(/\u00a0/g, " ")
          .replace(/[ \t]+\n/g, "\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
        return { text: text || "-", images };
      }

      function drawPdfInfoBox(doc, x, y, width, height, label, value) {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(x, y, width, height, 2, 2, "FD");
        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.text(String(label || "").toUpperCase(), x + 3, y + 5);
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(9);
        const lines = doc.splitTextToSize(pdfText(value), width - 6).slice(0, 2);
        doc.text(lines, x + 3, y + 10.5);
      }

      function drawPdfSectionTitle(doc, title, startY) {
        let y = ensurePdfSpace(doc, startY, 16);
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(String(title || "").toUpperCase(), 10, y);
        doc.setDrawColor(226, 232, 240);
        doc.line(10, y + 2.3, pdfPageWidth(doc) - 10, y + 2.3);
        return y + 5;
      }

      function drawPdfEmptyBox(doc, text, startY) {
        let y = ensurePdfSpace(doc, startY, 13);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(10, y, pdfPageWidth(doc) - 20, 10, 2, 2, "FD");
        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(text, 14, y + 6.5);
        return y + 15;
      }

      function applyPdfTone(cell, tone) {
        if (!tone) return;
        cell.styles.fillColor = tone.fill;
        cell.styles.textColor = tone.text;
        cell.styles.fontStyle = "bold";
        cell.styles.halign = "center";
      }

      function pdfPriorityTone(value) {
        if (value === "Alta") return { fill: [254, 226, 226], text: [153, 27, 27] };
        if (value === "Média") return { fill: [254, 243, 199], text: [146, 64, 14] };
        if (value === "Baixa") return { fill: [220, 252, 231], text: [22, 101, 52] };
        return null;
      }

      function pdfStatusTone(value) {
        if (value === "Não iniciado") return { fill: [226, 232, 240], text: [71, 85, 105] };
        if (value === "Em andamento") return { fill: [219, 234, 254], text: [30, 64, 175] };
        if (value === "Concluído") return { fill: [220, 252, 231], text: [22, 101, 52] };
        if (value === "Cancelado") return { fill: [254, 226, 226], text: [153, 27, 27] };
        return null;
      }

      function getExecutiveStats(plan) {
        const actions = plan.data && Array.isArray(plan.data.actions) ? plan.data.actions : [];
        const total = actions.length;
        const notStarted = actions.filter(row => row.status === "Não iniciado").length;
        const inProgress = actions.filter(row => row.status === "Em andamento").length;
        const done = actions.filter(row => row.status === "Concluído").length;
        const cancelled = actions.filter(row => row.status === "Cancelado").length;
        const highOpen = actions.filter(row => row.priority === "Alta" && row.status !== "Concluído" && row.status !== "Cancelado").length;
        return {
          total,
          notStarted,
          inProgress,
          done,
          cancelled,
          highOpen,
          progress: total ? Math.round((done / total) * 100) : 0
        };
      }

      function loadPdfImage(src) {
        return new Promise(resolve => {
          const image = new Image();
          image.onload = () => resolve({
            width: image.naturalWidth || image.width || 1,
            height: image.naturalHeight || image.height || 1,
            format: pdfImageFormat(src)
          });
          image.onerror = () => resolve(null);
          image.src = src;
        });
      }

      function pdfImageFormat(src) {
        if (/^data:image\/png/i.test(src || "")) return "PNG";
        if (/^data:image\/webp/i.test(src || "")) return "WEBP";
        return "JPEG";
      }

      function fitPdfImage(width, height, maxWidth, maxHeight) {
        const ratio = Math.min(maxWidth / Math.max(width, 1), maxHeight / Math.max(height, 1));
        return { width: width * ratio, height: height * ratio };
      }

      function ensurePdfSpace(doc, y, needed) {
        if (y + needed <= pdfPageHeight(doc) - 14) return y;
        doc.addPage();
        return 14;
      }

      function addPdfPageFooters(doc) {
        const pageCount = doc.internal.getNumberOfPages();
        const width = pdfPageWidth(doc);
        const height = pdfPageHeight(doc);
        for (let page = 1; page <= pageCount; page += 1) {
          doc.setPage(page);
          doc.setDrawColor(226, 232, 240);
          doc.line(10, height - 10, width - 10, height - 10);
          doc.setTextColor(100, 116, 139);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.text("SATS", 10, height - 5);
          doc.text(`Página ${page} de ${pageCount}`, width - 10, height - 5, { align: "right" });
        }
      }

      function pdfPageWidth(doc) {
        return doc.internal.pageSize.getWidth();
      }

      function pdfPageHeight(doc) {
        return doc.internal.pageSize.getHeight();
      }

      function pdfText(value) {
        const text = String(value == null || value === "" ? "-" : value);
        return text.replace(/\r/g, "").replace(/\t/g, " ");
      }

      function pdfTrim(value, maxLength) {
        const text = pdfText(value).replace(/\s+/g, " ").trim();
        return text.length > maxLength ? text.slice(0, Math.max(0, maxLength - 1)).trim() + "..." : text;
      }

      function executivePdfFileName(company) {
        const safeCompany = sanitizeFileName(String(company || "SEM EMPRESA").trim().toUpperCase()) || "SEM EMPRESA";
        return `CRONOGRAMA DE AÇÕES - ${safeCompany}.pdf`;
      }

      function sanitizeFileName(value) {
        return String(value || "")
          .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
          .replace(/\s+/g, " ")
          .trim();
      }

      async function exportExecutiveWord() {
        const plan = currentPlan();
        if (!plan) return showToast("Abra um plano de ação antes de exportar o Word.");
        const button = document.getElementById("exportWordBtn");
        const originalLabel = button ? button.innerHTML : "";
        if (button) {
          button.disabled = true;
          button.innerHTML = "Gerando Word...";
        }

        try {
          const wordHtml = await buildExecutiveWord(plan);
          const blob = new Blob(["\ufeff", wordHtml], { type: "application/msword;charset=utf-8" });
          downloadBlob(blob, executiveWordFileName(plan));
          showToast("Arquivo Word gerado com sucesso.", "success");
        } catch (error) {
          console.error(error);
          showToast("Não foi possível gerar o arquivo Word. Verifique as imagens e tente novamente.", "danger");
        } finally {
          if (button) {
            button.disabled = false;
            button.innerHTML = originalLabel;
          }
        }
      }

      async function buildExecutiveWord(plan) {
        const data = plan.data || { meta: {}, actions: [], equipment: [], trainings: [] };
        const meta = data.meta || {};
        const stats = getExecutiveStats(plan);
        const company = meta.company || plan.company || "-";
        const documentName = meta.documentName || plan.documentType || "-";
        const logo = /^data:image\/(png|jpe?g)/i.test(meta.companyLogoImage || "")
          ? `<img class="word-company-logo" src="${escapeAttr(meta.companyLogoImage)}" alt="Logo da empresa">`
          : "";
        const summaryRows = [[
          String(stats.total),
          `${stats.notStarted} (${pct(stats.notStarted, stats.total)})`,
          `${stats.inProgress} (${pct(stats.inProgress, stats.total)})`,
          `${stats.done} (${pct(stats.done, stats.total)})`,
          `${stats.progress}%`,
          String(stats.highOpen)
        ]];
        const actionRows = (data.actions || []).map((row, index) => [
          String(index + 1), wordRichHtml(row.actionHtml), wordPlainHtml(row.responsible),
          wordPlainHtml(row.when), wordToneHtml(row.priority, "priority"),
          wordToneHtml(row.status, "status"), wordRichHtml(row.observationHtml)
        ]);
        const equipmentRows = (data.equipment || []).map((row, index) => [
          String(index + 1), wordRichHtml(row.descriptionHtml), wordPlainHtml(row.responsible),
          wordToneHtml(row.status, "status"), wordRichHtml(row.observationHtml)
        ]);
        const trainingRows = (data.trainings || []).map((row, index) => [
          String(index + 1), wordRichHtml(row.trainingHtml), wordPlainHtml(row.responsible),
          wordPlainHtml(row.when), wordToneHtml(row.status, "status"), wordRichHtml(row.observationHtml)
        ]);

        return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(plan.title || "Plano de ação")}</title>
  <style>
    @page WordSection1 { size: 29.7cm 21cm; mso-page-orientation: landscape; margin: 1cm; }
    div.WordSection1 { page: WordSection1; }
    body { font-family: Arial, sans-serif; color: #0f172a; font-size: 9pt; line-height: 1.35; }
    table { width: 100%; border-collapse: collapse; margin: 0 0 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 5px 6px; vertical-align: top; }
    th { background: #1d4ed8; color: #fff; text-align: left; font-weight: 700; }
    tr:nth-child(even) td { background: #f8fafc; }
    h1 { margin: 0; font-size: 20pt; color: #0f172a; text-align: center; }
    h2 { margin: 18px 0 7px; padding-bottom: 4px; border-bottom: 2px solid #2563eb; font-size: 13pt; }
    p { margin: 0 0 6px; }
    img { max-width: 240px; height: auto; }
    .word-header, .word-header td { border: 0; background: #fff !important; vertical-align: middle; }
    .word-header-left { width: 22%; text-align: left; }
    .word-header-center { width: 56%; text-align: center; }
    .word-header-right { width: 22%; text-align: right; font-size: 8pt; color: #475569; }
    .word-company-logo { display: block; max-width: 120px; max-height: 62px; width: auto; height: auto; margin: 0; }
    .word-subtitle { margin-top: 4px; color: #475569; font-size: 10pt; }
    .word-meta th { width: 16%; }
    .word-description { border: 1px solid #cbd5e1; padding: 8px; margin-bottom: 12px; }
    .word-table td:first-child, .word-table th:first-child { text-align: center; width: 34px; }
    .word-table img { max-width: 180px; max-height: 100px; }
    .word-tone { display: inline-block; padding: 2px 5px; font-weight: 700; }
    .tone-high, .tone-cancelled { background: #fee2e2; color: #991b1b; }
    .tone-medium { background: #fef3c7; color: #92400e; }
    .tone-low, .tone-done { background: #dcfce7; color: #166534; }
    .tone-progress { background: #dbeafe; color: #1d4ed8; }
    .tone-pending { background: #e5e7eb; color: #374151; }
    .word-footer { margin-top: 18px; border-top: 1px solid #cbd5e1; padding-top: 6px; color: #64748b; font-size: 8pt; text-align: center; }
  </style>
</head>
<body>
<div class="WordSection1">
  <table class="word-header"><tr>
    <td class="word-header-left">${logo}</td>
    <td class="word-header-center"><h1>CRONOGRAMA DE AÇÕES SST</h1><div class="word-subtitle">${escapeHtml(plan.title || "Plano de ação")}${company !== "-" ? ` - ${escapeHtml(company)}` : ""}</div></td>
    <td class="word-header-right"><strong>Revisão</strong><br>${escapeHtml(meta.revisionDate || "-")}<br><strong>Atualizado</strong><br>${escapeHtml(formatDateTime(plan.updatedAt))}</td>
  </tr></table>
  ${wordTable("", ["Empresa", "Documento", "Responsável técnico / setor", "Criação / revisão"], [[wordPlainHtml(company), wordPlainHtml(documentName), wordPlainHtml(meta.technicalOwner || "-"), wordPlainHtml(meta.revisionDate || "-")]], "word-meta")}
  <h2>Descrição</h2><div class="word-description">${wordRichHtml(meta.description || DEFAULT_DESCRIPTION)}</div>
  <h2>Resumo</h2>${wordTable("", ["Total de ações", "Não iniciadas", "Em andamento", "Concluídas", "Progresso geral", "Alta prioridade aberta"], summaryRows)}
  ${wordTable("Ações", ["Item", "Ação recomendada", "Responsável", "Quando", "Prioridade", "Status", "Observação"], actionRows)}
  ${wordTable("Equipamentos de emergência", ["Item", "Descrição", "Responsável", "Status", "Observação"], equipmentRows)}
  ${wordTable("Treinamentos", ["Item", "Treinamento", "Responsável", "Quando", "Status", "Observação"], trainingRows)}
  <div class="word-footer">SATS - Plano de Ação | Última edição: ${escapeHtml(formatDateTime(plan.updatedAt))}</div>
</div>
</body>
</html>`;
      }

      function wordTable(title, headers, rows, extraClass = "") {
        const heading = title ? `<h2>${escapeHtml(title)}</h2>` : "";
        if (!rows.length) return `${heading}<p>Nenhum registro cadastrado.</p>`;
        return `${heading}<table class="word-table ${extraClass}">
          <thead><tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
          <tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell == null || cell === "" ? "-" : cell}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>`;
      }

      function wordPlainHtml(value) {
        return escapeHtml(String(value == null || value === "" ? "-" : value)).replace(/\n/g, "<br>");
      }

      function wordRichHtml(value) {
        const raw = String(value == null || value === "" ? "-" : value);
        if (!/[<>]/.test(raw)) return wordPlainHtml(raw);
        return sanitizeRichHtml(raw) || "-";
      }

      function wordToneHtml(value, type) {
        const text = String(value || "-");
        const normalized = normalizeText(text);
        let tone = "";
        if (type === "priority") {
          if (normalized === "alta") tone = "tone-high";
          else if (normalized === "media") tone = "tone-medium";
          else if (normalized === "baixa") tone = "tone-low";
        } else {
          if (normalized === "concluido") tone = "tone-done";
          else if (normalized === "em andamento") tone = "tone-progress";
          else if (normalized === "cancelado") tone = "tone-cancelled";
          else tone = "tone-pending";
        }
        return `<span class="word-tone ${tone}">${escapeHtml(text)}</span>`;
      }

      function executiveWordFileName(plan) {
        const safeTitle = sanitizeFileName(String(plan && plan.title || "plano-de-acao").trim()) || "plano-de-acao";
        return `plano-de-acao-${safeTitle}.doc`;
      }

      async function exportExecutiveJpeg() {
        const plan = currentPlan();
        if (!plan) return showToast("Abra um plano de ação antes de exportar o JPEG.");
        const meta = plan.data && plan.data.meta ? plan.data.meta : {};
        const fileBase = executiveJpegFileBase(meta.company || plan.company || plan.title);
        const button = document.getElementById("exportJpegBtn");
        const originalLabel = button ? button.innerHTML : "";
        if (button) {
          button.disabled = true;
          button.innerHTML = "Gerando JPEGs...";
        }

        try {
          const pages = await buildExecutiveJpegPages(plan);
          pages.forEach((page, index) => {
            setTimeout(() => downloadBlob(page.blob, `${fileBase} - ${page.fileSuffix}.jpg`), index * 250);
          });
        } catch (error) {
          console.error(error);
          showToast("Não foi possível gerar o JPEG. Verifique se há imagens muito grandes e tente novamente.");
        } finally {
          if (button) {
            button.disabled = false;
            button.innerHTML = originalLabel;
          }
        }
      }

      function executiveJpegFileBase(company) {
        const safeCompany = sanitizeFileName(String(company || "SEM EMPRESA").trim().toUpperCase()) || "SEM EMPRESA";
        return `CRONOGRAMA DE AÇÕES - ${safeCompany}`;
      }

      async function buildExecutiveJpegPages(plan) {
        const data = plan.data || { meta: {}, actions: [], equipment: [], trainings: [] };
        const preparedPlan = {
          ...plan,
          data: await prepareJpegExportData(data)
        };
        const preparedData = preparedPlan.data;
        const pages = [
          ...buildJpegTableSectionPages(preparedPlan, {
            title: "Ações",
            includeOverview: true,
            headers: ["Item", "Ação recomendada", "Responsável", "Quando", "Prioridade", "Status", "Observação"],
            widths: [60, 500, 160, 174, 128, 150, 340],
            rows: (preparedData.actions || []).map((row, index) => [
              String(index + 1),
              jpegCellFromRich(row._jpegAction || richContentForPdf(row.actionHtml)),
              row.responsible || "-",
              row.when || "-",
              row.priority || "-",
              row.status || "-",
              jpegCellFromRich(row._jpegObservation || richContentForPdf(row.observationHtml, { imagePlaceholder: false }))
            ])
          }),
          ...buildJpegTableSectionPages(preparedPlan, {
            title: "Equipamentos de Emergência",
            headers: ["Item", "Descrição", "Responsável", "Status", "Observação"],
            widths: [60, 650, 210, 160, 432],
            rows: (preparedData.equipment || []).map((row, index) => [
              String(index + 1),
              jpegCellFromRich(row._jpegDescription || richContentForPdf(row.descriptionHtml)),
              row.responsible || "-",
              row.status || "-",
              jpegCellFromRich(row._jpegObservation || richContentForPdf(row.observationHtml, { imagePlaceholder: false }))
            ])
          }),
          ...buildJpegTableSectionPages(preparedPlan, {
            title: "Treinamentos",
            headers: ["Item", "Treinamento", "Responsável", "Quando", "Status", "Observação"],
            widths: [60, 500, 200, 210, 160, 382],
            rows: (preparedData.trainings || []).map((row, index) => [
              String(index + 1),
              jpegCellFromRich(row._jpegTraining || richContentForPdf(row.trainingHtml)),
              row.responsible || "-",
              row.when || "-",
              row.status || "-",
              jpegCellFromRich(row._jpegObservation || richContentForPdf(row.observationHtml, { imagePlaceholder: false }))
            ])
          })
        ];

        const totalPages = pages.length;
        return Promise.all(pages.map(async (page, index) => {
          drawJpegSectionFooter(page.ctx, page.canvas.width, 44, index + 1, totalPages);
          return {
            blob: await canvasToJpegBlob(page.canvas, 0.92),
            fileSuffix: `PÁGINA ${String(index + 1).padStart(2, "0")}`
          };
        }));
      }

      async function prepareJpegExportData(data) {
        const logoItems = data.meta && data.meta.companyLogoImage
          ? await loadJpegEvidenceImages([{ src: data.meta.companyLogoImage }])
          : [];
        const actions = await Promise.all((data.actions || []).map(async row => ({
          ...row,
          _jpegAction: await richContentForJpeg(row.actionHtml),
          _jpegObservation: await richContentForJpeg(row.observationHtml, { imagePlaceholder: false })
        })));
        const equipment = await Promise.all((data.equipment || []).map(async row => ({
          ...row,
          _jpegDescription: await richContentForJpeg(row.descriptionHtml),
          _jpegObservation: await richContentForJpeg(row.observationHtml, { imagePlaceholder: false })
        })));
        const trainings = await Promise.all((data.trainings || []).map(async row => ({
          ...row,
          _jpegTraining: await richContentForJpeg(row.trainingHtml),
          _jpegObservation: await richContentForJpeg(row.observationHtml, { imagePlaceholder: false })
        })));

        return {
          ...data,
          meta: {
            ...(data.meta || {}),
            _jpegCompanyLogoImage: logoItems[0] ? logoItems[0].image : null
          },
          actions,
          equipment,
          trainings
        };
      }

      async function richContentForJpeg(value, options = {}) {
        const rich = richContentForPdf(value, options);
        const items = await loadJpegEvidenceImages(rich.images.map(src => ({ src })));
        return {
          text: rich.text,
          images: items.filter(item => item.image).map(item => item.image)
        };
      }

      // Divide cada seção em páginas A4 paisagem, sem cortar linhas de tabela.
      function buildJpegTableSectionPages(plan, config) {
        const width = 1600;
        const height = 1131;
        const margin = 44;
        const pageBottom = height - 52;
        const rows = config.rows || [];
        const pages = [];
        let rowIndex = 0;
        let pageIndex = 0;

        do {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          let y = drawJpegSection(ctx, plan, config.title, { continuation: pageIndex > 0 });

          if (config.includeOverview && pageIndex === 0) {
            const data = plan.data || {};
            const meta = data.meta || {};
            y = drawJpegDescription(ctx, richContentForPdf(meta.description || DEFAULT_DESCRIPTION).text, margin, y + 10, width - margin * 2, false);
            y = drawJpegSummary(ctx, getExecutiveStats(plan), margin, y + 10, width - margin * 2, false);
          }

          const tableY = y + 10;
          const availableHeight = pageBottom - tableY - 62;
          const chunk = [];
          let usedHeight = 0;
          while (rowIndex < rows.length) {
            const rowHeight = measureJpegTableRowHeight(ctx, rows[rowIndex], config.widths, false);
            if (!chunk.length && config.includeOverview && pageIndex === 0 && rowHeight > availableHeight) break;
            if (chunk.length && usedHeight + rowHeight > availableHeight) break;
            chunk.push(rows[rowIndex]);
            usedHeight += rowHeight;
            rowIndex += 1;
            if (usedHeight >= availableHeight) break;
          }

          if (chunk.length || rows.length === 0) {
            drawJpegTable(ctx, config.title, [config.headers, ...chunk], margin, tableY, config.widths, false);
          }
          pages.push({ canvas, ctx });
          pageIndex += 1;
        } while (rowIndex < rows.length || (rows.length === 0 && pages.length === 0));

        return pages;
      }

      function drawJpegSection(ctx, plan, sectionTitle, options = {}) {
        const width = 1600;
        const margin = 44;
        const contentWidth = width - margin * 2;
        const data = plan.data || { meta: {}, actions: [], equipment: [], trainings: [] };
        const meta = data.meta || {};
        const company = meta.company || plan.company || "-";
        const documentName = meta.documentName || plan.documentType || "-";
        const generatedAt = new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
        let y = margin;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, ctx.canvas.height);
        const logo = meta._jpegCompanyLogoImage;
        let logoDrawn = false;
        if (logo) {
          try {
            drawImageContained(ctx, logo, margin, y, 62, 56);
            logoDrawn = true;
          } catch (error) {
            console.warn("Logo da empresa indisponível para o JPEG:", error);
          }
        }
        if (!logoDrawn) {
          ctx.fillStyle = "#2563eb";
          canvasRoundRect(ctx, margin, y, 56, 56, 9, true);
        }
        ctx.fillStyle = "#0f172a";
        ctx.font = "900 29px Segoe UI, Arial, sans-serif";
        ctx.fillText(`${sectionTitle}${options.continuation ? " - CONTINUAÇÃO" : ""}`, margin + 78, y + 24);
        ctx.font = "700 15px Segoe UI, Arial, sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText(`CRONOGRAMA DE AÇÕES SST | Gerado em ${generatedAt}`, margin + 78, y + 48);
        y += 70;

        y = drawJpegMetaGrid(ctx, [
          ["Empresa", company],
          ["Documento", documentName],
          ["Criação / Revisão", meta.revisionDate || "-"],
          ["Plano", plan.title || "-"]
        ], margin, y, contentWidth, false);
        return y;
      }

      function drawJpegSectionFooter(ctx, width, margin, pageNumber, totalPages) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, ctx.canvas.height - 50, width, 50);
        ctx.strokeStyle = "#e2e8f0";
        ctx.beginPath();
        ctx.moveTo(margin, ctx.canvas.height - 50);
        ctx.lineTo(width - margin, ctx.canvas.height - 50);
        ctx.stroke();
        ctx.fillStyle = "#64748b";
        ctx.font = "700 14px Segoe UI, Arial, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("SATS - Exportação JPEG A4", margin, ctx.canvas.height - 24);
        ctx.textAlign = "right";
        ctx.fillText(`Página ${String(pageNumber).padStart(2, "0")} de ${String(totalPages).padStart(2, "0")}`, width - margin, ctx.canvas.height - 24);
        ctx.textAlign = "left";
      }

      function drawJpegMetaGrid(ctx, items, x, y, width, measureOnly) {
        const gap = 10;
        const boxWidth = (width - gap * 3) / 4;
        const boxHeight = 62;
        items.forEach((item, index) => {
          const bx = x + index * (boxWidth + gap);
          if (!measureOnly) {
            ctx.fillStyle = "#f8fafc";
            ctx.strokeStyle = "#cbd5e1";
            canvasRoundRect(ctx, bx, y, boxWidth, boxHeight, 8, true, true);
            ctx.fillStyle = "#64748b";
            ctx.font = "800 11px Segoe UI, Arial, sans-serif";
            ctx.fillText(String(item[0] || "").toUpperCase(), bx + 12, y + 20);
            ctx.fillStyle = "#0f172a";
            ctx.font = "800 16px Segoe UI, Arial, sans-serif";
            drawCanvasTextBlock(ctx, String(item[1] || "-"), bx + 12, y + 43, boxWidth - 24, 18, 2);
          }
        });
        return y + boxHeight;
      }

      function drawJpegDescription(ctx, text, x, y, width, measureOnly) {
        const lineHeight = 18;
        ctx.font = "600 14px Segoe UI, Arial, sans-serif";
        const lines = wrapCanvasText(ctx, text, width - 28);
        const height = Math.max(50, lines.length * lineHeight + 24);
        if (!measureOnly) {
          ctx.fillStyle = "#f8fafc";
          ctx.strokeStyle = "#cbd5e1";
          canvasRoundRect(ctx, x, y, width, height, 8, true, true);
          ctx.fillStyle = "#334155";
          drawCanvasTextBlock(ctx, text, x + 14, y + 22, width - 28, lineHeight);
        }
        return y + height;
      }

      function drawJpegSummary(ctx, stats, x, y, width, measureOnly) {
        const items = [
          ["Total de Ações", stats.total, "#eff6ff", "#1d4ed8"],
          ["Não Iniciadas", stats.notStarted, "#f1f5f9", "#475569"],
          ["Em Andamento", stats.inProgress, "#dbeafe", "#1e40af"],
          ["Concluídas", stats.done, "#dcfce7", "#166534"],
          ["Progresso Geral", `${stats.progress}%`, "#ecfdf5", "#15803d"],
          ["Alta Prioridade", stats.highOpen, "#fee2e2", "#991b1b"]
        ];
        const gap = 8;
        const cardWidth = (width - gap * (items.length - 1)) / items.length;
        const height = 68;
        items.forEach((item, index) => {
          const cx = x + index * (cardWidth + gap);
          if (!measureOnly) {
            ctx.fillStyle = item[2];
            ctx.strokeStyle = "#cbd5e1";
            canvasRoundRect(ctx, cx, y, cardWidth, height, 8, true, true);
            ctx.fillStyle = item[3];
            ctx.font = "900 23px Segoe UI, Arial, sans-serif";
            ctx.fillText(String(item[1]), cx + 12, y + 31);
            ctx.font = "800 11px Segoe UI, Arial, sans-serif";
            drawCanvasTextBlock(ctx, item[0], cx + 12, y + 51, cardWidth - 24, 14, 2);
          }
        });
        return y + height;
      }

      function jpegCellFromRich(rich) {
        const images = (rich && rich.images ? rich.images : []).filter(image => image && typeof image === "object" && "naturalWidth" in image);
        if (!rich || !images.length) return rich && rich.text ? rich.text : "-";
        return {
          content: rich.text === "-" ? "" : rich.text,
          images
        };
      }

      function jpegCellText(cell) {
        return cell && typeof cell === "object" && !Array.isArray(cell) && "content" in cell ? cell.content : cell;
      }

      function jpegCellImages(cell) {
        return cell && typeof cell === "object" && !Array.isArray(cell) && Array.isArray(cell.images) ? cell.images : [];
      }

      function jpegCellDisplayText(cell) {
        const text = jpegCellText(cell);
        if ((!text || text === "-") && jpegCellImages(cell).length) return "";
        return pdfText(text);
      }

      function drawJpegCellImages(ctx, images, x, y, width, height) {
        if (!images.length || height <= 8) return;
        const columns = images.length > 1 ? 2 : 1;
        const gap = 8;
        const thumbWidth = (width - gap * (columns - 1)) / columns;
        const rowHeight = Math.min(78, Math.max(48, height / Math.ceil(images.length / columns)));

        images.forEach((image, index) => {
          const column = index % columns;
          const row = Math.floor(index / columns);
          const ix = x + column * (thumbWidth + gap);
          const iy = y + row * (rowHeight + 6);
          drawImageContained(ctx, image, ix, iy, thumbWidth, rowHeight);
        });
      }

      function measureJpegTableRowHeight(ctx, row, widths, isHeader = false) {
        if (isHeader) return 34;
        const lineHeight = 17;
        const cellPadding = 7;
        ctx.font = "600 13px Segoe UI, Arial, sans-serif";
        return Math.max(44, Math.max(...row.map((cell, index) => {
          const displayText = jpegCellDisplayText(cell);
          const textLines = displayText ? wrapCanvasText(ctx, displayText, widths[index] - cellPadding * 2) : [];
          const imageCount = jpegCellImages(cell).length;
          const imageRows = imageCount ? Math.ceil(imageCount / (imageCount > 1 ? 2 : 1)) : 0;
          const imageHeight = imageRows ? imageRows * 84 + 6 : 0;
          return textLines.length * lineHeight + cellPadding * 2 + imageHeight;
        })));
      }

      function drawJpegTable(ctx, title, rows, x, y, widths, measureOnly) {
        const tableWidth = widths.reduce((sum, value) => sum + value, 0);
        const lineHeight = 17;
        const cellPadding = 7;
        let cursorY = y;
        if (!measureOnly) {
          ctx.fillStyle = "#0f172a";
          ctx.font = "900 19px Segoe UI, Arial, sans-serif";
          ctx.fillText(String(title || "").toUpperCase(), x, cursorY + 20);
        }
        cursorY += 28;
        const normalizedTitle = String(title || "").toLowerCase();
        const isActionsTable = normalizedTitle.includes("ações") || normalizedTitle.includes("acoes");
        const isEquipmentTable = normalizedTitle.includes("equip");
        const isTrainingTable = normalizedTitle.includes("trein");
        const priorityColumn = isActionsTable ? 4 : -1;
        const statusColumn = isActionsTable ? 5 : isEquipmentTable ? 3 : isTrainingTable ? 4 : -1;
        const rowHeights = rows.map((row, rowIndex) => measureJpegTableRowHeight(ctx, row, widths, rowIndex === 0));
        if (!measureOnly && rows.length === 1) {
          ctx.fillStyle = "#f8fafc";
          ctx.strokeStyle = "#cbd5e1";
          canvasRoundRect(ctx, x, cursorY, tableWidth, 62, 8, true, true);
          ctx.fillStyle = "#64748b";
          ctx.font = "700 18px Segoe UI, Arial, sans-serif";
          ctx.fillText("Nenhum registro cadastrado.", x + 18, cursorY + 38);
        }
        if (rows.length === 1) return cursorY + 62;

        rows.forEach((row, rowIndex) => {
          const rowHeight = rowHeights[rowIndex];
          let cursorX = x;
          row.forEach((cell, colIndex) => {
            const cellWidth = widths[colIndex];
            if (!measureOnly) {
              const isHeader = rowIndex === 0;
              const tone = !isHeader && (colIndex === priorityColumn ? jpegPriorityTone(cell) : colIndex === statusColumn ? jpegStatusTone(cell) : null);
              ctx.fillStyle = isHeader ? "#1e3a8a" : tone ? tone.fill : rowIndex % 2 === 0 ? "#f8fafc" : "#ffffff";
              ctx.strokeStyle = "#cbd5e1";
              ctx.fillRect(cursorX, cursorY, cellWidth, rowHeight);
              ctx.strokeRect(cursorX, cursorY, cellWidth, rowHeight);
              ctx.fillStyle = isHeader ? "#ffffff" : tone ? tone.text : "#1e293b";
              ctx.font = isHeader || tone ? "800 13px Segoe UI, Arial, sans-serif" : "600 13px Segoe UI, Arial, sans-serif";
              const maxLines = isHeader ? 2 : Infinity;
              const displayText = jpegCellDisplayText(cell);
              const textBlockBottom = displayText
                ? drawCanvasTextBlock(ctx, displayText, cursorX + cellPadding, cursorY + 19, cellWidth - cellPadding * 2, lineHeight, maxLines)
                : cursorY + cellPadding;
              const images = jpegCellImages(cell);
              if (images.length) {
                drawJpegCellImages(ctx, images, cursorX + cellPadding, textBlockBottom + 8, cellWidth - cellPadding * 2, rowHeight - (textBlockBottom - cursorY) - cellPadding);
              }
            }
            cursorX += cellWidth;
          });
          cursorY += rowHeight;
        });
        return cursorY;
      }

      function jpegPriorityTone(value) {
        if (value === "Alta") return { fill: "#fee2e2", text: "#991b1b" };
        if (value === "Média") return { fill: "#fef3c7", text: "#92400e" };
        if (value === "Baixa") return { fill: "#dcfce7", text: "#166534" };
        return null;
      }

      function jpegStatusTone(value) {
        if (value === "Não iniciado") return { fill: "#e2e8f0", text: "#475569" };
        if (value === "Em andamento") return { fill: "#dbeafe", text: "#1e40af" };
        if (value === "Concluído") return { fill: "#dcfce7", text: "#166534" };
        if (value === "Cancelado") return { fill: "#fee2e2", text: "#991b1b" };
        return null;
      }

      function wrapCanvasText(ctx, value, maxWidth) {
        const paragraphs = pdfText(value).split(/\n+/);
        const lines = [];
        paragraphs.forEach(paragraph => {
          const words = paragraph.trim().split(/\s+/).filter(Boolean);
          if (!words.length) {
            lines.push("");
            return;
          }
          let line = "";
          words.forEach(word => {
            const testLine = line ? `${line} ${word}` : word;
            if (ctx.measureText(testLine).width > maxWidth && line) {
              lines.push(line);
              line = word;
            } else {
              line = testLine;
            }
          });
          if (line) lines.push(line);
        });
        return lines.length ? lines : ["-"];
      }

      function drawCanvasTextBlock(ctx, value, x, y, maxWidth, lineHeight, maxLines = Infinity) {
        const lines = wrapCanvasText(ctx, value, maxWidth).slice(0, maxLines);
        lines.forEach((line, index) => {
          const suffix = index === maxLines - 1 && wrapCanvasText(ctx, value, maxWidth).length > maxLines ? "..." : "";
          ctx.fillText(line + suffix, x, y + index * lineHeight);
        });
        return y + lines.length * lineHeight;
      }

      function canvasRoundRect(ctx, x, y, width, height, radius, fill = true, stroke = false) {
        const r = Math.min(radius, width / 2, height / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + width - r, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + r);
        ctx.lineTo(x + width, y + height - r);
        ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
        ctx.lineTo(x + r, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
      }

      function drawImageContained(ctx, image, x, y, width, height) {
        const ratio = Math.min(width / image.naturalWidth, height / image.naturalHeight);
        const drawWidth = image.naturalWidth * ratio;
        const drawHeight = image.naturalHeight * ratio;
        const dx = x + (width - drawWidth) / 2;
        const dy = y + (height - drawHeight) / 2;
        ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
      }

      function loadJpegEvidenceImages(items) {
        return Promise.all(items.map(item => new Promise(resolve => {
          const image = new Image();
          image.onload = () => resolve({ ...item, image });
          image.onerror = () => resolve({ ...item, image: null });
          image.src = item.src;
        })));
      }

      function canvasToJpegBlob(canvas, quality) {
        return new Promise(resolve => {
          canvas.toBlob(blob => {
            if (blob) {
              resolve(blob);
              return;
            }
            const dataUrl = canvas.toDataURL("image/jpeg", quality);
            resolve(dataUrlToBlob(dataUrl));
          }, "image/jpeg", quality);
        });
      }

      function dataUrlToBlob(dataUrl) {
        const [header, data] = dataUrl.split(",");
        const mime = (header.match(/data:([^;]+)/) || [])[1] || "image/jpeg";
        const binary = atob(data);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
        return new Blob([bytes], { type: mime });
      }

      function downloadBlob(blob, fileName) {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
      }

      function exportJson() {
        if (blockRestrictedAdminAccess()) return;
        const payload = {
          exportedAt: new Date().toISOString(),
          app: "SATS",
          version: 2,
          ...app
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `planos_acao_sst_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
      }

      function importJson(event) {
        if (blockRestrictedAdminAccess()) {
          event.target.value = "";
          return;
        }
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const raw = JSON.parse(reader.result);
            const imported = raw.version === 2 && Array.isArray(raw.profiles) ? normalizeApp(raw) : createAppFromLegacy(raw);
            if (!await openConfirmModal({ title: "Importar backup", message: "Os dados atuais serão substituídos pelo arquivo selecionado.", requiredText: "IMPORTAR", confirmLabel: "Importar backup" })) return;
            Object.assign(app, imported);
            app.view = "profiles";
            selectedActions.clear();
            saveApp({ fullSave: true });
            renderApp();
          } catch (error) {
            showToast("Não foi possível importar o arquivo JSON. Verifique se o backup é válido.");
            console.error(error);
          } finally {
            event.target.value = "";
          }
        };
        reader.readAsText(file, "utf-8");
      }

      function currentProfile() {
        return app.profiles.find(profile => profile.id === app.activeProfileId) || null;
      }

      function currentPlan() {
        const profile = currentProfile();
        if (!profile) return null;
        const plan = profile.plans.find(plan => plan.id === app.activePlanId) || null;
        return plan && !isPlanInTrash(plan) ? plan : null;
      }

      function currentPlanData() {
        const plan = currentPlan();
        return plan ? plan.data : null;
      }

      function getActiveFolder(profile) {
        const visibleFolders = getVisibleFolders(profile);
        return visibleFolders.find(folder => folder.id === app.activeFolderId)
          || visibleFolders.find(folder => folder.id === DEFAULT_FOLDER_ID)
          || visibleFolders[0];
      }

      function getVisibleFolders(profile) {
        if (!profile || !Array.isArray(profile.folders)) return [];
        return profile.folders.filter(folder => folder.isDefault || canAccessHiddenItems() || !folder.hidden);
      }

      function isPlanInTrash(plan) {
        return !!plan && plan.deleted === true;
      }

      function getActivePlans(profile) {
        return (profile?.plans || []).filter(plan => !isPlanInTrash(plan));
      }

      function getTrashPlansByProfile(profileId) {
        const profile = app.profiles.find(item => item.id === profileId) || null;
        return (profile?.plans || [])
          .filter(isPlanInTrash)
          .sort((a, b) => (Date.parse(b.deletedAt || "") || 0) - (Date.parse(a.deletedAt || "") || 0));
      }

      function isTrashPlanExpired(plan, nowMs = Date.now()) {
        if (!isPlanInTrash(plan)) return false;
        const expiresAt = Date.parse(plan.trashExpiresAt || "");
        return Number.isFinite(expiresAt) && expiresAt > 0 && expiresAt <= nowMs;
      }

      function purgeExpiredTrashPlans(options = {}) {
        const nowMs = Date.now();
        const removed = [];
        (app.profiles || []).forEach(profile => {
          const nextPlans = [];
          (profile.plans || []).forEach(plan => {
            if (isTrashPlanExpired(plan, nowMs)) {
              removed.push({ profile, plan });
              if (options.trackDeletes && plan.id) pendingPlanDeletes.add(plan.id);
              return;
            }
            nextPlans.push(plan);
          });
          if (nextPlans.length !== (profile.plans || []).length) {
            profile.plans = nextPlans;
            if (options.trackDeletes && profile.id) dirtyProfileIds.add(profile.id);
          }
        });
        return removed;
      }

      function trashExpiryFrom(date = new Date()) {
        const base = date instanceof Date && Number.isFinite(date.getTime()) ? date : new Date();
        return new Date(base.getTime() + PLAN_TRASH_RETENTION_MS).toISOString();
      }

      function movePlanToTrash(planId, profile = currentProfile(), options = {}) {
        if (!profile) return null;
        const plan = (profile.plans || []).find(item => item.id === planId);
        if (!plan || isPlanInTrash(plan)) return plan || null;
        const now = new Date();
        plan.deleted = true;
        plan.deletedAt = now.toISOString();
        plan.deletedBy = currentUser?.email || "";
        plan.deletedFromProfileId = profile.id;
        plan.deletedFromFolderId = plan.folderId || DEFAULT_FOLDER_ID;
        plan.trashExpiresAt = trashExpiryFrom(now);
        touchPlan(plan);
        if (app.activePlanId === plan.id) app.activePlanId = null;
        if (!options.skipActivity) recordActivity("Enviou plano para lixeira", `Moveu o plano ${plan.title} para a lixeira por 24 horas.`, { profile, plan });
        if (!options.skipSave) saveApp({ profileId: profile.id });
        if (!options.skipToast) showToast("Plano movido para a lixeira. Ele poderá ser restaurado por 24 horas.", "success");
        return plan;
      }

      function ensureRestoreFolder(profile) {
        let folder = (profile.folders || []).find(item => normalizeText(item.name) === normalizeText(RESTORED_FOLDER_NAME));
        if (folder) return folder;
        folder = normalizeFolder({
          id: createId(),
          name: RESTORED_FOLDER_NAME,
          color: "#64748b",
          createdAt: new Date().toISOString()
        });
        profile.folders.push(folder);
        return folder;
      }

      function restorePlanFromTrash(planId, profile = currentProfile()) {
        if (!profile) return null;
        const plan = (profile.plans || []).find(item => item.id === planId && isPlanInTrash(item));
        if (!plan) return null;
        const originalFolder = (profile.folders || []).find(folder => folder.id === plan.deletedFromFolderId);
        const canUseOriginal = originalFolder && (originalFolder.isDefault || canAccessHiddenItems() || !originalFolder.hidden);
        const targetFolder = canUseOriginal ? originalFolder : ensureRestoreFolder(profile);
        plan.folderId = targetFolder.id;
        plan.deleted = false;
        plan.deletedAt = "";
        plan.deletedBy = "";
        plan.deletedFromProfileId = "";
        plan.deletedFromFolderId = "";
        plan.trashExpiresAt = "";
        touchPlan(plan);
        app.activeFolderId = targetFolder.id;
        recordActivity("Restaurou plano da lixeira", `Restaurou o plano ${plan.title} para a pasta ${targetFolder.name}.`, { profile, plan });
        saveApp({ profileId: profile.id });
        showToast("Plano restaurado com sucesso.", "success");
        return plan;
      }

      function deletePlanPermanently(planId, profile = currentProfile(), options = {}) {
        if (!profile) return null;
        const plan = (profile.plans || []).find(item => item.id === planId);
        if (!plan) return null;
        profile.plans = (profile.plans || []).filter(item => item.id !== planId);
        if (app.activePlanId === planId) app.activePlanId = null;
        if (!options.skipActivity) recordActivity("Excluiu plano permanentemente", `Excluiu permanentemente o plano ${plan.title}.`, { profile, plan });
        if (!options.skipSave) saveApp({ deletePlanId: planId, profileId: profile.id });
        if (!options.skipToast) showToast("Plano excluído permanentemente.", "success");
        return plan;
      }

      function formatTrashRemaining(plan) {
        const remaining = (Date.parse(plan.trashExpiresAt || "") || 0) - Date.now();
        if (remaining <= 0) return "Expirado";
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.max(1, Math.round((remaining % 3600000) / 60000));
        if (hours >= 1) return `${hours}h ${minutes}min restantes`;
        return `${minutes}min restantes`;
      }

      function ensureDefaultFolder(profile) {
        if (!profile.folders.some(folder => folder.id === DEFAULT_FOLDER_ID)) {
          profile.folders.unshift(createDefaultFolder());
        }
      }

      function getPlanStats(plan) {
        const actions = plan.data.actions || [];
        const total = actions.length;
        const done = actions.filter(row => row.status === "Concluído").length;
        const progress = total ? Math.round((done / total) * 100) : 0;
        return {
          progress,
          notStarted: actions.filter(row => row.status === "Não iniciado").length,
          inProgress: actions.filter(row => row.status === "Em andamento").length,
          done
        };
      }

      function touchRowAndPlan(row) {
        touchRow(row);
        touchPlan(currentPlan());
      }

      function touchRow(row) {
        row.lastEdited = new Date().toISOString();
      }

      function touchPlan(plan) {
        if (plan) plan.updatedAt = new Date().toISOString();
      }

      function rowDeleteKey(info) {
        if (!info) return "";
        return [info.profileId || app.activeProfileId || "", info.planId || app.activePlanId || "", info.section || "", info.rowId || info.id || ""].join("|");
      }

      function parseRowDeleteKey(key) {
        const [profileId, planId, section, rowId] = String(key || "").split("|");
        return { profileId, planId, section, rowId };
      }

      function saveApp(options = {}) {
        pruneSystemStorage();
        if (!options.skipTrashPurge) purgeExpiredTrashPlans({ trackDeletes: true });
        const key = currentUser ? SHARED_STORAGE_KEY : STORAGE_KEY;
        localStorage.setItem(key, JSON.stringify(app));
        if (!isHydrating) lastLocalChangeAt = Date.now();
        const pureActivitySave = options.activityId
          && !options.fullSave
          && !options.deleteProfileId
          && !options.deletePlanId
          && !options.deleteFolderId
          && !options.rowDelete
          && !options.rowDeletes
          && !options.profileId
          && !options.improvements
          && !options.management
          && !options.hiddenAdd
          && !options.hiddenRemove;
        const permittedManagementSave = options.management && canAccessManagementPhase1();
        if (isRestrictedAdminUser() && !options.localOnly && !options.improvements && !permittedManagementSave) {
          egressDiag("saveApp bloqueado por modo readonly", {
            options: Object.keys(options),
            pureActivitySave: !!pureActivitySave,
            caller: egressDiagCaller()
          });
          return;
        }
        if (!options.localOnly) {
          if (options.fullSave) pendingFullSave = true;
          if (permittedManagementSave) pendingManagementSave = true;
          if (options.improvements) pendingImprovementsSave = true;
          if (options.deleteProfileId) pendingProfileDeletes.add(options.deleteProfileId);
          if (options.deletePlanId) pendingPlanDeletes.add(options.deletePlanId);
          if (options.deleteFolderId) pendingFolderDeletes.add(options.deleteFolderId);
          if (options.activityId) pendingActivityIds.add(options.activityId);
          if (options.rowDelete) {
            const key = rowDeleteKey(options.rowDelete);
            if (key) pendingRowDeletes.add(key);
          }
          if (Array.isArray(options.rowDeletes)) options.rowDeletes.forEach(rowDelete => {
            const key = rowDeleteKey(rowDelete);
            if (key) pendingRowDeletes.add(key);
          });
          if (options.hiddenAdd) pendingHiddenAdds.add(options.hiddenAdd);
          if (options.hiddenRemove) pendingHiddenRemoves.add(options.hiddenRemove);
          if (options.profileId) dirtyProfileIds.add(options.profileId);
          if (!options.fullSave && !options.improvements && !options.deleteProfileId && !options.profileId && !pureActivitySave && app.activeProfileId) {
            dirtyProfileIds.add(app.activeProfileId);
          }
        }
        if (!currentUser || !cloudReady || isHydrating || options.localOnly || !hasPendingCloudChanges()) return;
        scheduleCloudSave();
      }

      function hasPendingCloudChanges() {
        return pendingFullSave
          || pendingManagementSave
          || pendingImprovementsSave
          || dirtyProfileIds.size > 0
          || pendingProfileDeletes.size > 0
          || pendingPlanDeletes.size > 0
          || pendingFolderDeletes.size > 0
          || pendingRowDeletes.size > 0
          || pendingActivityIds.size > 0
          || pendingHiddenAdds.size > 0
          || pendingHiddenRemoves.size > 0;
      }

      function takePendingCloudSnapshot() {
        return {
          fullSave: pendingFullSave,
          management: pendingManagementSave,
          improvements: pendingImprovementsSave,
          profileIds: Array.from(dirtyProfileIds),
          deletedProfileIds: Array.from(pendingProfileDeletes),
          deletedPlanIds: Array.from(pendingPlanDeletes),
          deletedFolderIds: Array.from(pendingFolderDeletes),
          deletedRows: Array.from(pendingRowDeletes),
          activityIds: Array.from(pendingActivityIds),
          hiddenAdds: Array.from(pendingHiddenAdds),
          hiddenRemoves: Array.from(pendingHiddenRemoves)
        };
      }

      function clearPendingCloudSnapshot(snapshot) {
        if (snapshot.fullSave) pendingFullSave = false;
        if (snapshot.management) pendingManagementSave = false;
        if (snapshot.improvements) pendingImprovementsSave = false;
        snapshot.profileIds.forEach(id => dirtyProfileIds.delete(id));
        snapshot.deletedProfileIds.forEach(id => pendingProfileDeletes.delete(id));
        snapshot.deletedPlanIds.forEach(id => pendingPlanDeletes.delete(id));
        snapshot.deletedFolderIds.forEach(id => pendingFolderDeletes.delete(id));
        snapshot.deletedRows.forEach(key => pendingRowDeletes.delete(key));
        snapshot.activityIds.forEach(id => pendingActivityIds.delete(id));
        snapshot.hiddenAdds.forEach(id => pendingHiddenAdds.delete(id));
        snapshot.hiddenRemoves.forEach(id => pendingHiddenRemoves.delete(id));
      }

      function requeuePendingCloudSnapshot(snapshot) {
        if (snapshot.fullSave) pendingFullSave = true;
        if (snapshot.management) pendingManagementSave = true;
        if (snapshot.improvements) pendingImprovementsSave = true;
        snapshot.profileIds.forEach(id => dirtyProfileIds.add(id));
        snapshot.deletedProfileIds.forEach(id => pendingProfileDeletes.add(id));
        snapshot.deletedPlanIds.forEach(id => pendingPlanDeletes.add(id));
        snapshot.deletedFolderIds.forEach(id => pendingFolderDeletes.add(id));
        snapshot.deletedRows.forEach(key => pendingRowDeletes.add(key));
        snapshot.activityIds.forEach(id => pendingActivityIds.add(id));
        snapshot.hiddenAdds.forEach(id => pendingHiddenAdds.add(id));
        snapshot.hiddenRemoves.forEach(id => pendingHiddenRemoves.add(id));
      }

      function scheduleCloudSave() {
        egressDiag("scheduleCloudSave disparado", {
          pending: snapshotDiag(),
          caller: egressDiagCaller()
        });
        if (saveTimer) {
          clearTimeout(saveTimer);
          egressDiag("scheduleCloudSave substituiu debounce anterior", { delayMs: 5000 });
        }
        saveTimer = setTimeout(() => {
          saveTimer = null;
          saveAppToCloud({ source: "debounced-save" });
        }, 5000);
        if (app.view === "editor") els.saveStatus.textContent = "Salvando no banco...";
      }

      async function flushCloudSave() {
        if (saveTimer) {
          clearTimeout(saveTimer);
          saveTimer = null;
          egressDiag("flushCloudSave limpou debounce pendente", { pending: snapshotDiag() });
          await saveAppToCloud({ source: "flushCloudSave:timer" });
        } else if (hasPendingCloudChanges()) {
          await saveAppToCloud({ source: "flushCloudSave:pending" });
        }
      }

      async function saveAppToCloud(options = {}) {
        egressDiag("saveAppToCloud chamada", {
          source: options.source || "direct",
          pending: snapshotDiag(),
          caller: egressDiagCaller()
        });
        if (!supabaseClient || !currentUser || !cloudReady || isSavingCloud) {
          egressDiag("saveAppToCloud ignorada por guarda", {
            hasClient: !!supabaseClient,
            hasUser: !!currentUser,
            cloudReady,
            isSavingCloud
          });
          return;
        }
        const snapshot = takePendingCloudSnapshot();
        if (!snapshot.fullSave
          && !snapshot.management
          && !snapshot.improvements
          && !snapshot.profileIds.length
          && !snapshot.deletedProfileIds.length
          && !snapshot.deletedPlanIds.length
          && !snapshot.deletedFolderIds.length
          && !snapshot.deletedRows.length
          && !snapshot.activityIds.length
          && !snapshot.hiddenAdds.length
          && !snapshot.hiddenRemoves.length) {
          egressDiag("saveAppToCloud ignorada sem mudanças pendentes");
          return;
        }
        if (isRestrictedAdminUser() && !snapshot.improvements && !(snapshot.management && canAccessManagementPhase1())) {
          egressDiag("saveAppToCloud bloqueada por modo readonly", { snapshot: snapshotDiag(snapshot) });
          clearPendingCloudSnapshot(snapshot);
          return;
        }
        if (!ensureSyncLeader({
          reason: `saveAppToCloud:${options.source || "direct"}`,
          steal: document.visibilityState === "visible" || options.source === "pagehide" || options.source === "inactivity-logout"
        })) {
          egressDiag("saveAppToCloud aguardando aba lider", { source: options.source || "direct" });
          return;
        }
        isSavingCloud = true;
        clearPendingCloudSnapshot(snapshot);
        let savedCloudOk = false;
        try {
          const mergedData = await buildMergedCloudData(snapshot);
          const { data, error } = await supabaseClient
            .from("shared_states")
            .upsert({
              id: SHARED_STATE_ID,
              data: mergedData,
              updated_at: new Date().toISOString()
            }, { onConflict: "id" })
            .select("updated_at")
            .single();
          if (error) {
            console.error(error);
            requeuePendingCloudSnapshot(snapshot);
            if (app.view === "editor") els.saveStatus.textContent = "Erro ao salvar no banco";
            return;
          }
          app = restoreLocalNavigation(normalizeApp(mergedData), captureLocalNavigation());
          lastCloudSaveAt = Date.now();
          if (data && data.updated_at) lastSharedUpdatedAt = data.updated_at;
          writeLocalSharedCache(app, lastSharedUpdatedAt);
          if (app.view === "editor") markSaved();
          savedCloudOk = true;
        } catch (error) {
          console.error(error);
          requeuePendingCloudSnapshot(snapshot);
          if (app.view === "editor") els.saveStatus.textContent = "Erro ao salvar no banco";
        } finally {
          isSavingCloud = false;
          if (savedCloudOk && hasPendingCloudChanges() && currentUser && cloudReady) scheduleCloudSave();
        }
      }

      async function buildMergedCloudData(snapshot) {
        egressDiag("buildMergedCloudData chamada", { snapshot: snapshotDiag(snapshot) });
        if (snapshot.fullSave || snapshot.management) {
          egressDiag("buildMergedCloudData fullSave/management; não baixou data remoto");
          return sharedAppData(app);
        }
        const remoteUpdatedAt = await fetchSharedStateUpdatedAt({ source: "buildMergedCloudData" });
        if (remoteUpdatedAt && remoteUpdatedAt === lastSharedUpdatedAt) {
          egressDiag("buildMergedCloudData não baixou data remoto", {
            remoteUpdatedAt,
            lastSharedUpdatedAt
          });
          return sharedAppData(app);
        }
        egressDiag("buildMergedCloudData baixando data remoto", {
          remoteUpdatedAt,
          lastSharedUpdatedAt
        });
        const row = await fetchSharedStateFull({ source: "buildMergedCloudData" });
        const latest = row && row.data ? normalizeApp(row.data) : createEmptyApp();
        const deleteIds = new Set(snapshot.deletedProfileIds.filter(Boolean));
        const deletedPlanIds = new Set((snapshot.deletedPlanIds || []).filter(Boolean));
        const deletedFolderIds = new Set((snapshot.deletedFolderIds || []).filter(Boolean));
        const deletedRows = (snapshot.deletedRows || []).filter(Boolean).map(parseRowDeleteKey);
        const hiddenAddSet = new Set(snapshot.hiddenAdds.filter(Boolean));

        snapshot.hiddenRemoves.filter(Boolean).forEach(userId => {
          latest.hiddenUserProfileIds = latest.hiddenUserProfileIds.filter(id => id !== userId);
        });
        snapshot.hiddenAdds.filter(Boolean).forEach(userId => {
          if (!latest.hiddenUserProfileIds.includes(userId)) latest.hiddenUserProfileIds.push(userId);
        });

        latest.profiles = latest.profiles.filter(profile => {
          if (deleteIds.has(profile.id)) return false;
          if (profile.userId && hiddenAddSet.has(profile.userId)) return false;
          return true;
        });

        latest.profiles.forEach(profile => applyDeleteSnapshotToProfile(profile, deletedFolderIds, deletedPlanIds, deletedRows));

        snapshot.profileIds.filter(Boolean).forEach(profileId => {
          if (deleteIds.has(profileId)) return;
          const localProfile = app.profiles.find(profile => profile.id === profileId || profile.userId === profileId);
          if (!localProfile) return;
          const local = normalizeProfile(deepClone(localProfile));
          if (local.userId) {
            latest.hiddenUserProfileIds = latest.hiddenUserProfileIds.filter(userId => userId !== local.userId);
          }
          const index = latest.profiles.findIndex(item => item.id === local.id || (local.userId && item.userId === local.userId));
          const remote = index >= 0 ? latest.profiles[index] : null;
          const mergedProfile = mergeProfileForCloud(remote, local, { deletedFolderIds, deletedPlanIds, deletedRows });
          if (index >= 0) latest.profiles[index] = mergedProfile;
          else latest.profiles.push(mergedProfile);
        });

        if (snapshot.activityIds && snapshot.activityIds.length) {
          const activityIds = new Set(snapshot.activityIds);
          latest.activityLog = mergeActivityLogs(latest.activityLog, app.activityLog.filter(entry => activityIds.has(entry.id)));
        }

        if (snapshot.improvements) {
          latest.improvementSuggestions = mergeImprovementSuggestions(latest.improvementSuggestions, app.improvementSuggestions);
          latest.suggestionNotifications = mergeSuggestionNotifications(latest.suggestionNotifications, app.suggestionNotifications);
          latest.suggestionWeeklyRanking = normalizeSuggestionWeeklyRanking(app.suggestionWeeklyRanking);
        }
        latest.auditTrail = mergeAuditTrails(latest.auditTrail, app.auditTrail);
        latest.backupCenter = mergeBackupCenters(latest.backupCenter, app.backupCenter);

        return sharedAppData(latest);
      }

      function applyDeleteSnapshotToProfile(profile, deletedFolderIds, deletedPlanIds, deletedRows) {
        if (!profile) return;
        if (deletedFolderIds.size) {
          profile.folders = profile.folders.filter(folder => folder.isDefault || !deletedFolderIds.has(folder.id));
          profile.plans.forEach(plan => {
            if (deletedFolderIds.has(plan.folderId)) {
              plan.folderId = DEFAULT_FOLDER_ID;
              touchPlan(plan);
            }
          });
        }
        if (deletedPlanIds.size) {
          profile.plans = profile.plans.filter(plan => !deletedPlanIds.has(plan.id));
        }
        deletedRows.forEach(info => {
          if (info.profileId && info.profileId !== profile.id && info.profileId !== profile.userId) return;
          const plan = profile.plans.find(item => item.id === info.planId);
          if (!plan || !plan.data || !Array.isArray(plan.data[info.section])) return;
          plan.data[info.section] = plan.data[info.section].filter(row => row.id !== info.rowId);
          touchPlan(plan);
        });
      }

      function mergeProfileForCloud(remoteProfile, localProfile, options = {}) {
        const local = normalizeProfile(deepClone(localProfile));
        const remote = remoteProfile ? normalizeProfile(deepClone(remoteProfile)) : null;
        if (!remote) {
          applyDeleteSnapshotToProfile(local, options.deletedFolderIds || new Set(), options.deletedPlanIds || new Set(), options.deletedRows || []);
          return local;
        }

        const merged = normalizeProfile({
          ...remote,
          name: local.name,
          role: local.role,
          company: local.company,
          email: local.email,
          avatarColor: local.avatarColor,
          avatarPhoto: local.avatarPhoto,
          hidden: local.hidden === true,
          lastAccess: isSameOrNewer(local.lastAccess, remote.lastAccess) ? local.lastAccess : remote.lastAccess,
          createdAt: remote.createdAt || local.createdAt,
          folders: mergeFoldersForCloud(remote.folders, local.folders, options.deletedFolderIds || new Set()),
          plans: mergePlansForCloud(remote.plans, local.plans, {
            deletedPlanIds: options.deletedPlanIds || new Set(),
            deletedFolderIds: options.deletedFolderIds || new Set(),
            deletedRows: options.deletedRows || [],
            profileId: local.id
          })
        });
        applyDeleteSnapshotToProfile(merged, options.deletedFolderIds || new Set(), options.deletedPlanIds || new Set(), options.deletedRows || []);
        return merged;
      }

      function mergeFoldersForCloud(remoteFolders, localFolders, deletedFolderIds) {
        const map = new Map();
        normalizeProfile({ folders: remoteFolders || [], plans: [] }).folders.forEach(folder => {
          if (folder.isDefault || !deletedFolderIds.has(folder.id)) map.set(folder.id, folder);
        });
        normalizeProfile({ folders: localFolders || [], plans: [] }).folders.forEach(folder => {
          if (!folder.isDefault && deletedFolderIds.has(folder.id)) return;
          map.set(folder.id, folder);
        });
        const merged = Array.from(map.values());
        if (!merged.some(folder => folder.id === DEFAULT_FOLDER_ID)) merged.unshift(createDefaultFolder());
        return merged;
      }

      function mergePlansForCloud(remotePlans, localPlans, options) {
        const deletedPlanIds = options.deletedPlanIds || new Set();
        const deletedFolderIds = options.deletedFolderIds || new Set();
        const remoteMap = new Map((remotePlans || []).map(plan => [plan.id, normalizePlan(plan)]));
        const localMap = new Map((localPlans || []).map(plan => [plan.id, normalizePlan(plan)]));
        const ids = new Set([...remoteMap.keys(), ...localMap.keys()]);
        const baseOrder = [...localMap.keys(), ...remoteMap.keys()];
        const mergedMap = new Map();

        ids.forEach(planId => {
          if (deletedPlanIds.has(planId)) return;
          const remote = remoteMap.get(planId);
          const local = localMap.get(planId);
          const merged = remote && local ? mergePlanForCloud(remote, local, options) : deepClone(local || remote);
          if (!merged) return;
          if (deletedFolderIds.has(merged.folderId)) merged.folderId = DEFAULT_FOLDER_ID;
          mergedMap.set(planId, normalizePlan(merged));
        });

        return baseOrder
          .filter((id, index, arr) => arr.indexOf(id) === index && mergedMap.has(id))
          .map(id => mergedMap.get(id));
      }

      function mergePlanForCloud(remotePlan, localPlan, options) {
        const remote = normalizePlan(deepClone(remotePlan));
        const local = normalizePlan(deepClone(localPlan));
        const localIsNewer = isSameOrNewer(local.updatedAt, remote.updatedAt);
        const base = localIsNewer ? local : remote;
        const merged = {
          ...base,
          data: {
            meta: localIsNewer ? { ...remote.data.meta, ...local.data.meta } : { ...local.data.meta, ...remote.data.meta },
            actions: mergeRowsForCloud(remote.data.actions, local.data.actions, options, local.id, "actions", localIsNewer),
            equipment: mergeRowsForCloud(remote.data.equipment, local.data.equipment, options, local.id, "equipment", localIsNewer),
            trainings: mergeRowsForCloud(remote.data.trainings, local.data.trainings, options, local.id, "trainings", localIsNewer)
          }
        };
        merged.updatedAt = isSameOrNewer(local.updatedAt, remote.updatedAt) ? local.updatedAt : remote.updatedAt;
        return normalizePlan(merged);
      }

      function mergeRowsForCloud(remoteRows, localRows, options, planId, section, localOrderFirst) {
        const deletedKeys = new Set((options.deletedRows || [])
          .filter(info => (!info.profileId || info.profileId === options.profileId) && info.planId === planId && info.section === section)
          .map(info => info.rowId));
        const remoteMap = new Map((remoteRows || []).filter(row => !deletedKeys.has(row.id)).map(row => [row.id, row]));
        const localMap = new Map((localRows || []).filter(row => !deletedKeys.has(row.id)).map(row => [row.id, row]));
        const order = localOrderFirst
          ? [...localMap.keys(), ...remoteMap.keys()]
          : [...remoteMap.keys(), ...localMap.keys()];
        const rowMap = new Map();
        new Set([...remoteMap.keys(), ...localMap.keys()]).forEach(rowId => {
          const remote = remoteMap.get(rowId);
          const local = localMap.get(rowId);
          if (remote && local) {
            rowMap.set(rowId, isSameOrNewer(local.lastEdited, remote.lastEdited) ? local : remote);
          } else {
            rowMap.set(rowId, local || remote);
          }
        });
        return order
          .filter((id, index, arr) => arr.indexOf(id) === index && rowMap.has(id))
          .map(id => rowMap.get(id));
      }

      function mergeActivityLogs(baseEntries, newEntries) {
        const map = new Map();
        normalizeActivityLog(baseEntries).forEach(entry => map.set(entry.id, entry));
        normalizeActivityLog(newEntries).forEach(entry => map.set(entry.id, entry));
        return normalizeActivityLog(Array.from(map.values()));
      }

      function isSameOrNewer(candidate, reference) {
        const candidateTime = Date.parse(candidate || "") || 0;
        const referenceTime = Date.parse(reference || "") || 0;
        return candidateTime >= referenceTime;
      }

      function startSharedSync(options = {}) {
        egressDiag("startSharedSync chamado", {
          hadTimer: !!syncTimer,
          hadChannel: !!realtimeChannel,
          source: options.source || "unknown"
        });
        if (!ensureSyncLeader({
          reason: options.source || "startSharedSync",
          steal: options.steal !== false
        })) {
          stopSharedSync({ releaseLeadership: false });
          return;
        }
        stopSharedSync({ keepLeadership: true, releaseLeadership: false });
        startSyncLeaderHeartbeat();
        subscribeRealtime();
        syncTimer = setInterval(() => {
          if (document.visibilityState === "visible") {
            syncSharedStateFromCloud({ source: "polling-fallback" });
          }
        }, 600000);
        egressDiag("polling criado", { intervalMs: 600000 });
      }

      function stopSharedSync(options = {}) {
        if (syncTimer) {
          clearInterval(syncTimer);
          syncTimer = null;
          egressDiag("polling limpo");
        }
        unsubscribeRealtime();
        if (!options.keepLeadership) stopSyncLeaderHeartbeat();
        if (options.releaseLeadership !== false) releaseSyncLeadership();
      }

      function subscribeRealtime() {
        if (!supabaseClient || !currentUser) return;
        if (realtimeChannel) {
          egressDiag("subscribeRealtime removeu canal antigo antes de criar novo");
          unsubscribeRealtime();
        }
        egressDiag("realtime criado", {
          table: "shared_states",
          filter: `id=eq.${SHARED_STATE_ID}`
        });
        realtimeChannel = supabaseClient
          .channel("sst-shared-team")
          .on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "shared_states",
            filter: `id=eq.${SHARED_STATE_ID}`
          }, payload => {
            if (!payload.new || payload.eventType === "DELETE") return;
            applyRemoteSharedState(payload.new).catch(error => console.warn("Falha ao aplicar atualização em tempo real:", error));
          })
          .on("presence", { event: "sync" }, () => {
            updateOnlineUsersFromPresence();
          })
          .subscribe(status => {
            if (status === "SUBSCRIBED" && currentUser && realtimeChannel) {
              egressDiag("Presence track enviado", { user_id: currentUser.id });
              realtimeChannel.track({
                user_id: currentUser.id
              }).catch(error => console.warn("Falha ao registrar presença online:", error));
            }
            if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
              console.warn("Realtime indisponível:", status);
            }
          });
      }

      function unsubscribeRealtime() {
        if (realtimeChannel && supabaseClient) {
          egressDiag("realtime removido");
          realtimeChannel.untrack().catch(error => console.warn("Falha ao remover presença online:", error));
          supabaseClient.removeChannel(realtimeChannel);
        }
        realtimeChannel = null;
        onlineUserIds = new Set();
        if (!isCurrentSyncLeader()) applyPresenceCacheFromAnotherTab();
        if (app.view === "profiles") renderProfiles();
      }

      function updateOnlineUsersFromPresence() {
        if (!realtimeChannel) return;
        const state = realtimeChannel.presenceState();
        onlineUserIds = new Set(Object.values(state)
          .flat()
          .map(presence => presence.user_id)
          .filter(Boolean));
        writePresenceCache();
        if (app.view === "profiles") renderProfiles();
      }

      async function syncSharedStateFromCloud(options = {}) {
        egressDiag("syncSharedStateFromCloud chamada", {
          source: options.source || "unknown",
          force: !!options.force,
          allowWhileEditing: !!options.allowWhileEditing,
          caller: egressDiagCaller()
        });
        if (!supabaseClient || !currentUser || !cloudReady || isSavingCloud) {
          egressDiag("syncSharedStateFromCloud ignorada por guarda", {
            hasClient: !!supabaseClient,
            hasUser: !!currentUser,
            cloudReady,
            isSavingCloud
          });
          return;
        }
        if (!ensureSyncLeader({
          reason: options.source || "syncSharedStateFromCloud",
          steal: !!options.force && document.visibilityState === "visible"
        })) {
          egressDiag("syncSharedStateFromCloud ignorada por aba secundaria", { source: options.source || "unknown" });
          stopSharedSync({ releaseLeadership: false });
          return;
        }
        if (!options.force && hasRecentLocalActivity()) {
          egressDiag("syncSharedStateFromCloud ignorada por atividade local recente", { source: options.source || "unknown" });
          return;
        }
        if (!options.allowWhileEditing && isUserEditing()) {
          egressDiag("syncSharedStateFromCloud ignorada por edição ativa", { source: options.source || "unknown" });
          return;
        }
        const remoteUpdatedAt = await fetchSharedStateUpdatedAt({ source: options.source || "syncSharedStateFromCloud" });
        if (!remoteUpdatedAt || remoteUpdatedAt === lastSharedUpdatedAt) {
          egressDiag("syncSharedStateFromCloud não baixou data", {
            remoteUpdatedAt,
            lastSharedUpdatedAt
          });
          return;
        }
        egressDiag("syncSharedStateFromCloud baixando data completo", {
          remoteUpdatedAt,
          lastSharedUpdatedAt
        });
        const row = await fetchSharedStateFull({ source: options.source || "syncSharedStateFromCloud" });
        if (!row || !row.data) return;
        await applyRemoteSharedState(row, options);
      }

      async function fetchSharedStateUpdatedAt(options = {}) {
        egressDiag("shared_states select updated_at", { source: options.source || "unknown" });
        const { data, error } = await supabaseClient
          .from("shared_states")
          .select("updated_at")
          .eq("id", SHARED_STATE_ID)
          .maybeSingle();
        if (error) {
          egressDiag("shared_states select updated_at erro", { source: options.source || "unknown", message: error.message });
          if (options.throwOnError) throw error;
          return "";
        }
        if (!data) return "";
        return data.updated_at || "";
      }

      async function fetchSharedStateFull(options = {}) {
        egressDiag("shared_states select data, updated_at", { source: options.source || "unknown" });
        const { data, error } = await supabaseClient
          .from("shared_states")
          .select("data, updated_at")
          .eq("id", SHARED_STATE_ID)
          .maybeSingle();
        if (error) {
          egressDiag("shared_states select data erro", { source: options.source || "unknown", message: error.message });
          if (options.throwOnError) throw error;
          return null;
        }
        if (!data) return null;
        return data;
      }

      async function applyRemoteSharedState(row, options = {}) {
        if (!row || !row.data) return;
        if (row.updated_at && row.updated_at === lastSharedUpdatedAt) return;
        if (!options.force && hasRecentLocalActivity()) return;
        if (!options.allowWhileEditing && isUserEditing()) return;
        app = restoreLocalNavigation(normalizeApp(row.data), captureLocalNavigation());
        lastSharedUpdatedAt = row.updated_at || "";
        writeLocalSharedCache(app, lastSharedUpdatedAt);
        selectedActions.clear();
        renderApp();
        if (app.view === "editor") markSaved();
      }

      function sharedAppData(source = app) {
        const data = normalizeApp(JSON.parse(JSON.stringify(source)));
        data.view = "profiles";
        data.activeProfileId = null;
        data.activeFolderId = DEFAULT_FOLDER_ID;
        data.activePlanId = null;
        return data;
      }

      function captureLocalNavigation() {
        return {
          view: app.view || "profiles",
          activeProfileId: app.activeProfileId || null,
          activeFolderId: app.activeFolderId || DEFAULT_FOLDER_ID,
          activePlanId: app.activePlanId || null
        };
      }

      function restoreLocalNavigation(nextApp, nav) {
        const restored = normalizeApp(nextApp);
        const profile = restored.profiles.find(item => item.id === nav.activeProfileId);
        if (!profile) {
          restored.view = "profiles";
          restored.activeProfileId = null;
          restored.activeFolderId = DEFAULT_FOLDER_ID;
          restored.activePlanId = null;
          return restored;
        }

        restored.activeProfileId = profile.id;
        const folderExists = profile.folders.some(folder => folder.id === nav.activeFolderId);
        restored.activeFolderId = folderExists ? nav.activeFolderId : DEFAULT_FOLDER_ID;

        if (nav.view === "editor") {
          const plan = profile.plans.find(item => item.id === nav.activePlanId);
          if (plan) {
            restored.view = "editor";
            restored.activePlanId = plan.id;
            return restored;
          }
          restored.view = "folders";
          restored.activePlanId = null;
          return restored;
        }

        restored.view = nav.view === "folders" ? "folders" : "profiles";
        restored.activePlanId = null;
        return restored;
      }

      function hasRecentLocalActivity() {
        const now = Date.now();
        return hasPendingCloudChanges()
          || !!saveTimer
          || isSavingCloud
          || now - lastLocalChangeAt < 2500
          || now - lastCloudSaveAt < 2500;
      }

      function isUserEditing() {
        const active = document.activeElement;
        if (!active) return false;
        return !!active.closest && !!active.closest("input, select, textarea, [contenteditable='true'], .modal");
      }

      function markSaved() {
        els.saveStatus.textContent = "Sincronizado às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      }

      function openModal(id) {
        document.getElementById(id).classList.remove("hidden");
      }

      function closeModal(id) {
        document.getElementById(id).classList.add("hidden");
      }

      function renderColorPalette(container, colors, selected, onSelect) {
        container.innerHTML = "";
        colors.forEach(color => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "palette-dot" + (color === selected ? " is-selected" : "");
          button.style.background = color;
          button.setAttribute("aria-label", `Selecionar cor ${color}`);
          button.addEventListener("click", () => onSelect(color));
          container.appendChild(button);
        });
      }

      function handleProfileColorSelect(color) {
        selectedProfileColor = color;
        renderColorPalette(els.profileColorPalette, AVATAR_COLORS, selectedProfileColor, handleProfileColorSelect);
      }

      function handleFolderColorSelect(color) {
        selectedFolderColor = color;
        renderColorPalette(els.folderColorPalette, FOLDER_COLORS, selectedFolderColor, handleFolderColorSelect);
      }

      function avatarHtml(profile, size) {
        const cls = size === "small" ? "avatar small" : "avatar";
        if (profile.avatarPhoto) return `<span class="${cls}"><img src="${escapeAttr(profile.avatarPhoto)}" alt=""></span>`;
        return `<span class="${cls}" style="background:${escapeAttr(profile.avatarColor || pickColor(profile.name))}">${escapeHtml(initials(profile.name))}</span>`;
      }

      function initials(name) {
        const parts = String(name || "ST").trim().split(/\s+/).filter(Boolean);
        if (!parts.length) return "ST";
        return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
      }

      function pickColor(seed) {
        const text = String(seed || "");
        let hash = 0;
        for (let i = 0; i < text.length; i += 1) hash = (hash + text.charCodeAt(i) * (i + 1)) % AVATAR_COLORS.length;
        return AVATAR_COLORS[hash];
      }

      function updateProgressControl(control, value) {
        if (!control) return;
        const fill = control.querySelector(".progress-fill");
        const progress = clampProgress(value);
        fill.style.width = progress + "%";
        fill.style.background = progressColor(progress);
      }

      function setText(id, value) {
        document.getElementById(id).textContent = value;
      }

      function pct(value, total) {
        return total ? Math.round((value / total) * 100) + "%" : "0%";
      }

      function normalizeStatus(value) {
        return STATUSES.includes(value) ? value : "Não iniciado";
      }

      function normalizePriority(value) {
        return PRIORITIES.includes(value) ? value : "Média";
      }

      function clampProgress(value) {
        const number = Number.parseInt(value, 10);
        if (Number.isNaN(number)) return 0;
        return Math.max(0, Math.min(100, number));
      }

      function progressColor(value) {
        const progress = clampProgress(value);
        if (progress === 100) return "#22c55e";
        if (progress >= 71) return "#3b82f6";
        if (progress >= 31) return "#f59e0b";
        return "#ef4444";
      }

      function priorityClass(value) {
        return { Alta: "priority-alta", Média: "priority-media", Baixa: "priority-baixa" }[value] || "";
      }

      function statusClass(value) {
        return {
          "Não iniciado": "status-nao-iniciado",
          "Em andamento": "status-em-andamento",
          "Concluído": "status-concluido",
          "Cancelado": "status-cancelado"
        }[value] || "";
      }

      function formatDateForMeta(date) {
        return date.toLocaleDateString("pt-BR") + " - Rev. 00";
      }

      function formatDateFromInput(value) {
        if (!value) return "";
        const [year, month, day] = value.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString("pt-BR");
      }

      function formatDateTime(value) {
        if (!value) return "sem registro";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "sem registro";
        return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
      }

      function normalizeText(value) {
        return String(value || "")
          .toLocaleLowerCase("pt-BR")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
      }

      function richFromAny(value) {
        const text = String(value || "");
        if (!text) return "";
        return /<[a-z][\s\S]*>/i.test(text) ? sanitizeRichHtml(text) : plainToRich(text);
      }

      function plainToRich(value) {
        return escapeHtml(value || "").replace(/\n/g, "<br>");
      }

      function sanitizeRichHtml(html) {
        const template = document.createElement("template");
        template.innerHTML = String(html || "");
        template.content.querySelectorAll("script, style, iframe, object, embed").forEach(node => node.remove());
        template.content.querySelectorAll("*").forEach(node => {
          [...node.attributes].forEach(attr => {
            const name = attr.name.toLowerCase();
            if (name.startsWith("on")) node.removeAttribute(attr.name);
            if ((name === "src" || name === "href") && /^\s*javascript:/i.test(attr.value)) node.removeAttribute(attr.name);
            if (node.tagName.toLowerCase() === "img" && name === "src" && !/^data:image\//i.test(attr.value)) node.removeAttribute(attr.name);
          });
        });
        return template.innerHTML;
      }

      function stripHtml(html) {
        const div = document.createElement("div");
        div.innerHTML = String(html || "");
        return div.textContent || div.innerText || "";
      }

      function selectElementText(element) {
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }

      function readFileAsDataUrl(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      function compressImageFileToDataUrl(file, options = {}) {
        return new Promise((resolve, reject) => {
          if (!file || !file.type.startsWith("image/")) {
            reject(new Error("Arquivo inválido"));
            return;
          }
          const reader = new FileReader();
          reader.onload = () => compressImageSourceToDataUrl(reader.result, options).then(resolve).catch(reject);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      function compressImageSourceToDataUrl(src, options = {}) {
        const maxWidth = options.maxWidth || 900;
        const quality = options.quality || 0.65;
        return new Promise((resolve, reject) => {
          if (!/^data:image\//i.test(String(src || ""))) {
            reject(new Error("Imagem inválida"));
            return;
          }
          const image = new Image();
          image.onload = () => {
            const ratio = image.naturalWidth > maxWidth ? maxWidth / image.naturalWidth : 1;
            const width = Math.max(1, Math.round(image.naturalWidth * ratio));
            const height = Math.max(1, Math.round(image.naturalHeight * ratio));
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext("2d");
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, width, height);
            context.drawImage(image, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", quality));
          };
          image.onerror = () => reject(new Error("Imagem inválida"));
          image.src = src;
        });
      }

      function compressRichEditorImages(editor) {
        const images = [...editor.querySelectorAll("img")]
          .filter(image => /^data:image\//i.test(image.getAttribute("src") || image.src || ""))
          .filter(image => image.dataset.sstCompressed !== "true");
        if (!images.length) return Promise.resolve();
        return Promise.all(images.map(image => {
          if (!image.__sstCompressPromise) {
            image.__sstCompressPromise = compressImageSourceToDataUrl(image.src, { maxWidth: 900, quality: 0.65 })
              .then(dataUrl => {
                image.src = dataUrl;
                image.dataset.sstCompressed = "true";
              })
              .catch(error => {
                console.error(error);
                image.removeAttribute("src");
                image.dataset.sstCompressed = "true";
              })
              .finally(() => {
                delete image.__sstCompressPromise;
              });
          }
          return image.__sstCompressPromise;
        })).then(() => undefined);
      }

      function deepClone(value) {
        return JSON.parse(JSON.stringify(value));
      }

      function createId() {
        if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
        return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
      }

      function escapeHtml(value) {
        return String(value == null ? "" : value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }

      function escapeAttr(value) {
        return escapeHtml(value).replace(/`/g, "&#096;");
      }

      function exposeSatsRuntime() {
        Object.assign(window.SATS.core, {
          version: APP_VERSION,
          get app() { return app; },
          get currentUser() { return currentUser; },
          get selectedPortalApp() { return selectedPortalApp; },
          renderApp,
          handleAppChoice,
          showAppSelector,
          logout
        });

        Object.assign(window.SATS.storage, {
          saveApp,
          loadAppFromCloud,
          sharedAppData,
          normalizeApp,
          createEmptyApp
        });

        Object.assign(window.SATS.ui, {
          showToast,
          openModal,
          closeModal,
          managementConfirm,
          escapeHtml,
          escapeAttr
        });

        Object.assign(window.SATS.permissions, {
          normalizeEmail,
          canAccessDocumentAutomation,
          canAccessManagementPhase1,
          isFullSystemAdmin,
          isSystemAdminUser,
          canManageSuggestions,
          canManagePermissions,
          canManageActionPlanTemplates,
          canManageProcedures,
          canManageSystemSettings
        });

        window.SATS.router.openModule = function openModule(moduleName) {
          const map = {
            planAction: "plans",
            procedures: "procedures",
            management: "management",
            documentAutomation: "documentAutomation"
          };
          const appChoice = map[moduleName] || moduleName;
          selectedPortalApp = appChoice === "plan-action" ? "plans" : appChoice;
          renderApp();
        };
        window.SATS.router.showAppSelector = showAppSelector;

        window.SATS.modules.planAction = Object.assign(window.SATS.modules.planAction || {}, {
          name: "Plano de Ação",
          init() {},
          open() { selectedPortalApp = "plans"; renderApp(); },
          close() {},
          render() { renderApp(); },
          save: saveApp,
          destroy() {}
        });

        window.SATS.modules.procedures = Object.assign(window.SATS.modules.procedures || {}, {
          name: "Procedimentos",
          init() {},
          open() { selectedPortalApp = "procedures"; renderApp(); },
          close() {},
          render() { loadProceduresFrame(); },
          save: saveManagementChanges,
          destroy() {}
        });

        window.SATS.modules.management = Object.assign(window.SATS.modules.management || {}, {
          name: "Gestão SATS",
          init() {},
          open() { selectedPortalApp = "management"; renderApp(); },
          close() {},
          render: renderManagement,
          save: saveManagementChanges,
          destroy() {}
        });

        window.SATS.modules.documentAutomation = Object.assign(window.SATS.modules.documentAutomation || {}, {
          name: "Automação de Documentos",
          init() {},
          open() { selectedPortalApp = "documentAutomation"; renderApp(); },
          close() {},
          render: renderDocumentAutomation,
          save() {
            const project = getActiveDocumentAutomationProject();
            return saveDocumentAutomationProject(project);
          },
          destroy() {}
        });
      }

      exposeSatsRuntime();
    })();
