headers = {
  "Content-Type": "aplication/json",
  body: JSON.stringify({
    title: "kk",
    launch: "https://google.com",
    msg: "hh",
  }),
  method: "POST",
};

fetch("http://127.0.0.1:1000/", headers)
  .then((res) => res)
  .then((res) => console.log(res.text()));
