import { blob, json } from "stream/consumers";

const fetcher = async ({ url, method, body, json = true, blob = false } : any) => {
    const res = await fetch(url, {
      method,
      body: body,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  
    if (blob) {
      const data = await res.blob();
      return data;
    }
    else if (!blob && json) {
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
      json: false,
      blob: true
    });
};