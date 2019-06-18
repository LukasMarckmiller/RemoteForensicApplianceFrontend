<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
 <div class="customStepper">
     <v-snackbar
             class="black--text"
             v-model="snackbarInfoSmartMode"
             color="grey lighten-4"
             :timeout=6000
             multi-line
             top>
             {{snackbarContent}}
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
                            <v-flex xs12 sm6>
                        <v-card class="mb-3"
                                color="grey lighten-4">
                                <v-layout >
                                <v-card-title>Choose a device to read data and create an image from.</v-card-title>
                                    <v-spacer></v-spacer>
                                    <v-btn flat icon color="deep-orange lighten-2" @click="reloadPage"><v-icon>cached</v-icon></v-btn>
                                </v-layout>
                            <v-select chips prepend-icon="sd_storage" class="mr-3 ml-3 red--text" v-model="selectedInputDevice" item-value="serial_number" v-bind:items="devices" persistent-hint
                                      return-object
                                      single-line label="Select">
                                <template v-if="selectedInputDevice !== ''" slot="selection" slot-scope="data">
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
                                        v-for="item in selectedInputDevice.partitions"
                                        :key="item.name">
                                        <v-icon class="mr-3">storage</v-icon>
                                        <v-list-tile-content>
                                            <v-list-tile-title v-text="item.name + ' (' + parseDeviceCapazityinGB(item.size_bytes)+ 'GB)'"></v-list-tile-title>
                                            <v-list-tile-sub-title v-text="item.mount_point"></v-list-tile-sub-title>
                                        </v-list-tile-content>
                                    </v-list-tile>
                                </v-list>
                            <b-progress class="mt-2">
                                <template v-for="(child, index) in selectedInputDevice.partitions">
                                    <b-progress-bar :key="child" :value="computePartitionUsedPercentage(child.size_bytes,selectedInputDevice.size_bytes)" v-if="index <= 0" variant="primary">{{child.name}} {{parseDeviceCapazityinGB(child.size_bytes)}}GB</b-progress-bar>
                                    <b-progress-bar :key="child" :value="computePartitionUsedPercentage(child.size_bytes,selectedInputDevice.size_bytes)" v-else-if="index === 1" variant="danger">{{child.name}} {{parseDeviceCapazityinGB(child.size_bytes)}}GB</b-progress-bar>
                                    <b-progress-bar :key="child" :value="computePartitionUsedPercentage(child.size_bytes,selectedInputDevice.size_bytes)" v-else-if="index === 2" variant="warning">{{child.name}} {{parseDeviceCapazityinGB(child.size_bytes)}}GB</b-progress-bar>
                                    <b-progress-bar :key="child" :value="computePartitionUsedPercentage(child.size_bytes,selectedInputDevice.size_bytes)" v-else-if="index === 3" variant="info">{{child.name}} {{parseDeviceCapazityinGB(child.size_bytes)}}GB</b-progress-bar>
                                    <b-progress-bar :key="child" :value="computePartitionUsedPercentage(child.size_bytes,selectedInputDevice.size_bytes)" v-else-if="index >= 4" variant="success">{{child.name}} {{parseDeviceCapazityinGB(child.size_bytes)}}GB</b-progress-bar>
                                </template>
                            </b-progress>
                            </v-card>
                        </v-card>
                            </v-flex>
                            <v-flex xs12 sm6>
                                <v-card class="ml-3"
                                        color="grey lighten-4">

                                    <v-layout >
                                        <v-card-title>Choose a location to save the image to.</v-card-title>
                                        <v-spacer></v-spacer>
                                        <v-btn flat icon color="deep-orange lighten-2" @click="reloadPage"><v-icon>cached</v-icon></v-btn>
                                    </v-layout>
                                    <v-switch :disabled="lockSmartMode" class="ml-3" color="orange darken-3" @change="toogleSnackBarSmartModeValue(smartModeInfoText)"
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
                                    <b-progress v-if="mount !== '' && !smartMode" class="mt-2">
                                        <b-progress-bar :key="free" :value="computePartitionUsedPercentage(cachedDiskUsage.free, cachedDiskUsage.all)" variant="success">Free {{parseDeviceCapazityinGB(cachedDiskUsage.free)}}GB</b-progress-bar>
                                        <b-progress-bar :key="used" :value="computePartitionUsedPercentage(cachedDiskUsage.used, cachedDiskUsage.all)" variant="primary">Used {{parseDeviceCapazityinGB(cachedDiskUsage.used)}}GB</b-progress-bar>
                                    </b-progress>
                                </v-card>
                            </v-flex>
                        </v-layout>
                        <v-btn color="deep-orange lighten-2"  v-bind:disabled="selectedInputDevice === '' || (smartMode === true && transferModeComputed === false || smartMode === false && mount === '')" @click="e1 = 3">
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
                        <v-expansion-panel :value="1" popout >
                            <v-expansion-panel-content>
                                <template v-slot:actions>
                                    <v-icon color="deep-orange lighten-2">expand_more</v-icon>
                                </template>
                                <template v-slot:header>
                                    <div><b>Summary</b></div>
                                </template>
                                <v-card class="ml-2">
                                    <v-card-text v-if="cachedImageOptions !== null">
                                        <p>Estimated Transmission Time : <i>{{getTimeStringFromSeconds(this.cachedImageOptions.estimated_secs)}}</i> </p>
                                        <p>Transfer Option : <i>{{cachedImageOptions.image_option.type === imageTypeFull ? "Full image" : "Certain Artifacts"}}</i></p>
                                        <p>Selected Input Device : <i>{{ selectedInputDevice.name}} (Vendor: {{ selectedInputDevice.vendor}}, Model: {{selectedInputDevice.model}}, Size: {{parseDeviceCapazityinGB(selectedInputDevice.size_bytes)}} GB)</i></p>
                                        <p>Selecte Output: <i>{{cachedImageOptions.image_option.target === imageTargetLocal ?  mount.mount_point + " (Size " + parseDeviceCapazityinGB(mount.size_bytes) + "GB)" : "Remote transmission" }}</i></p>
                                        <p>Job ID: <i>{{currentJobId}}</i></p>
                                    </v-card-text>
                                </v-card>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
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
                                    <v-textarea id="idl" ref="idl" class="ml-3" height="400" box label="Input Device Log" readonly loading="false" v-model="consoleInputDeviceOutput" no-resize>
                                    </v-textarea>
                                </v-flex>

                                <v-flex xs12 sm6>
                                    <v-textarea id="odl" ref="odl" class="ml-3" height="400" box label="Output Device Log" readonly loading="false" v-model="consoleOutputDeviceOutput" no-resize>
                                    </v-textarea>
                                </v-flex>
                            </v-layout>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                        <v-layout class="mt-3" align-center justify-space-around row>
                            {{hashes.md_5_input}} <v-icon color="green" v-if="finisedJob && hashResult.md_5_valid">check_circle_outline</v-icon> <v-icon color="red" v-if="finisedJob && !hashResult.md_5_valid">highlight_off</v-icon> {{hashes.md_5_output}}
                        </v-layout>
                        <v-layout class="mb-3" align-center justify-space-around row>
                            {{hashes.sha_256_input}} <v-icon color="green" v-if="finisedJob && hashResult.sha_256_valid">check_circle_outline</v-icon> <v-icon color="red" v-if="finisedJob && !hashResult.sha_256_valid">highlight_off</v-icon> {{hashes.sha_256_output}}
                        </v-layout>
                        <v-btn v-if="!running" color="deep-orange lighten-2" @click="postImageJobAndRun(selectedInputDevice.name)">Start</v-btn>
                        <v-btn v-if="running" color="deep-orange lighten-2" @click="cancelImageJob">Cancel</v-btn>
                        <v-btn flat @click="e1 = 2">Back</v-btn>

                    </v-stepper-content>
                </v-stepper-items>
            </v-stepper>
            <v-progress-linear v-if="e1 === 1" class="mt-0" :indeterminate="smartModeProgress" color="deep-orange lighten-2"></v-progress-linear>
            <v-flex
                    v-if="e1 === 1 && smartModeProgress"
                    xs12
                    subtitle-1
                    text-xs-center>
                Calculating best transfer options
            </v-flex>
            <v-progress-linear v-if="e1 === 3" class="mt-0" :indeterminate="running" :color="finisedJob ? transmissionError === '' ? 'green' : 'red' : 'deep-orange lighten-2'" :value="finisedJob ? 100 : 0"></v-progress-linear>
        </v-flex>
    </v-container>
     </v-layout>
 </div>
