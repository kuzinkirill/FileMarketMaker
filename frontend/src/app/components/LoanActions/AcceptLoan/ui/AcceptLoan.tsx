import { observer } from 'mobx-react-lite'
import React from 'react'
import { getAddress } from 'viem'

import { type Deal } from '../../../../../api/Api.ts'
import { useStores } from '../../../../hooks'
import { useModalProperties } from '../../../../hooks/useModalProperties.tsx'
import { Button } from '../../../../UIkit'
import { stringifyError } from '../../../../utils/error'
import { BaseModal, ErrorBody, InProgressBody, SuccessOkBody } from '../../../Modal/Modal.tsx'
import { useAcceptLoan } from '../model/useAcceptLoan.ts'

export interface AcceptLoanProps {
  address: string
  isMiner?: boolean
  deal: Deal
}

export const AcceptLoan: React.FC<AcceptLoanProps> = observer(({ isMiner, deal, address }) => {
  const canAccept = !isMiner && deal.status === 'Created'

  const isMinerOfTheDeal = deal.miner?.beneficiary_owner &&
    getAddress(address) === getAddress(deal.miner?.beneficiary_owner)

  const { modalBody, modalOpen, setModalBody, setModalOpen } =
    useModalProperties()

  const { acceptLoanStore } = useStores()

  const { writeAsync: method } = useAcceptLoan()

  const submit = () => {
    setModalOpen(true)
    setModalBody(<InProgressBody text='You are accepting the deal' />)
    acceptLoanStore.request(
      method,
      deal,
      () => {
        console.log('succcess, set modal body')
        setModalBody(
          <SuccessOkBody
            handleClose={() => { setModalOpen(false) } }
            description="Deal accepted!"
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
        isLoading={acceptLoanStore.isLoading}
        onClose={() => {
          setModalOpen(false)
        }}
      />
      {(isMiner && !isMinerOfTheDeal) && (
        <Button isDisabled primary fullWidth>
          Miner not allowed
        </Button>
      )}
      {canAccept && (
        <Button onPress={submit} primary fullWidth>
          Accept deal
        </Button>
      )}
    </>
  )
})
