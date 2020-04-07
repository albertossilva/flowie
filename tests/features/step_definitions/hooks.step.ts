import { setWorldConstructor, BeforeAll } from 'cucumber'
import { assert } from 'chai'
import FlowieTestsWorld, { World } from './FlowieTestsWorld'
import compileDots from '../../../src/compiler/dot/compileDots'

function ProxyTestsWorld () {
  const state: { world: World } = {
    world: null
  }

  const methods: FlowieTestsWorld = {
    setWorldConstructor (worldContructor: () => World) {
      assert.ok(!state.world, 'Do not set world twice')
      state.world = worldContructor()

      assert.ok(state.world, 'The world constructor does not return an object')
      assert.ok(typeof state.world === 'object', 'The world constructor does not return an object')

      methodsNames += Object.keys(state.world).join(', ')
    }
  }

  let methodsNames = Object.keys(methods).join(', ')

  return new Proxy({}, {
    get (_: never, methodName: string) {
      !(methodName in methods) && assert.ok(state.world, 'No world have been configured, tag forgotten')
      const hasMethod = (methodName in methods) || (methodName in state.world)

      assert.ok(hasMethod, `Method ${methodName} is not included on ${methodsNames}`)

      return methods[methodName] || state.world[methodName]
    }
  })
}

setWorldConstructor(ProxyTestsWorld)
BeforeAll(async function () {
  await compileDots()
})
