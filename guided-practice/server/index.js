const {
  client,
  createTables,
  createUser,
  createSkill,
  fetchUsers,
  fetchSkills,
  createUserSkill,
  deleteUserSkill,
  fetchUserSkills,
} = require("./db");

const express = require("express");
const app = express();
app.use(express.json());
app.use(require("morgan")("dev"));

app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (error) {
    next(error);
  }
});

app.get("/api/skills", async (req, res, next) => {
  try {
    res.send(await fetchSkills());
  } catch (error) {
    next(error);
  }
});

app.get("/api/users/:id/userSkills", async (req, res, next) => {
  try {
    res.send(await fetchUserSkills(req.params.id));
  } catch (error) {
    next(error);
  }
});

app.post("/api/users/:id/userSkills", async (req, res, next) => {
  try {
    res.status(201).send(
      await createUserSkill({
        user_id: req.params.id,
        skill_id: req.body.skill_id,
      })
    );
  } catch (error) {
    next(error);
  }
});

app.delete("/api/users/:userId/userSkills/:id", async (req, res, next) => {
  try {
    await deleteUserSkill({ id: req.params.id, user_id: req.params.userId });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

const port = process.env.PORT || 3000;

const init = async () => {
  await client.connect();
  await createTables();
  console.log("tables created");

  const [moe, lucy, ethyl, singing, dancing, juggling, plateSpinning] =
    await Promise.all([
      createUser({ username: "moe", password: "sescret" }),
      createUser({ username: "lucy", password: "sescret!" }),
      createUser({ username: "ethyl", password: "sescret2" }),
      createSkill({ name: "singing" }),
      createSkill({ name: "dancing" }),
      createSkill({ name: "juggling" }),
      createSkill({ name: "plate spinning" }),
    ]);

  const users = await fetchUsers();
  console.log(users);

  const skills = await fetchSkills();
  console.log(skills);

  const userSkills = await Promise.all([
    createUserSkill({ user_id: moe.id, skill_id: plateSpinning.id }),
    createUserSkill({ user_id: moe.id, skill_id: juggling.id }),
    createUserSkill({ user_id: ethyl.id, skill_id: juggling.id }),
    createUserSkill({ user_id: lucy.id, skill_id: dancing.id }),
  ]);

  console.log("moe's skills", await fetchUserSkills(moe.id));

  //   await deleteUserSkill(userSkills[0].id);

  console.log(`curl localhost:3000/api/users/${lucy.id}/userSkills`);

  app.listen(port, () => console.log(`listeining on port ${port}`));
};
init();
