import { FlowieContainer } from '../container/createFlowieContainer'
import {
  PreparedFlowieExecution,
  FlowElement,
  PipeFlow,
  SplitFlow,
  PreparedFlowie,
  FlowieItemDeclaration,
} from '../prepared.types'

export interface RunnableDeclaration {
  readonly isAsync: boolean
  readonly mainFlow: MainFlow
  readonly subFlows: ReadonlyArray<SubFlow>
}

export default function convertFlowDeclarationToRunnableDeclaration(
  preparedFlowieExecution: PreparedFlowieExecution,
  flowieContainer: FlowieContainer,
): RunnableDeclaration {
  const initialSubFlows = [] as ReadonlyArray<SubFlow>
  const initialMainFlow: MainFlow = {
    functionsFromContainers: [] as ReadonlyArray<string>,
    steps: [] as ReadonlyArray<Step>,
  }
  const { mainFlow, subFlows } = preparedFlowieExecution.flows.reduce(readFlowsAndSubFlows(flowieContainer), {
    subFlows: initialSubFlows,
    mainFlow: initialMainFlow,
    generatorIndexes: [],
  })

  const runnableDeclaration: RunnableDeclaration = {
    isAsync: preparedFlowieExecution.isAsync,
    mainFlow,
    subFlows,
  }

  return runnableDeclaration
}

function readFlowsAndSubFlows(flowieContainer: FlowieContainer) {
  return function readFlowsAndSubFlowsForContainer(
    readFlowsAndSubFlowsReducer: ReadFlowsAndSubFlowsReducer,
    flowElement: FlowElement,
    currentIndex: number,
    array: ReadonlyArray<unknown>,
  ): ReadFlowsAndSubFlowsReducer {
    const { mainFlow, subFlows, generatorIndexes } = readFlowsAndSubFlowsReducer

    const {
      mainFlow: newMainFlow,
      subFlows: newSubFlows,
      generatorIndexes: generatorIndexesFound,
    } = new FlowElementReader(flowieContainer, mainFlow, subFlows).read(flowElement, currentIndex)

    const newGeneratorIndexes = generatorIndexes.concat(generatorIndexesFound)

    if (currentIndex === array.length - 1 && newGeneratorIndexes.length > 0) {
      return {
        generatorIndexes: newGeneratorIndexes,
        mainFlow: {
          ...newMainFlow,
          steps: newMainFlow.steps.concat({ finishGeneratorIndexesList: newGeneratorIndexes }),
        },
        subFlows: newSubFlows,
      }
    }

    return {
      generatorIndexes: newGeneratorIndexes,
      mainFlow: newMainFlow,
      subFlows: newSubFlows,
    }
  }
}

class FlowElementReader {
  constructor(
    private readonly flowieContainer: FlowieContainer,
    private readonly mainFlow: MainFlow,
    private readonly subFlows: ReadonlyArray<SubFlow>,
  ) {
    this.readSplitItem = this.readSplitItem.bind(this)
  }

  read(flowElement: FlowElement, currentIndex: number): StepReading {
    const pipeFlow = flowElement as PipeFlow
    if (pipeFlow.pipe) return this.readPipeStep(pipeFlow, currentIndex)

    const splitFlow = flowElement as SplitFlow
    if (splitFlow.split) return this.readSplitStep(splitFlow)

    const preparedFlowie = flowElement as PreparedFlowie

    return this.readSubFlow(preparedFlowie, currentIndex)
  }

  private readPipeStep(pipeFlow: PipeFlow, currentIndex: number): StepReading {
    if (typeof pipeFlow.pipe !== 'string') {
      return this.readSubFlow(pipeFlow.pipe, currentIndex)
    }

    const { pipe: functionName, parallelExecutions } = pipeFlow
    const isGenerator = this.flowieContainer.isGeneratorFunction(functionName)
    const step = this.createStepForFunction(functionName, isGenerator, parallelExecutions)

    return {
      mainFlow: {
        functionsFromContainers: getUniqueFunctionNames(this.mainFlow.functionsFromContainers, functionName),
        steps: this.mainFlow.steps.concat(step),
      },
      subFlows: this.subFlows,
      generatorIndexes: isGenerator ? [currentIndex] : [],
    }
  }

