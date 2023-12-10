import { observer } from 'mobx-react-lite'

import { Modal } from '../../UIkit/Modal/Modal'
import { type DialogProps } from '../../utils/dialog'
import { type InProcessBodyProps, InProgressBody } from './Modal'

export const LoadingModal = observer(({
  onClose,
  open,
  text,
}: InProcessBodyProps & DialogProps) => {
  return (
    <Modal
      aria-labelledby='modal-title'
      open={open}
      width={'max-content'}
      style={{
        maxWidth: '690px',
      }}
      preventClose
      onClose={onClose}
    >
      <InProgressBody text={text} />
    </Modal>
  )
})
