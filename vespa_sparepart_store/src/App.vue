<script setup>
import { useAuthStore } from './store/auth'
const auth = useAuthStore()
auth.restoreSession()
</script>

<template>
  <router-view />
</template>
