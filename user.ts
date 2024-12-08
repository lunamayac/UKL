import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function createAdminUser() {
    const user = await prisma.user.create({
        data: {
            username: "admin",
            password: bcrypt.hashSync("admin123", 10),
            role: "ADMIN" 
        }
    })
    console.log("Admin user created:", user)
}

async function createUser() {
    const user = await prisma.user.create({
        data: {
            username: "user",
            password: bcrypt.hashSync("user123", 10),
            role: "USER"
        }
    })
    console.log("User created:", user)
}

createAdminUser()
    .catch(e => {
        console.error("Error creating admin user:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

createUser()
    .catch(e => {
        console.error("Error creating user:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })