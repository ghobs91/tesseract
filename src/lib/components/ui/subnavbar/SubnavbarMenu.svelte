<script lang="ts">
    import type { Alignment } from '$lib/components/ui/menu/menu.js'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    
    import { 
        Icon,
        ChevronDown
    } from 'svelte-hero-icons'
    
    export let alignment: Alignment = 'bottom-left'
    
    export let title:string = '';
    export let icon:any = undefined;
    export let iconSize:number = 16
    export let containerClass:string = ""
    export let showTitleOnButton:boolean = false
    export let topHR:boolean = true
    export let shiftLeft:number = 0

    const translateX = 50 * shiftLeft
    let translate = ''
    switch(translateX) {
        case 50:
            translate='translate-x-[-50px]'
            break
        case 100:
            translate='translate-x-[-100px]'
            break
        case 150:
            translate='translate-x-[-150px]'
            break
    }
</script>


<Menu {alignment} containerClass="!z-[20] max-h-[79svh] min-w-[95vw] sm:min-w-[87vw] md:min-w-[50vw] lg:min-w-[40vw] xl:min-w-[25vw] overflow-visible {translate} {containerClass}" >
    <button slot="button" let:toggleOpen on:click={toggleOpen} class="w-max" title="{title}">
        
        <span class="flex flex-row items-center gap-1 md:gap-2 font-bold text-sm cursor-pointer p-2
            border border-slate-200 dark:border-zinc-700 rounded-lg bg-transparent 
            hover:bg-slate-100 hover:dark:bg-zinc-700 dark:text-zinc-200  disabled:border-none 
            {$$props.class}
        ">
            {#if icon}
                <Icon src={icon} mini width={iconSize}/>
            {/if}

            <!--Hide selected text in mobile view or until width is at least 'large'--->
            {#if title && showTitleOnButton}
                <span class="hidden lg:flex">
                    {title}
                </span>
            {/if}
            
            <span class="ml-auto"/>
            <Icon src={ChevronDown} mini width={14}/>
        </span>
        
    </button>
    
    {#if title}
        <li class="flex flex-row w-full text-left items-center justify-between text-xs font-bold px-4 py-1 my-1 opacity-80">
            {title}
            <Icon src={icon} mini width={iconSize}/>
        </li>
        {#if topHR}
            <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />
        {/if}
    {/if}
    
    <slot />
</Menu>
