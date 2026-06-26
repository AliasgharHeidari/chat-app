export const validators = {
  username: (value: string): string | null => {
    if (!value) return "Username is required";
    if (value.length < 5) return "Username must be at least 5 characters";
    if (value.length > 50) return "Username must be less than 50 characters";
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return "Username can only contain letters, numbers, hyphens, and underscores";
    }
    return null;
  },

  password: (value: string): string | null => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    return null;
  },

  firstName: (value: string): string | null => {
    if (!value) return "First name is required";
    if (value.length < 2) return "First name must be at least 2 characters";
    if (value.length > 50) return "First name must be less than 50 characters";
    return null;
  },

  lastName: (value: string): string | null => {
    if (!value) return "Last name is required";
    if (value.length < 2) return "Last name must be at least 2 characters";
    if (value.length > 50) return "Last name must be less than 50 characters";
    return null;
  },

  bio: (value: string): string | null => {
    if (value && value.length > 500) {
      return "Bio must be less than 500 characters";
    }
    return null;
  },

  messageText: (value: string): string | null => {
    if (!value) return "Message cannot be empty";
    if (value.length > 1000) return "Message must be less than 1000 characters";
    return null;
  },

  profilePicUrl: (value: string): string | null => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return "Invalid URL format";
    }
  },
};

export function validateForm(
  values: Record<string, any>,
  fieldValidators: Record<string, (value: any) => string | null>,
): Record<string, string> {
  const errors: Record<string, string> = {};

  Object.entries(fieldValidators).forEach(([field, validator]) => {
    const error = validator(values[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
}
