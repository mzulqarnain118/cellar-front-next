import { Modal } from '@mantine/core'

type termsModalProps = {
  opened: boolean
  onClose: () => void
  title: string
  content: string
}

const termsModal: React.FC<termsModalProps> = ({ opened, onClose, title, content }) => (
  <Modal
    classNames={{
      title: '!text-3xl',
    }}
    opened={opened}
    size="lg"
    title={title}
    onClose={onClose}
  >
    <div className="p-1 mt-3">{content}</div>
  </Modal>
)

export default termsModal
