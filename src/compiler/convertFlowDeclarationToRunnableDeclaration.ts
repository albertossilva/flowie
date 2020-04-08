import { Set } from 'immutable'
import {
  FlowieExecutionDeclaration,
  FlowElement,
  PipeFlow,
  SplitFlow,
  FlowieDeclaration,
  FlowieItemDeclaration
} from '../types'

export interface RunnableDeclaration {
  readonly isAsync: boolean
  readonly mainFlow: MainFlow
  readonly subFlows: readonly SubFlow[]
}

export default function convertFlowDeclarationToRunnableDeclaration (
  flowieExecutionDeclaration: FlowieExecutionDeclaration,
  isAsyncFunction: IsAsyncFunction
): RunnableDeclaration {
  const initialSubFlows = [] as readonly SubFlow[]
  const initialMainFlow: MainFlow = {
    functionsFromContainers: [] as readonly string[],
    steps: [] as readonly Step[]
  }
  const { mainFlow, subFlows } = flowieExecutionDeclaration.flows
    .reduce(readFlowsAndSubFlows, { subFlows: initialSubFlows, mainFlow: initialMainFlow, isAsyncFunction })

  const runnableDeclaration: RunnableDeclaration = {
    isAsync: flowieExecutionDeclaration.isAsync,
    mainFlow,
    subFlows
  }

  return runnableDeclaration
}

function readFlowsAndSubFlows (readFlowsAndSubFlowsReducer: ReadFlowsAndSubFlowsReducer, flowElement: FlowElement) {
  const { isAsyncFunction, mainFlow, subFlows } = readFlowsAndSubFlowsReducer

  const { mainFlow: newMainFlow, subFlows: newSubFlows } = new FlowElementReader(isAsyncFunction, mainFlow, subFlows)
    .read(flowElement)

  return {
    mainFlow: newMainFlow,
    subFlows: newSubFlows,
    isAsyncFunction: readFlowsAndSubFlowsReducer.isAsyncFunction
  }
}

class FlowElementReader {
  private readonly isAsyncFunction: IsAsyncFunction
  private readonly mainFlow: MainFlow
  private readonly subFlows: readonly SubFlow[]

  constructor (isAsyncFunction: IsAsyncFunction, mainFlow: MainFlow, subFlows: readonly SubFlow[]) {
    this.isAsyncFunction = isAsyncFunction
    this.mainFlow = mainFlow
    this.subFlows = subFlows

    this.readSplitItem = this.readSplitItem.bind(this)
  }

  read (flowElement: FlowElement): StepReading {
    const pipeFlow = flowElement as PipeFlow
    if (pipeFlow.pipe) return this.readPipeStep(pipeFlow)

    const splitFlow = flowElement as SplitFlow
    if (splitFlow.split) return this.readSplitStep(splitFlow)

    const flowieDeclaration = flowElement as FlowieDeclaration

    return this.readSubFlow(flowieDeclaration)
  }

  private readPipeStep (pipeFlow: PipeFlow): StepReading {
    if (typeof pipeFlow.pipe === 'string') {
      return {
        mainFlow: {
          functionsFromContainers: getUniqueFunctionNames(this.mainFlow.functionsFromContainers, pipeFlow.pipe),
          steps: this.mainFlow.steps.concat({ pipe: pipeFlow.pipe, isAsync: this.isAsyncFunction(pipeFlow.pipe) })
        },
        subFlows: this.subFlows
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
      return {
        functionsFromContainers: getUniqueFunctionNames(functionsFromContainers, flowieItemDeclaration),
        subFlows,
        splitStep: {
          isAsync: splitStep.isAsync || this.isAsyncFunction(flowieItemDeclaration),
          split: splitStep.split.concat(flowieItemDeclaration)
        }
      }
    }

    const { flowStep, subFlows: newSubFlows } = new SubFlowElementReader(this.isAsyncFunction)
      .read(flowieItemDeclaration)

    return {
      functionsFromContainers,
      subFlows: subFlows.concat(newSubFlows),
      splitStep: {
        isAsync: splitStep.isAsync || flowStep.isAsync,
        split: splitStep.split.concat(flowStep)
      }
    }
  }

  readSubFlow (flowElement: FlowElement) {
    const { flowStep, subFlows } = new SubFlowElementReader(this.isAsyncFunction).read(flowElement)

    return {
      mainFlow: {
        functionsFromContainers: this.mainFlow.functionsFromContainers,
        steps: this.mainFlow.steps.concat(flowStep)
      },
      subFlows: this.subFlows.concat(subFlows)
    }
  }
}

class SubFlowElementReader {
  private readonly isAsyncFunction: IsAsyncFunction

  constructor (isAsyncFunction: IsAsyncFunction) {
    this.isAsyncFunction = isAsyncFunction
    this.readSubFlowSteps = this.readSubFlowSteps.bind(this)
    this.readSubFlowSplitItem = this.readSubFlowSplitItem.bind(this)
  }

