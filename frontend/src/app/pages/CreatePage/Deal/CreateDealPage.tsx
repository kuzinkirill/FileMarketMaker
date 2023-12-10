import { observer } from 'mobx-react-lite'
import React from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useAccount } from 'wagmi'

import { ConnectButton } from '../../../components/App/Web3'
import { DatePicker } from '../../../components/Date/DatePicker.tsx'
import { BaseModal } from '../../../components/Modal'
import { ErrorBody, InProgressBody, SuccessOkBody } from '../../../components/Modal/Modal.tsx'
import { useStores } from '../../../hooks'
import { useModalProperties } from '../../../hooks/useModalProperties.tsx'
import { useProfileStoreWithUtils } from '../../../hooks/useProfileStoreWithUtils.ts'
import { Button, FormControl, Input, PageLayout, Txt } from '../../../UIkit'
import Plug from '../../../UIkit/Plug/Plug.tsx'
import { stringifyError } from '../../../utils/error'
import {
  ButtonContainer,
  Description,
  Form,
  Label,
  TitleGroup,
} from '../helper/style/style.ts'
import { ContentField, SubTitle } from './CreateDealPage.styles.ts'
import { type PlaceLoanFormValues } from './lib/PlaceLoanFormValues.ts'
import { usePlaceLoan } from './model/usePlaceLoan.ts'

export const CreateDealPage: React.FC = observer(() => {
  const { address } = useAccount()
  const { modalBody, modalOpen, setModalBody, setModalOpen } =
    useModalProperties()
  const {
    handleSubmit,
    control,
    formState: { isValid },
    setValue,
    watch,
  } = useForm<PlaceLoanFormValues>({
    defaultValues: {
      toBorrow: '',
      toReturn: '',
      minerCanUseFundsAfter: new Date(),
      giverCanClaimFundsAfter: new Date(),
    },
  })

  const { placeLoanStore } = useStores()
  const { profileStore, isMiner } = useProfileStoreWithUtils(address)

  // const navigate = useNavigate()

  const { toBorrow, toReturn } = watch()

  const { writeAsync: method } = usePlaceLoan()

  const onSubmit: SubmitHandler<PlaceLoanFormValues> = (data) => {
    setModalOpen(true)
    setModalBody(<InProgressBody text='Deal is being created' />)
    const actorId = profileStore.data?.miner?.actor_id
    console.log({ data, actorId })
    placeLoanStore.request(
      method,
      data,
      actorId,
      () => {
        setModalBody(
          <SuccessOkBody
            handleClose={() => { setModalOpen(false) } }
            description="Your Loan proposal is ready!"
          />,
        )
        // TODO: redirect to deal page
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
      },
    )
  }

  const isLoading = profileStore.isLoading

  return (
    <>
      <BaseModal
        body={modalBody}
        open={modalOpen}
        isLoading={isLoading}
        onClose={() => {
          setModalOpen(false)
        }}
      />
      <PageLayout
        style={{
          minHeight: '100vh',
        }}
      >
        {isMiner ? (
          <Form onSubmit={handleSubmit(onSubmit)}>
            <TitleGroup>
              <h3><Txt h3 style={{ fontWeight: '600' }}>Create New Loan Proposal</Txt></h3>
              <SubTitle>
                <Txt primary1>
                  This is only available for storage miners
                </Txt>
              </SubTitle>
            </TitleGroup>

            <FormControl size={'lg'}>
              <Label paddingL>I want to borrow</Label>
              <ContentField>
                <Input<PlaceLoanFormValues>
                  withoutDefaultBorder
                  after="FIL"
                  type='number'
                  placeholder='Amount you need'
                  controlledInputProps={{
                    name: 'toBorrow',
                    setValue,
                    control,
                    rules: {
                      required: true,
                      min: 0,
                    },
                  }}
                  css={{
                    color: Number(toBorrow) < 0 ? '$red500' : undefined,
                  }}
                />
                <Description
                  secondary
                  css={{
                    marginBottom: 0,
                    padding: '0 8px',
                    color: Number(toBorrow) < 0 ? '$red500' : undefined,
                  }}
                >
                  Should be positive
                </Description>
              </ContentField>
            </FormControl>

            <FormControl size={'lg'}>
              <Label paddingL>I will return</Label>
              <ContentField>
                <Input<PlaceLoanFormValues>
                  withoutDefaultBorder
                  after="FIL"
                  type='number'
                  placeholder='Includes lender reward'
                  controlledInputProps={{
                    name: 'toReturn',
                    setValue,
                    control,
                    rules: {
                      required: true,
                      min: toBorrow,
                    },
                  }}
                  css={{
                    color: Number(toReturn) < Number(toBorrow) ? '$red500' : undefined,
                  }}
                />
                <Description
                  secondary
                  css={{
                    marginBottom: 0,
                    padding: '0 8px',
                    color: Number(toReturn) < Number(toBorrow) ? '$red500' : undefined,
                  }}
                >
                  Lenders should receive more than they lend
                </Description>
              </ContentField>
            </FormControl>

            <FormControl size="lg">
              <Label>I will use funds after</Label>
              <ContentField>
                <DatePicker
                  control={control}
                  name={'minerCanUseFundsAfter'}
                  rules={{
                    required: true,
                  }}
                />
                <Description
                  secondary
                  css={{
                    marginBottom: 0,
                    padding: '0 8px',
                  }}
                >
                  You could constrain yourself to make lender more comfortable
                </Description>
              </ContentField>
            </FormControl>

            <FormControl size="lg">
              <Label>Lender will be able to claim funds after</Label>
              <ContentField>
                <DatePicker
                  control={control}
                  name={'giverCanClaimFundsAfter'}
                  rules={{
                    required: true,
                  }}
                />
                <Description
                  secondary
                  css={{
                    marginBottom: 0,
                    padding: '0 8px',
                  }}
                >
                  The sooner the better
                </Description>
              </ContentField>
            </FormControl>

            <ButtonContainer>
              <Button
                primary
                type='submit'
                isDisabled={!isValid || !address || isLoading}
                title={isValid ? undefined : 'Required fields must be filled'}
                css={{
                  width: '320px',
                }}
              >
                Create
              </Button>
            </ButtonContainer>
          </Form>
        ) : (
          <Plug
            header={'You have to be a MINER to create a LOAN'}
            mainText={'Use your owner account'}
            buttonsBlock={(
              <>
                {!address && (
                  <ConnectButton />
                )}
              </>
            )}
          />
        )}
      </PageLayout>
    </>
  )
})
