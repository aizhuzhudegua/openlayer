<template>
  <div>
    <div ref="map" class="map"></div>
    <chat></chat>
  </div>
</template>

<script>
import "ol/ol.css";
import Map from "ol/Map";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import View from "ol/View";
import { defaults as defaultControls } from "ol/control";
import axios from 'axios';
import Overlay from 'ol/Overlay';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import router from '../router';
import  chat from '../components/chat.vue';
export default {
  data() {
    return {
      map: null,
      markerLayer: null,
      center: null,
      bounds: null,
      modelList: []

    };
  },
  components: {
    chat
  },
  mounted() {
    this.fetchGeoServerData();
  },
  methods: {
    fetchGeoServerData() {
      const geoserverUrl = "http://localhost:8088/geoserver";
      const workspace = "yun";
      const layerName = "l6_china";
      const requestUrl = `${geoserverUrl}/rest/workspaces/${workspace}/coveragestores/${layerName}/coverages/${layerName}.json`;

      axios.get(requestUrl, {
        auth: { username: "admin", password: "geoserver" }
      })
        .then(response => {

          var bounds = response.data.coverage.latLonBoundingBox;
          // console.log(bounds);
          this.bounds = bounds;
          this.center = [
            (bounds.minx + bounds.maxx) / 2,
            (bounds.miny + bounds.maxy) / 2
          ];
          this.initializeMap();
        })
        .catch(error => {
          console.error('There has been a problem with your axios operation:', error);
        });
    },
    generateRandomNumber(min, max) {
      return Math.random() * (max - min) + min;
    },

    initializeMap() {

      const geoserverUrl = "http://localhost:8088/geoserver";
      const workspace = "yun";
      const layerName = "l6_china";
      const requestUrl = `${geoserverUrl}/rest/workspaces/${workspace}/coveragestores/${layerName}/coverages/${layerName}.json`;

      const layers = [
        new TileLayer({
          source: new TileWMS({
            url: `http://localhost:8088/geoserver/${workspace}/wms`,
            params: {
              LAYERS: `${workspace}:${layerName}`,
              TILED: true,
            }
          })
        }),
      ];

      this.map = new Map({
        target: this.$refs.map,
        controls: defaultControls(),
        layers: layers,
        view: new View({
          projection: "EPSG:4326",
          center: this.center,
          zoom: 6,
          maxZoom: 12,
          minZoom: 1,
        })
      });


      try {
        axios.get('http://localhost:8081/model/list', {
          headers: {
            'token': localStorage.getItem('access_token')
          }
        }).then((response) => {
          if (response.data.code === 200) {
            this.modelList = response.data.data;
            console.log('Model list:', this.modelList);

            // Generate random markers
            for (let i = 0; i < this.modelList.length; i++) {
              let randomLon = this.generateRandomNumber(this.bounds.minx, this.bounds.maxx);
              let randomLat = this.generateRandomNumber(this.bounds.miny, this.bounds.maxy);

              let marker = new Overlay({
                position: [randomLon, randomLat],
                positioning: "center-center",
                element: this.createMarkerElement(this.modelList[i]),
              });
              this.map.addOverlay(marker);
            }
          }
        });

        // Handle the model list data here
      } catch (error) {
        console.error('Error fetching model list:', error);
        // Handle the error as needed
      }



    },
    createMarkerElement(model) {
      // 创建一个包含图片和按钮的 DIV 元素
      let markerDiv = document.createElement('div');
      let img = document.createElement('img');
      let button = document.createElement('button');

      img.src = '/src/assets/location-1.png';
      img.width = '50';
      markerDiv.appendChild(img);
      button.appendChild(img);
      button.style.backgroundColor = 'rgba(1, 1 , 1, 0)';
      button.style.border = 'none';
      button.style.cursor = 'pointer';
      button.onclick = () => {
        console.log(model);
        router.push({ path: '/demo', query: { url: model.url } });
      };
      markerDiv.appendChild(button);
      return markerDiv;
    }
  }
};
</script>

<style scoped>
.map {
  position: fixed;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
}

.marker {
  width: 20px;
  height: 20px;
  border: 1px solid #088;
  border-radius: 10px;
  background-color: #0ff;
  opacity: 0.5;
}
</style>
