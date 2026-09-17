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

A base lexical preparada para importação offline é o **Dicionário Aberto**, derivado de:

**FIGUEIREDO, Cândido de. _Novo Diccionário da Língua Portuguesa_. Nova edição essencialmente refundida, corrigida e copiosamente ampliada. Lisboa: Livraria Clássica Editora de A. M. Teixeira, 1913. 2 v.**

A edição de 1913 está em domínio público; o Dicionário Aberto disponibiliza a sua adaptação sob **CC BY-SA 2.5 Portugal**. A licença e a proveniência devem acompanhar os dados importados.

A referência intelectual e o recurso de software são coisas diferentes: a resposta pode referir Cândido de Figueiredo/obra/edição, enquanto o ficheiro de dados pode ter sido obtido através do Dicionário Aberto.

## Estado atual

A fundação do projeto está a ser construída neste repositório. O sistema **não afirmará possuir o dicionário completo nem a gramática completa enquanto esses dados não estiverem realmente importados e indexados**.

O primeiro marco funcional inclui:

- interface local responsiva;
- histórico de conversas em armazenamento local;
- edição e exclusão de conversas;
- preferências persistentes;
- cores semânticas;
- roteamento técnico de pedidos;
- consulta lexical estruturada;
- análise morfológica inicial;
- divisão/tokenização de frases;
- estados de conhecimento e pendências;
- comando para mostrar explicação e referência.

## Executar localmente

Requer Node.js, mas não requer pacotes externos.

```bash
git clone https://github.com/Progaminy/tecnico-lendario.git
cd tecnico-lendario
node server.mjs
```

Depois abra:

```text
http://localhost:4173
```

O servidor é local e não necessita de internet.

## Dados externos

O projeto aceita dependências e bases auxiliares desde que não substituam o motor por um motor linguístico completo. Recursos externos devem ter licença compatível e a origem deve ser registada em `docs/FONTES.md`.

## Licença do código

O código próprio do Técnico Lendário é disponibilizado sob licença MIT. Bases, dicionários e outros corpora conservam as respetivas licenças e atribuições.