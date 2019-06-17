import axios from 'axios'

const HTTP = axios.create({
    baseURL: "http://localhost:" + getPort(),
});

function getPort() {
    return "8000"
}

export default HTTP