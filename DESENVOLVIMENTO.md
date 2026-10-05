# Registro do desenvolvimento

## Organização do trabalho

Dediquei aproximadamente 5 a 6 horas ao desafio.

Organizei o desenvolvimento em etapas, priorizando primeiro o cadastro manual e a persistência dos dados. Depois implementei a importação opcional de PDF, ajustei a interface e acrescentei testes automatizados.

A sequência de trabalho foi:

1. Configuração da API ASP.NET Core e do Swagger.
2. Configuração do SQL Server LocalDB.
3. Criação da entidade, DTO, contexto e migrations.
4. Implementação do cadastro, listagem e consulta de detalhes.
5. Integração do frontend React com a API.
6. Ajustes visuais das telas.
7. Implementação da leitura de PDF no backend.
8. Validação dos arquivos e tratamento de falhas.
9. Criação e execução dos testes automatizados.
10. Preparação da documentação e revisão para entrega.

## Decisões técnicas

### React e TypeScript

Escolhi React para construir a interface e TypeScript para definir os contratos dos dados utilizados nos componentes e nas chamadas à API.

As telas utilizam React Router para navegação e Axios para comunicação com o backend.

### ASP.NET Core e Entity Framework Core

Utilizei ASP.NET Core com .NET 8 para disponibilizar os endpoints.

O Entity Framework Core foi utilizado para persistência e migrations, mantendo a estrutura do banco vinculada ao código do projeto.

O DTO de cadastro concentra as regras de obrigatoriedade, formato do e-mail e limites de caracteres recebidos pela API.

### SQL Server LocalDB

Utilizei SQL Server LocalDB no ambiente Windows para executar o projeto localmente com autenticação integrada, sem precisar incluir usuário ou senha no repositório.

### Importação separada do salvamento

A importação do PDF apenas retorna os dados identificados e os avisos da extração.

O candidato é salvo por outro endpoint, somente após a revisão e confirmação do formulário. Isso mantém o cadastro manual independente da leitura do documento.

Os dois caminhos utilizam o mesmo formulário e o mesmo endpoint de cadastro.

### Extração com PdfPig

Utilizei PdfPig para ler o texto dos PDFs no backend.

A identificação de e-mail e telefone utiliza expressões regulares. A identificação do nome utiliza heurísticas sobre as primeiras linhas do texto e nomes de campos explícitos.

Essa abordagem foi escolhida para manter a solução simples e permitir que as informações fossem corrigidas manualmente.

### Preservação de informações preenchidas

A importação preenche os campos vazios de nome, e-mail e telefone. Informações já digitadas são preservadas para evitar perda de dados durante uma nova importação.

### Organização dos estilos

Concentrei os estilos da aplicação em `src/index.css`, mantendo um padrão visual entre cadastro, listagem e detalhes.

Durante os ajustes, priorizei consistência de cores, dimensões dos painéis e espaçamento dos campos.

## Uso de inteligência artificial

Utilizei ChatGPT/Codex como apoio durante o desenvolvimento, incluindo orientação por etapas, geração de trechos e arquivos completos, discussão de erros, propostas visuais e elaboração de testes.

Também utilizei geração de imagens para explorar alternativas de layout e elementos ilustrativos.

A identificação exata de todos os modelos utilizados durante as interações não foi registrada. Por esse motivo, não atribuo versões específicas sem confirmação.

A aplicação entregue não utiliza um serviço de IA para processar currículos. A extração acontece localmente no backend com PdfPig e regras de identificação.

### Exemplos de pedidos e aproveitamento

- “Vamos iniciar do zero, pode quebrar em etapas cada processo.”
  - Utilizei a orientação para dividir a implementação em configuração, cadastro manual, integração, importação e testes.

- “Me mande o arquivo todo de Program.cs.”
  - Utilizei arquivos completos como apoio à configuração da API e executei a aplicação localmente para verificar o resultado.

- “A página de detalhes deve seguir o mesmo padrão criado.”
  - Utilizei as sugestões para aproximar o layout de detalhes do padrão visual do cadastro.

