(function (root, factory) {
  "use strict";
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.SATS = root.SATS || {};
  root.SATS.ltcat = Object.assign(root.SATS.ltcat || {}, api);
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  "use strict";

  /**
   * @typedef {Object} HierarchyRow
   * @property {string} setor
   * @property {string} cargo
   * @property {number|string} funcionarios
   */

  /**
   * @typedef {Object} HierarchyData
   * @property {string} unidadeNome
   * @property {string} empresaNome
   * @property {string} cnpj
   * @property {string} endereco
   * @property {string} cep
   * @property {string} cnae
   * @property {string} grauDeRisco
   * @property {string} dimensionamentoCipa
   * @property {number} totalFuncionarios
   * @property {number} homens
   * @property {number} mulheres
   * @property {HierarchyRow[]} hierarquia
   * @property {Object} debug
   */

  /**
   * @typedef {Object} RiskCoreData
   * @property {boolean} success
   * @property {string} riscoBlocoBruto
   * @property {Array<{title:string,rawText:string,order:number}>} sectorBlocks
   * @property {string[]} setores
   * @property {string|null} sintese
   * @property {boolean} startsBeforeSintese
   * @property {boolean} containsSintese
   * @property {string[]} warnings
   * @property {Object} debug
   */

  /**
   * @typedef {Object} SocExtractedData
   * @property {string} unidadeNome
   * @property {string} empresaNome
   * @property {string} cnpj
   * @property {string} endereco
   * @property {string} cep
   * @property {string} cnae
   * @property {string} grauDeRisco
   * @property {string} dimensionamentoCipa
   * @property {number} totalFuncionarios
   * @property {number} homens
   * @property {number} mulheres
   * @property {HierarchyRow[]} hierarquia
   * @property {string} riscoBlocoBruto
   * @property {string[]} setores
   * @property {string|null} sintese
   * @property {string} responsavelTecnicoSoc
   */

  const LTCAT_MAIL_MERGE_MAP = {
    cover: {
      source: "logo enviada + dados manuais (empresa, unidade, responsavel, cidade, mes/ano)",
      target: "capa do LTCAT, preservando o layout do modelo"
    },
    companyIdentification: {
      source: "SocExtractedData ou correcao manual do cartao CNPJ",
      target: "1. IDENTIFICACAO DA EMPRESA"
    },
    hierarchy: {
      source: "extractLtcatHierarchyFromSoc(text)",
      target: "pagina de hierarquia"
    },
    riskCore: {
      source: "extractLtcatRiskCoreFromSoc(text)",
      target: "ENQUADRAMENTO PREVIDENCIARIO"
    },
    conclusion: {
      source: "texto fixo do modelo, substituindo apenas o nome da empresa",
      target: "CONCLUSAO GERAL"
    }
  };

  function decodeRtfBuffer(bytes) {
    if (typeof TextDecoder === "undefined") return String(bytes || "");
    const input = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    try {
      return new TextDecoder("windows-1252").decode(input);
    } catch (error) {
      return new TextDecoder("utf-8").decode(input);
    }
  }

  function parseSocRtfToText(fileText = "") {
    let text = String(fileText || "");
    if (!/[{}\\][a-z0-9*'-]+/i.test(text)) return normalizeSocText(text);
    text = stripRtfBinaryPayloads(text);
    text = removeRtfDestinationGroups(text);
    text = text.replace(/\\'[0-9a-fA-F]{2}/g, match => {
      const byte = parseInt(match.slice(2), 16);
      if (typeof TextDecoder !== "undefined") {
        try {
          return new TextDecoder("windows-1252").decode(new Uint8Array([byte]));
        } catch (error) {
          return String.fromCharCode(byte);
        }
      }
      return String.fromCharCode(byte);
    });
    text = text
      .replace(/\\u(-?\d+)(?: ?(?![\\{}]).)?/g, (_, code) => {
        const value = Number(code);
        return Number.isFinite(value) ? String.fromCharCode(value < 0 ? value + 65536 : value) : "";
      })
      .replace(/\\cellx\d+/g, "")
      .replace(/\\tx\d+/g, "")
      .replace(/\\pard\b/g, "")
      .replace(/\\par\b/g, "\n")
      .replace(/\\line/g, "\n")
      .replace(/\\tab/g, "\t")
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
    return repairMojibake(String(text || ""))
      .replace(/\r\n?/g, "\n")
      .replace(/\u00a0/g, " ")
      .replace(/\u0000/g, "")
      .replace(/\bx(?=(?:\d{4}-\d\/\d{2}|\d{2}\.\d{2}-\d-\d{2}))/g, "")
      .replace(/\bx\d{5,}(?=[A-Za-zÀ-ÿ])/g, "")
      .replace(/\bx\d{5,}\b/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/[ \t]{2,}/g, "\t")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function normalizeText(value = "") {
    return repairMojibake(String(value || ""))
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function repairMojibake(value = "") {
    let text = String(value || "");
    if (/[À-ÖØ-öø-ÿ]/.test(text.replace(/[ÃÂ]/g, ""))) return text.replace(/\u00c2/g, "");
    for (let attempt = 0; attempt < 2 && /[ÃÂ]/.test(text); attempt += 1) {
      try {
        const bytes = new Uint8Array(Array.from(text, char => char.charCodeAt(0) & 0xff));
        const decoded = new TextDecoder("utf-8").decode(bytes);
        if (!decoded || decoded === text) break;
        if ((decoded.match(/[ÃÂ]/g) || []).length > (text.match(/[ÃÂ]/g) || []).length) break;
        text = decoded;
      } catch (error) {
        break;
      }
    }
    return text.replace(/\u00c2/g, "");
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

  function getNextNonEmptyLines(lines, index, limit = 4) {
    const values = [];
    for (let cursor = index + 1; cursor < lines.length && values.length < limit; cursor += 1) {
      const value = String(lines[cursor] || "").trim();
      if (value) values.push(value);
    }
    return values;
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

  function isRealRiskSectorStart(lines, index) {
    const line = String(lines[index] || "").trim();
    const match = line.match(/^\s*SETOR\b\s*:?\s*(.*)$/i);
    if (!match) return false;
    if (isHierarchyHeaderSectorLine(lines, index)) return false;
    const inlineTitle = String(match[1] || "").trim();
    if (inlineTitle) {
      const normalizedInline = normalizeText(inlineTitle);
      if (/^(cargo|funcionario|funcionarios|funcao|quantidade)\b/.test(normalizedInline)) return false;
      if (hasRecentStandaloneSetor(lines, index)) return false;
      return true;
    }
    const next = getNextNonEmptyLines(lines, index, 4);
    if (!next.length) return false;
    const first = normalizeText(next[0]);
    if (/^(cargo|funcionario|funcionarios|funcao|quantidade)$/.test(first)) return false;
    if (/^setor\b/.test(first)) return false;
    return true;
  }

  function findFirstRealRiskSectorAfter(lines, startIndex = 0) {
    return findLineIndex(lines, (_line, index) => isRealRiskSectorStart(lines, index), startIndex);
  }

  function extractLtcatHierarchyFromSoc(text = "") {
    const normalized = normalizeSocText(text);
    const lines = normalized.split("\n");
    const unidadeIndex = findLineIndex(lines, line => /\bunidade\b/i.test(normalizeText(line)));
    const searchStart = unidadeIndex >= 0 ? unidadeIndex + 1 : 0;
    const firstRiskSetorIndex = findFirstRealRiskSectorAfter(lines, searchStart);
    const endIndex = firstRiskSetorIndex >= 0 ? firstRiskSetorIndex : lines.length;
    const hierarchyLines = lines.slice(searchStart, endIndex);
    const hierarchyText = hierarchyLines.join("\n");
    const headerIndexRelative = findLineIndex(hierarchyLines, (_line, index) => isHierarchyHeaderSectorLine(hierarchyLines, index));
    const hierarchyRows = extractLtcatHierarchyTable(hierarchyLines, headerIndexRelative);
    const employeeSummary = extractLtcatEmployeeSummary(hierarchyText || normalized);
    const cipa = extractLtcatCipaData(hierarchyText || normalized);
    const cnpj = extractLtcatCnpj(hierarchyText) || extractLtcatCnpj(normalized);
    const cep = extractLtcatCep(hierarchyText) || extractLtcatCep(normalized);
    const endereco = extractLtcatAddress(hierarchyText) || extractLtcatAddress(normalized);
    const cnae = extractLtcatCnae(hierarchyText) || extractLtcatCnae(normalized);
    const grauDeRisco = extractLtcatRiskGrade(hierarchyText) || extractLtcatRiskGrade(normalized);
    const unidadeNome = extractLtcatUnitName(lines, unidadeIndex, endIndex);
    const empresaNome = extractLtcatCompanyName(hierarchyLines, cnpj) || unidadeNome;
    return {
      unidadeNome,
      empresaNome,
      cnpj,
      endereco,
      cep,
      cnae,
      grauDeRisco,
      dimensionamentoCipa: cipa.rawText,
      totalFuncionarios: employeeSummary.total,
      homens: employeeSummary.homens,
      mulheres: employeeSummary.mulheres,
      hierarquia: hierarchyRows,
      debug: {
        unidadeIndex,
        hierarchyHeaderIndex: headerIndexRelative >= 0 ? searchStart + headerIndexRelative : -1,
        firstRiskSetorIndex,
        rows: hierarchyRows.length
      }
    };
  }

  function extractLtcatRiskCoreFromSoc(text = "") {
    const normalized = normalizeSocText(text);
    const lines = normalized.split("\n");
    const warnings = [];
    const unidadeIndex = findLineIndex(lines, line => /\bunidade\b/i.test(normalizeText(line)));
    const headerIndex = findLineIndex(lines, (_line, index) => isHierarchyHeaderSectorLine(lines, index), unidadeIndex >= 0 ? unidadeIndex + 1 : 0);
    const startIndex = findFirstRealRiskSectorAfter(lines, unidadeIndex >= 0 ? unidadeIndex + 1 : 0);
    if (startIndex < 0) {
      return {
        success: false,
        error: headerIndex >= 0
          ? "Foi encontrada a tabela de hierarquia, mas nenhum SETOR real de riscos foi localizado depois dela."
          : "Nenhum SETOR real foi encontrado apos UNIDADE.",
        riscoBlocoBruto: "",
        sectorBlocks: [],
        setores: [],
        sintese: null,
        startsBeforeSintese: false,
        containsSintese: false,
        warnings,
        debug: { unidadeIndex, headerIndex, startIndex: -1, sinteseIndex: -1, sectorCount: 0 }
      };
    }

    let sinteseIndex = findLineIndexAfter(lines, startIndex + 1, line => /^\s*sintese\b/i.test(normalizeText(line)));
    let endIndex = sinteseIndex;
    if (sinteseIndex <= startIndex) {
      endIndex = findLineIndexAfter(lines, startIndex + 1, line => /^(conclusao|assinatura|anexos|termo)\b/i.test(normalizeText(line)));
      if (endIndex < 0) endIndex = lines.length;
      sinteseIndex = -1;
      warnings.push("Sintese nao encontrada. Extracao feita ate o fim possivel do documento.");
    }
    const rawLines = lines.slice(startIndex, endIndex);
    const riscoBlocoBruto = rawLines.join("\n").trim();
    const sectorBlocks = splitRawRiskCoreByRealSetor(rawLines);
    const sintese = sinteseIndex >= 0 ? lines.slice(sinteseIndex).join("\n").trim() : null;
    return {
      success: sectorBlocks.length > 0,
      error: sectorBlocks.length ? "" : "Nenhum bloco iniciado por SETOR foi encontrado apos UNIDADE.",
      riscoBlocoBruto,
      sectorBlocks,
      setores: sectorBlocks.map(block => block.title).filter(Boolean),
      sintese,
      startsBeforeSintese: sinteseIndex < 0 || startIndex < sinteseIndex,
      containsSintese: /\bsintese\b/i.test(normalizeText(riscoBlocoBruto)),
      warnings,
      debug: {
        unidadeIndex,
        headerIndex,
        startIndex,
        sinteseIndex,
        endIndex,
        sectorCount: sectorBlocks.length,
        sectorNames: sectorBlocks.map(block => block.title).filter(Boolean),
        ignoredHierarchyHeader: headerIndex >= 0 && headerIndex < startIndex,
        first300Chars: riscoBlocoBruto.slice(0, 300),
        last300Chars: riscoBlocoBruto.slice(-300)
      }
    };
  }

  function extractSocExtractedData(text = "") {
    const hierarchy = extractLtcatHierarchyFromSoc(text);
    const riskCore = extractLtcatRiskCoreFromSoc(text);
    return {
      unidadeNome: hierarchy.unidadeNome,
      empresaNome: hierarchy.empresaNome,
      cnpj: hierarchy.cnpj,
      endereco: hierarchy.endereco,
      cep: hierarchy.cep,
      cnae: hierarchy.cnae,
      grauDeRisco: hierarchy.grauDeRisco,
      dimensionamentoCipa: hierarchy.dimensionamentoCipa,
      totalFuncionarios: hierarchy.totalFuncionarios,
      homens: hierarchy.homens,
      mulheres: hierarchy.mulheres,
      hierarquia: hierarchy.hierarquia,
      riscoBlocoBruto: riskCore.riscoBlocoBruto,
      setores: riskCore.setores,
      sintese: riskCore.sintese,
      responsavelTecnicoSoc: extractByAnyLabel(text, ["Responsavel Tecnico", "Responsavel pela elaboracao", "Elaborado por"]),
      hierarchyDebug: hierarchy.debug,
      riskDebug: riskCore.debug,
      warnings: riskCore.warnings
    };
  }

  function splitRawRiskCoreByRealSetor(lines) {
    const sourceLines = Array.isArray(lines) ? lines : String(lines || "").split("\n");
    const starts = [];
    for (let index = 0; index < sourceLines.length; index += 1) {
      if (isRealRiskSectorStart(sourceLines, index)) starts.push(index);
    }
    return starts.map((start, sectorIndex) => {
      const end = starts[sectorIndex + 1] == null ? sourceLines.length : starts[sectorIndex + 1];
      const rawText = sourceLines.slice(start, end).join("\n").trim();
      return {
        title: extractLtcatSectorTitleFromBlock(rawText, sectorIndex),
        rawText,
        order: sectorIndex + 1
      };
    });
  }

  function extractLtcatSectorTitleFromBlock(rawText = "", index = 0) {
    const lines = String(rawText || "").split(/\n+/).map(line => line.trim()).filter(Boolean);
    const first = lines[0] || "";
    const inlineTitle = first.replace(/^setor\s*:?\s*/i, "").trim();
    if (inlineTitle && normalizeText(inlineTitle) !== "setor") return inlineTitle;
    const title = (lines[1] || "").trim();
    if (title && !/^(cargo|funcao|gfip|descricao)\b/i.test(normalizeText(title))) return title;
    return `Setor ${index + 1}`;
  }

  function extractLtcatHierarchyTable(lines = [], headerIndex = -1) {
    const rows = [];
    if (headerIndex < 0) return rows;
    let currentSetor = "";
    for (let index = headerIndex + 1; index < lines.length; index += 1) {
      const line = String(lines[index] || "").trim();
      if (!line || /^[-.]$/.test(line)) continue;
      if (isRealRiskSectorStart(lines, index)) break;
      if (/dimensionamento|caracterizacao|caracterização|funcionarios|funcionários/i.test(line) && rows.length) break;
      const parts = splitSocColumns(line);
      if (!parts.length || /^(setor|cargo|funcionarios?)$/i.test(normalizeText(parts[0]))) continue;
      if (parts.length >= 3) {
        const row = { setor: parts[0], cargo: parts[1], funcionarios: parseEmployeeCount(parts[2]) };
        if (isUsableHierarchyRow(row)) {
          currentSetor = row.setor || currentSetor;
          rows.push(row);
        }
      } else if (parts.length === 2 && currentSetor) {
        const row = { setor: currentSetor, cargo: parts[0], funcionarios: parseEmployeeCount(parts[1]) };
        if (isUsableHierarchyRow(row)) rows.push(row);
      }
    }
    if (rows.length) return rows;
    const cells = lines.slice(headerIndex + 3).map(line => line.trim()).filter(Boolean);
    for (let index = 0; index < cells.length - 2; index += 3) {
      const row = { setor: cells[index], cargo: cells[index + 1], funcionarios: parseEmployeeCount(cells[index + 2]) };
      if (isUsableHierarchyRow(row)) rows.push(row);
    }
    return rows;
  }

  function isUsableHierarchyRow(row) {
    return Boolean(row && row.setor && row.cargo && String(row.funcionarios || "").trim() && !/^(setor|cargo|funcionarios?)$/i.test(normalizeText(row.setor)));
  }

  function splitSocColumns(line = "") {
    const source = String(line || "").replace(/\u00a0/g, " ").trim();
    if (!source) return [];
    const byTab = source.split(/\t+/).map(value => value.trim()).filter(Boolean);
    if (byTab.length > 1) return byTab;
    const bySpaces = source.split(/\s{2,}/).map(value => value.trim()).filter(Boolean);
    return bySpaces.length > 1 ? bySpaces : [source];
  }

  function parseEmployeeCount(value = "") {
    const match = String(value || "").match(/\d+/);
    return match ? Number(match[0]) : String(value || "").trim();
  }

  function extractLtcatCnpj(text = "") {
    const compact = String(text || "").replace(/\s+/g, " ");
    const formatted = compact.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/);
    if (formatted) return formatted[0];
    const loose = compact.match(/\b(\d{2})\D{0,2}(\d{3})\D{0,2}(\d{3})\D{0,2}(\d{4})\D{0,2}(\d{2})\b/);
    return loose ? `${loose[1]}.${loose[2]}.${loose[3]}/${loose[4]}-${loose[5]}` : "";
  }

  function extractLtcatCep(text = "") {
    const match = String(text || "").replace(/\s+/g, " ").match(/\b\d{5}-?\d{3}\b/);
    if (!match) return "";
    return match[0].replace(/^(\d{5})(\d{3})$/, "$1-$2");
  }

  function extractLtcatCnae(text = "") {
    const lines = normalizeSocText(text).split("\n").map(line => line.trim()).filter(Boolean);
    const direct = lines.find(line => /\b\d{4}-\d\/\d{2}\s*-\s*\S/.test(line));
    if (direct) return direct.trim();
    for (let index = 0; index < lines.length; index += 1) {
      const normalized = normalizeText(lines[index]);
      if (!/(^|\b)(cnae|codigo cnae|atividade economica|classificacao nacional de atividades economicas)\b/.test(normalized)) continue;
      const sameLine = lines[index].replace(/.*?(CNAE|Codigo CNAE|Atividade Economica|Classificacao Nacional de Atividades Economicas)\s*:?\s*/i, "").trim();
      const candidates = [sameLine, lines[index + 1], lines[index + 2], lines[index + 3]].filter(Boolean);
      const found = candidates.find(value => /\d{4}-\d\/\d{2}|\d{2}\.\d{2}-\d-\d{2}/.test(value));
      if (found) return found.replace(/^\s*[-:]\s*/, "").trim();
    }
    return "";
  }

  function extractLtcatRiskGrade(text = "") {
    const clean = normalizeSocText(text);
    const direct = clean.match(/grau\s+de\s+risco\s*:?\s*([1-4])/i);
    if (direct) return direct[1];
    const gr = clean.match(/\bGR\s*:?\s*([1-4])\b/i);
    return gr ? gr[1] : "";
  }

  function extractLtcatAddress(text = "") {
    const lines = normalizeSocText(text).split("\n").map(line => line.trim()).filter(Boolean);
    const labelIndex = findLineIndex(lines, line => /^endere[cç]o\b/i.test(line));
    if (labelIndex < 0) return extractByAnyLabel(text, ["Endereco", "Endereço", "Logradouro"]);
    const sameLine = lines[labelIndex].replace(/^endere[cç]o\s*:?\s*/i, "").trim();
    if (sameLine) return sameLine;
    const collected = [];
    for (let index = labelIndex + 1; index < Math.min(lines.length, labelIndex + 5); index += 1) {
      const line = lines[index];
      if (/^(cep|cnae|grau\s+de\s+risco|dimensionamento|caracteriza[cç][aã]o)\b/i.test(normalizeText(line))) break;
      collected.push(line);
    }
    return collected.join(" ").trim();
  }

  function extractLtcatUnitName(lines, unidadeIndex, endIndex) {
    if (unidadeIndex < 0) return "";
    for (let index = unidadeIndex + 1; index < Math.min(endIndex, unidadeIndex + 10); index += 1) {
      const candidate = String(lines[index] || "").trim();
      const normalized = normalizeText(candidate);
      if (!candidate || /^(cnpj|endereco|cep|cnae|grau de risco|empresa|razao social)$/.test(normalized)) continue;
      if (/^\d{2}\.\d{3}\.\d{3}/.test(candidate)) continue;
      return candidate;
    }
    return "";
  }

  function extractLtcatCompanyName(hierarchyLines = [], cnpj = "") {
    const cnpjIndex = hierarchyLines.findIndex(line => cnpj && line.includes(cnpj));
    const start = cnpjIndex >= 0 ? cnpjIndex - 1 : hierarchyLines.length - 1;
    for (let index = start; index >= 0 && index >= start - 8; index -= 1) {
      const candidate = String(hierarchyLines[index] || "").trim();
      const normalized = normalizeText(candidate);
      if (!candidate || /^(unidade|empresa|cnpj|endereco|cep|cnae|grau de risco|-|\.)$/.test(normalized)) continue;
      if (/^\d/.test(candidate)) continue;
      return candidate;
    }
    return extractByAnyLabel(hierarchyLines.join("\n"), ["Empresa", "Razao Social", "Razão Social"]);
  }

  function extractLtcatEmployeeSummary(text = "") {
    const clean = normalizeSocText(text);
    const line = clean.match(/(\d+)\s+Funcion[aá]rios?\s+(\d+)\s+homens?\s+(\d+)\s+mulheres?/i);
    if (line) return { total: Number(line[1]), homens: Number(line[2]), mulheres: Number(line[3]) };
    const total = clean.match(/Funcion[aá]rios?\s*:?\s*(\d+)/i) || clean.match(/(\d+)\s+Funcion[aá]rios?/i);
    const homens = clean.match(/(\d+)\s+homens?/i);
    const mulheres = clean.match(/(\d+)\s+mulheres?/i);
    return {
      total: total ? Number(total[1]) : 0,
      homens: homens ? Number(homens[1]) : 0,
      mulheres: mulheres ? Number(mulheres[1]) : 0
    };
  }

  function extractLtcatCipaData(text = "") {
    const lines = normalizeSocText(text).split("\n").map(line => line.trim());
    const start = findLineIndex(lines, line => /dimensionamento\s+cipa/i.test(normalizeText(line)));
    if (start < 0) return { rawText: "" };
    const collected = [];
    for (let index = start; index < Math.min(lines.length, start + 14); index += 1) {
      const line = lines[index];
      if (!line) continue;
      if (index > start && /caracterizacao|caracterização|funcionarios|funcionários/i.test(normalizeText(line))) break;
      collected.push(line);
    }
    return { rawText: collected.join("\n") };
  }

  function extractByAnyLabel(text = "", labels = []) {
    const normalizedText = normalizeSocText(text);
    for (const label of labels) {
      const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const match = normalizedText.match(new RegExp(`${escaped}\\s*[:\\-]?\\s*([^\\n\\t]{2,180})`, "i"));
      if (match) return match[1].trim().replace(/\s{2,}/g, " ");
    }
    return "";
  }

  function buildSelfContainedLtcatRiskRtf(riskCore) {
    const blocks = Array.isArray(riskCore?.sectorBlocks) && riskCore.sectorBlocks.length
      ? riskCore.sectorBlocks
      : splitRawRiskCoreByRealSetor(String(riskCore?.riscoBlocoBruto || "").split("\n"));
    if (!blocks.length) return "";
    const body = blocks.map(block => `\\page\n${rtfEscapeText(block.rawText)}`).join("\\par\n");
    return `{\\rtf1\\ansi\\ansicpg1252\\deff0{\\fonttbl{\\f0 Arial;}}\\viewkind4\\uc1\\pard\\f0\\fs20\n${body}\\par\n}`;
  }

  function rtfEscapeText(value = "") {
    let output = "";
    for (const char of String(value || "").replace(/\r\n?/g, "\n")) {
      if (char === "\n") {
        output += "\\par\n";
        continue;
      }
      if (char === "\t") {
        output += "\\tab ";
        continue;
      }
      if (char === "\\" || char === "{" || char === "}") {
        output += `\\${char}`;
        continue;
      }
      const code = char.charCodeAt(0);
      if (code <= 0x7f) output += char;
      else output += `\\u${code > 32767 ? code - 65536 : code}?`;
    }
    return output;
  }

  return {
    LTCAT_MAIL_MERGE_MAP,
    decodeRtfBuffer,
    parseSocRtfToText,
    normalizeSocText,
    normalizeText,
    extractLtcatHierarchyFromSoc,
    isRealRiskSectorStart,
    extractLtcatRiskCoreFromSoc,
    extractSocExtractedData,
    splitRawRiskCoreByRealSetor,
    extractLtcatCnpj,
    extractLtcatCnae,
    extractLtcatCep,
    extractLtcatRiskGrade,
    extractLtcatAddress,
    buildSelfContainedLtcatRiskRtf
  };
});
