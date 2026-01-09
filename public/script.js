// ---------------- Helpers ----------------
function setLoading(buttonId, isLoading) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  btn.disabled = isLoading;
  btn.dataset.originalText ??= btn.textContent;
  btn.textContent = isLoading ? "Aguarde..." : btn.dataset.originalText;
}

function showAlert(type, message) {
  const alertArea = document.getElementById("alertArea");
  const id = `a_${Date.now()}`;
  alertArea.insertAdjacentHTML(
    "afterbegin",
    `
    <div id="${id}" class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    `
  );
  // auto-dismiss after 6s
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.remove();
  }, 6000);
}

function prettyJson(obj) {
  return JSON.stringify(obj, null, 2);
}

function normalizeCredential(value) {
  return String(value ?? "").trim();
}

// ---------------- API Calls ----------------
async function getCredential() {
  const citizen = document.getElementById("citizen").value?.trim();

  if (!citizen) {
    showAlert("warning", "Preenche o número do Cartão de Cidadão.");
    return;
  }

  setLoading("btnCredential", true);

  try {
    const res = await fetch("/api/credential", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ citizen_card_number: citizen }),
    });

    const data = await res.json();

    // JSON view
    document.getElementById("credentialJson").textContent = prettyJson(data);

    // Summary view
    const eligible = data.isEligible ?? data.is_eligible ?? "—";
    const cred = data.votingCredential ?? data.voting_credential ?? data.votingCredential ?? "—";

    document.getElementById("credEligible").textContent = String(eligible);
    document.getElementById("credValue").textContent = String(cred);

    // Autofill credential field
    const credNorm = normalizeCredential(cred);
    if (credNorm) {
      document.getElementById("credential").value = credNorm;
    }

    // UX guidance
    if (credNorm.startsWith("INVALID")) {
      showAlert("warning", "A credencial emitida é inválida (simulação). Clique novamente em “Obter Credencial” até obter uma credencial CRED-… válida.");
    } else {
      showAlert("success", "Credencial emitida. Campo de votação preenchido automaticamente.");
    }
  } catch (err) {
    showAlert("danger", `Erro ao obter credencial: ${err}`);
  } finally {
    setLoading("btnCredential", false);
  }
}

async function getCandidates() {
  setLoading("btnCandidates", true);

  try {
    const res = await fetch("/api/candidates");
    const data = await res.json();

    document.getElementById("candidatesJson").textContent = prettyJson(data);

    const candidates = data.candidates || [];
    const tbody = document.getElementById("candidatesTableBody");

    if (!candidates.length) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-muted">Sem candidatos.</td></tr>`;
      return;
    }

    tbody.innerHTML = candidates
      .map(
        (c) => `
        <tr>
          <td>${c.id}</td>
          <td>${c.name}</td>
          <td>
            <button class="btn btn-outline-primary btn-sm" onclick="selectCandidate(${c.id})">
              Selecionar
            </button>
          </td>
        </tr>
      `
      )
      .join("");

    showAlert("info", "Lista de candidatos carregada.");
  } catch (err) {
    showAlert("danger", `Erro ao obter candidatos: ${err}`);
  } finally {
    setLoading("btnCandidates", false);
  }
}

function selectCandidate(id) {
  document.getElementById("candidateId").value = Number(id);
  showAlert("secondary", `Candidato ${id} selecionado para votação.`);
}

async function submitVote() {
  let voting_credential = normalizeCredential(document.getElementById("credential").value);
  let candidate_id = Number(document.getElementById("candidateId").value);

  if (!voting_credential) {
    showAlert("warning", "Indica uma credencial de voto.");
    return;
  }

  if (!Number.isFinite(candidate_id) || candidate_id <= 0) {
    showAlert("warning", "Indica um ID de candidato válido (ex: 1, 2, 3).");
    return;
  }

  // quick UX check
  if (voting_credential.startsWith("INVALID")) {
    showAlert("warning", "Essa credencial é inválida (INVALID-...). Solicita uma nova credencial válida (CRED-...).");
    return;
  }

  setLoading("btnVote", true);

  try {
    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voting_credential, candidate_id }),
    });

    const data = await res.json();

    document.getElementById("voteJsonPre").textContent = prettyJson(data);

    // Handle different response shapes:
    const success = data.success;
    const message = data.message || data?.message;

    document.getElementById("voteStatus").textContent =
      success === true ? "✅ Sucesso" : success === false ? "❌ Rejeitado" : "—";
    document.getElementById("voteMessage").textContent = message ?? "—";

    if (success === true) {
      showAlert("success", "Voto registado com sucesso.");
    } else {
      showAlert("warning", message || "Voto rejeitado.");
    }
  } catch (err) {
    showAlert("danger", `Erro ao votar: ${err}`);
  } finally {
    setLoading("btnVote", false);
  }
}

async function getResults() {
  setLoading("btnResults", true);

  try {
    const res = await fetch("/api/results");
    const data = await res.json();

    document.getElementById("resultsJson").textContent = prettyJson(data);

    const results = data.results || [];
    const tbody = document.getElementById("resultsTableBody");

    if (!results.length) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-muted">Sem resultados.</td></tr>`;
      return;
    }

    tbody.innerHTML = results
      .map(
        (r) => `
        <tr>
          <td>${r.id}</td>
          <td>${r.name}</td>
          <td class="fw-semibold">${r.votes}</td>
        </tr>
      `
      )
      .join("");

    showAlert("info", "Resultados carregados.");
  } catch (err) {
    showAlert("danger", `Erro ao obter resultados: ${err}`);
  } finally {
    setLoading("btnResults", false);
  }
}
