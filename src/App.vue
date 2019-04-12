<template>
  <v-app style="background-color: #FAFAFA">
    <v-toolbar app color="deep-orange lighten-2">
      <v-toolbar-title class="headline">
        <v-icon class="mr-2">developer_board</v-icon>
        <span>Remote</span>
        <span class="font-weight-light">Forensic</span>
        <span class="font-weight-thin">Appliance</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        flat
      >
        <v-icon>settings</v-icon>
        <span class="mr-1"></span>
        <span class="mr-2">Settings</span>
      </v-btn>
    </v-toolbar>
    <v-content>
      <CustomStepper msg="Users"/>
    </v-content>
  </v-app>
</template>
<!--Insert footer-->

<script>
import CustomStepper from './components/CustomStepper'

export default {
  name: 'App',
  components: {
    CustomStepper: CustomStepper
  },
  data () {
    return {
      //
    }
  }
}
</script>
