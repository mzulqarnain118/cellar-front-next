import { CheckIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'
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
