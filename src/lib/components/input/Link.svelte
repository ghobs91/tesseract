<script lang="ts">
    import { linkPreviewModal } from "$lib/components/lemmy/moderation/moderation";

    export let href: string|undefined
    export let highlight: boolean = false
    export let nowrap: boolean = false
    export let newtab: boolean = false
    export let title: string | undefined | null= undefined
    export let id: string = ""
    export let domainOnly:boolean = false;
    export let text:string | undefined = undefined
    export let preview:boolean = false

</script>
{#if href}
    <a {href}
        id={id}
        class="break-words {highlight ? 'text-sky-700 dark:text-sky-500' : ''} text-left hover:underline max-w-full 
            {nowrap ? 'whitespace-nowrap overflow-hidden truncate text-xs' : ''}
            {$$props.class}
        "
        rel="nofollow noreferrer"
        target="{newtab
            ? '_blank'
            : '_self'
        }"
        on:click={ (
            //@ts-ignore
            e
        ) => {
            if (preview) {
                e.preventDefault()
                e.stopPropagation()
                linkPreviewModal(href)
            }
        }}
        title = "{title ?? href}"
    >
        <slot name="icon" />
        <slot>
            
                {text ?? (domainOnly ? new URL(href).hostname : href)}
            
        </slot>
    
    </a>
{/if}
