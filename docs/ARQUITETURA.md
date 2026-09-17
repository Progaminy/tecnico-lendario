# Arquitetura — Técnico Lendário

## 1. Separação obrigatória

### geral-tecnico

É o coordenador. Não contém gramática portuguesa como conhecimento próprio.

Responsabilidades:

- identificar a intenção técnica do pedido;
- decidir qual motor especializado deve receber o pedido;
- manter contexto da tarefa;
- guardar preferências explicitamente autorizadas;
- gerir validações, pendências e estados;
- futuramente coordenar execução de ficheiros, projetos, bases de dados e outros motores.

### pt-tecnico

É um motor especializado em português.

Responsabilidades:

- tokenização;
- consulta lexical;
- morfologia;
- sintaxe;
- semântica linguística quando necessária;
- estrutura de frases e textos;
- regras formais da língua;
- diferenças entre variantes documentadas;
- referências bibliográficas;
- correção/normalização híbrida sem adivinhar em casos ambíguos.

O objetivo não é produzir personalidade ou conversa humana. O português é tratado como sistema formal necessário para compreender e decompor instruções.

## 2. Fluxo

```text
Utilizador
   ↓
Interface
   ↓
geral-tecnico
   ↓ identifica intenção
pt-tecnico (quando o pedido depende de português)
   ↓
Conhecimento estruturado
   ↓
Resultado técnico
   ↓
Validação humana apenas quando necessária
```

Um pedido de execução futura seguirá outro ramo:

```text
geral-tecnico → perfil técnico → executor → ficheiros/serviços
```

O `pt-tecnico` pode ajudar a compreender o pedido, mas não deve tornar-se o executor de tudo.

## 3. Conhecimento estruturado

Uma entrada lexical deve poder conter:

```js
{
  lemma,
  category,
  morphology,
  senses,
  variants,
  status,
  references
}
```

Uma regra gramatical completa deverá conter, no mínimo:

```js
{
  id,
  domain,
  statement,
  conditions,
  exceptions,
  examples,
  variants,
  status,
  references
}
```

A fonte intelectual é registada em `references`. O ficheiro/API usado para transportar dados não substitui a referência bibliográfica.

## 4. Estados

- `confirmado`: sustentado pela base formal carregada.
- `validado`: decisão explicitamente validada para aquele caso.
- `pendente`: ainda sem resolução suficiente.
- `conflitante`: fontes ou análises relevantes divergem.
- `incompleto`: existe análise parcial, mas faltam elementos para afirmar o restante.

Esses estados são semânticos e também possuem representação visual.

## 5. Preferência não é regra linguística

Uma escolha marcada como `Usar como preferência` pertence ao perfil do utilizador. Ela não altera automaticamente a gramática, o dicionário nem transforma uma preferência em verdade universal.

## 6. Memórias separadas

- **Histórico de conversa:** mensagens e resultados daquela conversa.
- **Preferências:** escolhas que o utilizador autorizou reutilizar.
- **Conhecimento linguístico:** dicionário, regras e referências.
- **Pendências:** elementos ainda por resolver.

Misturar esses quatro tipos de dados é proibido pela arquitetura.

## 7. Interface

A versão de PC segue o modelo de ambiente técnico:

- painel lateral de conversas/projetos;
- área central de conversa/trabalho;
- painel técnico de estado, intenção, categorias e referência;
- edição e exclusão de títulos;
- título automático a partir do primeiro pedido;
- cores semânticas por categoria e estado;
- adaptação responsiva para telemóvel.

Exemplos de cores iniciais:

- verbo: azul;
- substantivo: laranja;
- confirmado: verde;
- pendente: amarelo;
- conflitante: vermelho;
- incompleto: roxo.

As cores são configuração visual; a categoria continua existindo como dado textual e nunca depende apenas da cor.

## 8. Regra de não fingimento

Se o dicionário completo não estiver carregado, o motor não diz que conhece a entrada.

Se a gramática disponível não sustentar uma análise completa, o motor marca `incompleto`.

Se não existir fonte carregada, `Mostrar referência` informa a ausência em vez de fabricar autor, obra, página ou data.
