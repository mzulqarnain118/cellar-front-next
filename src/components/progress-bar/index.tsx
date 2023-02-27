/* eslint-disable import/no-named-as-default */
import Router from 'next/router'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({
  easing: 'ease',
  minimum: 0.3,
  showSpinner: false,
  speed: 500,
})

Router.events.on('routeChangeStart', () => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

export const ProgressBar = () => <></>
