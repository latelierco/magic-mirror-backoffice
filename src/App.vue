<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
  //
</script>

<style>

  .font-weight-bold {
    font-family: 'Montserrat';
  }

  .logo-latelier {
    background-image: url('@/assets/images/ligne-variant-normal-fichier-1white_square_logo.png');
    background-repeat: no-repeat;
    background-size: cover;
    /*  */
    display: block;
    position: relative;
    /*  */
    width: 210px;
    height: 210px;
  }

  .sub-title {
    padding: 20px 0 0 0;
    width: 210px;
    text-align: center;
    font-family: 'Montserrat';
  }

  .users-icon {
    font-size: 32px;
    opacity: 0.4;
  }

  .users-icon-checked {
    font-size: 32px;
    opacity: 1;
  }

  .user-item {
    position: relative;
    color: #fff;
    display: flex;
    flex-direction: row;
  }

  .user-item-input {
    position: absolute;
    top: 5px;
    width: 32px;
    height: 32px;
    opacity: 0;
  }

  .user-item > a {
    display: block;
    margin: 12px 0 0 10px;
    font-size: 16px;
    color: #fff;
    text-decoration: none;
    opacity: 0.7;
  }

</style>