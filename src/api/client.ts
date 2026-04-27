import axios, {AxiosError, AxiosInstance, AxiosRequestConfig} from 'axios'
import { env } from '@/config/env'

const client : AxiosInstance = axios.create({
    baseURL: env.API_BASE_URL,
    timeout: env.API_TIMEOUT ?? 15000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    }
})

// TODO: Interceptors for request and response

export default client