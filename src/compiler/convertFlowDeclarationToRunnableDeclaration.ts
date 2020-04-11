
import {
  PreparedFlowieExecution,
  FlowElement,
  PipeFlow,
  SplitFlow,
  PreparedFlowie,
  FlowieItemDeclaration
} from '../prepared.types'

export interface RunnableDeclaration {
  readonly isAsync: boolean
  readonly mainFlow: MainFlow
  readonly subFlows: readonly SubFlow[]
}

export default function convertFlowDeclarationToRunnableDeclaration (
  preparedFlowieExecution: PreparedFlowieExecution,
  isAsyncFunction: CheckFunction,
  isGeneratorFunction: CheckFunction
): RunnableDeclaration {
  const initialSubFlows = [] as readonly SubFlow[]
  const initialMainFlow: MainFlow = {
    functionsFromContainers: [] as readonly string[],
    steps: [] as readonly Step[]
  }
  const { mainFlow, subFlows } = preparedFlowieExecution.flows
    .reduce(readFlowsAndSubFlows, {
      subFlows: initialSubFlows,
      mainFlow: initialMainFlow,
      isAsyncFunction,
      isGeneratorFunction,
      generatorsCount: 0
    })

  const runnableDeclaration: RunnableDeclaration = {
    isAsync: preparedFlowieExecution.isAsync,
    mainFlow,
    subFlows
  }

  return runnableDeclaration
}

function readFlowsAndSubFlows (
  readFlowsAndSubFlowsReducer: ReadFlowsAndSubFlowsReducer,
  flowElement: FlowElement,
  currentIndex: number,
  array: readonly unknown[]
): ReadFlowsAndSubFlowsReducer {
  const { isAsyncFunction, isGeneratorFunction, mainFlow, subFlows, generatorsCount } = readFlowsAndSubFlowsReducer

  const { mainFlow: newMainFlow, subFlows: newSubFlows, generatorsFound } = new FlowElementReader(
    isAsyncFunction,
    isGeneratorFunction,
    mainFlow,
    subFlows
  ).read(flowElement)

  const totalOfGenerators = generatorsCount + generatorsFound

  if (currentIndex === array.length - 1 && totalOfGenerators > 0) {
    return {
      generatorsCount: totalOfGenerators,
      mainFlow: {
        ...newMainFlow,
        steps: newMainFlow.steps.concat({ finishGeneratorsCount: totalOfGenerators })
      },
      subFlows: newSubFlows,
      isAsyncFunction: readFlowsAndSubFlowsReducer.isAsyncFunction,
      isGeneratorFunction: readFlowsAndSubFlowsReducer.isGeneratorFunction
    }
  }

  return {
    generatorsCount: totalOfGenerators,
    mainFlow: newMainFlow,
    subFlows: newSubFlows,
    isAsyncFunction: readFlowsAndSubFlowsReducer.isAsyncFunction,
    isGeneratorFunction: readFlowsAndSubFlowsReducer.isGeneratorFunction
  }
}

class FlowElementReader {
  private readonly isAsyncFunction: CheckFunction
  private readonly isGeneratorFunction: CheckFunction
  private readonly mainFlow: MainFlow
  private readonly subFlows: readonly SubFlow[]

  constructor (
    isAsyncFunction: CheckFunction,
    isGeneratorFunction: CheckFunction,
    mainFlow: MainFlow,
    subFlows: readonly SubFlow[]
  ) {
    this.isAsyncFunction = isAsyncFunction
    this.isGeneratorFunction = isGeneratorFunction
    this.mainFlow = mainFlow
    this.subFlows = subFlows

    this.readSplitItem = this.readSplitItem.bind(this)
  }

  read (flowElement: FlowElement): StepReading {
    const pipeFlow = flowElement as PipeFlow
    if (pipeFlow.pipe) return this.readPipeStep(pipeFlow)

    const splitFlow = flowElement as SplitFlow
    if (splitFlow.split) return this.readSplitStep(splitFlow)

    const preparedFlowie = flowElement as PreparedFlowie

    return this.readSubFlow(preparedFlowie)
  }

