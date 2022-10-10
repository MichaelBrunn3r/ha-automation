import fs from 'fs';
import path from 'path';
import glob from 'glob';
import yaml from 'js-yaml';
import chokidar from 'chokidar';

const schemasRoot = 'scripts/schemas';

function generateSchema(file: string) {
  let dest = path.posix.relative('scripts', file).replace('.yaml', '.json');
  let schema: Record<string, any> = yaml.load(fs.readFileSync(file, 'utf8')) as Record<string, any>;

  // Adding $schema and $id to all schemas
  schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: `http://github.com/MichaelBrunn3r/ha-blueprints/${dest}`,
    ...schema
  };

  let additionalProps: Record<string, any> | undefined;
  if (file.startsWith('scripts/schemas/condition')) {
    additionalProps = { alias: { type: 'string' }, enabled: { type: 'boolean' } };
  } else if (file.startsWith('scripts/schemas/trigger')) {
    additionalProps = { id: { type: 'string' }, enabled: { type: 'boolean' } };
  }

  if (additionalProps) {
    if ('properties' in schema) {
      schema['properties'] = {
        ...schema['properties'],
        ...additionalProps
      };
    } else if ('oneOf' in schema) {
      schema['oneOf']
        .filter((entry: Record<string, any>) => 'properties' in entry)
        .forEach((entry: Record<string, any>) => {
          entry['properties'] = {
            ...entry['properties'],
            ...additionalProps
          };
        });
    }
  }

  fs.writeFileSync(dest, JSON.stringify(schema, null, 2), { encoding: 'utf8' });
}

function watchSchemas() {
  if (watch) {
    console.log('Watching for changes...');
    chokidar.watch(schemasRoot).on('change', (filename, stats) => {
      if (filename.endsWith('.schema.yaml')) {
        console.log(`${filename} changed...`);
        try {
          generateSchema(filename);
        } catch (e) {
          console.error(`Failed to generate schema ${filename}: ${e}`);
        }
      }
    });
  }
}

const args = process.argv.slice(2);
const watch = args.includes('--watch');

console.log('Generating schemas...');
glob.sync(`${schemasRoot}/**/*.schema.yaml`).forEach((file) => generateSchema(file));

watchSchemas();
