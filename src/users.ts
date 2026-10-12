import { Request, Response } from "express";
import { createUser } from "./db/queries/users.js";

export async function handlerCreateUser(req: Request, res: Response) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const newUser = await createUser({ email });
    return res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create user" });
  }
}
