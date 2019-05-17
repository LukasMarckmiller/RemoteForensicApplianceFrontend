<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
 <div class="customStepper">
     <v-snackbar
             class="black--text"
             v-model="snackbarInfoSmartMode"
             color="grey lighten-4"
             timeout="6000"
             multi-line
             top>
             If SmartMode is turned on, the application decides itself weather to send the full image of the input device or just specific artifacts to the CERT servers.
         <v-btn  color="deep-orange lighten-2"
                 flat
                 @click="snackbarInfoSmartMode = false">
             Close
         </v-btn></v-snackbar>
     <v-layout>
    <v-container fluid>
        <v-flex xs12 md12 >
            <v-stepper light v-model="e1">
                <v-stepper-header>
                    <v-stepper-step color="deep-orange lighten-2" :complete="e1 > 1" step="1">Choose Input Device</v-stepper-step>
                    <v-divider></v-divider>
                    <v-stepper-step color="deep-orange lighten-2" :complete="e1 > 2" step="2">Processing Settings
                    <small>Optional</small>
                    </v-stepper-step>
                    <v-divider></v-divider>
                    <v-stepper-step color="deep-orange lighten-2" step="3">Finish</v-stepper-step>
                </v-stepper-header>
                <v-stepper-items>
                    <v-stepper-content step="1">
                        <v-layout >
                            <v-flex xs6 sm6>
                        <v-card class="mb-3"
                                color="grey lighten-4">
                                <v-layout >
                                <v-card-title>Choose a device to read data and create an image from.</v-card-title>
                                    <v-spacer></v-spacer>
                                    <v-btn flat icon color="deep-orange lighten-2" @click="reloadPage"><v-icon>cached</v-icon></v-btn>
                                </v-layout>
                            <v-select chips prepend-icon="sd_storage" class="mr-3 ml-3 red--text" v-model="select" item-value="serial_number" v-bind:items="devices" persistent-hint
                                      return-object
                                      single-line label="Select">
                                <template v-if="select !== ''" slot="selection" slot-scope="data">
                                    <v-chip>{{ data.item.name}} (Vendor: {{ data.item.vendor}}, Model: {{data.item.model}}, Size: {{parseDeviceCapazityinGB(data.item.size_bytes)}} GB)</v-chip>
                                </template>
                                <template v-if="devices !== null" slot="item" slot-scope="data">
                                    {{ data.item.name }} (Vendor: {{ data.item.vendor}}, Model: {{data.item.model}}, Size: {{parseDeviceCapazityinGB(data.item.size_bytes)}} GB)
                                </template>
                            </v-select>
                            <v-card>
                                <v-card-title class="deep-orange lighten-2">
                                    Partitions
                                </v-card-title>
                                <v-list class="grey lighten-4">
                                    <v-list-tile
                                        v-for="item in select.partitions"
                                        :key="item.name">
                                        <v-icon class="mr-3">storage</v-icon>
                                        <v-list-tile-content>
                                            <v-list-tile-title v-text="item.name + ' (' + parseDeviceCapazityinGB(item.size_bytes)+ 'GB)'"></v-list-tile-title>
                                            <v-list-tile-sub-title v-text="item.mount_point"></v-list-tile-sub-title>
                                        </v-list-tile-content>
                                    </v-list-tile>
                                </v-list>
                            <b-progress class="mt-2">
                                <template v-for="(child, index) in select.partitions">
                                    <b-progress-bar :key="child" :value="computePartitionUsedPercentage(child.size_bytes,select.size_bytes)" v-if="index <= 0" variant="primary">{{child.name}} {{parseDeviceCapazityinGB(child.size_bytes)}}GB</b-progress-bar>
                                    <b-progress-bar :key="child" :value="computePartitionUsedPercentage(child.size_bytes,select.size_bytes)" v-else-if="index === 1" variant="danger">{{child.name}} {{parseDeviceCapazityinGB(child.size_bytes)}}GB</b-progress-bar>
                                    <b-progress-bar :key="child" :value="computePartitionUsedPercentage(child.size_bytes,select.size_bytes)" v-else-if="index === 2" variant="warning">{{child.name}} {{parseDeviceCapazityinGB(child.size_bytes)}}GB</b-progress-bar>
                                    <b-progress-bar :key="child" :value="computePartitionUsedPercentage(child.size_bytes,select.size_bytes)" v-else-if="index === 3" variant="info">{{child.name}} {{parseDeviceCapazityinGB(child.size_bytes)}}GB</b-progress-bar>
                                    <b-progress-bar :key="child" :value="computePartitionUsedPercentage(child.size_bytes,select.size_bytes)" v-else-if="index >= 4" variant="success">{{child.name}} {{parseDeviceCapazityinGB(child.size_bytes)}}GB</b-progress-bar>
                                </template>
                            </b-progress>
                            </v-card>
                        </v-card>
                            </v-flex>
                            <v-flex xs6 sm6>
                                <v-card class="ml-3"
                                        color="grey lighten-4">

                                    <v-layout >
                                        <v-card-title>Choose a location to save the image to.</v-card-title>
                                        <v-spacer></v-spacer>
                                        <v-btn flat icon color="deep-orange lighten-2" @click="reloadPage"><v-icon>cached</v-icon></v-btn>
                                    </v-layout>
                                    <v-switch class="ml-3" color="orange darken-3" @change="ToogleSnackBarSmartModeValue"
                                              hide-details :label="`SmartMode: ${smartMode == true ? 'On' : 'Off'}`"
                                              v-model="smartMode">
                                    </v-switch>
                                    <v-select v-if="!smartMode" chips prepend-icon="sd_storage" class="mr-3 ml-3" v-model="mount" v-on:change="diskUsage(mount.mount_point)" item-value="serial_number" v-bind:items="mounts" persistent-hint
                                              return-object
                                              single-line>
                                        <template v-if="mount !== ''" slot="selection" slot-scope="data">
                                            <v-chip>{{ data.item.mount_point}}</v-chip>
                                        </template>

                                        <template v-if="devices !== null" slot="item" slot-scope="data">
                                         {{ data.item.mount_point}} (Size: {{parseDeviceCapazityinGB(data.item.size_bytes)}} GB, Type: {{ data.item.type}}, Read-Only: {{data.item.read_only}})
                                        </template>
                                    </v-select>
                                    <b-progress v-if="mount !== ''" class="mt-2">
                                    <b-progress-bar :key="free" :value="computePartitionUsedPercentage(cachedDiskUsage.free, cachedDiskUsage.all)" variant="success">Free {{parseDeviceCapazityinGB(cachedDiskUsage.free)}}GB</b-progress-bar>
                                    <b-progress-bar :key="used" :value="computePartitionUsedPercentage(cachedDiskUsage.used, cachedDiskUsage.all)" variant="primary">Used {{parseDeviceCapazityinGB(cachedDiskUsage.used)}}GB</b-progress-bar>
                                </b-progress>
                                </v-card>
                            </v-flex>
                        </v-layout>
                        <v-btn color="deep-orange lighten-2" v-bind:disabled="select === ''" @click="e1 = 3">
                            Next
                        </v-btn>
                    </v-stepper-content>
                    <v-stepper-content step="2">
                        <v-card class="mb-5"
                                color="grey lighten-4">
                        </v-card>
                        <v-btn color="deep-orange lighten-2"  @click="e1 = 3">
                            Next
                        </v-btn>
                        <v-btn flat @click="e1 = 1">Back</v-btn>
                    </v-stepper-content>
                    <v-stepper-content step="3">
                        <v-expansion-panel popout>
                            <v-expansion-panel-content class="grey lighten-4">
                                <template v-slot:actions>
                                    <v-icon color="deep-orange lighten-2">expand_more</v-icon>
                                </template>
                                <template v-slot:header>
                                    <div>Image Job Console Log</div>
                                </template>
                            <v-layout >
                                <v-flex xs12 sm6>
                                    <v-textarea class="ml-3" height="400" box label="Output Device Log" readonly loading="false" v-model="consoleOutputDeviceOutput" no-resize>
                                    </v-textarea>
                                </v-flex>

                                <v-flex xs12 sm6>
                                    <v-textarea class="ml-3" height="400" box label="Input Device Log" readonly loading="false" v-model="consoleInputDeviceOutput" no-resize>
                                    </v-textarea>
                                </v-flex>
                            </v-layout>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                        <v-btn color="deep-orange lighten-2" @click="postImageJobAndRun(select.name)">Start</v-btn>
                        <v-btn flat @click="e1 = 2">Back</v-btn>
                    </v-stepper-content>
                </v-stepper-items>
            </v-stepper>
            <v-progress-linear class="mt-0" :indeterminate="e1 === 3 && running" :color="e1 ===3 && finisedJob ? 'green' : 'deep-orange lighten-2'" :value="e1 === 3 && finisedJob ? 100 : 0"></v-progress-linear>
        </v-flex>
    </v-container>
     </v-layout>
 </div>
