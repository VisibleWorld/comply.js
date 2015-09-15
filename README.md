# comply.js

[![Build Status](https://travis-ci.org/VisibleWorld/comply.js.svg?branch=master)](https://travis-ci.org/VisibleWorld/comply.js)
[![Coverage Status](https://coveralls.io/repos/VisibleWorld/comply.js/badge.svg?branch=master&service=github)](https://coveralls.io/github/VisibleWorld/comply.js?branch=master)

Validate and coerce objects into expected types.

*comply.js* lets you validate arbitrarily deep and complex object hierarchies
by combining composable schemas. Fields can be validated and optionally
coerced to a desired type or sanitized. Validation yields *true* and the
sanitized object or *false* and a list of errors.

## Quickstart

Instantiate a *schema* describing an object's acceptable state.

```js
var Schema = require('comply-js');

var personSchema = new Schema({
  firstName: Schema.type.String(1, 100),
  'middleName?': Schema.type.String(1, 100),
  lastName: Schema.type.String(1, 100),
  age: Schema.type.Number(1, 125)
});
```

Each schema field matches the name of a field on the object. Mark optional
fields by ending the key with a question mark.

```js
var validPerson = {
  firstName: 'Johann',
  lastName: 'Gambolputty',
  age: 50
};

assert(personSchema.test(validPerson).valid);
```

No middle name is provided; _firstName_ is present and between 1 and 100
characters long; _lastName_ is present and between 1 and 100 characters
long; and _age_ is present and between 1 and 125. _validPerson_ is a valid
instance of the schema.

```js
var invalidPerson = {
  firstName: 'Johann',
  middleName: 'Gambolputty-de-von-Ausfern-schplenden-schlitter-crass-' +
    'cren-bon-fried-digger-dangle-dungle-burstein-von-' +
    'knacker-thrasher-apple-banger-horowitz-ticolensic-grander-knotty-' +
    'spelltinkle-grandlich-grumblemeyer-spelter-wasser-kurstlich-himble-' +
    'eisen-bahnwagen-guten-abend-bitte-ein-nürnburger-bratwürstel-' +
    'gespurten-mitz-weimache-luber-hundsfut-gumberaber-schönendanker-' +
    'kalbsfleisch-mittleraucher-von-Hautkopft',
  lastName: 'of Ulm',
  age: 50
};

assert(!personSchema.test(validPerson).valid);
```

Now the middle name, normally optional, is longer than 100 characters.
Validation fails.

## License

  [MIT](LICENSE)
