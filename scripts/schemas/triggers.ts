class Property {
  constructor(public name: string, public type: string, public description: string, public required = false) {}
}

const x = {
  calendar: Trigger('calendar', 'Calendar', 'Calendar')
};

function Trigger(id: string, title: string, description: string, properties: Record<string, any> = {}) {
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: `http://github.com/MichaelBrunn3r/ha-blueprints/${id}`,
    title,
    description,
    type: 'object'
  };
}
