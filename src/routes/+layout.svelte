<script lang="ts">
    import Navbar from '$lib/components/ui/Navbar.svelte'
    import '../style/app.css'
    import '../style/highlight.js.css'
    import { navigating } from '$app/stores'
    import nProgress from 'nprogress'
    import 'nprogress/nprogress.css'
    import ToastContainer from '$lib/components/ui/toasts/ToastContainer.svelte'
    import ModalContainer from '$lib/components/ui/modal/ModalContainer.svelte'
    import Sidebar from '$lib/components/ui/sidebar/Sidebar.svelte'
    import { onMount } from 'svelte'
    
    // @ts-ignore
    import { pwaInfo } from 'virtual:pwa-info'
    import PwaReload from '$lib/PwaReload.svelte'
    import { inDarkTheme } from '$lib/ui/colors.js'
    import { userSettings } from '$lib/settings.js'

    nProgress.configure({
        minimum: 0.4,
        trickleSpeed: 200,
        showSpinner: false,
    })

    $: {
        if ($navigating) {
            if (typeof document != 'undefined') {
                nProgress.start()
                document?.documentElement?.classList?.toggle('wait', true)
            }
        }

        if (!$navigating) {
            if (typeof document != 'undefined') {
                nProgress.done()
                document?.documentElement?.classList?.toggle('wait', false)
            }
        }
    }

    $: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : ''
  
  
</script>

<svelte:head>
    <meta name="theme-color" content={inDarkTheme() ? '#020202' : '#f1f6f9'} />
    {@html webManifest}
</svelte:head>

<div class="flex flex-col min-h-screen {$userSettings.font}">
    <Navbar />
    <ToastContainer />
    <ModalContainer />
    
    <div class="flex flex-row h-full w-full max-w-full flex-1">
        <Sidebar />
        <main class="p-2 min-w-0 w-full flex flex-col flex-[3] gap-2 sm:rounded-tl-lg border-slate-200 dark:border-zinc-900 sm:border-l border-t">
            <slot />
        </main>
    </div>
</div>