  private readPipeStep (pipeFlow: PipeFlow): StepReading {
    if (typeof pipeFlow.pipe === 'string') {
      const functionName = pipeFlow.pipe
      const isGenerator = this.isGeneratorFunction(functionName)
      const step = this.createStepForFunction(functionName, isGenerator)

      return {
        mainFlow: {
          functionsFromContainers: getUniqueFunctionNames(this.mainFlow.functionsFromContainers, functionName),
          steps: this.mainFlow.steps.concat(step)
        },
        subFlows: this.subFlows,
        generatorsFound: Number(isGenerator)
      }
    }

    return this.readSubFlow(pipeFlow.pipe)
  }

  private readSplitStep (splitFlow: SplitFlow): StepReading {
    const initialSplitStepReading: SplitStepReading = {
      functionsFromContainers: [],
      subFlows: [],
      splitStep: {
        isAsync: false,
        split: []
      }
    }
    const { functionsFromContainers, subFlows, splitStep } = splitFlow.split.reduce(
      this.readSplitItem,
      initialSplitStepReading
    )

    return {
      generatorsFound: 0,
      mainFlow: {
        functionsFromContainers: getUniqueFunctionNames(
          this.mainFlow.functionsFromContainers,
          ...functionsFromContainers
        ),
        steps: this.mainFlow.steps.concat(splitStep)
      },
      subFlows: this.subFlows.concat(subFlows)
    }
  }

  private readSplitItem (
    splitStepReading: SplitStepReading, flowieItemDeclaration: FlowieItemDeclaration
  ): SplitStepReading {
    const { functionsFromContainers, subFlows, splitStep } = splitStepReading
    if (typeof flowieItemDeclaration === 'string') {
      const isGenerator = this.isGeneratorFunction(flowieItemDeclaration)
      const isAsync = this.isAsyncFunction(flowieItemDeclaration)

      if (isGenerator) {
        const hash = `generator_on_split_${flowieItemDeclaration}`
        return {
          functionsFromContainers,
          subFlows: subFlows.concat({
            isAsync,
            functionsFromContainers: [flowieItemDeclaration],
            hash,
            steps: [{ generator: flowieItemDeclaration, isAsync }, { finishGeneratorsCount: 1 }]
          }),
          splitStep: {
            isAsync: keepPreviousTrue(splitStep.isAsync, isAsync),
            split: splitStep.split.concat({ flow: hash, isAsync })
          }
        }
      }

      return {
        functionsFromContainers: getUniqueFunctionNames(functionsFromContainers, flowieItemDeclaration),
        subFlows,
        splitStep: {
          isAsync: keepPreviousTrue(splitStep.isAsync, this.isAsyncFunction(flowieItemDeclaration)),
          split: splitStep.split.concat(flowieItemDeclaration)
        }
      }
    }

    const { flowStep, subFlows: newSubFlows } = new SubFlowElementReader(this.isAsyncFunction, this.isGeneratorFunction)
      .read(flowieItemDeclaration)

    return {
      functionsFromContainers,
      subFlows: subFlows.concat(newSubFlows),
      splitStep: {
        isAsync: keepPreviousTrue(splitStep.isAsync, flowStep.isAsync),
        split: splitStep.split.concat(flowStep)
      }
    }
  }

  private readSubFlow (flowElement: FlowElement): StepReading {
    const { flowStep, subFlows } = new SubFlowElementReader(this.isAsyncFunction, this.isGeneratorFunction)
      .read(flowElement)

    return {
      generatorsFound: 0,
      mainFlow: {
        functionsFromContainers: this.mainFlow.functionsFromContainers,
        steps: this.mainFlow.steps.concat(flowStep)
      },
      subFlows: this.subFlows.concat(subFlows)
    }
  }

  private createStepForFunction (functionName: string, isGenerator: boolean): PipeStep | GeneratorStep {
    const isAsync = this.isAsyncFunction(functionName)
    if (isGenerator) {
      return { generator: functionName, isAsync }
    }

    return { pipe: functionName, isAsync }
  }
}

class SubFlowElementReader {
  private readonly isAsyncFunction: CheckFunction
  private readonly isGeneratorFunction: CheckFunction

  constructor (isAsyncFunction: CheckFunction, isGeneratorFunction: CheckFunction) {
    this.isAsyncFunction = isAsyncFunction
    this.isGeneratorFunction = isGeneratorFunction
    this.readSubFlowSteps = this.readSubFlowSteps.bind(this)
    this.readSubFlowSplitItem = this.readSubFlowSplitItem.bind(this)
  }

