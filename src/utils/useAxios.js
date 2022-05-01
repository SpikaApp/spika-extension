import { useState, useEffect } from "react";
import axios from "axios";

const useAxios = (url, searchId) => {
  const [result, setResult] = useState(null);
  const options = { method: "GET", url: url };

  useEffect(() => {
    axios
      .request(options)
      .then((response) => {
        setResult(response.data[searchId]);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [searchId]);
  return { result };
};

export default useAxios;
