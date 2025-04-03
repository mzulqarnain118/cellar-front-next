import { useEffect } from 'react'

import { usePathname } from 'next/navigation'

import { useIsDesktop } from '@/core/hooks/use-is-desktop'
import { useAgeVerified } from '@/lib/hooks/use-age-verified'
import { useCartOpen } from '@/lib/stores/process'

export const LincChat = () => {
    const isDesktop = useIsDesktop()
    const { cartOpen: isCartOpened } = useCartOpen()
    const { ageVerified: isAgeVerified } = useAgeVerified()
    const pathname = usePathname()
    const productRegex = /\/product\/\w+/



    useEffect(() => {
        if (isAgeVerified) {
            // Load Gorgias Chat Widget
            const gorgiasScript = document.createElement('script')
            gorgiasScript.id = 'gorgias-chat-widget-install-v3'
            gorgiasScript.src = 'https://config.gorgias.chat/bundle-loader/01JQF4A9QZW7CQB60N6BXDPD3J'
            document.body.appendChild(gorgiasScript)

            // Load DYN Bundle
            const dynBundleScript = document.createElement('script')
            dynBundleScript.src =
                'https://bundle.dyn-rev.app/loader.js?g_cvt_id=89bd2d98-42fd-4bff-afee-2b6474b8eabe'
            dynBundleScript.async = true
            document.body.appendChild(dynBundleScript)

            // Cleanup function
            return () => {
                const gorgiasChatScript = document.getElementById('gorgias-chat-widget-install-v3')
                if (gorgiasChatScript) {
                    gorgiasChatScript.remove()
                }

                // Remove DYN script
                const scripts = document.querySelectorAll('script')
                scripts.forEach(script => {
                    if (script.src.includes('bundle.dyn-rev.app/loader.js')) {
                        script.remove()
                    }
                })
            }
        }
    }, [isAgeVerified])

    useEffect(() => {
        const handleChatVisibility = () => {
            const gorgiasContainer = document.querySelector("#chat-button");

            if (!gorgiasContainer) return; // Exit early if the element is not found

            const shouldHide = isCartOpened || (!isDesktop && (productRegex.test(pathname) || pathname.includes("/checkout")));

            gorgiasContainer.classList.toggle("hidden", shouldHide);
            gorgiasContainer.classList.toggle("block", !shouldHide);
        };

        // Create a mutation observer to monitor the DOM for changes
        const observer = new MutationObserver(handleChatVisibility);

        // Observe changes in the body element
        observer.observe(document.body, { childList: true, subtree: true });

        // Initial check
        handleChatVisibility();

        // Cleanup
        return () => observer.disconnect();
    }, [pathname, isDesktop, isCartOpened]);

    return <></>
}
