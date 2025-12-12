/**
 * axiosClient.js
 * * Pre-configured Axios Instance.
 * * This client is used for all HTTP requests to the backend API.
 * * It sets the base URL and default headers to ensure consistency across the application.
 */

import axios from "axios";

const axiosClient = axios.create({
    baseURL: 'http://localhost:5000/',
    headers: {
        "Content-type" : "application/json",
    },
});

export default axiosClient;