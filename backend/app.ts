import initApp from "./server";
const port = process.env.PORT;


initApp().then((app:any) => {
  app.listen(port, () => {
    console.log(`The server is listening on port ${port}`);
  });
});


