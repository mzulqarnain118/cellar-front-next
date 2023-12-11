import { InformationCircleIcon } from '@heroicons/react/20/solid'
import { CheckIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { NotificationProps, notifications,Notifications } from '@mantine/notifications'
import classes from './notifications.module.css';
import { Typography } from '@/core/components/typogrpahy'

export const clearAllToasts = () => notifications.clean()
export const clearLoading = () => notifications.hide('load-data')

// ! TODO: Sentry logging.
export const toastError = (props: NotificationProps & { htmlContent?: React.ReactNode }) =>
  notifications.show({
    autoClose: 4000,
    color: 'red',
    icon: <XMarkIcon className="h-4 w-4" />,
    ...props,
    title: (
      <div >
        <Typography className="font-bold">{props.title || 'Error'}</Typography>
        {props.htmlContent && <div dangerouslySetInnerHTML={{ __html: props.htmlContent.toString() }} />}
      </div>
    ),
  });


export const toastInfo = (props: NotificationProps) =>
  notifications.show({
    autoClose: 4000,
    icon: <InformationCircleIcon className="w-10 h-10 rounded text-info" />,
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

type ToastType = 'error' | 'info' | 'loading' | 'success' | 'warning';

const toast = (type: ToastType, title?: string, htmlContent?: React.ReactNode, props?: NotificationProps) => {
  let notificationConfig: any = {
    autoClose: type !== 'loading' ? 4000 : false,
    classNames:classes,
    ...props,
    title: (
      <div >
        <Typography className="font-bold">{title}</Typography>
        {htmlContent && (
          <div dangerouslySetInnerHTML={{ __html: htmlContent.toString() }} />
        )}
      </div>
    ),
  };

  switch (type) {
    case 'error':
      notificationConfig = {
        ...notificationConfig,
        color: 'red',
        icon: <XMarkIcon className="h-4 w-4" />,
      };
      break;

    case 'info':
      notificationConfig = {
        ...notificationConfig,
        icon: <InformationCircleIcon className="w-10 h-10 rounded text-info" />,
      };
      break;

    case 'loading':
      notificationConfig = {
        ...notificationConfig,
        id: 'load-data',
        loading: true,
        title: <Typography className="font-bold">{title || 'Loading...'}</Typography>,
        withCloseButton: false,
      };
      break;

    case 'success':
      notificationConfig = {
        ...notificationConfig,
        color: 'success',
        icon: <CheckIcon className="h-4 w-4" />,
      };
      break;

    case 'warning':
      notificationConfig = {
        ...notificationConfig,
        autoClose: 4000,
        icon: <ExclamationTriangleIcon className="h-14 w-14" />,
        styles: (theme: any) => ({
          icon: {
            backgroundColor: theme.colors.transparent,
            color: theme.colors.warning,
          },
        }),
      };
      break;

    default:
      break;
  }

  notifications.show(notificationConfig);
};

export default toast;