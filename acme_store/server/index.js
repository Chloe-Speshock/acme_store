const {
  client,
  createTables,
  createProduct,
  createUser,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
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

app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (error) {
    next(error);
  }
});

app.get("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.send(await fetchFavorites(req.params.id));
  } catch (error) {
    next(error);
  }
});

app.post("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.status(201).send(
      await createFavorite({
        user_id: req.params.id,
        product_id: req.body.product_id,
      })
    );
  } catch (error) {
    next(error);
  }
});

app.delete("/api/users/:user_id/favorites/:id", async (req, res, next) => {
  try {
    await destroyFavorite({ id: req.params.id, user_id: req.params.user_id });
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

  const [persephone, florence, maggie, bagels, donuts, scones, muffins] =
    await Promise.all([
      createUser({ username: "persephone", password: "secret" }),
      createUser({ username: "florence", password: "secret! " }),
      createUser({ username: "maggie", password: "secret?" }),
      createProduct({ name: "bagels" }),
      createProduct({ name: "donuts" }),
      createProduct({ name: "scones" }),
      createProduct({ name: "muffins" }),
    ]);

  const users = await fetchUsers();
  console.log(users);

  const products = await fetchProducts();
  console.log(products);

  const favorites = await Promise.all([
    createFavorite({ user_id: persephone.id, product_id: donuts.id }),
    createFavorite({ user_id: florence.id, product_id: scones.id }),
    createFavorite({ user_id: maggie.id, product_id: muffins.id }),
  ]);

  console.log("florence's favorite", await fetchFavorites(florence.id));

  app.listen(port, () => console.log(`listeining on port ${port}`));
};
init();
