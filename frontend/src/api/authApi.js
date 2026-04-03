import axios from "./index";

export const loginUser = (data) => axios.post("/auth/login", data);
export const registerUser = (data) => axios.post("/auth/register", data);
