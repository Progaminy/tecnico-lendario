# Fontes, proveniência e licenças

O Técnico Lendário separa três conceitos:

1. **Conhecimento** — a informação linguística utilizada pelo motor.
2. **Referência intelectual** — autor, obra, edição, ano e localização da informação quando conhecida.
3. **Recurso de distribuição** — ficheiro, repositório ou serviço usado para obter os dados.

Um recurso de distribuição nunca deve ser apresentado como se fosse o autor intelectual do conhecimento.

## Fonte lexical inicial escolhida

### Referência intelectual

**FIGUEIREDO, Cândido de. _Novo Diccionário da Língua Portuguesa_. Nova edição essencialmente refundida, corrigida e copiosamente ampliada. Lisboa: Livraria Clássica Editora de A. M. Teixeira, 1913. 2 volumes.**

O Projeto Gutenberg mantém uma digitalização/transcrição desta obra. O Dicionário Aberto deriva dessa edição e disponibiliza a sua adaptação digital.

### Recurso de dados

**Dicionário Aberto**

Licença declarada pelo projeto: **Creative Commons Attribution-ShareAlike 2.5 Portugal (CC BY-SA 2.5 PT)**.

Consequência para o Técnico Lendário:

- os ficheiros provenientes do Dicionário Aberto ficam separados do código MIT;
- a atribuição e a licença do recurso devem permanecer junto dos dados;
- o projeto não deve apagar ou esconder a proveniência;
- o motor pode funcionar totalmente offline depois de os dados serem instalados localmente.

O código do Técnico Lendário não copia automaticamente a licença do corpus. O corpus também não deve ser apresentado como se tivesse licença MIT.

## Referências nas respostas

Exemplo de resposta técnica desejada:

```text
andar → verbo
forma: infinitivo
...
Referência: Cândido de Figueiredo, Novo Diccionário da Língua Portuguesa, 1913, entrada “andar”.
```

Quando uma regra vier de uma gramática:

```text
regra: ...
Referência: Autor, Título da gramática, edição, ano, capítulo/secção/página (quando disponível).
```

O motor não deve inventar página, capítulo, edição ou autor.

## Gramática formal

A gramática completa ainda não foi incorporada. Antes de importar uma obra completa, devem ser verificados:

- situação autoral da edição utilizada;
- direito de redistribuição do texto integral;
- variante e período linguístico abrangidos;
- qualidade e atualidade da norma descrita.

É permitido manter **referências bibliográficas** a obras protegidas e codificar regras em formulação própria; o que não será feito é copiar indiscriminadamente textos integrais protegidos.

## Política para novas fontes

Uma nova fonte só entra na base quando possuir os seguintes metadados mínimos:

```text
id
autor ou entidade responsável
título
data/edição
licença ou situação de uso
âmbito (léxico, morfologia, sintaxe, ortografia...)
variantes abrangidas
```

Quando esses dados não forem conhecidos, o conhecimento pode permanecer como `pendente` ou `incompleto`, mas não como `confirmado` por uma fonte fictícia.
