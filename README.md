# F🅻⌽𝕎↓⒠: connect functions as a flow

If you have a lot of functions and you want to connect them, monitor, and build complex flows without taking care about
a lot of promises, [flowie](https://www.npmjs.com/package/flowie) is the package for you.

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
[![npm](https://img.shields.io/npm/v/flowie.svg)](https://www.npmjs.com/package/flowie)
[![Build Status](https://travis-ci.org/albertossilva/flowie.svg?branch=master)](https://travis-ci.org/albertossilva/flowie)
[![Coverage Status](https://coveralls.io/repos/github/albertossilva/flowie/badge.svg?branch=master)](https://coveralls.io/github/albertossilva/flowie?branch=master)
[![dependencies Status](https://david-dm.org/albertossilva/flowie/status.svg)](https://david-dm.org/albertossilva/flowie)
[![Bundle Size](https://img.shields.io/bundlephobia/min/flowie/latest.svg)](https://bundlephobia.com/result?p=flowie)
[![Install size](https://packagephobia.now.sh/badge?p=flowie)](https://packagephobia.now.sh/result?p=flowie)
[![TypeScript](https://img.shields.io/badge/Typescript-v3.8-blue)](https://github.com/ellerbrock/typescript-badges/)

## Contents
- [Getting started](#getting-started)
- [Creating modes](#running-modes)
- [Runtime API](#runtime-api)
  - [Creating flows](#api-creating)
  - [Executing a flow](#executing-api-the-flow)
  - [The flow API](#api-the-flow)
    - [.pipe](#pipe-api-the-flow)
    - [.split](#split-api-the-flow)
    - [FlowItem](#flow-item-api-the-flow)
    - [Complex Example](#other-example-api-the-flow)
- [Prepared API](#prepared-api)
- [Debugging](#debugging)
- [Plans](#plans)


## <a name="getting-started"></a>Getting started
```
npm install flowie
```

```typescript
import flowie from 'flowie'

async getJSONByUrl(url) { ... }

function getLatituteLongititudeOfISS({ iss_position: { latitude, longitude } }) {
  return { latitude, longitude }
}

async function whereIAm({ latitude, longitude }) {
    return getJSONByUrl(`https://mygeocode?q=${latitude},${longitude}`)
}

const flow = flowie(getJSONByUrl)
  .pipe(getLatituteLongititudeOfISS)
  .pipe(whereIAm)

const { lastResult } = await flow('http://api.open-notify.org/iss-now.json')
// the result of your geococode service
```

## <a name="runtime-mode"></a>Running modes
There are two ways of creating a flow:
1. **Runtime** ➡️ `flowie(...flowItemsList: FlowItem[]): Flowie`: it create a flow with its own container.
2. **Prepared** ➡️ `flowie(flow: FlowDeclaration, container: FlowieContainer): Flowie`: it builds a flow from a declaration and uses this container.

> a `container` is the object that flowie uses to store function details, i.e: name, isAsync, etc. When building using the prepared.

Both modes return `Flowie` flows, which can be execute or enhanced.

## <a name="runtime-api"></a>Runtime API

---
### <a name="api-creating"></a>Creating `flowie(...flowItemsList: FlowItem[]) : Flowie`

This creates a flow that takes the initial argument then the *"flow"* starts.
> Two or more functions means that it will works as a [split](#split-api-the-flow)
[FlowItem](#flow-item-api-the-flow) can be a `function` or another `Flowie`

Suppose you have these functions:
* `isMyLuckyNumber`: that receives `number` and returns `boolean`
* `isABadLuckyNumber`: that receives `number` and returns `boolean`
* `isPositiveNegativeOrZero`: that receives `number` and returns `'positive | negative | zero'`

1. One function creation `const flow = flowie(isMyLuckyNumber) // Flowie<number, boolean>`
  <br>flow will be a function that receives a number and return boolean

2. More than one function creation: <br>
<a name="splitting"></a>
`const flow = flowie(isMyLuckyNumber, isABadLuckyNumber, isPositiveNegativeOrZero) // Flowie<number, [boolean, boolean, string*]>`
  <br>flow will be a function that receives a number and return an tuple [boolean, boolean, string*]
  <br>we call this a split operation

3. Any time you can send function to `flowie` you can use antoher flowie, i.e
```typescript
const flow1 = flowie(isMyLuckyNumber)
const flow2 = flowie(isABadLuckyNumber)
const flow3 = flowie(isPositiveNegativeOrZero)

const flow = flowie(flow1, flow2, flow3)
```

This result is the same example 2, but the execution is a bit different.

---
### <a name="executing-api-the-flow"></a> Executing a flow `const flow: Flowie<Argument, Result, InitialArgument, Context> = flowie(...)`
`flow(initialArgument: InitialArgument, context?: Context)`<br>
Every flow receive can receive two arguments, the initialArgument, and context:

#### InitialArgument
This is provided as argument for the first FlowItems provided, does not matter if it is an function, more than one
function (split), or a Flowie.

#### Context
If the some of the flow items need context object, you can receive as second argument, but all the flow items should use
the same type for context, for instance:

```typescript
function getUser(email: string, dbConnection: DbConnection): User {...}
function getMessages(fromEmail: string, dbConnection: DbConnection): Messages[] {...}
function getFilesOfUser(fromEmail: string, dbConnection: DbConnection): Messages[] {...}

const flow = flowie(getUser, getMessages)
/* getFilesOfUser would not be accepted,
 because the second argument(context),
 and it is not of the same for the previous flow items: getUser and getMessages */
const [users, messages] = flow('michael@jackson5.com', connectToMySql('mysql://127.0.0.1:3306'))
```


---
### <a name="api-the-flow"></a> The flow API `Flowie<Argument, Result, InitialArgument, Context>`

This is the `result` returned by `flowie` function, for instance:
`const flow: Flowie<string, boolean, number, never> = flowie(...)`

It means, that this is a flow, that takes a `number` as first argument, and the last step of the flow is a flow item
that receives a string and returns a boolean.

> Flowie `await` method that are `async`


---
#### <a name="pipe-api-the-flow"></a> .pipe(flowItem: [FlowItem](#flow-item-api-the-flow))

As the name say it pipes content of previous step to the flowItem, let's say you have these objects:
```typescript
  const myFlow1 = flowie()
  const myFlow2 = flowie()
  const aFunction = () => {}
  const otherFunction = () => {}
```
You can play with them they way you want: `flowie(aFunction).pipe(myFlow1).pipe(myFlow2).pipe(otherFunction)`.
This would generate a flow with four steps, executing them in order.

---
#### <a name="split-api-the-flow"></a> .split(...flowItemList: [FlowItem](#flow-item-api-the-flow)[])

Splitting on `flowie` is a step that receives one argument call more them on flowItem in paralell,
> if you create a flowie with more then one function, it means start splitting, as mentioned [Here](#splitting)

The step after a splitting will receive the tuple of result of the split:
```typescript
const add50 = (x:number) => x + 50
const add10 = (x:number) => ({ plus10: x + 10 })
const add20 = (x:number) => ({ plus20: x + 20 })

const whatDoIReceive = (question: any) => console.log(question)

const flow = flowie(add50).split(add10, add20).pipe(whatDoIReceive)
flow(10)
// this would log [{ plus10: 70 }, { plus20: 80 }]
// I hope the math was right 😬
```

---
#### <a name="flow-item-api-the-flow"></a> FlowItem
A flow item is the node of a flow, it can be a function, an async function, a generator function,
an async generator function or a Flowie Flow. Unfornately `FlowItem` don't work well with spread(`...`) operator

##### 1. Functions
When [piping](#pipe-api-the-flow) or [splitting](#split-api-the-flow), you can use functions, the result type will be
the argument of the next flowItem on the flow.

##### 2. Async functions
When [piping](#pipe-api-the-flow) or [splitting](#split-api-the-flow), you can use async functions, the thenArgType
returned by function will be the argument of the next flowItem on the flow.

By now... just functions using `async` declarations are accepted as flowItem, so... functions like this one
`function doAsyncOperation() { return new Promise<type>(...) }` will be recognized as a function.

> If one of the functions of the flow is async, than result becomes a promise.

##### 3. Generator functions, and async generator functions
Generator functions, async or not... like `function* generator() {}` or `asyncfunction* generator() {}` are
considered as generator functions on flowie. Every flowItem piped after the same a flow item that is a generator function will be called once per `yield`, and the result will be the last value.

For instance:

```typescript
function* generatorLetters(count: number) { ... } // yields from A to Z, limited by count. Count: 3, yields A,B, and C
async function* getUserStartingWith(letter: string) { ... } // yields users that start with the letter
async function sendEmailMarketing(user: User) { ... } // sends a mail marketing to a user

const sendEmailMarketingFlow = flowie(generatorLetters).pipe(getUserStartingWith).pipe(sendEmailMarketing)
sendEmailMarketingFlow(5).then(() => console.log('Emails sent to users starting with A-E!'))
// the generator function getUserStartingWith will be invoked 5 times
// sendEmailMarketing will be invoked for every user starting with letters A,B,C,D and E
```

> If one of the functions of the flow is async generator, than result becomes a promise.

By splitting with a generator, like `flowie(generator, nonGenerator)` or `flowie.split(generator, nonGenerator)`, this will not affect next steps, so:

```typescript
const flow = flowie(generator,nonGenerator).pipe(howManyTimesAmIGoingToCalled)
flow()
```

Will cause the function `howManyTimesAmIGoingToCalled` to be called just once, but the iterator returned by generator will be consume completely.

#### 4. Flowie as flowItem
This is done to make possible re-use other flows and also build complex flows, see example below:
```typescript
const sendEmailMarketingFlow = flowie(prepareEmailMarketing).pipe(sendEmailMarketing)
const sendSMSMarketingFlow = flowie(prepareSMSMarketing).pipe(sendSMSMarketing)

async function* getUsers(dbConnection) {...}

const sendAllMarketingFlow = flowie(getUsers).split(sendEmailMarketingFlow, sendSMSMarketingFlow)
await sendAllMarketingFlow(dbConnection)
```

The flow above: `sendAllMarketingFlow`, would prepare and send emails and SMS for every user yield by `getUsers`.

---
#### <a name="other-examples-api-the-flow"></a>Other examples
```typescript
const detectsABC = (equation: string) => [a,b,c] // all number
const calculateDelta = ([a,b,c]: [number, number, number]) => [a,b,c, delta]
const returnsX1Result = ([a,b, delta]: [number, number, number]) => { x1: number, delta }
const returnsX2Result = ([a,b, delta]: [number, number, number]) => { x2: number, delta }
const mergeObjects (objects: any[]) => Object.assign({}, ...objects)

const secondDeegreeResolverFlow = flowie(detectsABC)
  .pipe(calculateDelta)
  .split(returnsX1Result, returnsX2Result)
  .pipe(mergeObjects)

const { lastResult } = secondDeegreeResolverFlow('1x² - 3x - 10 = 0')
console.log(lastResult) // {delta: 49, x": -2, x': 5}
```
See the execution on [runkit, clicking here](https://https://runkit.com/albertossilva/2nd-deegree-equation-flowiee)

---
## <a name="prepared-api"></a>Prepared API

## <a name="debugging">Debugging
The only dependency that `flowie` have is [debug](https://www.npmjs.com/package/debug), in order to help you to see what
is happening. The namespace is **flowie**, so `DEBUG=flowie*`, as the value of the variable `DEBUG` will active the debug.

One extra feature is, if the namespace `debugFlowie` is enabled, than a
[debugger](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger) statement will be included
on the first line of the flow that will be executed.

## <a name="plans"></a>Plans
There is no priorization on this list yet

- [x] Pipe/Split (Runtime and Prepared)
- [x] Async Pipe/Split (Runtime and Prepared)
- [x] Accept flowie as flowItem
- [x] Check on runkit
- [x] Accept generators on pipe/split
- [x] Accept async generators on pipe/split
- [x] Context Parameter
- [x] add Debug library calls and debugger statement to flows
- [x] Reporting (timePerFunction, numberOfCalls, slowestExecution, AvgExecution, fastestExecution)
- [ ] Event Emitter
- [ ] Validate function names on prepared
- [ ] add Flags (actAsGenerator, actAsAsync) on .pipe/.split in order to be able to receive functions that returns `() => Promise.resolve()` or iterators `() => { [Symbol.iterator]: () => {} }`
- [ ] Validate flow declaration on prepared mode
- [ ] Detect recursion flowie on runtime
- [ ] Validate parameteres on FlowItems
- [ ] Error Handling (interrupt flow or not)
- [ ] Backpressure for generator
- [ ] Batching***
- [ ] Limit concurrency on split
- [ ] Enhance reports (custom prepared, log input/output)
- [ ] Filter flowItem (FlowItem that 'stop' current flow or subFlow)
- [ ] Report flowItem (bypass argument, but is called)
- [ ] Decider flowItem (like split, with names, based on argument, decide which flow ot execute)
- [ ] ChangeContext flowItem (changes the context on item below the same flow)
- [ ] Mechanism to verify inputs/outputs
