<script lang="ts">
    import Button from '$lib/components/input/Button.svelte'

    export let expanded: boolean = true
    export let title: string = ''
</script>

<Button {...$$restProps} color="tertiary" alignment="left" title={title} on:click class="!text-xs font-bold hover:bg-slate-200 {expanded ? '' : '!p-1.5'} {$$props.class}">
    <slot />
</Button>
