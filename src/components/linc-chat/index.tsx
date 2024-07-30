import { useEffect, useMemo } from 'react'

import { useSession } from 'next-auth/react'

import { useIsDesktop } from '@/core/hooks/use-is-desktop'
import { useAgeVerified } from '@/lib/hooks/use-age-verified'
import { useCartQuery } from '@/lib/queries/cart'
import { useCartOpen } from '@/lib/stores/process'

export const LincChat = () => {
  const { data: session } = useSession()
  const { data: cart } = useCartQuery()
  const { cartOpen: isCartOpened } = useCartOpen()
  const { ageVerified: isAgeVerified } = useAgeVerified()
  const isDesktop = useIsDesktop()
  const pageCategory = 'PDP'

  const email = useMemo(() => session?.user?.email, [session?.user?.email])

  useEffect(() => {
    if (!isDesktop && pageCategory === 'PDP') {
      const fiveNineChat = document.getElementsByClassName('five9-frame')?.[0]
      fiveNineChat?.classList.remove('d-block')
      fiveNineChat?.classList.add('d-none')
    } else {
      const fiveNineChat = document.getElementsByClassName('five9-frame')?.[0]
      fiveNineChat?.classList.add('d-block')
      fiveNineChat?.classList.remove('d-none')
    }
  }, [isDesktop, pageCategory])

  useEffect(() => {
    if (isCartOpened) {
      const fiveNineChat = document.getElementsByClassName('five9-frame')?.[0]
      fiveNineChat?.classList.remove('d-block')
      fiveNineChat?.classList.add('d-none')
    } else {
      const fiveNineChat = document.getElementsByClassName('five9-frame')?.[0]
      fiveNineChat?.classList.add('d-block')
      fiveNineChat?.classList.remove('d-none')
    }
  }, [isCartOpened])

  useEffect(() => {
    if (isAgeVerified && !(!isDesktop && pageCategory === 'PDP')) {
      // Function to load both scripts
      const loadScripts = () => {
        // Main script
        const mainScript = document.createElement('script')
        mainScript.src = 'https://app.five9.com/consoles/SocialWidget/five9-social-widget.min.js'
        mainScript.async = true

        // Function to execute the child script after the main script is loaded
        function loadChildScript() {
          const childScript = document.createElement('script')
          childScript.innerHTML = `
          var options = {
            rootUrl: 'https://app.five9.com/consoles/',
            type: 'chat',
            title: 'Scout & Cellar',
            tenant: 'Scout & Cellar',
            profiles: 'Linc - Chat',
            showProfiles: false,
            autostart: true,
            theme: 'high-contrast.css',
            surveyOptions: {
              showComment: true,
              requireComment: false,
            },
            fields: {
              name: {
                value: '',
                show: true,
                label: 'Name',
              },
              email: {
                value: ${email},
                show: true,
                label: 'Email',
              },
              'Customer or Consultant': {
                value: 'Customer',
                show: true,
                label: 'Customer or Consultant',
                required: true,
              },
              UserLocale: {
                value: 'en',
                show: false,
              },
            },
            playSoundOnMessage: true,
            allowCustomerToControlSoundPlay: false,
            showEmailButton: true,
            hideDuringAfterHours: false,
            useBusinessHours: true,
            showPrintButton: false,
            allowUsabilityMenu: false,
            enableCallback: false,
            callbackList: '',
            allowRequestLiveAgent: false,
          };
          Five9SocialWidget.addWidget(options);
        `
          document.body.appendChild(childScript)

          const styles = document.createElement('style')
          styles.innerHTML = `
          .five9-frame {
            right: 2rem !important;
          }

          .five9-frame-minimized {
            margin-left: 280px !important;
          }

          .five9-chat-button {
            top: 0px !important;
            font-size: 24px !important;
            background: black !important;
            border-radius: 10px !important;
           margin-bottom: 2rem !important;
          }
.five9-chat-button .five9-icon{
  left:8px !important;
  top: 1px !important;
}
          .five9-text {
            display: none !important;
          }

          // .five9-chat-button:after {
          //   content: "" !important;
          // }

          #five9-popout-button {
            float: right;
          }

          #five9-popout-button {
            display: none !important;
          }
        `
          document.head.appendChild(styles)
        }

        mainScript.onload = loadChildScript

        document.body.appendChild(mainScript)
      }

      loadScripts() // Call the function to load both scripts

      // Cleanup function
      return () => {
        const scripts = document.querySelectorAll(
          'script[src^="https://app.five9.com/consoles/SocialWidget/five9-social-widget.min.js"]'
        )
        scripts.forEach(script => {
          script.remove()
        })

        const styles = document.querySelectorAll('style')
        styles.forEach(style => {
          const innerHTML = style.innerHTML
          if (
            innerHTML.includes('.five9-frame') ||
            innerHTML.includes('.five9-frame-minimized') ||
            innerHTML.includes('.five9-chat-button') ||
            innerHTML.includes('.five9-text') ||
            innerHTML.includes('#five9-popout-button')
          ) {
            style.remove()
          }
        })
      }
    }
  }, [isAgeVerified, isDesktop])

  return <></>
}
