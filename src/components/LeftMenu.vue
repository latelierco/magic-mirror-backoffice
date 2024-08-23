<script setup>
  //
</script>

<template>
  <v-navigation-drawer style="border-right-color: rgba(255, 255, 255, .12);" v-model="drawer">

    <div
      class="pa-4 drawer-header"
    >
      <div class="logo-latelier ml-2">&nbsp;</div>

      <h2 class="sub-title ml-2">L'Atelier</h2>
    </div>

    <v-divider class="mt-2 ml-3 mr-3"></v-divider>

    <v-list>
        <v-list-item
          v-for="[icon, text, link] in links"
          :key="icon"
          :prepend-icon="icon"
        >
          <RouterLink class="menu-link" :to="link">{{ text }}</RouterLink>  
        </v-list-item>
    </v-list>

    <v-divider class="mt-2 ml-3 mr-3"></v-divider>
  </v-navigation-drawer>
</template>

<script>
  export default {
    data: () => ({
      drawer: null,
      links: [
        ['mdi-account', 'Utilisateurs', '/users'],
        ['mdi-account-edit', 'Contenu Personnalisé', '/users'],
        ['mdi-pencil', 'Contenu', '/content-list']
      ],
    })
  }
</script>

<style>

  .menu-link {
    color: #fff;
    text-decoration: none;
    opacity: 0.8;
  }

</style>
