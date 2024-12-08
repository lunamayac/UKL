import Express  from "express";
import User from "./routers/inventoryRouter";
import Login from "./routers/loginRouter";
import Peminjaman from "./routers/peminjamanRouter";

const app = Express();
app.use(Express.json());

app.use("/api/inventory", User);
app.use("/api/auth", Login);
app.use("/api/inventory", Peminjaman);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});