  read (flowElement: FlowElement): SubStepReading {
    const { name } = flowElement
    const hash = name || generateHash()

    const { isAsync, functionsFromContainers, steps, subFlows } = this.readSubFlow(flowElement)

    const subFlow: SubFlow = { isAsync, functionsFromContainers, hash, steps }

    return {
      flowStep: { flow: hash, isAsync },
      subFlows: [subFlow, ...subFlows]
    }
  }

  private readSubFlow (flowElement: FlowElement): SubflowReading {
    const pipeFlow = flowElement as PipeFlow
    if (pipeFlow.pipe) {
      return this.readSubFlowPipe(pipeFlow)
    }

    const splitFlow = flowElement as SplitFlow
    if (splitFlow.split) {
      return this.readSubFlowSplit(splitFlow)
    }

    const preparedFlowie = flowElement as PreparedFlowie

    const initialFlowReading: SubflowReading = {
      isAsync: false,
      functionsFromContainers: [],
      steps: [],
      subFlows: [],
      generatorsCount: 0
    }

    const subFlowReading = preparedFlowie.flows.reduce(this.readSubFlowSteps, initialFlowReading)

    const { generatorsCount } = subFlowReading

    return {
      ...subFlowReading,
      steps: subFlowReading.steps.concat(generatorsCount ? { finishGeneratorsCount: generatorsCount } : [])
    }
  }

  private readSubFlowPipe (pipeFlow: PipeFlow): SubflowReading<PipeStep | GeneratorStep> {
    if (typeof pipeFlow.pipe === 'string') {
      const functionName = pipeFlow.pipe
      const isAsync = this.isAsyncFunction(functionName)
      const isGenerator = this.isGeneratorFunction(functionName)

      const step = this.createStepForFunctionForSubFlow(functionName, isGenerator)

      return {
        isAsync,
        functionsFromContainers: [functionName],
        steps: [step],
        subFlows: [],
        generatorsCount: Number(isGenerator)
      }
    }

    const { flowStep, subFlows } = new SubFlowElementReader(this.isAsyncFunction, this.isGeneratorFunction)
      .read(pipeFlow.pipe)

    return {
      isAsync: flowStep.isAsync,
      functionsFromContainers: [],
      steps: [flowStep],
      subFlows,
      generatorsCount: 0
    }
  }

  private readSubFlowSplit (splitFlow: SplitFlow): SubflowReading<SplitStep> {
    const initialFlowReading: SubflowReading<SplitStep> = {
      isAsync: false,
      functionsFromContainers: [],
      steps: [{ split: [], isAsync: false }],
      subFlows: [],
      generatorsCount: 0
    }

    return splitFlow.split.reduce(this.readSubFlowSplitItem, initialFlowReading)
  }

  private readSubFlowSplitItem (
    subflowReading: SubflowReading<SplitStep>,
    flowieItemDeclaration: FlowieItemDeclaration
  ): SubflowReading<SplitStep> {
    const { isAsync, functionsFromContainers, steps, subFlows } = subflowReading
    const [splitStep] = steps as readonly SplitStep[]

    if (typeof flowieItemDeclaration === 'string') {
      const isGenerator = this.isGeneratorFunction(flowieItemDeclaration)
      const willBeAsync = keepPreviousTrue(isAsync, this.isAsyncFunction(flowieItemDeclaration))

      if (isGenerator) {
        const hash = `generator_on_split_${flowieItemDeclaration}`

        return {
          isAsync: willBeAsync,
          functionsFromContainers,
          steps: [{
            split: splitStep.split.concat({ flow: hash, isAsync: willBeAsync }),
            isAsync: willBeAsync
          }],
          subFlows: subFlows.concat({
            isAsync,
            functionsFromContainers: [flowieItemDeclaration],
            hash,
            steps: [{ generator: flowieItemDeclaration, isAsync }, { finishGeneratorsCount: 1 }]
          }),
          generatorsCount: 0
        }
      }

      return {
        isAsync: willBeAsync,
        functionsFromContainers: getUniqueFunctionNames(functionsFromContainers, flowieItemDeclaration),
        steps: [{
          split: splitStep.split.concat(flowieItemDeclaration),
          isAsync: willBeAsync
        }],
        subFlows,
        generatorsCount: 0
      }
    }

    const { flowStep, subFlows: collectedSubFlows } = new SubFlowElementReader(
      this.isAsyncFunction,
      this.isGeneratorFunction
    ).read(flowieItemDeclaration)

    const willBeAsync = keepPreviousTrue(isAsync, flowStep.isAsync)
    return {
      isAsync: willBeAsync,
      functionsFromContainers,
      steps: [{
        split: splitStep.split.concat(flowStep),
        isAsync: willBeAsync
      }],
      subFlows: subFlows.concat(collectedSubFlows),
      generatorsCount: 0
    }
  }

