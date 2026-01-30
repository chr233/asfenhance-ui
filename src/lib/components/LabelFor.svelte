<script lang="ts">
  interface Props {
    forId?: string;
    text?: string;
  }

  let { forId, text }: Props = $props();
</script>

<label class="mb-2 font-medium block" for={forId}>{text}</label>
