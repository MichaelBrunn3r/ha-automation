import fs from 'fs';
import path from 'path';
import glob from 'glob';
import yaml from 'js-yaml';
import { mapEntriesRecursive } from './utils';

glob.sync('scripts/schemas/**/*.schema.yaml').forEach((file) => {
  let dest = file.substring('scripts/'.length);
  dest = path.dirname(dest) + '/' + path.basename(dest, '.yaml') + '.json';

  // Load schema
  let schema = yaml.load(fs.readFileSync(file, 'utf8')) as Record<string, any>;

  // Replace .yaml references with .json
  schema = mapEntriesRecursive((k, v) => k)((k, v) => (k === '$ref' ? (v as string).replace('.yaml', '.json') : v))(
    schema
  );

  schema['$schema'] = 'http://json-schema.org/draft-07/schema#';
  schema['$id'] = `http://github.com/MichaelBrunn3r/ha-blueprints/schemas/${dest.substring('schemas/'.length)}`;

  fs.writeFileSync(dest, JSON.stringify(schema, null, 2) + '\n');
});
