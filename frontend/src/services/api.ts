import axios from "axios";

const producerApi = axios.create({
  baseURL: "http://localhost:3000/api",
});
const consumerApi = axios.create({
  baseURL: "http://localhost:3001/api",
});

export const register = (data: { userName: string, email: string; password: string }) =>
  producerApi.post("/user/signUp", data);
export const login = (data: { email: string; password: string }, config: { headers: { deviceId: string } }) =>
  producerApi.post("/user/login", data, config);
export const resetPassword = (data: { email: string }) =>
  producerApi.post("/reset-password", data);

export const redirectToMicrosoft = async (authToken: string, uniqueIdentifier: string | null): Promise<any> => {
  return producerApi.get("/user/redirectToMicrosoft", {
    headers: {
      Authorization: `Bearer ${authToken}`,
      deviceId: uniqueIdentifier,
    }
  });
}

export const syncOutlookEmails = async (authToken: string | null, uniqueIdentifier: string | null): Promise<any> => {  
  return producerApi.post("/user/outlook/syncEmail", {}, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      deviceId: uniqueIdentifier,
    }
  });
}

export const getUserProfile = async (authToken: string | null, uniqueIdentifier: string | null): Promise<any> => {
  return producerApi.get("/user/getUserProfile", {
    headers: {
      Authorization: `Bearer ${authToken}`,
      deviceId: uniqueIdentifier,
    }
  });
}

export const getAllUsers = async (authToken: string, uniqueIdentifier: string | null): Promise<any> => {
  return consumerApi.get("/email/getAllUserEmail", {
    headers: {
      Authorization: `Bearer ${authToken}`,
      deviceId: uniqueIdentifier,
    }
  });
}
