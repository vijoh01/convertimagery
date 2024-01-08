const fetcher = async ({ url, method, body, json = true, blob = false } : any) => {
    const res = await fetch(url, {
      method,
      body: body && JSON.stringify(body),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    console.log(res.ok);
    
    if (blob) {
      const data = await res.blob();
      console.log("blobben");
      
      return data;
    }
    else if (!blob && json) {
      const data = await res.json();
      console.log("jsonderulo");
      
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