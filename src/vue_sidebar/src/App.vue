<script setup lang='ts'>
import {ref} from "vue";

const username = ref("")
const password = ref("")

const saveAndTestLogin = () => {
  google.script.run.withSuccessHandler((...a)=> {
    console.log(a)
  }).withFailureHandler((...a) => {
    console.error(a)
  }).saveAndTestLogin(username.value,password.value)
}

</script>

<template>
  <h1>Hello</h1>
  <input v-model="username"/>
  <input v-model="password"/>
  <button @click="saveAndTestLogin">Save login</button>
</template>

<style scoped>
</style>
<style>
@import url('./assets/main.css');
</style>
