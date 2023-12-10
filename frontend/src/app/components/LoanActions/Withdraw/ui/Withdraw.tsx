import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useState } from 'react'
import { formatEther, getAddress } from 'viem'

import { type Deal } from '../../../../../api/Api.ts'
import { chain } from '../../../../config/walletConnect.tsx'
import { useStores } from '../../../../hooks'
import { useModalProperties } from '../../../../hooks/useModalProperties.tsx'
import { Button } from '../../../../UIkit'
import { stringifyError } from '../../../../utils/error'
import { BaseModal, ErrorBody, InProgressBody, SuccessOkBody } from '../../../Modal/Modal.tsx'
import { useWithdrawEthAddress } from '../model/useWithdrawEthAddress.ts'

export interface WithdrawProps {
  address: string
  isMiner?: boolean
  deal: Deal
}

export const Withdraw: React.FC<WithdrawProps> = observer(({ address, deal }) => {
  const isMiner = deal.miner?.address && getAddress(address) === getAddress(deal.miner?.address)
  const isGiver = deal.giver && getAddress(address) === getAddress(deal.giver)
  const statusFinished = deal.status === 'Finished'
  const [date, setDate] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date())
    }, 5000)

    return () => {
      clearInterval(timer)
    }
  }, [])
  const minerAvailableToWithdraw = useMemo(() => statusFinished
    ? 0n
    : deal.miner_schedule?.reduce((sum, vesting) => {
      if (vesting.locked_until && vesting.locked_until < +date) {
        return sum + BigInt(vesting.value || 0) - BigInt(vesting.received || 0)
      }

      return sum
    }, 0n) || 0n,
  [date, statusFinished, deal.miner_schedule])

  const giverAvailableToWithdraw = useMemo(() => statusFinished
    ? 0n
    : deal.giver_schedule?.reduce((sum, vesting) => {
      if (vesting.locked_until && vesting.locked_until < +date) {
        return sum + BigInt(vesting.value || 0) - BigInt(vesting.received || 0)
      }

      return sum
    }, 0n) || 0n,
  [date, statusFinished, deal.giver_schedule])

  const { modalBody, modalOpen, setModalBody, setModalOpen } =
    useModalProperties()

  const { withdrawStore } = useStores()

  const { writeAsync: method } = useWithdrawEthAddress()

  const amount = isMiner ? minerAvailableToWithdraw : giverAvailableToWithdraw

  const submit = () => {
    setModalOpen(true)
    setModalBody(<InProgressBody text='Withdrawing funds' />)
    withdrawStore.request(
      method,
      deal,
      amount,
      address as `0x${string}`,
      () => {
        setModalBody(
          <SuccessOkBody
            handleClose={() => { setModalOpen(false) } }
            description="Funds withdrawn!"
          />,
        )
      },
      (error) => {
        setModalOpen(true)
        setModalBody(
          <ErrorBody
            message={stringifyError(error)}
            onClose={() => {
              setModalOpen(false)
            }}
          />,
        )
      })
  }

  return (
    <>
      <BaseModal
        body={modalBody}
        open={modalOpen}
        isLoading={withdrawStore.isLoading}
        onClose={() => {
          setModalOpen(false)
        }}
      />
      {(isMiner || isGiver) && statusFinished && (
        <Button
          onPress={submit}
          disabled={amount === 0n}
        >
          {amount === 0n ? 'No funds to withdraw' : `Withdraw ${formatEther(amount)} ${chain.nativeCurrency.symbol}`}
        </Button>
      )}
    </>
  )
})
