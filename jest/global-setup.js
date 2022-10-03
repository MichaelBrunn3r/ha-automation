import fs from 'fs';
import Ajv from 'ajv';
import chalk from 'chalk';
import yaml from 'js-yaml';

// @ts-ignore
export default function (globalConfig, projectConfig) {
  const ajv = new Ajv();

  const BLUEPRINT_SCHEMA = yaml.DEFAULT_SCHEMA.extend([
    new yaml.Type('!input', {
      kind: 'scalar'
    })
  ]);

  // Add schemas to ajv
  for (const [id, path] of Object.entries({
    automation_blueprint: 'schemas/automation_blueprint.schema.json',
    blueprint_metadata: 'schemas/blueprint_metadata.schema.json',
    common: 'schemas/common.schema.json'
  })) {
    try {
      const schema = JSON.parse(fs.readFileSync(path, 'utf8'));
      ajv.addSchema(schema, id);
    } catch (e) {
      console.error(chalk.red(`\nFailed to add schema ${path}: ${e}`));
      process.exit(1);
    }
  }

  // @ts-ignore
  globalThis.ajv = ajv;
  // @ts-ignore
  globalThis.BLUEPRINT_SCHEMA = BLUEPRINT_SCHEMA;
}
