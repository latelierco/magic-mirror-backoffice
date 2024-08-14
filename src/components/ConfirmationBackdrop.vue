<script setup>
  const props = defineProps(['confirmation'])
  console.debug('props', props)
</script>


<template>

  <div id="backdrop-el" class="active"></div>
  <div id="messagebox-el" class="active">{{ props.confirmation }}</div>

</template>


<style>

  body {
    width: 100%;
    height: 100%;
  }

  #backdrop-el, {
    background-color: #06326C;
  }

  #messagebox-el {
    background-color: #fff;
  }

  #backdrop-el,
  #messagebox-el {
    opacity: .4;
    top: 0;
    left: 0;
    position: absolute;
    height: 100%;
    width: 100%;
  }

  #backdrop-el.active {
    opacity: .8;
    z-index: 1000;
  }

  #messagebox-el.active {
    height: calc(50% - 200px);
    top: calc(50% - 200px);
    opacity: 1;
    color: #fff;
    font-size: 48px;
    z-index: 1200;
    text-align: center;
    vertical-align: middle;
  }

</style>