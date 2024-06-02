import axios, { type AxiosResponse } from "axios";

async function getEndpoint() {
  const hosts = location.host.split('.')
  const namespace = hosts[0];
  const key = "observeany-endpoint-" + namespace;
  const endpoint = localStorage.getItem(key);
  if (endpoint) {
    return endpoint;
  }

  const auth = axios.create({
    baseURL: "https://cloud-api.observeany.com/v1",
    withCredentials: true,
  });
  auth.interceptors.response.use(
    (res: AxiosResponse) => {
      return res;
    },
    (err) => {
      if (err.response.status === 401) {
        location.href = "https://www.observeany.com/login";
      }
      return Promise.reject(err);
    },
  );

  const response = await auth.get("/auth/check", {
    params: {
      namespace,
    },
  });
  localStorage.setItem(key, response.data.endpoint);
  return response.data.endpoint;
}

const service = axios.create({
  withCredentials: true,
});

service.interceptors.request.use(
  async (config) => {
    const endpoint = await getEndpoint();
    config.baseURL = endpoint;
    return config;
  },
  (err) => {
    return Promise.reject(err);
  },
);
service.interceptors.response.use(
  (res: AxiosResponse) => {
    return res;
  },
  (err) => {
    if (err.response.status === 401) {
      location.href = "https://www.observeany.com/login";
    }
    return Promise.reject(err);
  },
);

export default service;
