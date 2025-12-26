import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { User } from "@/types";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
};

export interface UserData extends Omit<User, "createdAt"> {
  password: string;
  createdAt: string;
}

export const readUsers = (): UserData[] => {
  ensureDataDir();
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

export const saveUser = async (userData: Omit<UserData, "id" | "createdAt">): Promise<UserData> => {
  ensureDataDir();
  const users = readUsers();

  // Check if user already exists
  if (users.some((u) => u.email === userData.email)) {
    throw new Error("User with this email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const newUser: UserData = {
    ...userData,
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

  return newUser;
};

export const getUserByEmail = (email: string): UserData | undefined => {
  const users = readUsers();
  return users.find((u) => u.email === email);
};

export const getOBOGUsers = (): UserData[] => {
  return readUsers().filter(u => u.role === "obog");
};

export const getOBOGById = (id: string): UserData | undefined => {
  return readUsers().find(u => u.id === id && u.role === "obog");
};

export const getUserById = (id: string): UserData | undefined => {
  return readUsers().find(u => u.id === id);
};

export const updateUser = async (userId: string, updates: Partial<Omit<UserData, "id" | "email" | "password" | "createdAt" | "role">>): Promise<UserData> => {
  ensureDataDir();
  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    throw new Error("User not found");
  }

  // Update user data (don't allow changing id, email, password, createdAt, or role)
  // But allow updating strikes and isBanned for admin actions
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
  };

  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  return users[userIndex];
};

export const deleteUser = (userId: string): void => {
  ensureDataDir();
  const users = readUsers();
  const filteredUsers = users.filter(u => u.id !== userId);

  if (users.length === filteredUsers.length) {
    throw new Error("User not found");
  }

  fs.writeFileSync(USERS_FILE, JSON.stringify(filteredUsers, null, 2));
};

