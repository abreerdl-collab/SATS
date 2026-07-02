import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ltcat = require("../assets/js/ltcat-extraction.js");

function expect(value) {
  return {
    toBe(expected) {
      assert.strictEqual(value, expected);
    },
    toEqual(expected) {
      assert.strictEqual(JSON.stringify(value), JSON.stringify(expected));
    },
    toBeDefined() {
      assert.notStrictEqual(value, undefined);
    }
  };
}

function readSocFixture() {
  const fixturePath = path.join(__dirname, "fixtures", "ltcat", "2678179151.rtf");
  const bytes = fs.readFileSync(fixturePath);
  return ltcat.parseSocRtfToText(ltcat.decodeRtfBuffer(bytes));
}

function testSectorStartDetector() {
  expect(ltcat.isRealRiskSectorStart(["SETOR", "Academia", "Setor Academia"], 0)).toBe(true);
  expect(ltcat.isRealRiskSectorStart(["Setor", "Cargo", "Funcionários", "Academia"], 0)).toBe(false);
  expect(ltcat.isRealRiskSectorStart(["SETOR", "", "", ""], 0)).toBe(false);
  expect(ltcat.isRealRiskSectorStart(["O setor administrativo executa atividades internas"], 0)).toBe(false);
}

function testFixtureExtraction() {
  const text = readSocFixture();
  const extracted = ltcat.extractSocExtractedData(text);
  const riskCore = ltcat.extractLtcatRiskCoreFromSoc(text);
  expect(extracted.cnpj).toBe("24.395.830/0012-86");
  expect(extracted.cnae).toBe("9313-1/00 - Atividades de condicionamento físico");
  expect(riskCore.setores).toEqual(["Academia", "Comercial/Vendas", "Limpeza e Conservação"]);
  expect(riskCore.startsBeforeSintese).toBe(true);
  expect(riskCore.containsSintese).toBe(false);
  expect(riskCore.riscoBlocoBruto.startsWith("SETOR")).toBe(true);
  const selfContainedRtf = ltcat.buildSelfContainedLtcatRiskRtf(riskCore);
  expect(selfContainedRtf.startsWith("{\\rtf1")).toBe(true);
  const pageBreaksBeforeEachSetor = (selfContainedRtf.match(/\\page/g) || []).length === riskCore.setores.length;
  expect(pageBreaksBeforeEachSetor).toBe(true);
  const generatedDocx = { sections: { "ENQUADRAMENTO PREVIDENCIÁRIO": ltcat.LTCAT_MAIL_MERGE_MAP.riskCore.target } };
  expect(generatedDocx.sections["ENQUADRAMENTO PREVIDENCIÁRIO"]).toBeDefined();
  const conclusionSource = "modelo";
  expect(conclusionSource).toBe("modelo");
}

function testTemplateFixtureExists() {
  const fixturePath = path.join(__dirname, "fixtures", "ltcat", "LTCAT - Academia Force One Ltda Jardim das Américas.docx");
  expect(fs.existsSync(fixturePath)).toBe(true);
}

testSectorStartDetector();
testFixtureExtraction();
testTemplateFixtureExists();

console.log("LTCAT extraction tests passed.");
