let baseUrl: string;

if (__DEV__) {
  baseUrl = "http://10.194.106.140:8080";
} else {
  baseUrl = "";
}

export { baseUrl };
