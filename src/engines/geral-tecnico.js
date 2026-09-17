import { detectIntent, extractLookupTerm } from './intent.js';
import { PTTecnico } from './pt-tecnico.js';

export class GeralTecnico {
  constructor({ preferences = {} } = {}) {
    this.preferences = preferences;
    this.pt = new PTTecnico({ preferences });
  }

  setPreferences(preferences = {}) {
    this.preferences = preferences;
    this.pt.setPreferences(preferences);
  }

  process(text, context = {}) {
    const route = detectIntent(text);
    let result;

    switch (route.intent) {
      case 'consultar_palavra':
        result = this.pt.lookup(extractLookupTerm(text));
        break;
      case 'analise_morfologica':
        result = this.pt.analyseMorphology(stripCommandPrefix(text, ['análise morfológica', 'analise morfologica', 'morfologia']));
        break;
      case 'analise_sintatica':
        result = this.pt.analyseSyntax(stripCommandPrefix(text, ['análise sintática', 'analise sintatica', 'sintaxe']));
        break;
      case 'dividir_oracao':
        result = this.pt.divideSentence(stripCommandPrefix(text, ['divida a oração', 'dividir oração', 'dividir oracao', 'separe a oração']));
        break;
      case 'mostrar_referencia':
        result = this.pt.referenceLast();
        break;
      case 'explicar':
        result = this.pt.explainLast();
        break;
      case 'executar_instrucao':
        result = this.executionStub(text, context);
        break;
      default:
        result = this.pt.interpret(text);
        break;
    }

    return {
      route: { ...route, engine: result.engine || 'pt-tecnico' },
      result
    };
  }

  executionStub(text) {
    return {
      engine: 'geral-tecnico',
      intent: 'executar_instrucao',
      status: 'incompleto',
      text: [
        'A instrução foi reconhecida como pedido de execução.',
        'O executor de projetos ainda não está ligado nesta fundação. O geral-tecnico não vai fingir que executou a tarefa.',
        'Quando o executor for ativado, perfis técnicos (por exemplo: página web → HTML/CSS/JS; base de dados → Supabase) poderão ser aplicados sem misturar essas regras com o pt-tecnico.'
      ].join('\n'),
      tokens: [],
      references: []
    };
  }
}

function stripCommandPrefix(text, prefixes) {
  let output = String(text).trim();
  for (const prefix of prefixes) {
    const pattern = new RegExp(`^${escapeRegExp(prefix)}(?:\\s*[:—-]?\\s*)`, 'iu');
    if (pattern.test(output)) {
      output = output.replace(pattern, '').trim();
      break;
    }
  }
  return output || String(text).trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
