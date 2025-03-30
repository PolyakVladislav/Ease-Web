import initApp from "./server";
const port = process.env.PORT;


initApp().then((app:any) => {
  app.listen(port, '0.0.0.0', () => {
    console.log(`The server is listening on port ${port}`);
  });
});