  private readSubFlowSteps (subFlowReading: SubflowReading, flowElement: FlowElement): SubflowReading {
    const { isAsync, steps, subFlows, functionsFromContainers, generatorsCount } = this.readSubFlowItem(flowElement)

    return {
      isAsync: keepPreviousTrue(subFlowReading.isAsync, isAsync),
      functionsFromContainers:
        getUniqueFunctionNames(subFlowReading.functionsFromContainers, ...functionsFromContainers),
      steps: subFlowReading.steps.concat(steps),
      subFlows: subFlowReading.subFlows.concat(subFlows),
      generatorsCount: generatorsCount + subFlowReading.generatorsCount
    }
  }

  private readSubFlowItem (flowElement: FlowElement): SubflowReading {
    const preparedFlowie = flowElement as PreparedFlowie
    if (preparedFlowie.flows) {
      const { flowStep, subFlows } = new SubFlowElementReader(this.isAsyncFunction, this.isGeneratorFunction)
        .read(flowElement)
      return {
        isAsync: flowStep.isAsync,
        functionsFromContainers: [],
        steps: [flowStep],
        subFlows,
        generatorsCount: 0
      }
    }

    return new SubFlowElementReader(this.isAsyncFunction, this.isGeneratorFunction).readSubFlow(flowElement)
  }

  private createStepForFunctionForSubFlow (functionName: string, isGenerator: boolean): PipeStep | GeneratorStep {
    const isAsync = this.isAsyncFunction(functionName)
    if (isGenerator) {
      return { generator: functionName, isAsync }
    }

    return { pipe: functionName, isAsync }
  }
}

function getUniqueFunctionNames (functionNames: readonly string[], ...newValues: readonly string[]): readonly string[] {
  return Array.from(new Set(functionNames.concat(newValues)))
}

function keepPreviousTrue (previous: boolean, next: boolean) {
  return previous || next
}

function generateHash (): string {
  return Math.random().toString(36).slice(2)
}

interface MainFlow {
  readonly functionsFromContainers: readonly string[]
  readonly steps: readonly Step[]
}

interface SubFlow {
  readonly isAsync: boolean
  readonly functionsFromContainers: readonly string[]
  readonly hash: string
  readonly steps: readonly Step[]
}

export type Step = PipeStep | SplitStep | FlowStep | GeneratorStep | FinishGeneratorsStep

type PipeStep = { readonly pipe: string, readonly isAsync: boolean } | FlowStep
interface SplitStep { readonly split: readonly (string | FlowStep)[]; readonly isAsync: boolean }
interface GeneratorStep { readonly generator: string, readonly isAsync: boolean }
interface FinishGeneratorsStep { readonly finishGeneratorsCount: number }

interface FlowStep {
  readonly isAsync: boolean
  readonly flow: string
}

interface CheckFunction {
  (functionName: string): boolean
}

interface ReadFlowsAndSubFlowsReducer {
  readonly isAsyncFunction: CheckFunction
  readonly isGeneratorFunction: CheckFunction
  readonly mainFlow: MainFlow
  readonly subFlows: readonly SubFlow[]
  readonly generatorsCount: number
}

interface StepReading {
  readonly mainFlow: MainFlow
  readonly generatorsFound: number
  readonly subFlows: readonly SubFlow[]
}
interface SubStepReading { readonly flowStep: FlowStep, readonly subFlows: readonly SubFlow[] }
interface SplitStepReading {
  readonly functionsFromContainers: readonly string[]
  readonly subFlows: readonly SubFlow[],
  readonly splitStep: SplitStep
}

interface SubflowReading<StepType = Step> {
  readonly isAsync: boolean,
  readonly functionsFromContainers: readonly string[]
  readonly steps: readonly StepType[]
  readonly subFlows: readonly SubFlow[]
  readonly generatorsCount: number
}
