const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

// ---------------------------
// Load Proto Files
// ---------------------------
const voterPackageDef = protoLoader.loadSync("protos/voter.proto");
const votingPackageDef = protoLoader.loadSync("protos/voting.proto");

const voterProto = grpc.loadPackageDefinition(voterPackageDef).voting;
const votingProto = grpc.loadPackageDefinition(votingPackageDef).voting;

// ---------------------------
// Create gRPC Clients
// ---------------------------
const SERVER_URL = "ken01.utad.pt:9091";

const voterClient = new voterProto.VoterRegistrationService(
  SERVER_URL,
  grpc.credentials.createInsecure()
);

const votingClient = new votingProto.VotingService(
  SERVER_URL,
  grpc.credentials.createInsecure()
);

// ---------------------------
// Application Test Functions
// ---------------------------

function getCredential(citizenNumber) {
  return new Promise((resolve, reject) => {
    voterClient.IssueVotingCredential(
      { citizen_card_number: citizenNumber },
      (err, response) => {
        if (err) return reject(err);
        return resolve(response);
      }
    );
  });
}

function getCandidates() {
  return new Promise((resolve, reject) => {
    votingClient.GetCandidates({}, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

function vote(credential, candidateId) {
  return new Promise((resolve, reject) => {
    votingClient.Vote(
      {
        voting_credential: credential,
        candidate_id: candidateId,
      },
      (err, response) => {
        if (err) return reject(err);
        resolve(response);
      }
    );
  });
}

function getResults() {
  return new Promise((resolve, reject) => {
    votingClient.GetResults({}, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

// ---------------------------
// Test Workflow
// ---------------------------

async function main() {
  console.log("🚀 Testing the Voting System gRPC Services...\n");

  try {
    // 1. Get credential
    console.log("📌 Requesting voting credential...");
    const cred = await getCredential("123456789");
    console.log("Response:", cred);

    // 2. List candidates
    console.log("\n📌 Getting candidates...");
    const candidates = await getCandidates();
    console.log("Candidates:", candidates);

    // 3. Vote if eligible
    if (cred.is_eligible) {
      console.log("\n📌 Sending vote...");
      const voteResp = await vote(cred.voting_credential, 1);
      console.log("Vote Response:", voteResp);
    } else {
      console.log("\n⚠️ Credential not eligible → cannot vote");
    }

    // 4. Get results
    console.log("\n📌 Fetching results...");
    const results = await getResults();
    console.log("Results:", results);

  } catch (err) {
    console.error("❌ Error:", err);
  }
}

main();