  private readSplitStep(splitFlow: SplitFlow): StepReading {
    const initialSplitStepReading: SplitStepReading = {
      functionsFromContainers: [],
      subFlows: [],
      splitStep: {
        isAsync: false,
        split: [],
      },
    }
    const { functionsFromContainers, subFlows, splitStep } = splitFlow.split.reduce(
      this.readSplitItem,
      initialSplitStepReading,
    )

    return {
      generatorIndexes: [],
      mainFlow: {
        functionsFromContainers: getUniqueFunctionNames(
          this.mainFlow.functionsFromContainers,
          ...functionsFromContainers,
        ),
        steps: this.mainFlow.steps.concat(splitStep),
      },
      subFlows: this.subFlows.concat(subFlows),
    }
  }

  private readSplitItem(
    splitStepReading: SplitStepReading,
    flowieItemDeclaration: FlowieItemDeclaration,
    currentIndex: number,
  ): SplitStepReading {
    const { functionsFromContainers, subFlows, splitStep } = splitStepReading
    if (typeof flowieItemDeclaration !== 'string') {
      const { flowStep, subFlows: newSubFlows } = new SubFlowElementReader(this.flowieContainer).read(
        flowieItemDeclaration,
        currentIndex,
      )

      return {
        functionsFromContainers,
        subFlows: subFlows.concat(newSubFlows),
        splitStep: {
          isAsync: keepPreviousTrue(splitStep.isAsync, flowStep.isAsync),
          split: splitStep.split.concat(flowStep),
        },
      }
    }

    const isGenerator = this.flowieContainer.isGeneratorFunction(flowieItemDeclaration)
    const isAsync = this.flowieContainer.isAsyncFunction(flowieItemDeclaration)

    if (isGenerator) {
      const hash = `generator_on_split_${flowieItemDeclaration}`
      return {
        functionsFromContainers,
        subFlows: subFlows.concat({
          isAsync,
          functionsFromContainers: [flowieItemDeclaration],
          hash,
          // TODO: Parallel execution on splits
          steps: [
            { generator: flowieItemDeclaration, isAsync, parallelExecutions: 1 },
            { finishGeneratorIndexesList: [0] },
          ],
        }),
        splitStep: {
          isAsync: keepPreviousTrue(splitStep.isAsync, isAsync),
          split: splitStep.split.concat({ flow: hash, isAsync }),
        },
      }
    }

    return {
      functionsFromContainers: getUniqueFunctionNames(functionsFromContainers, flowieItemDeclaration),
      subFlows,
      splitStep: {
        isAsync: keepPreviousTrue(splitStep.isAsync, this.flowieContainer.isAsyncFunction(flowieItemDeclaration)),
        split: splitStep.split.concat(flowieItemDeclaration),
      },
    }
  }

  private readSubFlow(flowElement: FlowElement, currentIndex: number): StepReading {
    const { flowStep, subFlows } = new SubFlowElementReader(this.flowieContainer).read(flowElement, currentIndex)

    return {
      generatorIndexes: [],
      mainFlow: {
        functionsFromContainers: this.mainFlow.functionsFromContainers,
        steps: this.mainFlow.steps.concat(flowStep),
      },
      subFlows: this.subFlows.concat(subFlows),
    }
  }

  private createStepForFunction(
    functionName: string,
    isGenerator: boolean,
    parallelExecutions: number,
  ): PipeStep | GeneratorStep {
    const isAsync = this.flowieContainer.isAsyncFunction(functionName)
    if (isGenerator) {
      return { generator: functionName, isAsync, parallelExecutions }
    }

    return { pipe: functionName, isAsync }
  }
}

class SubFlowElementReader {
  constructor(private readonly flowieContainer: FlowieContainer) {
    this.readSubFlowSteps = this.readSubFlowSteps.bind(this)
    this.readSubFlowSplitItem = this.readSubFlowSplitItem.bind(this)
  }

  read(flowElement: FlowElement, currentIndex: number): SubStepReading {
    const { name } = flowElement
    const hash = name || generateHash()

    const { isAsync, functionsFromContainers, steps, subFlows } = this.readSubFlow(flowElement, currentIndex)

    const subFlow: SubFlow = { isAsync, functionsFromContainers, hash, steps }

    return {
      flowStep: { flow: hash, isAsync },
      subFlows: [subFlow, ...subFlows],
    }
  }

