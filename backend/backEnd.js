
const app = express();
const port = 8000;

app.use(express.json());

// const findUserByName = (name) => {
//   return users["users_list"].filter((user) => user["name"] === name);
// };

app.get("/users", (req, res) => {
  const name = req.query.name;
  const job = req.query.job;
  getUsers(name, job)
    .then((result) => res.send({ users_list: result }))
    .catch((err) =>
      res.status(404).send(`Failed to find: ${err}`)
    );
  // } else {
  //   findUserByName(name)
  //     .then((result) => res.send(result))
  //     .catch((err) => res.status(404).send(`Failed to find: ${err}`));
  //   //result = { users_list: result };
});