</template>

<script>
    import HTTP from "../HTTPClient";

    export default {
      props: {
          msg: String
      },
      data() {
          return {
              snackbarInfoSmartMode: false,
              snackbarContent : "",
              smartModeInfoText : "If SmartMode is turned on, the application decides itself weather to send the full image of the input device or just specific artifacts to the CERT servers.",
              noRemoteConnectionText : "No connection to the servers possible, please plug in and specify an output device or use the internal storage to continue the image process.",
              smartMode: true,
              lockSmartMode : false,
              running : false,
              finisedJob :false,
              currentJobId : "",
              consoleOutputDeviceOutput : null,
              consoleInputDeviceOutput : null,
              pollingResult: null,
              devices : null,
              mounts: null,
              mount: null,
              e1: 1,
              selectedInputDevice: "",
              pollinHandler : null,
              cachedDiskUsage : {
                  "all": 0,
                  "used": 0,
                  "free": 0
              },
              imageTypeFull : 0,
              imageTypePart : 1,
              imageTargetRemote: 0,
              imageTargetLocal:1,
              smartModeProgress : false,
              transferModeComputed : false,
              cachedImageOptions: null,
              textarea: null,
              transmissionError: "",
              hashes: {
                  md_5_input: "",
                  md_5_output: "",
                  sha_256_input: "",
                  sha_256_output: "",
              },
              hashResult:{
                  md_5_valid: false,
                  sha_256_valid: false,
              }
          }
      },
      watch: {
          selectedInputDevice(){
              this.triggerSmartMode();
          }
      },
      methods: {
          parseDeviceCapazityinGB: function (bytesAsString) {
              return Math.round(parseInt(bytesAsString) / 1073741824).toString();
          },

          computePartitionUsedPercentage: function (bytesAsStringPart, bytesAsStringDevice) {
              return (parseInt(bytesAsStringPart) / parseInt(bytesAsStringDevice)) * 100
          },

          reloadPage: function() {
              window.location.reload()
          },

          getTimeStringFromSeconds: function (seconds){
              if (seconds === "")
                  return "";

              var date = new Date(null);
              date.setSeconds(seconds);
               //take hh:mm:ss
              return date.toISOString().substr(11, 8)
          },

          postImageJobAndRun: function (path) {
              this.currentJobId = "";
              this.consoleInputDeviceOutput = "";
              this.consoleOutputDeviceOutput = "";
              this.finisedJob = false;

               HTTP.post('image', {path: path, image_option: this.cachedImageOptions.image_option, mount:this.mount}).then(response => {this.currentJobId = response.data;
                  this.running = true;

                  this.polling();
                  this.pollinHandler = setInterval(this.polling, 3000)})

          },

          cancelImageJob: function(){
              HTTP.delete('image/' + this.currentJobId).then(response => {
                  if (response.status === 200){
                      this.running = false;
                      clearInterval(this.pollinHandler);
                      this.finisedJob = false
                  }
              })
          },

          polling: function () {

              HTTP.get('image/' + this.currentJobId).then(response => {
                  this.pollingResult = response.data;
                  this.consoleOutputDeviceOutput += this.pollingResult.commandOfOutput;
                  this.consoleInputDeviceOutput += this.pollingResult.commandIfOutput;
                  this.running = this.pollingResult.running;

                  //Transmission job finished or crashed
                  if (!this.running) {
                      clearInterval(this.pollinHandler);
                      this.transmissionError =  this.pollingResult.error;
                      this.hashes = this.pollingResult.hashes;
                      this.hashResult = this.pollingResult.hash_result;
                      //if no error get and set Hashes here
                      this.finisedJob = true
                  }})
          },

          diskUsage: function(mountPoint){
              if (mountPoint === "") {
                  return
              }

              HTTP.get('mounted/' + encodeURIComponent("\"" + mountPoint + "\"")).then(response => {
                  this.cachedDiskUsage = response.data
              })
          },

          toogleSnackBarSmartModeValue : function (message){
              let val = this.snackbarInfoSmartMode;
              this.snackbarContent = message;

              if (this.snackbarInfoSmartMode){
                  this.snackbarInfoSmartMode = false;
                  return val
              }
              else{
                  this.snackbarInfoSmartMode = true;
                  return val
              }
          },

          triggerSmartMode : function (){
              this.transferModeComputed = false;
              this.smartMode = true;

              if (this.selectedInputDevice !== ""){
                  this.smartModeProgress = true;

                  HTTP.post('media/transfer',{name:this.selectedInputDevice.name, size:this.selectedInputDevice.size_bytes}).then(response => {
                        this.cachedImageOptions = response.data;
                      if (this.cachedImageOptions.image_option.target === this.imageTargetLocal)
                      {
                          this.smartMode = false;
                          this.lockSmartMode = true;
                          this.toogleSnackBarSmartModeValue(this.noRemoteConnectionText)
                      }
                      else {
                          this.smartMode = true;
                      }

                      this.smartModeProgress = false;
                      this.transferModeComputed = true
                  })
              }
          }
      },

      mounted() {
          HTTP.get('media').then(response => {
             this.devices = response.data
             if (this.devices !== null)
                 this.selectedInputDevice = this.devices[0]
         })

          HTTP.get('mounted').then(response => {
              this.mounts = response.data
              if (this.mounts !== null){
                  this.mount = this.mounts[0]
              }
          })
      },
  }
</script>

<style>

</style>