  private readSubFlow(flowElement: FlowElement, currentIndex: number): SubFlowReading {
    const pipeFlow = flowElement as PipeFlow
    if (pipeFlow.pipe) {
      return this.readSubFlowPipe(pipeFlow, currentIndex)
    }

    const splitFlow = flowElement as SplitFlow
    if (splitFlow.split) {
      return this.readSubFlowSplit(splitFlow)
    }

    const preparedFlowie = flowElement as PreparedFlowie

    const initialFlowReading: SubFlowReading = {
      isAsync: false,
      functionsFromContainers: [],
      steps: [],
      subFlows: [],
      generatorIndexes: [],
    }

    const subFlowReading = preparedFlowie.flows.reduce(this.readSubFlowSteps, initialFlowReading)

    const { generatorIndexes } = subFlowReading

    return {
      ...subFlowReading,
      steps: subFlowReading.steps.concat(
        generatorIndexes.length ? { finishGeneratorIndexesList: generatorIndexes } : [],
      ),
    }
  }

  private readSubFlowPipe(pipeFlow: PipeFlow, currentIndex: number): SubFlowReading<PipeStep | GeneratorStep> {
    if (typeof pipeFlow.pipe === 'string') {
      const { pipe: functionName, parallelExecutions } = pipeFlow
      const isGenerator = this.flowieContainer.isGeneratorFunction(functionName)
      const isAsync = this.flowieContainer.isAsyncFunction(functionName)

      const step = this.createStepForFunctionForSubFlow(functionName, isGenerator, parallelExecutions)

      return {
        isAsync,
        functionsFromContainers: [functionName],
        steps: [step],
        subFlows: [],
        generatorIndexes: isGenerator ? [currentIndex] : [],
      }
    }

    const { flowStep, subFlows } = new SubFlowElementReader(this.flowieContainer).read(pipeFlow.pipe, currentIndex)

    return {
      isAsync: flowStep.isAsync,
      functionsFromContainers: [],
      steps: [flowStep],
      subFlows,
      generatorIndexes: [],
    }
  }

  private readSubFlowSplit(splitFlow: SplitFlow): SubFlowReading<SplitStep> {
    const initialFlowReading: SubFlowReading<SplitStep> = {
      isAsync: false,
      functionsFromContainers: [],
      steps: [{ split: [], isAsync: false }],
      subFlows: [],
      generatorIndexes: [],
    }

    return splitFlow.split.reduce(this.readSubFlowSplitItem, initialFlowReading)
  }

  private readSubFlowSplitItem(
    subFlowReading: SubFlowReading<SplitStep>,
    flowieItemDeclaration: FlowieItemDeclaration,
    currentIndex: number,
  ): SubFlowReading<SplitStep> {
    const { isAsync, functionsFromContainers, steps, subFlows } = subFlowReading
    const [splitStep] = steps as ReadonlyArray<SplitStep>

    if (typeof flowieItemDeclaration === 'string') {
      const isGenerator = this.flowieContainer.isGeneratorFunction(flowieItemDeclaration)
      const willBeAsync = keepPreviousTrue(isAsync, this.flowieContainer.isAsyncFunction(flowieItemDeclaration))

      if (isGenerator) {
        const hash = `generator_on_split_${flowieItemDeclaration}`

        return {
          isAsync: willBeAsync,
          functionsFromContainers,
          steps: [
            {
              split: splitStep.split.concat({ flow: hash, isAsync: willBeAsync }),
              isAsync: willBeAsync,
            },
          ],
          subFlows: subFlows.concat({
            isAsync,
            functionsFromContainers: [flowieItemDeclaration],
            hash,
            // TODO: Parallel executions for split
            steps: [
              { generator: flowieItemDeclaration, isAsync, parallelExecutions: 1 },
              { finishGeneratorIndexesList: [0] },
            ],
          }),
          generatorIndexes: [],
        }
      }

      return {
        isAsync: willBeAsync,
        functionsFromContainers: getUniqueFunctionNames(functionsFromContainers, flowieItemDeclaration),
        steps: [
          {
            split: splitStep.split.concat(flowieItemDeclaration),
            isAsync: willBeAsync,
          },
        ],
        subFlows,
        generatorIndexes: [],
      }
    }

    const { flowStep, subFlows: collectedSubFlows } = new SubFlowElementReader(this.flowieContainer).read(
      flowieItemDeclaration,
      currentIndex,
    )

    const willBeAsync = keepPreviousTrue(isAsync, flowStep.isAsync)
    return {
      isAsync: willBeAsync,
      functionsFromContainers,
      steps: [
        {
          split: splitStep.split.concat(flowStep),
          isAsync: willBeAsync,
        },
      ],
      subFlows: subFlows.concat(collectedSubFlows),
      generatorIndexes: [],
    }
  }

