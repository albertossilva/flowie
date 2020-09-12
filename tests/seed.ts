import faker from 'faker'
import get from 'lodash.get'

export function setSeed (): void {
  const seed = get(process.env, 'SEED', faker.random.number({ min: 1000, max: 9999 }))
  faker.seed(parseInt(`0${seed}`, 10))
  console.log('#'.repeat(14))
  console.log(`# SEED: ${seed} #`)
  console.log('#'.repeat(14))
}
