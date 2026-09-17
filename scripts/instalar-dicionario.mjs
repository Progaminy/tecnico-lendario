import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('..', import.meta.url));
const vendorRoot = join(root, 'vendor');
const target = join(vendorRoot, 'dicionario-aberto');
const source = 'https://github.com/ioxua/dicionario-aberto.git';

if (existsSync(join(target, 'raw'))) {
  console.log('Dicionário Aberto já está instalado em vendor/dicionario-aberto.');
  process.exit(0);
}

mkdirSync(vendorRoot, { recursive: true });
if (existsSync(target)) rmSync(target, { recursive: true, force: true });

console.log('A descarregar o Dicionário Aberto...');
const result = spawnSync('git', ['clone', '--depth', '1', source, target], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

if (result.status !== 0) {
  console.error('Falha ao descarregar. Verifique internet e Git e tente novamente.');
  process.exit(result.status || 1);
}

rmSync(join(target, '.git'), { recursive: true, force: true });

const metadata = {
  resource: 'Dicionário Aberto',
  transportMirror: source,
  retrievedAt: new Date().toISOString(),
  license: 'CC BY-SA 2.5 Portugal',
  intellectualReference: {
    author: 'Cândido de Figueiredo',
    title: 'Novo Diccionário da Língua Portuguesa',
    edition: 'Nova edição essencialmente refundida, corrigida e copiosamente ampliada',
    place: 'Lisboa',
    publisher: 'Livraria Clássica Editora de A. M. Teixeira',
    year: 1913,
    volumes: 2
  },
  note: 'Este corpus externo não é relicenciado pela licença MIT do Técnico Lendário.'
};

const sourceFile = join(target, 'SOURCE.json');
mkdirSync(dirname(sourceFile), { recursive: true });
writeFileSync(sourceFile, JSON.stringify(metadata, null, 2) + '\n', 'utf8');

console.log('Instalação concluída. Depois disso, a consulta lexical pode funcionar offline.');
