import axios from "axios";

// post 요청 보낼 때 사용하는 공통 Axios
export const serverAxios = axios.create({
  // baseURL: "http://localhost:8000",
  baseURL: `${process.env.REACT_APP_API_ENDPOINT}`,
});

export function getServerAxiosErrorInfo(error) {
  const errorInfo = { title: "에러가 발생했습니다. ", statusCode: 500 };

  if (axios.isAxiosError(error)) {
    const serverError = error;
    if (serverError && serverError.response) {
      errorInfo.statusCode = serverError.response.status;
    }
  }

  return errorInfo;
}
