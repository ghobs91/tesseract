<script lang="ts">
    import { userSettings} from '$lib/settings'
    import type { PostDisplayType } from '../helpers';
    
    export let nsfw:boolean
    export let displayType:PostDisplayType = 'feed'
    export let text:string = '[Reveal NSFW Content]'
</script>


<!---Click to Remove Blur--->    
<div class="flex flex-col relative w-full {nsfw && $userSettings.nsfwBlur && displayType =='feed' ? 'min-h-[75px]' : ''} gap-1 {$$props.class}">
    {#if nsfw && $userSettings.nsfwBlur && displayType =='feed'}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="absolute z-[10] left-0 top-0 w-full h-full bg-white/50 dark:bg-black/50" 
            on:click|preventDefault|stopPropagation={()=> {
                if (nsfw) {
                    nsfw = nsfw = false;
                }
            }}
        >  
            <div class="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-lg font-bold rounded-lg border border-slate-500 whitespace-nowrap shadow-lg p-4 cursor-pointer">
                {text}
            </div>
        </div>
    {:else}
        <slot/>
    {/if}
</div>