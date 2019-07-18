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
      <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
        <template v-slot:activator="{ on }">
          <v-btn flat v-on="on">
            <v-icon>settings</v-icon>
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
          <v-list three-line subheader>
            <v-subheader>Image Process</v-subheader>
            <v-list-tile avatar>
              <v-list-tile-action tile>
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
              </v-list-tile-action>
              <v-list-tile-content class="ml-2">
                <v-list-tile-title>Aqcuisition Tool</v-list-tile-title>
                <v-list-tile-sub-title>Set tool which should be used to create the image</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
              <v-list-tile avatar>
                <v-list-tile-action>
                  <v-checkbox v-model="compression" @change="onCompressionChange" color="deep-orange lighten-2"></v-checkbox>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title>Compression</v-list-tile-title>
                  <v-list-tile-sub-title>Compress the image with gzip in order to reduce its size. (Warning: Hashsum verification must be done manually)</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            <v-list-tile avatar>
              <v-list-tile-action>
                <v-checkbox v-model="sendAnalytics" @change="sendAnalytics" color="deep-orange lighten-1"></v-checkbox>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Automatically send output and diagnostic.</v-list-tile-title>
                <v-list-tile-sub-title>Send imaging process history and stats if connection to the servers is possible.</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
          <v-divider></v-divider>
          <v-list three-line subheader>
            <v-subheader>General</v-subheader>
            <v-list-tile avatar>
              <v-list-tile-action>
                <v-switch class="ml-3" color="orange darken-3" @change="showSnackParInfo"
                          hide-details
                          v-model="smartMode" >
                </v-switch>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Smart Mode</v-list-tile-title>
                <v-list-tile-sub-title>Auto compute best transfer options.</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-dialog>
    </v-toolbar>
    <v-content>
      <myCustomStepper ref="customStepper" msg="Users"/>
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
      selectedTab : 0
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
