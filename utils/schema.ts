import * as z from "zod";

export const registrationSchema = z.object({
  date: z.string().min(1),
  time: z.string().min(1),
  email: z.string().email("Имэйл буруу байна"),
  phone: z.string().min(5, "Утасны дугаарыг оруулна уу"),
});
