<template>
  <v-app>
    <v-app-bar app color="deep-orange lighten-2">
      <v-toolbar-title class="headline">
        <v-icon class="mr-2">mdi-developer-board</v-icon>
        <span>Remote</span>
        <span class="font-weight-light">Forensic</span>
        <span class="font-weight-thin">Appliance</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
        <template v-slot:activator="{ on }">
          <v-btn text v-on="on">
            <v-icon>mdi-cogs</v-icon>
            <span class="mr-1"></span>
            <span class="mr-2">Settings</span>
          </v-btn>
        </template>
        <v-card>
          <v-toolbar @click="dialog=false" color="deep-orange lighten-2">
            <v-btn icon dark @click="dialog = false">
              <v-icon color="black">close</v-icon>
            </v-btn>
            <v-toolbar-title class="headline">Settings</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-list subheader three-line>
            <v-subheader>Image Process</v-subheader>
            <v-list-item avatar>
              <v-list-item-action>
                <v-tabs
                        fixed-tabs
                        color="deep-orange lighten-2"
                        v-model="selectedTab"
                        slider-color="grey darken-1"
                >

                  <v-tab>
                    DC3DD
                  </v-tab>
                  <v-tab>
                    DD
                  </v-tab>
                </v-tabs>
              </v-list-item-action>
              <v-list-item-content class="ml-2">
                <v-list-item-title>Aqcuisition Tool</v-list-item-title>
                <v-list-item-subtitle>Set tool which should be used to create the image</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

              <v-list-item>
                <v-list-item-action>
                  <v-switch v-model="compression" @change="onCompressionChange" color="deep-orange lighten-2"></v-switch>
                </v-list-item-action>

                <v-list-item-content>
                  <v-list-item-title>Compression</v-list-item-title>
                  <v-list-item-subtitle>Compress the image with gzip in order to reduce its size. (Warning: Hashsum verification must be done manually)</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

            <v-list-item avatar>
              <v-list-item-action>
                <v-switch v-model="sendAnalytics" @change="sendAnalytics" color="deep-orange lighten-1"></v-switch>
              </v-list-item-action>

              <v-list-item-content>
                <v-list-item-title>Automatically send output and diagnostic.</v-list-item-title>
                <v-list-item-subtitle>Send imaging process history and stats if connection to the servers is possible.</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

          </v-list>
          <v-divider></v-divider>
          <v-list three-line subheader>
            <v-subheader>General</v-subheader>

            <v-list-item avatar>
              <v-list-item-action>
                <v-switch color="deep-orange lighten-2" @change="showSnackParInfo"
                          hide-details
                          v-model="smartMode" >
                </v-switch>
              </v-list-item-action>

              <v-list-item-content>
                <v-list-item-title>Smart Mode</v-list-item-title>
                <v-list-item-subtitle>Auto compute best transfer options.</v-list-item-subtitle>
              </v-list-item-content>

            </v-list-item>
          </v-list>
        </v-card>
      </v-dialog>
    </v-app-bar>
    <v-content>
      <v-container fluid>
        <myCustomStepper ref="customStepper" msg="Users"/>
      </v-container>
    </v-content>
  </v-app>

</template>
<!--Insert footer-->

<script>
import CustomStepper from './components/CustomStepper'

export default {
  name: 'App',
  components: {
    myCustomStepper: CustomStepper
  },
  data() {
    return {
      smartModeInfoText : "If SmartMode is turned on, the application decides itself weather to send the full image of the input device or just specific artifacts to the CERT servers.",
      dialog: false,
      compression: false,
      smartMode: true,
      sendAnalytics : true,
      selectedTab : 0,
    }
  },

  methods: {
    onCompressionChange: function(){
      this.$refs.customStepper.setCompressed(this.compression)
    },

    showSnackParInfo: function () {
      this.$refs.customStepper.toogleSnackBarSmartModeValue(this.smartModeInfoText);
      this.$refs.customStepper.setSmartMode(this.smartMode)
    }
  }
}
</script>
