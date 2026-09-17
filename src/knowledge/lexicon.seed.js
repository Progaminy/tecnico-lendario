export const FIGUEIREDO_1913 = Object.freeze({
  id: 'figueiredo-1913',
  author: 'Cândido de Figueiredo',
  title: 'Novo Diccionário da Língua Portuguesa',
  edition: 'Nova edição essencialmente refundida, corrigida e copiosamente ampliada',
  place: 'Lisboa',
  publisher: 'Livraria Clássica Editora de A. M. Teixeira',
  year: 1913,
  volumes: 2,
  resource: 'Dicionário Aberto / edição digital derivada da obra',
  resourceLicense: 'CC BY-SA 2.5 Portugal'
});

// Semente mínima para o motor funcionar antes da importação do corpus completo.
// As glosas abaixo são formulações técnicas resumidas do projeto; não são transcrições literais.
export const lexiconSeed = Object.freeze({
  andar: {
    lemma: 'andar',
    category: 'verbo',
    morphology: { form: 'infinitivo', conjugation: '-ar' },
    senses: ['deslocar-se; mover-se de um lugar para outro'],
    variants: ['pt-MZ', 'pt-PT', 'pt-BR'],
    status: 'confirmado',
    references: [FIGUEIREDO_1913]
  },
  falar: {
    lemma: 'falar',
    category: 'verbo',
    morphology: { form: 'infinitivo', conjugation: '-ar' },
    senses: ['produzir fala; exprimir algo por palavras'],
    variants: ['pt-MZ', 'pt-PT', 'pt-BR'],
    status: 'confirmado',
    references: [FIGUEIREDO_1913]
  },
  carro: {
    lemma: 'carro',
    category: 'substantivo',
    morphology: { gender: 'masculino', number: 'singular' },
    senses: ['veículo; meio de transporte terrestre, conforme o contexto'],
    variants: ['pt-MZ', 'pt-PT', 'pt-BR'],
    status: 'confirmado',
    references: [FIGUEIREDO_1913]
  },
  aluno: {
    lemma: 'aluno',
    category: 'substantivo',
    morphology: { gender: 'masculino', number: 'singular' },
    senses: ['pessoa que recebe ensino ou instrução'],
    variants: ['pt-MZ', 'pt-PT', 'pt-BR'],
    status: 'confirmado',
    references: [FIGUEIREDO_1913]
  },
  alunos: {
    lemma: 'aluno',
    category: 'substantivo',
    morphology: { gender: 'masculino', number: 'plural' },
    senses: ['plural de aluno'],
    variants: ['pt-MZ', 'pt-PT', 'pt-BR'],
    status: 'confirmado',
    references: [FIGUEIREDO_1913]
  },
  matemática: {
    lemma: 'matemática',
    category: 'substantivo',
    morphology: { gender: 'feminino', number: 'singular' },
    senses: ['disciplina que estuda estruturas, quantidades, relações e formas'],
    variants: ['pt-MZ', 'pt-PT', 'pt-BR'],
    status: 'confirmado',
    references: [FIGUEIREDO_1913]
  },
  ontem: {
    lemma: 'ontem',
    category: 'advérbio',
    morphology: { invariant: true },
    senses: ['no dia imediatamente anterior ao atual'],
    variants: ['pt-MZ', 'pt-PT', 'pt-BR'],
    status: 'confirmado',
    references: [FIGUEIREDO_1913]
  },
  os: {
    lemma: 'o',
    category: 'artigo',
    morphology: { gender: 'masculino', number: 'plural', definiteness: 'definido' },
    senses: [],
    variants: ['pt-MZ', 'pt-PT', 'pt-BR'],
    status: 'confirmado',
    references: []
  },
  o: {
    lemma: 'o',
    category: 'artigo',
    morphology: { gender: 'masculino', number: 'singular', definiteness: 'definido' },
    senses: [],
    variants: ['pt-MZ', 'pt-PT', 'pt-BR'],
    status: 'confirmado',
    references: []
  },
  a: {
    lemma: 'a',
    category: 'artigo',
    morphology: { gender: 'feminino', number: 'singular', definiteness: 'definido' },
    senses: [],
    variants: ['pt-MZ', 'pt-PT', 'pt-BR'],
    status: 'confirmado',
    references: []
  },
  as: {
    lemma: 'a',
    category: 'artigo',
    morphology: { gender: 'feminino', number: 'plural', definiteness: 'definido' },
    senses: [],
    variants: ['pt-MZ', 'pt-PT', 'pt-BR'],
    status: 'confirmado',
    references: []
  }
});