- “Gere uma imagem do campo importar currículo combinando mais com o design da tela.”
  - Avaliei propostas visuais e pedi uma versão mais compacta antes de adaptar a interface.

- Pedido de revisão do repositório contra os requisitos do desafio.
  - Preparei uma revisão final para identificar problemas, pendências e diferenças entre testes unitários e verificação da aplicação completa.

## Correções e adaptações

As sugestões de IA precisaram de ajustes durante a execução.

- Revisei espaçamentos e tamanhos dos painéis após observar o resultado no navegador.
- Descartei a separação dos estilos de cadastro em outro arquivo CSS e mantive os estilos centralizados.
- Ajustei elementos ilustrativos que não estavam bem posicionados.
- Reduzi o espaço ocupado pelo campo de importação de PDF.
- Corrigi erros de edição em componentes ao substituir o conteúdo completo dos arquivos.
- Ajustei comandos conforme a pasta em que o terminal estava aberto.
- Parei a API antes da execução dos testes para resolver o bloqueio do executável pelo processo em execução.

Essas adaptações foram necessárias porque o código sugerido precisava ser conferido no ambiente real e integrado aos arquivos existentes.

## Verificação da solução

Durante o desenvolvimento, executei a aplicação localmente e conferi o cadastro manual, a listagem, os detalhes e a importação de PDF.

Também executei 30 casos de teste automatizados com sucesso:

- 7 casos para validação de arquivos e tratamento de falhas na importação.
- 23 casos para validação do DTO de cadastro.

Os testes de arquivo verificam:

- Ausência de arquivo.
- Arquivo vazio.
- Arquivo acima de 5 MB.
- Extensão inválida.
- Tipo de conteúdo inválido.
- Conteúdo que não corresponde a um PDF.
- PDF danificado.

Os testes do DTO verificam:

- Cadastro apenas com os campos obrigatórios.
- Cadastro com todos os campos.
- Nome e e-mail vazios ou contendo apenas espaços.
- Formatos inválidos de e-mail.
- Valores no limite e acima do limite de cada campo.

Esses testes são unitários e não comprovam, isoladamente, a integração HTTP, a persistência no SQL Server ou o funcionamento completo da interface.

## Dificuldades e limitações

As principais dificuldades foram configurar o ambiente local, ajustar o layout entre as telas e integrar a importação sem comprometer o cadastro manual.

A extração de PDF possui limitações:

- Não há OCR para documentos digitalizados como imagem.
- A ordem do texto pode variar conforme o layout do documento.
- O nome pode não ser identificado corretamente.
- O reconhecimento de telefone prioriza formatos brasileiros.
- PDFs danificados ou protegidos podem não ser lidos.

Por isso, o formulário permite revisar e completar os dados antes de salvar.

## Melhorias com mais tempo

- Acrescentar testes de integração HTTP com SQL Server em ambiente isolado.
- Automatizar os fluxos principais da interface.
- Ampliar os testes de extração com diferentes currículos fictícios.
- Melhorar a identificação de nomes e telefones.
- Revisar acessibilidade e responsividade com mais dispositivos.
- Adicionar paginação à listagem.
- Configurar integração contínua para executar build e testes.

## Participação e aprendizado

Minha participação incluiu a escolha das tecnologias, execução local, avaliação das propostas, ajustes visuais, acompanhamento dos erros e verificação dos resultados.

A IA acelerou a elaboração do código e ajudou a interpretar problemas, mas as sugestões precisaram ser adaptadas ao projeto e conferidas durante a execução.

Para explicar a solução, o fluxo principal é:

1. O React recebe os dados no formulário.
2. Opcionalmente, envia o PDF à API para extração.
3. A API retorna os dados identificados, sem salvar o candidato.
4. A pessoa revisa o formulário e confirma o cadastro.
5. A API valida os dados e persiste o candidato no SQL Server.
6. A listagem e os detalhes consultam os dados pela API.