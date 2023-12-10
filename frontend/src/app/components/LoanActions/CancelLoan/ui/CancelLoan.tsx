import { observer } from 'mobx-react-lite'
import React from 'react'

import { type Deal } from '../../../../../api/Api.ts'
import { useStores } from '../../../../hooks'
import { useModalProperties } from '../../../../hooks/useModalProperties.tsx'
import { Button } from '../../../../UIkit'
import { stringifyError } from '../../../../utils/error'
import { BaseModal, ErrorBody, InProgressBody, SuccessOkBody } from '../../../Modal/Modal.tsx'
import { useCancelLoan } from '../model/useCancelLoan.ts'

export interface CancelLoanProps {
  isMiner?: boolean
  deal: Deal
  address: string
}

export const CancelLoan: React.FC<CancelLoanProps> = observer(({ isMiner, deal }) => {
  const canCancel = isMiner && deal.status === 'Created'
  const { modalBody, modalOpen, setModalBody, setModalOpen } =
    useModalProperties()

  const { cancelLoanStore } = useStores()

  const { writeAsync: method } = useCancelLoan()

  const submit = () => {
    setModalOpen(true)
    setModalBody(<InProgressBody text='Cancelling the deal' />)
    cancelLoanStore.request(
      method,
      deal,
      () => {
        setModalBody(
          <SuccessOkBody
            handleClose={() => { setModalOpen(false) } }
            description="Deal cancelled!"
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
        isLoading={cancelLoanStore.isLoading}
        onClose={() => {
          setModalOpen(false)
        }}
      />
      {canCancel && (
        <Button onPress={submit} primary fullWidth>
          Cancel
        </Button>
      )}
    </>
  )
})
