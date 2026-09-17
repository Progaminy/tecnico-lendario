# Técnico Lendário

Motor técnico modular para interpretar instruções, decompor linguagem e executar tarefas com rastreabilidade.

> Princípio central: o sistema **não existe para falar como humano**. Existe para compreender tecnicamente o pedido, decompor quando necessário, consultar conhecimento estruturado e executar.

## Estrutura

- `geral-tecnico` — núcleo comum: roteamento de intenção, memória de sessão, preferências, estados de conhecimento, validações e comunicação com motores especializados.
- `pt-tecnico` — primeiro motor especializado: português formal, análise lexical/morfológica/sintática, consulta de palavras, regras e referências.
- `interface` — ambiente próprio inspirado em ferramentas como VS Code/Codex: conversas, área de trabalho, resultados, estados e cores semânticas.

O motor é independente da interface. Outros motores poderão ser ligados ao `geral-tecnico` sem alterar o princípio do sistema.

## Princípios definidos

1. Português híbrido/geral: reconhecer variantes documentadas (PT-MZ, PT-PT, PT-BR e outras) e indicar diferenças quando forem relevantes.
2. Executar apenas o que foi pedido. Não despejar análise linguística se o utilizador pediu apenas execução.
3. Em divergência de fontes, analisar o contexto e usar a interpretação aplicável. Alternativas aparecem quando forem necessárias.
4. Ambiguidades apresentam opções para validação e uma opção de resposta manual.
5. Uma validação pode ser marcada como `usar como preferência`; sem essa marca não vira preferência permanente.
6. Conhecimento desconhecido não é inventado. Pode ser fornecido pelo utilizador com referência ou ficar como pendência por resolver.
7. Conhecimento é estruturado em campos técnicos, não apenas texto corrido.
8. Estados: `confirmado`, `validado`, `pendente`, `conflitante`, `incompleto`.
9. Memória de conversa/tarefa é separada do conhecimento linguístico permanente.
10. Explicações detalhadas e referências aparecem quando pedidas ou quando necessárias para resolver ambiguidade.
11. Erros de escrita são tratados de forma híbrida: correção segura quando inequívoca; validação quando houver mais de uma interpretação plausível.
12. A interface conserva conversas, gera título automático, permite renomear/apagar e mantém preferências separadamente.
13. Cores são semânticas: categorias linguísticas e estados usam cores consistentes; não são apenas decoração.

## Fonte lexical inicial

A base lexical preparada para instalação offline é o **Dicionário Aberto**, derivado de:

**FIGUEIREDO, Cândido de. _Novo Diccionário da Língua Portuguesa_. Nova edição essencialmente refundida, corrigida e copiosamente ampliada. Lisboa: Livraria Clássica Editora de A. M. Teixeira, 1913. 2 v.**

O Dicionário Aberto declara licença **CC BY-SA 2.5 Portugal** para o recurso digital. O corpus é mantido separado do código MIT e conserva a sua atribuição/licença.

A referência intelectual e o recurso de software são coisas diferentes: a resposta pode referir Cândido de Figueiredo/obra/edição, enquanto o ficheiro de dados pode ter sido obtido através do Dicionário Aberto.

## Primeiro uso

Requer Node.js 18+ e Git. O projeto não depende de pacotes npm externos.

```bash
git clone https://github.com/Progaminy/tecnico-lendario.git
cd tecnico-lendario
```

Para instalar o dicionário completo localmente, execute **uma vez enquanto houver internet**:

```bash
npm run dictionary:install
```

Depois disso, o corpus fica em `vendor/dicionario-aberto/` e as consultas lexicais podem funcionar offline.

Inicie a aplicação:

```bash
npm start
```

Abra:

```text
http://127.0.0.1:4173
```

Depois de o corpus estar instalado, iniciar e utilizar a aplicação não exige internet.

## O que já funciona

- interface de PC inspirada em ambiente técnico tipo VS Code/Codex;
- adaptação responsiva para telemóvel;
- histórico local de conversas;
- título automático por conversa;
- editar e apagar conversa;
- preferências persistentes, separadas do conhecimento;
- cores semânticas por classe gramatical e estado;
- `geral-tecnico` como roteador;
- `pt-tecnico` separado;
- consulta lexical estruturada;
- consulta ao corpus offline quando instalado;
- referência bibliográfica associada às entradas do corpus;
- tokenização;
- análise morfológica inicial;
- segmentação/divisão de oração;
- análise sintática inicial e explicitamente marcada como incompleta quando ultrapassa o conhecimento carregado;
- pendências históricas para termos não resolvidos;
- validação com opções e campo manual;
- opção `Usar como preferência`;
- comandos `Explicar` e `Mostrar referência`.

## O que ainda NÃO é afirmado como pronto

O projeto **não afirma possuir toda a gramática formal nem cobertura lexical moderna completa neste momento**. O corpus de Figueiredo é histórico e a gramática formal completa ainda precisa ser incorporada de forma estruturada e referenciada.

O sistema foi construído para mostrar `pendente` ou `incompleto` em vez de fingir que sabe.

O executor de projetos no estilo Codex também ainda não está ligado. A arquitetura já reserva esse papel ao `geral-tecnico`, sem transformar o `pt-tecnico` num executor universal.

## Dados externos

O projeto aceita dependências e bases auxiliares desde que não substituam o motor por um motor linguístico completo. Recursos externos devem ter licença compatível e a origem deve ser registada em `docs/FONTES.md`.

## Documentação

- `docs/ARQUITETURA.md` — separação entre motores, memória, conhecimento e interface.
- `docs/FONTES.md` — política de referência, proveniência e licenças.

## Licença do código

O código próprio do Técnico Lendário é disponibilizado sob licença MIT. Bases, dicionários e outros corpora conservam as respetivas licenças e atribuições.
