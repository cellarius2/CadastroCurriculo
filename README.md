# Cadastro de currículos

Aplicação desenvolvida para o desafio técnico do CIEE/PR.

Permite cadastrar candidatos manualmente ou importar um currículo em PDF para preencher nome, e-mail e telefone. As informações podem ser revisadas antes de salvar.

O PDF é opcional: o cadastro manual permanece disponível quando o documento não é enviado ou não pode ser lido.

## Funcionalidades

- Cadastro de candidatos com nome completo e e-mail obrigatórios.
- Telefone, área ou cargo de interesse e resumo profissional opcionais.
- Importação de PDF de até 5 MB.
- Extração de texto e identificação de dados pelo backend.
- Revisão e complementação das informações no mesmo formulário.
- Listagem de candidatos.
- Consulta dos detalhes.
- Persistência no SQL Server.
- Validação dos dados e tratamento de erros.

## Tecnologias e versões

### Backend

| Tecnologia | Versão |
| --- | --- |
| ASP.NET Core / framework alvo | .NET 8.0 |
| Entity Framework Core SQL Server | 8.0.31 instalada |
| Entity Framework Core Design | 8.0.31 instalada |
| PdfPig | 0.1.16 |
| Swashbuckle.AspNetCore | 6.6.2 |

As referências do Entity Framework Core estão declaradas como `8.0.*` no projeto. A versão restaurada no ambiente de desenvolvimento foi `8.0.31`.

### Frontend

| Tecnologia | Versão declarada |
| --- | --- |
| React / React DOM | ^19.2.8 |
| React Router DOM | ^7.18.4 |
| Axios | ^1.20.0 |
| TypeScript | ~6.0.2 |
| Vite | ^8.3.0 |
| Plugin React para Vite | ^6.1.1 |
| Oxlint | ^1.81.0 |

As versões exatas das dependências do frontend estão registradas no `package-lock.json`. Utilize `npm ci` para instalar essas versões.

### Banco de dados

SQL Server, utilizando uma instância LocalDB no ambiente de desenvolvimento Windows.

## Estrutura do projeto

- `frontend/`: interface React e TypeScript.
- `backend/CadastroCurriculos.API/`: API, validações, persistência e extração de PDF.
- `backend/CadastroCurriculos.Tests/`: testes automatizados.
- `backend/CadastroCurriculos.API/Migrations/`: migrations do Entity Framework Core.
- `DESENVOLVIMENTO.md`: relato do desenvolvimento e do uso de IA.

## Pré-requisitos

- Git.
- SDK do .NET 8 ou SDK compatível com o framework alvo `net8.0`.
- Node.js e npm compatíveis com a versão do Vite declarada no projeto.
- SQL Server LocalDB instalado para seguir os comandos de configuração abaixo.
- Ferramenta `dotnet-ef` da linha 8.0.

Confira as ferramentas instaladas:

```powershell
dotnet --info
node --version
npm --version
sqllocaldb info
```

Os comandos deste README devem ser executados a partir da pasta principal do repositório, salvo quando houver um comando `cd`.

## Configuração do SQL Server

### 1. Criar a instância LocalDB

No PowerShell:

```powershell
sqllocaldb create CadastroCurriculos
sqllocaldb start CadastroCurriculos
```

Se a instância já existir, execute apenas o comando para iniciá-la.

### 2. Configurar a conexão

Abra:

```text
backend/CadastroCurriculos.API/appsettings.json
```

Na seção `ConnectionStrings`, mantenha o nome da chave utilizado pelo `Program.cs` e configure seu valor como:

```text
Server=(localdb)\CadastroCurriculos;Database=CadastroCurriculos;Trusted_Connection=True;TrustServerCertificate=True
```

Dentro de um arquivo JSON, a barra invertida precisa ser escapada. Portanto, o valor será:

```json
"Server=(localdb)\\CadastroCurriculos;Database=CadastroCurriculos;Trusted_Connection=True;TrustServerCertificate=True"
```

Essa configuração utiliza autenticação integrada do Windows e não contém usuário ou senha.

Para utilizar outra instância SQL Server, adapte o servidor e a autenticação da conexão. Não versione credenciais reais.

### 3. Instalar a ferramenta de migrations

Caso `dotnet-ef` ainda não esteja instalado:

```powershell
dotnet tool install --global dotnet-ef --version 8.0.31
```

Confira a instalação:

```powershell
dotnet ef --version
```

### 4. Restaurar dependências e criar o banco

Na pasta principal do repositório:

```powershell
dotnet restore backend/CadastroCurriculos.API/CadastroCurriculos.API.csproj
dotnet ef database update --project backend/CadastroCurriculos.API/CadastroCurriculos.API.csproj
```

O comando aplica as migrations existentes e cria a estrutura do banco. Não é necessário gerar uma nova migration para executar o projeto.

## Executar o backend

Na pasta principal:

```powershell
dotnet run --project backend/CadastroCurriculos.API/CadastroCurriculos.API.csproj --launch-profile http
```

A API estará disponível em:

```text
http://localhost:5080
```

Swagger, no ambiente de desenvolvimento:

```text
http://localhost:5080/swagger
```

Mantenha esse terminal aberto durante o uso da aplicação.

## Executar o frontend

Abra outro terminal:

```powershell
cd frontend
npm ci
```

O arquivo `.env.example` já está incluído em `frontend/` com:

```dotenv
VITE_API_URL=http://localhost:5080
```

Copie o exemplo para a configuração local:

