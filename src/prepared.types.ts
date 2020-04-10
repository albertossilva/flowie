export interface PreparedFlowie {
  readonly flows: Flows
  readonly name?: string
}

export type Flows = readonly FlowElement[]

export type FlowElement = PipeFlow | SplitFlow | PreparedFlowie

export interface PipeFlow {
  readonly pipe: FlowieItemDeclaration
  readonly name?: string
}

export interface SplitFlow {
  readonly split: readonly FlowieItemDeclaration[]
  readonly name?: string
}

export type FlowieItemDeclaration = string | FlowElement

export interface PreparedFlowieExecution extends PreparedFlowie {
  readonly isAsync: boolean
  readonly allFunctionsNames: ReadonlySet<string>
}
