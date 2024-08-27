<script setup>

  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()

  onMounted(() => router.push('/users'))

</script>

<template>
  <HelloWorld />
</template>