</template>

<script>
    import axios from "axios"

    export default {
      props: {
          msg: String
      },
      data() {
          return {
              snackbarInfoSmartMode: false,
              smartMode: true,
              running : false,
              finisedJob :false,
              currentJobId : "",
              consoleOutputDeviceOutput : null,
              consoleInputDeviceOutput : null,
              pollingResult: null,
              devices : null,
              mounts: null,
              mount: "",
              e1: 0,
              select: "",
              pollinHandler : null,
              cachedDiskUsage : {
                  "all": 0,
                  "used": 0,
                  "free": 0
              },
          }
      },

      methods: {
          parseDeviceCapazityinGB: function (bytesAsString) {
              return Math.round(parseInt(bytesAsString) / 1073741824).toString();
          },

          computePartitionUsedPercentage: function (bytesAsStringPart, bytesAsStringDevice) {
              return (parseInt(bytesAsStringPart) / parseInt(bytesAsStringDevice)) * 100
          },

          reloadPage() {
              window.location.reload()
          },

          postImageJobAndRun: function (path) {
              this.currentJobId = ""
              this.consoleInputDeviceOutput = ""
              this.consoleOutputDeviceOutput = ""
              this.finisedJob = false

              axios.post('http://localhost:8000/image', {path: path}).then(response => {this.currentJobId = response.data
                  this.polling()
                  this.pollinHandler = setInterval(this.polling, 3000)})

          },

          polling: function () {

              axios.get('http://localhost:8000/image/' + this.currentJobId).then(response => {
                  this.pollingResult = response.data
                  this.consoleOutputDeviceOutput = this.pollingResult.commandOfOutput
                  this.consoleInputDeviceOutput = this.pollingResult.commandIfOutput
                  this.running = this.pollingResult.running
                  if (!this.running) {
                      clearInterval(this.pollinHandler)
                      this.finisedJob = true
                  }})
          },

          diskUsage: function(mountPoint){
              if (mountPoint === "") {
                  return
              }

              axios.get('http://localhost:8000/mounted/' + encodeURIComponent("\"" + mountPoint + "\"")).then(response => {
                  this.cachedDiskUsage = response.data
              })
          },

          ToogleSnackBarSmartModeValue : function (){
              let val = this.snackbarInfoSmartMode
              if (this.snackbarInfoSmartMode){
                  this.snackbarInfoSmartMode = false
                  return val
              }
              else{
                  this.snackbarInfoSmartMode = true
                  return val
              }
          }
      },

      created() {
         axios.get('http://localhost:8000/media').then(response => {
             this.devices = response.data
             if (this.devices !== null)
                 this.select = this.devices[0]
         })

          axios.get('http://localhost:8000/mounted').then(response => {
              this.mounts = response.data
          })
      },
  }
</script>

<style>

</style>
