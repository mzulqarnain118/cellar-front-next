import {
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { NotificationProps, notifications } from '@mantine/notifications'

import { Typography } from '@/core/components/typogrpahy'

// ! TODO: Sentry logging.
export const toastError = (props: NotificationProps) =>
  notifications.show({
    autoClose: false,
    color: 'error',
    icon: <XMarkIcon className="h-4 w-4" />,
    ...props,
    title: <Typography className="font-bold">{props.title || 'Error'}</Typography>,
  })

export const toastInfo = (props: NotificationProps) =>
  notifications.show({
    autoClose: 4000,
    icon: <InformationCircleIcon className="w-4 h-4" />,
    ...props,
    title: <Typography className="font-bold">{props.title || 'Info'}</Typography>,
  })

export const toastLoading = (props: NotificationProps) =>
  notifications.show({
    autoClose: false,
    id: 'load-data',
    loading: true,
    ...props,
    title: <Typography className="font-bold">{props.title || 'Loading...'}</Typography>,
    withCloseButton: false,
  })

export const toastSuccess = (props: NotificationProps) =>
  notifications.show({
    color: 'success',
    icon: <CheckIcon className="h-4 w-4" />,
    ...props,
    title: <Typography className="font-bold">{props.title || 'Success'}</Typography>,
  })

export const toastWarning = (props: NotificationProps) =>
  notifications.show({
    autoClose: 4000,
    icon: <ExclamationTriangleIcon className="h-14 w-14" />,
    styles: theme => ({
      icon: {
        backgroundColor: theme.colors.transparent,
        color: theme.colors.warning,
      },
    }),
    ...props,
    title: <Typography className="font-bold">{props.title || 'Error'}</Typography>,
  })
