<script setup lang="ts">
/**
 * SettingsView — placeholder.
 *
 * The upstream Next.js project ships a non-trivial settings UI built on
 * `@remoteoss/json-schema-form` + react-hook-form. Porting that to Vue + Vuetify
 * is left as a follow-up; in the meantime this view dumps the live YAML defaults
 * pulled from `meta.config.defaults` so the user has something useful to look
 * at.
 */
import { onMounted, ref } from 'vue'
import { useMowersStore } from '@/stores/mowers'
import { HeaderStat, Page, PageContent, PageHeader } from '@/components/page'

const mowersStore = useMowersStore()
const defaults = ref<Record<string, string> | null>(null)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const mower = mowersStore.selectedMower
    if (!mower) return
    defaults.value = await mower.rpc.meta.config.defaults()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
})
</script>

<template>
  <Page>
    <PageHeader title="Settings" subtitle="Configure the OpenMower runtime">
      <HeaderStat icon="mdi-cog" :value="defaults ? Object.keys(defaults).length : 0" label="Config files" />
    </PageHeader>

    <PageContent>
      <v-alert type="info" variant="tonal" class="mb-4">
        The schema-driven settings editor from the upstream Next.js app is not
        yet ported. The defaults below are pulled live from
        <code>meta.config.defaults</code>.
      </v-alert>

      <v-alert v-if="error" type="error" variant="tonal">{{ error }}</v-alert>

      <v-card v-for="(content, file) in defaults ?? {}" :key="file" class="mb-4" rounded="lg">
        <v-card-title>{{ file }}</v-card-title>
        <v-card-text>
          <pre class="text-body-2" style="white-space: pre-wrap">{{ content }}</pre>
        </v-card-text>
      </v-card>
    </PageContent>
  </Page>
</template>
