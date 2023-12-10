import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { formatEther } from 'viem'

import { type Miner } from '../../../../../api/Api.ts'
import { chain } from '../../../../config/walletConnect.tsx'
import { useStores } from '../../../../hooks'
import { useModalProperties } from '../../../../hooks/useModalProperties.tsx'
import { Button } from '../../../../UIkit'
import { stringifyError } from '../../../../utils/error'
import { BaseModal, ErrorBody, InProgressBody, SuccessOkBody } from '../../../Modal/Modal.tsx'
import { useMinerWithdrawEthAddress } from '../model/useMinerWithdrawEthAddress.ts'

export interface MinerWithdrawProps {
  address: string
  isMiner?: boolean
  miner?: Miner
}

export const MinerWithdraw: React.FC<MinerWithdrawProps> = observer(({ miner, isMiner, address }) => {
  const { modalBody, modalOpen, setModalBody, setModalOpen } =
    useModalProperties()

  const { minerWithdrawStore } = useStores()

  const { writeAsync: method } = useMinerWithdrawEthAddress()

  const amount = useMemo(() => BigInt(miner?.available_balance || 0), [miner])

  const submit = () => {
    if (!miner) {
      return
    }
    setModalOpen(true)
    setModalBody(<InProgressBody text='Withdrawing funds' />)
    minerWithdrawStore.request(
      method,
      miner,
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
        isLoading={minerWithdrawStore.isLoading}
        onClose={() => {
          setModalOpen(false)
        }}
      />
      {isMiner && (
        <Button
          onPress={submit}
          disabled={amount === 0n}
          primary
          fullWidth
        >
          {amount === 0n ? 'No funds to withdraw' : `Withdraw ${formatEther(amount)} ${chain.nativeCurrency.symbol}`}
        </Button>
      )}
      {!isMiner && (
        <Button
          isDisabled
          primary
          fullWidth
        >
          Here miners can withdraw profits
        </Button>
      )}
    </>
  )
})
