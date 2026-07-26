import axios from 'axios'

const MOCKAPI_BASE_URL = 'https://6a61a502da10c59c1809ab1c.mockapi.io/'

const LOCAL_API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function createInstance(baseURL) {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  instance.interceptors.request.use((config) => config)

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('[API ERROR]', error?.response?.data || error.message)
      return Promise.reject(error)
    }
  )

  return instance
}

export const apiMock = createInstance(MOCKAPI_BASE_URL)

export const apiLocal = createInstance(LOCAL_API_BASE_URL)

export const SERVER_BASE_URL = LOCAL_API_BASE_URL.replace(/\/api\/?$/, '')

export default apiLocal
