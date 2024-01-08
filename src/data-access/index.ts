import { json } from "stream/consumers";

const fetcher = async ({ url, method, body, json = true } : any) => {
    const res = await fetch(url, {
      method,
      body: body && JSON.stringify(body),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  
    
    if (json) {
      const data = await res.json();
      return data;
    }

      return await res.json();
  };

export const convertImage = (body : any) => {
    return fetcher({
      url: "/api/convert",
      method: "POST",
      body: body,
      json: true,
    });
};