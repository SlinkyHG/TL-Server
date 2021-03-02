<template>
 <div id="home">
    <v-data-iterator
      :items="clients"
      :items-per-page.sync="itemsPerPage"
      :page.sync="page"
      :search="search"
      :sort-by="sortBy.toLowerCase()"
      :sort-desc="sortDesc"
      hide-default-footer
    >
      <template v-slot:header>
        <v-toolbar
          dark
          color="blue darken-3"
          class="mb-1"
        >
          <v-text-field
            v-model="search"
            clearable
            flat
            solo-inverted
            hide-details
            prepend-inner-icon="mdi-magnify"
            label="Search"
          ></v-text-field>
          <template v-if="$vuetify.breakpoint.mdAndUp">
            <v-spacer></v-spacer>
            <v-select
              v-model="sortBy"
              flat
              solo-inverted
              hide-details
              :items="keys"
              prepend-inner-icon="mdi-magnify"
              label="Sort by"
            ></v-select>
            <v-spacer></v-spacer>
            <v-btn-toggle
              v-model="sortDesc"
              mandatory
            >
              <v-btn
                large
                depressed
                color="blue"
                :value="false"
              >
                <v-icon>mdi-arrow-up</v-icon>
              </v-btn>
              <v-btn
                large
                depressed
                color="blue"
                :value="true"
              >
                <v-icon>mdi-arrow-down</v-icon>
              </v-btn>
            </v-btn-toggle>
          </template>
        </v-toolbar>
      </template>

      <template v-slot:default="props">
        <v-container fluid>
          <v-row>
            <v-col
              v-for="(item) in props.items"
              :key="item.name"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card>
                <v-card-title class="subheading font-weight-bold">
                  {{ item.ipAddress }}
                  <v-switch
                    v-model="item.testing"
                    :label="item.testing === true ? 'Blinking' : 'Source'"
                    @click="pushItem(item)"
                  ></v-switch>
                </v-card-title>

                <v-divider></v-divider>

                <v-list dense>
                  <v-list-item>
                    <v-list-item-content>
                      Source:
                    </v-list-item-content>
                    <v-list-item-content>
                      <v-row
                        v-for="(number, index) in sources"
                        :key="index"
                      >
                        <v-checkbox
                          v-model="item.source"
                          :label="number"
                          :value="number"
                          @click="pushItem(item)"
                        ></v-checkbox>
                      </v-row>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      Status:
                    </v-list-item-content>
                    <v-list-item-content>
                      {{ getStatus(item) }}
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </template>

      <template v-slot:footer>
        <v-container fuild>
          <v-row
            class="mt-2"
            align="center"
            justify="center"
          >
            <span class="grey--text">Items per page</span>
            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  dark
                  text
                  color="primary"
                  class="ml-2"
                  v-bind="attrs"
                  v-on="on"
                >
                  {{ itemsPerPage }}
                  <v-icon>mdi-chevron-down</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="(number, index) in itemsPerPageArray"
                  :key="index"
                  @click="updateItemsPerPage(number)"
                >
                  <v-list-item-title>{{ number }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

            <v-spacer></v-spacer>

            <span
              class="mr-4
              grey--text"
            >
              Page {{ page }} of {{ numberOfPages }}
            </span>
            <v-btn
              fab
              dark
              color="blue darken-3"
              class="mr-1"
              @click="formerPage"
            >
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <v-btn
              fab
              dark
              color="blue darken-3"
              class="ml-1"
              @click="nextPage"
            >
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </v-row>
        </v-container>
      </template>
    </v-data-iterator>
  </div>
</template>

<script>
// @ is an alias to /src
import axios from 'axios'
export default {
  name: 'Home',
  data() {
    return {
      itemsPerPageArray: [4, 8, 12],
      search: '',
      filter: {},
      sortDesc: false,
      page: 1,
      itemsPerPage: 4,
      sortBy: 'ipAddress',
      keys: [
        'source',
      ],
      clients: [],
      sources: []
    }
  },
  mounted: function() {
    this.updateData()
    setInterval(() => {
      this.updateData()
    }, 5000)
  },
  computed: {
      numberOfPages () {
        return Math.ceil(this.clients.length / this.itemsPerPage)
      },
      filteredKeys () {
        return this.keys.filter(key => key !== 'Name')
      },
    },
  methods: {
    updateData () {
      axios.get('http://localhost:8080/api/getClients')
        .then((response, error)=> {
          if(!error){
            this.clients = response.data
            console.log(this.clients)
          } else {
            console.warn(error)
          }
        })

      axios.get('http://localhost:8080/api/getSources')
        .then((response, error)=> {
          if(!error){
            this.sources = response.data
            console.log(this.sources)
          } else {
            console.warn(error)
          }
        })
      },

    nextPage () {
      if (this.page + 1 <= this.numberOfPages) this.page += 1
    },
    formerPage () {
      if (this.page - 1 >= 1) this.page -= 1
      },
    updateItemsPerPage (number) {
      this.itemsPerPage = number
    },
    pushItem (item) {
      console.log(item.testing)
      axios.post('http://localhost:8080/api/updateClient', item
        ).then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    getStatus (item) {
      let status = "Unknown"
      if(item.source.length === 0){
        status = "Waiting for source"
      } else if(item.socket === true){
        switch(item.status){
          default:
            status = "Not active"
            break;
          case 1:
            status = "Preview"
            break;
          case 2:
            status = "Live"
            break;
        }
      }
      return status
    },
  }
}
</script>
