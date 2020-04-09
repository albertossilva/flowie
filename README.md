# Flowie: connect functions as a flow

If you have a lot functions and you want to connect them, monitor, and build complex flow without taking care about a lot or promises, [flowie](https://www.npmjs.com/package/flowie) is the package for you.

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
[![npm](https://img.shields.io/npm/v/flowie.svg)](https://www.npmjs.com/package/flowie)
[![Build Status](https://travis-ci.org/albertossilva/flowie.svg?branch=master)](https://travis-ci.org/albertossilva/flowie)
[![Coverage Status](https://coveralls.io/repos/github/albertossilva/flowie/badge.svg?branch=master)](https://coveralls.io/github/albertossilva/flowie?branch=master)
[![dependencies Status](https://david-dm.org/albertossilva/flowie/status.svg)](https://david-dm.org/albertossilva/flowie)
[![NPM Size](https://img.shields.io/bundlephobia/min/flowie/latest.svg)](https://bundlephobia.com/result?p=flowie)
[![TypeScript](https://img.shields.io/badge/Typescript-v3.8-blue)](https://github.com/ellerbrock/typescript-badges/)

## Contents
- [Getting started](#getting-started)
- [Creating modes](#running-modes)
- [Runtime API](#runtime-api)
  - [Creating flows](#api-creating)
  - [The flow API](#api-the-flow)
    - [.pipe](#pipe-api-the-flow)
    - [.split](#split-api-the-flow)
    - [Complex Example](#complex-example-api-the-flow)
- [Configuration API](#configuration-api)
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

const flow = flowie(getJSONByUrl).pipe(getLatituteLongititudeOfISS).pipe(whereIAm)

const { lastResult } = await flow('http://api.open-notify.org/iss-now.json') // the result of your geococode service
```

## <a name="runtime-mode"></a>Running modes
There are two ways of creating a flow:
1. **Runtime** ➡️ `flowie(...ƒunctions | Flowie): Flowie`: it create a flow with its own container.
2. **Configuration** ➡️ `flowie(flow: FlowDeclaration, container: FlowieContainer): Flowie`: it builds a flow from a declaration and uses this container.

> a `container` is the object that flowie uses to store function details, i.e: name, isAsync, etc. When building using the configuration.

Both modes return `Flowie` flows, which can be execute or enhanced.

## <a name="runtime-api"></a>Runtime API

---
### <a name="api-creating"></a>Creating `flowie(...flowItemsList: FlowItem[]) : Flowie`

This creates a flow that takes the initial argument then the *"flow"* starts.
> Two or more functions means that it will works as a split split
`FlowItem` is a `Function` or another `Flowie`

Suppose you have these functions:
* `isMyLuckyNumber`: that receives `number` and returns `boolean`
* `isABadLuckyNumber`: that receives `number` and returns `boolean`
* `isPositiveNegativeOrZero`: that receives `number` and returns `'positive | negative | zero'`

1. One function creation `const flow = flowie(isMyLuckyNumber) // Flowie<number, boolean>`
  <br>flow will be a function that receives a number and return boolean

#### <a name="splitting"></a>
2. More than one function creation
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

### <a name="api-the-flow"></a> The flow API `Flowie<Argument, Result, InitialArgument>`

This is the `result` returned by `flowie` function, for instance:
`const flow: Flowie<string, boolean, number> = flowie(...)`

It means, that this is a flow, that takes a `number` as first argument, and the last step of the flow is a flow item
that receives a string and returns a boolean.

> Flowie `await` method that are `async`


---
#### <a name="pipe-api-the-flow"></a> .pipe(flowItem: FlowItem)

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
#### <a name="split-api-the-flow"></a> .split(...flowItemList: FlowItem[])

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
#### <a name="complex-example-api-the-flow"></a>More complex example
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

const { lastResult } = secondDeegreeResolverFlow('4x² + 4x + 1 = 0')
console.log(lastResult) // { x1:  }
```
See the execution on [runkit, clicking here](https://runkit.com/albertossilva/2nd-degree-equation-flowie)


## <a name="configuration-api"></a>Configuration API
## <a name="plans"></a>Plans
There is no priorization on this list yet

- [x] Pipe/Split (Runtime and Configuration)
- [x] Async Pipe/Split (Runtime and Configuration)
- [x] Accept flowie as flowItem
- [x] Check on runkit
- [ ] Accept generators on pipe/split
- [ ] Accept async generators on pipe/split
- [ ] add Debug library calls
- [ ] add Flags (actAsGenerator, actAsAsync) on .pipe/.split in order to be able to receive functions that returns `() => Promise.resolve()` or iterators () => { [Symbol.iterator]: () => {} }
- [ ] Accept yaml as flow declaration on configuration mode
- [ ] Validate flow declaration on configuration mode
- [ ] Detect recursion flowie on runtime
- [ ] Validate parameteres on Flowie
- [ ] Reporting (timePerFunction, numberOfCalls, slowestExecution, AvgExecution, fastestExecution )
- [ ] Error Handling (interrupt flow or not)
- [ ] Backpressure for generator
- [ ] Batching***
- [ ] Limit concurrency on split
- [ ] Context Parameters
- [ ] Event Emitter
- [ ] Enhance reports (custom configuration, log input/output)
- [ ] Filter flowItem (FlowItem that 'stop' current flow or subFlow)
- [ ] Report flowItem (bypass argument, but is called)
- [ ] Decider flowItem (like split, with names, based on argument, decide which flow ot execute)
- [ ] Mechanism to verify inputs/outputs
