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
                 text
                 @click="snackbarInfoSmartMode = false">
             Close
         </v-btn></v-snackbar>
     <v-container fluid>
         <v-row>
             <v-col>
            <v-stepper v-model="e1">
                <v-stepper-header>
                    <v-stepper-step :complete="e1 > 1" color="deep-orange lighten-2" step="1">Choose Input Device</v-stepper-step>
                    <v-divider></v-divider>
                    <v-stepper-step v-if="false" color="deep-orange lighten-2" :complete="e1 > 2" step="2">Processing Settings
                    <small>Optional</small>
                    </v-stepper-step>
                    <v-divider></v-divider>
                    <v-stepper-step color="deep-orange lighten-2" step="3">Processing</v-stepper-step>
                </v-stepper-header>
                <v-stepper-items>
                    <v-stepper-content step="1">
                        <v-container fluid>
                            <v-row no-gutters>
                                <v-col>
                        <v-card class="mb-3"
                                color="grey lighten-4">
                                <v-card-title><small>Choose a device to read data and create an image from.</small>
                                    <v-spacer></v-spacer>
                                    <v-btn text icon color="deep-orange lighten-2" @click="reloadPage"><v-icon>mdi-reload</v-icon></v-btn>
                                </v-card-title>
                            <v-select chips prepend-icon="mdi-sd" class="mr-3 ml-3 red--text" v-model="currentInputDevice" item-value="serial_number" v-bind:items="devices" persistent-hint
                                      return-object
                                      single-line label="Select">
                                <template v-if="currentInputDevice !== ''" slot="selection" slot-scope="data">
                                    <v-chip>{{ data.item.name}} (Vendor: {{ data.item.vendor}}, Model: {{data.item.model}}, Size: {{parseDeviceCapacityHumandRead(data.item.size_bytes)}})</v-chip>
                                </template>
                                <template v-if="devices !== null" slot="item" slot-scope="data">
                                    {{ data.item.name }} (Vendor: {{ data.item.vendor}}, Model: {{data.item.model}}, Size: {{parseDeviceCapacityHumandRead(data.item.size_bytes)}})
                                </template>
                            </v-select>
                            <v-card v-if="currentInputDevice.partitions.length !== 0">
                                <v-toolbar @click="toggleExpandedPartitions()" color="deep-orange lighten-2" dense>
                                    <v-icon class="mr-3">{{expandedParts ? 'mdi-chevron-up' : 'mdi-chevron-down'}}</v-icon>
                                    <v-toolbar-title class="ml-1" style="font-size:medium">Partitions </v-toolbar-title>
                                    <v-toolbar-items>
                                        <span class="mt-3 ml-1"> {{currentInput!== 0 ? '(' + getCurrentInputDevice().name + ' ' +  parseDeviceCapacityHumandRead(getCurrentInputDevice().size_bytes) + ')': ''}}</span>
                                    </v-toolbar-items>
                                </v-toolbar>
                                <v-list v-if="expandedParts" class="grey lighten-4">
                                    <v-list-item-group v-model="currentInput">
                                        <v-list-item @click="toggleExpandedPartitions">
                                            <v-list-item-action>
                                                <v-icon >mdi-sd</v-icon>
                                            </v-list-item-action>
                                            <v-list-item-content>
                                                <v-list-item-title>All</v-list-item-title>
                                            </v-list-item-content>
                                        </v-list-item>
                                    <v-list-item @click="toggleExpandedPartitions"
                                        v-for="item in currentInputDevice.partitions"
                                        :key="item.name">
                                        <v-list-item-action>
                                            <v-icon>mdi-chart-pie</v-icon>
                                        </v-list-item-action>
                                        <v-list-item-content>
                                            <v-list-item-title v-text="item.name + ' (' + parseDeviceCapacityHumandRead(item.size_bytes) + ')'"> </v-list-item-title>
                                            <v-list-item-subtitle v-text="item.mount_point"></v-list-item-subtitle>
                                        </v-list-item-content>
                                    </v-list-item>
                                        </v-list-item-group>
                                </v-list>
                            <b-progress v-if="expandedParts" class="mt-2">
                                <template v-for="(child, index) in currentInputDevice.partitions">
                                    <b-progress-bar :key="child.name" :value="computePartitionUsedPercentage(child.size_bytes,currentInputDevice.size_bytes)" v-if="index <= 0" variant="primary">{{child.name}} {{parseDeviceCapacityHumandRead(child.size_bytes)}}</b-progress-bar>
                                    <b-progress-bar :key="child.name" :value="computePartitionUsedPercentage(child.size_bytes,currentInputDevice.size_bytes)" v-else-if="index === 1" variant="danger">{{child.name}} {{parseDeviceCapacityHumandRead(child.size_bytes)}}</b-progress-bar>
                                    <b-progress-bar :key="child.name" :value="computePartitionUsedPercentage(child.size_bytes,currentInputDevice.size_bytes)" v-else-if="index === 2" variant="warning">{{child.name}} {{parseDeviceCapacityHumandRead(child.size_bytes)}}</b-progress-bar>
                                    <b-progress-bar :key="child.name" :value="computePartitionUsedPercentage(child.size_bytes,currentInputDevice.size_bytes)" v-else-if="index === 3" variant="info">{{child.name}} {{parseDeviceCapacityHumandRead(child.size_bytes)}}</b-progress-bar>
                                    <b-progress-bar :key="child.name" :value="computePartitionUsedPercentage(child.size_bytes,currentInputDevice.size_bytes)" v-else-if="index >= 4" variant="success">{{child.name}} {{parseDeviceCapacityHumandRead(child.size_bytes)}}</b-progress-bar>
                                </template>
                            </b-progress>
                            </v-card>
                        </v-card>
                                </v-col>
                            </v-row>
                                <v-row>
                                    <v-col>
                                <v-card v-if="!this.remoteTransmission"
                                        color="grey lighten-4">
                                    <v-card-title><small>Choose a location to save the image to.</small></v-card-title>
                                    <v-select v-if="mounts != null" chips prepend-icon="mdi-sd" class="mr-3 ml-3" v-model="mount" v-on:change="diskUsage(mount.mount_point)" item-value="serial_number" v-bind:items="mounts" persistent-hint
                                              return-object
                                              single-line>
                                        <template v-if="mount !== null" slot="selection" slot-scope="data">
                                            <v-chip>{{ data.item.mount_point}}</v-chip>
                                        </template>

                                        <template v-if="mounts !== null" slot="item" slot-scope="data">
                                            {{ data.item.mount_point}} (Size: {{parseDeviceCapacityHumandRead(data.item.size_bytes)}}, Type: {{ data.item.type}}, Read-Only: {{data.item.read_only}})
                                        </template>
                                    </v-select>
                                    <b-progress v-if="mount !== null" class="mt-2">
                                        <b-progress-bar :key="free" :value="computePartitionUsedPercentage(cachedDiskUsage.free, cachedDiskUsage.all)" variant="success">Free {{parseDeviceCapacityHumandRead(cachedDiskUsage.free)}}</b-progress-bar>
                                        <b-progress-bar :key="used" :value="computePartitionUsedPercentage(cachedDiskUsage.used, cachedDiskUsage.all)" variant="primary">Used {{parseDeviceCapacityHumandRead(cachedDiskUsage.used)}}</b-progress-bar>
                                    </b-progress>
                                </v-card>
                                    </v-col>
                                </v-row>
                            <v-row>
                                <v-col>
                              <v-row justify="end">

                        <v-btn color="deep-orange lighten-2" v-bind:disabled="currentInputDevice === '' || (smartMode === true && transferModeComputed === false || smartMode === false && mount === null)" @click="e1 = 3">
                            Next
                        </v-btn>
                              </v-row>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-stepper-content>
                    <v-stepper-content step="2">
                        <v-card
                                color="grey lighten-4">
                        </v-card>
                        <v-row class="m-1" justify="space-between" >
                        <v-btn text @click="e1 = 1">Back</v-btn>
                            <v-btn color="deep-orange lighten-2"  @click="e1 = 3">
                                Next
                            </v-btn>
                        </v-row>
                    </v-stepper-content>
                    <v-stepper-content step="3">
                        <v-subheader v-if="finishedJob"> MD5 Validation</v-subheader>
                        <v-container v-if="finishedJob" >
                            <v-row justify="center">
                                <v-chip outline color="deep-orange lighten-2">In: {{hashes.md_5_input}}</v-chip>
                            </v-row>
                            <v-row justify="center">
                                <v-icon color="green" v-if="hashResult.md_5_valid">mdi-checkbox-marked-circle</v-icon>
                                <v-icon color="red" v-if="!hashResult.md_5_valid">mdi-close-circle</v-icon>
                            </v-row>
                            <v-row justify="center">
                                <v-chip outline color="deep-orange lighten-2">Out: {{hashes.md_5_output}}</v-chip>
                            </v-row>
                        </v-container>
                        <v-divider></v-divider>
                        <v-subheader v-if="finishedJob">SHA256 Validation</v-subheader>
                        <v-container v-if="finishedJob">
                            <v-row justify="center">
                                <v-chip outline color="deep-orange lighten-2">In: {{hashes.sha_256_input}}</v-chip>
                            </v-row>
                            <v-row justify="center">
                                <v-icon color="green" v-if="hashResult.sha_256_valid">mdi-checkbox-marked-circle</v-icon>
                                <v-icon color="red" v-if="!hashResult.sha_256_valid">mdi-close-circle</v-icon>
                            </v-row>
                            <v-row justify="center">
                                <v-chip outline color="deep-orange lighten-2">Out: {{hashes.sha_256_output}}</v-chip>
                            </v-row>
                        </v-container>
                        <v-expansion-panels
                                multiple
                                v-model="tab3panels"
                        >
                        <v-expansion-panel>
                            <v-expansion-panel-header>Summary</v-expansion-panel-header>
                            <v-expansion-panel-content>
                                <v-card outlined>
                                    <v-card-text class="black--text" v-if="cachedImageOptions !== null && mount !== null">
                                        <p>Estimated Transmission Time : <i>{{getTimeStringFromSeconds(this.cachedImageOptions.estimated_secs)}}</i> </p>
                                        <p>Transfer Option : <i>{{cachedImageOptions.image_option.type === imageTypeFull ? "Full image" : "Certain Artifacts"}}</i></p>
                                        <p>Selected Input Device : <i>{{ getCurrentInputDevice().name}} (Vendor: {{
                                            currentInputDevice.vendor}}, Model: {{currentInputDevice.model}}, Size:
                                            {{parseDeviceCapacityHumandRead(getCurrentInputDevice().size_bytes)}})</i></p>
                                        <p>Selecte Output: <i>{{cachedImageOptions.image_option.target === imageTargetLocal ?  mount.mount_point + " (Size " + parseDeviceCapacityHumandRead(mount.size_bytes) + ")" : "Remote transmission" }}</i></p>
                                        <p>Job ID: <i>{{currentJobId}}</i></p>
                                    </v-card-text>
                                </v-card>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                        <v-expansion-panel v-if="finishedJob || running">
                            <v-expansion-panel-header>Image Job Console Log</v-expansion-panel-header>
                            <v-expansion-panel-content>
                                <v-row>
                                    <v-textarea id="idl" ref="idl" label="Input Device Log" readonly no-resize rows="10" v-model="consoleInputDeviceOutput">
                                    </v-textarea>

                                    <v-textarea id="odl" ref="odl" label="Output Device Log" readonly no-resize rows="10" v-model="consoleOutputDeviceOutput">
                                    </v-textarea>
                                </v-row>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                        </v-expansion-panels>
                        <v-container>
                            <v-row justify="space-between" >
                                <v-btn text @click="e1 = 1">Back</v-btn>
                                <v-btn v-if="!running && !finishedJob" color="deep-orange lighten-2" @click="postImageJobAndRun()">Start</v-btn>
                                <v-btn v-if="running" color="deep-orange lighten-2" @click="cancelImageJob">Cancel</v-btn>
                                <v-btn v-if="finishedJob" color="deep-orange lighten-2" @click="clear">Finish</v-btn>
                            </v-row>
                        </v-container>
                    </v-stepper-content>
                </v-stepper-items>
            </v-stepper>
            <v-progress-linear v-if="e1 === 1" class="mt-0" :indeterminate="smartModeProgress" color="deep-orange lighten-2"></v-progress-linear>
            <v-row justify="center"
                    v-if="e1 === 1 && smartModeProgress"
                    >
                 Calculating best transfer options
            </v-row>
            <v-progress-linear v-if="e1 === 3" class="mt-0" :indeterminate="running" :color="finishedJob ? transmissionError === '' ? 'green' : 'red' : 'deep-orange lighten-2'" :value="finishedJob ? 100 : 0"></v-progress-linear>
             </v-col>
         </v-row>
     </v-container>
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
              expandedParts : false,
              snackbarInfoSmartMode: false,
              snackbarContent : "",
              noRemoteConnectionText : "No connection to the servers possible, please plug in and specify an output device or use the internal storage to continue the image process.",
              smartMode: true,
              remoteTransmission :true,
              running : false,
              finishedJob :false,
              currentJobId : "",
              consoleOutputDeviceOutput : null,
              consoleInputDeviceOutput : null,
              pollingResult: null,
              devices : null,
              mounts: null,
              mount: null,
              e1: 1,
              currentInputDevice: "",
              currentInput: 0,
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
              tab3panels: [0],
              hashes: {
                  md_5_input: "",
                  md_5_output: "",
                  sha_256_input: "",
                  sha_256_output: "",
              },
              hashResult:{
                  md_5_valid: false,
                  sha_256_valid: false,
              },
          }
      },
      watch: {
          currentInputDevice(){
              this.currentInput = 0;
              this.triggerSmartMode();
          },

          currentInput(){
              this.triggerSmartMode();
          }
      },
      methods: {
          getCurrentInputDevice: function(){
              let dev = "";

              if(this.currentInput === 0){
                  dev = this.currentInputDevice
              }else{
                  dev = this.currentInputDevice.partitions[this.currentInput - 1]
              }

              return dev
          },

          toggleExpandedPartitions: function(){
              if (this.expandedParts){
                  this.expandedParts = false
              }else{
                  this.expandedParts = true
              }
          },
          setCompressed: function(value){
            this.cachedImageOptions.image_option.compressed = value
          },

          setSmartMode: function (value){
              this.smartMode = value

              if (!value){
                  this.remoteTransmission = false
                  this.cachedImageOptions.image_option.target = this.imageTargetLocal
              }
              else{
                  this.triggerSmartMode()
              }
          },

          parseDeviceCapacityHumandRead: function (bytesAsString) {
              let i = -1;
              const byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
              let fileSizeInBytes = parseInt(bytesAsString)
              do {
                  fileSizeInBytes = fileSizeInBytes / 1024;
                  i++;
              } while (fileSizeInBytes > 1024);

              return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
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

          postImageJobAndRun: function() {
              //collapse panels
              this.tab3panels = []
              this.currentJobId = "";
              this.consoleInputDeviceOutput = "";
              this.consoleOutputDeviceOutput = "";
              this.finishedJob = false;
              let path
              path = this.getCurrentInputDevice().name

               HTTP.post('image', {path: path, image_option: this.cachedImageOptions.image_option, mount:this.mount}).then(response => {this.currentJobId = response.data;
                  this.running = true;

                  this.polling();
                  this.pollinHandler = setInterval(this.polling, 3000)})

          },

          clear: function(){
              this.currentJobId = "";
              this.consoleInputDeviceOutput = "";
              this.consoleOutputDeviceOutput = "";
              this.finishedJob = false;
              this.running = false;
              this.e1 = 1;
              //Restore default panel settings
              this.tab3panels = [0]
              this.currentInput = 0
          },

          cancelImageJob: function(){
              HTTP.delete('image/' + this.currentJobId).then(response => {
                  if (response.status === 200){
                      this.running = false;
                      clearInterval(this.pollinHandler);
                      this.finishedJob = false
                  }
              })
          },

          polling: function () {

              HTTP.get('image/' + this.currentJobId).then(response => {
                  this.pollingResult = response.data;
                  this.consoleOutputDeviceOutput = this.pollingResult.commandOfOutput;
                  this.consoleInputDeviceOutput = this.pollingResult.commandIfOutput;

                  this.running = this.pollingResult.running;

                  //Transmission job finished or crashed
                  if (!this.running) {
                      clearInterval(this.pollinHandler);
                      this.transmissionError =  this.pollingResult.error;
                      this.hashes = this.pollingResult.hashes;
                      this.hashResult = this.pollingResult.hash_result;
                      //if no error get and set Hashes here
                      this.finishedJob = true
                      //collapse all panels to make space for the hashes
                      this.tab3panels = []
                  }})
          },

          diskUsage: function(mountPoint){
              if (mountPoint === "" || mountPoint === null) {
                  return
              }

              HTTP.get('mounted/' + encodeURIComponent("\"" + mountPoint + "\"")).then(response => {
                  this.cachedDiskUsage = response.data
              })
          },

          toogleSnackBarSmartModeValue : function (message){
              let val = this.snackbarInfoSmartMode;
              this.snackbarContent = message

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

              if (this.smartMode === false){
                  return
              }

              if (this.currentInputDevice !== ""){
                  this.smartModeProgress = true;

                  HTTP.post('media/transfer',{name:this.getCurrentInputDevice().name, size:this.getCurrentInputDevice().size_bytes}).then(response => {
                        this.cachedImageOptions = response.data;
                      if (this.cachedImageOptions.image_option.target === this.imageTargetLocal)
                      {
                          this.remoteTransmission = false
                          this.toogleSnackBarSmartModeValue(this.noRemoteConnectionText)
                      }
                      else{
                          this.remoteTransmission = true
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
                 this.currentInputDevice = this.devices[0]
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
