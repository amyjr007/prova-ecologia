/**
 * Recebedor dos resultados da prova de Ecologia Básica — E.E. Feliz Lusitânia.
 *
 * Cada prova entregue vira uma linha na planilha E um e-mail para o professor.
 * O passo a passo de publicação está no README, na seção "Envio automático".
 *
 * Este arquivo é só uma cópia de referência guardada no repositório: quem roda
 * de verdade é a cópia colada no editor do Google Apps Script.
 */

/* ====================== o que você pode ajustar ====================== */

// Para onde vão os e-mails. Em branco = usa o e-mail da conta que publicou.
var EMAIL_PROFESSOR = "amaurisilvajunior21@gmail.com";

// false desliga o e-mail por aluno e mantém só a planilha.
var ENVIAR_EMAIL = true;

// Nome da aba criada na planilha.
var ABA = "Resultados";

/* ===================================================================== */

var CABECALHO = [
  "Recebido em", "Data da prova", "Aluno(a)", "Turma", "Turno",
  "Acertos", "Total", "Nota", "Versão", "Prova", "ID"
];

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return responder({ ok: false, erro: "requisição sem conteúdo" });
    }
    var r = JSON.parse(e.postData.contents);

    // O mesmo resultado pode chegar duas vezes se o Chromebook perder a rede
    // no meio do envio e tentar de novo. O ID descarta a repetição.
    if (jaRegistrado(r.id)) {
      return responder({ ok: true, repetido: true });
    }

    gravarNaPlanilha(r);
    if (ENVIAR_EMAIL) {
      enviarEmail(r);
    }
    return responder({ ok: true });
  } catch (erro) {
    return responder({ ok: false, erro: String(erro) });
  }
}

// Abrir a URL no navegador responde isto — serve para conferir a publicação.
function doGet() {
  return responder({ ok: true, servico: "recebedor de resultados no ar" });
}

function responder(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function aba() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var folha = planilha.getSheetByName(ABA);
  if (!folha) {
    folha = planilha.insertSheet(ABA);
  }
  if (folha.getLastRow() === 0) {
    folha.appendRow(CABECALHO);
    folha.getRange(1, 1, 1, CABECALHO.length).setFontWeight("bold");
    folha.setFrozenRows(1);
  }
  return folha;
}

function jaRegistrado(id) {
  if (!id) return false;
  var folha = aba();
  var ultima = folha.getLastRow();
  if (ultima < 2) return false;
  var coluna = CABECALHO.indexOf("ID") + 1;
  var ids = folha.getRange(2, coluna, ultima - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) return true;
  }
  return false;
}

function gravarNaPlanilha(r) {
  aba().appendRow([
    new Date(),
    r.data || "",
    r.nome || "",
    r.turma || "",
    r.turno || "",
    r.acertos,
    r.total,
    r.nota,
    r.versao || "",
    r.prova || "",
    r.id || ""
  ]);
}

function enviarEmail(r) {
  var para = EMAIL_PROFESSOR || Session.getEffectiveUser().getEmail();
  var nota = String(r.nota).replace(".", ",");

  var assunto = "[" + (r.prova || "Prova") + "] " +
                (r.nome || "sem nome") + " — " + (r.turma || "sem turma") +
                " — nota " + nota;

  var linhas = (r.respostas || []).map(function (q) {
    var marca = q.certo ? "✔" : "✘";
    var texto = "<p style=\"margin:.9rem 0 0\"><b>" + marca + " " + q.n + ")</b> " +
                escapar(q.questao) + "<br>" +
                "<span style=\"color:#555\">Resposta do aluno:</span> " + escapar(q.minha);
    if (!q.certo) {
      texto += "<br><span style=\"color:#555\">Gabarito:</span> " + escapar(q.gabarito);
    }
    return texto + "</p>";
  }).join("");

  var corpo =
    '<div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:640px">' +
      '<h2 style="margin:0 0 .2rem">' + escapar(r.nome || "") + "</h2>" +
      '<p style="margin:0;color:#555">' +
        escapar(r.turma || "") + (r.turno ? " · " + escapar(r.turno) : "") +
        " · " + escapar(r.data || "") +
      "</p>" +
      '<p style="font-size:2rem;font-weight:700;margin:1rem 0 .2rem">' + nota + " / 10,0</p>" +
      '<p style="margin:0;color:#555">' + r.acertos + " de " + r.total +
        " questões corretas · versão da prova " + escapar(r.versao || "") + "</p>" +
      '<hr style="margin:1.2rem 0;border:0;border-top:1px solid #ddd">' +
      '<h3 style="margin:0">Gabarito e respostas</h3>' +
      linhas +
      '<hr style="margin:1.2rem 0;border:0;border-top:1px solid #ddd">' +
      '<p style="font-size:.8rem;color:#777">' +
        "Enviado automaticamente pelo aplicativo de avaliação · E.E. Feliz Lusitânia" +
      "</p>" +
    "</div>";

  MailApp.sendEmail({ to: para, subject: assunto, htmlBody: corpo });
}

function escapar(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
