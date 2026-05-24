type SupabaseQueryError = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

export function isSchemaQueryError(error: SupabaseQueryError | null | undefined) {
  const message = error?.message || "";
  return (
    error?.code === "42703" ||
    error?.code === "42P01" ||
    message.includes("schema cache") ||
    message.includes("Could not find the") ||
    message.includes("column") ||
    message.includes("does not exist")
  );
}

export function logOptionalSupabaseLoadFailure(
  context: string,
  error: SupabaseQueryError | null | undefined
) {
  console.warn(context, {
    message: error?.message || "Unknown Supabase query error",
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
  });
}
