const express = require("express");
const cors = require("cors");
const path = require("path");
const grpc = require("./grpcClient");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 SERVIR FRONTEND (CAMINHO ABSOLUTO)
app.use(express.static(path.join(__dirname, "public")));

// ---------------- API ----------------

// 1) Obter credencial
app.post("/api/credential", async (req, res) => {
  try {
    const { citizen_card_number } = req.body;
    const response = await grpc.getCredential(citizen_card_number);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2) Candidatos
app.get("/api/candidates", async (req, res) => {
  try {
    res.json(await grpc.getCandidates());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3) Votar
app.post("/api/vote", async (req, res) => {
  try {
    let { voting_credential, candidate_id } = req.body;

    // 🔐 defesa no backend
    voting_credential = String(voting_credential).trim();
    candidate_id = Number(candidate_id);

    const response = await grpc.vote(voting_credential, candidate_id);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 4) Resultados
app.get("/api/results", async (req, res) => {
  try {
    res.json(await grpc.getResults());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- START ----------------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Voting Web Client at http://localhost:${PORT}`);
});
