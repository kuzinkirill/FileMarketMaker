import { parseEther } from 'viem'

import { type PlaceLoanFormValues } from './PlaceLoanFormValues.ts'

export interface PlaceLoanParams {
  actorId: bigint
  minerValues: bigint[]
  giverValues: bigint[]
  minerSchedule: bigint[]
  giverSchedule: bigint[]
}

export const formToPlaceLoanParams = (
  values: PlaceLoanFormValues, actorId: string | number | undefined | null,
): PlaceLoanParams | undefined =>
  values.toBorrow && values.toReturn && values.minerCanUseFundsAfter && values.giverCanClaimFundsAfter && actorId
    ? ({
      actorId: BigInt(actorId),
      minerValues: [BigInt(parseEther(values.toReturn + ''))],
      giverValues: [BigInt(parseEther(values.toBorrow + ''))],
      minerSchedule: [BigInt(Math.round(+values.minerCanUseFundsAfter / 1000))],
      giverSchedule: [BigInt(Math.round(+values.giverCanClaimFundsAfter / 1000))],
    })
    : undefined
