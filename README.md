**How to Run
Requisitos**

- Node.js (v18 ou superior)

- npm

- grpcurl

**Instalar grpcurl**
**macOS**
brew install grpcurl

**Windows**

**Opção 1 — Chocolatey (recomendado)**

choco install grpcurl


**Opção 2 — Scoop**

scoop install grpcurl


**Verificação (ambos):**

grpcurl --version

**Execução
1. Clonar o repositório**
git clone https://github.com/<teu-username>/voting-client.git
cd voting-client

2. Instalar dependências
npm install

3. Iniciar a aplicação
node server.js


Deverá surgir:

Voting Web Client at http://localhost:3000

4. Abrir no browser
http://localhost:3000

Notas

A aplicação comunica com serviços gRPC remotos que utilizam TLS com certificados autoassinados.

O backend utiliza a ferramenta grpcurl para garantir compatibilidade.

Apenas as credenciais abaixo são aceites na votação:

CRED-ABC-123
CRED-DEF-456
CRED-GHI-789
