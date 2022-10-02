import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import chalk from 'chalk';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testBlueprintsDir = path.join(__dirname, '../test/blueprints');
const validBlueprintsDir = path.join(testBlueprintsDir, 'valid');

const ajv = new Ajv();

// Add schemas to ajv
for (const schemaFile of [
  '../schemas/automation_blueprint.schema.json',
  '../schemas/blueprint_metadata.schema.json',
  '../schemas/common.schema.json'
]) {
  try {
    const schema = JSON.parse(fs.readFileSync(path.join(__dirname, schemaFile), 'utf8'));
    ajv.addSchema(schema);
  } catch (e) {
    console.error(chalk.red(`Failed to add schema ${schemaFile}: ${e}`));
    process.exit(1);
  }
}

// Function that validates a blueprint against the schema
const validate = ajv.getSchema(
  'http://github.com/MichaelBrunn3r/ha-blueprints/schemas/automation_blueprint.schema.json'
)!;

function test_valid_files(files: string[]) {
  files.forEach((file) => {
    let blueprint;
    if (path.extname(file) === '.json') {
      blueprint = JSON.parse(fs.readFileSync(file, 'utf8'));
    } else if (path.extname(file) === '.yaml') {
      blueprint = yaml.load(fs.readFileSync(file, 'utf8'));
    } else {
      throw new Error(`Unknown file extension: ${path.extname(file)}`);
    }

    const isValid = validate(blueprint);
    if (isValid) {
      console.log(chalk.green(`✓ ${path.relative(process.cwd(), file)}`));
    } else {
      console.log(chalk.red(`✗ ${path.relative(process.cwd(), file)}`));
      console.log(validate.errors);
    }
  });
}

function test_invalid_files(files: { path: string; errors: {}[] }[]) {}

// Test all files in testDir
test_valid_files(fs.readdirSync(validBlueprintsDir).map((file) => path.join(validBlueprintsDir, file)));
