import { z } from "zod";

export const inviteEditorAdminSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters.")
      .max(150),
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address.")
      .max(255),
    role: z
      .enum(["EDITOR_ADMIN", "SUPER_ADMIN"])
      .optional()
      .default("EDITOR_ADMIN"),
    password: z.string().optional().default("TempInvite!2026"),
    sendInviteOnly: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    if (!data.sendInviteOnly) {
      const pass = data.password || "";
      if (pass.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Password must be at least 10 characters.",
        });
      }
      if (!/[A-Z]/.test(pass)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Password must include an uppercase letter.",
        });
      }
      if (!/[a-z]/.test(pass)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Password must include a lowercase letter.",
        });
      }
      if (!/[0-9]/.test(pass)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Password must include a number.",
        });
      }
    }
  });

export const acceptAdminInviteSchema = z.object({
  token: z.string().min(16, "Invalid invitation token."),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters.")
    .regex(/[A-Z]/, "Password must include an uppercase letter.")
    .regex(/[a-z]/, "Password must include a lowercase letter.")
    .regex(/[0-9]/, "Password must include a number."),
});

export const updateAdminAccountStatusSchema = z.object({
  userId: z.string().uuid("Invalid administrator ID."),
  status: z.enum(["ACTIVE", "DEACTIVATED", "REVOKED"]),
});

export const resetAdminPasswordSchema = z.object({
  userId: z.string().uuid("Invalid administrator ID."),
  newPassword: z
    .string()
    .min(10, "New password must be at least 10 characters.")
    .regex(/[A-Z]/, "Password must include an uppercase letter.")
    .regex(/[a-z]/, "Password must include a lowercase letter.")
    .regex(/[0-9]/, "Password must include a number."),
});

export type InviteEditorAdminInput = z.input<typeof inviteEditorAdminSchema>;
export type UpdateAdminAccountStatusInput = z.infer<
  typeof updateAdminAccountStatusSchema
>;
export type ResetAdminPasswordInput = z.infer<typeof resetAdminPasswordSchema>;