```powershell
Copy-Item .env.example .env
```

Inicie o frontend:

```powershell
npm run dev -- --port 5173 --strictPort
```

Acesse:

```text
http://localhost:5173
```

A origem do frontend precisa estar autorizada na configuração de CORS do backend. A configuração local utiliza `http://localhost:5173`.

Se alterar a variável `VITE_API_URL`, reinicie o servidor do frontend.

## Como utilizar

### Cadastro manual

1. Abra a aplicação e selecione a opção para cadastrar um candidato.
2. Preencha nome completo e e-mail.
3. Preencha os campos opcionais, se desejar.
4. Salve o cadastro.
5. Consulte o candidato na listagem e abra seus detalhes.

Não é necessário selecionar um documento.

### Cadastro com PDF

1. Abra o mesmo formulário de cadastro.
2. Selecione um currículo em PDF de até 5 MB.
3. Aguarde a leitura do documento.
4. Revise os dados identificados.
5. Corrija ou complete as informações.
6. Salve o cadastro.

A importação não salva automaticamente o candidato. O salvamento acontece somente após a confirmação pelo formulário.

Os campos já preenchidos são preservados durante a importação.

Caso a leitura falhe, a aplicação apresenta uma mensagem e permite continuar o preenchimento manual.

## Endpoints

| Método | Rota | Finalidade |
| --- | --- | --- |
| POST | `/api/candidatos` | Cadastrar candidato |
| GET | `/api/candidatos` | Listar candidatos |
| GET | `/api/candidatos/{id}` | Consultar detalhes |
| POST | `/api/curriculos/importar` | Extrair dados de um PDF |

A importação recebe `multipart/form-data`, com o arquivo no campo `Arquivo`.

## Validações

| Campo | Regra |
| --- | --- |
| Nome completo | Obrigatório, até 200 caracteres |
| E-mail | Obrigatório, formato válido, até 254 caracteres |
| Telefone | Opcional, até 30 caracteres |
| Área ou cargo de interesse | Opcional, até 150 caracteres |
| Resumo profissional | Opcional, até 4.000 caracteres |

O backend valida a presença do arquivo, tamanho, extensão, tipo informado e assinatura inicial do PDF. A biblioteca de leitura também pode rejeitar documentos danificados ou protegidos.

O limite de arquivo é de 5 × 1.024 × 1.024 bytes.

## Testes automatizados

Com a API parada, execute a partir da pasta principal:

```powershell
dotnet test backend/CadastroCurriculos.Tests/CadastroCurriculos.Tests.csproj
```

A suíte atual contém 30 casos:

- 7 casos relacionados à rejeição de arquivos inválidos e tratamento de falhas na importação.
- 23 casos relacionados à obrigatoriedade, formato do e-mail e limites de caracteres do DTO.

Esses testes não precisam de uma conexão ativa com o SQL Server.

São testes unitários. Eles não substituem a verificação da integração HTTP, da persistência no SQL Server ou dos fluxos completos no navegador.

## Verificações do frontend

Dentro da pasta `frontend`:

```powershell
npm run lint
npm run build
```

O build verifica o TypeScript e gera a aplicação na pasta `dist`.

## Verificação manual recomendada

- Salvar um candidato apenas com nome e e-mail.
- Confirmar que ele aparece na listagem e nos detalhes.
- Importar um PDF válido e corrigir os dados antes de salvar.
- Completar manualmente informações não identificadas.
- Enviar um arquivo inválido e continuar o cadastro manual.
- Enviar um arquivo acima de 5 MB.
- Reiniciar a API e confirmar que os dados continuam disponíveis.
- Conferir a interface em uma tela estreita.

## Limitações da extração

- Não utiliza OCR: PDFs que contêm apenas imagens podem não produzir texto.
- A identificação dos dados utiliza expressões regulares e heurísticas.
- A identificação do nome pode falhar ou selecionar um texto inadequado.
- Documentos com múltiplas colunas ou layouts incomuns podem alterar a ordem do texto.
- O reconhecimento de telefone prioriza formatos brasileiros com DDD.
- Documentos danificados ou protegidos por senha podem não ser lidos.
- As informações extraídas sempre precisam de revisão antes do salvamento.

O documento é processado em memória para extração. O arquivo PDF não é armazenado no banco; são persistidos os dados confirmados no formulário.

## Uso de inteligência artificial

Houve uso de IA durante o desenvolvimento. O processo, as adaptações e as verificações estão descritos em `DESENVOLVIMENTO.md`.

## Solução de problemas

### Banco indisponível

Confirme que a instância está iniciada:

```powershell
sqllocaldb start CadastroCurriculos
```

Confira a connection string e execute novamente as migrations.

### Frontend não consegue acessar a API

Confirme que:

- A API está em execução na porta 5080.
- `VITE_API_URL` aponta para a URL correta.
- A origem do frontend está autorizada no CORS.
- O frontend foi reiniciado após alterações no `.env`.

### Testes falham por arquivo executável bloqueado

Pare a API no terminal com `Ctrl + C` ou encerre a depuração no Visual Studio antes de executar novamente os testes.

## Currículo fictício para teste

O arquivo `exemplos/curriculo-ficticio.pdf` contém dados fictícios
e texto selecionável para testar a importação.

Dados esperados:
- Nome: Mariana Oliveira.
- E-mail: mariana.oliveira@example.com.
- Telefone: (41) 99999-1234.

Após importar, revise os dados no formulário antes de salvar.