  private readSubFlowSteps(
    subFlowReading: SubFlowReading,
    flowElement: FlowElement,
    currentIndex: number,
  ): SubFlowReading {
    const { isAsync, steps, subFlows, functionsFromContainers, generatorIndexes } = this.readSubFlowItem(
      flowElement,
      currentIndex,
    )

    return {
      isAsync: keepPreviousTrue(subFlowReading.isAsync, isAsync),
      functionsFromContainers: getUniqueFunctionNames(
        subFlowReading.functionsFromContainers,
        ...functionsFromContainers,
      ),
      steps: subFlowReading.steps.concat(steps),
      subFlows: subFlowReading.subFlows.concat(subFlows),
      generatorIndexes: subFlowReading.generatorIndexes.concat(generatorIndexes),
    }
  }

  private readSubFlowItem(flowElement: FlowElement, currentIndex: number): SubFlowReading {
    const preparedFlowie = flowElement as PreparedFlowie
    if (preparedFlowie.flows) {
      const { flowStep, subFlows } = new SubFlowElementReader(this.flowieContainer).read(flowElement, currentIndex)
      return {
        isAsync: flowStep.isAsync,
        functionsFromContainers: [],
        steps: [flowStep],
        subFlows,
        generatorIndexes: [],
      }
    }

    return new SubFlowElementReader(this.flowieContainer).readSubFlow(flowElement, currentIndex)
  }

  private createStepForFunctionForSubFlow(
    functionName: string,
    isGenerator: boolean,
    parallelExecutions: number,
  ): PipeStep | GeneratorStep {
    const isAsync = this.flowieContainer.isAsyncFunction(functionName)
    if (isGenerator) {
      return { generator: functionName, isAsync, parallelExecutions }
    }

    return { pipe: functionName, isAsync }
  }
}

function getUniqueFunctionNames(
  functionNames: ReadonlyArray<string>,
  ...newValues: ReadonlyArray<string>
): ReadonlyArray<string> {
  return Array.from(new Set(functionNames.concat(newValues)))
}

function keepPreviousTrue(previous: boolean, next: boolean) {
  return previous || next
}

function generateHash(): string {
  return Math.random().toString(36).slice(2)
}

interface MainFlow {
  readonly functionsFromContainers: ReadonlyArray<string>
  readonly steps: ReadonlyArray<Step>
}

interface SubFlow {
  readonly isAsync: boolean
  readonly functionsFromContainers: ReadonlyArray<string>
  readonly hash: string
  readonly steps: ReadonlyArray<Step>
}

export type Step = PipeStep | SplitStep | FlowStep | GeneratorStep | FinishGeneratorsStep

type PipeStep = { readonly pipe: string; readonly isAsync: boolean } | FlowStep
interface SplitStep {
  readonly split: ReadonlyArray<string | FlowStep>
  readonly isAsync: boolean
}
interface GeneratorStep {
  readonly generator: string
  readonly isAsync: boolean
  readonly parallelExecutions: number
}

interface FinishGeneratorsStep {
  readonly finishGeneratorIndexesList: ReadonlyArray<number>
}

interface FlowStep {
  readonly isAsync: boolean
  readonly flow: string
}

interface ReadFlowsAndSubFlowsReducer {
  readonly mainFlow: MainFlow
  readonly subFlows: ReadonlyArray<SubFlow>
  readonly generatorIndexes: ReadonlyArray<number>
}

interface StepReading {
  readonly mainFlow: MainFlow
  readonly generatorIndexes: ReadonlyArray<number>
  readonly subFlows: ReadonlyArray<SubFlow>
}
interface SubStepReading {
  readonly flowStep: FlowStep
  readonly subFlows: ReadonlyArray<SubFlow>
}
interface SplitStepReading {
  readonly functionsFromContainers: ReadonlyArray<string>
  readonly subFlows: ReadonlyArray<SubFlow>
  readonly splitStep: SplitStep
}

interface SubFlowReading<StepType = Step> {
  readonly isAsync: boolean
  readonly functionsFromContainers: ReadonlyArray<string>
  readonly steps: ReadonlyArray<StepType>
  readonly subFlows: ReadonlyArray<SubFlow>
  readonly generatorIndexes: ReadonlyArray<number>
}
