import  z, { email, string } from "zod";

export const createDTO = z.object({
   fullName : z.string(),
   email : z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
   password : z.string().min(8)
})

export const loginDTO = z.object({
    email : z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
   password : z.string().min(8)
})