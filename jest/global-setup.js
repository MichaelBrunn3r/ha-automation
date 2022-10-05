import fs from 'fs';
import Ajv from 'ajv';
import yaml from 'js-yaml';
import path from 'path';

// @ts-ignore
export default function (globalConfig, projectConfig) {
  const ajv = new Ajv();

  const BLUEPRINT_SCHEMA = yaml.DEFAULT_SCHEMA.extend([
    new yaml.Type('!input', {
      kind: 'scalar'
    })
  ]);

  const schemas = fs
    .readdirSync('schemas', { withFileTypes: true })
    .filter((dirent) => dirent.isFile())
    .map((dirent) => [path.basename(dirent.name).split('.')[0], path.join('schemas', dirent.name)]);

  // Add schemas to ajv
  for (const [id, filePath] of schemas) {
    try {
      const schema = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      ajv.addSchema(schema, id);
    } catch (e) {
      console.error(`\nFailed to add schema ${path}: ${e}`);
      process.exit(1);
    }
  }

  // @ts-ignore
  globalThis.ajv = ajv;
  // @ts-ignore
  globalThis.BLUEPRINT_SCHEMA = BLUEPRINT_SCHEMA;
}
