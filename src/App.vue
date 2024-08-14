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

  body {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .blue {
    background-color: #06326C;
  }

  .red {
    background-color: #F80086;
  }

  #confirmation-holder,
  #backdrop-el,
  #messagebox-el {
    top: 0;
    left: 0;
    position: absolute;
    height: 100%;
    width: 100%;
    z-index: 1000;
  }

  #backdrop-el {
    opacity: 0.7;
    z-index: 1200;
  }

  #messagebox-el {
    height: calc(50% - 200px);
    top: calc(50% - 200px);
    opacity: 1;
    color: #fff;
    font-size: 48px;
    z-index: 1400;
    text-align: center;
    vertical-align: middle;
  }

  #confirmation-holder {
    opacity: 0;
    width: 100%;
  }

  #confirmation-holder.fadein {
    display: block;
    opacity: 1;
    animation: .3s ease-out fadein;
  }

  #confirmation-holder.fadeout {
    opacity: 0;
    display: none;
    animation: .5s ease-out fadeout;
  }

  @keyframes fadein {
    0% {
      opacity: 0;  
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes fadeout {
    0% {
      opacity: 1;
      display: block;
    }
    100% {
      opacity: 0;
      display: none;
    }
  }

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

  .h1-main {
    font-family: 'Montserrat';
    color: #fff;
  }


  .h1-hr-main {
    margin-bottom: 35px;
  }


  .h2-main {
    font-family: 'Montserrat';
    margin-top: 25px;
    color: #fff;
    font-weight: normal;
  }


  .h2-hr-main {
    margin-bottom: 20px;
  }


  form {
    margin-left: 150px;
    display: flex;
    flex-direction: column;
  }


  form > label {
    font-family: 'Montserrat';
    font-size: 18px;
  }


  .sub {
    font-size: 14px;
  }


  .latelier-form-input {
    background-color: #fff;
    border-radius: 2px;
    width: 400px;
    padding: 3px 10px;
    font-size: 25px;
    color: #797979;
    font-family: 'Montserrat';
  }


  .latelier-form-submit {
    background-color: #00EC7B;
    color: #06326C;
    height: 40px;
    font-size: 20px;
  }


  .latelier-form-submit:hover {
    background-color: #00df75;
  }


  .latelier-form-submit:active {
    background-color: #4deea1;
  }

</style>