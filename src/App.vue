<script setup>
  //
</script>


<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>


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
    opacity: 0.8;
    z-index: 1200;
  }

  #backdrop-el.higher {
    opacity: 0.8;
    z-index: 1350;
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

  .users-icon,
  .contents-icon {
    font-size: 32px;
    opacity: 0.4;
  }

  .users-icon-checked,
  .contents-icon-checked {
    font-size: 32px;
    opacity: 1;
  }

  .user-item,
  .content-item {
    position: relative;
    color: #fff;
    display: flex;
    flex-direction: row;
  }

  .user-item-input,
  .content-item-input {
    position: absolute;
    top: 5px;
    width: 32px;
    height: 32px;
    opacity: 0;
  }

  .user-item > a,
  .content-item > a {
    display: flex;
    flex-direction: row;
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


  .form-container {
    flex-direction: row;
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
    width: 600px;
    padding: 3px 10px;
    font-size: 25px;
    color: #797979;
    font-family: 'Montserrat';
  }

  .latelier-form-textarea {
    font-size: 20px;
  }

  .radio-holder-group {
    display: flex;
    flex-direction: row;
    margin-left: 15px;
    margin-bottom: 30px;
  }

  .radio-holder {
    display: flex;
    flex-direction: row;
  }

  .radio-holder:last-child {
    margin-left: 40px;
  }

  .radio-holder > label {
    font-size: 24px;
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

  #title-and-actions {
    display: flex;
    flex-direction: row;
  }


  #suppress-action {
    font-size: 24px;
    font-style: italic;
    cursor: pointer;
  }


  #suppress-action::before {
    content: '|';
    font-style: normal;
    margin-right: 28px;
    opacity: .4;
  }


  #delete-icon {
    font-size: 28px;
  }

  .user-add-holder,
  .content-add-holder {
    opacity: .4;
    position: fixed;
    right: 80px;
    bottom: 80px;
    width: 55px;
    height: 55px;
    border: 4px solid #fff;
    box-sizing: border-box;
    border-radius: 27px;
    color: #fff;
    background-color: #06326C;
  }


  .user-add,
  .content-add,
  .page-back {
    font-size: 33px;
    width: 42px;
    height: 42px;
    margin: auto;
    top: -2px;
    left: 1px;
  }


  .user-add-holder:hover,
  .content-add-holder:hover {
    opacity: .8;
  }


  .user-add,
  .content-add {
    position: absolute;
  }

  .content-add {
    top: 1px;
    left: 5px;
  }

  .content-link {
    display: flex;
    flex-direction: row;
  }

  .content-link > span {
    margin-left: 30px;
    width: 200px;
  }

  .content-link > span:first-child {
    margin-left: 0;
    width: 320px;
  }

  .page-back {
    color: #fff;
    font-size: 36px;
    opacity: .4;
    position: relative;
    padding: 10px;
    cursor: pointer;
  }

  .page-back:hover {
    opacity: .8;
  }

  #messagebox-el {
    display: none;
  }

  #messagebox-el.showing {
    display: block;
  }

  #messagebox-el > span {
    text-align: center;
    width: 90%;
    margin: 0 auto;
    display: none;
  }

  #messagebox-el.showing > span {
    display: block;
  }

  #messagebox-el.showing > span.suspend-message {
    display: inline-block;
    width: 80%;
  }

  /* ref. : https://css-loaders.com/bars */
  /* HTML: <div class="loader"></div> */
  .loader {
    margin-left: 20px;
    display: inline-block;
    width: 45px;
    aspect-ratio: 1;
    --c: no-repeat linear-gradient(#00EC7B calc(50% - 10px),#0000 0 calc(50% + 10px),#00EC7B 0);
    background: 
      var(--c) 0%   100%,
      var(--c) 50%  100%,
      var(--c) 100% 100%;
    background-size: 20% calc(200% + 20px);
    animation:l4 1s infinite linear;
  }

  @keyframes l4 {
      33%  {background-position: 0% 50%,50% 100%,100% 100%}
      50%  {background-position: 0%  0%,50%  50%,100% 100%}
      66%  {background-position: 0%  0%,50%   0%,100%  50%}
      100% {background-position: 0%  0%,50%   0%,100%   0%}
  }


</style>
