const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

test.each(['blueprints/valid_template_string.yaml', 'blueprints/valid_multiline_template_string.yaml'])(
  '%s is valid blueprint',
  (file) => {
    expect(yaml.load(fs.readFileSync(path.join(__dirname, file), 'utf8'))).toBeValidBlueprint();
  }
);

test.each(['blueprints/invalid_template_string.yaml', 'blueprints/invalid_multiline_template_string.yaml'])(
  '%s is invalid blueprint',
  (file) => {
    expect(yaml.load(fs.readFileSync(path.join(__dirname, file), 'utf8'))).not.toBeValidBlueprint();
  }
);

test.each(['blueprints/examples/on_off_schedule_state_persistence.yaml'])('example blueprint %s is valid', (file) => {
  expect(
    yaml.load(fs.readFileSync(path.join(__dirname, file), 'utf8'), {
      //@ts-ignore
      schema: globalThis.BLUEPRINT_SCHEMA
    })
  ).toBeValidBlueprint();
});