  read (flowElement: FlowElement): SubStepReading {
    const { name } = flowElement
    const hash = name || Math.random().toString(36).slice(2)

    const { isAsync, functionsFromContainers, steps, subFlows } = this.readStepsFromSubFlow(flowElement)

    const subFlow: SubFlow = { isAsync, functionsFromContainers, hash, steps }

    return {
      flowStep: { flow: hash, isAsync },
      subFlows: [subFlow, ...subFlows]
    }
  }

  private readStepsFromSubFlow (flowElement: FlowElement): SubflowReading {
    const pipeFlow = flowElement as PipeFlow
    if (pipeFlow.pipe) {
      return this.readSubFlowPipe(pipeFlow)
    }

    const splitFlow = flowElement as SplitFlow
    if (splitFlow.split) {
      return this.readSubFlowSplit(splitFlow)
    }

    const flowieDeclaration = flowElement as FlowieDeclaration

    const initialFlowReading: SubflowReading = {
      isAsync: false,
      functionsFromContainers: [],
      steps: [],
      subFlows: []
    }

    return flowieDeclaration.flows.reduce(this.readSubFlowSteps, initialFlowReading)
  }

  private readSubFlowPipe (pipeFlow: PipeFlow): SubflowReading<PipeStep> {
    if (typeof pipeFlow.pipe === 'string') {
      const isAsync = this.isAsyncFunction(pipeFlow.pipe)
      return {
        isAsync,
        functionsFromContainers: [pipeFlow.pipe],
        steps: [{ pipe: pipeFlow.pipe, isAsync }],
        subFlows: []
      }
    }

    const { flowStep, subFlows } = new SubFlowElementReader(this.isAsyncFunction)
      .read(pipeFlow.pipe)

    return {
      isAsync: flowStep.isAsync,
      functionsFromContainers: [],
      steps: [flowStep],
      subFlows
    }
  }

  private readSubFlowSplit (splitFlow: SplitFlow): SubflowReading<SplitStep> {
    const initialFlowReading: SubflowReading<SplitStep> = {
      isAsync: false,
      functionsFromContainers: [],
      steps: [{ split: [], isAsync: false }],
      subFlows: []
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
      const willByAsync = isAsync || this.isAsyncFunction(flowieItemDeclaration)
      return {
        isAsync: willByAsync,
        functionsFromContainers: getUniqueFunctionNames(functionsFromContainers, flowieItemDeclaration),
        steps: [{
          split: splitStep.split.concat(flowieItemDeclaration),
          isAsync: willByAsync
        }],
        subFlows
      }
    }

    const { flowStep, subFlows: collectedSubFlows } = new SubFlowElementReader(this.isAsyncFunction)
      .read(flowieItemDeclaration)

    const willByAsync = isAsync || flowStep.isAsync
    return {
      isAsync: willByAsync,
      functionsFromContainers,
      steps: [{
        split: splitStep.split.concat(flowStep),
        isAsync: willByAsync
      }],
      subFlows: subFlows.concat(collectedSubFlows)
    }
  }

  private readSubFlowSteps (subFlowReading: SubflowReading, flowElement: FlowElement): SubflowReading {
    const { isAsync, steps, subFlows, functionsFromContainers } = this.readSubFlowItem(flowElement)

    return {
      isAsync: subFlowReading.isAsync || isAsync,
      functionsFromContainers:
        getUniqueFunctionNames(subFlowReading.functionsFromContainers, ...functionsFromContainers),
      steps: subFlowReading.steps.concat(steps),
      subFlows: subFlowReading.subFlows.concat(subFlows)
    }
  }

  private readSubFlowItem (flowElement: FlowElement): SubflowReading {
    const flowieDeclaration = flowElement as FlowieDeclaration
    if (flowieDeclaration.flows) {
      const { flowStep, subFlows } = new SubFlowElementReader(this.isAsyncFunction).read(flowElement)
      return {
        isAsync: flowStep.isAsync,
        functionsFromContainers: [],
        steps: [flowStep],
        subFlows
      }
    }

    return new SubFlowElementReader(this.isAsyncFunction).readStepsFromSubFlow(flowElement)
  }
}

function getUniqueFunctionNames (functionNames: readonly string[], ...newValues: readonly string[]): readonly string[] {
  return Set(functionNames.concat(newValues)).toJS()
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

export type Step = PipeStep | SplitStep | FlowStep

type PipeStep = { readonly pipe: string, readonly isAsync: boolean } | FlowStep
type SplitStep = { readonly split: readonly (string | FlowStep)[], readonly isAsync: boolean }

interface FlowStep {
  readonly isAsync: boolean
  readonly flow: string
}

interface IsAsyncFunction {
  (functionName: string): boolean
}

interface ReadFlowsAndSubFlowsReducer {
  readonly isAsyncFunction: IsAsyncFunction
  readonly mainFlow: MainFlow
  readonly subFlows: readonly SubFlow[]
}

interface StepReading { readonly mainFlow: MainFlow, readonly subFlows: readonly SubFlow[] }
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
}
