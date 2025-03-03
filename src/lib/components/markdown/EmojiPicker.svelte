<script lang="ts">

    
    import { afterUpdate, onMount } from 'svelte'
    import { get } from 'svelte/store'
    import { inDarkTheme } from '$lib/ui/colors'
    import { site } from '$lib/lemmy'

    import EmojiMartData from '@emoji-mart/data/sets/14/google.json'
    import {Picker as EmojiPicker}  from 'emoji-mart'
    
    export let value:string = ''                // Actual value extracted from textarea
    export let textArea:HTMLTextAreaElement     // Text area (used to get cursor position)
    export let rows:number                      // Number of rows of the parent markdown editor
    export let open:boolean                     // Toggles the picker open/closed
    export let closeOnSelect:boolean = true     // Whether to close the picker upon selection of an emoji    
    export let navButtons:boolean = false       // Whether to show the category buttons at the top of the picker
        
    
    // Read in the current site info and grab its custom emojis (if any)
    let siteInfo = get(site);
    let siteEmojis:any = []
    
    try {
        if (siteInfo?.custom_emojis) {
            let customEmojis = {
                id: 'custom',
                name: 'Custom',
                emojis: [] as any[]
            }

            for (let i:number=0; i < siteInfo.custom_emojis.length; i++) {
                let ce = siteInfo.custom_emojis[i];
                
                let customEmoji:any = {
                    id: ce.custom_emoji.shortcode,
                    name: ce.custom_emoji.alt_text,
                    keywords: ce.keywords.map((kw) => kw.keyword),
                    skins: [ {src: ce.custom_emoji.image_url} ]
                }
                customEmojis.emojis.push(customEmoji)
            }
            siteEmojis.push(customEmojis)
        }
    }
    catch (err) {
        console.log("Failed to import site custom emojis", err);
    }

    function replaceTextAtIndices(str: string, startIndex: number, endIndex: number, replacement: string) {
        return str.substring(0, startIndex) + replacement + str.substring(endIndex)

    }

    const getPicker = function () { 
        return new EmojiPicker({
            data: EmojiMartData,
            onEmojiSelect: (s:any) => {
                // Use native emoji value or the src value for custom emojis
                let emojiValue:string = ''
                s.native
                    ? emojiValue = s.native
                    : s.src
                        ? emojiValue = `![${s.name}](${s.src} "${s.shortcodes.replaceAll(':', '')}")`
                        : undefined

                value = textArea.value = replaceTextAtIndices(textArea.value, textArea.selectionStart, textArea.selectionEnd, emojiValue)
                if (closeOnSelect) open = !open
            },
            set: 'google',
            theme: inDarkTheme() ? 'dark': 'light',
            previewPosition: 'none',
            navPosition: navButtons ? 'top' : 'none',
            dynamicWidth: true,
            custom: siteEmojis
        });
    }
    
    let pickerContainer:HTMLDivElement
    let picker = getPicker();
    
    // Recreate the picker when its container gets removed/recreated in the DOM when switching between edit/preview
    afterUpdate(() => {
        //@ts-ignore
        if (pickerContainer && !pickerContainer.contains(picker)) {
            picker = getPicker()
            //@ts-ignore
            pickerContainer.appendChild(picker)
        }
    })
    
    // Initialize the emoji picker
    onMount(() => {
        //@ts-ignore
        pickerContainer.appendChild(picker);
    })
</script>

<!--- Zero-height container to make the overlap work--->
<div class="w-full z-10 h-0">
    <!--- Emoji Picker Container--->
    <div bind:this={pickerContainer} class="overflow-hidden w-full" class:hidden={!open} style="height: {(rows+5)*24}px"/>
</div>


