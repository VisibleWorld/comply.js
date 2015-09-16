# comply.js

[![Build Status](https://travis-ci.org/VisibleWorld/comply.js.svg?branch=master)](https://travis-ci.org/VisibleWorld/comply.js)
[![Coverage Status](https://coveralls.io/repos/VisibleWorld/comply.js/badge.svg?branch=master&service=github)](https://coveralls.io/github/VisibleWorld/comply.js?branch=master)

Validate and coerce objects into expected types.

**comply.js** lets you validate arbitrarily deep and complex object hierarchies
by combining composable schemas. Fields can be validated and optionally
coerced to a desired type or sanitized. Validation yields *true* and the
sanitized object or *false* and a list of errors.

## Installation

```bash
$ npm install comply-js
```

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

## Usage

**comply.js** validates objects with schemas. If an object passes validation,
**comply.js** also returns a sanitized version of the object, containing only
the keys listed in the schema. Additional keys are ignored. Values can be
_sanitized_ (or mutated, or anything else) before being returned.

### Creating a Basic Schema

Schemas are instantiated with a ruleset. A ruleset is an object literal that
describes the final, 'sanitized' version of an object. Each key in the ruleset
matches a key in the object. If the object contains keys that are not in the
schema, they are ignored and are not returned in the sanitized object.

Ruleset keys should match input keys exactly, with one exception: if the
ruleset key ends with '?', it means the key is optional, and validation will
pass even if the key is not present in the input. For example, the schema here:

```js
var artist = new Schema({
  name: Schema.type.String(1),
  'style?': Schema.type.String(1),
});
```

Will validate both of the following objects:

```js
var raphael = {
  name: 'Raffaello Sanzio',
  style: 'High Renaissance',
};

var elGreco {
  name: 'Doménikos Theotokópoulos',
};
```

After creating the schema, test objects with the `test` method. It returns
an object with the validation result, the sanitized object (if validation
passed), and any error messages (if validation failed). In the following
example:

```js
var result = artist.test(raphael);

```

The result object would be:

```js
{
  valid: true,
  errors: [],
  object: {
    name: 'Raffaello Sanzio',
    style: 'High Renaissance',
  },
}
```

An example of failed validation would be:

```js
{
  valid: false,
  errors: [ 'Field "name" is invalid.' ],
  object: {},
}
```

### Rule Generators

In the previous section, a ruleset was constructed with `Schema.type.String`.
This is one of several rule generators included in **comply.js**. When creating
a schema, you can supply complicated rules, or use one of the generators to
do the dirty work for you.

#### Numbers

The `Schema.type.Number` rule generator can check that a value is greater than
or equal to a minimum; less than or equal to a maximum; and run any other
numeric validation. The sanitized version will be coerced to a number or float,
depending on its format.

To only check that the value is a number:

```js
var livingPerson = new Schema({
  age: Schema.type.Number(),
});
```

To check for a minimum, since ages cannot be negative:

```js
var livingPerson = new Schema({
  age: Schema.type.Number(1),
});
```

To check for a range, since no one has ever outlived [Jeanne Calment](https://en.wikipedia.org/wiki/Jeanne_Calment):

```js
var livingPerson = new Schema({
  age: Schema.type.Number(1, 122),
});
```

Or to validate arbitrary conditions:

```js
function isEven(n) {
  return n % 2 === 0;
}

var evenlyAgedPerson = new Schema({
  age: Schema.type.Number(isEven),
});
```

These can be combined, as well. If the first argument is a number, it is the
minimum accepted value. If the second argument is a number, it is the maximum
accepted value. All other arguments are assumed to be arbitrary validators.

#### Strings

Like the Number rule generator, `Schema.type.String` can check that a value is
a string; that it has a minimum length; that is has a maximum length; that it
passes any other string validations; or that it matches a regular expression.
The sanitized version will be coerced to a string and trimmed of whitespace.

To only check that the value is a string:

```js
var dinosaur = new Schema({
  scientificName: Schema.type.String(),
});
```

To check that it has a minimum length:

```js
var dinosaur = new Schema({
  scientificName: Schema.type.String(1),
});
```

To check that it is between 1 and 200 characters long:

```js
var dinosaur = new Schema({
  scientificName: Schema.type.String(1, 200),
});
```

To ensure it matches a regular expression:

```js
var dinosaurYouWouldInviteToAParty = new Schema({
  name: Schema.type.String(/(handsome|beautiful|interesting|polite) (stegosaurus|t rex|ankylosaur)/i),
});
```

Or to validate arbitrary conditions:

```js
function wasInJurassicWorld(name) {
  // some complicated function that checks if a dinosaur appeared in Jurassic
  // World by searching a website that is like IMDB for dinosaurs
}

var hollywoodDinosaur = new Schema({
  name: Schema.type.String(hollywoodDinosaur),
});
```
These can be combined, as well. If the first argument is a number, it is the
minimum accepted length. If the second argument is also a number, it is the
maximum accepted length. Otherwise, if the first argument is a regular
expression, the value must match. All other arguments are assumed to be
arbitrary validators.

#### Arrays

The `Schema.type.Array` rule generator can check that a value is an array; that
it has a minimum length; that it has a maximum length; and that all its
elements pass the given validators or Schema.

To only check that the value is an array:

```js
var shopping = new Schema({
  fruits: Schema.type.Array(),
});
```

To check that it has a minimum length:

```js
var shopping = new Schema({
  vegetables: Schema.type.Array(2),
});
```

To check that it has between 2 and 5 elements:

```js
var shopping = new Schema({
  differentFlavorsOfArtisanalChocolate: Schema.type.Array(2, 5),
});
```

To validate that each element passes another schema:

```js
var localProduce = new Schema({
  name: Schema.type.String(1),
  farm: Schema.type.String(1),
});

var shopping = new Schema({
  vegetables: Schema.type.Array(1, localProduce),
});
```

Or to validate that each element matches an arbitrary condition:

```js
var isRed = new Schema({
  name: Schema.type.String(/flamin' hot cheetos|tomato|ketchup/i),
});

var shopping = new Schema({
  partyNecessities: Schema.type.Array(isRed),
});
```

These can be combined, as well. If the first argument is a number, it is the
minimum accepted length. If the second argument is also a number, it is the
maximum accepted length. All other arguments are assumed to be arbitrary
validators. If one or more schemas are given, the first one will be tested
against each element.

#### Booleans

The `Schema.type.Boolean` rule generator accepts any value and sanitizes it
into `true` or `false`. [Truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy)
values become `true`. [Falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)
values become `false` with two important exceptions: `undefined` and `null`,
for the purposes of validation, are considered _the absence of a value_ and not
falsy. For example, given the following schema:

```js
var bicycle = new Schema({
  isFixedGearAndSoSoCool: Schema.type.Boolean(),
});
```

This object will validate:

```js
var pureFixCycle = {
  isFixedGearAndSoSoCool: true,
};
```

And this one will fail:

```js
var bus = {
  isFixedGearAndSoSoCool: null,
};
```

Unlike other rule generators, this does not take any arguments, not even
additional validators.

#### Anything at All

The `Schema.type.Pass` rule generator accepts any value, judgment-free. It is
useful when you need to validate that input contains some value for a given
key but you do not care what it is, so long as it is not `null` or `undefined`.

```js
var quizAnswer = new Schema({
  number: Schema.type.Number(1),
  solution: Schema.type.Pass(),
});
```

## License

  [MIT](LICENSE)
