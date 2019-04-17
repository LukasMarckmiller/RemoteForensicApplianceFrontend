<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
 <div class="customStepper">
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
                    <v-stepper-step color="deep-orange lighten-2" step="3">Choose Output Device</v-stepper-step>
                </v-stepper-header>
                <v-stepper-items>
                    <v-stepper-content step="1">
                        <v-card class="mb-3"
                                color="grey lighten-5">
                                <v-layout >
                                <v-card-title>Choose a device to read data and create an image from.</v-card-title>
                                    <v-spacer></v-spacer>
                                    <v-btn flat icon color="deep-orange lighten-2" @click="reloadPage"><v-icon>cached</v-icon></v-btn>
                                </v-layout>
                            <v-select chips prepend-icon="sd_storage" class="mr-3 ml-3" v-model="select" item-value="serial_number" v-bind:items="devices" persistent-hint
                                      return-object
                                      single-line label="Select">
                                <template slot="selection" slot-scope="data">
                                    {{ data.item.name }} (Vendor: {{ data.item.vendor}}, Model: {{data.item.model}}, Size: {{parseDeviceCapazityinGB(data.item.size_bytes)}} GB)
                                </template>
                                <template slot="item" slot-scope="data">
                                    {{ data.item.name }} (Vendor: {{ data.item.vendor}}, Model: {{data.item.model}}, Size: {{parseDeviceCapazityinGB(data.item.size_bytes)}} GB)
                                </template>
                            </v-select>
                            <v-card>
                                <v-card-title class="primary white--text ">
                                    Partitions
                                </v-card-title>
                                <v-list class="grey lighten-5">
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
                                    <b-progress-bar :key="child" :value="computePartitionUsedPercentage(child.size_bytes,select.size_bytes)" v-if="index <= 0" variant="success">{{child.name}} {{parseDeviceCapazityinGB(child.size_bytes)}}GB</b-progress-bar>
                                    <b-progress-bar :key="child" :value="computePartitionUsedPercentage(child.size_bytes,select.size_bytes)" v-else-if="index === 1" variant="info">{{child.name}} {{parseDeviceCapazityinGB(child.size_bytes)}}GB</b-progress-bar>
                                    <b-progress-bar :key="child" :value="computePartitionUsedPercentage(child.size_bytes,select.size_bytes)" v-else-if="index === 2" variant="warning">{{child.name}} {{parseDeviceCapazityinGB(child.size_bytes)}}GB</b-progress-bar>
                                    <b-progress-bar :key="child" :value="computePartitionUsedPercentage(child.size_bytes,select.size_bytes)" v-else-if="index === 3" variant="danger">{{child.name}} {{parseDeviceCapazityinGB(child.size_bytes)}}GB</b-progress-bar>
                                    <b-progress-bar :key="child" :value="computePartitionUsedPercentage(child.size_bytes,select.size_bytes)" v-else-if="index >= 4" variant="primary">{{child.name}} {{parseDeviceCapazityinGB(child.size_bytes)}}GB</b-progress-bar>
                                </template>
                            </b-progress>
                            </v-card>
                        </v-card>
                        <v-btn color="deep-orange lighten-2" @click="e1 = 2">
                            Next
                        </v-btn>
                    </v-stepper-content>
                    <v-stepper-content step="2">
                        <v-card class="mb-5"
                                color="grey lighten-5">
                        </v-card>
                        <v-btn color="deep-orange lighten-2"  @click="e1 = 3">
                            Next
                        </v-btn>
                        <v-btn flat @click="e1 = 1">Back</v-btn>
                    </v-stepper-content>
                    <v-stepper-content step="3">
                            <v-layout >
                                <v-flex xs12 sm6>
                                    <v-textarea class="ml-3" height="500" box label="Output Device Log" readonly="true" loading="false" v-model="consoleOutputDeviceOutput" no-resize>
                                    </v-textarea>
                                </v-flex>

                                <v-flex xs12 sm6>
                                    <v-textarea class="ml-3" height="500" box label="Input Device Log" readonly="true" loading="false" v-model="consoleInputDeviceOutput" no-resize>
                                    </v-textarea>
                                </v-flex>
                            </v-layout>
                        <v-btn color="deep-orange lighten-2" @click="postImageJobAndRun(select.name)">Start</v-btn>
                        <v-btn flat @click="e1 = 2">Back</v-btn>
                    </v-stepper-content>
                </v-stepper-items>
            </v-stepper>
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
              currentJobId : "",
              consoleOutputDeviceOutput : null,
              consoleInputDeviceOutput : null,
              pollingResult: null,
              devices : null,
              e1: 0,
              select: 'defaultValue',
              pollinHandler : null,
          }
      },

      methods:{
          parseDeviceCapazityinGB : function (bytesAsString){
              return Math.round(parseInt(bytesAsString) / 1073741824).toString();
          },

          computePartitionUsedPercentage: function (bytesAsStringPart,bytesAsStringDevice)
          {
            return (parseInt(bytesAsStringPart) / parseInt(bytesAsStringDevice)) * 100
          },

          reloadPage(){
              window.location.reload()
          },

          postImageJobAndRun : function(path){
              this.consoleInputDeviceOutput = ""
              this.consoleOutputDeviceOutput = ""

             axios.post('http://localhost:8000/image',{path : "/dev/" + path}).then(response => (this.currentJobId = response.data))
             this.pollinHandler = setInterval(() => {
                  axios.get('http://localhost:8000/image/' + this.currentJobId).then(response => (this.pollingResult = response.data))
                 this.consoleOutputDeviceOutput = this.pollingResult.commandOfOutput
                 this.consoleInputDeviceOutput = this.pollingResult.commandIfOutput
                 if (!this.pollingResult.running){
                     clearInterval(this.pollinHandler)
                 }
              }, 1000)
          }
      },

      created() {
         axios.get('http://localhost:8000/media').then(response => (this.devices = response.data))
      },

      beforeDestroy() {
          clearInterval(this.pollinHandler)
      }
  }
</script>

<style>

</style>
