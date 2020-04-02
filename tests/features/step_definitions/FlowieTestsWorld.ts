export default interface FlowieTestsWorld {
  setWorldConstructor(worldConstructor: () => World): void
}

export interface World {
  name: string
}
