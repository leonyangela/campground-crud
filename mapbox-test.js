require("dotenv").config();

const mbxStyles = require('@mapbox/mapbox-sdk/services/styles');
const stylesService = mbxStyles({ accessToken: process.env.MAPBOX_TOKEN });