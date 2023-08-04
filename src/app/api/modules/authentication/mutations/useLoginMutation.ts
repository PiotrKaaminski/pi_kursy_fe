import API from "../../../endpoints";
import { useMutation } from "react-query";

function login(formData: any) {
  return API.authentication.login(formData);
}
  
export function useLoginMutation(props?: any) {
  return useMutation(login, props);
}
  