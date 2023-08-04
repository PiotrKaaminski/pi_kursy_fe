import axios from 'axios';

const API_URL = 'http://localhost:8080';

const API = {
    authentication: {
      login: (formValues: any) => {
        return axios.post(`${API_URL}/authentication/login`, formValues);
      } 
    }
}

export default API;