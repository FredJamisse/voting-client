const { exec } = require("child_process");
const path = require("path");

const PROTO_DIR = path.join(__dirname, "protos");
const HOST = "ken01.utad.pt:9091";
const GRPCURL = "grpcurl";

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (stderr) {
        console.error("grpcurl STDERR:", stderr);
      }

      if (err) {
        return reject(stderr || err.message);
      }

      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject("Invalid JSON returned by grpcurl");
      }
    });
  });
}

module.exports = {
  // 1) Obter credencial
  getCredential: (citizen_card_number) =>
    run(
      `${GRPCURL} -insecure ` +
      `-import-path "${PROTO_DIR}" ` +                 // 🔥 OBRIGATÓRIO
      `-proto voter.proto ` +                           // 🔥 nome relativo
      `-d '{"citizen_card_number":"${citizen_card_number}"}' ` +
      `${HOST} voting.VoterRegistrationService/IssueVotingCredential`
    ),

  // 2) Obter candidatos
  getCandidates: () =>
    run(
      `${GRPCURL} -insecure ` +
      `-import-path "${PROTO_DIR}" ` +
      `-proto voting.proto ` +
      `${HOST} voting.VotingService/GetCandidates`
    ),

  // 3) Votar
  vote: (voting_credential, candidate_id) =>
    run(
      `${GRPCURL} -insecure ` +
      `-import-path "${PROTO_DIR}" ` +
      `-proto voting.proto ` +
      `-d '{"voting_credential":"${voting_credential}","candidate_id":${candidate_id}}' ` +
      `${HOST} voting.VotingService/Vote`
    ),

  // 4) Resultados
  getResults: () =>
    run(
      `${GRPCURL} -insecure ` +
      `-import-path "${PROTO_DIR}" ` +
      `-proto voting.proto ` +
      `${HOST} voting.VotingService/GetResults`
    ),
};
